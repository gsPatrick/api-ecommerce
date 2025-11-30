const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TrackingEvent = sequelize.define('TrackingEvent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    eventType: {
        type: DataTypes.STRING, // view_item, add_to_cart, purchase, page_view
        allowNull: false,
    },
    data: {
        type: DataTypes.JSONB, // { productId: 1, url: '/...' }
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    sessionId: {
        type: DataTypes.STRING, // For guests
    },
    ip_address: {
        type: DataTypes.STRING,
    },
    user_agent: {
        type: DataTypes.STRING,
    }
});

module.exports = TrackingEvent;
