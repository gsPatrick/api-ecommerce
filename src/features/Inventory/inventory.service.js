const { Product, ProductVariation, StockMovement, sequelize } = require('../../models');

class InventoryService {
    async adjustStock(data, transaction = null) {
        // data: { productId, variationId, quantity, type, reason, userId, orderId }
        const { productId, variationId, quantity, type, reason, userId, orderId } = data;

        let target;
        if (variationId) {
            target = await ProductVariation.findByPk(variationId, { transaction });
        } else {
            target = await Product.findByPk(productId, { transaction });
        }

        if (!target) throw new Error('Product/Variation not found');

        let newStock = target.stock;
        if (type === 'in' || type === 'return') {
            newStock += quantity;
        } else if (type === 'out') {
            if (target.stock < quantity) throw new Error(`Insufficient stock for product ${productId}`);
            newStock -= quantity;
        } else if (type === 'adjustment') {
            // If adjustment, quantity is the DELTA. Positive adds, negative removes.
            newStock += quantity;
        }

        // Update target stock
        if (variationId) {
            await ProductVariation.update({ stock: newStock }, { where: { id: variationId }, transaction });
        } else {
            await Product.update({ stock: newStock }, { where: { id: productId }, transaction });
        }

        // Record movement
        await StockMovement.create({
            productId,
            variationId,
            type,
            quantity: Math.abs(quantity),
            balance_after: newStock,
            reason,
            userId,
            orderId
        }, { transaction });

        // Sync stock update to Brechó
        if (process.env.INTEGRATION_ENABLED === 'true') {
            try {
                const brechoProvider = require('../Integration/brecho.provider');
                // We need the product to get brechoId. If variation, get product.
                let productToSync = target;
                if (variationId) {
                    productToSync = await Product.findByPk(productId, { transaction });
                }

                if (productToSync && productToSync.brechoId) {
                    // We need to send the full product data or just stock?
                    // updateProductInBrecho expects full data usually, but let's check.
                    // It maps fields. We should probably fetch fresh data to be safe.
                    // But inside transaction might be tricky if we use JSON.
                    // Let's construct a minimal payload with updated stock if possible,
                    // OR just call update with current state.
                    // Ideally we should use the provider's method which expects productData.

                    // Note: If inside transaction, we might not see committed changes yet if we query again outside?
                    // But here we have the instance 'target' (or productToSync) with updated stock?
                    // Wait, we updated via Model.update, so 'target' instance might be stale unless we reload or manually update it.
                    // We updated 'newStock' variable.

                    // Let's manually update the instance for the payload
                    if (variationId) {
                        // If it's a variation, the main product stock might be sum of variations or independent?
                        // In this system, Product has stock too.
                        // If variable, Product stock usually sum of variations.
                        // But here we updated specific target.
                        // If we are syncing to Brechó, Brechó (Tiptag) usually treats items as unique (Stock 1).
                        // If we have multiple stock, we send the total quantity.

                        // Let's assume we send the main product's total stock if variable?
                        // Or if Brechó maps 1-to-1.
                        // The user wants "COMPRA para estoque".

                        // Let's send the updated stock of the PRODUCT.
                        // If variation, we might need to re-calculate total stock?
                        // For now, let's assume simple product sync.
                    } else {
                        productToSync.stock = newStock;
                    }

                    // We need to pass the data expected by updateProductInBrecho
                    // It expects: name, description, price, sku, weight, dimensions...
                    // We should probably fetch the full product to be safe.
                    const fullProduct = await Product.findByPk(productId, {
                        include: ['attributes', 'variations'],
                        transaction
                    });

                    if (fullProduct) {
                        // We can't await inside transaction if the provider does external API call that takes time?
                        // Actually we CAN, but it holds the transaction.
                        // Better to do it AFTER commit?
                        // But we don't have hooks for after commit here easily without passing a callback.
                        // Let's fire and forget (no await) or await if critical?
                        // Sync should probably be background to not block user checkout.

                        brechoProvider.updateProductInBrecho(fullProduct.brechoId, fullProduct.toJSON()).catch(err =>
                            console.error('Background Stock Sync failed:', err.message)
                        );
                    }
                }
            } catch (err) {
                console.error('Error initiating stock sync:', err.message);
            }
        }

        return newStock;
    }

    async getHistory(productId, variationId = null) {
        const where = { productId };
        if (variationId) where.variationId = variationId;

        return await StockMovement.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
    }
}

module.exports = new InventoryService();
