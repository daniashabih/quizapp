const Category = require('../_models/categoryModel');

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const cleanName = String(name).trim();

        const existing = await Category.findByName(cleanName);
        if (existing) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const id = await Category.create(cleanName);
        res.status(201).json({ message: 'Category created successfully', id, name: cleanName });
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ message: error.message || 'Server error creating category' });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || !String(name).trim()) return res.status(400).json({ message: 'Category name is required' });

        const cleanName = String(name).trim();
        await Category.update(id, cleanName);
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({ message: 'Server error updating category' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.delete(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ message: 'Server error deleting category' });
    }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
