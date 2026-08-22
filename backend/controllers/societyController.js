const Society = require('../models/Society');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get all societies
// @route   GET /api/societies
// @access  Public
exports.getSocieties = async (req, res, next) => {
  try {
    const societies = await Society.find({ active: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: societies.length,
      data: societies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new Labour Cooperative Society
// @route   POST /api/societies
// @access  Private (FederationAdmin)
exports.createSociety = async (req, res, next) => {
  try {
    const { name, code, city, pincode, address, contactEmail, contactPhone, adminName, adminPassword } = req.body;

    // Check if society code or name already exists
    const existingCode = await Society.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ success: false, message: `Society Code '${code}' already exists` });
    }

    // Check if user account for this admin email already exists or create new one
    let adminUser = await User.findOne({ email: contactEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: adminName || `${name} Admin`,
        email: contactEmail,
        password: adminPassword || 'password123',
        phone: contactPhone || '9820000000',
        role: 'societyAdmin',
        city: city || 'Mumbai',
        pincode: pincode || '400001',
        address: address || 'Society Office Address',
      });
    } else {
      // If user already exists, update role and password so login works 100%
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(adminPassword || 'password123', 10);
      adminUser = await User.findByIdAndUpdate(
        adminUser._id,
        {
          role: 'societyAdmin',
          password: hashedPassword,
          name: adminName || adminUser.name,
        },
        { new: true }
      );
    }

    const society = await Society.create({
      name,
      code,
      city,
      pincode,
      address,
      contactEmail,
      contactPhone,
      admin: adminUser._id,
    });

    // Link admin user to society
    await User.findByIdAndUpdate(adminUser._id, { society: society._id });

    res.status(201).json({
      success: true,
      message: `Society created & Admin account registered! Email: ${contactEmail}`,
      data: society,
      adminCredentials: {
        email: contactEmail,
        password: adminPassword || 'password123',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats for a specific Society Admin
// @route   GET /api/societies/my-society
// @access  Private (SocietyAdmin)
exports.getMySocietyDashboard = async (req, res, next) => {
  try {
    // 1. Try finding society by admin ID
    let society = await Society.findOne({ admin: req.user._id });

    // 2. Try finding society by User's society field
    if (!society && req.user.society) {
      society = await Society.findById(req.user.society);
    }

    // 3. Try finding society by contact email
    if (!society) {
      society = await Society.findOne({ contactEmail: req.user.email });
    }

    // 4. Strict Isolation Guard: If no society matches this admin, return empty dataset instead of cross-tenant fallback
    if (!society) {
      return res.status(200).json({
        success: true,
        society: { name: 'Unassigned Society Admin' },
        stats: {
          totalWorkers: 0,
          approvedWorkersCount: 0,
          pendingWorkersCount: 0,
          totalBookings: 0,
          totalRevenue: 0,
        },
        pendingWorkers: [],
        workers: [],
        recentBookings: [],
      });
    }

    // Get workers belonging STRICTLY to this society
    const workers = await Worker.find({ society: society._id })
      .populate('user', 'name email phone city pincode address profilePhoto idProofDocument aadhaarNumber createdAt')
      .populate('society');

    const pendingWorkers = workers.filter((w) => w.approvalStatus === 'pending');
    const approvedWorkers = workers.filter((w) => w.approvalStatus === 'approved');

    const workerUserIds = workers.map((w) => w.user && w.user._id);

    const bookings = await Booking.find({ worker: { $in: workerUserIds } })
      .populate('customer', 'name email phone')
      .populate('worker', 'name email phone')
      .sort({ createdAt: -1 });

    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.price || 0), 0);

    res.status(200).json({
      success: true,
      society,
      stats: {
        totalWorkers: workers.length,
        approvedWorkersCount: approvedWorkers.length,
        pendingWorkersCount: pendingWorkers.length,
        totalBookings: bookings.length,
        totalRevenue,
      },
      pendingWorkers,
      workers,
      recentBookings: bookings,
    });
  } catch (error) {
    next(error);
  }
};
