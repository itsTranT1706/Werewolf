const { z } = require('zod');

/**
 * Validation schema for user registration
 */
const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must not exceed 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z
        .string()
        .email('Invalid email format'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must not exceed 100 characters'),
});

/**
 * Validation schema for user login
 */
const loginSchema = z.object({
    emailOrUsername: z
        .string()
        .min(1, 'Email or username is required'),
    password: z
        .string()
        .min(1, 'Password is required'),
});

module.exports = {
    registerSchema,
    loginSchema,
};
