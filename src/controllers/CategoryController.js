const { Category, Product } = require('../models');

class CategoryController {
    async index(req, res) {
        try {
            const categories = await Category.findAll({
                include: [
                    { model: Category, as: 'subcategories' }
                ]
            });
            return res.json(categories);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    async show(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id, {
                include: [
                    { model: Category, as: 'subcategories' },
                    { model: Product, limit: 10 } // Show some products
                ]
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            return res.json(category);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch category' });
        }
    }

    async create(req, res) {
        try {
            const { name, slug, image, parentId, description } = req.body;
            const category = await Category.create({ name, slug, image, parentId, description });
            return res.status(201).json(category);
        } catch (error) {
            return res.status(400).json({ error: 'Failed to create category', details: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            await category.update(req.body);
            return res.json(category);
        } catch (error) {
            return res.status(400).json({ error: 'Failed to update category' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            await category.destroy();
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete category' });
        }
    }
}

module.exports = new CategoryController();
