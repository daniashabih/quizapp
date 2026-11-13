// scripts/seedAgileDevOpsQuestions.js
const prisma = require('../api/_config/prisma');
const { AGILE_DEVOPS_QUESTIONS, AGILE_DEVOPS_SESSIONS } = require('../api/_models/agileDevopsQuestionsData.js');

async function seedAgileDevops() {
    console.log('====================================================');
    console.log('   SEEDING AGILE & DEVOPS QUESTIONS (16 SESSIONS)   ');
    console.log('====================================================\n');

    try {
        // 1. Ensure Categories exist in MongoDB
        const categoryNames = ['Agile and DevOps', 'Agile & DevOps'];
        for (const catName of categoryNames) {
            const existingCat = await prisma.category.findFirst({
                where: { name: { equals: catName } }
            });
            if (!existingCat) {
                await prisma.category.create({
                    data: {
                        name: catName,
                        isEnabled: true
                    }
                });
                console.log(`✓ Created category: "${catName}"`);
            } else {
                await prisma.category.update({
                    where: { id: existingCat.id },
                    data: { isEnabled: true }
                });
                console.log(`✓ Ensured category is enabled: "${catName}"`);
            }
        }

        console.log(`\nInserting/Updating ${AGILE_DEVOPS_QUESTIONS.length} questions across 16 sessions...`);
        let inserted = 0;
        let updated = 0;

        for (const q of AGILE_DEVOPS_QUESTIONS) {
            const existing = await prisma.question.findFirst({
                where: {
                    category: { in: ['Agile and DevOps', 'Agile & DevOps'] },
                    questionText: { equals: q.questionText }
                }
            });

            const serializedOptions = JSON.stringify(q.options);

            if (!existing) {
                await prisma.question.create({
                    data: {
                        category: q.category,
                        session: q.session,
                        questionText: q.questionText,
                        options: serializedOptions,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || ''
                    }
                });
                inserted++;
            } else {
                await prisma.question.update({
                    where: { id: existing.id },
                    data: {
                        category: q.category,
                        session: q.session,
                        options: serializedOptions,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || ''
                    }
                });
                updated++;
            }
        }

        console.log('\n====================================================');
        console.log('🎉 AGILE & DEVOPS SEED COMPLETE:');
        console.log(`   - Total questions: ${AGILE_DEVOPS_QUESTIONS.length}`);
        console.log(`   - Inserted: ${inserted}`);
        console.log(`   - Updated: ${updated}`);
        console.log('====================================================\n');

    } catch (error) {
        console.error('❌ Database seeding encountered error:', error.message);
        console.log('ℹ Note: If running locally without Atlas network connectivity, the in-memory fallback will automatically provide full functionality.');
    }
}

seedAgileDevops();
