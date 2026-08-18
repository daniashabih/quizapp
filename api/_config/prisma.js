const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const globalForPrisma = global;

/**
 * Initialize a singleton PrismaClient with connection reliability.
 */
function getPrismaClient() {
    if (!globalForPrisma.prisma) {
        if (!process.env.DATABASE_URL) {
            console.error('❌ [Database Configuration Error] DATABASE_URL is not defined in environment variables.');
        }

        globalForPrisma.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
            errorFormat: 'minimal',
        });

        console.log('✅ [Database] PrismaClient initialized for PostgreSQL.');
    }

    return globalForPrisma.prisma;
}

const prisma = getPrismaClient();

module.exports = prisma;

