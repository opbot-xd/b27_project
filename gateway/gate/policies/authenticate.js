const authService = require('../services/auth.service');

module.exports = {
  name: 'authenticate',
  policy: (actionParams) => {
    return (req, res, next) => {
      const { username, password } = req.body;
      
      authService.authenticateUser(username, password)
        .then(token => {
          req.token = token;
          next();
        })
        .catch(err => {
          res.status(401).json({ error: 'Authentication failed' });
        });
    };
  }
};