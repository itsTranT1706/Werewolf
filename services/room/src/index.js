const express = require('express');
const cors = require('cors');
const prisma = require('./config/database');
const { createKafkaClient, createProducer } = require('./utils/kafka');
const roomRoutes = require('./routes/roomRoutes');

async function startServer() {
  const app = express();
  const port = process.env.PORT || 8082;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'room-service' });
  });

  // Kafka setup
  const kafka = createKafkaClient();
  const producer = await createProducer(kafka);

  // Attach prisma and producer to request object
  app.use((req, res, next) => {
    req.prisma = prisma;
    req.kafkaProducer = producer;
    next();
  });

  // Routes
  app.use('/api/v1/rooms', roomRoutes);

  // Error handling
  app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(port, () => {
    console.log(`Room service listening on port ${port}`);
  });

  return { app, prisma, producer };
}

async function stopServer(resources) {
  const { prisma, producer } = resources;

  if (producer) {
    await producer.disconnect();
  }

  if (prisma) {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = { startServer, stopServer };
