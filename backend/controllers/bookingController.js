const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const User = require('../models/User');
const { notifyBookingUpdate, notifyNewBooking } = require('../sockets/bookingSocket');

// @desc    Create a standard booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      workerId,
      category,
      date,
      timeSlot,
      address,
      city,
      pincode,
      notes,
      price,
    } = req.body;

    const workerUser = await User.findById(workerId);
    if (!workerUser) {
      return res.status(404).json({ success: false, message: 'Selected worker not found' });
    }

    const workerProfile = await Worker.findOne({ user: workerId });
    if (!workerProfile || workerProfile.approvalStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Selected worker is not approved or verified' });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      worker: workerId,
      category,
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || 'Immediate / Flexible',
      address: address || req.user.address || 'Address provided on booking',
      city: city || req.user.city || 'Default City',
      pincode: pincode || req.user.pincode || '400001',
      notes: notes || '',
      price: Number(price) || workerProfile.hourlyRate || 300,
      status: 'requested',
      isEmergency: false,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone profilePhoto city pincode address')
      .populate('worker', 'name email phone profilePhoto city pincode address');

    notifyNewBooking(populatedBooking);

    res.status(201).json({
      success: true,
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Emergency / On-Demand Booking (Auto-assigns first available worker)
// @route   POST /api/bookings/emergency
// @access  Private (Customer)
exports.createEmergencyBooking = async (req, res, next) => {
  try {
    const { category, city, pincode, address, notes } = req.body;

    const searchCity = city || req.user.city || '';
    const searchPincode = pincode || req.user.pincode || '';

    // Find verified available workers for this category
    let availableWorkers = await Worker.find({
      approvalStatus: 'approved',
      availabilityStatus: 'available',
      categories: { $in: [category] },
    }).populate('user');

    if (!availableWorkers || availableWorkers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No available verified workers found right now for ${category}. Please try regular booking or check back shortly.`,
      });
    }

    // Try matching by city first, then pincode, or fallback to first available worker
    let matchedWorker = availableWorkers.find(
      (w) => w.user && w.user.city.toLowerCase() === searchCity.toLowerCase()
    );

    if (!matchedWorker) {
      matchedWorker = availableWorkers.find(
        (w) => w.user && w.user.pincode === searchPincode
      );
    }

    if (!matchedWorker) {
      matchedWorker = availableWorkers[0];
    }

    const booking = await Booking.create({
      customer: req.user._id,
      worker: matchedWorker.user._id,
      category,
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'EMERGENCY / IMMEDIATE',
      address: address || req.user.address || 'Emergency Service Location',
      city: searchCity || matchedWorker.user.city || 'Mumbai',
      pincode: searchPincode || matchedWorker.user.pincode || '400001',
      notes: notes || 'EMERGENCY ON-DEMAND BOOKING REQUEST',
      price: matchedWorker.hourlyRate * 1.25, // 25% emergency surge allowance for workers
      status: 'requested',
      isEmergency: true,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone profilePhoto city pincode address')
      .populate('worker', 'name email phone profilePhoto city pincode address');

    notifyNewBooking(populatedBooking);

    res.status(201).json({
      success: true,
      message: `Emergency booking auto-assigned to ${matchedWorker.user.name}`,
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings (Customer or Worker)
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query = { customer: req.user._id };
    } else if (req.user.role === 'worker') {
      query = { worker: req.user._id };
    } else if (req.user.role === 'societyAdmin' || req.user.role === 'federationAdmin') {
      // Admin sees all or society specific
      query = {};
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone profilePhoto city pincode address')
      .populate('worker', 'name email phone profilePhoto city pincode address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone profilePhoto city pincode address')
      .populate('worker', 'name email phone profilePhoto city pincode address');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Accepted, In Progress, Completed, Rejected)
// @route   PUT /api/bookings/:id/status
// @access  Private (Worker, Customer, Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['requested', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Strict Guard: If worker is updating status, worker must be approved
    if (req.user.role === 'worker') {
      const workerProfile = await Worker.findOne({ user: req.user._id });
      if (!workerProfile || workerProfile.approvalStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Unapproved or rejected worker cannot accept or update bookings.',
        });
      }
    }

    booking.status = status;
    await booking.save();

    // Auto-manage worker availability status
    if (status === 'accepted') {
      await Worker.findOneAndUpdate(
        { user: booking.worker },
        { availabilityStatus: 'busy' }
      );
    } else if (['completed', 'rejected', 'cancelled'].includes(status)) {
      await Worker.findOneAndUpdate(
        { user: booking.worker },
        { availabilityStatus: 'available' }
      );
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone profilePhoto city pincode address')
      .populate('worker', 'name email phone profilePhoto city pincode address');

    // Notify real-time subscribers via Socket.io
    notifyBookingUpdate(updatedBooking);

    res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
