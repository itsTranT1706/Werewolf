const { Kafka } = require('kafkajs');

function createKafkaClient(config) {
  return new Kafka({
    clientId: config.kafkaClientId,
    brokers: config.kafkaBrokers
  });
}

module.exports = {
  createKafkaClient
};
