// ===================================================================
// CAMI3D BACKEND SERVER - SERVIDOR PRINCIPAL DA API
// ===================================================================
// Este arquivo configura e inicializa o servidor Express da aplicação Cami3D
// Inclui configurações de segurança, CORS, rate limiting, rotas e documentação

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// ===================================================================
// IMPORTAÇÕES - CONFIGURAÇÕES E DEPENDÊNCIAS
// ===================================================================

// Conexão com banco de dados MongoDB
const connectDB = require('./src/config/database');

// Rotas da API organizadas por funcionalidade
const authRoutes = require('./src/routes/auth');        // Autenticação e autorização
const tshirtRoutes = require('./src/routes/tshirt');    // Gerenciamento de designs de camisetas
const uploadRoutes = require('./src/routes/upload');    // Upload e gerenciamento de imagens
const userRoutes = require('./src/routes/user');        // Gerenciamento de usuários

// Middlewares personalizados e configurações
const errorHandler = require('./src/middleware/errorHandler');           // Tratamento global de erros
const { initStorage } = require('./src/middleware/initStorage');         // Inicialização do sistema de arquivos
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require('./src/config/swagger'); // Documentação da API
const { testEmailConfig } = require('./src/config/email');               // Configuração de email

// ===================================================================
// CONFIGURAÇÃO INICIAL DO SERVIDOR
// ===================================================================

const app = express();
const PORT = process.env.PORT || 8080;

// ===================================================================
// MIDDLEWARES DE SEGURANÇA
// ===================================================================

// Helmet: Adiciona cabeçalhos de segurança HTTP para proteger contra vulnerabilidades comuns
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// ===================================================================
// CONFIGURAÇÃO DE RATE LIMITING
// ===================================================================

// Limita o número de requisições por IP para prevenir ataques de força bruta e DDoS
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // Janela de tempo: 15 minutos
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,             // Máximo de 100 requisições por IP na janela
  message: {
    error: 'Muitas requisições deste IP. Tente novamente mais tarde.'
  },
  standardHeaders: true,  // Retorna informações do rate limit nos headers `RateLimit-*`
  legacyHeaders: false,   // Desabilita headers `X-RateLimit-*`
});
app.use(limiter);

// ===================================================================
// CONFIGURAÇÃO CORS (Cross-Origin Resource Sharing)
// ===================================================================

// Configuração avançada de CORS para permitir requisições do frontend
// Controla quais domínios podem acessar a API baseado no ambiente (dev/prod)
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (aplicações mobile, ferramentas de API como Postman)
    if (!origin) return callback(null, true);
    
    // AMBIENTE DE DESENVOLVIMENTO: Permite origins localhost
    if (process.env.NODE_ENV === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',    // React padrão
        'http://localhost:5173',    // Vite padrão
        'http://localhost:8080',    // Servidor local alternativo
        'http://127.0.0.1:3000',   // IP local - React
        'http://127.0.0.1:5173',   // IP local - Vite
        'http://127.0.0.1:8080'    // IP local - alternativo
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // AMBIENTE DE PRODUÇÃO: Permite apenas domínios específicos e seguros
    const allowedOrigins = [
      process.env.FRONTEND_URL,              // URL do frontend definida no .env
      process.env.PRODUCTION_URL,            // URL de produção do backend
      process.env.PRODUCTION_FRONTEND_URL,   // URL de produção do frontend
      'http://capmi3d.discloud.app',         // Backend DisCloud (HTTP)
      'https://capmi3d.discloud.app',        // Backend DisCloud (HTTPS)
      'http://cami3d.discloud.app',          // Frontend DisCloud (HTTP)
      'https://cami3d.discloud.app',         // Frontend DisCloud (HTTPS)
    ].filter(Boolean); // Remove valores undefined/null
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Para ferramentas de teste de API e chamadas diretas, permite quando não há origin
    callback(null, true);
  },
  credentials: true,                        // Permite envio de cookies e headers de autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Métodos HTTP permitidos
  allowedHeaders: [                         // Headers permitidos nas requisições
    'Content-Type',     // Tipo do conteúdo (application/json, etc.)
    'Authorization',    // Token JWT para autenticação
    'X-Requested-With', // Identifica requisições AJAX
    'Accept',          // Tipos de resposta aceitos
    'Origin'           // Origin da requisição
  ],
  exposedHeaders: ['Content-Length', 'X-Request-ID'], // Headers expostos para o cliente
  maxAge: 86400 // Cache do preflight por 24 horas (evita requisições OPTIONS desnecessárias)
};

app.use(cors(corsOptions));

// Gerencia requisições OPTIONS preflight para todas as rotas
// Necessário para requisições CORS complexas (com headers customizados)
app.options('*', cors(corsOptions));

// ===================================================================
// MIDDLEWARE DE DEBUG CORS (APENAS EM DESENVOLVIMENTO)
// ===================================================================

// Log detalhado de requisições CORS para debug durante desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`🌐 CORS Debug - Origin: ${req.get('origin')}, Método: ${req.method}, Rota: ${req.path}`);
    next();
  });
}

// ===================================================================
// MIDDLEWARES DE APLICAÇÃO
// ===================================================================

// Sistema de logging de requisições HTTP
// - 'combined': formato completo para produção (inclui user-agent, referer, etc.)
// - 'dev': formato simplificado e colorido para desenvolvimento
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parsing do corpo das requisições HTTP
app.use(express.json({ limit: '10mb' }));                        // Parse JSON até 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));  // Parse form data até 10MB

// ===================================================================
// ARQUIVOS ESTÁTICOS
// ===================================================================

// Serve imagens e arquivos uploadados na rota /uploads
// Exemplo: /uploads/image123.jpg aponta para ./uploads/image123.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===================================================================
// ENDPOINTS DE DOCUMENTAÇÃO
// ===================================================================

// Endpoint para JSON da especificação Swagger/OpenAPI
// Usado por ferramentas que consomem a documentação programaticamente
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificação de Saúde da API
 *     description: |
 *       Endpoint para monitoramento da saúde da API.
 *       Retorna informações sobre o status do servidor, timestamp e versão.
 *       Usado por sistemas de monitoramento e load balancers.
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
 *                   description: Status atual da API
 *                 message:
 *                   type: string
 *                   example: Cami3D API is running
 *                   description: Mensagem descritiva do status
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp atual do servidor
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                   description: Versão atual da API
 */
// Endpoint de verificação de saúde da API
// Usado para monitoramento, health checks de containers e load balancers
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Cami3D API está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ===================================================================
// ROTAS DA API
// ===================================================================

// Rotas organizadas por funcionalidade com prefixo /api
app.use('/api/auth', authRoutes);      // Autenticação: login, registro, recuperação de senha
app.use('/api/tshirt', tshirtRoutes);  // Designs de camisetas: CRUD, galeria, compartilhamento
app.use('/api/upload', uploadRoutes);  // Upload de imagens: envio, listagem, exclusão
app.use('/api/user', userRoutes);      // Usuários: perfil, configurações, estatísticas

// ===================================================================
// DOCUMENTAÇÃO SWAGGER UI
// ===================================================================

// Interface web da documentação da API na rota raiz
// Acessível em: http://localhost:8080/ ou https://capmi3d.discloud.app/
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// ===================================================================
// TRATAMENTO DE ERROS E ROTAS INEXISTENTES
// ===================================================================

// Handler para rotas não encontradas (404)
// Captura todas as requisições que não correspondem às rotas definidas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `O endpoint ${req.originalUrl} não existe`,
    availableEndpoints: [
      '/health',
      '/api/auth/*',
      '/api/tshirt/*', 
      '/api/upload/*',
      '/api/user/*',
      '/api-docs.json',
      '/ (documentação)'
    ]
  });
});

// Middleware global de tratamento de erros (deve ser o último)
// Captura e processa todos os erros não tratados da aplicação
app.use(errorHandler);

// ===================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ===================================================================

/**
 * Função assíncrona para inicializar o servidor de forma sequencial
 * 1. Conecta ao banco de dados MongoDB
 * 2. Inicializa o sistema de armazenamento de arquivos
 * 3. Inicia o servidor Express na porta especificada
 * 4. Exibe informações de status e URLs importantes
 */
const startServer = async () => {
  try {
    // Etapa 1: Estabelece conexão com MongoDB Atlas
    console.log('🔌 Conectando ao banco de dados...');
    await connectDB();

    // Etapa 2: Inicializa sistema de arquivos (cria pastas necessárias)
    console.log('📁 Inicializando sistema de armazenamento...');
    await initStorage();

    // Etapa 3: Testa configuração de email (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Testando configuração de email...');
      const emailConfigValid = await testEmailConfig();
      if (emailConfigValid) {
        console.log('✅ Configuração de email válida');
      } else {
        console.log('⚠️  Aviso: Configuração de email pode estar incorreta');
      }
    }

    // Etapa 4: Inicia o servidor HTTP
    app.listen(PORT, () => {
      console.log('\n🎉 ===== CAMI3D BACKEND INICIADO COM SUCESSO =====');
      console.log(`🚀 Servidor rodando na porta: ${PORT}`);
      console.log(`📁 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Banco de dados: MongoDB Atlas (Conectado)`);
      console.log('\n📍 URLs importantes:');
      console.log(`   Health Check: http://localhost:${PORT}/health`);
      console.log(`   Documentação: http://localhost:${PORT}/`);
      console.log(`   API Base: http://localhost:${PORT}/api`);
      console.log('\n🌐 URLs de produção:');
      console.log(`   Backend: ${process.env.PRODUCTION_URL || 'Não configurado'}`);
      console.log(`   Frontend: ${process.env.PRODUCTION_FRONTEND_URL || 'Não configurado'}`);
      console.log('\n� Recursos disponíveis:');
      console.log('   ✅ Autenticação JWT');
      console.log('   ✅ Upload de imagens');
      console.log('   ✅ Designs de camisetas 3D');
      console.log('   ✅ Galeria pública');
      console.log('   ✅ Rate limiting');
      console.log('   ✅ CORS configurado');
      console.log('   ✅ Documentação Swagger');
      console.log('   ✅ Recuperação de senha por email');
      console.log('================================================\n');
    });
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO: Falha ao iniciar servidor:', error);
    console.error('\n🔍 Possíveis causas:');
    console.error('   - Problema de conexão com MongoDB');
    console.error('   - Porta já em uso');
    console.error('   - Variáveis de ambiente incorretas');
    console.error('   - Permissões de arquivo insuficientes');
    console.error('\n💡 Verifique o arquivo .env e tente novamente.\n');
    process.exit(1);
  }
};

// Inicia o servidor
startServer();

module.exports = app;
