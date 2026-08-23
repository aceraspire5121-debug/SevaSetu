const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  title: { type: String, default: 'Vocational Competency Certificate' },
  issuer: { type: String, default: 'National Skill Development Corporation (NSDC)' },
  issueYear: { type: Number, default: 2024 },
  documentUrl: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'verified' },
});

const SkillPassportSchema = new mongoose.Schema({
  passportId: {
    type: String,
    default: () => `SP-${Math.floor(100000 + Math.random() * 900000)}`,
  },
  issueDate: { type: Date, default: Date.now },
  specialization: { type: String, default: 'General Domestic & Commercial Services' },
  trainingInstitute: { type: String, default: 'Government ITI / Skill India Partner' },
  skillTier: {
    type: String,
    enum: ['Certified Specialist', 'Senior Artisan', 'Master Technician'],
    default: 'Certified Specialist',
  },
  aadhaarVerified: { type: Boolean, default: true },
  punctualityScore: { type: Number, default: 98, min: 50, max: 100 },
  completedJobsCount: { type: Number, default: 0, min: 0 },
  wageFloorCompliance: { type: Boolean, default: true },
  certificates: [CertificateSchema],
});

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
    skillPassport: {
      type: SkillPassportSchema,
      default: () => ({}),
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
