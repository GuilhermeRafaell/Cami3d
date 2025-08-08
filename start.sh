#!/bin/bash

# 🚀 Start Script - Cami3D
# =========================

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando Cami3D...${NC}"

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "cami3d" ]; then
    echo -e "${RED}❌ Execute na raiz do projeto Cami3D${NC}"
    exit 1
fi

# Verificar dependências
if [ ! -d "backend/node_modules" ] || [ ! -d "cami3d/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependências não encontradas. Execute: ./setup.sh${NC}"
    exit 1
fi

# Limpar processos anteriores
./stop.sh 2>/dev/null

# Criar diretório de logs
mkdir -p logs

# Verificar portas
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Liberando porta 3001...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Liberando porta 5173...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null
fi

# Iniciar backend
echo -e "${CYAN}🔧 Iniciando backend...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Aguardar backend
sleep 3

# Verificar backend
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Falha ao iniciar backend${NC}"
    exit 1
fi

# Testar backend
for i in {1..10}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend rodando (PID: $BACKEND_PID)${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Backend não responde${NC}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Iniciar frontend
echo -e "${CYAN}🎨 Iniciando frontend...${NC}"
cd cami3d
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

# Aguardar frontend
sleep 5

# Verificar frontend
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Falha ao iniciar frontend${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Verificação final
sleep 2
if kill -0 $BACKEND_PID 2>/dev/null && kill -0 $FRONTEND_PID 2>/dev/null; then
    echo
    echo -e "${GREEN}🎉 Cami3D iniciado com sucesso!${NC}"
    echo
    echo -e "${BLUE}📱 URLs:${NC}"
    echo -e "   Frontend: ${YELLOW}http://localhost:5173${NC}"
    echo -e "   Backend:  ${YELLOW}http://localhost:3001${NC}"
    echo
    echo -e "${BLUE}💡 Comandos úteis:${NC}"
    echo -e "   ${YELLOW}./logs.sh${NC} - Ver logs"
    echo -e "   ${YELLOW}./stop.sh${NC} - Parar serviços"
    echo
else
    echo -e "${RED}❌ Falha na inicialização${NC}"
    ./stop.sh
    exit 1
fi
