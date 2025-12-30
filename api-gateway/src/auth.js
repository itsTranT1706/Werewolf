const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

function extractBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') return null;
  const parts = headerValue.split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return headerValue;
}

function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function authMiddleware(req, res, next) {
  if (req.path === '/health') {
    return next();
  }
  const token = extractBearerToken(req.headers.authorization || req.headers.Authorization);
  const payload = verifyToken(token);
  if (!payload?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = payload;
  return next();
}

function socketAuthMiddleware(socket, next) {
  const handshake = socket.handshake || {};
  const tokenFromAuth = handshake.auth && handshake.auth.token;
  const tokenFromHeader = handshake.headers && handshake.headers.authorization;
  const token = extractBearerToken(tokenFromAuth || tokenFromHeader);
  const payload = verifyToken(token);
  if (!payload?.userId) {
    return next(new Error('Unauthorized'));
  }
  socket.data.userId = payload.userId;
  socket.data.tokenPayload = payload;
  return next();
}

module.exports = {
  authMiddleware,
  socketAuthMiddleware,
  verifyToken,
  JWT_SECRET
};
