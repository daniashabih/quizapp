const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');

const CATEGORY_NAME = 'SQL Server';
const SESSION_NUMBER = 5;

const sessionData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'sql_server_session5.json'), 'utf8'));
const questions = sessionData.questions;

async function seed() {
    console.log('================================================================');
    console.log(`  UPLOADING ${questions.length} MCQS TO: "${CATEGORY_NAME}" (Session ${SESSION_NUMBER})`);
    console.log('================================================================\n');

    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not set in your environment or .env file.');
        console.error('👉 Please ensure your .env or .env.local file contains:');
        console.error('   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/HangBug?retryWrites=true&w=majority"\n');
        process.exit(1);
    }

    try {
        // Step 1: Ensure Category Exists
        let category = await prisma.category.findFirst({
            where: {
                name: { equals: CATEGORY_NAME, mode: 'insensitive' }
            }
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: CATEGORY_NAME }
            });
            console.log(`✅ Created Category: "${category.name}" (ID: ${category.id})`);
        } else {
            console.log(`✔ Found Category: "${category.name}" (ID: ${category.id})`);
        }

        const effectiveCategoryName = category.name;

        // Step 2: Insert / Upsert Questions
        let inserted = 0;
        let updated = 0;

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const existing = await prisma.question.findFirst({
                where: {
                    category: effectiveCategoryName,
                    session: SESSION_NUMBER,
                    questionText: q.questionText,
                    correctAnswer: q.correctAnswer
                }
            });

            if (!existing) {
                await prisma.question.create({
                    data: {
                        category: effectiveCategoryName,
                        session: SESSION_NUMBER,
                        questionText: q.questionText,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer
                    }
                });
                console.log(`  [${i + 1}/${questions.length}] ➕ Inserted: "${q.questionText.substring(0, 50)}..."`);
                inserted++;
            } else {
                await prisma.question.update({
                    where: { id: existing.id },
                    data: {
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        session: SESSION_NUMBER
                    }
                });
                console.log(`  [${i + 1}/${questions.length}] 🔄 Updated: "${q.questionText.substring(0, 50)}..."`);
                updated++;
            }
        }

        const totalCount = await prisma.question.count({
            where: {
                category: effectiveCategoryName,
                session: SESSION_NUMBER
            }
        });

        console.log('\n================================================================');
        console.log(`🎉 COMPLETED:`);
        console.log(`   - Track: "${effectiveCategoryName}"`);
        console.log(`   - Session: ${SESSION_NUMBER}`);
        console.log(`   - Newly Inserted: ${inserted}`);
        console.log(`   - Updated Existing: ${updated}`);
        console.log(`   - Total Session 5 Questions in DB: ${totalCount}`);
        console.log('================================================================\n');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
