const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');

router.get('/', TaskController.getAllTasks);
router.get('/history', TaskController.getTaskHistory);
router.get('/:taskId/history', TaskController.getTaskHistory);
router.get('/:taskId', TaskController.getTaskDetails);
router.post('/:taskId/run', TaskController.runTask);
router.get('/stats/summary', TaskController.getTaskStats);

module.exports = router;