package main

import (
	"fmt"
    "context"
	"github.com/go-redis/redis/v8"
)

func Connect_Redis() *redis.Client{
    // Create a new context
    ctx := context.Background()

    // Create Redis client
    rdb := redis.NewClient(&redis.Options{
        Addr:     "redis-10406.c330.asia-south1-1.gce.redns.redis-cloud.com:10406",  // Redis Cloud endpoint
        Password: "D0roIfwjRbkd39pUIufh5mt0RLA7IumT",         // Redis Cloud password
        DB:       0,                       // Default DB
    })
    pong, err := rdb.Ping(ctx).Result()
    if err != nil {
        fmt.Println("Failed to connect to Redis:", err)
    }
    fmt.Println("Connected to Redis:", pong)

    return rdb

}
