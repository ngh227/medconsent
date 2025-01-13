// index.js
// register the route from routes/auth
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const authRoutes = require('./src/routes/auth/auth.routes');
const agreementRoutes = require('./src/routes/api/agreements.routes');
const staffAuthRoutes = require('./src/routes/auth/staff.routes');
const patientAuthRoutes = require('./src/routes/auth/patient.routes');

const app = express();
const PORT = 3000;

console.log('Environment variables loaded:', {
  AUTH_SERVER: process.env.AUTH_SERVER ? 'set' : 'not set',
  CLIENT_ID: process.env.CLIENT_ID ? 'set' : 'not set',
  REDIRECT_URI: process.env.REDIRECT_URI ? 'set' : 'not set'
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// create a new Redis client instance
const redisClient = createClient({
  url: 'redis://127.0.0.1:6379'
  //password: '', // no password yet, might have later
});

redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => {
    console.error('Redis connection error:', err);
    process.exit(1); // Terminate if Redis fails to connect
  });

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

// Use routes
app.use('/api', staffAuthRoutes);
app.use('/api', patientAuthRoutes);
// app.use('/api', agreementRoutes);

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// MONGODB CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', authRoutes);
app.use('/api', agreementRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});
