# API Gateway

Express + Socket.IO gateway that authenticates with JWT and bridges client actions to Kafka.

## Setup & Run
- Ensure Docker is running. From repo root: `docker-compose up -d kafka api-gateway` (add other services when ready).
- Environment: `KAFKA_BROKERS` defaults to `kafka:9092` inside the compose network, `JWT_SECRET` must be set for real deployments, `PORT` defaults to `80`.
- Local run without Docker: `cd api-gateway && npm install && npm start`.

## Contracts
- Produce to `cmd.ingest`: `{ traceId, userId, roomId?, action:{ type, payload }, ts }`.
- Consume from `evt.broadcast`: `{ traceId, roomId?, targetUserId?, event:{ type, payload }, ts }`.

## Auth
- REST: all routes except `/health` require `Authorization: Bearer <jwt>` where payload includes `userId`.
- Socket.IO: send token via `handshake.auth.token` or `Authorization` header; gateway sets `socket.data.userId`.

## Quick Tests
- Health check (no JWT needed): `curl http://localhost/health`.
- Create a test JWT (replace secret as needed): `node -e "console.log(require('jsonwebtoken').sign({userId:'demo-userProfile'}, 'your_secret_key'))"`.
- Socket smoke test (inside repo): `node -e "const { io } = require('socket.io-client'); const token = '<jwt>'; const s = io('http://localhost', { auth:{ token } }); s.on('connect', ()=>{ console.log('connected'); s.emit('ROOM_JOIN',{roomId:'lobby'}); s.emit('CHAT_SEND',{roomId:'lobby',text:'hello'}); }); s.on('ERROR',console.error);"`.

## Behavior
- On `ROOM_JOIN`/`CHAT_SEND`, publishes to Kafka topic `cmd.ingest`.
- Consumes `evt.broadcast` and emits `event.type` to either a room, a target userProfile, or all sockets when neither is set.
- Graceful shutdown closes Kafka consumer/producer and the HTTP/Socket.IO server.
