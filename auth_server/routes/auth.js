const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'password',
      username: username,
      password: password,
      audience: '<your-api-audience>',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET
    });

    // If authentication is successful, return the token
    res.status(200).json({
      access_token: response.data.access_token,
      id_token: response.data.id_token,
    });
  } catch (error) {
    // Handle errors, such as incorrect credentials
    res.status(401).json({
      error: 'Invalid credentials. Please check your username and password.',
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    