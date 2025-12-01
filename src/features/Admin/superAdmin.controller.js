const { StoreConfig, ShippingRule, Order, Product, User, sequelize } = require('../../models');
const { Op } = require('sequelize');

const DEFAULT_CONFIGS = [
    // Identity
    { key: 'store_name', value: 'Minha Loja', group: 'identity', is_public: true },
    { key: 'store_logo_url', value: '', group: 'identity', is_public: true },
    { key: 'store_favicon', value: '', group: 'identity', is_public: true },
    { key: 'meta_description', value: 'A melhor loja do mundo', group: 'identity', is_public: true },

    // Theme
    { key: 'primary_color', value: '#000000', group: 'theme', is_public: true },
    { key: 'secondary_color', value: '#ffffff', group: 'theme', is_public: true },
    { key: 'font_family', value: 'Inter', group: 'theme', is_public: true },

    // Contact
    { key: 'email', value: 'contato@loja.com', group: 'contact', is_public: true },
    { key: 'whatsapp', value: '', group: 'contact', is_public: true },
    { key: 'social_instagram', value: '', group: 'contact', is_public: true },
    { key: 'social_facebook', value: '', group: 'contact', is_public: true },

    // Payment
    { key: 'mercadopago_token', value: '', group: 'payment', is_public: false },
    { key: 'pix_key', value: '', group: 'payment', is_public: true },
    { key: 'stripe_key', value: '', group: 'payment', is_public: false },

    // Shipping
    { key: 'shipping_flat_rate', value: '15.00', group: 'shipping', is_public: true },
    { key: 'shipping_free_threshold', value: '200.00', group: 'shipping', is_public: true },

    // Integration
    { key: 'brecho_api_url', value: 'http://localhost:3000/api/v1', group: 'integration', is_public: false },
    { key: 'brecho_api_key', value: '', group: 'integration', is_public: false },
    { key: 'integration_enabled', value: 'false', group: 'integration', is_public: false },
];

class SuperAdminController {
    // --- Configs ---

    async initConfigs(req, res) {
        try {
            const created = [];
            for (const config of DEFAULT_CONFIGS) {
                const [item, wasCreated] = await StoreConfig.findOrCreate({
                    where: { key: config.key },
                    defaults: config
                });
                if (wasCreated) created.push(item);
            }
            return res.json({ message: 'Configs initialized', created_count: created.length });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getAllConfigs(req, res) {
        try {
            const configs = await StoreConfig.findAll();
            const grouped = configs.reduce((acc, curr) => {
                if (!acc[curr.group]) acc[curr.group] = [];
                acc[curr.group].push(curr);
                return acc;
            }, {});
            return res.json(grouped);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async updateBulkConfigs(req, res) {
        const t = await sequelize.transaction();
        try {
            const { configs } = req.body; // Array of { key, value }

            for (const { key, value } of configs) {
                await StoreConfig.update(
                    { value },
                    { where: { key }, transaction: t }
                );
            }

            await t.commit();
            return res.json({ message: 'Configs updated successfully' });
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ error: error.message });
        }
    }

    // --- Shipping Rules ---

    async createShippingRule(req, res) {
        try {
            const rule = await ShippingRule.create(req.body);
            return res.status(201).json(rule);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async getShippingRules(req, res) {
        try {
            const rules = await ShippingRule.findAll({ order: [['zip_start', 'ASC']] });
            return res.json(rules);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async updateShippingRule(req, res) {
        try {
            const { id } = req.params;
            const rule = await ShippingRule.findByPk(id);
            if (!rule) return res.status(404).json({ error: 'Rule not found' });

            await rule.update(req.body);
            return res.json(rule);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async deleteShippingRule(req, res) {
        try {
            const { id } = req.params;
            const rule = await ShippingRule.findByPk(id);
            if (!rule) return res.status(404).json({ error: 'Rule not found' });

            await rule.destroy();
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // --- Dashboard ---

    async getExecutiveDashboard(req, res) {
        try {
            const totalSales = await Order.sum('total', { where: { status: 'completed' } }) || 0;
            const pendingOrders = await Order.count({ where: { status: 'pending' } });
            const totalProducts = await Product.count();
            const totalCustomers = await User.count({ where: { roleId: { [Op.ne]: 1 } } }); // Assuming 1 is Admin

            // Recent Orders
            const recentOrders = await Order.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: ['User']
            });

            return res.json({
                kpis: {
                    total_sales: parseFloat(totalSales),
                    pending_orders: pendingOrders,
                    total_products: totalProducts,
                    total_customers: totalCustomers
                },
                recent_orders: recentOrders
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new SuperAdminController();
