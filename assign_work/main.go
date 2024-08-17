package main

import (
	// "assign_work/httpserver"
	"assign_work/httpserver"
	"flag"
	"fmt"
	"log"

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
	server := flag.String("work_server", "","")
	flag.Parse()

	if *server == "work_server" {
		fmt.Println("http server is starting on :8082")
		httpserver.StartHTTPServer()
	}else {
		fmt.Println("invalid server. Available server: work_server")
	}

}