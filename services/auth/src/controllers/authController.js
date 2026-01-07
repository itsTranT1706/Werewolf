const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/authValidators');
const HTTP_STATUS = require('../constants/httpStatus');
const ERROR_MESSAGES = require('../constants/errorMessages');

/**
 * Auth Controller
 * Handles HTTP requests and responses for authentication
 */

/**
 * Register a new user
 * @route POST /register
 */
const register = async (req, res) => {
    try {
        // Validate input
        const validatedData = registerSchema.parse(req.body);

        // Call service layer
        const result = await authService.register(validatedData);

        return res.status(HTTP_STATUS.CREATED).json({
            message: 'User created successfully',
            ...result,
        });
    } catch (error) {
        // Validation error from Zod
        if (error.name === 'ZodError') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                error: ERROR_MESSAGES.VALIDATION_FAILED,
                details: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        // Business logic errors
        if (error.message === ERROR_MESSAGES.EMAIL_ALREADY_EXISTS ||
            error.message === ERROR_MESSAGES.USERNAME_ALREADY_EXISTS) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                error: error.message,
            });
        }

        console.error('Registration error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.REGISTRATION_ERROR,
        });
    }
};

/**
 * Login a user
 * @route POST /login
 */
const login = async (req, res) => {
    try {
        // Validate input
        const validatedData = loginSchema.parse(req.body);

        // Call service layer
        const result = await authService.login(validatedData);

        return res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
        // Validation error from Zod
        if (error.name === 'ZodError') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                error: ERROR_MESSAGES.VALIDATION_FAILED,
                details: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        // Invalid credentials
        if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: error.message,
            });
        }

        console.error('Login error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.LOGIN_ERROR,
        });
    }
};

/**
 * Health check endpoint
 * @route GET /me
 */
const healthCheck = async (req, res) => {
    return res.status(HTTP_STATUS.OK).json({
        message: 'Auth service is healthy',
        timestamp: new Date().toISOString(),
    });
};

module.exports = {
    register,
    login,
    healthCheck,
};
