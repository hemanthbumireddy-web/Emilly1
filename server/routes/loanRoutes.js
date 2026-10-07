// server/routes/loanRoutes.js
const { Router } = require('express');
const { listLoans, getLoan } = require('../controllers/loanController.js');

const router = Router();

router.get('/', listLoans);
router.get('/:id', getLoan);

module.exports = router;
