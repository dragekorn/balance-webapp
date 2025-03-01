const TaskHistory = sequelize.define('TaskHistory', {
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
    tableName: 'task_history'
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