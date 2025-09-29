const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  startDate: {
    type: String, // Changed to String for flexible date formats
    required: true
  },
  endDate: {
    type: String, // Changed to String for flexible date formats
    default: '' // empty string means current job or not specified
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  achievements: [{
    type: String,
    trim: true
  }],
  technologies: [{
    type: String,
    trim: true
  }],
  companyLogo: {
    type: String,
    default: '/images/default-profile.jpg'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Experience', experienceSchema);
