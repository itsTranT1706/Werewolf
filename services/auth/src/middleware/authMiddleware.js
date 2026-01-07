const { verifyToken } = require('../utils/jwt');
const HTTP_STATUS = require('../constants/httpStatus');
const ERROR_MESSAGES = require('../constants/errorMessages');

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token from the Authorization header
 * Attaches user data to req.user if valid
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: ERROR_MESSAGES.ACCESS_DENIED_NO_TOKEN,
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Attach user data to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: ERROR_MESSAGES.INVALID_TOKEN,
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: ERROR_MESSAGES.TOKEN_EXPIRED,
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.AUTH_ERROR,
        });
    }
};

module.exports = {
    authenticateToken,
};
