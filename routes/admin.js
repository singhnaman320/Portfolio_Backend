const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const About = require('../models/About');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Skill = require('../models/Skill');
const Contact = require('../models/Contact');

const router = express.Router();

// All routes are protected with auth middleware
router.use(auth);

// ============ HOME PAGE ROUTES ============

// @route   GET /api/admin/home
// @desc    Get home page information (about data)
// @access  Private
router.get('/home', async (req, res) => {
  try {
    const about = await About.findOne({ isActive: true });
    res.json(about || {});
  } catch (error) {
    console.error('Get about error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/home
// @desc    Create or update home page information (about data)
// @access  Private
router.post('/home', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('title').trim().isLength({ min: 2 }).withMessage('Title is required'),
  body('tagline').trim().isLength({ min: 5 }).withMessage('Tagline is required'),
  body('bio').trim().isLength({ min: 10 }).withMessage('Bio must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, title, tagline, bio, socialLinks, highlights } = req.body;
    
    const aboutData = {
      name,
      title,
      tagline,
      bio,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      highlights: highlights ? JSON.parse(highlights) : [],
      profileImage: '/images/profile.jpg',
      resumeUrl: '/documents/resume.pdf'
    };

    // Update existing or create new
    let about = await About.findOne({ isActive: true });
    if (about) {
      Object.assign(about, aboutData);
      await about.save();
    } else {
      about = new About(aboutData);
      await about.save();
    }

    res.json({ message: 'About information updated successfully', about });
  } catch (error) {
    console.error('Update about error:', error);
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
  body('description').trim().isLength({ min: 10 }).withMessage('Description is required'),
  body('problemStatement').trim().isLength({ min: 10 }).withMessage('Problem statement is required'),
  body('role').trim().isLength({ min: 5 }).withMessage('Role is required')
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
      title, description, problemStatement, techStack, role, 
      challenges, impact, links, featured, order 
    } = req.body;

    const projectData = {
      title,
      description,
      problemStatement,
      techStack: techStack ? JSON.parse(techStack) : [],
      role,
      challenges: challenges ? JSON.parse(challenges) : [],
      impact: impact ? JSON.parse(impact) : {},
      links: links ? JSON.parse(links) : {},
      featured: featured === 'true',
      order: parseInt(order) || 0
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
      title, description, problemStatement, techStack, role, 
      challenges, impact, links, featured, order 
    } = req.body;

    const updateData = {
      title,
      description,
      problemStatement,
      techStack: techStack ? JSON.parse(techStack) : project.techStack,
      role,
      challenges: challenges ? JSON.parse(challenges) : project.challenges,
      impact: impact ? JSON.parse(impact) : project.impact,
      links: links ? JSON.parse(links) : project.links,
      featured: featured === 'true',
      order: parseInt(order) || project.order
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
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description is required')
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
      location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
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
      location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
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
