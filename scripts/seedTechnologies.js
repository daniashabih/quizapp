const prisma = require('../api/_config/prisma');

const INITIAL_TECHNOLOGIES = [
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Angular',
    'Vue',
    'Node.js',
    'Express.js',
    'MongoDB',
    'SQL',
    'PHP',
    'Laravel',
    'Python',
    'Django',
    'Flutter',
    'Dart',
    'Git',
    'GitHub',
    'Tailwind CSS',
    'Bootstrap',
    'WordPress',
    'Docker'
];

async function seedTechnologies() {
    try {
        console.log('====================================================');
        console.log('       SEEDING INITIAL TECHNOLOGIES                 ');
        console.log('====================================================\n');

        let createdCount = 0;
        let existingCount = 0;

        for (const techName of INITIAL_TECHNOLOGIES) {
            const cleanName = techName.trim();
            const existing = await prisma.category.findFirst({
                where: { name: { equals: cleanName } }
            });

            if (!existing) {
                const created = await prisma.category.create({
                    data: { name: cleanName }
                });
                console.log(`  ➕ Created technology: "${cleanName}" (ID: ${created.id})`);
                createdCount++;
            } else {
                console.log(`  ✔ Technology already exists: "${cleanName}" (ID: ${existing.id})`);
                existingCount++;
            }
        }

        console.log('\n====================================================');
        console.log('🎉 TECHNOLOGIES SEED COMPLETE:');
        console.log(`   - New technologies created: ${createdCount}`);
        console.log(`   - Existing technologies kept: ${existingCount}`);
        console.log(`   - Total technologies available: ${createdCount + existingCount}`);
        console.log('====================================================\n');

    } catch (error) {
        console.error('❌ Failed to seed technologies:', error);
        process.exit(1);
    }
}

seedTechnologies();
