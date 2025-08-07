const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Utility function to read users
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

// Utility function to write users
const writeUsers = async (users) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

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

    // Read existing users
    const users = await readUsers();

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Usuário já existe',
        message: 'Um usuário com este email já existe'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      name,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Add user to array and save
    users.push(newUser);
    await writeUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: {
        id: newUser.id,
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

    // Read users
    const users = await readUsers();

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await writeUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
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
        id: user.id,
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
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário associado a este token não existe mais'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao verificar token'
    });
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', authenticateToken, (req, res) => {
  try {
    // Generate new token
    const token = jwt.sign(
      { 
        id: req.user.id, 
        email: req.user.email, 
        role: req.user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao renovar token'
    });
  }
});

module.exports = router;
