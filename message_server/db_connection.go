package main

import (
 "context"
 "fmt"
 "log"
//  "os"

//  "github.com/joho/godotenv"
 "go.mongodb.org/mongo-driver/mongo"
 "go.mongodb.org/mongo-driver/mongo/options"
)

type Message struct{
	from string
	to string
	message string
}

func Connect() *mongo.Collection {
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

 return Collection
}

type MyRecord struct {
    Message string `bson:"message"`
}

func Insert_record(message string) {
    collection := Connect()

    record := MyRecord{
        Message: message,
    }

    result, err := collection.InsertOne(context.TODO(), record)
    if err != nil {
        log.Printf("Error inserting record: %v", err)
        return
    }

    log.Printf("Record inserted: %v", result.InsertedID)
}