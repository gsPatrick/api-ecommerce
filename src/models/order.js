const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
    },
    shipping_address: {
        type: DataTypes.JSONB, // { street, city, zip, etc. }
        allowNull: false,
    },
    shipping_cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
    },
    payment_method: {
        type: DataTypes.STRING,
    },
    tracking_code: {
        type: DataTypes.STRING,
    },
    // Extended fields
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
    },
    tax_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
    },
    discount_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'BRL',
    },
    notes: {
        type: DataTypes.TEXT, // Customer notes
    },
    gift_message: {
        type: DataTypes.TEXT,
    },
    delivery_instructions: {
        type: DataTypes.TEXT,
    },
    ip_address: {
        type: DataTypes.STRING,
    },
    user_agent: {
        type: DataTypes.STRING,
    }
});

module.exports = Order;
