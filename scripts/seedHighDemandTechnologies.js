const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');
const Question = require('../api/_models/questionModel');
const {
    HIGH_DEMAND_TECH_NAMES,
    getHighDemandPackName,
    getHighDemandPack
} = require('../api/_models/techQuestions');

function parseTargetCategories() {
    const arg = process.argv.find(a => a.startsWith('--tech='));
    if (!arg) return HIGH_DEMAND_TECH_NAMES;
    const raw = arg.slice('--tech='.length).split(',').map(s => s.trim()).filter(Boolean);
    const resolved = raw.map(r => getHighDemandPackName(r)).filter(Boolean);
    return resolved.length > 0 ? Array.from(new Set(resolved)) : HIGH_DEMAND_TECH_NAMES;
}

async function seedHighDemand() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI environment variable is not defined.');
        console.error('👉 To sync directly to the live server API, run:');
        console.error('   npm run sync:high-demand-live\n');
        process.exit(1);
    }

    const targets = parseTargetCategories();
    console.log('================================================================');
    console.log(`  SEEDING HIGH-DEMAND TECHNOLOGIES (${targets.length} tracks)`);
    console.log('================================================================\n');

    let totalInserted = 0;
    let totalSkipped = 0;

    try {
        for (const techName of targets) {
            const pack = getHighDemandPack(techName);
            if (!pack.length) continue;

            let category = await prisma.category.findFirst({
                where: { name: { equals: techName, mode: 'insensitive' } }
            });

            if (!category) {
                category = await prisma.category.create({
                    data: { name: techName, isEnabled: true }
                });
                console.log(`  ➕ Created category "${category.name}"`);
            } else if (category.isEnabled === false) {
                category = await prisma.category.update({
                    where: { id: category.id },
                    data: { isEnabled: true }
                });
                console.log(`  ✔ Re-enabled category "${category.name}"`);
            }

            const existingRows = await prisma.question.findMany({
                where: { category: { equals: category.name, mode: 'insensitive' } },
                select: { questionText: true }
            });
            const seenNorm = new Set(
                existingRows.map(r => Question.normalizeQuestionText(r.questionText))
            );

            let inserted = 0;
            let skipped = 0;
            for (const q of pack) {
                const norm = Question.normalizeQuestionText(q.questionText);
                if (!norm || seenNorm.has(norm)) {
                    skipped++;
                    continue;
                }
                await prisma.question.create({
                    data: {
                        category: category.name,
                        session: q.session || 1,
                        sessionTitle: q.sessionTitle || '',
                        topic: q.topic || '',
                        difficulty: q.difficulty || 'beginner',
                        questionText: q.questionText,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || ''
                    }
                });
                seenNorm.add(norm);
                inserted++;
            }

            totalInserted += inserted;
            totalSkipped += skipped;
            console.log(`  ✅ ${category.name.padEnd(16)} -> inserted: ${inserted}, skipped duplicates: ${skipped}`);
        }

        console.log('\n================================================================');
        console.log(`🎉 COMPLETE: Inserted ${totalInserted} questions (${totalSkipped} duplicates skipped).`);
        console.log('================================================================\n');
    } catch (err) {
        console.error('❌ Failed seeding high-demand technologies:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedHighDemand();
