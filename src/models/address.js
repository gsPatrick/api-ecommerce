const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING, // e.g. "Home", "Work"
        defaultValue: 'My Address',
    },
    recipient_name: {
        type: DataTypes.STRING,
    },
    street: {
        type: DataTypes.STRING,
    },
    number: {
        type: DataTypes.STRING,
    },
    complement: {
        type: DataTypes.STRING,
    },
    neighborhood: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    state: {
        type: DataTypes.STRING,
    },
    country: {
        type: DataTypes.STRING,
        defaultValue: 'BR',
    },
    zip_code: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    type: {
        type: DataTypes.ENUM('shipping', 'billing', 'both'),
        defaultValue: 'both',
    }
});

module.exports = Address;
