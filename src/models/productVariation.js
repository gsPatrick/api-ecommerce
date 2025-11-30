const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ProductVariation = sequelize.define('ProductVariation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    attributes: {
        type: DataTypes.JSONB, // { "Color": "Red", "Size": "M" }
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING,
        unique: true,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    images: {
        type: DataTypes.JSONB, // Specific images for this variation
        defaultValue: [],
    },
    // Extended fields
    barcode: {
        type: DataTypes.STRING, // EAN/UPC
    },
    weight: {
        type: DataTypes.FLOAT,
    },
    dimensions: {
        type: DataTypes.JSONB, // { length, width, height }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    }
});

module.exports = ProductVariation;
