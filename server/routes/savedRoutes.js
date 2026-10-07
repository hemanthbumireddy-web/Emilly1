// server/routes/savedRoutes.js
const { Router } = require('express');
const { verifyAuth } = require('../middleware/auth.js');
const {
  listSaved,
  createSaved,
  deleteSaved,
} = require('../controllers/savedController.js');

const router = Router();

router.get('/', verifyAuth, listSaved);
router.post('/', verifyAuth, createSaved);
router.delete('/:id', verifyAuth, deleteSaved);

module.exports = router;
