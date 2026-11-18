const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

let prisma;
try {
    prisma = require('../api/_config/prisma');
} catch (e) {
    console.warn('Prisma client not initialized:', e.message);
}

const quizData = require('./php_xml_json_laravel_mysql_javascript_session1.json');
const CATEGORY_NAME = quizData.category || 'PHP, XML JSON, Laravel, MySQL, JavaScript';
const SESSION_NUMBER = quizData.session || 1;
const questions = quizData.questions;

function normalizeQuestionKey(text) {
    return String(text || '')
        .trim()
        .toLowerCase()
        .replace(/_+/g, '_')
        .replace(/\s+/g, ' ');
}

async function seed() {
    if (!prisma) {
        console.error('Prisma client unavailable. Use sync script to sync to live server.');
        return;
    }

    console.log('================================================================');
    console.log(`  SEEDING ${questions.length} MCQS TO: "${CATEGORY_NAME}" (Session ${SESSION_NUMBER})`);
    console.log('================================================================\n');

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
        const allExisting = await prisma.question.findMany({
            where: { category: effectiveCategoryName }
        });
        const existingByKey = new Map();
        for (const row of allExisting) {
            const key = normalizeQuestionKey(row.questionText);
            if (!existingByKey.has(key)) {
                existingByKey.set(key, row);
            }
        }

        // Step 2: Insert / Upsert / Move Questions into Session 1
        let inserted = 0;
        let updated = 0;
        let moved = 0;

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const key = normalizeQuestionKey(q.questionText);
            const existing = existingByKey.get(key);

            if (!existing) {
                const created = await prisma.question.create({
                    data: {
                        category: effectiveCategoryName,
                        session: SESSION_NUMBER,
                        questionText: q.questionText,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || ''
                    }
                });
                existingByKey.set(key, created);
                console.log(`  [${i + 1}/${questions.length}] ➕ Inserted: "${q.questionText.substring(0, 50)}..."`);
                inserted++;
            } else {
                const wasDifferentSession = (existing.session || 1) !== SESSION_NUMBER;
                await prisma.question.update({
                    where: { id: existing.id },
                    data: {
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || existing.explanation || '',
                        session: SESSION_NUMBER
                    }
                });
                if (wasDifferentSession) {
                    console.log(`  [${i + 1}/${questions.length}] 🔄 Moved from Session ${existing.session || 1} -> Session ${SESSION_NUMBER}: "${q.questionText.substring(0, 45)}..."`);
                    moved++;
                } else {
                    updated++;
                }
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
        console.log(`   - Moved to Session ${SESSION_NUMBER}: ${moved}`);
        console.log(`   - Updated Existing: ${updated}`);
        console.log(`   - Total Session ${SESSION_NUMBER} Questions in DB: ${totalCount}`);
        console.log('================================================================\n');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
}

if (require.main === module) {
    seed();
}

module.exports = { questions, CATEGORY_NAME, SESSION_NUMBER, normalizeQuestionKey, seed };
