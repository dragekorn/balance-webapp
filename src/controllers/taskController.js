const CronService = require('../services/cronService');
const { Task, TaskHistory } = require('../models/task');
const { Op } = require('sequelize');

class TaskController {
  static async getAllTasks(req, res, next) {
    try {
      const tasksStatus = await CronService.getTasksStatus();
      
      res.json({
        success: true,
        data: tasksStatus
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTaskHistory(req, res, next) {
    try {
      const { taskId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      
      const where = {};
      if (taskId) {
        where.task_id = taskId;
      }
      
      const history = await TaskHistory.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['finished_at', 'DESC']],
        include: [{
          model: Task,
          attributes: ['name']
        }]
      });
      
      res.json({
        success: true,
        data: {
          items: history.rows,
          total: history.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTaskDetails(req, res, next) {
    try {
      const { taskId } = req.params;
      
      const task = await Task.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }
      
      const taskStatus = await CronService.getTasksStatus();
      const taskInfo = taskStatus.find(t => t.id === parseInt(taskId));
      
      const history = await TaskHistory.findAll({
        where: { task_id: taskId },
        limit: 5,
        order: [['finished_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          task: taskInfo,
          history
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async runTask(req, res, next) {
    try {
      const { taskId } = req.params;
      
      const task = await Task.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }
      
      CronService.executeTask(task.id).catch(error => {
        console.error(`Error executing task ${task.name}:`, error);
      });
      
      res.json({
        success: true,
        message: `Task ${task.name} queued for execution`
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTaskStats(req, res, next) {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const totalExecutions = await TaskHistory.count();
      const last24Hours = await TaskHistory.count({
        where: {
          started_at: {
            [Op.gte]: yesterday
          }
        }
      });
      
      const successful = await TaskHistory.count({
        where: { status: 'completed' }
      });
      
      const failed = await TaskHistory.count({
        where: { status: 'failed' }
      });
      
      const avgDuration = await TaskHistory.findAll({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('duration')), 'avgDuration']
        ],
        raw: true
      });
      
      res.json({
        success: true,
        data: {
          totalExecutions,
          last24Hours,
          successful,
          failed,
          avgDuration: avgDuration[0].avgDuration || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;