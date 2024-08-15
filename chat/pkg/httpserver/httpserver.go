package httpserver

import (
	"fmt"
	"net/http"

	"gochatapp/pkg/redisrepo"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func StartHTTPServer() {
	// initialise redis client instance for data sharing 
	redisClient := redisrepo.InitialiseRedis()
	defer redisClient.Close() //closes the instance when server is turned down

	// create indexes
	redisrepo.CreateFetchChatBetweenIndex() //the function called makes indexes from from to timestamp tags to provide efficient searching

	r := mux.NewRouter() //creates router 
	r.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Simple Server")
	}).Methods(http.MethodGet)

	r.HandleFunc("/register", registerHandler).Methods(http.MethodPost)
	r.HandleFunc("/login", loginHandler).Methods(http.MethodPost)
	r.HandleFunc("/verify-contact", verifyContactHandler).Methods(http.MethodPost)
	r.HandleFunc("/chat-history", chatHistoryHandler).Methods(http.MethodGet)
	r.HandleFunc("/contact-list", contactListHandler).Methods(http.MethodGet)

	// Use default options
	handler := cors.Default().Handler(r)
	http.ListenAndServe(":8080", handler)
}