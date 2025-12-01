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

        // Integration with Brechó
        if (process.env.INTEGRATION_ENABLED === 'true') {
            const brechoProvider = require('../Integration/brecho.provider');
            const brechoProduct = await brechoProvider.createProductInBrecho(productData);

            if (brechoProduct) {
                await product.update({
                    brechoId: brechoProduct.id,
                    sku: brechoProduct.codigo_etiqueta // Ensure local SKU matches Brechó tag
                });
            }
        }

        return this.getProductById(product.id);
    }

    async getProducts(query) {
        const { Op } = require('sequelize');
        const where = {};
        const include = [
            { model: ProductAttribute, as: 'attributes' },
            { model: ProductVariation, as: 'variations' }
        ];

        // Basic Filters
        if (query.category) {
            // Check if category is ID or Name
            if (!isNaN(query.category)) {
                where.categoryId = query.category;
            } else {
                // If name, we might need to join Category model or use the legacy string field
                // Assuming legacy field for now based on previous code, or join if needed.
                // Let's try both: legacy field OR join.
                // For simplicity, let's stick to the legacy 'category' string field if it exists,
                // or we'd need to include Category model.
                where.category = query.category;
            }
        }

        if (query.price_min) where.price = { [Op.gte]: query.price_min };
        if (query.price_max) {
            where.price = { ...where.price, [Op.lte]: query.price_max };
        }

        // Variation Filters (Size, Color)
        // We want products that have AT LEAST ONE variation matching the criteria
        if (query.size || query.color) {
            const variationWhere = {};
            if (query.size) {
                // JSONB containment or specific key check
                // Postgres: attributes->>'Size' = 'M'
                variationWhere.attributes = {
                    [Op.contains]: { "Size": query.size }
                    // Or if structure is different, adjust. Assuming { "Size": "M" }
                };
            }
            if (query.color) {
                variationWhere.attributes = {
                    ...variationWhere.attributes,
                    [Op.contains]: { "Color": query.color }
                };
            }

            include.push({
                model: ProductVariation,
                as: 'variations',
                where: variationWhere,
                required: true // Inner join to only return matching products
            });
        }

        return await Product.findAll({ where, include });
    }

    async getAvailableFilters() {
        // Fetch all unique sizes and colors from ProductAttributes
        const attributes = await ProductAttribute.findAll();

        const sizes = new Set();
        const colorsMap = new Map(); // Use Map to deduplicate by name

        attributes.forEach(attr => {
            if (attr.name === 'Size' || attr.name === 'Tamanho') {
                if (Array.isArray(attr.options)) {
                    attr.options.forEach(opt => sizes.add(opt));
                }
            }
            if (attr.name === 'Color' || attr.name === 'Cor') {
                if (Array.isArray(attr.options)) {
                    attr.options.forEach(opt => {
                        // Handle both string "Red" and object { name: "Red", hex: "#F00" }
                        if (typeof opt === 'string') {
                            if (!colorsMap.has(opt)) {
                                colorsMap.set(opt, { name: opt, hex: '#000000' }); // Default fallback
                            }
                        } else if (typeof opt === 'object' && opt.name) {
                            // If we have an object, it takes precedence or adds new
                            colorsMap.set(opt.name, { name: opt.name, hex: opt.hex || '#000000' });
                        }
                    });
                }
            }
        });

        return {
            sizes: Array.from(sizes),
            colors: Array.from(colorsMap.values())
        };
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
