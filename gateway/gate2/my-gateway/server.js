require('dotenv').config(); // Load environment variables from .env file
const gateway = require('express-gateway');

// Start the gateway directly
gateway().run();
