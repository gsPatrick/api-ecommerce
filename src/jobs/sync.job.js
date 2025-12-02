const cron = require('node-cron');
const { Product, Category, Brand, ProductAttribute, ProductVariation } = require('../models');
const brechoProvider = require('../features/Integration/brecho.provider');
const { Op } = require('sequelize');
const axios = require('axios');

const syncJob = () => {
    // Run every minute
    // cron.schedule('* * * * *', async () => {
    //     console.log('[SyncJob] Starting bidirectional sync...');
    // 
    //     try {
    //         await pushToBrecho();
    //         await pullFromBrecho();
    //     } catch (error) {
    //         console.error('[SyncJob] Error in sync job:', error.message);
    //     }
    // });
    console.log('[SyncJob] Scheduled sync disabled in favor of real-time sync.');
};

const pushToBrecho = async () => {
    try {
        // Find products created or updated in the last 2 minutes (to be safe)
        // AND that might not be synced yet (brechoId is null)
        // Or just retry failed syncs?
        // Let's focus on products that DON'T have brechoId first.
        const productsToSync = await Product.findAll({
            where: {
                [Op.or]: [
                    { brechoId: null }, // New products
                    { updatedAt: { [Op.gt]: new Date(Date.now() - 5 * 60 * 1000) } } // Updated in last 5 mins
                ]
            },
            include: [
                { model: Category },
                { model: Brand },
                { model: ProductAttribute, as: 'attributes' }
            ],
            limit: 10 // Process in batches
        });

        if (productsToSync.length > 0) {
            console.log(`[SyncJob] Found ${productsToSync.length} products to push to Brechó.`);
            for (const product of productsToSync) {
                // Prepare data structure expected by provider
                // Provider expects 'data' object similar to service input, but we have a Sequelize instance.
                // We need to map it back.
                const productData = product.toJSON();
                // Ensure attributes are in the format expected (array of objects)

                // Call provider
                const brechoProduct = await brechoProvider.createProductInBrecho(productData);

                if (brechoProduct && brechoProduct.id) {
                    if (!product.brechoId) {
                        await product.update({ brechoId: brechoProduct.id });
                        console.log(`[SyncJob] Synced new product ${product.id} to Brechó ID ${brechoProduct.id}`);
                    } else {
                        // It was an update
                        await brechoProvider.updateProductInBrecho(product.brechoId, productData);
                        console.log(`[SyncJob] Synced update for product ${product.id} to Brechó.`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('[SyncJob] Error pushing to Brechó:', error.message);
    }
};

const pullFromBrecho = async () => {
    try {
        if (!process.env.BRECHO_API_URL || !process.env.BRECHO_API_KEY) return;

        // Fetch recent products from Brechó
        // We need an endpoint in Brechó to get "recent" or "all" with pagination.
        // Assuming GET /catalogo/pecas supports sorting or we just get latest.
        // Let's assume we get last 50.
        const response = await axios.get(`${process.env.BRECHO_API_URL}/catalogo/pecas?limit=50&order=desc`, {
            headers: { 'x-integration-secret': process.env.BRECHO_API_KEY }
        });

        const pecas = response.data;
        if (!pecas || !Array.isArray(pecas)) return;

        console.log(`[SyncJob] Fetched ${pecas.length} items from Brechó for potential pull.`);

        for (const peca of pecas) {
            // Check if we already have this product by brechoId OR sku
            // Check if we already have this product by brechoId OR sku OR codigo_etiqueta
            // We must be very careful to match ANY existing record to avoid duplication
            let product = await Product.findOne({
                where: {
                    [Op.or]: [
                        { brechoId: peca.id },
                        { sku: peca.sku_ecommerce }, // Match by Ecommerce SKU if present
                        { sku: peca.codigo_etiqueta } // Match by Tag Code if present (fallback)
                    ]
                }
            });

            if (!product) {
                console.log(`[SyncJob] Importing new product from Brechó: ${peca.descricao_curta}`);

                // Create Brand if needed
                let brandId = null;
                if (peca.marca) {
                    const [brand] = await Brand.findOrCreate({
                        where: { name: peca.marca.nome },
                        defaults: { slug: peca.marca.nome.toLowerCase().replace(/ /g, '-'), active: true }
                    });
                    brandId = brand.id;
                }

                // Create Category if needed
                let categoryId = null;
                if (peca.categoria) {
                    const [category] = await Category.findOrCreate({
                        where: { name: peca.categoria.nome },
                        defaults: { slug: peca.categoria.nome.toLowerCase().replace(/ /g, '-'), isActive: true }
                    });
                    categoryId = category.id;
                }

                // Create Product
                product = await Product.create({
                    name: peca.descricao_curta,
                    description: peca.descricao_detalhada,
                    price: peca.preco_venda,
                    sku: peca.sku_ecommerce || peca.codigo_etiqueta,
                    stock: 1, // Default to 1 for unique item
                    brechoId: peca.id,
                    brandId,
                    categoryId,
                    weight: peca.peso_kg ? parseFloat(peca.peso_kg) : 0,
                    dimensions: {
                        height: peca.altura_cm ? parseFloat(peca.altura_cm) : 0,
                        width: peca.largura_cm ? parseFloat(peca.largura_cm) : 0,
                        length: peca.profundidade_cm ? parseFloat(peca.profundidade_cm) : 0
                    },
                    status: 'published'
                });

                // Attributes (Color/Size)
                if (peca.cor) {
                    await ProductAttribute.create({
                        productId: product.id,
                        name: 'Cor',
                        options: [peca.cor.nome] // Simple array for now
                    });
                }
                if (peca.tamanho) {
                    await ProductAttribute.create({
                        productId: product.id,
                        name: 'Tamanho',
                        options: [peca.tamanho.nome]
                    });
                }
            } else {
                // Update existing?
                // Maybe update stock or price if changed?
                // For now, just ensure brechoId is set if it was missing (matched by SKU)
                if (!product.brechoId) {
                    await product.update({ brechoId: peca.id });
                    console.log(`[SyncJob] Linked existing product ${product.sku} to Brechó ID ${peca.id}`);
                }
            }
        }

    } catch (error) {
        console.error('[SyncJob] Error pulling from Brechó:', error.message);
    }
};

module.exports = syncJob;
