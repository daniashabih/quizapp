const Category = require('../_models/categoryModel');

const createCategory = async (req, res) => {
    try {
        const { name, isEnabled } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const cleanName = String(name).trim();

        const existing = await Category.findByName(cleanName);
        if (existing) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const id = await Category.create(cleanName, isEnabled !== false);
        res.status(201).json({ message: 'Category created successfully', id, name: cleanName, isEnabled: isEnabled !== false });
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ message: error.message || 'Server error creating category' });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        const enabledOnly = req.query.enabledOnly === 'true' || req.query.activeOnly === 'true';
        if (enabledOnly) {
            return res.json(categories.filter(c => c.isEnabled !== false));
        }
        res.json(categories);
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isEnabled } = req.body;

        if (name === undefined && isEnabled === undefined) {
            return res.status(400).json({ message: 'Either name or isEnabled is required' });
        }

        await Category.update(id, { name, isEnabled });
        res.json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({ message: error.message || 'Server error updating category' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuestions = req.query.deleteQuestions !== 'false';
        const result = await Category.delete(id, deleteQuestions);
        const msg = result.deletedQuestions > 0
            ? `Category "${result.name}" and ${result.deletedQuestions} associated question(s) deleted successfully.`
            : `Category "${result.name}" deleted successfully.`;
        res.json({ success: true, message: msg, ...result });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ message: error.message || 'Server error deleting category' });
    }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
