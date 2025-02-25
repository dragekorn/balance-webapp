const path = require('path');
const Umzug = require('umzug');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const umzug = new Umzug({
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize
  },
  migrations: {
    path: path.join(__dirname),
    pattern: /^\d+[\w-]+\.js$/,
    customResolver: (path) => require(path)
  }
});

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Соединение с базой данных установлено успешно.');
    
    console.log('Запуск миграций...');
    await umzug.up();
    console.log('Миграции успешно применены!');
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при запуске миграций:', error);
    process.exit(1);
  }
}

runMigrations();