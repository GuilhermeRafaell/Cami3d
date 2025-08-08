#!/bin/bash

# 📊 Logs Script - Cami3D
# ========================

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}📊 Monitorando logs do Cami3D...${NC}"
echo -e "${YELLOW}💡 Use Ctrl+C para sair${NC}"
echo

# Verificar se os serviços estão rodando
if [ ! -f "logs/backend.pid" ] || [ ! -f "logs/frontend.pid" ]; then
    echo -e "${RED}❌ Serviços não estão rodando${NC}"
    echo -e "${YELLOW}💡 Execute: ./start.sh${NC}"
    exit 1
fi

# Verificar se os logs existem
if [ ! -f "logs/backend.log" ] || [ ! -f "logs/frontend.log" ]; then
    echo -e "${YELLOW}⚠️  Aguardando logs...${NC}"
    sleep 2
fi

# Função para cleanup
cleanup() {
    echo
    echo -e "${GREEN}📊 Monitor de logs finalizado${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Monitorar logs
tail -f logs/backend.log logs/frontend.log | while IFS= read -r line; do
    if [[ $line == *"backend.log"* ]]; then
        echo -e "${PURPLE}[BACKEND]${NC} ====================================="
    elif [[ $line == *"frontend.log"* ]]; then
        echo -e "${CYAN}[FRONTEND]${NC} ====================================="
    elif [[ $line == *"error"* ]] || [[ $line == *"Error"* ]] || [[ $line == *"ERROR"* ]]; then
        echo -e "${RED}$line${NC}"
    elif [[ $line == *"warning"* ]] || [[ $line == *"Warning"* ]] || [[ $line == *"WARN"* ]]; then
        echo -e "${YELLOW}$line${NC}"
    elif [[ $line == *"success"* ]] || [[ $line == *"✅"* ]]; then
        echo -e "${GREEN}$line${NC}"
    else
        echo "$line"
    fi
done
