const { Order, OrderItem, Cart, CartItem, Product, ProductVariation, sequelize } = require('../../models');
const inventoryService = require('../Inventory/inventory.service');

class OrderService {
    async createOrder(userId, shippingAddress) {
        const transaction = await sequelize.transaction();
        try {
            const cart = await Cart.findOne({
                where: { userId },
                include: [{ model: CartItem, as: 'items', include: [Product, ProductVariation] }]
            });

            if (!cart || cart.items.length === 0) {
                throw new Error('Cart is empty');
            }

            let total = 0;
            const orderItemsData = [];

            for (const item of cart.items) {
                const price = item.ProductVariation ? item.ProductVariation.price : item.Product.price;
                const stock = item.ProductVariation ? item.ProductVariation.stock : item.Product.stock;

                if (stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.Product.name}`);
                }

                total += parseFloat(price) * item.quantity;

                // Snapshot data
                orderItemsData.push({
                    productId: item.productId,
                    variationId: item.variationId,
                    price: price,
                    quantity: item.quantity,
                    product_name: item.Product.name,
                    sku: item.ProductVariation ? item.ProductVariation.sku : item.Product.sku,
                    attributes_snapshot: item.ProductVariation ? item.ProductVariation.attributes : null
                });

                // Deduct stock via InventoryService
                await inventoryService.adjustStock({
                    productId: item.productId,
                    variationId: item.variationId,
                    quantity: item.quantity,
                    type: 'out',
                    reason: 'Order Placement',
                    userId,
                    orderId: null // We don't have order ID yet, will update later or ignore for now
                }, transaction);
            }

            // Create Order
            const order = await Order.create({
                userId,
                total,
                shipping_address: shippingAddress,
                status: 'pending'
            }, { transaction });

            // Create OrderItems
            for (const itemData of orderItemsData) {
                await OrderItem.create({ ...itemData, orderId: order.id }, { transaction });
            }

            // Clear Cart
            await CartItem.destroy({ where: { cartId: cart.id }, transaction });

            await transaction.commit();
            return order;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getOrders(userId) {
        return await Order.findAll({
            where: { userId },
            include: [{ model: OrderItem, as: 'items' }]
        });
    }

    async getAllOrders() {
        return await Order.findAll({
            include: ['User', { model: OrderItem, as: 'items' }]
        });
    }

    async updateStatus(orderId, status) {
        const order = await Order.findByPk(orderId);
        if (!order) throw new Error('Order not found');
        order.status = status;
        return await order.save();
    }
}

module.exports = new OrderService();
