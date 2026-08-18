const prisma = require('../_config/prisma');

const User = {
    create: async (name, email, password, role = 'user', avatar = '') => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const cleanName = String(name || '').trim();
        const result = await prisma.user.create({
            data: {
                name: cleanName,
                email: cleanEmail,
                password,
                role: role || 'user',
                avatar: avatar || '',
                isVerified: false
            }
        });
        return result;
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
            updated_at: user.updatedAt,
            is_verified: user.isVerified,
            reset_token: user.resetToken,
            reset_token_expiry: user.resetTokenExpiry
        };
    },

    findById: async (id) => {
        const user = await prisma.user.findUnique({
            where: { id: String(id) },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) return null;
        return {
            ...user,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
            is_verified: user.isVerified
        };
    },

    getAll: async () => {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return users.map(u => ({
            ...u,
            created_at: u.createdAt,
            updated_at: u.updatedAt,
            is_verified: u.isVerified
        }));
    },

    update: async (id, data) => {
        const updateData = {};
        if (data.name !== undefined) updateData.name = String(data.name).trim();
        if (data.email !== undefined) updateData.email = String(data.email).trim().toLowerCase();
        if (data.avatar !== undefined) updateData.avatar = String(data.avatar).trim();
        if (data.role !== undefined) updateData.role = String(data.role).trim();
        if (data.isVerified !== undefined) updateData.isVerified = Boolean(data.isVerified);

        const updated = await prisma.user.update({
            where: { id: String(id) },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return updated;
    },

    delete: async (id) => {
        await prisma.user.delete({
            where: { id: String(id) }
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
            updated_at: user.updatedAt,
            is_verified: user.isVerified,
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
