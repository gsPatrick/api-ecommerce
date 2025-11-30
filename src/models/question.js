const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    answer: {
        type: DataTypes.TEXT,
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    answered_at: {
        type: DataTypes.DATE,
    }
});

module.exports = Question;
