/**
 * Форматирует денежные значения
 * @param {number} amount - Сумма для форматирования
 * @returns {string} Отформатированная сумма
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };
  
  /**
   * Логирует операции с балансом
   * @param {number} userId - ID пользователя
   * @param {number} amount - Сумма операции
   * @param {number} newBalance - Новый баланс после операции
   */
  const logBalanceOperation = (userId, amount, newBalance) => {
    const operation = amount >= 0 ? 'пополнение' : 'списание';
    console.log(`[${new Date().toISOString()}] Пользователь ${userId}: ${operation} на сумму ${Math.abs(amount)}. Новый баланс: ${newBalance}`);
  };
  
  module.exports = {
    formatCurrency,
    logBalanceOperation
  };