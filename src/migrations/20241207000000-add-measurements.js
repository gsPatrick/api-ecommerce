'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Products', 'measurements', {
            type: Sequelize.JSONB,
            defaultValue: []
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Products', 'measurements');
    }
};
