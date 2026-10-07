// server/controllers/compareController.js
const compareService = require('../services/compareService.js');

const compareLoans = async (req, res) => {
  try {
    const { loanIds, amount, tenureMonths } = req.body;
    const result = await compareService.compareLoans({ loanIds, amount, tenureMonths });
    return res.status(200).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to compare loans' });
  }
};

module.exports = {
  compareLoans,
};
