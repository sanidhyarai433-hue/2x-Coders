const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow connections from frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// Base Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'ADHIKAR Citizen Grievance & RTI Engine',
    timestamp: new Date()
  });
});

module.exports = app;
