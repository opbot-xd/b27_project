const jwt = require('jsonwebtoken');

module.exports = {
  name: 'authorize',
  policy: (actionParams) => {
    return (req, res, next) => {
      const token = req.headers['authorization'];
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = decoded;
        next();
      });
    };
  }
};