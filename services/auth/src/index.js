require('dotenv').config();
const express = require('express');
const cors = require('cors');
const appConfig = require('./config/app');
const authRoutes = require('./routes/authRoutes');
const prisma = require('./config/database');

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

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
    }
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
const server = app.listen(appConfig.port, async () => {
    console.log(`🚀 Auth Service running on port ${appConfig.port}`);
    console.log(`📍 Environment: ${appConfig.nodeEnv}`);
    console.log(`🔗 Base URL: http://localhost:${appConfig.port}`);
    
    // Test database connection
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await prisma.$disconnect();
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await prisma.$disconnect();
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
