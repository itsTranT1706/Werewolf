# Chat Service

Kafka worker that validates chat commands from `cmd.ingest` and publishes broadcast events to `evt.broadcast` for rooms and direct messages.

## Environment
- `PORT` (default `8085`)
- `KAFKA_BROKERS` (default `kafka:9092`)
- `KAFKA_CLIENT_ID` (default `chat-service`)
- `KAFKA_GROUP_ID` (default `chat-service-cmd`)
- `CMD_TOPIC` (default `cmd.ingest`)
- `EVT_TOPIC` (default `evt.broadcast`)

## Structure (parallel-friendly)
- `src/index.js`: bootstrap + graceful shutdown
- `src/kafka/*`: Kafka client, producer, consumer wiring
- `src/handlers/roomChat.js`: handles `CHAT_SEND` / `CHAT_SEND_ROOM` (Person A)
- `src/handlers/dmChat.js`: handles `CHAT_SEND_DM` (Person B)
- `src/schemas/*.schema.json`: command/broadcast schemas
- `src/utils/*`: logger, validator, id helper

## Run locally
```bash
cd services/chat
npm install
npm start
```

## Docker
```bash
docker-compose up -d zookeeper kafka api-gateway chat-service
```

## Contract
- Consume `cmd.ingest` with shape `{ traceId, userId, roomId, action: { type, payload }, ts }`
- Handle actions:
  - `CHAT_SEND` / `CHAT_SEND_ROOM` ⇒ validate `roomId`, `text` (1-500 chars) ⇒ emit `event.type=CHAT_MESSAGE`
  - `CHAT_SEND_DM` ⇒ validate `targetUserId`, `text` (1-500 chars) ⇒ emit `event.type=CHAT_MESSAGE_DM`
- Produce to `evt.broadcast`:
  - Room: `{ traceId, roomId, event: { type: "CHAT_MESSAGE", payload: { messageId, userId, text, createdAt } }, ts }`
  - DM: `{ traceId, targetUserId, event: { type: "CHAT_MESSAGE_DM", payload: { messageId, fromUserId, text, createdAt } }, ts }`

## Test plan
1) `docker-compose up -d zookeeper kafka api-gateway chat-service`
2) Start two clients (or two tabs) connecting to gateway, both join `roomId="lobby"`
3) Client A emits `CHAT_SEND` with `{ roomId: "lobby", text: "hi" }` ⇒ both A and B receive `CHAT_MESSAGE`
4) Client A emits `CHAT_SEND_DM` with `{ targetUserId: <B>, text: "secret" }` ⇒ only B receives `CHAT_MESSAGE_DM`
5) Optionally tail Kafka:
   - `kafka-console-consumer --bootstrap-server localhost:9092 --topic cmd.ingest --from-beginning`
   - `kafka-console-consumer --bootstrap-server localhost:9092 --topic evt.broadcast --from-beginning`
