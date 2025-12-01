const { User, Cart } = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class UserService {
    async register(data) {
        const { name, email, password, role } = data;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const user = await User.create({ name, email, password, role });

        // Create a cart for the user
        await Cart.create({ userId: user.id });

        return user;
    }

    async login(email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await user.checkPassword(password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        return { user, token };
    }

    async getProfile(userId) {
        return await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    }

    async getAllUsers() {
        const users = await User.findAll({
            include: [{ model: Order, as: 'orders' }],
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        return users.map(user => {
            const orders = user.orders || [];
            const ltv = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
            // Sort orders to find last one
            const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return {
                ...user.toJSON(),
                ordersCount: orders.length,
                ltv,
                lastOrderDate: sortedOrders.length > 0 ? sortedOrders[0].createdAt : null
            };
        });
    }
}

module.exports = new UserService();
