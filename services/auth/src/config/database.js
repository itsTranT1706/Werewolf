const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created
 */
class Database {
    constructor() {
        if (!Database.instance) {
            this.prisma = new PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            });
            Database.instance = this;
        }
        return Database.instance;
    }

    getClient() {
    getClient() {
        return this.prisma;
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}

const database = new Database();
Object.freeze(database);

module.exports = database.getClient();
