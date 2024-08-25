package main

import (
	"context"
	"fmt"
	"log"

	//  "os"

	//  "github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Message struct{
	from string
	to string
	message string
}

var (
    conn *mongo.Collection
)

func Connect_with_chats(){
    // Find .evn
    // err := godotenv.Load(".env")
    // if err != nil {
    //     log.Fatalf("Error loading .env file: %s", err)
    // }

    // // Get value from .env
    // MONGO_URI := os.Getenv("MONGO_URI")

	MONGO_URI := "mongodb://localhost:27017/"

 // Connect to the database.
 clientOption := options.Client().ApplyURI(MONGO_URI)
 client, err := mongo.Connect(context.Background(), clientOption)
 if err != nil {
  log.Fatal(err)
 }

 // Check the connection.
 err = client.Ping(context.Background(), nil)
 if err != nil {
  log.Fatal(err)
 }

 // Create collection
 Collection := client.Database("assign_work").Collection("chats")
 if err != nil {
     log.Fatal(err)
 }

 fmt.Println("Connected to db")

 conn = Collection
}
type MyRecord struct {
    From    string `bson:"from"`
    To      string `bson:"to"`
    Message string `bson:"message"`
    Time    string `bson:"time"`
}

type HistoryEvent struct{
    Time string `json:"time"`
    To      string `json:"to"`
    Message string `json:"message"`
    From    string `json:"from"`
}

func Insert_Chat(from string, to string, message string, time string) {
    record := MyRecord{
        From:    from,
        To:      to,
        Message: message,
        Time:    time,
    }
    log.Printf("Record to insert: %+v", record)

    result, err := conn.InsertOne(context.TODO(), record)
    if err != nil {
        log.Printf("Error inserting record: %v", err)
        return
    }

    log.Printf("Record inserted: %v", result.InsertedID)
}

func Get_Chats(username string) []HistoryEvent {
    filter := bson.M{
        "$or": []bson.M{
            {"from": username},
            {"to": username},
        },
    }
    log.Println("broo hi")

    cursor, err := conn.Find(context.TODO(), filter)
    if err != nil {
        log.Printf("Error finding records: %v", err)
        return nil
    }
    defer cursor.Close(context.TODO())

    var messages []HistoryEvent
    for cursor.Next(context.TODO()) {
        var msg HistoryEvent
        if err := cursor.Decode(&msg); err != nil {
            log.Printf("Error decoding message: %v", err)
            continue
            
        }
        log.Println(msg)
        messages = append(messages, msg)
    }
    

    if err := cursor.Err(); err != nil {
        log.Printf("Cursor error: %v", err)
        return nil
    }

    return messages
}