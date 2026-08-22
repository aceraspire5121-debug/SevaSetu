const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    icon: {
      type: String,
      default: 'Wrench',
    },
    description: {
      type: String,
      default: '',
    },
    minHourlyRate: {
      type: Number,
      required: [true, 'Please add a minimum fair-wage floor rate'],
      default: 150,
    },
  },
  { timestamps: true }
);

CategorySchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
