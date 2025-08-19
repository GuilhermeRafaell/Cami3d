# Cami3D - Customizador de Camisetas 3D


### 🌐 Sistema em Produção
- **Site:** https://cami3d.discloud.app
- **API:** https://capmi3d.discloud.app/

### Autores
- Guilherme Rafael
- Guilherme Kameoka
- Carlos Livius
  
## Documentação de tudo que foi desenvolvido até a data da apresentação do sistema (18/08/25), conforme descrito no cronograma

### 📅 Semana 3 (02/08) - Desenvolvimento Paralelo Inicial

#### Frontend (React + CSS)
- ✅ **Telas de Login**: Modal de autenticação implementado
- ✅ **Telas de Cadastro**: Registro de usuários com validação
- ✅ **Dashboard**: Interface principal com editor 3D

#### Backend (Node.js + Express)
- ✅ **Configuração básica**: Servidor Express configurado
- ✅ **Criação das rotas**: Endpoints de autenticação estruturados
- ✅ **Autenticação JWT**: Sistema de tokens implementado

#### Integração
- ✅ **Testes com Postman**: Validação de endpoints via collection
- ✅ **Versionamento GitHub**: Pull requests e revisões colaborativas

### 📅 Semana 4 (04/08) - Painel de Personalização

#### Frontend (React-Three-Fiber)
- ✅ **Integração modelos 3D**: Arquivos .glb carregados no canvas
- ✅ **Interações básicas**: Troca de cor implementada
- ✅ **Aplicação de imagem**: Upload e aplicação de logos
- ✅ **Aplicação de texto**: Adição de texto customizável

#### Backend
- ✅ **Rotas de upload**: Multer configurado para imagens
- ✅ **Armazenamento JSON**: Dados iniciais em estrutura JSON
- ✅ **Validação de arquivos**: Tipos e tamanhos validados

### 📅 Semana 5 (11/08) - Implementação de novas funcionalidades

#### Frontend
- ✅ **Interações 3D completas**: Rotação, zoom e navegação
- ✅ **Troca de modelos**: Por enquanto apenas um modelo de camiseta
- ✅ **Botão "Finalizar Pedido"**: Compilação e salvamento de dados

#### Backend
- ✅ **Modelagem do banco**: Migração para MongoDB Atlas
- ✅ **Persistência de projetos**: Rota completa de salvamento
- ✅ **Galeria pública**: Sistema de compartilhamento (backend pronto)

#### Preparação para Entrega
- ✅ **Revisão geral**: Código testado e documentado
- ✅ **Deploy em produção**: DisCloud configurado
- ✅ **Documentação**: API documentada com Swagger

## Funcionalidades Implementadas

### 🔐 Autenticação (Semana 3)
- Sistema de login com JWT
- Registro de novos usuários
- Validação de formulários
- Recuperação de senha (backend pronto)

### 🎨 Editor 3D (Semana 4-5)
- Canvas 3D com React-Three-Fiber
- Modelos .glb carregados dinamicamente
- Personalização de cores em tempo real
- Upload e aplicação de imagens/logos
- Adição de texto customizável
- Controles de câmera (rotação, zoom)

### 💾 Persistência de Dados (Semana 5)
- Botão "Finalizar Pedido" funcional
- Salvamento de projetos no MongoDB
- Galeria pública de designs (backend pronto)
- Gerenciamento de arquivos uploadados (backend pronto)

### 🌐 API REST Completa
- Endpoints documentados (Swagger)
- Validação de dados robusta
- Rate limiting e segurança
- Testes automatizados

## Endpoints da API implementados

### 🔐 Autenticação (`/api/auth`)
- `POST /register` - Registrar usuário
- `POST /login` - Fazer login
- `POST /verify-token` - Validar token JWT
- `POST /refresh-token` - Renovar token
- `POST /forgot-password` - Recuperar senha

### 🎨 Designs de Camisetas (`/api/tshirt`)
- `POST /save` - Salvar design personalizado
- `GET /my-designs` - Listar designs do usuário
- `GET /:id` - Obter design específico
- `PUT /:id` - Atualizar design
- `DELETE /:id` - Excluir design
- `POST /:id/duplicate` - Duplicar design
- `GET /public/gallery` - Galeria pública com paginação

### 📁 Upload de Arquivos (`/api/upload`)
- `POST /image` - Upload de imagem (PNG/JPG/SVG)
- `GET /user-images` - Listar imagens do usuário
- `GET /info/:id` - Informações da imagem
- `DELETE /:id` - Excluir imagem

### 👤 Usuários (`/api/user`)
- `GET /profile` - Perfil do usuário
- `PUT /profile` - Atualizar perfil
- `PUT /change-password` - Alterar senha
- `DELETE /account` - Excluir conta
- `GET /stats` - Estatísticas do usuário

## Scripts de gerenciamento criados
- `./setup.sh` - Instalador de dependências
- `./start.sh` - Executa o projeto completo (front + backend)
- `./stop.sh` - Para todos os serviços
- `./logs.sh` - Visualizar logs em tempo real
- `./test.sh` - Executa testes automatizados

## Testes & Validações feitos
- Collection Postman para testes de API
- Testes automatizados dos endpoints
- Validação de integração frontend-backend
- Monitoramento de saúde da aplicação

