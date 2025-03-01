const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');
const { Task, TaskLock, TaskHistory } = require('../models/task');
const { Op } = require('sequelize');

const SERVER_ID = process.env.SERVER_ID || `server-${uuidv4()}`;
console.log(`Server started with ID: ${SERVER_ID}`);

const LOCK_TTL = 10 * 60 * 1000;
const runningTasks = new Map();
const scheduledJobs = new Map();

const taskFunctions = {
  processUserData: async () => {
    console.log('Starting processUserData task...');
    await simulateWork(120);
    console.log('Finished processUserData task');
  },
  
  generateReports: async () => {
    console.log('Starting generateReports task...');
    await simulateWork(120);
    console.log('Finished generateReports task');
  },
  
  cleanOldRecords: async () => {
    console.log('Starting cleanOldRecords task...');
    await simulateWork(120);
    console.log('Finished cleanOldRecords task');
  },
  
  syncExternalData: async () => {
    console.log('Starting syncExternalData task...');
    await simulateWork(120);
    console.log('Finished syncExternalData task');
  },
  
  calculateStatistics: async () => {
    console.log('Starting calculateStatistics task...');
    await simulateWork(120);
    console.log('Finished calculateStatistics task');
  },
  
  backupDatabase: async () => {
    console.log('Starting backupDatabase task...');
    await simulateWork(120);
    console.log('Finished backupDatabase task');
  },
  
  sendNotifications: async () => {
    console.log('Starting sendNotifications task...');
    await simulateWork(120);
    console.log('Finished sendNotifications task');
  },
  
  updateCache: async () => {
    console.log('Starting updateCache task...');
    await simulateWork(120);
    console.log('Finished updateCache task');
  },
  
  verifyIntegrity: async () => {
    console.log('Starting verifyIntegrity task...');
    await simulateWork(120);
    console.log('Finished verifyIntegrity task');
  },
  
  optimizePerformance: async () => {
    console.log('Starting optimizePerformance task...');
    await simulateWork(120);
    console.log('Finished optimizePerformance task');
  }
};

function simulateWork(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function getNextCronTime(cronExpression) {
  try {
    const parts = cronExpression.split(' ');
    const now = new Date();
    
    if (parts[0].startsWith('*/')) {
      const minutes = parseInt(parts[0].substring(2));
      const nextMinute = Math.ceil(now.getMinutes() / minutes) * minutes;
      const nextTime = new Date(now);
      
      if (nextMinute >= 60) {
        nextTime.setHours(nextTime.getHours() + 1);
        nextTime.setMinutes(nextMinute % 60);
      } else {
        nextTime.setMinutes(nextMinute);
      }
      
      nextTime.setSeconds(0);
      nextTime.setMilliseconds(0);
      
      if (nextTime <= now) {
        nextTime.setMinutes(nextTime.getMinutes() + minutes);
      }
      
      return nextTime;
    }
    
    if (parts[0] === '0' && parts[1] === '*') {
      const nextTime = new Date(now);
      nextTime.setHours(nextTime.getHours() + 1);
      nextTime.setMinutes(0);
      nextTime.setSeconds(0);
      nextTime.setMilliseconds(0);
      return nextTime;
    }
    
    const nextTime = new Date(now.getTime() + 5 * 60 * 1000);
    return nextTime;
  } catch (error) {
    console.error(`Error calculating next run time for ${cronExpression}:`, error);
    return new Date(Date.now() + 5 * 60 * 1000);
  }
}

class CronService {
  static async initialize() {
    try {
      console.log('Initializing cron service...');
      
      await CronService.cleanExpiredLocks();
      
      const tasks = await Task.findAll();
      
      for (const task of tasks) {
        await CronService.scheduleTask(task);
      }
      
      cron.schedule('*/1 * * * *', async () => {
        await CronService.cleanExpiredLocks();
      });
      
      console.log('Cron service initialized successfully');
    } catch (error) {
      console.error('Error initializing cron service:', error);
    }
  }
  
  static async scheduleTask(task) {
    try {
      if (scheduledJobs.has(task.id)) {
        scheduledJobs.get(task.id).stop();
        scheduledJobs.delete(task.id);
      }
      
      const job = cron.schedule(task.interval, async () => {
        await CronService.executeTask(task.id);
      });
      
      scheduledJobs.set(task.id, job);
      
      console.log(`Scheduled task ${task.name} with interval ${task.interval}`);
    } catch (error) {
      console.error(`Error scheduling task ${task.name}:`, error);
    }
  }
  
  static async executeTask(taskId) {
    const task = await Task.findByPk(taskId);
    
    if (!task) {
      console.error(`Task with ID ${taskId} not found`);
      return;
    }
    
    if (task.status === 'running') {
      console.log(`Task ${task.name} is already in 'running' status`);
      return;
    }
    
    const locked = await CronService.tryLockTask(task.id);
    if (!locked) {
      console.log(`Task ${task.name} is already running on another server`);
      return;
    }
    
    console.log(`Starting execution of task ${task.name} on server ${SERVER_ID}`);
    
    const startTime = new Date();
    let endTime;
    let success = false;
    let errorMessage = null;
    
    try {
      await task.update({
        status: 'running',
        last_run_at: startTime
      });
      
      runningTasks.set(task.id, {
        id: task.id,
        name: task.name,
        startTime,
        functionName: task.function_name
      });
      
      if (!taskFunctions[task.function_name]) {
        throw new Error(`Function "${task.function_name}" not found`);
      }
      
      await taskFunctions[task.function_name]();
      
      success = true;
    } catch (error) {
      console.error(`Error executing task ${task.name}:`, error);
      errorMessage = error.message;
    } finally {
      endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);
      
      const nextRunAt = getNextCronTime(task.interval);
      
      await task.update({
        status: success ? 'completed' : 'failed',
        next_run_at: nextRunAt
      });
      
      await TaskHistory.create({
        task_id: task.id,
        server_id: SERVER_ID,
        status: success ? 'completed' : 'failed',
        started_at: startTime,
        finished_at: endTime,
        duration,
        error: errorMessage
      });
      
      await CronService.unlockTask(task.id);
      
      runningTasks.delete(task.id);
      
      console.log(`Finished execution of task ${task.name} on server ${SERVER_ID}, duration: ${duration}s`);
    }
  }
  
  static async tryLockTask(taskId) {
    const transaction = await sequelize.transaction();
    
    try {
      const existingLock = await TaskLock.findOne({
        where: {
          task_id: taskId,
          expires_at: {
            [Op.gt]: new Date()
          }
        },
        transaction
      });
      
      if (existingLock) {
        await transaction.rollback();
        return false;
      }
      
      await TaskLock.destroy({
        where: {
          task_id: taskId,
          expires_at: {
            [Op.lte]: new Date()
          }
        },
        transaction
      });
      
      const expiresAt = new Date(Date.now() + LOCK_TTL);
      await TaskLock.create({
        task_id: taskId,
        server_id: SERVER_ID,
        locked_at: new Date(),
        expires_at: expiresAt
      }, { transaction });
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error(`Error locking task ${taskId}:`, error);
      return false;
    }
  }
  
  static async unlockTask(taskId) {
    try {
      await TaskLock.destroy({
        where: {
          task_id: taskId,
          server_id: SERVER_ID
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error unlocking task ${taskId}:`, error);
      return false;
    }
  }
  
  static async cleanExpiredLocks() {
    try {
      const result = await TaskLock.destroy({
        where: {
          expires_at: {
            [Op.lte]: new Date()
          }
        }
      });
      
      if (result > 0) {
        console.log(`Cleaned up ${result} expired task locks`);
      }
    } catch (error) {
      console.error('Error cleaning expired locks:', error);
    }
  }
  
  static async getTasksStatus() {
    try {
      const tasks = await Task.findAll({
        include: [{
          model: TaskLock,
          required: false,
          where: {
            expires_at: {
              [Op.gt]: new Date()
            }
          }
        }]
      });
      
      const tasksInfo = tasks.map(task => {
        const taskLocks = task.TaskLocks || [];
        const taskLock = taskLocks.length > 0 ? taskLocks[0] : null;
        const isRunning = !!taskLock;
        
        const localTaskInfo = runningTasks.get(task.id);
        
        return {
          id: task.id,
          name: task.name,
          status: task.status,
          lastRunAt: task.last_run_at,
          nextRunAt: task.next_run_at,
          interval: task.interval,
          functionName: task.function_name,
          isRunning,
          serverId: isRunning ? taskLock.server_id : null,
          lockExpiresAt: isRunning ? taskLock.expires_at : null,
          runningTime: localTaskInfo ? Math.round((Date.now() - localTaskInfo.startTime) / 1000) : 0
        };
      });
      
      return tasksInfo;
    } catch (error) {
      console.error('Error getting tasks status:', error);
      throw error;
    }
  }
  
  static getNextRunTime(cronExpression) {
    return getNextCronTime(cronExpression);
  }
}

module.exports = CronService;