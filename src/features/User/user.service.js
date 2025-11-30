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
}

module.exports = new UserService();
