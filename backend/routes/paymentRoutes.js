const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getInvoiceData,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/invoice/:bookingId', protect, getInvoiceData);

module.exports = router;
