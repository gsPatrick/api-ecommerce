const categoryService = require('./category.service');

class CategoryController {
    async index(req, res) {
        try {
            const categories = await categoryService.getAll();
            return res.json(categories);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    async show(req, res) {
        try {
            const category = await categoryService.getById(req.params.id);
            if (!category) return res.status(404).json({ error: 'Category not found' });
            return res.json(category);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch category' });
        }
    }

    async create(req, res) {
        try {
            const category = await categoryService.create(req.body);
            return res.status(201).json(category);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const category = await categoryService.update(req.params.id, req.body);
            return res.json(category);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await categoryService.delete(req.params.id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CategoryController();
