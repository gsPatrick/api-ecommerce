const { Product, ProductAttribute, ProductVariation, Category, Brand } = require('../../models');

class ProductService {
    async createProduct(data) {
        const { sequelize } = require('../../models'); // Import sequelize instance
        const { attributes, variations, ...productData } = data;
        const { Op } = require('sequelize');

        // 1. Idempotency Checks (SKU and BrechoID)
        if (productData.sku) {
            const existingProduct = await Product.findOne({ where: { sku: productData.sku } });
            if (existingProduct) return this.getProductById(existingProduct.id);
        }
        if (productData.brechoId) {
            const existingProduct = await Product.findOne({ where: { brechoId: productData.brechoId } });
            if (existingProduct) return this.getProductById(existingProduct.id);
        }

        const t = await sequelize.transaction();

        try {
            // Handle Brand (Case-insensitive)
            if (data.brand) {
                // Try to find first
                let brand = await Brand.findOne({
                    where: sequelize.where(
                        sequelize.fn('lower', sequelize.col('name')),
                        sequelize.fn('lower', data.brand)
                    ),
                    transaction: t
                });

                if (!brand) {
                    brand = await Brand.create({
                        name: data.brand,
                        slug: data.brand.toLowerCase().replace(/ /g, '-') + '-' + Date.now().toString().slice(-4), // Ensure unique slug
                        active: true
                    }, { transaction: t });
                }
                data.brandId = brand.id;
            }

            // Create Product
            // Ensure images are saved directly (Array of objects { src: '...' })
            // Ensure stock is set
            const product = await Product.create(data, { transaction: t });

            if (productData.is_variable && attributes && attributes.length > 0) {
                for (const attr of attributes) {
                    await ProductAttribute.create({
                        productId: product.id,
                        name: attr.name,
                        options: attr.options
                    }, { transaction: t });
                }
            }

            if (productData.is_variable && variations && variations.length > 0) {
                for (const variation of variations) {
                    await ProductVariation.create({
                        productId: product.id,
                        ...variation
                    }, { transaction: t });
                }
            }

            // Integration with Brechó (Recursive? No, this is receiving FROM Brecho usually, or local create)
            // If this call came from SyncJob (which calls createProductInBrecho), we don't need to call back.
            // But if it came from Admin Panel, we do.
            // How to distinguish?
            // The SyncJob calls `brechoProvider.createProductInBrecho` directly?
            // No, SyncJob in API-ECOMMERCE calls `brechoProvider`.
            // SyncJob in TIPTAG calls `API-ECOMMERCE` POST /products.
            // So this IS the endpoint hit by Tiptag.
            // We should NOT call `createProductInBrecho` if `brechoId` is already present (which means it came from Tiptag).

            if (process.env.INTEGRATION_ENABLED === 'true' && !productData.brechoId) {
                const brechoProvider = require('../Integration/brecho.provider');
                // Pass the full 'data' object
                const brechoProduct = await brechoProvider.createProductInBrecho(data);

                if (brechoProduct) {
                    await product.update({
                        brechoId: brechoProduct.id,
                        sku: brechoProduct.codigo_etiqueta
                    }, { transaction: t });
                }
            }

            await t.commit();
            return this.getProductById(product.id);

        } catch (error) {
            await t.rollback();
            // Check if it was a unique constraint error that slipped through
            if (error.name === 'SequelizeUniqueConstraintError') {
                console.warn('[ProductService] Unique constraint error during create:', error.errors.map(e => e.message));
                // Try to find the product again, maybe race condition
                if (productData.sku) {
                    const p = await Product.findOne({ where: { sku: productData.sku } });
                    if (p) return this.getProductById(p.id);
                }
            }
            throw error;
        }
    }

    async getProducts(query) {
        const { Op } = require('sequelize');
        const where = {};
        const include = [
            { model: ProductAttribute, as: 'attributes' },
            { model: ProductVariation, as: 'variations' },
            { model: Brand },
            { model: Category }
        ];

        if (query.sku) {
            where.sku = query.sku;
        }

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
                { model: ProductVariation, as: 'variations' },
                { model: Brand },
                { model: Category }
            ]
        });
    }

    async updateProduct(id, data, options = {}) {
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Product not found');

        // Stock Logic: If stock is 0, we can optionally archive, but usually status comes from payload.
        // If data.stock is 0, we ensure it's updated.
        // Images Logic: Full replace is handled by sequelize update if data.images is provided.

        const updatedProduct = await product.update(data);

        // Sync update to Brechó
        if (process.env.INTEGRATION_ENABLED === 'true' && updatedProduct.brechoId && !options.fromSync) {
            const brechoProvider = require('../Integration/brecho.provider');
            await brechoProvider.updateProductInBrecho(updatedProduct.brechoId, updatedProduct.toJSON());
        }

        return updatedProduct;
    }

    async deleteProduct(id) {
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Product not found');
        const brechoId = product.brechoId;
        await product.destroy();

        // Sync delete to Brechó
        if (process.env.INTEGRATION_ENABLED === 'true' && brechoId) {
            const brechoProvider = require('../Integration/brecho.provider');
            await brechoProvider.deleteProductInBrecho(brechoId);
        }

        return true;
    }
}

module.exports = new ProductService();
