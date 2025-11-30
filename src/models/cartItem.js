const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
    },
    // Foreign keys will be handled by associations
});

module.exports = CartItem;
