package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	/**
	websocketUpgrader is used to upgrade incomming HTTP requests into a persitent websocket connection
	*/
	websocketUpgrader = websocket.Upgrader{
		CheckOrigin:     checkOrigin,
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

var (
	ErrEventNotSupported = errors.New("this event type is not supported")
)

// checkOrigin will check origin and return true if its allowed just like cors in nodejs backend
func checkOrigin(r *http.Request) bool {

	origin := r.Header.Get("Origin")

	switch origin {
	case "https://localhost:8080":
		return true
	default:
		return true
	}
}

// Manager is used to hold references to all Clients Registered, and Broadcasting etc
type Manager struct {
	clients ClientList

	// Using a syncMutex here to be able to lcok state before editing clients
	// Could also use Channels to block
	sync.RWMutex
	// handlers are functions that are used to handle Events
	handlers map[string]EventHandler

	otps RetentionMap
}

// NewManager is used to initalize a new manager instance
func NewManager(ctx context.Context) *Manager {
	m := &Manager{
		clients:  make(ClientList),
		handlers: make(map[string]EventHandler),
		// it creates a new retentionMap that removes Otps older than 5 seconds
		otps: NewRetentionMap(ctx, 5*time.Second),
	}
	m.setupEventHandlers()
	return m
}

func (m *Manager) setupEventHandlers() {
	m.handlers[EventSendMessage] = SendMessageHandler
	m.handlers[EventChangeRoom] = ChatRoomHandler
	m.handlers[EventSendWork] = SendWorkHandler
}


func (m *Manager) routeEvent(event Event, c *Client) error {
	if handler, ok := m.handlers[event.Type]; ok {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	} else {
		return ErrEventNotSupported
	}
}

func (m *Manager) loginHandler(w http.ResponseWriter, r *http.Request) {

	type userLoginRequest struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var req userLoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Authenticate user / Verify Access token, what ever auth method you use
	if (req.Username == "percy" && req.Password == "123") || (req.Username == "siddharth" && req.Password == "123") || (req.Username == "deenank" && req.Password == "123") {
		// format to return otp in to the frontend
		type response struct {
			OTP string `json:"otp"`
		}

	
		otp := m.otps.NewOTP()
		// log.Println(otp)
		resp := response{
			OTP: otp.Key,
		}

		data, err := json.Marshal(resp)
		if err != nil {
			log.Println(err)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(data)
		return
	}

	w.WriteHeader(http.StatusUnauthorized)
}

func (m *Manager) serveWS(w http.ResponseWriter, r *http.Request) {

	username := r.URL.Query().Get("username")

	otp := r.URL.Query().Get("otp")
	if otp == "" {
	
		w.WriteHeader(http.StatusUnauthorized)
		return
	}


	// if !m.otps.VerifyOTP(otp) {
	// 	w.WriteHeader(http.StatusUnauthorized)
	// 	return
	// }
	if otp != "otp"{
				w.WriteHeader(http.StatusUnauthorized)
		return
	}

	log.Println("New connection")
	log.Println(username)
	//upgrading the request
	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// creating a new client
	client := NewClient(username,conn, m)
	// adding the newly created client to the manager
	m.addClient(client)
	SetKey("username",username)
	messages := Get_Chats(username)
	works:=Get_record(username)


	log.Println(works)
	// log.Println(messages)
	
	// go client.readMessages()
	// go client.writeMessages(messages)
	// go client.readWorks()

	// go client.writeWorks(works)

	go client.readMessages()
    go client.writeLoop()
    

    go client.sendInitialData(messages, works)
}

func (m *Manager) addClient(client *Client) {

	m.Lock()
	defer m.Unlock()


	m.clients[client] = true
}

// removeClient will remove the client and clean up
func (m *Manager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	// Check if Client exists, then delete it
	if _, ok := m.clients[client]; ok {

		//deleting redis key to show that user is logged out
		DelKey(client.username)
		// close connection
		client.connection.Close()
		// remove
		delete(m.clients, client)
	}
}