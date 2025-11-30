const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    transactionId: {
        type: DataTypes.STRING, // ID from the provider (e.g. MercadoPago ID)
    },
    provider: {
        type: DataTypes.STRING, // 'mercadopago', 'asaas', 'stripe', etc.
        allowNull: false,
    },
    method: {
        type: DataTypes.STRING, // 'credit_card', 'pix', 'boleto'
    },
    type: {
        type: DataTypes.STRING, // 'checkout_transparent', 'checkout_pro'
    },
    status: {
        type: DataTypes.STRING, // 'pending', 'approved', 'rejected', 'refunded'
        defaultValue: 'pending',
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    installments: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    card_last_digits: {
        type: DataTypes.STRING,
    },
    metadata: {
        type: DataTypes.JSONB, // Any extra data
    },
    response_json: {
        type: DataTypes.JSONB, // Full response from provider for debugging
    }
});

module.exports = Payment;
