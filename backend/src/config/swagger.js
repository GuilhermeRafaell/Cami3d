const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Definição básica da API
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Cami3D API',
    version: '1.0.0',
    description: 'API para personalização de camisetas'
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor Local'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT para autenticação. Formato: Bearer {token}'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'name', 'password'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único do usuário'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email do usuário'
          },
          name: {
            type: 'string',
            minLength: 2,
            description: 'Nome completo do usuário'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Senha do usuário'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description: 'Papel do usuário no sistema'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação da conta'
          },
          lastLogin: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Data do último login'
          }
        }
      },
      TshirtDesign: {
        type: 'object',
        required: ['color', 'style'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único do design'
          },
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'ID do usuário criador'
          },
          name: {
            type: 'string',
            description: 'Nome do design'
          },
          config: {
            type: 'object',
            properties: {
              color: {
                type: 'string',
                pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
                description: 'Cor da camiseta em hexadecimal'
              },
              style: {
                type: 'string',
                enum: ['crew-neck', 'v-neck', 'tank-top', 'long-sleeve'],
                description: 'Estilo da camiseta'
              },
              logo: {
                type: 'string',
                description: 'URL ou caminho do logo'
              },
              logoPosition: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' }
                }
              },
              logoScale: {
                type: 'number',
                minimum: 0.1,
                maximum: 3.0
              },
              text: {
                type: 'string',
                maxLength: 50,
                description: 'Texto personalizado'
              },
              textPosition: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' }
                }
              },
              textColor: {
                type: 'string',
                pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
              },
              textSize: {
                type: 'number',
                minimum: 0.05,
                maximum: 0.5
              }
            }
          },
          isPublic: {
            type: 'boolean',
            description: 'Se o design é público'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Upload: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          originalName: {
            type: 'string',
            description: 'Nome original do arquivo'
          },
          filename: {
            type: 'string',
            description: 'Nome do arquivo no servidor'
          },
          url: {
            type: 'string',
            description: 'URL pública do arquivo'
          },
          mimetype: {
            type: 'string',
            enum: ['image/jpeg', 'image/png', 'image/svg+xml']
          },
          size: {
            type: 'integer',
            description: 'Tamanho do arquivo em bytes'
          },
          uploadedBy: {
            type: 'string',
            format: 'uuid'
          },
          uploadedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Tipo do erro'
          },
          message: {
            type: 'string',
            description: 'Mensagem descritiva do erro'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
                value: { type: 'string' }
              }
            },
            description: 'Detalhes específicos dos erros de validação'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Mensagem de sucesso'
          },
          data: {
            type: 'object',
            description: 'Dados retornados'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Token de acesso requerido',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Acesso negado',
              message: 'Token não fornecido'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Token inválido ou expirado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Token inválido',
              message: 'Token não é válido ou expirou'
            }
          }
        }
      },
      ValidationError: {
        description: 'Erro de validação',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Falha na validação',
              details: [
                {
                  field: 'email',
                  message: 'Por favor, forneça um email válido',
                  value: 'email-invalido'
                }
              ]
            }
          }
        }
      },
      NotFoundError: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Não encontrado',
              message: 'O recurso solicitado não foi encontrado'
            }
          }
        }
      },
      ServerError: {
        description: 'Erro interno do servidor',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Erro do servidor',
              message: 'Erro interno do servidor'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Auth',
      description: 'Autenticação'
    },
    {
      name: 'Users',
      description: 'Usuários'
    },
    {
      name: 'T-Shirts',
      description: 'Designs'
    },
    {
      name: 'Uploads',
      description: 'Upload'
    },
    {
      name: 'Health',
      description: 'Status'
    }
  ]
};

// Opções para o swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './server.js'
  ]
};

// Gerar especificação do Swagger
const swaggerSpec = swaggerJSDoc(options);

// Opções customizadas para o Swagger UI
const swaggerUiOptions = {
  customSiteTitle: 'Cami3D API',
  swaggerOptions: {
    docExpansion: 'list'
  }
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions
};
