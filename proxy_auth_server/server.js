// api-gateway/index.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const mongoose = require("mongoose");
const User = require("./models/user");
const axios=require("axios");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const cors = require('cors')
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv').config()
const app = express();
const PORT = process.env.PORT;
// Middleware to parse JSON
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
  }));// MongoDB connection string
// const MONGODB_URI = "mongodb://localhost:27017/taskAssigner"; // replace with your actual MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI
// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET; // replace with your actual secret key
// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
// User Schema and Model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
// WebSocket server connection
const wsServerURL = process.env.wsServerURL; // replace with your WebSocket server URL
// Sign-In Route
app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    try {
      // Find user in MongoDB
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: "Invalid username" });
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
            console.error('Error comparing password:', err);
            return;
        }
        if (result) {
            console.log('Password is correct!');
        } else {
            console.log('Password is incorrect!');
            return
        }
    });
      // Generate JWT token
      const token = await jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
      // Make a POST request to the WebSocket server URL
      const wsResponse = await axios.post(wsServerURL, {
        username: "percy", // Use the username as required
        password: "123" // Use the password as required
      });
      // Send response back to the client with JWT token and WebSocket server's HTTP response
      res.status(200).json({
        "access_token":token,
        body: wsResponse.data,
      });
    } catch (err) {
      console.error("Error during sign-in:", err.body);
      res.status(500).json({ message: "Server error" });
    }
  });
app.post("/register", async (req, res) => {
    let { username, password, email } = req.body;
    try {
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      // Create a new user
      const saltRound = 10;
      password = await bcrypt.hash(password, saltRound)

      const newUser = new User({ username, password, email });
        await newUser.save();
      // Optionally, generate a JWT token for the newly registered user
      // const token = jwt.sign({ username: newUser.username }, JWT_SECRET, { expiresIn: "1h" });
      res.status(201).json({ message: "User registered successfully"});
    } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).json({ message: "Server error", });
    }
  });
// Proxy requests to the chat server, including query parameters
app.get('/home', (req,res)=>{
  const WEB_SERVER_USERS_ENDPOINT = process.env.WEB_SERVER_USERS_ENDPOINT
  const token = req.headers['authorization'].split(' ')[1];
  if(!token){
    res.status(415).json({error:"unauthorized access. Token Not Found"})
  }
  jwt.verify(token, JWT_SECRET, async (err, user)=>{
    if(err){
      res.status(415).json({message: "unauthorized access"})
    }
    const response = await axios.get(WEB_SERVER_USERS_ENDPOINT)
    res.status(201).json(response.data)
  })
})

app.post('/view_tasks', (req,res)=>{
  const WEB_SERVER_TASKS_ENDPOINT = process.env.WEB_SERVER_TASKS_ENDPOINT
  const token = req.headers['authorization'].split(' ')[1];
  if(!token){
    res.status(415).json({error:"unauthorized access. Token Not Found"})
  }
  jwt.verify(token, JWT_SECRET, async (err, user)=>{
    if(err){
      res.status(415).json({message: "unauthorized access"})
    }
    console.log(req.body)
    const response = await axios.post(WEB_SERVER_TASKS_ENDPOINT,req.body, )
    res.status(201).json(response.data)
  })
})

app.post('/assign', (req,res)=>{
  const WEB_SERVER_ASSIGN_ENDPOINT = process.env.WEB_SERVER_ASSIGN_ENDPOINT
  const token = req.headers['authorization'].split(' ')[1];
  if(!token){
    res.status(415).json({error:"unauthorized access. Token Not Found"})
  }
  jwt.verify(token, JWT_SECRET, async (err, user)=>{
    if(err){
      res.status(415).json({message: "unauthorized access"})
    }
    console.log(req.body)
    const response = await axios.post(WEB_SERVER_ASSIGN_ENDPOINT,req.body, )
    res.status(201).json(response.data)
  })
})
// app.use(
//   "/chat",
//   createProxyMiddleware({
//     target: "http://localhost:8080",
//     changeOrigin: true,
//     ws: true, // Enable WebSocket proxying
//     pathRewrite: (path, req) => {
//       // Optionally manipulate the path if needed
//       return path;
//     },
//   })
// );
// Proxy requests to the web server for serving static files
app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
