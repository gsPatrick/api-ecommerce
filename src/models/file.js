const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const File = sequelize.define('File', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    original_name: {
        type: DataTypes.STRING,
    },
    mime_type: {
        type: DataTypes.STRING,
    },
    size: {
        type: DataTypes.INTEGER, // Bytes
    },
    path: {
        type: DataTypes.STRING, // Local path or S3 key
    },
    url: {
        type: DataTypes.STRING, // Public URL
    },
    userId: {
        type: DataTypes.INTEGER, // Uploader
    }
});

module.exports = File;
