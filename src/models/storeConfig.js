const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const StoreConfig = sequelize.define('StoreConfig', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    value: {
        type: DataTypes.JSONB, // Flexible value storage
        allowNull: false,
    },
    group: {
        type: DataTypes.STRING, // e.g. "general", "payment", "shipping", "email"
        defaultValue: 'general',
    },
    is_public: {
        type: DataTypes.BOOLEAN, // If true, accessible via public API
        defaultValue: false,
    },
    description: {
        type: DataTypes.STRING,
    }
});

module.exports = StoreConfig;
