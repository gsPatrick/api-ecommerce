const { Category, Product } = require('../../models');

class CategoryService {
    async getAll() {
        return await Category.findAll({
            include: [
                { model: Category, as: 'subcategories' }
            ]
        });
    }

    async getById(id) {
        return await Category.findByPk(id, {
            include: [
                { model: Category, as: 'subcategories' },
                { model: Product, limit: 10 }
            ]
        });
    }

    async create(data) {
        return await Category.create(data);
    }

    async update(id, data) {
        const category = await Category.findByPk(id);
        if (!category) throw new Error('Category not found');
        return await category.update(data);
    }

    async delete(id) {
        const category = await Category.findByPk(id);
        if (!category) throw new Error('Category not found');
        return await category.destroy();
    }
}

module.exports = new CategoryService();
