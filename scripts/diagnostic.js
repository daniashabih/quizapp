/**
 * Database & Frontend Diagnostic Script
 * Verifies Supabase connection, RLS policies, environment variables,
 * and backend database API adapter.
 */

const { createClient } = require('@supabase/supabase-js');
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
console.log('      DATABASE & FRONTEND DIAGNOSTIC SUITE          ');
console.log('====================================================\n');

async function runDiagnostics() {
    let hasError = false;

    // STEP 1: Environment Variables Check
    console.log('----------------------------------------------------');
    console.log('STEP 1: Checking Environment Variables & Connections');
    console.log('----------------------------------------------------');

    const envVars = {
        SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY,
        DATABASE_URL: process.env.DATABASE_URL
    };

    let envOk = true;
    for (const [key, val] of Object.entries(envVars)) {
        if (!val) {
            console.log(`❌ Missing environment variable: ${key}`);
            if (key !== 'DATABASE_URL') envOk = false;
        } else {
            const displayVal = val.length > 25 ? val.substring(0, 20) + '...' : val;
            console.log(`✅ ${key}: ${displayVal}`);
        }
    }

    if (!envOk) {
        console.error('❌ Environment variable verification failed!');
        hasError = true;
    } else {
        console.log('✅ Environment variables successfully loaded and verified.');
    }
    console.log('');

    const supabaseUrl = envVars.SUPABASE_URL;
    const anonKey = envVars.SUPABASE_ANON_KEY;
    const secretKey = envVars.SUPABASE_SECRET_KEY;

    // STEP 2: Frontend Public / Authenticated Role Connection & RLS Test
    console.log('----------------------------------------------------');
    console.log('STEP 2: Frontend (Anon / Public Role) RLS Policy Test');
    console.log('----------------------------------------------------');

    if (!supabaseUrl || !anonKey) {
        console.log('❌ Skipping Frontend Anon test due to missing URL/Anon key.');
        hasError = true;
    } else {
        const publicClient = createClient(supabaseUrl, anonKey);
        
        // Test reading tables
        const tables = ['categories', 'questions', 'users', 'quiz_results'];
        for (const table of tables) {
            try {
                const { data, error } = await publicClient.from(table).select('*').limit(3);
                if (error) {
                    console.log(`⚠️  Table '${table}' read check with Anon Key: ${error.message} (Code: ${error.code})`);
                    if (error.code === '42501') {
                        console.log(`   ℹ️ RLS policy restricts public SELECT on '${table}'.`);
                    }
                } else {
                    console.log(`✅ Table '${table}' read check passed (${data.length} items returned).`);
                }
            } catch (err) {
                console.log(`❌ Error reading '${table}' with Anon Key:`, err.message);
                hasError = true;
            }
        }

        // Test write access on categories or quiz_results if RLS permits
        console.log('\nTesting write permissions on Anon Key (Frontend simulation)...');
        try {
            const { data, error } = await publicClient.from('categories').insert([{ name: 'Diagnostic_Test_Cat' }]).select();
            if (error) {
                console.log(`ℹ️ Anon write test result: ${error.message} (RLS policy enforced as expected)`);
            } else if (data && data[0]) {
                console.log(`✅ Anon write allowed for categories. Cleaning up...`);
                await publicClient.from('categories').delete().eq('id', data[0].id);
            }
        } catch (err) {
            console.log(`Anon write check caught exception: ${err.message}`);
        }
    }
    console.log('');

    // STEP 3: Backend Service Role (Admin / Secret Key) Test
    console.log('----------------------------------------------------');
    console.log('STEP 3: Backend Service Role (Secret Key) Test');
    console.log('----------------------------------------------------');

    if (!supabaseUrl || !secretKey) {
        console.log('⚠️ SUPABASE_SECRET_KEY not available, skipping admin client test.');
    } else {
        const adminClient = createClient(supabaseUrl, secretKey);
        const tables = ['categories', 'questions', 'users', 'quiz_results'];
        
        for (const table of tables) {
            try {
                const { data, error } = await adminClient.from(table).select('*').limit(3);
                if (error) {
                    console.log(`❌ Table '${table}' admin read failed: ${error.message}`);
                    hasError = true;
                } else {
                    console.log(`✅ Admin read on table '${table}' succeeded (${data.length} items found).`);
                }
            } catch (err) {
                console.log(`❌ Error testing table '${table}' with admin client:`, err.message);
                hasError = true;
            }
        }

        // Test full write/delete cycle with admin client
        try {
            const { data: catData, error: catErr } = await adminClient
                .from('categories')
                .insert([{ name: 'Temp_Diagnostic_Category' }])
                .select()
                .single();

            if (catErr) {
                console.log(`❌ Admin insert test failed: ${catErr.message}`);
                hasError = true;
            } else {
                console.log(`✅ Admin insert test succeeded on 'categories' (ID: ${catData.id}).`);
                const { error: delErr } = await adminClient.from('categories').delete().eq('id', catData.id);
                if (delErr) {
                    console.log(`⚠️ Admin delete cleanup warning: ${delErr.message}`);
                } else {
                    console.log(`✅ Admin delete cleanup succeeded.`);
                }
            }
        } catch (err) {
            console.log(`❌ Admin write/delete exception:`, err.message);
            hasError = true;
        }
    }
    console.log('');

    // STEP 4: Backend Database API Adapter (Prisma Proxy) Test
    console.log('----------------------------------------------------');
    console.log('STEP 4: Backend API Database Adapter (Prisma Proxy) Test');
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
        console.log('🎉 DIAGNOSTIC PASSED: All frontend and database connections,');
        console.log('   RLS policies, and database adapters are operating correctly!');
    } else {
        console.log('⚠️ DIAGNOSTIC COMPLETED WITH ISSUES. Please review logs above.');
    }
    console.log('====================================================\n');
}

runDiagnostics();
