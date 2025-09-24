const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  problemStatement: {
    type: String,
    required: true
  },
  techStack: [{
    type: String,
    required: true,
    trim: true
  }],
  role: {
    type: String,
    required: true
  },
  challenges: [{
    type: String,
    trim: true
  }],
  impact: {
    metrics: [{
      label: String,
      value: String
    }],
    description: String
  },
  image: {
    type: String,
    default: '/images/default-profile.jpg'
  },
  links: {
    github: { type: String, default: '' },
    live: { type: String, default: '' },
    demo: { type: String, default: '' }
  },
  featured: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Project', projectSchema);
