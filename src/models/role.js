const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    permissions: {
        type: DataTypes.JSONB, // Array of permission strings e.g. ["product.create", "stock.manage"]
        defaultValue: [],
    },
    description: {
        type: DataTypes.STRING,
    }
});

module.exports = Role;
