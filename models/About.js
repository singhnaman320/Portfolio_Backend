const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  tagline: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: '/images/default-profile.jpg'
  },
  resumeUrl: {
    type: String,
    default: '/documents/naman-singh-resume.pdf'
  },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    codeforces: { type: String, default: '' }
  },
  highlights: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('About', aboutSchema);
