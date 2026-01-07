const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/jwt');
const profileService = require('./profileService');
const ERROR_MESSAGES = require('../constants/errorMessages');

/**
 * Auth Service
 * Contains business logic for authentication
 */
class AuthService {
    /**
     * Register a new user
     */
    async register(userData) {
        const { username, email, password } = userData;

        // Check if user already exists
        const existingUser = await userRepository.findExistingUser(email, username);

        if (existingUser) {
            if (existingUser.email === email) {
                throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
            }
            if (existingUser.username === username) {
                throw new Error(ERROR_MESSAGES.USERNAME_ALREADY_EXISTS);
            }
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await userRepository.create({
            username,
            email,
            password: hashedPassword,
        });

        // Initialize user profile in profile service (non-blocking)
        profileService.initializeProfile({
            id: user.id,  // Profile service expects 'id' not 'userId'
            username: user.username,
            email: user.email,
        }).catch((error) => {
            console.error('[PROFILE ERROR]', error.message);
        });

        return {
            userId: user.id,
        };
    }

    /**
     * Login a user
     */
    async login(credentials) {
        const { emailOrUsername, password } = credentials;

        // Find user by email or username
        const user = await userRepository.findByEmailOrUsername(emailOrUsername);

        if (!user) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            username: user.username,
        });

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }
}

module.exports = new AuthService();
