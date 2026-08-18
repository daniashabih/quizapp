/**
 * Database & Backend Diagnostic Script
 * Verifies environment variables and backend database API adapter.
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local if present, fallback to .env
if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

console.log('====================================================');
console.log('         DATABASE DIAGNOSTIC SUITE                  ');
console.log('====================================================\n');

async function runDiagnostics() {
    let hasError = false;

    // STEP 1: Environment Variables Check
    console.log('----------------------------------------------------');
    console.log('STEP 1: Checking Environment Variables & Connections');
    console.log('----------------------------------------------------');

    const envVars = {
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET
    };

    for (const [key, val] of Object.entries(envVars)) {
        if (!val) {
            console.log(`ℹ️ Optional / missing environment variable: ${key}`);
        } else {
            if (key === 'MONGODB_URI') {
                const masked = val.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
                console.log(`✅ ${key}: configured (${masked})`);
            } else {
                const displayVal = val.length > 25 ? val.substring(0, 20) + '...' : val;
                console.log(`✅ ${key}: ${displayVal}`);
            }
        }
    }
    console.log('✅ Environment variables check completed.\n');

    // STEP 2: Backend Database API Adapter (Prisma Proxy) Test
    console.log('----------------------------------------------------');
    console.log('STEP 2: Backend API Database Adapter (Prisma Proxy) Test');
    console.log('----------------------------------------------------');

    try {
        const prisma = require('../api/_config/prisma');

        const categories = await prisma.category.findMany();
        console.log(`✅ Prisma Adapter: Found ${categories.length} categories.`);

        const questions = await prisma.question.findMany();
        console.log(`✅ Prisma Adapter: Found ${questions.length} questions.`);

        const users = await prisma.user.findMany();
        console.log(`✅ Prisma Adapter: Found ${users.length} users.`);

        const quizResults = await prisma.quizResult.findMany();
        console.log(`✅ Prisma Adapter: Found ${quizResults.length} quiz results.`);

        // Perform test CRUD cycle on user model
        const testEmail = `diag_${Date.now()}@example.com`;
        const testUser = await prisma.user.create({
            data: {
                name: 'Diagnostic User',
                email: testEmail,
                password: 'hashedpassword',
                role: 'candidate'
            }
        });
        console.log(`✅ Prisma Adapter CRUD Create succeeded (User ID: ${testUser.id}).`);

        const foundUser = await prisma.user.findUnique({ where: { email: testEmail } });
        if (foundUser) {
            console.log(`✅ Prisma Adapter CRUD Read succeeded for user ${foundUser.email}.`);
        } else {
            console.log(`❌ Prisma Adapter CRUD Read failed to find created user.`);
            hasError = true;
        }

        await prisma.user.delete({ where: { id: testUser.id } });
        console.log(`✅ Prisma Adapter CRUD Delete succeeded for test user.`);

    } catch (err) {
        console.log(`❌ Database Adapter test failed:`, err.message);
        hasError = true;
    }
    console.log('');

    // DIAGNOSTIC SUMMARY
    console.log('====================================================');
    if (!hasError) {
        console.log('🎉 DIAGNOSTIC PASSED: All database connections and');
        console.log('   adapters are operating correctly!');
    } else {
        console.log('⚠️ DIAGNOSTIC COMPLETED WITH ISSUES. Please review logs above.');
    }
    console.log('====================================================\n');
}

runDiagnostics();
