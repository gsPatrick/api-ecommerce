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
