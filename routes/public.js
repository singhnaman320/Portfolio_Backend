const express = require('express');
const { body, validationResult } = require('express-validator');
const Home = require('../models/Home');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Skill = require('../models/Skill');
const Contact = require('../models/Contact');

const router = express.Router();

// @route   GET /api/public/home
// @desc    Get home information
// @access  Public
router.get('/home', async (req, res) => {
  try {
    const home = await Home.findOne({ isActive: true }).lean();
    res.json(home || {});
  } catch (error) {
    console.error('Get home error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/public/projects
// @desc    Get all active projects
// @access  Public
router.get('/projects', async (req, res) => {
  try {
    const { featured } = req.query;
    let query = { isActive: true };
    
    if (featured === 'true') {
      query.featured = true;
    }

    const projects = await Project.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select('-isActive');
    
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/public/projects/:id
// @desc    Get single project
// @access  Public
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).select('-isActive');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/public/experiences
// @desc    Get all active experiences
// @access  Public
router.get('/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find({ isActive: true })
      .sort({ order: 1, startDate: -1 })
      .select('-isActive');
    
    res.json(experiences);
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/public/skills
// @desc    Get all active skills grouped by category
// @access  Public
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find({ isActive: true })
      .sort({ category: 1, order: 1 })
      .select('-isActive');
    
    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json(groupedSkills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/public/contact
// @desc    Submit contact form
// @access  Public
router.post('/contact', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      subject,
      message
    });

    await contact.save();

    res.status(201).json({ 
      message: 'Thank you for your message! I will get back to you soon.' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});


// @route   GET /api/public/stats
// @desc    Get portfolio stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [projectCount, experienceCount, skillCount] = await Promise.all([
      Project.countDocuments({ isActive: true }),
      Experience.countDocuments({ isActive: true }),
      Skill.countDocuments({ isActive: true })
    ]);

    res.json({
      projects: projectCount,
      experiences: experienceCount,
      skills: skillCount
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
