// ===================================================================
// MIDDLEWARE DE TRATAMENTO GLOBAL DE ERROS - CAMI3D API
// ===================================================================
// Este middleware é responsável por capturar e tratar todos os erros
// não tratados da aplicação, fornecendo respostas consistentes e
// informativas para o cliente, além de fazer log detalhado para debug.

/**
 * Middleware global de tratamento de erros
 * 
 * Funcionalidades:
 * - Captura todos os erros não tratados das rotas
 * - Faz log detalhado para debug e monitoramento
 * - Fornece respostas padronizadas baseadas no tipo de erro
 * - Diferencia comportamento entre desenvolvimento e produção
 * - Trata erros específicos: Multer, JWT, Validação, MongoDB, etc.
 * 
 * @param {Error} err - Objeto de erro capturado
 * @param {Request} req - Objeto de requisição HTTP
 * @param {Response} res - Objeto de resposta HTTP  
 * @param {NextFunction} next - Função para passar controle
 */
const errorHandler = (err, req, res, next) => {
  // ===================================================================
  // LOG DETALHADO DO ERRO PARA DEBUG E MONITORAMENTO
  // ===================================================================
  
  // Registra informações completas do erro para análise posterior
  console.error('🚨 ERRO CAPTURADO:', {
    message: err.message,           // Mensagem do erro
    stack: err.stack,              // Stack trace completo
    url: req.url,                  // URL que gerou o erro
    method: req.method,            // Método HTTP (GET, POST, etc.)
    userAgent: req.get('User-Agent'), // Browser/client que fez a requisição
    ip: req.ip,                    // IP do cliente
    timestamp: new Date().toISOString() // Timestamp do erro
  });

  // ===================================================================
  // TRATAMENTO DE ERROS DE UPLOAD (MULTER)
  // ===================================================================
  
  // Erro: Arquivo muito grande (excede limite de 5MB configurado)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Arquivo muito grande',
      message: 'O arquivo enviado excede o tamanho máximo permitido de 5MB',
      code: 'FILE_TOO_LARGE',
      maxSize: '5MB'
    });
  }

  // Erro: Muitos arquivos enviados simultaneamente
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Muitos arquivos',
      message: 'Máximo de 1 arquivo permitido por upload',
      code: 'TOO_MANY_FILES',
      maxFiles: 1
    });
  }

  // Erro: Campo de arquivo inesperado (nome do campo incorreto)
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Campo de arquivo inválido',
      message: 'Nome do campo de arquivo inesperado. Use "image" para uploads.',
      code: 'INVALID_FIELD_NAME',
      expectedField: 'image'
    });
  }

  // ===================================================================
  // TRATAMENTO DE ERROS DE AUTENTICAÇÃO JWT
  // ===================================================================
  
  // Erro: Token JWT malformado ou inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'O token fornecido está malformado ou é inválido',
      code: 'INVALID_TOKEN',
      action: 'Faça login novamente para obter um token válido'
    });
  }

  // Erro: Token JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'O token fornecido expirou e precisa ser renovado',
      code: 'TOKEN_EXPIRED',
      action: 'Faça login novamente para obter um novo token'
    });
  }

  // ===================================================================
  // TRATAMENTO DE ERROS DE VALIDAÇÃO
  // ===================================================================
  
  // Erro: Validação de dados (Mongoose, express-validator, etc.)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      message: err.message,
      code: 'VALIDATION_ERROR',
      details: err.errors || null // Detalhes específicos da validação (se disponível)
    });
  }

  // ===================================================================
  // TRATAMENTO DE ERROS DE BANCO DE DADOS (MONGODB)
  // ===================================================================
  
  // Erro: Violação de índice único (email duplicado, etc.)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return res.status(409).json({
      error: 'Dados duplicados',
      message: `${field} "${value}" já está sendo usado`,
      code: 'DUPLICATE_KEY',
      field: field
    });
  }

  // Erro: ID de documento inválido (ObjectId malformado)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'O ID fornecido possui formato inválido',
      code: 'INVALID_OBJECT_ID',
      field: err.path
    });
  }

  // ===================================================================
  // TRATAMENTO DE ERRO GENÉRICO/PADRÃO
  // ===================================================================
  
  // Para todos os outros erros não específicos tratados acima
  // Diferencia comportamento entre desenvolvimento e produção
  
  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Resposta base do erro
  const errorResponse = {
    error: err.name || 'Erro Interno do Servidor',
    message: isProduction 
      ? 'Algo deu errado do nosso lado. Tente novamente em alguns minutos.' 
      : err.message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };
  
  // Em desenvolvimento, inclui informações extras para debug
  if (!isProduction) {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body
    };
  }
  
  res.status(statusCode).json(errorResponse);
};

// ===================================================================
// EXPORTAÇÃO DO MIDDLEWARE
// ===================================================================

// Exporta o middleware para uso no servidor principal
// Este middleware deve ser registrado por último na cadeia de middlewares
// para capturar todos os erros não tratados pelas rotas anteriores
module.exports = errorHandler;
