const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    category: {
        type: DataTypes.STRING, // Legacy/Fallback
    },
    categoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Categories',
            key: 'id',
        },
    },
    // Base fields for simple products or display
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false, // Can be base price for variable products
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
        type: DataTypes.JSONB, // Array of image URLs
        defaultValue: [],
    },
    is_variable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    weight: {
        type: DataTypes.FLOAT, // For shipping
        defaultValue: 0.0,
    },
    dimensions: {
        type: DataTypes.JSONB, // { length, width, height }
    },
    // Extended fields
    slug: {
        type: DataTypes.STRING,
        unique: true,
    },
    brand: {
        type: DataTypes.STRING, // Legacy/Fallback
    },
    brandId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Brands',
            key: 'id',
        },
    },
    tags: {
        type: DataTypes.JSONB, // ["electronics", "sale"]
        defaultValue: [],
    },
    short_description: {
        type: DataTypes.STRING, // Summary for cards
    },
    meta_title: {
        type: DataTypes.STRING,
    },
    meta_description: {
        type: DataTypes.STRING,
    },
    meta_keywords: {
        type: DataTypes.STRING,
    },
    video_url: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    sales_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    average_rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
    },
    rating_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // Ultra-Flexible fields
    type: {
        type: DataTypes.ENUM('physical', 'digital', 'subscription', 'service'),
        defaultValue: 'physical',
    },
    subscription_interval: {
        type: DataTypes.STRING, // e.g. '1 month', '1 year'
    },
    digital_file_url: {
        type: DataTypes.STRING,
    },
    custom_options_schema: {
        type: DataTypes.JSONB, // Schema for customization (e.g. { "Engraving": "text" })
    },
    reserved_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    allow_negative_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    brechoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    measurements: {
        type: DataTypes.JSONB, // Array of { name, value }
        defaultValue: []
    },
    supplier: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_accessory: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Product;
