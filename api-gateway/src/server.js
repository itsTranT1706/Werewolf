const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { authMiddleware } = require('./auth');
const { createKafkaClient, createProducer, createBroadcastConsumer, disconnectKafka } = require('./kafka');
const { setupSocket } = require('./socket');

async function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

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
