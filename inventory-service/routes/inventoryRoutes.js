const express = require('express');
const router = express.Router();
const { validateInventory, reduceInventory } = require('../controllers/inventoryController');

router.post('/validate', validateInventory);
router.post('/reduce', reduceInventory);

module.exports = router;
