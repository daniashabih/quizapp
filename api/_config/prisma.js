const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const globalForPrisma = global;

/**
 * Initialize a singleton PrismaClient with connection reliability.
 */
function getPrismaClient() {
    if (!globalForPrisma.prisma) {
        if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('postgres')) {
            process.env.DATABASE_URL = 'file:./dev.db';
        }

        globalForPrisma.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
            errorFormat: 'minimal',
        });

        console.log('✅ [Database] PrismaClient initialized for SQLite.');
    }

    return globalForPrisma.prisma;
}

const prisma = getPrismaClient();

module.exports = prisma;

