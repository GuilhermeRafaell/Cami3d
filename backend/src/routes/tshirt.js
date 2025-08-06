const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const TSHIRTS_FILE = path.join(__dirname, '../../data/tshirts.json');

// Utility functions
const readTshirts = async () => {
  try {
    const data = await fs.readFile(TSHIRTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeTshirts = async (tshirts) => {
  await fs.writeFile(TSHIRTS_FILE, JSON.stringify(tshirts, null, 2));
};

// Validation rules
const tshirtValidation = [
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  body('style')
    .isIn(['crew-neck', 'v-neck', 'tank-top', 'long-sleeve'])
    .withMessage('Style must be one of: crew-neck, v-neck, tank-top, long-sleeve'),
  body('modelType')
    .optional()
    .isIn(['procedural', 'external'])
    .withMessage('Model type must be procedural or external'),
  body('text')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Text must not exceed 50 characters'),
  body('textColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Text color must be a valid hex color code'),
  body('textSize')
    .optional()
    .isFloat({ min: 0.05, max: 0.5 })
    .withMessage('Text size must be between 0.05 and 0.5'),
  body('logoScale')
    .optional()
    .isFloat({ min: 0.1, max: 3.0 })
    .withMessage('Logo scale must be between 0.1 and 3.0')
];

// POST /api/tshirt/save
router.post('/save', authenticateToken, tshirtValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      color,
      logo,
      logoPosition,
      logoScale,
      text,
      textPosition,
      textColor,
      textSize,
      style,
      modelType,
      externalModel,
      renderQuality,
      name // Optional name for the design
    } = req.body;

    // Read existing t-shirts
    const tshirts = await readTshirts();

    // Create new t-shirt design
    const newTshirt = {
      id: uuidv4(),
      userId: req.user.id,
      name: name || `Design ${tshirts.length + 1}`,
      config: {
        color,
        logo,
        logoPosition: logoPosition || { x: 0, y: 0 },
        logoScale: logoScale || 1,
        text: text || '',
        textPosition: textPosition || { x: 0, y: -0.3 },
        textColor: textColor || '#000000',
        textSize: textSize || 0.1,
        style,
        modelType: modelType || 'procedural',
        externalModel: externalModel || null,
        renderQuality: renderQuality || 'medium'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false
    };

    // Add to array and save
    tshirts.push(newTshirt);
    await writeTshirts(tshirts);

    res.status(201).json({
      message: 'T-shirt design saved successfully',
      tshirt: {
        id: newTshirt.id,
        name: newTshirt.name,
        config: newTshirt.config,
        createdAt: newTshirt.createdAt
      }
    });

  } catch (error) {
    console.error('Save t-shirt error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error saving t-shirt design'
    });
  }
});

// GET /api/tshirt/my-designs
router.get('/my-designs', authenticateToken, async (req, res) => {
  try {
    const tshirts = await readTshirts();
    
    // Filter user's designs
    const userTshirts = tshirts
      .filter(tshirt => tshirt.userId === req.user.id)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(tshirt => ({
        id: tshirt.id,
        name: tshirt.name,
        config: tshirt.config,
        createdAt: tshirt.createdAt,
        updatedAt: tshirt.updatedAt
      }));

    res.json({
      designs: userTshirts,
      total: userTshirts.length
    });

  } catch (error) {
    console.error('Fetch designs error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error fetching designs'
    });
  }
});

// GET /api/tshirt/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const tshirts = await readTshirts();
    
    const tshirt = tshirts.find(t => t.id === id);
    
    if (!tshirt) {
      return res.status(404).json({
        error: 'Design not found',
        message: 'T-shirt design not found'
      });
    }

    // Check if user can access this design
    const canAccess = tshirt.isPublic || 
                     (req.user && req.user.id === tshirt.userId);
    
    if (!canAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this design'
      });
    }

    res.json({
      design: {
        id: tshirt.id,
        name: tshirt.name,
        config: tshirt.config,
        createdAt: tshirt.createdAt,
        isOwner: req.user && req.user.id === tshirt.userId
      }
    });

  } catch (error) {
    console.error('Fetch design error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error fetching design'
    });
  }
});

// PUT /api/tshirt/:id
router.put('/:id', authenticateToken, tshirtValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const tshirts = await readTshirts();
    
    const tshirtIndex = tshirts.findIndex(t => 
      t.id === id && t.userId === req.user.id
    );
    
    if (tshirtIndex === -1) {
      return res.status(404).json({
        error: 'Design not found',
        message: 'T-shirt design not found or you do not have permission to edit it'
      });
    }

    // Update the design
    const updatedConfig = {
      ...tshirts[tshirtIndex].config,
      ...req.body
    };

    tshirts[tshirtIndex] = {
      ...tshirts[tshirtIndex],
      name: req.body.name || tshirts[tshirtIndex].name,
      config: updatedConfig,
      updatedAt: new Date().toISOString()
    };

    await writeTshirts(tshirts);

    res.json({
      message: 'Design updated successfully',
      design: {
        id: tshirts[tshirtIndex].id,
        name: tshirts[tshirtIndex].name,
        config: tshirts[tshirtIndex].config,
        updatedAt: tshirts[tshirtIndex].updatedAt
      }
    });

  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error updating design'
    });
  }
});

// DELETE /api/tshirt/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tshirts = await readTshirts();
    
    const tshirtIndex = tshirts.findIndex(t => 
      t.id === id && t.userId === req.user.id
    );
    
    if (tshirtIndex === -1) {
      return res.status(404).json({
        error: 'Design not found',
        message: 'T-shirt design not found or you do not have permission to delete it'
      });
    }

    // Remove from array
    tshirts.splice(tshirtIndex, 1);
    await writeTshirts(tshirts);

    res.json({
      message: 'Design deleted successfully'
    });

  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error deleting design'
    });
  }
});

// POST /api/tshirt/:id/duplicate
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tshirts = await readTshirts();
    
    const originalTshirt = tshirts.find(t => t.id === id);
    
    if (!originalTshirt) {
      return res.status(404).json({
        error: 'Design not found',
        message: 'Original design not found'
      });
    }

    // Check if user can access this design
    const canAccess = originalTshirt.isPublic || originalTshirt.userId === req.user.id;
    
    if (!canAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to duplicate this design'
      });
    }

    // Create duplicate
    const duplicatedTshirt = {
      id: uuidv4(),
      userId: req.user.id,
      name: `${originalTshirt.name} (Copy)`,
      config: { ...originalTshirt.config },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false
    };

    tshirts.push(duplicatedTshirt);
    await writeTshirts(tshirts);

    res.status(201).json({
      message: 'Design duplicated successfully',
      design: {
        id: duplicatedTshirt.id,
        name: duplicatedTshirt.name,
        config: duplicatedTshirt.config,
        createdAt: duplicatedTshirt.createdAt
      }
    });

  } catch (error) {
    console.error('Duplicate design error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error duplicating design'
    });
  }
});

// GET /api/tshirt/public/gallery
router.get('/public/gallery', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const tshirts = await readTshirts();
    
    // Filter public designs
    const publicTshirts = tshirts
      .filter(tshirt => tshirt.isPublic)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTshirts = publicTshirts.slice(startIndex, endIndex);

    res.json({
      designs: paginatedTshirts.map(tshirt => ({
        id: tshirt.id,
        name: tshirt.name,
        config: tshirt.config,
        createdAt: tshirt.createdAt
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(publicTshirts.length / limit),
        count: paginatedTshirts.length,
        totalDesigns: publicTshirts.length
      }
    });

  } catch (error) {
    console.error('Fetch gallery error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error fetching public gallery'
    });
  }
});

module.exports = router;
