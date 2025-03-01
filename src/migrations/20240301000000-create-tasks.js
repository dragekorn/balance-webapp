'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,    
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      interval: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Cron-выражение для расписания задачи'
      },
      function_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Имя функции, которая будет вызываться'
      },
      status: {
        type: Sequelize.ENUM('idle', 'running', 'completed', 'failed'),
        defaultValue: 'idle',
        allowNull: false
      },
      last_run_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      next_run_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.createTable('task_locks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      server_id: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Уникальный идентификатор сервера, выполняющего задачу'
      },
      locked_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Время истечения блокировки'
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

    await queryInterface.addIndex('tasks', ['name']);
    await queryInterface.addIndex('task_locks', ['task_id']);
    await queryInterface.addIndex('task_locks', ['server_id']);
    await queryInterface.createTable('task_history', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      server_id: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Уникальный идентификатор сервера, выполнявшего задачу'
      },
      status: {
        type: Sequelize.ENUM('completed', 'failed'),
        allowNull: false
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      finished_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Длительность выполнения в секундах'
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Сообщение об ошибке, если задача завершилась с ошибкой'
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

    await queryInterface.addIndex('task_history', ['task_id']);
    await queryInterface.addIndex('task_history', ['server_id']);
    await queryInterface.addIndex('task_history', ['started_at']);

    const tasks = [];
    const functions = [
      'processUserData', 'generateReports', 'cleanOldRecords', 'syncExternalData',
      'calculateStatistics', 'backupDatabase', 'sendNotifications', 'updateCache',
      'verifyIntegrity', 'optimizePerformance'
    ];

    const intervals = [
      '*/5 * * * *',
      '*/10 * * * *',
      '*/15 * * * *',
      '*/20 * * * *',
      '*/30 * * * *',
      '0 * * * *',
      '0 */2 * * *',
      '0 */4 * * *',
      '0 */6 * * *',
      '0 */12 * * *'
    ];

    const now = new Date();

    for (let i = 0; i < 10; i++) {
      tasks.push({
        name: `Task ${i + 1}`,
        interval: intervals[i],
        function_name: functions[i],
        status: 'idle',
        last_run_at: null,
        next_run_at: now,
        createdAt: now,
        updatedAt: now
      });
    }

    await queryInterface.bulkInsert('tasks', tasks);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('task_history');
    await queryInterface.dropTable('task_locks');
    await queryInterface.dropTable('tasks');
  }
};