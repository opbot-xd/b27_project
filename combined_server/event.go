package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)


type Event struct {
	Type string `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type EventHandler func(event Event, c *Client) error



const (
	// EventSendMessage is the event name for new chat messages sent
	EventSendMessage = "send_message"
	// EventNewMessage is a response to send_message
	EventNewMessage = "new_message"
	// EventChangeRoom is event when switching rooms
	EventChangeRoom = "change_room"

	EventSendWork = "send_work"
	
	EventNewWork = "new_work"

	// EventSendWork = ""
)

// SendMessageEvent is the payload sent in the
// send_message event
type SendMessageEvent struct {
	To string `json:"to"`
	Message string `json:"message"`
	From    string `json:"from"`
}

// NewMessageEvent is returned when responding to send_message
type NewMessageEvent struct {
	SendMessageEvent
	Time time.Time `json:"time"`
}

// SendMessageEvent is the payload sent in the
// send_message event
type SendWorkEvent struct {
	To string `json:"to"`
	PS string `json:"ps"`
	Link string `json:"link"`
	From    string `json:"from"`
	Remarks string `json:"remarks"`
	Deadline string `json:"deadline"`
}

// NewMessageEvent is returned when responding to send_message
type NewWorkEvent struct {
	SendMessageEvent
	Sent time.Time `json:"sent"`
}


func SendMessageHandler(event Event, c *Client) error {
	// Marshal Payload into wanted format
	var chatevent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatevent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Prepare an Outgoing Message to others
	var broadMessage NewMessageEvent

	broadMessage.Time = time.Now()
	broadMessage.To = chatevent.To
	broadMessage.Message = chatevent.Message
	broadMessage.From = chatevent.From

	data, err := json.Marshal(broadMessage)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	// Place payload into an Event
	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventNewMessage
	// Broadcast to all other Clients
	for client := range c.manager.clients {
		// Only send to clients inside the same chatroom
		if client.username == broadMessage.To || client.username == broadMessage.From {
			client.egress <- outgoingEvent
		}
	}

	newMessage := map[string]interface{}{
		"To":broadMessage.To,
        "From": broadMessage.From,
        "Message":  broadMessage.Message,
		"Time": time.Now(),
    }

	log.Println(broadMessage.To,newMessage);

	Insert_Chat(broadMessage.From,broadMessage.To,broadMessage.Message,broadMessage.Time.Local().String())
	// var error_redis = SetMap(broadMessage.From,"time","now","message",broadMessage.Message);
	// if error_redis!=nil{
	// 	log.Println("redis bt de rha hai abhi to")
	// }

	return nil
}

type ChangeRoomEvent struct {
	Name string `json:"name"`
}

// ChatRoomHandler will handle switching of chatrooms between clients
func ChatRoomHandler(event Event, c *Client) error {
	// Marshal Payload into wanted format
	var changeRoomEvent ChangeRoomEvent
	if err := json.Unmarshal(event.Payload, &changeRoomEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Add Client to chat room
	// c.chatroom = changeRoomEvent.Name

	return nil
}

func SendWorkHandler(event Event, c *Client) error {
	// Marshal Payload into wanted format
	var chatevent SendWorkEvent
	if err := json.Unmarshal(event.Payload, &chatevent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	// log.Println(chatevent)

	// Prepare an Outgoing Message to others
	// var broadMessage NewMessageEvent

	// broadMessage.Sent = time.Now()
	// broadMessage.PS = chatevent.PS
	// broadMessage.Link = chatevent.Link
	// broadMessage.From = chatevent.From
	log.Println("yaha par hai hum theek hai");
	
	data, err := json.Marshal(chatevent)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}
	log.Println(chatevent)

	


	// Place payload into an Event
	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventNewWork
	// Broadcast to all other Clients
	for client := range c.manager.clients {
		// Only send to clients inside the same chatroom
		if client.username == chatevent.To{
			client.egress <- outgoingEvent
		}

	}
	Insert_record(chatevent.From,chatevent.To,chatevent.PS,chatevent.Link,chatevent.Remarks,chatevent.Deadline)
	return nil
}

// type ChangeRoomEvent2 struct {
// 	Name string `json:"name"`
// }

// // ChatRoomHandler will handle switching of chatrooms between clients
// func ChatRoomHandler(event Event, c *Client) error {
// 	// Marshal Payload into wanted format
// 	var changeRoomEvent ChangeRoomEvent
// 	if err := json.Unmarshal(event.Payload, &changeRoomEvent); err != nil {
// 		return fmt.Errorf("bad payload in request: %v", err)
// 	}

// 	// Add Client to chat room
// 	c.chatroom = changeRoomEvent.Name

// 	return nil
// }