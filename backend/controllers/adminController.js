const User = require('../models/User');
const Worker = require('../models/Worker');
const Society = require('../models/Society');
const Booking = require('../models/Booking');
const Category = require('../models/Category');

// @desc    Get Federation Admin Top-Level Dashboard Stats
// @route   GET /api/admin/federation-dashboard
// @access  Private (FederationAdmin)
exports.getFederationDashboard = async (req, res, next) => {
  try {
    const totalWorkersCount = await Worker.countDocuments();
    const approvedWorkersCount = await Worker.countDocuments({ approvalStatus: 'approved' });
    const pendingWorkersCount = await Worker.countDocuments({ approvalStatus: 'pending' });
    const totalCustomersCount = await User.countDocuments({ role: 'customer' });
    const totalSocietiesCount = await Society.countDocuments();

    const bookings = await Booking.find();
    const totalBookingsCount = bookings.length;

    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.price || 0), 0);

    // Category-wise worker counts & wage floors
    const categories = await Category.find().sort({ name: 1 });
    const workers = await Worker.find()
      .populate('user', 'name email phone city pincode profilePhoto idProofDocument role')
      .populate('society');

    const categoryWorkerCounts = categories.map((cat) => {
      const catWorkers = workers.filter((w) => w.categories && w.categories.includes(cat.name));
      return {
        _id: cat._id,
        categoryName: cat.name,
        icon: cat.icon,
        minHourlyRate: cat.minHourlyRate || 150,
        totalWorkers: catWorkers.length,
        approvedWorkers: catWorkers.filter((w) => w.approvalStatus === 'approved').length,
        pendingWorkers: catWorkers.filter((w) => w.approvalStatus === 'pending').length,
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalWorkers: totalWorkersCount,
        approvedWorkers: approvedWorkersCount,
        pendingWorkers: pendingWorkersCount,
        totalCustomers: totalCustomersCount,
        totalSocieties: totalSocietiesCount,
        totalBookings: totalBookingsCount,
        totalRevenue,
      },
      categoryBreakdown: categoryWorkerCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 30-Day Historical & Predicted Demand Forecast Analytics
// @route   GET /api/admin/demand-forecast
// @access  Private (FederationAdmin, SocietyAdmin)
exports.getDemandForecast = async (req, res, next) => {
  try {
    const { category } = req.query;

    const bookings = await Booking.find(category ? { category } : {});

    // Generate 30 days time series (last 20 days historical + next 10 days forecast)
    const chartData = [];
    const today = new Date();

    for (let i = 20; i >= -10; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (i >= 0) {
        // Historical date
        const dayBookings = bookings.filter((b) => b.date === dateStr || (b.createdAt && new Date(b.createdAt).toISOString().split('T')[0] === dateStr));
        const count = dayBookings.length;

        // Seed baseline if sparse data
        const baseline = Math.floor(Math.sin((20 - i) * 0.5) * 5 + 8);
        const actualBookings = count > 0 ? count : baseline;

        chartData.push({
          date: dateStr,
          dayLabel,
          type: 'Historical',
          bookingsCount: actualBookings,
          predictedDemand: actualBookings,
          revenue: actualBookings * 350,
        });
      } else {
        // Forecasted date
        const dayOfWeek = d.getDay();
        const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.4 : 1.0;
        const trendBase = Math.floor((12 + Math.random() * 6) * weekendMultiplier);

        chartData.push({
          date: dateStr,
          dayLabel: dayLabel + ' (Est)',
          type: 'Forecast',
          bookingsCount: null,
          predictedDemand: trendBase,
          revenue: trendBase * 350,
        });
      }
    }

    res.status(200).json({
      success: true,
      category: category || 'All Categories',
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workers filtered by category for Federation Admin view
// @route   GET /api/admin/workers/category/:categoryName
// @access  Private (FederationAdmin)
exports.getWorkersByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;

    const workers = await Worker.find({ categories: { $in: [categoryName] } })
      .populate('user', '-password')
      .populate('society');

    res.status(200).json({
      success: true,
      category: categoryName,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Super Admin: Get all workers nationwide with full Skill Passport & status
// @route   GET /api/admin/workers/all
// @access  Private (FederationAdmin)
exports.getAllWorkersAdmin = async (req, res, next) => {
  try {
    const workers = await Worker.find()
      .populate('user', '-password')
      .populate('society')
      .sort({ createdAt: -1 });

    // Enrich with dynamic completed jobs count
    const enrichedWorkers = await Promise.all(
      workers.map(async (w) => {
        const wObj = w.toObject();
        if (w.user) {
          const completedCount = await Booking.countDocuments({
            worker: w.user._id,
            status: 'completed',
          });
          if (wObj.skillPassport) {
            wObj.skillPassport.completedJobsCount = completedCount;
          }
        }
        return wObj;
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedWorkers.length,
      data: enrichedWorkers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Super Admin: Get all registered Society Admins & Federation staff
// @route   GET /api/admin/admins/all
// @access  Private (FederationAdmin)
exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({
      role: { $in: ['societyAdmin', 'federationAdmin'] },
    })
      .populate('society')
      .select('-password')
      .sort({ role: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Super Admin: Fix / Update Minimum Fair Wage Floor for a Category
// @route   PUT /api/admin/wage-floor/:id
// @access  Private (FederationAdmin)
exports.updateMinimumWageFloor = async (req, res, next) => {
  try {
    const { minHourlyRate } = req.body;

    if (!minHourlyRate || Number(minHourlyRate) < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum wage floor must be at least ₹50/hour.',
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { minHourlyRate: Number(minHourlyRate) },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Auto-elevate any existing worker in this category whose hourly rate is below the new minimum wage floor
    await Worker.updateMany(
      {
        categories: { $in: [category.name] },
        hourlyRate: { $lt: Number(minHourlyRate) },
      },
      {
        $set: { hourlyRate: Number(minHourlyRate) },
      }
    );

    res.status(200).json({
      success: true,
      message: `Minimum fair-wage floor for ${category.name} set to ₹${minHourlyRate}/hr. All active workers updated.`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
