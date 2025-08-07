const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// Middleware para verificar JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Acesso negado',
      message: 'Token não fornecido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Token inválido',
        message: 'Token não é válido ou expirou'
      });
    }
    
    req.user = decoded;
    next();
  });
};

// Middleware opcional - continua mesmo sem token válido
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  
  next();
};

// Middleware para verificar se é admin
const requireAdmin = async (req, res, next) => {
  try {
    const usersData = await fs.readFile(path.join(__dirname, '../../data/users.json'), 'utf8');
    const users = JSON.parse(usersData);
    const user = users.find(u => u.id === req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Privilégios de administrador necessários'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro ao verificar permissões do usuário:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao verificar permissões do usuário'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};
