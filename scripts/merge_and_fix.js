const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');

const TARGET_CATEGORY = 'Agile and DevOps';
const OLD_CATEGORY = 'Agile - Paradigm Shift in SDLC';

async function main() {
    console.log('Connecting to database...');

    // 1. Check all categories
    const categories = await prisma.category.findMany();
    console.log('Current categories:', categories.map(c => ({ id: c.id, name: c.name })));

    // 2. Ensure "Agile and DevOps" category exists
    let targetCat = await prisma.category.findFirst({
        where: { name: { equals: TARGET_CATEGORY, mode: 'insensitive' } }
    });
    if (!targetCat) {
        targetCat = await prisma.category.create({ data: { name: TARGET_CATEGORY } });
        console.log(`Created category: ${targetCat.name}`);
    } else {
        console.log(`Found target category: ${targetCat.name}`);
    }

    // 3. Find questions under old category "Agile - Paradigm Shift in SDLC"
    const oldQuestions = await prisma.question.findMany({
        where: { category: { equals: OLD_CATEGORY, mode: 'insensitive' } }
    });
    console.log(`Found ${oldQuestions.length} questions in "${OLD_CATEGORY}".`);

    // 4. Update all old questions to target category "Agile and DevOps", session 1
    for (const q of oldQuestions) {
        // Check if question with same questionText already exists in TARGET_CATEGORY
        const existingInTarget = await prisma.question.findFirst({
            where: {
                category: { equals: TARGET_CATEGORY, mode: 'insensitive' },
                questionText: q.questionText
            }
        });

        if (existingInTarget) {
            // Update it to session 1
            await prisma.question.update({
                where: { id: existingInTarget.id },
                data: {
                    category: targetCat.name,
                    session: 1,
                    options: q.options,
                    correctAnswer: q.correctAnswer
                }
            });
            // If it's a separate record, delete old
            if (existingInTarget.id !== q.id) {
                await prisma.question.delete({ where: { id: q.id } });
            }
        } else {
            // Move to target category and session 1
            await prisma.question.update({
                where: { id: q.id },
                data: {
                    category: targetCat.name,
                    session: 1
                }
            });
        }
    }

    // 5. Also ensure all existing questions in "Agile and DevOps" have session: 1
    const allTargetQuestions = await prisma.question.findMany({
        where: { category: { equals: TARGET_CATEGORY, mode: 'insensitive' } }
    });
    console.log(`Updating all ${allTargetQuestions.length} questions in "${targetCat.name}" to session: 1...`);
    await prisma.question.updateMany({
        where: { category: { equals: TARGET_CATEGORY, mode: 'insensitive' } },
        data: { session: 1 }
    });

    // 6. Delete old category "Agile - Paradigm Shift in SDLC"
    const oldCat = await prisma.category.findFirst({
        where: { name: { equals: OLD_CATEGORY, mode: 'insensitive' } }
    });
    if (oldCat) {
        await prisma.category.delete({ where: { id: oldCat.id } });
        console.log(`🗑️ Deleted old category "${OLD_CATEGORY}".`);
    }

    // 7. Verify counts
    const finalQuestions = await prisma.question.findMany({
        where: { category: { equals: TARGET_CATEGORY, mode: 'insensitive' } }
    });
    console.log(`\n✅ Final count in "${targetCat.name}" (Session 1): ${finalQuestions.length} questions.`);

    const remainingCategories = await prisma.category.findMany();
    console.log('Categories now in DB:', remainingCategories.map(c => c.name));

    await prisma.$disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
