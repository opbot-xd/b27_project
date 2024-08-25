package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// Event is the Messages sent over the websocket
// Used to differ between different actions
type Event struct {
	// Type is the message type sent
	Type string `json:"type"`
	// Payload is the data Based on the Type
	Payload json.RawMessage `json:"payload"`
}



// EventHandler is a function signature that is used to affect messages on the socket and triggered
// depending on the type
type EventHandler func(event Event, c *Client) error

const (
	// EventSendMessage is the event name for new chat messages sent
	EventSendMessage = "send_message"
	// EventNewMessage is a response to send_message
	EventNewMessage = "new_message"
	// EventChangeRoom is event when switching rooms
	EventChangeRoom = "change_room"
)

// SendMessageEvent is the payload sent in the
// send_message event
type SendMessageEvent struct {
	To string `json:"to"`
	PS string `json:"ps"`
	Link string `json:"link"`
	From    string `json:"from"`
	Remarks string `json:"remarks"`
	Deadline string `json:"deadline"`
}

// NewMessageEvent is returned when responding to send_message
type NewMessageEvent struct {
	SendMessageEvent
	Sent time.Time `json:"sent"`
}



// SendMessageHandler will send out a message to all other participants in the chat
func SendMessageHandler(event Event, c *Client) error {
	// Marshal Payload into wanted format
	var chatevent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatevent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	log.Println(chatevent)

	// Prepare an Outgoing Message to others
	// var broadMessage NewMessageEvent

	// broadMessage.Sent = time.Now()
	// broadMessage.PS = chatevent.PS
	// broadMessage.Link = chatevent.Link
	// broadMessage.From = chatevent.From
	
	data, err := json.Marshal(chatevent)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}
	log.Println(chatevent)

	


	// Place payload into an Event
	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventNewMessage
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
	c.chatroom = changeRoomEvent.Name

	return nil
}