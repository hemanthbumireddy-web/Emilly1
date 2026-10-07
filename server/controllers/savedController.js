// server/controllers/savedController.js
const savedService = require('../services/savedService.js');

const listSaved = async (req, res) => {
  try {
    const list = await savedService.getSaved(req.token, req.user.id);
    return res.status(200).json(list);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to retrieve saved comparisons' });
  }
};

const createSaved = async (req, res) => {
  try {
    const { loanIds, amount, tenureMonths } = req.body;
    const saved = await savedService.createSaved(req.token, req.user.id, {
      loanIds,
      amount,
      tenureMonths,
    });
    return res.status(201).json(saved);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to save comparison' });
  }
};

const deleteSaved = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await savedService.deleteSaved(req.token, req.user.id, id);
    return res.status(200).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to delete saved comparison' });
  }
};

module.exports = {
  listSaved,
  createSaved,
  deleteSaved,
};
