const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const globalForPrisma = global;

/**
 * Initialize a singleton PrismaClient with connection reliability for MongoDB Atlas & Vercel serverless.
 */
function getPrismaClient() {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
            errorFormat: 'minimal',
        });
    }

    return globalForPrisma.prisma;
}

const prisma = getPrismaClient();

module.exports = prisma;


