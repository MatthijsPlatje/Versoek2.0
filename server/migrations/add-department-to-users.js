// server/migrations/add-department-to-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'department', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'profile_picture_url'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'department');
  }
};
