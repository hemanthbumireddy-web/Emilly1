// server/routes/compareRoutes.js
const { Router } = require('express');
const { compareLoans } = require('../controllers/compareController.js');

const router = Router();

router.post('/', compareLoans);

module.exports = router;
