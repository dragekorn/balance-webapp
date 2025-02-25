const UserService = require('../services/userService');

class UserController {
  static async updateBalance(req, res, next) {
    try {
      const { userId, amount } = req.body;
      const user = await UserService.updateBalance(userId, amount);
      res.json({ success: true, balance: user.balance });
    } catch (error) {
      if (error.message === 'InsufficientFundsError') {
        next({ name: 'InsufficientFundsError' });
      } else {
        next(error);
      }
    }
  }
}

module.exports = UserController;