const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ShippingRule = sequelize.define('ShippingRule', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    zip_start: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    zip_end: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    base_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    weight_cost_per_kg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    free_shipping_threshold: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // If null, no free shipping for this rule
    },
    delivery_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
});

module.exports = ShippingRule;
