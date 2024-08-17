package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
	"github.com/gorilla/websocket"
	"assign_work/redisrepo"
)


type Client struct {
	Conn     *websocket.Conn
	Username string
}

type Work struct {
	Username string `json:"username"`
	To string `json:"to"`
	Work   string `json:"work"` //problem statement
	Link string `json:"link"`
	FromTS int64 `json:"fromts"` //work assigned
	ToTS int64 `json:"tots"` //last date of submission
}
var clients = make(map[*Client]bool)
var broadcast = make(chan *Work)

//upgrades the connection to websocket protocol
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { return true },
}

func work_receiver(client *Client) {

	

	for {
		// readMessage returns messageType, message, err
		// messageType: 1-> Text Message, 2 -> Binary Message
		_, p, err := client.Conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		m := &Work{}

		err = json.Unmarshal(p, m)
		if err != nil {
			log.Println("error while unmarshaling chat", err)
			continue
		}

		fmt.Println("host", client.Conn.RemoteAddr())
		// if m.Type == "bootup" {
		// 	// do mapping on bootup
		// 	client.Username = m.Username
		// 	fmt.Println("client successfully mapped", &client, client, client.Username)
		// } else {
			fmt.Println("received work")
			// c := m.Chat
			m.FromTS = time.Now().Unix()

			// save in redis
			err1 := redisrepo.AssignWork(m.Username,m.To,m.Work,m.Link,m.FromTS,m.ToTS)
			if err1 != nil {
				log.Println("error while saving work in redis", err)
				return
			}
			broadcast<-m
		}
	}
// }

func work_broadcaster(){
	for {
		message := <-broadcast
		// send to every client that is currently connected
		fmt.Println("new work", message)

		for client := range clients {
			// send message only to involved users
			fmt.Println("username:", client.Username,
				"from:", message.Username,
				"to:", message.To)

			if client.Username == message.To {
				err := client.Conn.WriteJSON(message)
				if err != nil {
					log.Printf("Websocket error: %s", err)
					client.Conn.Close()
					delete(clients, client)
				}
			}
		}
	}
}

// define WebSocket endpoint
func serveWs(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Host, r.URL.Query())

	// upgrade this connection to a WebSocket connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	client := &Client{Conn: ws}
	// register client
	clients[client] = true
	fmt.Println("clients", len(clients), clients, ws.RemoteAddr())

	// listen indefinitely for new messages coming
	// through on our WebSocket connection
	work_receiver(client)

	fmt.Println("exiting", ws.RemoteAddr().String())
	delete(clients, client)
}

func setupRoutes() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Simple Server")
	})
	// map our `/ws` endpoint to the `serveWs` function
	http.HandleFunc("/ws_work", serveWs)
}


//starting up websocket server starts a broadcasting go routine
func StartWebsocketServer() {
	redisClient := redisrepo.InitialiseRedis()
	defer redisClient.Close()

	go work_broadcaster()
	setupRoutes()
	http.ListenAndServe(":8081", nil)
}

