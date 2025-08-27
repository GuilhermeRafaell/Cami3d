// Rotas de autenticação e autorização
// Inclui: registro, login, recuperação de senha, verificação de token

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { User } = require('../models');
const { sendPasswordResetEmail, testEmailConfig } = require('../config/email');

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
// Registrar novo usuário
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
// Fazer login de usuário
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

// Verificar se token é válido
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

// Renovar token de acesso
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
// Recuperar senha por email
// POST /api/auth/forgot-password  
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor, forneça um email válido')
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
    if (!user) {
      return res.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, user.name);
    
    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      // Don't reveal internal errors to user
      return res.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
      });
    }

    console.log(`Password reset email sent to: ${email}`);
    
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

/**
 * @swagger
 * /api/auth/verify-reset-token:
 *   post:
 *     summary: Verificar token de reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token inválido ou expirado
 */
// Verificar se token de reset é válido
// POST /api/auth/verify-reset-token
router.post('/verify-reset-token', [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Falha na validação',
        details: errors.array()
      });
    }

    const { token } = req.body;
    
    // Procurar usuário com o token hasheado
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Token inválido',
        message: 'Token de recuperação inválido ou expirado'
      });
    }

    res.json({
      message: 'Token válido',
      email: user.email
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao verificar token'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Redefinir senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou senha inválida
 */
// Redefinir senha usando token
// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('A senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Falha na validação',
        details: errors.array()
      });
    }

    const { token, password } = req.body;
    
    // Procurar usuário com o token hasheado
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Token inválido',
        message: 'Token de recuperação inválido ou expirado'
      });
    }

    // Atualizar senha (será hasheada automaticamente pelo middleware)
    user.password = password;
    user.clearPasswordResetToken();
    await user.save();

    console.log(`Password reset successful for user: ${user.email}`);

    res.json({
      message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.',
      success: true
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao redefinir senha'
    });
  }
});

/**
 * @swagger
 * /api/auth/test-email:
 *   get:
 *     summary: Testar configuração de email
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Configuração de email válida
 *       500:
 *         description: Erro na configuração de email
 */
// Endpoint para testar configuração de email (apenas para desenvolvimento)
// GET /api/auth/test-email
router.get('/test-email', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({
        error: 'Endpoint não disponível em produção'
      });
    }

    const isConfigValid = await testEmailConfig();
    
    if (isConfigValid) {
      res.json({
        message: 'Configuração de email válida!',
        config: {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          username: process.env.MAIL_USERNAME ? '***' + process.env.MAIL_USERNAME.slice(-4) : 'não configurado'
        }
      });
    } else {
      res.status(500).json({
        error: 'Erro na configuração de email',
        message: 'Verifique as credenciais do MailTrap'
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao testar configuração de email'
    });
  }
});

module.exports = router;
