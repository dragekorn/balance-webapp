const { User } = require('../models');
const sequelize = require('../config/database');

class InsufficientFundsError extends Error {
  constructor(message = 'Insufficient funds') {
    super(message);
    this.name = 'InsufficientFundsError';
  }
}

class UserService {
  static async updateBalance(userId, amount) {
    try {
      const userExists = await User.findByPk(userId);
      
      if (!userExists) {
        throw new Error('User not found');
      }
      
      const query = `
        UPDATE users 
        SET 
          balance = balance + :amount,
          "updatedAt" = NOW() 
        WHERE 
          id = :userId 
          AND balance + :amount >= 0
        RETURNING id, balance
      `;
      
      const [results] = await sequelize.query(query, {
        replacements: { 
          userId, 
          amount: parseFloat(amount)
        },
        type: sequelize.QueryTypes.UPDATE
      });
      
      if (!results || results.length === 0) {
        throw new InsufficientFundsError();
      }
      
      return results[0];
    } catch (error) {
      if (error.name === 'InsufficientFundsError') {
        throw error;
      }
      if (error.message === 'User not found') {
        throw error;
      }
      console.error('Error updating balance:', error);
      throw new Error('Failed to update balance');
    }
  }
}

module.exports = UserService;