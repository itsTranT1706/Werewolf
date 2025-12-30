/**
 * Error Messages Constants
 */
const ERROR_MESSAGES = {
    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid credentials',
    ACCESS_DENIED_NO_TOKEN: 'Access denied. No token provided.',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Token expired',

    // Validation errors
    VALIDATION_FAILED: 'Validation failed',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    USERNAME_ALREADY_EXISTS: 'Username already exists',

    // Server errors
    INTERNAL_SERVER_ERROR: 'Internal server error',
    REGISTRATION_ERROR: 'Internal server error during registration',
    LOGIN_ERROR: 'Internal server error during login',
    AUTH_ERROR: 'Internal server error during authentication',

    // Profile service errors
    PROFILE_CREATION_FAILED: 'Failed to create profile',
};

module.exports = ERROR_MESSAGES;
