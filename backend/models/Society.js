const mongoose = require('mongoose');

const SocietySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add society name'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please add society code'],
      unique: true,
      uppercase: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Society', SocietySchema);
