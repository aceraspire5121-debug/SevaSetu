const User = require('../models/User');
const Worker = require('../models/Worker');
const Society = require('../models/Society');
const Category = require('../models/Category');

// Send token response with user & worker details
const sendTokenResponse = async (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  let workerProfile = null;
  if (user.role === 'worker') {
    workerProfile = await Worker.findOne({ user: user._id }).populate('society');
  }

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      city: user.city,
      pincode: user.pincode,
      address: user.address,
      profilePhoto: user.profilePhoto,
      idProofDocument: user.idProofDocument,
    },
    worker: workerProfile,
  });
};

// @desc    Register user (Customer or Worker)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      city,
      pincode,
      address,
      profilePhoto,
      idProofDocument,
      // Worker specific fields
      societyId,
      categories,
      hourlyRate,
      bio,
      experienceYears,
    } = req.body;

    // Server-side strict validations
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Full name is required and must be at least 3 characters long' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const phoneClean = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneClean || !phoneRegex.test(phoneClean)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9' });
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincode || !pincodeRegex.test(pincode)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit Indian postal pincode (e.g. 400001)' });
    }

    if (!address || address.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please enter a complete residential address (at least 5 characters)' });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account already exists with this email address' });
    }

    // Worker Mandatory Checks
    if (role === 'worker') {
      if (!idProofDocument || idProofDocument.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Worker Registration MUST include a valid Aadhaar / Government ID Proof Document Upload.',
        });
      }

      if (!societyId) {
        return res.status(400).json({
          success: false,
          message: 'Worker must select an affiliated Labour Cooperative Society.',
        });
      }

      let parsedCategories = categories;
      if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (e) {
          parsedCategories = [categories];
        }
      }

      if (!parsedCategories || parsedCategories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Worker must select at least one service category.',
        });
      }

      // Check category minimum fair wage floor
      const dbCategories = await Category.find({ name: { $in: parsedCategories } });
      const maxFloor = dbCategories.reduce((max, c) => Math.max(max, c.minHourlyRate || 150), 150);

      if (Number(hourlyRate) < maxFloor) {
        return res.status(400).json({
          success: false,
          message: `Hourly rate (₹${hourlyRate}) cannot be below the admin set fair-wage floor of ₹${maxFloor}/hr for selected categories.`,
        });
      }

      if (!bio || bio.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Worker bio / skill description must be at least 10 characters long.',
        });
      }
    }

    // Create base user
    const user = await User.create({
      name,
      email,
      password,
      phone: phoneClean,
      role: role || 'customer',
      city,
      pincode,
      address,
      profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      idProofDocument: idProofDocument || '',
      aadhaarNumber: req.body.aadhaarNumber || '',
      society: role === 'worker' ? societyId : undefined,
    });

    // If role is worker, create Worker profile
    if (user.role === 'worker') {
      let parsedCategories = categories;
      if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (e) {
          parsedCategories = [categories];
        }
      }

      await Worker.create({
        user: user._id,
        society: societyId,
        categories: parsedCategories,
        hourlyRate: Number(hourlyRate),
        bio: bio.trim(),
        experienceYears: Number(experienceYears) || 0,
        approvalStatus: 'pending',
        availabilityStatus: 'available',
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await Worker.findOne({ user: user._id }).populate('society');
    }

    res.status(200).json({
      success: true,
      user,
      worker: workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      city: req.body.city,
      pincode: req.body.pincode,
      address: req.body.address,
    };

    if (req.body.profilePhoto) fieldsToUpdate.profilePhoto = req.body.profilePhoto;
    if (req.body.idProofDocument) fieldsToUpdate.idProofDocument = req.body.idProofDocument;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    let workerProfile = null;
    if (user.role === 'worker') {
      const workerFields = {};
      if (req.body.hourlyRate) workerFields.hourlyRate = req.body.hourlyRate;
      if (req.body.bio) workerFields.bio = req.body.bio;
      if (req.body.categories) workerFields.categories = req.body.categories;

      workerProfile = await Worker.findOneAndUpdate({ user: user._id }, workerFields, {
        new: true,
        runValidators: true,
      }).populate('society');
    }

    res.status(200).json({
      success: true,
      user,
      worker: workerProfile,
    });
  } catch (error) {
    next(error);
  }
};
