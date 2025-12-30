require('dotenv').config();
const express = require('express');
const cors = require('cors');
const appConfig = require('./config/app');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware (simple)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/v1/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Werewolf Auth Service',
        version: '1.0.0',
        status: 'running',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

// Start server
const server = app.listen(appConfig.port, () => {
    console.log(`🚀 Auth Service running on port ${appConfig.port}`);
    console.log(`📍 Environment: ${appConfig.nodeEnv}`);
    console.log(`🔗 Base URL: http://localhost:${appConfig.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
