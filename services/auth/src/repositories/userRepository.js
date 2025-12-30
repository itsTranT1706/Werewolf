const prisma = require('../config/database');

/**
 * User Repository
 * Handles all database operations related to users
 */
class UserRepository {
    /**
     * Find user by email
     */
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find user by username
     */
    async findByUsername(username) {
        return await prisma.user.findUnique({
            where: { username },
        });
    }

    /**
     * Find user by email or username
     */
    async findByEmailOrUsername(emailOrUsername) {
        return await prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername },
                ],
            },
        });
    }

    /**
     * Check if user exists by email or username
     */
    async findExistingUser(email, username) {
        return await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });
    }

    /**
     * Create a new user
     */
    async create(userData) {
        return await prisma.user.create({
            data: userData,
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });
    }

    /**
     * Find user by ID
     */
    async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });
    }
}

module.exports = new UserRepository();
