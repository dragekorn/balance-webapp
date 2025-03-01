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
    params: [
      sequelize.getQueryInterface(),
      sequelize.constructor,
      function() {
        throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
      }
    ]
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