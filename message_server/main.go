package main

import (
	"fmt"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"log"
	"sync"
)

type client struct {
	isClosing bool
	mu        sync.Mutex
}

var clients = make(map[*websocket.Conn]*client)
var register = make(chan *websocket.Conn)
var broadcast = make(chan string)
var unregister = make(chan *websocket.Conn)

func runHub() {
	for {
		select {
		case connection := <-register:
			clients[connection] = &client{}
			fmt.Println("connection registered")

		case message := <-broadcast:
			fmt.Println("message received:", message)
			// Send the message to all clients
			for connection, c := range clients {
				go func(connection *websocket.Conn, c *client) { // send to each client in parallel so we don't block on a slow client
					c.mu.Lock()
					defer c.mu.Unlock()
					if c.isClosing {
						return
					}
					if err := connection.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
						c.isClosing = true
						fmt.Println("write error:", err)

						connection.WriteMessage(websocket.CloseMessage, []byte{})
						connection.Close()
						unregister <- connection
					}
				}(connection, c)
			}

		case connection := <-unregister:
			// Remove the client from the hub
			delete(clients, connection)

			fmt.Println("connection unregistered")
		}
	}
}

func main() {
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return c.SendStatus(fiber.StatusUpgradeRequired)
	})

	go runHub()

	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		//when the function returns connection is closed
		defer func(){
			unregister <- c
			c.Close()
		}()

		//register the client
		register<-c

		for{
			messageType,message,err:=c.ReadMessage()
			if err != nil{
				if websocket.IsUnexpectedCloseError(err,websocket.CloseGoingAway,websocket.CloseAbnormalClosure){
					fmt.Println("read error : ",err)
				}
				return //calls the defer function i.e. closes the connection on error
			}
			if messageType == websocket.TextMessage{
				//Broadcast the recieved message
				broadcast<-string(message)
			}else{
				fmt.Println("websocket message recieved of type",messageType)
			}
		}
	}))
	log.Fatalln(app.Listen(":8000"))
}
