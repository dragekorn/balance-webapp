const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: err.errors.map(e => e.message)
      });
    }
  
    if (err.name === 'InsufficientFundsError') {
      return res.status(400).json({
        error: 'Insufficient funds'
      });
    }
  
    res.status(500).json({
      error: 'Internal server error'
    });
  };
  
  module.exports = errorHandler;