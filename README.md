# Cami3D - Customizador de Camisetas 3D

Sistema web para personalização de camisetas em 3D com interface intuitiva e funcionalidades completas.

## O que faz

- Personalização visual de camisetas em ambiente 3D
- Sistema de usuários com autenticação JWT
- Upload e gerenciamento de imagens
- Salvar e compartilhar criações

## Tecnologias

**Frontend:** React + Vite + Three.js  
**Backend:** Node.js + Express + MongoDB  
**Deploy:** DisCloud + MongoDB Atlas

## Como usar

### Produção (pronto para usar)
- **Site:** https://cami3d.discloud.app
- **API:** https://capmi3d.discloud.app/api

### Desenvolvimento local

```bash
# Clonar e configurar
git clone https://github.com/GuilhermeRafaell/Cami3d.git
cd Cami3d
./setup.sh

# Executar
./start.sh

# Acessar
# Frontend: http://localhost:8080 (configurado no vite.config.js)
# Backend: http://localhost:3001
```

## Funcionalidades implementadas

### Autenticação
- Registro e login de usuários
- Recuperação de senha (Implementado apenas no backend)
- Tokens JWT com expiração

### Editor 3D
- Modelo interativo de camiseta
- Personalização de cores
- Adição de texto e logos
- Upload de imagens (PNG, JPG, SVG)

### Gerenciamento
- Salvar designs no banco
- Listar designs do usuário (Implementado apenas no backend)
- Editar e excluir designs (Implementado apenas no backend)
- Galeria pública (Implementado apenas no backend)

### API REST
- Endpoints documentados (Swagger)
- Validação de dados
- Rate limiting
- Upload de arquivos

## API Endpoints

### Autenticação (`/api/auth`)
- `POST /register` - Criar conta
- `POST /login` - Fazer login
- `POST /verify-token` - Validar token

### Designs (`/api/tshirt`)
- `POST /save` - Salvar design
- `GET /my-designs` - Listar designs (Implementado apenas no backend)
- `GET /public/gallery` - Galeria pública (Implementado apenas no backend)

### Uploads (`/api/upload`)
- `POST /image` - Enviar imagem
- `GET /user-images` - Listar imagens (Implementado apenas no backend)

### Usuários (`/api/user`)
- `GET /profile` - Ver perfil (Implementado apenas no backend)
- `PUT /profile` - Editar perfil (Implementado apenas no backend)
- `GET /stats` - Estatísticas (Implementado apenas no backend)

## Scripts

- `./setup.sh` - Instalar dependências
- `./start.sh` - Executar projeto
- `./stop.sh` - Parar serviços
- `./test.sh` - Executar testes

## Requisitos

- Node.js 18+
- MongoDB (Atlas ou local)
- Navegador moderno com WebGL