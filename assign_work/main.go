package main

import (
	// "assign_work/httpserver"
	"assign_work/httpserver"
	"flag"
	"fmt"
	"log"
	"assign_work/websocket"

	// "./httpserver/httpserver.go"
	"github.com/joho/godotenv"
)

func init() {
	// Load the environment file .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Unable to Load the env file.", err)
	}
}

func main() {
	//cli parser that checks which server to start websocket one or http one
	server := flag.String("server", "","http,websocket")
	flag.Parse()

	if *server == "http" {
		fmt.Println("http server is starting on :8082")
		httpserver.StartHTTPServer()
	}else if *server == "websocket"{
		fmt.Println("websocket server is starting on :8083")
		websocket.StartWebsocketServer()
	}else {
		fmt.Println("invalid server. Available server: work_server")
	}

}