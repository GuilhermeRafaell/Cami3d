#!/bin/bash

# 🛑 Stop Script - Cami3D
# ========================

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}🛑 Parando Cami3D...${NC}"

# Parar por PIDs salvos
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend parado${NC}"
    fi
    rm -f logs/backend.pid
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✅ Frontend parado${NC}"
    fi
    rm -f logs/frontend.pid
fi

# Força parar processos nas portas
BACKEND_PORT_PID=$(lsof -ti:3001 2>/dev/null)
if [ -n "$BACKEND_PORT_PID" ]; then
    kill -9 $BACKEND_PORT_PID 2>/dev/null
    echo -e "${GREEN}✅ Porta 3001 liberada${NC}"
fi

FRONTEND_PORT_PID=$(lsof -ti:5173 2>/dev/null)
if [ -n "$FRONTEND_PORT_PID" ]; then
    kill -9 $FRONTEND_PORT_PID 2>/dev/null
    echo -e "${GREEN}✅ Porta 5173 liberada${NC}"
fi

echo -e "${GREEN}🎉 Todos os serviços foram parados${NC}"
