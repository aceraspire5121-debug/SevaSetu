const Worker = require('../models/Worker');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get all verified available workers (with filters & sorting)
// @route   GET /api/workers
// @access  Public
exports.getVerifiedWorkers = async (req, res, next) => {
  try {
    const { category, city, pincode, sortBy, availability } = req.query;

    let queryFilter = { approvalStatus: 'approved' };

    if (availability) {
      queryFilter.availabilityStatus = availability;
    } else {
      queryFilter.availabilityStatus = 'available';
    }

    if (category) {
      queryFilter.categories = { $in: [category] };
    }

    let workers = await Worker.find(queryFilter)
      .populate({
        path: 'user',
        select: 'name email phone city pincode address profilePhoto idProofDocument role',
      })
      .populate('society');

    // Filter by city or pincode if specified
    if (city) {
      workers = workers.filter(
        (w) => w.user && w.user.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (pincode) {
      workers = workers.filter(
        (w) => w.user && w.user.pincode.includes(pincode)
      );
    }

    // Sort workers
    if (sortBy === 'rating') {
      workers.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_low') {
      workers.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'price_high') {
      workers.sort((a, b) => b.hourlyRate - a.hourlyRate);
    }

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get worker details by User ID or Worker ID
// @route   GET /api/workers/:id
// @access  Public
exports.getWorkerById = async (req, res, next) => {
  try {
    let worker = await Worker.findById(req.params.id)
      .populate('user', '-password')
      .populate('society');

    if (!worker) {
      worker = await Worker.findOne({ user: req.params.id })
        .populate('user', '-password')
        .populate('society');
    }

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const reviews = await Review.find({ worker: worker.user._id })
      .populate('customer', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        worker,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Worker Availability status (available / busy)
// @route   PUT /api/workers/availability
// @access  Private (Worker)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const { status } = req.body; // 'available' or 'busy' or 'offline'
    if (!['available', 'busy', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid availability status' });
    }

    const workerProfile = await Worker.findOne({ user: req.user._id });
    if (!workerProfile || workerProfile.approvalStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Unapproved or rejected worker cannot toggle availability status.',
      });
    }

    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { availabilityStatus: status },
      { new: true }
    ).populate('society');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject Worker (Society Admin or Federation Admin)
// @route   PUT /api/workers/:id/approve-reject
// @access  Private (SocietyAdmin, FederationAdmin)
exports.approveRejectWorker = async (req, res, next) => {
  try {
    const { approvalStatus, rejectionReason } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const updateData = {
      approvalStatus,
      rejectionReason: approvalStatus === 'rejected' ? (rejectionReason || 'Documents or profile incomplete') : '',
      verifiedBadge: approvalStatus === 'approved',
    };

    const worker = await Worker.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('user', '-password')
      .populate('society');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get worker stats (bookings count, earnings, ratings)
// @route   GET /api/workers/stats/me
// @access  Private (Worker)
exports.getWorkerStats = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ worker: req.user._id });
    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const earningsThisMonth = completedBookings
      .filter((b) => new Date(b.createdAt) >= firstDayThisMonth)
      .reduce((sum, b) => sum + (b.price || 0), 0);
    res.status(200).json({
      success: true,
      stats: {
        totalBookings: bookings.length,
        completedJobs: completedBookings.length,
        totalEarnings,
        earningsThisMonth,
        rating: worker.rating,
        totalRatings: worker.totalRatings,
        availabilityStatus: worker.availabilityStatus,
        approvalStatus: worker.approvalStatus,
        verifiedBadge: worker.verifiedBadge,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resubmit Worker Application & Aadhaar Document after Rejection
// @route   PUT /api/workers/resubmit-application
// @access  Private (Worker)
exports.resubmitWorkerApplication = async (req, res, next) => {
  try {
    const { idProofDocument, aadhaarNumber } = req.body;

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    worker.approvalStatus = 'pending';
    worker.rejectionReason = '';
    await worker.save();

    if (idProofDocument || aadhaarNumber) {
      const updateFields = {};
      if (idProofDocument) updateFields.idProofDocument = idProofDocument;
      if (aadhaarNumber) updateFields.aadhaarNumber = aadhaarNumber;

      await User.findByIdAndUpdate(req.user._id, updateFields);
    }

    const updatedWorker = await Worker.findById(worker._id)
      .populate('user', '-password')
      .populate('society');

    res.status(200).json({
      success: true,
      message: 'Application resubmitted successfully for Society Admin review!',
      data: updatedWorker,
    });
  } catch (error) {
    next(error);
  }
};
