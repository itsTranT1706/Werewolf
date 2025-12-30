const { startServer, stopServer } = require('./server');

let resources;

async function bootstrap() {
  try {
    resources = await startServer();
  } catch (err) {
    console.error('Failed to start API Gateway', err);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    if (resources) {
      await stopServer(resources);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
});

bootstrap();
