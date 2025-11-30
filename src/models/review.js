const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    title: {
        type: DataTypes.STRING,
    },
    comment: {
        type: DataTypes.TEXT,
    },
    images: {
        type: DataTypes.JSONB, // Array of image URLs
        defaultValue: [],
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
    verified_purchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
});

module.exports = Review;
