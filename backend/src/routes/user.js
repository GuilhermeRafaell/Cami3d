const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Utility functions
const readUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeUsers = async (users) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error fetching user profile'
    });
  }
});

// PUT /api/user/profile
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email } = req.body;
    const users = await readUsers();
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === email && u.id !== req.user.id);
      if (emailExists) {
        return res.status(409).json({
          error: 'Email already taken',
          message: 'This email is already in use by another account'
        });
      }
    }

    // Update user profile
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeUsers(users);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: users[userIndex].id,
        email: users[userIndex].email,
        name: users[userIndex].name,
        role: users[userIndex].role,
        updatedAt: users[userIndex].updatedAt
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error updating user profile'
    });
  }
});

// PUT /api/user/change-password
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const users = await readUsers();
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    users[userIndex].password = hashedNewPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeUsers(users);

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error changing password'
    });
  }
});

// DELETE /api/user/account
router.delete('/account', authenticateToken, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { password } = req.body;
    const users = await readUsers();
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, users[userIndex].password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Password is incorrect'
      });
    }

    // Remove user from array
    users.splice(userIndex, 1);
    await writeUsers(users);

    // TODO: Also delete user's t-shirt designs and uploaded images
    // This would be implemented here in a real application

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error deleting account'
    });
  }
});

// GET /api/user/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Read user's t-shirts
    const tshirtsFile = path.join(__dirname, '../../data/tshirts.json');
    let userTshirts = [];
    
    try {
      const tshirtsData = await fs.readFile(tshirtsFile, 'utf8');
      const tshirts = JSON.parse(tshirtsData);
      userTshirts = tshirts.filter(t => t.userId === req.user.id);
    } catch (error) {
      // No t-shirts file exists yet
    }

    // Read user's uploads
    const uploadsFile = path.join(__dirname, '../../data/uploads.json');
    let userUploads = [];
    
    try {
      const uploadsData = await fs.readFile(uploadsFile, 'utf8');
      const uploads = JSON.parse(uploadsData);
      userUploads = uploads.filter(u => u.uploadedBy === req.user.id);
    } catch (error) {
      // No uploads file exists yet
    }

    res.json({
      stats: {
        designsCreated: userTshirts.length,
        imagesUploaded: userUploads.length,
        publicDesigns: userTshirts.filter(t => t.isPublic).length,
        totalStorageUsed: userUploads.reduce((total, upload) => total + upload.size, 0),
        memberSince: req.user.createdAt || new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error fetching user statistics'
    });
  }
});

module.exports = router;
