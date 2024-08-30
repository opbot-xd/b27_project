package main

import (
	"encoding/json"
	// "fmt"
	"log"
	// "time"

	"github.com/gorilla/websocket"
)

// ClientList is a map used to help manage a map of clients
type ClientList map[*Client]bool

// Client is a websocket client, basically a frontend visitor
type Client struct {
	username string
	connection *websocket.Conn
	manager *Manager
	// egress is used to avoid concurrent writes on the WebSocket
	egress chan Event
	// egress2 chan Event
	// chatroom is used to know what room user is in
	chatroom string
}

func NewClient(username string, conn *websocket.Conn, manager *Manager) *Client {
	return &Client{
		username:   username,
		connection: conn,
		manager:    manager,
		egress:     make(chan Event),
		// egress2: make(chan Event),

	}
}

func (c *Client) readMessages() {
	defer func() {

		c.manager.removeClient(c)
	}()

	c.connection.SetReadLimit(512)

	for {

		_, payload, err := c.connection.ReadMessage()

		if err != nil {

			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break 
		}

		var request Event
		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("error marshalling message: %v", err)
			break 
		}
		// Route the Event
		if err := c.manager.routeEvent(request, c); err != nil {
			log.Println("Error handeling Message: ", err)
		}
	}
}

func (c *Client) writeLoop() {
    defer func() {
        c.manager.removeClient(c)
    }()

    for {
        select {
        case message, ok := <-c.egress:
            if !ok {
                if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
                    log.Println("connection closed: ", err)
                }
                return
            }

            data, err := json.Marshal(message)
            if err != nil {
                log.Println(err)
                continue
            }

            if err := c.connection.WriteMessage(websocket.TextMessage, data); err != nil {
                log.Println(err)
                return
            }
            log.Println("sent message")
        }
    }
}



func (c *Client) sendInitialData(messages []HistoryEvent, works []MyRecord_work) {
    // sends message history
    for _, msg := range messages {
        data, err := json.Marshal(msg)
        if err != nil {
            log.Printf("failed to marshal history message: %v", err)
            continue
        }
        c.egress <- Event{
            Type:    "new_message",
            Payload: data,
        }
    }

    // sends work history
    for _, work := range works {
        data, err := json.Marshal(work)
        if err != nil {
            log.Printf("failed to marshal work record: %v", err)
            continue
        }
        c.egress <- Event{
            Type:    "new_work",
            Payload: data,
        }
    }
}


// func (c *Client) writeMessages(messages []HistoryEvent) {
// 	defer func() {
// 		c.manager.removeClient(c)
// 	}()
// 	for i := range messages { 
// 		log.Println(messages[i])
// 		// var 
// 	data, err := json.Marshal(messages[i])
// 	if err != nil {
// 		fmt.Printf("failed to marshal history message: %v", err)
// 	}
// 		var messageEvent Event
// 		messageEvent.Payload = data
// 		messageEvent.Type = "new_message"
// 		fmt.Println(messageEvent)

// 			data_history, err_history := json.Marshal(messageEvent)
// 			if err != nil {
// 				log.Println(err_history)
// 				return 
// 			}
// 			if err := c.connection.WriteMessage(websocket.TextMessage, data_history); err != nil {
// 				log.Println(err)
// 			}
// 			log.Println("sent message")
// 	}

// 	for{
// 		select {
// 		case message, ok := <-c.egress:
// 			// log.Printf("ye rha channel ka message : %v",message)
// 			if !ok {
// 				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
// 					log.Println("connection closed: ", err)
// 				}
// 				return
// 			}

// 			data, err := json.Marshal(message)
// 			if err != nil {
// 				log.Println(err)
// 				return 
// 			}

// 			if err := c.connection.WriteMessage(websocket.TextMessage, data); err != nil {
// 				log.Println(err)
// 			}
// 			log.Println("sent message")

// 		}

// 	}
// }


func (c *Client) readWorks(){
	defer func() {

		c.manager.removeClient(c)
	}()

	c.connection.SetReadLimit(512)

	for {

		_, payload, err := c.connection.ReadMessage()

		if err != nil {

			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break 
		}
		var request Event
		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("error marshalling message: %v", err)
			break 
		}
		if err := c.manager.routeEvent(request, c); err != nil {
			log.Println("Error handeling Message: ", err)
		}
	}
}


// func (c *Client) writeWorks(works []MyRecord_work) {
// 	defer func() {
// 		c.manager.removeClient(c)
// 	}()
// 	for i := range works {
// 		log.Println(works[i])
// 		// var
// 		data, err := json.Marshal(works[i])
// 		if err != nil {
// 			fmt.Printf("failed to marshal history message: %v", err)
// 		}
// 		var workEvent Event
// 		workEvent.Payload = data
// 		workEvent.Type = "new_work"
// 		fmt.Println(workEvent)
		
// 		data_history, err_history := json.Marshal(workEvent)
// 		if err != nil {
// 			log.Println(err_history)
// 			return 
// 		}
// 		if err := c.connection.WriteMessage(websocket.TextMessage, data_history); err != nil {
// 			log.Println(err)
// 		}
// 		log.Println("sent message")
// 	}
	
// 	for {
// 		select {
// 		case message, ok := <-c.egress:
// 			if !ok {
// 				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
// 					log.Println("connection closed: ", err)
// 				}
// 				return
// 			}

// 			data, err := json.Marshal(message)
// 			if err != nil {
// 				log.Println(err)
// 				return 
// 			}

// 			if err := c.connection.WriteMessage(websocket.TextMessage, data); err != nil {
// 				log.Println(err)
// 			}
// 			log.Println("sent message")

// 		}

// 	}
// }
