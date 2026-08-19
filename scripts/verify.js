const prisma = require('../api/_config/prisma');

async function check() {
    const cats = await prisma.category.findMany();
    console.log('Categories:', cats.map(c => c.name));
    const questions = await prisma.question.findMany({
        where: { category: { equals: 'Agile and DevOps', mode: 'insensitive' } }
    });
    console.log('Agile and DevOps total questions:', questions.length);
    console.log('Sessions in Agile and DevOps:', [...new Set(questions.map(q => q.session))]);
    await prisma.$disconnect();
}

check();
