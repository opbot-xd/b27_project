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

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
  }));

const MONGODB_URI = process.env.MONGODB_URI

const JWT_SECRET = process.env.JWT_SECRET; 

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const wsServerURL = process.env.wsServerURL; 

app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    try {
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
    
      const token = await jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
      
      const wsResponse = await axios.post(wsServerURL, {
        username: "percy", 
        password: "123" 
      });
      
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
  
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
 
      const saltRound = 10;
      password = await bcrypt.hash(password, saltRound)

      const newUser = new User({ username, password, email });
        await newUser.save();
     
      res.status(201).json({ message: "User registered successfully"});
    } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).json({ message: "Server error", });
    }
  });

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
    const wsResponse = await axios.post(wsServerURL, {
      username: "percy", 
      password: "123"
    });
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

app.post('/logout', async(req,res)=>{
  const token = req.headers['authorization'].split(' ')[1];
    res.status(201).json({"message":"session terminated"})
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
