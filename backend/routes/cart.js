const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/cart', authenticate, cartController.getCart);
router.post('/cart', authenticate, cartController.addToCart);
router.put('/cart/:id', authenticate, cartController.updateCartItem);
router.delete('/cart/:id', authenticate, cartController.removeCartItem);

module.exports = router;
