const jwt = require('jsonwebtoken');
const { jwtConfig, validateJwtConfig } = require('../config/jwt');

/**
 * Generate a JWT token for a user
 * @param {Object} payload - The payload to encode (user id and username)
 * @param {string} payload.id - User ID
 * @param {string} payload.username - Username
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    validateJwtConfig();
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
    validateJwtConfig();
    return jwt.verify(token, jwtConfig.secret);
};

module.exports = {
    generateToken,
    verifyToken,
};
