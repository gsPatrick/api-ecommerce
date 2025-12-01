const { Order, OrderItem, Product, sequelize, Op } = require('../../models');

class DashboardService {
    async getStats() {
        const totalOrders = await Order.count();
        const totalRevenue = await Order.sum('total');

        const bestSellers = await OrderItem.findAll({
            attributes: [
                'productId',
                [sequelize.fn('sum', sequelize.col('quantity')), 'total_sold']
            ],
            group: ['productId', 'Product.id'],
            include: [{ model: Product, attributes: ['name'] }],
            order: [[sequelize.literal('total_sold'), 'DESC']],
            limit: 5
        });

        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: ['User']
        });

        // Advanced Stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyRevenue = await Order.sum('total', { where: { createdAt: { [Op.gte]: today } } });

        // Abandoned Carts (Updated > 24h ago, no order linked - simplified logic: just count carts not empty)
        // In real app, check if cart has items and updated < 24h ago
        const abandonedCarts = await sequelize.query(`
          SELECT COUNT(*) as count FROM "Carts" c
          JOIN "CartItems" ci ON c.id = ci."cartId"
          WHERE c."updatedAt" < NOW() - INTERVAL '24 hours'
        `, { type: sequelize.QueryTypes.SELECT });

        // Low Stock
        const lowStockProducts = await Product.findAll({
            where: { stock: { [Op.lt]: 10 } }, // Threshold 10
            limit: 10
        });

        return {
            totalOrders,
            totalRevenue: totalRevenue || 0,
            dailyRevenue: dailyRevenue || 0,
            abandonedCarts: abandonedCarts[0].count,
            bestSellers,
            recentOrders,
            lowStockProducts
        };
    }
}

module.exports = new DashboardService();
