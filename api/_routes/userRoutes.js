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
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be user or admin' });
        }
        const updated = await prisma.user.update({
            where: { id: String(id) },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json({ success: true, message: `User role updated to ${role}`, user: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
