const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ProductAttribute = sequelize.define('ProductAttribute', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false, // e.g. "Color", "Size"
    },
    options: {
        type: DataTypes.JSONB, // Array of options e.g. ["Red", "Blue"]
        defaultValue: [],
    }
});

module.exports = ProductAttribute;
