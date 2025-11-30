const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'customer'),
        defaultValue: 'customer',
    },
    roleId: {
        type: DataTypes.INTEGER, // Foreign key to Role
    },
    // Extended fields
    phone: {
        type: DataTypes.STRING,
    },
    cpf: {
        type: DataTypes.STRING,
        unique: true,
    },
    birthdate: {
        type: DataTypes.DATEONLY,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    },
    avatar: {
        type: DataTypes.STRING, // URL or File ID
    },
    bio: {
        type: DataTypes.TEXT,
    },
    social_login_id: {
        type: DataTypes.STRING,
    },
    social_provider: {
        type: DataTypes.STRING, // google, facebook, etc.
    },
    preferences: {
        type: DataTypes.JSONB, // { newsletter: true, theme: 'dark' }
        defaultValue: {},
    },
    status: {
        type: DataTypes.ENUM('active', 'banned', 'inactive'),
        defaultValue: 'active',
    },
    last_login: {
        type: DataTypes.DATE,
    },
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
    },
});

User.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = User;
