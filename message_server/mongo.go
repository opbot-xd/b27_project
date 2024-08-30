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

// var (
//     conn *mongo.Collection
// )


func Connect_with_work() *mongo.Collection {
    // Find .evn
    // err := godotenv.Load(".env")
    // if err != nil {
    //     log.Fatalf("Error loading .env file: %s", err)
    // }

    // // Get value from .env
    // MONGO_URI := os.Getenv("MONGO_URI")

	MONGO_URI := "mongodb://localhost:27017/taskAssigner"

 // connecting to the database.
 clientOption := options.Client().ApplyURI(MONGO_URI)
 client, err := mongo.Connect(context.Background(), clientOption)
 if err != nil {
  log.Fatal(err)
 }

 // check the connection is secure/steady
 err = client.Ping(context.Background(), nil)
 if err != nil {
  log.Fatal(err)
 }

 // refers to a specific collection
 Collection := client.Database("taskAssigner").Collection("tasks")
 if err != nil {
     log.Fatal(err)
 }

 fmt.Println("Connected to db")

 return Collection
}

type MyRecord_work struct {
    From string `bson:"from"`
    To string `bson:"to"`
    PS string `bson:"ps"`
    Link string `bson:"link"`
    Remarks string `bson:"remarks"`
    Deadline string `bson:"deadline"`
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

func Connect_with_chats()*mongo.Collection{
    // Find .evn
    // err := godotenv.Load(".env")
    // if err != nil {
    //     log.Fatalf("Error loading .env file: %s", err)
    // }

    // // Get value from .env
    // MONGO_URI := os.Getenv("MONGO_URI")

	MONGO_URI := "mongodb://localhost:27017/taskAssigner"

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
 Collection := client.Database("taskAssigner").Collection("chats")
 if err != nil {
     log.Fatal(err)
 }

 fmt.Println("Connected to db")

 return Collection
}

func Insert_record(from string,to string,ps string,link string,remarks string,deadline string) {
    collection := Connect_with_work()

    record := MyRecord_work{
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

func Get_record(username string) []MyRecord_work {
    collection := Connect_with_work()
    fmt.Println("hsdcsbhdhscbesctsctuevcsGYcvEctaeycvastycvestcvtusvctyevciy");

    filter := bson.M{
        "$or": []bson.M{
            {"from": username},
            {"to": username},
        },
    }

    cursor, err := collection.Find(context.TODO(), filter)
    if err != nil {
        log.Printf("Error finding records: %v", err)
        return nil
    }
    defer cursor.Close(context.TODO())

    var results []MyRecord_work

    for cursor.Next(context.TODO()) {
        var record MyRecord_work
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

func Insert_Chat(from string, to string, message string, time string) {
	conn := Connect_with_chats()
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
	conn := Connect_with_chats()
    fmt.Print("dsjdsncdjsndscskcsd")
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