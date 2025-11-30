const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // Price at time of purchase
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_name: {
        type: DataTypes.STRING, // Snapshot
    },
    sku: {
        type: DataTypes.STRING, // Snapshot
    },
    attributes_snapshot: {
        type: DataTypes.JSONB, // Snapshot of variation attributes
    }
});

module.exports = OrderItem;
