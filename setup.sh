#!/bin/bash

# 🚀 Setup Script - Cami3D
# ========================
# Configura o ambiente de desenvolvimento

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "🚀 CAMI3D - CONFIGURAÇÃO INICIAL"
echo "================================"
echo -e "${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    echo "Instale Node.js: https://nodejs.org/"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Verificar estrutura do projeto
if [ ! -d "backend" ] || [ ! -d "cami3d" ]; then
    echo -e "${RED}❌ Execute na raiz do projeto Cami3D${NC}"
    exit 1
fi

# Instalar dependências do backend
echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
cd backend
npm install --silent
cd ..

# Instalar dependências do frontend
echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
cd cami3d
npm install --silent
cd ..

# Criar diretórios necessários
mkdir -p logs
mkdir -p backend/uploads
mkdir -p backend/data

# Criar arquivos de dados se não existirem
if [ ! -f "backend/data/users.json" ]; then
    echo "[]" > backend/data/users.json
fi

if [ ! -f "backend/data/tshirts.json" ]; then
    echo "[]" > backend/data/tshirts.json
fi

if [ ! -f "backend/data/uploads.json" ]; then
    echo "[]" > backend/data/uploads.json
fi

# Criar .gitkeep para uploads
touch backend/uploads/.gitkeep

echo
echo -e "${GREEN}🎉 CONFIGURAÇÃO CONCLUÍDA!${NC}"
echo
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo -e "   ${YELLOW}./start.sh${NC}  - Iniciar serviços"
echo -e "   ${YELLOW}./logs.sh${NC}   - Monitorar logs"
echo -e "   ${YELLOW}./stop.sh${NC}   - Parar serviços"
echo
