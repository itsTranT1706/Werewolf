const { verifyToken } = require('../utils/jwt');

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
            return res.status(401).json({
                error: 'Access denied. No token provided.',
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Attach user data to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Internal server error during authentication',
        });
    }
};

module.exports = {
    authenticateToken,
};
