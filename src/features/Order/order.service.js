const { Order, OrderItem, Cart, CartItem, Product, ProductVariation, sequelize } = require('../../models');
const inventoryService = require('../Inventory/inventory.service');

class OrderService {
    async createOrder(data) {
        const { userId, shippingAddress, paymentMethod, shippingCost = 0, discount = 0, notes, couponCode, items } = data;

        const transaction = await sequelize.transaction();
        try {
            let orderItemsData = [];
            let subtotal = 0;

            if (items && items.length > 0) {
                // Use items directly from payload (Frontend Cart)
                for (const item of items) {
                    // Fetch product/variation to verify price and stock
                    let product, variation;
                    if (item.variationId) {
                        variation = await ProductVariation.findByPk(item.variationId, { include: [Product] });
                        product = variation ? variation.Product : null;
                    } else {
                        product = await Product.findByPk(item.productId);
                    }

                    if (!product) throw new Error(`Product not found: ${item.productId}`);
                    if (item.variationId && !variation) throw new Error(`Product variation not found: ${item.variationId}`);

                    const price = variation ? variation.price : product.price;
                    const stock = variation ? variation.stock : product.stock;

                    if (stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${product.name}`);
                    }

                    subtotal += parseFloat(price) * item.quantity;

                    orderItemsData.push({
                        productId: product.id,
                        variationId: variation ? variation.id : null,
                        price: price,
                        quantity: item.quantity,
                        product_name: product.name,
                        sku: variation ? variation.sku : product.sku,
                        attributes_snapshot: variation ? variation.attributes : null
                    });

                    // Deduct stock
                    await inventoryService.adjustStock({
                        productId: product.id,
                        variationId: variation ? variation.id : null,
                        quantity: item.quantity,
                        type: 'out',
                        reason: 'Order Placement',
                        userId,
                        orderId: null
                    }, transaction);
                }
            } else {
                // Fallback to Database Cart (Legacy)
                const cart = await Cart.findOne({
                    where: { userId },
                    include: [{ model: CartItem, as: 'items', include: [Product, ProductVariation] }]
                });

                if (!cart || cart.items.length === 0) {
                    throw new Error('Cart is empty');
                }

                for (const item of cart.items) {
                    const price = item.ProductVariation ? item.ProductVariation.price : item.Product.price;
                    const stock = item.ProductVariation ? item.ProductVariation.stock : item.Product.stock;

                    if (stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${item.Product.name}`);
                    }

                    subtotal += parseFloat(price) * item.quantity;

                    orderItemsData.push({
                        productId: item.productId,
                        variationId: item.variationId,
                        price: price,
                        quantity: item.quantity,
                        product_name: item.Product.name,
                        sku: item.ProductVariation ? item.ProductVariation.sku : item.Product.sku,
                        attributes_snapshot: item.ProductVariation ? item.ProductVariation.attributes : null
                    });

                    await inventoryService.adjustStock({
                        productId: item.productId,
                        variationId: item.variationId,
                        quantity: item.quantity,
                        type: 'out',
                        reason: 'Order Placement',
                        userId,
                        orderId: null
                    }, transaction);
                }

                // Clear DB Cart only if we used it
                await CartItem.destroy({ where: { cartId: cart.id }, transaction });
            }

            // Calculate Final Total
            const total = subtotal + parseFloat(shippingCost) - parseFloat(discount);

            // Create Order
            const order = await Order.create({
                userId,
                subtotal,
                total,
                shipping_address: shippingAddress,
                shipping_cost: shippingCost,
                discount_total: discount,
                payment_method: paymentMethod,
                notes: notes,
                status: 'pending',
                payment_status: 'pending'
            }, { transaction });

            // Create OrderItems
            for (const itemData of orderItemsData) {
                await OrderItem.create({ ...itemData, orderId: order.id }, { transaction });
            }

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
            include: [
                { model: OrderItem, as: 'items' },
                { model: Payment }
            ],
            order: [['createdAt', 'DESC']]
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
