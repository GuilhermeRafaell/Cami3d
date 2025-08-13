const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const tshirtRoutes = require('./src/routes/tshirt');
const uploadRoutes = require('./src/routes/upload');
const userRoutes = require('./src/routes/user');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { initStorage } = require('./src/middleware/initStorage');
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require('./src/config/swagger');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost origins
    if (process.env.NODE_ENV === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080'
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // In production, allow specific domains
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_URL,
      process.env.PRODUCTION_FRONTEND_URL,
      'http://capmi3d.discloud.app',
      'https://capmi3d.discloud.app',
      'http://cami3d.discloud.app',
      'https://cami3d.discloud.app',
      // Add your production frontend URL here
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For API testing tools and direct API calls, allow if no origin
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Debug middleware for CORS (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`CORS Debug - Origin: ${req.get('origin')}, Method: ${req.method}, Path: ${req.path}`);
    next();
  });
}

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Verifica se a API está funcionando corretamente
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Cami3D API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Cami3D API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tshirt', tshirtRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRoutes);

// Swagger Documentation na rota raiz (depois das rotas da API)
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();

    // Inicializar sistema de armazenamento (para uploads)
    await initStorage();

    app.listen(PORT, () => {
      console.log(`🚀 Cami3D Backend Server running on port ${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`🌐 Production Backend: ${process.env.PRODUCTION_URL}`);
      console.log(`🌐 Production Frontend: ${process.env.PRODUCTION_FRONTEND_URL}`);
      console.log(`🗄️  MongoDB: Connected`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
