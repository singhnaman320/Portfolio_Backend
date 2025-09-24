const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Frontend', 'Backend', 'Database', 'DevOps/Cloud', 'Tools', 'Languages', 'Other']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  proficiency: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  icon: {
    type: String,
    default: ''
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

module.exports = mongoose.model('Skill', skillSchema);
