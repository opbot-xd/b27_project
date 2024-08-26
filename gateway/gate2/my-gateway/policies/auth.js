const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

module.exports = {
  name: 'custom-auth',
  policy: (actionParams) => {
    return async (req, res, next) => {
      const { name } = actionParams;
      

      if (name === 'signIn') {
        const jwtSecret = process.env.JWT_SECRET;
        const mongoUri = process.env.MONGO_URI;

        // Connect to MongoDB
        const client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('b27_project');
        const usersCollection = db.collection('user');

        const { username, password } = req.body;

        // Find the user by username
        const user = await usersCollection.findOne({ username });
        if (!user) {
          res.status(401).send('Invalid username or password');
          client.close();
          return;
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          res.status(401).send('Invalid username or password');
          client.close();
          return;
        }

        // Generate JWT
        const token = jwt.sign({ username: user.username }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });

        client.close();
        return;
      }

      next();
    };
  },
};
