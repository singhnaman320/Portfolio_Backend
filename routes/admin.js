const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');

const router = express.Router();

// All routes are protected with auth middleware
router.use(auth);

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
