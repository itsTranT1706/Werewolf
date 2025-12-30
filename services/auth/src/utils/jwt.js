const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {Object} payload - The payload to encode (user id and username)
 * @param {string} payload.id - User ID
 * @param {string} payload.username - Username
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, secret);
};

module.exports = {
    generateToken,
    verifyToken,
};
