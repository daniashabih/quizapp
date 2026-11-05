const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');

const CATEGORY_NAME = 'SEO';

async function seed() {
    console.log('================================================================');
    console.log('       SEEDING SEO QUIZ - ALL 8 SESSIONS (442 MCQs)             ');
    console.log('================================================================\n');

    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI environment variable is not defined.');
        console.error('👉 If you are syncing directly to the live server, use:');
        console.error('   npm run sync:seo-live\n');
        process.exit(1);
    }

    try {
        // Step 1: Ensure Category Exists
        let category = await prisma.category.findFirst({
            where: {
                OR: [
                    { name: { equals: CATEGORY_NAME, mode: 'insensitive' } },
                    { name: { equals: 'Search Engine Optimization', mode: 'insensitive' } }
                ]
            }
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: CATEGORY_NAME, isEnabled: true }
            });
            console.log(`✅ Created Category: "${category.name}" (ID: ${category.id})`);
        } else {
            console.log(`✔ Category already exists: "${category.name}" (ID: ${category.id}).`);
        }

        const effectiveCategoryName = category.name;
        let totalInserted = 0;
        let totalUpdated = 0;

        for (let s = 1; s <= 8; s++) {
            const jsonFile = path.resolve(__dirname, `seo_session${s}.json`);
            if (!fs.existsSync(jsonFile)) {
                console.error(`File missing: ${jsonFile}`);
                continue;
            }

            const sessionData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
            const questions = sessionData.questions;
            console.log(`\n📂 Processing Session ${s}: "${sessionData.title}" (${questions.length} questions)...`);

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const existing = await prisma.question.findFirst({
                    where: {
                        category: effectiveCategoryName,
                        session: s,
                        questionText: q.questionText
                    }
                });

                if (!existing) {
                    await prisma.question.create({
                        data: {
                            category: effectiveCategoryName,
                            session: s,
                            questionText: q.questionText,
                            options: JSON.stringify(q.options),
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation || ''
                        }
                    });
                    totalInserted++;
                } else {
                    await prisma.question.update({
                        where: { id: existing.id },
                        data: {
                            options: JSON.stringify(q.options),
                            correctAnswer: q.correctAnswer,
                            session: s,
                            explanation: q.explanation || ''
                        }
                    });
                    totalUpdated++;
                }
            }
            console.log(`✔ Session ${s} processed.`);
        }

        const totalCount = await prisma.question.count({
            where: { category: effectiveCategoryName }
        });

        console.log('\n================================================================');
        console.log(`🎉 COMPLETED LOCAL SEEDING:`);
        console.log(`   - Category: "${effectiveCategoryName}"`);
        console.log(`   - Newly Inserted: ${totalInserted}`);
        console.log(`   - Updated Existing: ${totalUpdated}`);
        console.log(`   - Total SEO Questions in DB: ${totalCount}`);
        console.log('================================================================\n');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
