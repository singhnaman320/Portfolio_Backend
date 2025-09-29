const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Home = require('../models/Home');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Skill = require('../models/Skill');
const Contact = require('../models/Contact');

const router = express.Router();

// All routes are protected with auth middleware
router.use(auth);

// ============ HOME PAGE ROUTES ============

// @route   GET /api/admin/home
// @desc    Get home page information
// @access  Private
router.get('/home', async (req, res) => {
  try {
    const home = await Home.findOne({ isActive: true });
    res.json(home || {});
  } catch (error) {
    console.error('Get home error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/home
// @desc    Create or update home page information
// @access  Private
router.post('/home', [
  body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('title').notEmpty().withMessage('Title is required').trim().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
  body('tagline').notEmpty().withMessage('Tagline is required').trim().isLength({ min: 5 }).withMessage('Tagline must be at least 5 characters'),
  body('bio').notEmpty().withMessage('Bio is required').trim().isLength({ min: 10 }).withMessage('Bio must be at least 10 characters')
], async (req, res) => {
  try {
    console.log('Received home data:', req.body);
    console.log('Field lengths:', {
      name: req.body.name?.length,
      title: req.body.title?.length,
      tagline: req.body.tagline?.length,
      bio: req.body.bio?.length
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, title, tagline, bio } = req.body;
    
    const homeData = {
      name,
      title,
      tagline,
      bio,
      socialLinks: {},
      highlights: [],
      profileImage: '/images/default-profile.jpg',
      resumeUrl: '/documents/naman-singh-resume.pdf'
    };

    // Update existing or create new
    let home = await Home.findOne({ isActive: true });
    if (home) {
      Object.assign(home, homeData);
      await home.save();
    } else {
      home = new Home(homeData);
      await home.save();
    }

    res.json({ message: 'Home information updated successfully', home });
  } catch (error) {
    console.error('Update home error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ PROJECT ROUTES ============

// @route   GET /api/admin/projects
// @desc    Get all projects
// @access  Private
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/projects
// @desc    Create new project
// @access  Private
router.post('/projects', [
  body('title').trim().isLength({ min: 2 }).withMessage('Title is required'),
  body('shortDescription').trim().isLength({ min: 10 }).withMessage('Short description is required'),
  body('problemStatement').trim().isLength({ min: 10 }).withMessage('Problem statement is required'),
  body('role').trim().isLength({ min: 2 }).withMessage('Role is required')
], async (req, res) => {
  try {
    console.log('Received project data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { 
      title, shortDescription, problemStatement, techStack, role, 
      implementationDetails, results, githubUrl, liveUrl, featured 
    } = req.body;

    const projectData = {
      title,
      shortDescription,
      problemStatement,
      techStack: Array.isArray(techStack) ? techStack : [],
      role,
      implementationDetails: Array.isArray(implementationDetails) ? implementationDetails : [],
      results: Array.isArray(results) ? results : [],
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      featured: Boolean(featured),
      order: 0
    };

    // No image uploads - using static images or external URLs

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/projects/:id
// @desc    Update project
// @access  Private
router.put('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { 
      title, shortDescription, problemStatement, techStack, role, 
      implementationDetails, results, githubUrl, liveUrl, featured 
    } = req.body;

    const updateData = {
      title,
      shortDescription,
      problemStatement,
      techStack: Array.isArray(techStack) ? techStack : project.techStack,
      role,
      implementationDetails: Array.isArray(implementationDetails) ? implementationDetails : project.implementationDetails,
      results: Array.isArray(results) ? results : project.results,
      githubUrl: githubUrl || project.githubUrl,
      liveUrl: liveUrl || project.liveUrl,
      featured: Boolean(featured),
      order: project.order
    };

    // No image uploads - using static images or external URLs

    Object.assign(project, updateData);
    await project.save();

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.isActive = false;
    await project.save();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ EXPERIENCE ROUTES ============

// @route   GET /api/admin/experiences
// @desc    Get all experiences
// @access  Private
router.get('/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find({ isActive: true }).sort({ order: 1, startDate: -1 });
    res.json(experiences);
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/experiences
// @desc    Create new experience
// @access  Private
router.post('/experiences', [
  body('company').trim().isLength({ min: 2 }).withMessage('Company name is required'),
  body('position').trim().isLength({ min: 2 }).withMessage('Position is required'),
  body('location').optional().trim(),
  body('startDate').trim().isLength({ min: 1 }).withMessage('Start date is required'),
  body('endDate').optional().trim(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { 
      company, position, location, startDate, endDate, 
      description, achievements, technologies, order 
    } = req.body;

    const experienceData = {
      company,
      position,
      location: location || '',
      startDate: startDate, // Keep as string
      endDate: endDate || '',
      description: description || '',
      achievements: achievements ? JSON.parse(achievements) : [],
      technologies: technologies ? JSON.parse(technologies) : [],
      order: parseInt(order) || 0
    };

    // No logo uploads - using static images or external URLs

    const experience = new Experience(experienceData);
    await experience.save();

    res.status(201).json({ message: 'Experience created successfully', experience });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/experiences/:id
// @desc    Update experience
// @access  Private
router.put('/experiences/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    const { 
      company, position, location, startDate, endDate, 
      description, achievements, technologies, order 
    } = req.body;

    const updateData = {
      company,
      position,
      location: location || '',
      startDate: startDate, // Keep as string
      endDate: endDate || '',
      description: description || '',
      achievements: achievements ? JSON.parse(achievements) : experience.achievements,
      technologies: technologies ? JSON.parse(technologies) : experience.technologies,
      order: parseInt(order) || experience.order
    };

    // No logo uploads - using static images or external URLs

    Object.assign(experience, updateData);
    await experience.save();

    res.json({ message: 'Experience updated successfully', experience });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/experiences/:id
// @desc    Delete experience
// @access  Private
router.delete('/experiences/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    experience.isActive = false;
    await experience.save();

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ SKILL ROUTES ============

// @route   GET /api/admin/skills
// @desc    Get all skills
// @access  Private
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find({ isActive: true }).sort({ category: 1, order: 1 });
    res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/skills
// @desc    Create new skill
// @access  Private
router.post('/skills', [
  body('category').isIn(['Frontend', 'Backend', 'Database', 'DevOps/Cloud', 'Tools', 'Languages', 'Other']).withMessage('Valid category is required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Skill name is required'),
  body('proficiency').isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert']).withMessage('Valid proficiency is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { category, name, proficiency, icon, order } = req.body;

    const skill = new Skill({
      category,
      name,
      proficiency,
      icon: icon || '',
      order: parseInt(order) || 0
    });

    await skill.save();

    res.status(201).json({ message: 'Skill created successfully', skill });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/skills/:id
// @desc    Update skill
// @access  Private
router.put('/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const { category, name, proficiency, icon, order } = req.body;

    Object.assign(skill, {
      category,
      name,
      proficiency,
      icon: icon || skill.icon,
      order: parseInt(order) || skill.order
    });

    await skill.save();

    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/skills/:id
// @desc    Delete skill
// @access  Private
router.delete('/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    skill.isActive = false;
    await skill.save();

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ CONTACT ROUTES ============

// @route   GET /api/admin/contacts
// @desc    Get all contact messages
// @access  Private
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/contacts/:id/read
// @desc    Mark contact as read
// @access  Private
router.put('/contacts/:id/read', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.isRead = true;
    await contact.save();

    res.json({ message: 'Contact marked as read' });
  } catch (error) {
    console.error('Mark contact read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/contacts/:id/reply
// @desc    Reply to contact
// @access  Private
router.put('/contacts/:id/reply', [
  body('reply').trim().isLength({ min: 1 }).withMessage('Reply is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.reply = req.body.reply;
    contact.isReplied = true;
    contact.repliedAt = new Date();
    contact.isRead = true;
    await contact.save();

    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Reply contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
