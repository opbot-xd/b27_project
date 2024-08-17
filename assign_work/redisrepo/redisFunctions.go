package redisrepo

import (
	"fmt"
	// "github.com/go-redis/redis/v8"
	"context"
)

type Work struct {
	Username string `json:"username"`
	To string `json:"to"`
	Work   string `json:"work"`//problem statement
	Link string `json:"link"` 
	FromTS int64 `json:"fromts"` //work assigned
	ToTS int64 `json:"tots"` //last date of submission
}



func AssignWork(username string, to string, work string, link string, fromts int64, tots int64) error {
    err := redisClient.HMSet(context.Background(), "work: "+username+" : "+to, map[string]interface{}{
        "work":   work,
        "link":   link,
        "fromts": fromts,
        "tots":   tots,
    }).Err()
    if err != nil {
        return fmt.Errorf("error setting hashmap: %w", err)
    }
	// res := "work assigned successfully"
    return nil
}