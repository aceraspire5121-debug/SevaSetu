const express = require('express');
const router = express.Router();
const {
  createBooking,
  createEmergencyBooking,
  createBroadcastBooking,
  acceptBroadcastBooking,
  declineBroadcastBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.post('/emergency', protect, createEmergencyBooking);
router.post('/broadcast', protect, createBroadcastBooking);
router.put('/:id/accept-broadcast', protect, acceptBroadcastBooking);
router.put('/:id/decline-broadcast', protect, declineBroadcastBooking);
router.get('/', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
