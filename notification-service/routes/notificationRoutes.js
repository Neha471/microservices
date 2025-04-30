const express = require('express');
const router = express.Router();
const { logNotification, getNotifications, fetchOrderInfo, getUserOrderStatuses } = require('../controllers/notificationController');

router.post('/log', logNotification);
router.get('/', getNotifications);
router.get('/order/:orderId', fetchOrderInfo);
router.get('/user-orders', getUserOrderStatuses);

module.exports = router;
