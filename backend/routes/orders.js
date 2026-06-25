const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/orders', authenticate, orderController.placeOrder);
router.get('/orders', authenticate, orderController.getOrders);

module.exports = router;
