const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a full name'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      match: [/^[a-zA-Z\s\.\-\(\)]+$/, 'Name can only contain letters, spaces, dots, dashes, and parentheses'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address (e.g. user@domain.com)',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please add a 10-digit Indian mobile number'],
      trim: true,
      match: [
        /^(?:\+91[\-\s]?)?[6-9]\d{9}$/,
        'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9',
      ],
    },
    role: {
      type: String,
      enum: ['customer', 'worker', 'societyAdmin', 'federationAdmin'],
      default: 'customer',
    },
    city: {
      type: String,
      required: [true, 'Please add your city'],
      trim: true,
      minlength: [2, 'City name must be at least 2 characters long'],
    },
    pincode: {
      type: String,
      required: [true, 'Please add a 6-digit postal pincode'],
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian pincode (e.g. 400001)'],
    },
    address: {
      type: String,
      required: [true, 'Please provide a valid street address'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters long'],
    },
    profilePhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    },
    idProofDocument: {
      type: String,
      default: '',
    },
    aadhaarNumber: {
      type: String,
      default: '',
      trim: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
