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
 Collection := client.Database("assign_work").Collection("works")
 if err != nil {
     log.Fatal(err)
 }

 fmt.Println("Connected to db")

 return Collection
}

type MyRecord struct {
    From string `bson:"from"`
    To string `bson:"to"`
    PS string `bson:"ps"`
    Link string `bson:"link"`
    Remarks string `bson:"remarks"`
    Deadline string `bson:"deadline"`
}

func Insert_record(from string,to string,ps string,link string,remarks string,deadline string) {
    collection := Connect()

    record := MyRecord{
        From: from,
        To: to,
        PS: ps,
        Link: link,
        Remarks: remarks,
        Deadline: deadline,
    }

    result, err := collection.InsertOne(context.TODO(), record)
    if err != nil {
        log.Printf("Error inserting record: %v", err)
        return
    }

    log.Printf("Record inserted: %v", result.InsertedID)
}

func Get_record(username string) []MyRecord {
    collection := Connect()

    // Create a filter for the username
    filter := bson.M{"to": username}

    // Find all documents that match the filter
    cursor, err := collection.Find(context.TODO(), filter)
    if err != nil {
        log.Printf("Error finding records: %v", err)
        return nil
    }
    defer cursor.Close(context.TODO())

    var results []MyRecord

    for cursor.Next(context.TODO()) {
        var record MyRecord
        err := cursor.Decode(&record)
        if err != nil {
            log.Printf("Error decoding record: %v", err)
            continue
        }
        results = append(results, record)
    }

    if err := cursor.Err(); err != nil {
        log.Printf("Cursor error: %v", err)
        return nil
    }

    return results
}