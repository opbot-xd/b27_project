const path = require('path');
const gateway = require('express-gateway');
require('dotenv').config();
require('./policies/authenticate');
require('./policies/authorize');
gateway()
  .load(path.join(__dirname, 'config'))
  .run();