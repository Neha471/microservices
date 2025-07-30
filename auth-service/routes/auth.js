const express = require('express');
const { register, login, me, update } = require('../controller/auth');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, me)
router.post('/update', verifyToken, update)

module.exports = router;
