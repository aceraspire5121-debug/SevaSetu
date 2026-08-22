const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Worker must select a registered Labour Cooperative Society'],
    },
    categories: {
      type: [String],
      required: [true, 'Worker must select at least one service category'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Worker must belong to at least one category',
      },
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Please specify hourly / per-service rate'],
      min: [50, 'Hourly rate cannot be less than ₹50'],
    },
    bio: {
      type: String,
      required: [true, 'Please provide a worker bio / skill summary'],
      minlength: [10, 'Worker bio must be at least 10 characters long'],
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: [0, 'Experience years cannot be negative'],
      max: [50, 'Experience years cannot exceed 50'],
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    verifiedBadge: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', WorkerSchema);
