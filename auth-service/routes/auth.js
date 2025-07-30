const express = require('express');
const { register, login, me, update } = require('../controller/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/me', me)
router.post('/update', update)

module.exports = router;
