const prisma = require('../_config/prisma');

const Category = {
    create: async (name) => {
        const cleanName = String(name || '').trim();
        const result = await prisma.category.create({
            data: { name: cleanName }
        });
        return result.id;
    },

    findByName: async (name) => {
        const cleanName = String(name || '').trim().toLowerCase();
        const categories = await prisma.category.findMany();
        return categories.find(c => (c.name || '').toLowerCase() === cleanName) || null;
    },

    getAll: async () => {
        return await prisma.category.findMany({
            orderBy: { id: 'asc' }
        });
    },

    update: async (id, name) => {
        const cleanName = String(name || '').trim();
        await prisma.category.update({
            where: { id: parseInt(id, 10) },
            data: { name: cleanName }
        });
        return 1;
    },

    delete: async (id) => {
        await prisma.category.delete({
            where: { id: parseInt(id, 10) }
        });
        return 1;
    }
};

module.exports = Category;
