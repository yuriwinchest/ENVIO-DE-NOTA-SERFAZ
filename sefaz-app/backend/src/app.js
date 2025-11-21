const express = require('express');
const cors = require('cors');
const nfeRoutes = require('./routes');
const configRoutes = require('./routes/config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', nfeRoutes);
app.use('/api', configRoutes);

module.exports = app;
