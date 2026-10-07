// server/routes/explainRoutes.js
const { Router } = require('express');
const { handleExplain } = require('../controllers/explainController.js');

const router = Router();

router.post('/', handleExplain);

module.exports = router;
