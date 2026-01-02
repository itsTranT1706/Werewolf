const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client Singleton with connection retry
 * Ensures only one instance of Prisma Client is created
 */
class Database {
    constructor() {
        if (!Database.instance) {
            this.prisma = new PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL,
                    },
                },
            });
            
            // Handle connection errors and reconnect
            this.prisma.$on('error', (e) => {
                console.error('Prisma error:', e);
            });

            Database.instance = this;
        }
        return Database.instance;
    }

    getClient() {
        return this.prisma;
    }

    async connect() {
        try {
            await this.prisma.$connect();
            console.log('✅ Database connected');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            // Retry after 5 seconds
            setTimeout(() => this.connect(), 5000);
        }
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}

const database = new Database();
Object.freeze(database);

module.exports = database.getClient();
