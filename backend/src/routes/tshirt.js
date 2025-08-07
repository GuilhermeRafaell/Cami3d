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
      const hasText = body.text && body.text.trim().length > 0;
      const hasLogo = body.logo && body.logo.trim().length > 0;
      
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
      // Add other element types if they exist in the future
      
      const maxElements = 5; // Define maximum number of elements
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
      message: 'Design da camiseta salvo com sucesso',
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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de designs recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tshirts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TshirtDesign'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 10 }
 *                     total: { type: integer, example: 25 }
 *                     pages: { type: integer, example: 3 }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tshirt:
 *                   $ref: '#/components/schemas/TshirtDesign'
 *       404:
 *         description: Design não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Design não encontrado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// GET /api/tshirt/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const tshirts = await readTshirts();
    
    const tshirt = tshirts.find(t => t.id === id);
    
    if (!tshirt) {
      return res.status(404).json({
        error: 'Design não encontrado',
        message: 'Design da camiseta não encontrado'
      });
    }

    // Check if user can access this design
    const canAccess = tshirt.isPublic || 
                     (req.user && req.user.id === tshirt.userId);
    
    if (!canAccess) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão para visualizar este design'
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
    const tshirts = await readTshirts();
    
    const tshirtIndex = tshirts.findIndex(t => 
      t.id === id && t.userId === req.user.id
    );
    
    if (tshirtIndex === -1) {
      return res.status(404).json({
        error: 'Design não encontrado',
        message: 'Design da camiseta não encontrado ou você não tem permissão para editá-lo'
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
      message: 'Design atualizado com sucesso',
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
      error: 'Erro do servidor',
      message: 'Erro ao atualizar design'
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
        error: 'Design não encontrado',
        message: 'Design da camiseta não encontrado ou você não tem permissão para excluí-lo'
      });
    }

    // Remove from array
    tshirts.splice(tshirtIndex, 1);
    await writeTshirts(tshirts);

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
    const tshirts = await readTshirts();
    
    const originalTshirt = tshirts.find(t => t.id === id);
    
    if (!originalTshirt) {
      return res.status(404).json({
        error: 'Design não encontrado',
        message: 'Design original não encontrado'
      });
    }

    // Check if user can access this design
    const canAccess = originalTshirt.isPublic || originalTshirt.userId === req.user.id;
    
    if (!canAccess) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão para duplicar este design'
      });
    }

    // Create duplicate
    const duplicatedTshirt = {
      id: uuidv4(),
      userId: req.user.id,
      name: `${originalTshirt.name} (Cópia)`,
      config: { ...originalTshirt.config },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false
    };

    tshirts.push(duplicatedTshirt);
    await writeTshirts(tshirts);

    res.status(201).json({
      message: 'Design duplicado com sucesso',
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
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Itens por página
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filtrar por cor
 *       - in: query
 *         name: style
 *         schema:
 *           type: string
 *           enum: [crew-neck, v-neck, tank-top, long-sleeve]
 *         description: Filtrar por estilo
 *     responses:
 *       200:
 *         description: Galeria carregada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 designs:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/TshirtDesign'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               username: { type: string, example: fulano }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 20 }
 *                     total: { type: integer, example: 150 }
 *                     pages: { type: integer, example: 8 }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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
      error: 'Erro do servidor',
      message: 'Erro ao buscar galeria pública'
    });
  }
});

module.exports = router;
