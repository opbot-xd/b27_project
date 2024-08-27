package main

import (
	"context"
	"fmt"
	"log"

	"github.com/go-redis/redis/v8"
)

var (
    rdb *redis.Client
    ctx = context.Background()
)


func Connect_Redis(){

    ctx = context.Background()

    rdb = redis.NewClient(&redis.Options{
        Addr:     "redis-10406.c330.asia-south1-1.gce.redns.redis-cloud.com:10406", 
        Password: "D0roIfwjRbkd39pUIufh5mt0RLA7IumT",        
        DB:       0,                       
    })

    pong, err := rdb.Ping(ctx).Result()
    if err != nil {
        fmt.Println("Failed to connect to Redis:", err)
    }
    fmt.Println("Connected to Redis:", pong)
}

func SetKey(key string, value interface{}) error {
    return rdb.Set(ctx, key, value, 0).Err()
}

func GetKey(key string) (string, error) {
    return rdb.Get(ctx, key).Result()
}

func DelKey(key string){
    rdb.Del(ctx,key);
    log.Printf("key deleted : %v ",key)
}


func SetMap(key string,fields map[string]interface{}) error {
 
    pipe := rdb.Pipeline()

    pipe.HSet(ctx, key, fields)

    // Set expiration if provided
    // if expiration > 0 {
    //     pipe.Expire(ctx, key, expiration)
    // }

    // Execute the pipeline
    _, err := pipe.Exec(ctx)
    if err != nil {
        log.Printf("Error setting hash map in Redis: %v", err)
        return err
    }

    return nil
}
