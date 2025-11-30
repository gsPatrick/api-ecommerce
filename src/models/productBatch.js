const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ProductBatch = sequelize.define('ProductBatch', {
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
        type: DataTypes.INTEGER,
    },
    batch_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    expiration_date: {
        type: DataTypes.DATEONLY,
    },
    cost_price: {
        type: DataTypes.DECIMAL(10, 2), // Cost per unit in this batch
    }
});

module.exports = ProductBatch;
