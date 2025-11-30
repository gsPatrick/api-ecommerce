const productService = require('./product.service');

class ProductController {
    async create(req, res) {
        try {
            const product = await productService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const products = await productService.getProducts(req.query);
            res.json({ data: products }); // Standardize response format
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getFilters(req, res) {
        try {
            const filters = await productService.getAvailableFilters();
            res.json(filters);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const product = await productService.getProductById(req.params.id);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const product = await productService.updateProduct(req.params.id, req.body);
            res.json(product);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await productService.deleteProduct(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ProductController();
