'use strict';

const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    balance: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });

  // Добавление начального пользователя с балансом 10000
  await queryInterface.bulkInsert('users', [{
    balance: 10000,
    createdAt: new Date(),
    updatedAt: new Date()
  }]);
};

const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('users');
};

module.exports = { up, down };