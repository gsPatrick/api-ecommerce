const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.ENUM('percent', 'fixed', 'shipping'),
        allowNull: false,
    },
    value: {
        type: DataTypes.DECIMAL(10, 2), // Amount or Percentage
        allowNull: false,
    },
    min_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    expiration_date: {
        type: DataTypes.DATE,
    },
    usage_limit: {
        type: DataTypes.INTEGER, // Max global uses
        defaultValue: null,
    },
    used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    restrictions: {
        type: DataTypes.JSONB, // { categories: [], skus: [] }
        defaultValue: {},
    },
    // Extended fields
    allowed_emails: {
        type: DataTypes.JSONB, // Array of emails
        defaultValue: [],
    },
    is_first_order: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_cumulative: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    subscriber_only: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_main: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});

module.exports = Coupon;
