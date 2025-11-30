const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // User association will be added in index.js
});

module.exports = Cart;
