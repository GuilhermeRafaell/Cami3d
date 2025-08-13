const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               name: { type: string, minLength: 2 }
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já existe
 */
// POST /api/auth/register
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor, forneça um email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('A senha deve ter pelo menos 6 caracteres'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('O nome deve ter pelo menos 2 caracteres')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Falha na validação',
        details: errors.array()
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'Usuário já existe',
        message: 'Um usuário com este email já existe'
      });
    }

    // Create new user (password will be hashed automatically by middleware)
    const newUser = new User({
      email,
      name,
      password,
      role: 'user'
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao criar conta do usuário'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login realizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais incorretas
 */
// POST /api/auth/login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Falha na validação',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Check password using the model method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro durante o login'
    });
  }
});

// POST /api/auth/verify-token
router.post('/verify-token', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário associado a este token não existe mais'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao verificar token'
    });
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário associado ao token não existe mais'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'cami3d_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token renovado com sucesso',
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao renovar token'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Recuperação de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Email de recuperação enviado
 *       404:
 *         description: Email não encontrado
 */
// POST /api/auth/forgot-password  
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Falha na validação',
        details: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Always return success for security (don't reveal if email exists)
    // In a real system, an email with reset token would be sent
    
    if (user) {
      // TODO: Implement email sending with reset token
      console.log(`Password reset requested for: ${email}`);
    }

    res.json({
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao processar solicitação de recuperação'
    });
  }
});

module.exports = router;
