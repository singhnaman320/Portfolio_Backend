const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  problemStatement: {
    type: String,
    required: true
  },
  techStack: [{
    type: String,
    trim: true
  }],
  role: {
    type: String,
    required: true
  },
  implementationDetails: [{
    type: String,
    trim: true
  }],
  results: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    default: ''
  },
  liveUrl: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: '/images/default-project.jpg'
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
