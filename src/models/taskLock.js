const TaskLock = sequelize.define('TaskLock', {
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
    tableName: 'task_locks'
  });