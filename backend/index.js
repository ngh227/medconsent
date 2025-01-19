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

const agreementRoutes = require('./src/routes/api/agreements.routes');
const staffAuthRoutes = require('./src/routes/auth/staff.routes');
const patientAuthRoutes = require('./src/routes/auth/patient.routes');
const staffRoutes = require('./src/routes/api/staff.routes');

const app = express();
const PORT = 3000;

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
// index.js
app.use('/api', staffRoutes);

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// MONGODB CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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
