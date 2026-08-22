const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

// @desc    Submit review for completed job
// @route   POST /api/reviews
// @access  Private (Customer)
exports.addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    // Check existing review
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Booking already reviewed' });
    }

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      worker: booking.worker,
      rating: Number(rating),
      comment: comment || '',
    });

    booking.reviewed = true;
    await booking.save();

    // Recalculate Worker average rating
    const workerProfile = await Worker.findOne({ user: booking.worker });
    if (workerProfile) {
      const allReviews = await Review.find({ worker: booking.worker });
      const avg = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
      workerProfile.rating = Number(avg.toFixed(1));
      workerProfile.totalRatings = allReviews.length;
      await workerProfile.save();
    }

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
exports.getWorkerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('customer', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
