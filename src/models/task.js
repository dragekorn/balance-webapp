const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    allowNull: false,
    autoIncrement: true,    
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  interval: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Cron-выражение для расписания задачи'
  },
  function_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Имя функции, которая будет вызываться'
  },
  status: {
    type: DataTypes.ENUM('idle', 'running', 'completed', 'failed'),
    defaultValue: 'idle',
    allowNull: false
  },
  last_run_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  next_run_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'tasks',
  timestamps: true
});

const TaskLock = sequelize.define('TaskLock', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  server_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Уникальный идентификатор сервера, выполняющего задачу'
  },
  locked_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Время истечения блокировки'
  }
}, {
  tableName: 'task_locks',
  timestamps: true
});

const TaskHistory = sequelize.define('TaskHistory', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  server_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Уникальный идентификатор сервера, выполнявшего задачу'
  },
  status: {
    type: DataTypes.ENUM('completed', 'failed'),
    allowNull: false
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  finished_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Длительность выполнения в секундах'
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Сообщение об ошибке, если задача завершилась с ошибкой'
  }
}, {
  tableName: 'task_history',
  timestamps: true
});

Task.hasMany(TaskLock, { foreignKey: 'task_id' });
TaskLock.belongsTo(Task, { foreignKey: 'task_id' });

Task.hasMany(TaskHistory, { foreignKey: 'task_id' });
TaskHistory.belongsTo(Task, { foreignKey: 'task_id' });

module.exports = {
  Task,
  TaskLock,
  TaskHistory
};