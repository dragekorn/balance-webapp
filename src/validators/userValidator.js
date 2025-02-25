const { body } = require('express-validator');

const updateBalanceValidator = [
  body('userId')
    .isInt()
    .withMessage('User ID must be an integer'),
  body('amount')
    .isFloat()
    .withMessage('Amount must be a number')
];

module.exports = {
  updateBalanceValidator
};