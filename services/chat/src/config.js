function parseBrokers(raw) {
  return (raw || '')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);
}

module.exports = {
  port: Number(process.env.PORT) || 8085,
  kafkaBrokers: parseBrokers(process.env.KAFKA_BROKERS || 'kafka:9092'),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'chat-service',
  kafkaGroupId: process.env.KAFKA_GROUP_ID || 'chat-service-cmd',
  cmdTopic: process.env.CMD_TOPIC || 'cmd.ingest',
  evtTopic: process.env.EVT_TOPIC || 'evt.broadcast'
};
