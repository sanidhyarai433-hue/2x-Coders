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

const { getPortalsAPI, generateAppealAPI } = require('./controllers/grievanceController');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.post('/api/get-portals', getPortalsAPI);
app.post('/get-portals', getPortalsAPI);
app.post('/api/generate-appeal', generateAppealAPI);
app.post('/generate-appeal', generateAppealAPI);

// Base Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'ADHIKAR Citizen Grievance & RTI Engine',
    timestamp: new Date()
  });
});

module.exports = app;
