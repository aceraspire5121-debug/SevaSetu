const express = require('express');
const router = express.Router();
const {
  createBooking,
  createEmergencyBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.post('/emergency', protect, createEmergencyBooking);
router.get('/', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
