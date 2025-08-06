# Cami3D Backend API

API REST para o sistema de personalização de camisetas 3D Cami3D.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 24+
- npm ou yarn

### Instalação
```bash
cd backend
npm install
```

### Configuração
Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

### Execução
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📡 Endpoints da API

### Health Check
- `GET /health` - Verifica se a API está funcionando

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário

### Perfil do Usuário
- `GET /api/user/profile` - Obter perfil do usuário (requer autenticação)
- `PUT /api/user/profile` - Atualizar perfil do usuário (requer autenticação)

### Upload de Arquivos
- `POST /api/upload/image` - Upload de imagem (requer autenticação)
- `GET /api/upload/user-images` - Listar imagens do usuário (requer autenticação)
- `GET /api/upload/info/:imageId` - Informações de uma imagem (requer autenticação)
- `DELETE /api/upload/:imageId` - Deletar imagem (requer autenticação)

### Designs de Camisetas
- `POST /api/tshirt/save` - Salvar design de camiseta (requer autenticação)
- `GET /api/tshirt/my-designs` - Listar designs do usuário (requer autenticação)
- `GET /api/tshirt/:id` - Obter design por ID
- `PUT /api/tshirt/:id` - Atualizar design (requer autenticação)
- `DELETE /api/tshirt/:id` - Deletar design (requer autenticação)
- `POST /api/tshirt/:id/duplicate` - Duplicar design (requer autenticação)
- `GET /api/tshirt/public/gallery` - Galeria pública de designs

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Após fazer login ou registro, inclua o token no header das requisições:

```
Authorization: Bearer <seu_token_jwt>
```

## 📋 Exemplos de Uso

### Registro de Usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "username": "joao123",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Salvar Design de Camiseta
```bash
curl -X POST http://localhost:3001/api/tshirt/save \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "#ff0000",
    "style": "crew-neck",
    "text": "Minha Camiseta",
    "textColor": "#ffffff",
    "textSize": 0.1
  }'
```

### Upload de Imagem
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer <seu_token>" \
  -F "image=@minha-imagem.png"
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── routes/          # Rotas da API
│   │   ├── auth.js      # Autenticação
│   │   ├── tshirt.js    # Designs de camisetas
│   │   ├── upload.js    # Upload de arquivos
│   │   └── user.js      # Perfil do usuário
│   └── middleware/      # Middlewares
│       ├── auth.js      # Middleware de autenticação
│       └── errorHandler.js # Tratamento de erros
├── data/               # Armazenamento de dados (JSON)
├── uploads/            # Arquivos enviados
├── server.js           # Servidor principal
├── .env               # Variáveis de ambiente
└── package.json       # Dependências
```

## 🔧 Configurações Disponíveis

### Variáveis de Ambiente (.env)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/svg+xml
```

## 📊 Status de Resposta

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `429` - Muitas requisições
- `500` - Erro interno do servidor

## 🧪 Testando com Postman

1. Importe a coleção `postman-collection.json`
2. Configure a variável `base_url` para `http://localhost:3001`
3. Faça login e copie o token JWT
4. Configure a variável `jwt_token` com o token recebido
5. Execute os testes!

## 🛡️ Segurança

- Rate limiting (limitação de requisições)
- Helmet para headers de segurança
- CORS configurado
- Validação de entrada
- Hash de senhas com bcrypt
- JWT para autenticação stateless

## 📦 Dependências Principais

- **Express.js** - Framework web
- **JWT** - Autenticação
- **Multer** - Upload de arquivos
- **bcryptjs** - Hash de senhas
- **Express Validator** - Validação de dados
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logging de requisições

## 🐛 Troubleshooting

### Erro de CORS
Verifique se `FRONTEND_URL` no `.env` está correto.

### Token expirado
Faça login novamente para obter um novo token.

### Erro de upload
Verifique se o arquivo está no formato correto (JPG, PNG, SVG) e não excede 5MB.

### Servidor não inicia
Verifique se a porta 3001 não está sendo usada por outro processo.

## 📝 Logs

Os logs são exibidos no console durante a execução. Em produção, considere usar um sistema de logging mais robusto como Winston.

## 🚀 Deploy

Para deploy em produção:
1. Configure as variáveis de ambiente adequadas
2. Use `npm start` em vez de `npm run dev`
3. Configure um proxy reverso (nginx) se necessário
4. Use PM2 para gerenciamento de processos
