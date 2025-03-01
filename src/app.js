const express = require('express');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');
const sequelize = require('./config/database');
const CronService = require('./services/cronService');
const { Task, TaskLock, TaskHistory } = require('./models/task');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Balance and Task API is running',
    server_id: process.env.SERVER_ID || 'unknown'
  });
});

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Соединение с базой данных установлено успешно.');

    await sequelize.sync({ force: false });
    console.log('Модели синхронизированы с базой данных.');
    
    await CronService.initialize();
    
    console.log(`Сервер запущен на порту ${PORT}`);
  } catch (error) {
    console.error('Ошибка при запуске приложения:', error);
  }
});