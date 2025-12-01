const { TrackingEvent, sequelize } = require('../../models');

class AnalyticsService {
    async trackEvent(data) {
        // data: { eventType, data, userId, sessionId, ip_address, user_agent }
        return await TrackingEvent.create(data);
    }

    async getFunnel() {
        const visitors = await TrackingEvent.count({ where: { eventType: 'page_view' } });
        const addToCart = await TrackingEvent.count({ where: { eventType: 'add_to_cart' } });
        const checkouts = await TrackingEvent.count({ where: { eventType: 'checkout_start' } });
        const purchases = await TrackingEvent.count({ where: { eventType: 'purchase' } });

        return {
            visitors,
            addToCart,
            checkouts,
            purchases,
            cartConversionRate: visitors > 0 ? (addToCart / visitors) * 100 : 0,
            checkoutConversionRate: addToCart > 0 ? (checkouts / addToCart) * 100 : 0,
            purchaseConversionRate: checkouts > 0 ? (purchases / checkouts) * 100 : 0,
            overallConversionRate: visitors > 0 ? (purchases / visitors) * 100 : 0
        };
    }

    // 1. Sales Analytics
    async getSalesReports(startDate, endDate) {
        // Daily Revenue
        const sales = await sequelize.query(`
      SELECT DATE("createdAt") as date, SUM(total) as revenue, COUNT(id) as orders, AVG(total) as aov
      FROM "Orders"
      WHERE "createdAt" BETWEEN :startDate AND :endDate AND status != 'cancelled'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `, {
            replacements: { startDate: startDate || '2000-01-01', endDate: endDate || new Date() },
            type: sequelize.QueryTypes.SELECT
        });

        return sales;
    }

    // 2. Product Performance
    async getProductPerformance() {
        // Revenue & Quantity by Product
        const performance = await sequelize.query(`
      SELECT p.name, p.id, p.stock,
             SUM(oi.quantity) as total_sold, 
             SUM(oi.price * oi.quantity) as revenue,
             (SELECT COUNT(*) FROM "TrackingEvents" te WHERE te."eventType" = 'view_item' AND te.data->>'productId' = CAST(p.id AS TEXT)) as views
      FROM "OrderItems" oi
      JOIN "Products" p ON oi."productId" = p.id
      JOIN "Orders" o ON oi."orderId" = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id
      ORDER BY revenue DESC
    `, { type: sequelize.QueryTypes.SELECT });

        // Calculate conversion rate in JS
        return performance.map(p => ({
            ...p,
            conversionRate: p.views > 0 ? (p.total_sold / p.views) * 100 : 0
        }));
    }

    // 3. Customer Insights
    async getCustomerInsights() {
        // CLV (Customer Lifetime Value)
        const clv = await sequelize.query(`
      SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent, MAX(o."createdAt") as last_purchase
      FROM "Users" u
      JOIN "Orders" o ON u.id = o."userId"
      WHERE o.status != 'cancelled'
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 50
    `, { type: sequelize.QueryTypes.SELECT });

        // Churn Risk (No purchase in last 90 days)
        const churnRisk = await sequelize.query(`
      SELECT u.id, u.name, u.email, MAX(o."createdAt") as last_purchase
      FROM "Users" u
      JOIN "Orders" o ON u.id = o."userId"
      GROUP BY u.id
      HAVING MAX(o."createdAt") < NOW() - INTERVAL '90 days'
    `, { type: sequelize.QueryTypes.SELECT });

        return { topCustomers: clv, churnRisk };
    }

    // 4. Cart Analysis
    async getCartAnalysis() {
        // Abandonment Rate
        const totalCarts = await sequelize.query('SELECT COUNT(*) as count FROM "Carts"', { type: sequelize.QueryTypes.SELECT });
        const activeCarts = await sequelize.query(`
      SELECT COUNT(DISTINCT c.id) as count 
      FROM "Carts" c
      JOIN "CartItems" ci ON c.id = ci."cartId"
      WHERE c."updatedAt" > NOW() - INTERVAL '24 hours'
    `, { type: sequelize.QueryTypes.SELECT });

        return {
            totalCarts: totalCarts[0].count,
            activeCarts24h: activeCarts[0].count
        };
    }
}

module.exports = new AnalyticsService();
