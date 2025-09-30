const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Frontend', 'Backend', 'Database', 'DevOps/Cloud', 'Tools', 'Languages', 'Other']
  },
  proficiency: {
    type: String,
    required: true,
    enum: ['Basic', 'Intermediate', 'Advanced', 'Expert']
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0,
    default: 1
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
