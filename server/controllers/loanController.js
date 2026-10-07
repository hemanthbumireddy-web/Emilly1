// server/controllers/loanController.js
const loanService = require('../services/loanService.js');

const listLoans = async (req, res) => {
  try {
    const { type, minRate, maxRate, sort } = req.query;
    const loans = await loanService.getLoans({ type, minRate, maxRate, sort });
    return res.status(200).json(loans);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to fetch loans' });
  }
};

const getLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await loanService.getLoanById(id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    return res.status(200).json(loan);
  } catch (err) {
    const status = err.statusCode || (err.message.includes('not found') ? 404 : 500);
    return res.status(status).json({ error: err.message || 'Failed to fetch loan' });
  }
};

module.exports = {
  listLoans,
  getLoan,
};
