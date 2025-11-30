const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const StockMovement = sequelize.define('StockMovement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    variationId: {
        type: DataTypes.INTEGER, // Nullable if simple product
    },
    type: {
        type: DataTypes.ENUM('in', 'out', 'adjustment', 'return'),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    balance_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING,
    },
    userId: {
        type: DataTypes.INTEGER, // Admin/User who caused the movement
    },
    orderId: {
        type: DataTypes.INTEGER, // Optional link to order
    }
});

module.exports = StockMovement;
