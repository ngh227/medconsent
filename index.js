// index.js
// register the route from routes/auth
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;
const authRoutes = require('./src/routes/auth');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 3000;
app.use(bodyParser.json());

// create a new Redis client instance
const redisClient = createClient({
  host: '127.0.0.1',
  port: 6379,
  //password: '', // no password yet, might have later
});

redisClient.connect().catch(console.error);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully');
});

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'psess:',
});

// sesion middleware to use Redis
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, 
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 // 1h in millisec
  }
}));

app.post('/test-session/set', (req, res) => {
  try {
      // Set some data in the session
      req.session.userData = req.body;
      res.json({
          message: 'Session data set successfully',
          sessionID: req.sessionID,
          data: req.session.userData
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Test route to get session data
app.get('/test-session/get', (req, res) => {
  try {
      res.json({
          sessionID: req.sessionID,
          userData: req.session.userData || null,
          views: req.session.views || 0
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Test route to increment views
app.get('/test-session/views', (req, res) => {
  try {
      if (!req.session.views) {
          req.session.views = 1;
      } else {
          req.session.views += 1;
      }
      res.json({
          views: req.session.views,
          sessionID: req.sessionID
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Test route to clear session
app.post('/test-session/clear', (req, res) => {
  try {
      req.session.destroy((err) => {
          if (err) {
              throw err;
          }
          res.json({ message: 'Session cleared successfully' });
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.use('/api', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// app.use(session({
//     secret: 'someSuperSecretString', // replace with a strong secret in production
//     resave: false, // the session is only saved if it was actually modified
//     saveUninitialized: false, // saves new unmodified sessions to the store. SHOULD SET TO FALSE
//   }));

app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received');
  await redisClient.quit();
  process.exit(0);
});