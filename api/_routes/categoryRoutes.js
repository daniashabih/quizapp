const express = require('express');
const router = express.Router();
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../_controllers/categoryController');
const authMiddleware = require('../_middlewares/authMiddleware');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

router.post('/', authMiddleware, adminMiddleware, createCategory);
router.get('/', getCategories); // Public read for dropdowns usually OK, or protected
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
