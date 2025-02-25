const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { updateBalanceValidator } = require('../validators/userValidator');
const validate = require('../middlewares/validator');

router.post('/update-balance', 
  updateBalanceValidator,
  validate,
  UserController.updateBalance
);

module.exports = router;