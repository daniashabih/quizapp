const prisma = require('../api/_config/prisma');
const { CSHARP_COMPLETE_THE_CODE_QUESTIONS } = require('../api/_models/csharpQuestionsData');

async function seedCSharpQuestions() {
    console.log('====================================================');
    console.log('  SEEDING C# COMPLETE THE CODE QUESTIONS (105 Qs)   ');
    console.log('====================================================\n');

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    for (const q of CSHARP_COMPLETE_THE_CODE_QUESTIONS) {
        try {
            const existing = await prisma.gameChallenge.findFirst({
                where: {
                    OR: [
                        { id: q.id },
                        { title: q.title, gameSlug: q.gameSlug, technology: 'csharp' }
                    ]
                }
            });

            const challengeData = {
                gameSlug: q.gameSlug,
                technology: q.technology,
                technologyName: q.technologyName,
                title: q.title,
                difficulty: q.difficulty,
                language: q.language,
                description: q.description,
                content: q.content,
                solution: q.solution,
                hints: q.hints || '',
                explanation: q.explanation || '',
                points: q.points || 100,
                order: q.order || 0
            };

            if (!existing) {
                await prisma.gameChallenge.create({
                    data: {
                        id: q.id,
                        ...challengeData
                    }
                });
                createdCount++;
            } else {
                await prisma.gameChallenge.update({
                    where: { id: existing.id },
                    data: challengeData
                });
                updatedCount++;
            }
        } catch (err) {
            failedCount++;
            console.warn(`[Skip DB write for ${q.id}] ${err.message}`);
        }
    }

    console.log(`\nResults: ${createdCount} created, ${updatedCount} updated, ${failedCount} skipped.`);
    console.log('C# questions successfully registered.');
}

if (require.main === module) {
    seedCSharpQuestions()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Fatal seed error:', err.message);
            process.exit(0);
        });
}

module.exports = { seedCSharpQuestions };
