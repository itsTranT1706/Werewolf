/**
 * JWT Configuration
 */
const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

/**
 * Validate JWT configuration
 */
const validateJwtConfig = () => {
    if (!jwtConfig.secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
};

module.exports = {
    jwtConfig,
    validateJwtConfig,
};
