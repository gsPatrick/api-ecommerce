const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Brand = sequelize.define('Brand', {
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
    slug: {
        type: DataTypes.STRING,
        unique: true,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    logo: {
        type: DataTypes.STRING,
    }
});

module.exports = Brand;
