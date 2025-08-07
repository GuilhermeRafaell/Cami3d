# API Cami3D

## Swagger UI
Documentação interativa: `http://localhost:3001/api-docs`

## Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login

### Upload
- `POST /api/upload/image` - Upload de imagem (JWT)

### Designs
- `POST /api/tshirt/save` - Salvar design (JWT)
- `GET /api/tshirt/my-designs` - Listar meus designs (JWT)
- `GET /api/tshirt/{id}` - Obter design por ID (JWT)
- `GET /api/tshirt/public/gallery` - Galeria pública

### Usuário
- `GET /api/user/profile` - Obter perfil (JWT)
- `PUT /api/user/profile` - Atualizar perfil (JWT)
- `PUT /api/user/change-password` - Alterar senha (JWT)
- `DELETE /api/user/account` - Deletar conta (JWT)
- `GET /api/user/stats` - Estatísticas (JWT)

## Autenticação
Header: `Authorization: Bearer {jwt_token}`

## Como usar
```bash
# Iniciar servidor
cd backend && node server.js

# Registrar
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456","name":"User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}'
```

## Formatos
- **Cores:** #FFFFFF
- **Estilos:** crew-neck, v-neck, tank-top, long-sleeve
- **Upload:** PNG, JPG, SVG (max 5MB)
- **HTTP Status:** 200 (OK), 400 (Erro), 401 (Não autorizado), 500 (Erro servidor)

### 📋 Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/auth/register` | Registrar novo usuário | ❌ |
| `POST` | `/api/auth/login` | Fazer login | ❌ |
| `POST` | `/api/upload/image` | Upload de imagem | ✅ |
| `POST` | `/api/tshirt/save` | Salvar design de camiseta | ✅ |
| `GET` | `/api/tshirt/my-designs` | Listar meus designs | ✅ |
| `GET` | `/api/tshirt/{id}` | Obter design por ID | ✅ |
| `GET` | `/api/tshirt/public/gallery` | Galeria pública | ❌ |
| `GET` | `/api/user/profile` | Obter perfil do usuário | ✅ |
| `PUT` | `/api/user/profile` | Atualizar perfil | ✅ |
| `PUT` | `/api/user/change-password` | Alterar senha | ✅ |
| `DELETE` | `/api/user/account` | Deletar conta | ✅ |
| `GET` | `/api/user/stats` | Estatísticas do usuário | ✅ |

### 🔐 Autenticação

A API usa autenticação JWT Bearer Token:

```javascript
// Header de autenticação
Authorization: Bearer {seu_jwt_token}
```

### 📁 Schemas Principais

#### User (Usuário)
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "createdAt": "string (ISO 8601)"
}
```

#### TshirtDesign (Design de Camiseta)
```json
{
  "id": "string",
  "name": "string",
  "color": "#FF0000",
  "style": "crew-neck",
  "logo": "/uploads/logo.png",
  "logoPosition": { "x": 0, "y": 0 },
  "logoScale": 1.0,
  "text": "Texto Personalizado",
  "textPosition": { "x": 0, "y": -0.3 },
  "textColor": "#000000",
  "textSize": 0.1,
  "isPublic": false,
  "userId": "string",
  "createdAt": "string (ISO 8601)"
}
```

#### Upload (Arquivo)
```json
{
  "filename": "unique_filename.jpg",
  "originalName": "original_name.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "path": "/uploads/unique_filename.jpg"
}
```

### 🚀 Como Usar

1. **Inicie o servidor:**
   ```bash
   cd backend
   node server.js
   ```

2. **Acesse a documentação:**
   ```
   http://localhost:3001/api-docs
   ```

3. **Teste os endpoints:**
   - Use o botão "Try it out" no Swagger UI
   - Para endpoints autenticados, clique em "Authorize" e insira seu JWT token

### 📝 Exemplos de Uso

#### Registrar Usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "fulano",
    "email": "fulano@mail.com",
    "password": "senha123"
  }'
```

#### Fazer Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fulano@mail.com",
    "password": "senha123"
  }'
```

#### Salvar Design (com token)
```bash
curl -X POST http://localhost:3001/api/tshirt/save \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Design",
    "color": "#FF0000",
    "style": "crew-neck",
    "text": "Hello World"
  }'
```

#### Obter Perfil do Usuário
```bash
curl -X GET http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Atualizar Perfil
```bash
curl -X PUT http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Nome",
    "email": "novo@email.com"
  }'
```

#### Alterar Senha
```bash
curl -X PUT http://localhost:3001/api/user/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "senhaAtual123",
    "newPassword": "novaSenha456",
    "confirmPassword": "novaSenha456"
  }'
```

#### Obter Estatísticas do Usuário
```bash
curl -X GET http://localhost:3001/api/user/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🎨 Especificações

- **Cores:** Formato hexadecimal (#FFFFFF)
- **Estilos:** crew-neck, v-neck, tank-top, long-sleeve
- **Upload:** PNG, JPG, JPEG, SVG (máximo 5MB)
- **Texto:** Máximo 50 caracteres
- **Posições:** Coordenadas x,y em sistema 3D

Códigos de status HTTP utilizados:
- `200` - Sucesso
- `201` - Criado
- `400` - Erro de validação
- `401` - Não autorizado
- `404` - Não encontrado
- `413` - Arquivo muito grande
- `429` - Muitas tentativas
- `500` - Erro interno

### 📊 Monitoramento

- Health check: `GET /health`
- API docs JSON: `GET /api-docs.json`
- Swagger UI: `GET /api-docs`
