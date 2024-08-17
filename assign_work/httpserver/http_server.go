package httpserver

import (
	"encoding/json"
	"fmt"
	"net/http"
	"assign_work/redisrepo"
	// "assign_work/httpserver"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Work struct {
	Username string `json:"username"`
	To string `json:"to"`
	Work   string `json:"work"` //problem statement
	Link string `json:"link"`
	FromTS int64 `json:"fromts"` //work assigned
	ToTS int64 `json:"tots"` //last date of submission
}

func StartHTTPServer() {
	// initialise redis client instance for data sharing 
	redisClient := redisrepo.InitialiseRedis()
	defer redisClient.Close() //closes the instance when server is turned down

	// create indexes
	// redisrepo.CreateFetchChatBetweenIndex() //the function called makes indexes from from to timestamp tags to provide efficient searching

	r := mux.NewRouter() //creates router 
	r.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Simple Server")
	}).Methods(http.MethodGet)

	r.HandleFunc("/assign_work",Assign_work_handler).Methods(http.MethodPost)
	r.HandleFunc("/submit_work",submit_work_handler).Methods(http.MethodPost)

	// Use default options
	handler := cors.Default().Handler(r)
	http.ListenAndServe(":8080", handler)
}

func Assign_work_handler(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Content-Type", "application/json")

	u := &Work{}   // user request is decoded below and store
	if err := json.NewDecoder(r.Body).Decode(u); err != nil {   
		http.Error(w, "error decoidng request object", http.StatusBadRequest)
		return
	}

	res := redisrepo.AssignWork(u.Username,u.To,u.Work,u.Link,u.ToTS,u.FromTS)
	json.NewEncoder(w).Encode(res)

}

// func assignWork(u *work) error{
// 	fmt.Println("Work Assigned !")
// 	return nil
// }

func submit_work_handler(w http.ResponseWriter, r *http.Request){

}