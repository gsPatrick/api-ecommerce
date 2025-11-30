const { Product, ProductAttribute, ProductVariation } = require('../../models');

class ProductService {
    async createProduct(data) {
        // data: { name, description, price, sku, stock, is_variable, attributes: [{name, options}], variations: [...] }
        const { attributes, variations, ...productData } = data;

        const product = await Product.create(productData);

        if (productData.is_variable && attributes && attributes.length > 0) {
            for (const attr of attributes) {
                await ProductAttribute.create({
                    productId: product.id,
                    name: attr.name,
                    options: attr.options
                });
            }
        }

        if (productData.is_variable && variations && variations.length > 0) {
            for (const variation of variations) {
                await ProductVariation.create({
                    productId: product.id,
                    ...variation
                });
            }
        }

        return this.getProductById(product.id);
    }

    async getProducts(query) {
        // Implement filtering logic here (category, price range, etc.)
        const where = {};
        if (query.category) where.category = query.category;

        return await Product.findAll({ where });
    }

    async getProductById(id) {
        return await Product.findByPk(id, {
            include: [
                { model: ProductAttribute, as: 'attributes' },
                { model: ProductVariation, as: 'variations' }
            ]
        });
    }

    async updateProduct(id, data) {
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Product not found');
        return await product.update(data);
    }

    async deleteProduct(id) {
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Product not found');
        return await product.destroy();
    }
}

module.exports = new ProductService();
