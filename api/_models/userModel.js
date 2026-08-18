const prisma = require('../_config/prisma');

const User = {
    create: async (name, email, password, role = 'candidate') => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const cleanName = String(name || '').trim();
        const result = await prisma.user.create({
            data: {
                name: cleanName,
                email: cleanEmail,
                password,
                role: role || 'candidate'
            }
        });
        return result.id;
    },

    findByEmail: async (email) => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email: cleanEmail }
        });
        if (!user) return null;
        return {
            ...user,
            created_at: user.createdAt,
            reset_token: user.resetToken,
            reset_token_expiry: user.resetTokenExpiry
        };
    },

    findById: async (id) => {
        const user = await prisma.user.findUnique({
            where: { id: String(id) },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        if (!user) return null;
        return {
            ...user,
            created_at: user.createdAt
        };
    },

    getAll: async () => {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        return users.map(u => ({
            ...u,
            created_at: u.createdAt
        }));
    },

    update: async (id, name, email) => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const cleanName = String(name || '').trim();
        await prisma.user.update({
            where: { id: String(id) },
            data: { name: cleanName, email: cleanEmail }
        });
        return 1;
    },

    setResetToken: async (email, token, expiry) => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        await prisma.user.update({
            where: { email: cleanEmail },
            data: {
                resetToken: token,
                resetTokenExpiry: new Date(expiry)
            }
        });
        return 1;
    },

    findByResetToken: async (token) => {
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) return null;
        return {
            ...user,
            created_at: user.createdAt,
            reset_token: user.resetToken,
            reset_token_expiry: user.resetTokenExpiry
        };
    },

    updatePassword: async (userId, hashedPassword) => {
        await prisma.user.update({
            where: { id: String(userId) },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        return 1;
    }
};

module.exports = User;
