const express = require('express');
const router = express.Router();
const {
    getMe,
    updateProfile,
    getAllUsers,
    deleteAccount
} = require('../_controllers/authController');
const { authMiddleware, adminMiddleware } = require('../_middlewares/authMiddleware');
const prisma = require('../_config/prisma');

// User profile
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateProfile);
router.delete('/me', authMiddleware, deleteAccount);

// Admin-only management
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await prisma.user.findUnique({
            where: { id: String(id) },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentAdminId = req.user?.id ? String(req.user.id) : null;
        if (currentAdminId && currentAdminId === String(targetUser.id)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own administrator account.'
            });
        }

        const currentRole = String(targetUser.role || '').trim().toLowerCase() === 'admin' ? 'admin' : 'user';
        if (currentRole === 'admin') {
            const adminCount = await prisma.user.count({
                where: {
                    role: { in: ['admin', 'ADMIN'] }
                }
            });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete the last remaining administrator account.'
                });
            }
        }

        await prisma.user.delete({ where: { id: String(id) } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update role (admin only)
router.put('/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const rawRole = req.body?.role;
        const role = String(rawRole || '').trim().toLowerCase();

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be user or admin' });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: String(id) },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentRole = String(targetUser.role || '').trim().toLowerCase() === 'admin' ? 'admin' : 'user';

        if (currentRole === 'admin' && role === 'user') {
            const currentAdminId = req.user?.id ? String(req.user.id) : null;
            if (currentAdminId && currentAdminId === String(targetUser.id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot demote your own administrator account.'
                });
            }

            const adminCount = await prisma.user.count({
                where: {
                    role: { in: ['admin', 'ADMIN'] }
                }
            });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot demote the last remaining administrator account.'
                });
            }
        }

        const updated = await prisma.user.update({
            where: { id: String(id) },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json({
            success: true,
            message: `User role updated to ${role}`,
            user: {
                ...updated,
                role: updated.role.toLowerCase()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
