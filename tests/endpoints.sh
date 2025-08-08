#!/bin/bash

# Script de teste para verificar endpoints do backend Cami3D
# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
API_BASE="http://localhost:3001/api"
BACKEND_DIR="../backend"
LOG_FILE="test-results.log"

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0

# Função para logging
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Função para testar endpoint
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local description="$3"
    local expected_status="$4"
    local auth_token="$5"
    local data="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${CYAN}Testing: $description${NC}"
    
    # Construir comando curl
    local curl_cmd="curl -s -w '%{http_code}' -X $method"
    
    if [ ! -z "$auth_token" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $auth_token'"
    fi
    
    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd $API_BASE$endpoint"
    
    # Executar teste
    local response=$(eval $curl_cmd)
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status: $status_code"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log "PASS: $method $endpoint - Status: $status_code"
    else
        echo -e "${RED}✗ FAIL${NC} - Expected: $expected_status, Got: $status_code"
        log "FAIL: $method $endpoint - Expected: $expected_status, Got: $status_code"
        if [ ! -z "$body" ]; then
            echo -e "${YELLOW}Response: $body${NC}"
            log "Response: $body"
        fi
    fi
    echo ""
}

# Função para verificar se o servidor está rodando
check_server() {
    echo -e "${BLUE}=== Verificando Servidor ===${NC}"
    
    if ! curl -s "$API_BASE/health" > /dev/null; then
        echo -e "${RED}❌ Servidor não está rodando. Iniciando...${NC}"
        
        # Verificar se o diretório backend existe
        if [ ! -d "$BACKEND_DIR" ]; then
            echo -e "${RED}❌ Diretório $BACKEND_DIR não encontrado${NC}"
            exit 1
        fi
        
        # Iniciar servidor em background
        cd "$BACKEND_DIR"
        npm start > ../tests/server.log 2>&1 &
        local server_pid=$!
        cd ../tests
        
        echo -e "${YELLOW}⏳ Aguardando servidor inicializar...${NC}"
        sleep 10
        
        # Verificar se o servidor iniciou
        if ! curl -s "$API_BASE/health" > /dev/null; then
            echo -e "${RED}❌ Falha ao iniciar servidor${NC}"
            kill $server_pid 2>/dev/null
            exit 1
        fi
        
        echo -e "${GREEN}✅ Servidor iniciado (PID: $server_pid)${NC}"
        echo "$server_pid" > server.pid
    else
        echo -e "${GREEN}✅ Servidor já está rodando${NC}"
    fi
    echo ""
}

# Função principal de teste
run_tests() {
    echo -e "${PURPLE}🚀 INICIANDO TESTES DOS ENDPOINTS 🚀${NC}"
    echo -e "${BLUE}$(date)${NC}"
    echo ""
    
    # Limpar log anterior
    > "$LOG_FILE"
    
    # Verificar servidor
    check_server
    
    # Variáveis para autenticação
    local test_email="test@example.com"
    local test_password="123456"
    local auth_token=""
    
    echo -e "${BLUE}=== Testando Endpoints de Autenticação ===${NC}"
    
    # 1. Health check
    test_endpoint "GET" "/health" "Health check" "200"
    
    # 2. Registro de usuário
    test_endpoint "POST" "/auth/register" "Registro de usuário" "201" "" '{"name":"Test User","email":"'$test_email'","password":"'$test_password'"}'
    
    # 3. Login
    echo -e "${CYAN}Fazendo login para obter token...${NC}"
    local login_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"'$test_email'","password":"'$test_password'"}' \
        "$API_BASE/auth/login")
    
    if echo "$login_response" | grep -q "token"; then
        auth_token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ Token obtido com sucesso${NC}"
    else
        echo -e "${YELLOW}⚠ Usando login de usuário existente...${NC}"
        # Tentar com usuário admin padrão
        local admin_response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d '{"email":"admin@example.com","password":"admin123"}' \
            "$API_BASE/auth/login")
        
        if echo "$admin_response" | grep -q "token"; then
            auth_token=$(echo "$admin_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
            echo -e "${GREEN}✓ Token admin obtido${NC}"
        fi
    fi
    echo ""
    
    # 4. Verify token (se implementado)
    if [ ! -z "$auth_token" ]; then
        test_endpoint "POST" "/auth/verify-token" "Verificar token" "200" "$auth_token"
        
        # 5. Refresh token (se implementado)
        test_endpoint "POST" "/auth/refresh-token" "Renovar token" "200" "$auth_token"
    fi
    
    echo -e "${BLUE}=== Testando Endpoints de T-Shirt ===${NC}"
    
    if [ ! -z "$auth_token" ]; then
        # 6. Salvar design
        test_endpoint "POST" "/tshirt/save" "Salvar design" "201" "$auth_token" '{"name":"Design Teste","config":{"color":"blue","size":"M"}}'
        
        # 7. Meus designs
        test_endpoint "GET" "/tshirt/my-designs" "Listar meus designs" "200" "$auth_token"
        
        # 8. Galeria pública
        test_endpoint "GET" "/tshirt/public/gallery" "Galeria pública" "200"
        
        # Para testes de update/delete/duplicate, precisaríamos do ID do design criado
        # Isso poderia ser implementado pegando o ID da resposta do save
    fi
    
    echo -e "${BLUE}=== Testando Endpoints de Upload ===${NC}"
    
    if [ ! -z "$auth_token" ]; then
        # 9. Listar imagens do usuário
        test_endpoint "GET" "/upload/user-images" "Imagens do usuário" "200" "$auth_token"
    fi
    
    echo -e "${BLUE}=== Testando Endpoints de Usuário ===${NC}"
    
    if [ ! -z "$auth_token" ]; then
        # 10. Perfil do usuário
        test_endpoint "GET" "/user/profile" "Perfil do usuário" "200" "$auth_token"
        
        # 11. Estatísticas do usuário
        test_endpoint "GET" "/user/stats" "Estatísticas do usuário" "200" "$auth_token"
    fi
    
    # Resultados finais
    echo -e "${PURPLE}=== RESUMO DOS TESTES ===${NC}"
    echo -e "Total de testes: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "Testes aprovados: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Testes falharam: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Taxa de sucesso: ${YELLOW}$success_rate%${NC}"
    
    echo ""
    echo -e "${CYAN}📄 Log detalhado salvo em: $LOG_FILE${NC}"
    
    # Parar servidor se foi iniciado por este script
    if [ -f "server.pid" ]; then
        local pid=$(cat server.pid)
        echo -e "${YELLOW}🛑 Parando servidor (PID: $pid)...${NC}"
        kill $pid 2>/dev/null
        rm server.pid
    fi
}

# Executar testes
run_tests
