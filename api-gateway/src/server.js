const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const { authMiddleware } = require('./auth');
const { createKafkaClient, createProducer, createBroadcastConsumer, disconnectKafka } = require('./kafka');
const { setupSocket } = require('./socket');

async function createApp() {
  const app = express();
  
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Simple proxy for auth routes using axios
  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:8081';
  
  app.all('/api/auth/*', express.json(), async (req, res) => {
    try {
      const path = req.url;
      const url = `${AUTH_SERVICE_URL}${path}`;
      console.log(`[PROXY] ${req.method} ${path} -> ${url}`);
      
      const response = await axios({
        method: req.method,
        url,
        data: req.body,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      
      console.log(`[PROXY RESPONSE] ${response.status}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('[PROXY ERROR]', error.message);
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(502).json({ error: 'Bad Gateway - Auth service unavailable', details: error.message });
      }
    }
  });

  // JSON parser for other routes
  app.use(express.json());

  // All other routes require authentication
  app.use(authMiddleware);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

async function startServer() {
  const app = await createApp();
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });

  const kafka = createKafkaClient();
  const producer = await createProducer(kafka);
  const { userSockets } = setupSocket(io, producer);
  const consumer = await createBroadcastConsumer(kafka, { io, userSockets });

  const port = process.env.PORT || 80;
  await new Promise((resolve) => httpServer.listen(port, resolve));
  console.log(`API Gateway listening on port ${port}`);

  return { app, server: httpServer, io, producer, consumer };
}

async function stopServer(resources) {
  const { server, io, producer, consumer } = resources;

  if (io) {
    io.close();
  }

  await disconnectKafka({ producer, consumer });

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

module.exports = {
  startServer,
  stopServer
};
