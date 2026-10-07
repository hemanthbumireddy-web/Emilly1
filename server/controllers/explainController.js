// server/controllers/explainController.js
const { explainComparison } = require('../services/aiService.js');

const handleExplain = async (req, res) => {
  try {
    const comparisonData = req.body;
    const recommendation = await explainComparison(comparisonData);
    return res.status(200).json({ recommendation });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to generate explanation' });
  }
};

module.exports = {
  handleExplain,
};
