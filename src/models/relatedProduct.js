const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const RelatedProduct = sequelize.define('RelatedProduct', {
    productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    relatedId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
});

module.exports = RelatedProduct;
