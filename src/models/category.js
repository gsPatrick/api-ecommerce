const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
    },
    image: {
        type: DataTypes.STRING, // URL for the category image
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Categories',
            key: 'id',
        },
    },
    description: {
        type: DataTypes.TEXT,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
});

module.exports = Category;
