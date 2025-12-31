const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../validators/authValidators');

const prisma = new PrismaClient();

/**
 * Register a new user
 * @route POST /register
 */
const register = async (req, res) => {
    try {
        // Validate input
        const validatedData = registerSchema.parse(req.body);
        const { username, email, password } = validatedData;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    error: 'Email already exists',
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    error: 'Username already exists',
                });
            }
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });

        return res.status(201).json({
            message: 'User created successfully',
            userId: user.id,
        });
    } catch (error) {
        // Validation error from Zod
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        console.error('Registration error:', error);
        return res.status(500).json({
            error: 'Internal server error during registration',
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
        const { emailOrUsername, password } = validatedData;

        // Find user by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername },
                ],
            },
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
            });
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            username: user.username,
        });

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        });
    } catch (error) {
        // Validation error from Zod
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Internal server error during login',
        });
    }
};

/**
 * Health check endpoint
 * @route GET /me
 */
const healthCheck = async (req, res) => {
    return res.status(200).json({
        message: 'Auth service is healthy',
        timestamp: new Date().toISOString(),
    });
};

module.exports = {
    register,
    login,
    healthCheck,
};
