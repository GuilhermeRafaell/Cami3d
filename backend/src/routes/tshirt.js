const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { Tshirt, User } = require('../models');

const router = express.Router();

// Validation rules
const tshirtValidation = [
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('A cor deve ser um código hexadecimal válido'),
  body('style')
    .isIn(['crew-neck', 'v-neck', 'tank-top', 'long-sleeve'])
    .withMessage('O estilo deve ser um dos seguintes: crew-neck, v-neck, tank-top, long-sleeve'),
  body('modelType')
    .optional()
    .isIn(['procedural', 'external'])
    .withMessage('O tipo de modelo deve ser procedural ou external'),
  body('text')
    .optional()
    .isLength({ max: 50 })
    .withMessage('O texto não deve exceder 50 caracteres'),
  body('textColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('A cor do texto deve ser um código hexadecimal válido'),
  body('textSize')
    .optional()
    .isFloat({ min: 0.05, max: 0.5 })
    .withMessage('O tamanho do texto deve estar entre 0.05 e 0.5'),
  body('logoScale')
    .optional()
    .isFloat({ min: 0.1, max: 3.0 })
    .withMessage('A escala do logo deve estar entre 0.1 e 3.0'),
  // Custom validation for required elements
  body()
    .custom((body) => {
      const hasText = body.text && typeof body.text === 'string' && body.text.trim().length > 0;
      const hasLogo = body.logo && typeof body.logo === 'string' && body.logo.trim().length > 0;
      
      if (!hasText && !hasLogo) {
        throw new Error('Adicione ao menos um elemento para finalizar sua camiseta.');
      }
      return true;
    }),
  // Custom validation for elements limit
  body()
    .custom((body) => {
      const elements = [];
      
      if (body.text && body.text.trim().length > 0) {
        elements.push('text');
      }
      if (body.logo && body.logo.trim().length > 0) {
        elements.push('logo');
      }
      
      const maxElements = 5;
      if (elements.length > maxElements) {
        throw new Error('Limite de elementos excedido. Remova alguns itens antes de continuar.');
      }
      return true;
    })
];

/**
 * @swagger
 * /api/tshirt/save:
 *   post:
 *     summary: Salvar design
 *     tags: [T-Shirts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [color, style]
 *             properties:
 *               color: { type: string, example: '#FF0000' }
 *               style: { type: string, enum: [crew-neck, v-neck, tank-top, long-sleeve] }
 *               name: { type: string }
 *               text: { type: string }
 *     responses:
 *       201:
 *         description: Design salvo
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
// POST /api/tshirt/save
router.post('/save', authenticateToken, tshirtValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Falha na validação',
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
      name
    } = req.body;

    // Count user's designs for default naming
    const userDesignsCount = await Tshirt.countDocuments({ userId: req.user.id });

    // Create new t-shirt design
    const newTshirt = new Tshirt({
      userId: req.user.id,
      name: name || `Design ${userDesignsCount + 1}`,
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
      isPublic: false
    });

    await newTshirt.save();

    res.status(201).json({
      message: 'Design da camiseta salvo com sucesso',
      tshirt: {
        id: newTshirt._id,
        name: newTshirt.name,
        config: newTshirt.config,
        createdAt: newTshirt.createdAt
      }
    });

  } catch (error) {
    console.error('Save t-shirt error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao salvar o design da camiseta'
    });
  }
});

/**
 * @swagger
 * /api/tshirt/my-designs:
 *   get:
 *     summary: Listar meus designs
 *     description: Retorna todos os designs de camisetas do usuário autenticado
 *     tags: [T-Shirts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de designs recuperada com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// GET /api/tshirt/my-designs
router.get('/my-designs', authenticateToken, async (req, res) => {
  try {
    const tshirts = await Tshirt.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });

    res.json({
      designs: tshirts.map(tshirt => ({
        id: tshirt._id,
        name: tshirt.name,
        config: tshirt.config,
        createdAt: tshirt.createdAt,
        updatedAt: tshirt.updatedAt
      })),
      total: tshirts.length
    });

  } catch (error) {
    console.error('Fetch designs error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao buscar designs'
    });
  }
});

/**
 * @swagger
 * /api/tshirt/{id}:
 *   get:
 *     summary: Obter design por ID
 *     description: Retorna um design específico de camiseta por ID
 *     tags: [T-Shirts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do design de camiseta
 *     responses:
 *       200:
 *         description: Design encontrado
 *       404:
 *         description: Design não encontrado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// GET /api/tshirt/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const tshirt = await Tshirt.findById(id);
    
    if (!tshirt) {
      return res.status(404).json({
        error: 'Design não encontrado',
        message: 'Design da camiseta não encontrado'
      });
    }

    // Check if user can access this design
    const canAccess = tshirt.isPublic || 
                     (req.user && req.user.id === tshirt.userId.toString());
    
    if (!canAccess) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão para visualizar este design'
      });
    }

    // Increment views if not owner
    if (!req.user || req.user.id !== tshirt.userId.toString()) {
      await tshirt.incrementViews();
    }

    res.json({
      design: {
        id: tshirt._id,
        name: tshirt.name,
        config: tshirt.config,
        createdAt: tshirt.createdAt,
        isOwner: req.user && req.user.id === tshirt.userId.toString()
      }
    });

  } catch (error) {
    console.error('Fetch design error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao buscar design'
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
        error: 'Falha na validação',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const tshirt = await Tshirt.findOne({ _id: id, userId: req.user.id });
    
    if (!tshirt) {
      return res.status(404).json({
        error: 'Design não encontrado',
        message: 'Design da camiseta não encontrado ou você não tem permissão para editá-lo'
      });
    }

    // Update the design
    const updatedConfig = {
      ...tshirt.config.toObject(),
      ...req.body
    };

    tshirt.name = req.body.name || tshirt.name;
    tshirt.config = updatedConfig;

    await tshirt.save();

    res.json({
      message: 'Design atualizado com sucesso',
      design: {
        id: tshirt._id,
        name: tshirt.name,
        config: tshirt.config,
        updatedAt: tshirt.updatedAt
      }
    });

  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao atualizar design'
    });
  }
});

// DELETE /api/tshirt/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tshirt = await Tshirt.findOne({ _id: id, userId: req.user.id });
    
    if (!tshirt) {
      return res.status(404).json({
        error: 'Design não encontrado',
        message: 'Design da camiseta não encontrado ou você não tem permissão para excluí-lo'
      });
    }

    await Tshirt.findByIdAndDelete(id);

    res.json({
      message: 'Design excluído com sucesso'
    });

  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao excluir design'
    });
  }
});

// POST /api/tshirt/:id/duplicate
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const originalTshirt = await Tshirt.findById(id);
    
    if (!originalTshirt) {
      return res.status(404).json({
        error: 'Design não encontrado',
        message: 'Design original não encontrado'
      });
    }

    // Check if user can access this design
    const canAccess = originalTshirt.isPublic || originalTshirt.userId.toString() === req.user.id;
    
    if (!canAccess) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão para duplicar este design'
      });
    }

    // Create duplicate
    const duplicatedTshirt = new Tshirt({
      userId: req.user.id,
      name: `${originalTshirt.name || 'Design'} (Cópia)`,
      config: originalTshirt.config.toObject(),
      isPublic: false
    });

    await duplicatedTshirt.save();

    res.status(201).json({
      message: 'Design duplicado com sucesso',
      design: {
        id: duplicatedTshirt._id,
        name: duplicatedTshirt.name,
        config: duplicatedTshirt.config,
        createdAt: duplicatedTshirt.createdAt
      }
    });

  } catch (error) {
    console.error('Duplicate design error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao duplicar design'
    });
  }
});

/**
 * @swagger
 * /api/tshirt/public/gallery:
 *   get:
 *     summary: Galeria pública
 *     description: Retorna designs públicos para a galeria
 *     tags: [T-Shirts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       200:
 *         description: Galeria carregada com sucesso
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// GET /api/tshirt/public/gallery
router.get('/public/gallery', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const [tshirts, total] = await Promise.all([
      Tshirt.find({ isPublic: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name'),
      Tshirt.countDocuments({ isPublic: true })
    ]);

    res.json({
      designs: tshirts.map(tshirt => ({
        id: tshirt._id,
        name: tshirt.name,
        config: tshirt.config,
        createdAt: tshirt.createdAt,
        user: {
          username: tshirt.userId?.name || 'Anonymous'
        }
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: tshirts.length,
        totalDesigns: total
      }
    });

  } catch (error) {
    console.error('Fetch gallery error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao buscar galeria pública'
    });
  }
});

module.exports = router;
