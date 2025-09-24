const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Debug route to check server status
router.get('/status', (req, res) => {
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  
  res.json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uploadsDirectory: {
      exists: fs.existsSync(uploadsPath),
      path: uploadsPath,
      contents: fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath) : 'Directory does not exist'
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      BASE_URL: process.env.BASE_URL
    }
  });
});

// Test route to create uploads directory
router.post('/create-uploads', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    const subdirs = ['profile', 'projects', 'companies', 'documents', 'blog', 'misc'];
    
    // Create main uploads directory
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    
    // Create subdirectories
    subdirs.forEach(dir => {
      const dirPath = path.join(uploadsPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    res.json({
      message: 'Uploads directory structure created successfully',
      directories: subdirs.map(dir => ({
        name: dir,
        path: path.join(uploadsPath, dir),
        exists: fs.existsSync(path.join(uploadsPath, dir))
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating uploads directory',
      error: error.message
    });
  }
});

module.exports = router;
