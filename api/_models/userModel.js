const prisma = require('../_config/prisma');

const normalizeRole = (role) => {
    return String(role || '').trim().toLowerCase() === 'admin' ? 'admin' : 'user';
};

const User = {
    create: async (name, email, password, role = 'user', avatar = '', isVerified = false) => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const cleanName = String(name || '').trim();
        const cleanRole = normalizeRole(role);
        const result = await prisma.user.create({
            data: {
                name: cleanName,
                email: cleanEmail,
                password,
                role: cleanRole,
                avatar: avatar || '',
                isVerified: Boolean(isVerified)
            }
        });
        return {
            ...result,
            role: cleanRole
        };
    },

    findByEmail: async (email) => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email: cleanEmail }
        });
        if (!user) return null;
        return {
            ...user,
            role: normalizeRole(user.role),
            created_at: user.createdAt,
            updated_at: user.updatedAt,
            is_verified: user.isVerified,
            reset_token: user.resetToken,
            reset_token_expiry: user.resetTokenExpiry,
            password_changed_at: user.passwordChangedAt
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
                passwordChangedAt: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) return null;
        return {
            ...user,
            role: normalizeRole(user.role),
            created_at: user.createdAt,
            updated_at: user.updatedAt,
            is_verified: user.isVerified,
            password_changed_at: user.passwordChangedAt
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
            role: normalizeRole(u.role),
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
        if (data.role !== undefined) updateData.role = normalizeRole(data.role);
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
        return {
            ...updated,
            role: normalizeRole(updated.role)
        };
    },

    delete: async (id) => {
        await prisma.user.delete({
            where: { id: String(id) }
        });
        return 1;
    },

    /**
     * Store cryptographically hashed reset token and expiration timestamp
     */
    setResetToken: async (email, hashedToken, expiry) => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        await prisma.user.update({
            where: { email: cleanEmail },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry: new Date(expiry)
            }
        });
        return 1;
    },

    /**
     * Find user by hashed reset token if token has not expired
     */
    findByResetToken: async (hashedToken) => {
        const user = await prisma.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) return null;
        return {
            ...user,
            role: normalizeRole(user.role),
            created_at: user.createdAt,
            updated_at: user.updatedAt,
            is_verified: user.isVerified,
            reset_token: user.resetToken,
            reset_token_expiry: user.resetTokenExpiry,
            password_changed_at: user.passwordChangedAt
        };
    },

    /**
     * Atomically consume reset token, update password, and record password changed timestamp.
     * Prevents race conditions and multiple uses of the same token.
     */
    consumeResetTokenAndUpdatePassword: async (userId, hashedToken, hashedPassword) => {
        const result = await prisma.user.updateMany({
            where: {
                id: String(userId),
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gt: new Date()
                }
            },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                passwordChangedAt: new Date()
            }
        });
        return result.count > 0;
    },

    updatePassword: async (userId, hashedPassword) => {
        await prisma.user.update({
            where: { id: String(userId) },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                passwordChangedAt: new Date()
            }
        });
        return 1;
    }
};

module.exports = User;
