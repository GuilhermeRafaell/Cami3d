const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// Middleware para verificar JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Token is not valid or has expired'
      });
    }
    
    req.user = decoded;
    next();
  });
};

// Middleware opcional - continua mesmo sem token válido
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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
        error: 'Access denied',
        message: 'Admin privileges required'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: 'Error checking user permissions'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};
