
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

module.exports = {
  name: 'custom-auth',
  policy: (actionParams) => {
    return async (req, res, next) => {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      try {
        const user = await User.findOne({ username });
        if (!user || !bcrypt.compareSync(password, user.password)) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ username }, actionParams.secretOrPrivateKey, { expiresIn: '1h' });

        res.json({ token });
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
    };
  }
};
