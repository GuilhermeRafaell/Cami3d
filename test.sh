#!/bin/bash

# Script principal de teste para o projeto Cami3D
# Este script executa todos os testes disponíveis

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🧪 CAMI3D - SUITE DE TESTES 🧪${NC}"
echo -e "${BLUE}$(date)${NC}"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "tests" ] || [ ! -d "backend" ] || [ ! -d "cami3d" ]; then
    echo -e "${RED}❌ Execute este script a partir da raiz do projeto Cami3D${NC}"
    exit 1
fi

echo -e "${CYAN}📁 Estrutura do projeto verificada${NC}"
echo ""

# Função para executar testes
run_test_suite() {
    local test_name="$1"
    local test_script="$2"
    local description="$3"
    
    echo -e "${BLUE}=== $test_name ===${NC}"
    echo -e "${CYAN}$description${NC}"
    echo ""
    
    if [ -f "$test_script" ]; then
        chmod +x "$test_script"
        if [ "$test_script" = "tests/endpoints.sh" ]; then
            # Para o teste de endpoints, executar na pasta tests
            cd tests
            ./endpoints.sh
            cd ..
        else
            ./"$test_script"
        fi
        
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            echo -e "${GREEN}✅ $test_name concluído com sucesso${NC}"
        else
            echo -e "${RED}❌ $test_name falhou (código: $exit_code)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Script $test_script não encontrado${NC}"
    fi
    
    echo ""
}

# Menu de opções
show_menu() {
    echo -e "${PURPLE}Escolha o tipo de teste:${NC}"
    echo "1) Teste de Endpoints da API"
    echo "2) Teste de Configuração do Projeto"
    echo "3) Executar Todos os Testes"
    echo "4) Ver Logs de Teste"
    echo "5) Limpar Logs de Teste"
    echo "0) Sair"
    echo ""
    echo -n "Opção: "
}

# Executar testes baseado na opção
case "${1:-menu}" in
    "endpoints"|"1")
        run_test_suite "Teste de Endpoints" "tests/endpoints.sh" "Testando todos os endpoints da API backend"
        ;;
    "setup"|"2")
        run_test_suite "Teste de Configuração" "setup.sh" "Verificando configuração do projeto"
        ;;
    "all"|"3")
        echo -e "${PURPLE}🚀 EXECUTANDO TODOS OS TESTES 🚀${NC}"
        echo ""
        run_test_suite "Teste de Configuração" "setup.sh" "Verificando configuração do projeto"
        run_test_suite "Teste de Endpoints" "tests/endpoints.sh" "Testando todos os endpoints da API backend"
        ;;
    "logs"|"4")
        if [ -f "tests/test-results.log" ]; then
            echo -e "${CYAN}📋 Últimos resultados de teste:${NC}"
            echo ""
            cat tests/test-results.log
        else
            echo -e "${YELLOW}⚠️  Nenhum log de teste encontrado${NC}"
        fi
        ;;
    "clean"|"5")
        echo -e "${CYAN}🧹 Limpando logs de teste...${NC}"
        rm -f tests/test-results.log
        rm -f tests/server.log
        rm -f tests/server.pid
        echo -e "${GREEN}✅ Logs limpos${NC}"
        ;;
    "menu")
        while true; do
            show_menu
            read -r choice
            echo ""
            
            case $choice in
                1|"endpoints")
                    run_test_suite "Teste de Endpoints" "tests/endpoints.sh" "Testando todos os endpoints da API backend"
                    ;;
                2|"setup")
                    run_test_suite "Teste de Configuração" "setup.sh" "Verificando configuração do projeto"
                    ;;
                3|"all")
                    echo -e "${PURPLE}🚀 EXECUTANDO TODOS OS TESTES 🚀${NC}"
                    echo ""
                    run_test_suite "Teste de Configuração" "setup.sh" "Verificando configuração do projeto"
                    run_test_suite "Teste de Endpoints" "tests/endpoints.sh" "Testando todos os endpoints da API backend"
                    ;;
                4|"logs")
                    if [ -f "tests/test-results.log" ]; then
                        echo -e "${CYAN}📋 Últimos resultados de teste:${NC}"
                        echo ""
                        cat tests/test-results.log
                    else
                        echo -e "${YELLOW}⚠️  Nenhum log de teste encontrado${NC}"
                    fi
                    ;;
                5|"clean")
                    echo -e "${CYAN}🧹 Limpando logs de teste...${NC}"
                    rm -f tests/test-results.log
                    rm -f tests/server.log
                    rm -f tests/server.pid
                    echo -e "${GREEN}✅ Logs limpos${NC}"
                    ;;
                0|"sair"|"exit")
                    echo -e "${CYAN}👋 Saindo...${NC}"
                    exit 0
                    ;;
                *)
                    echo -e "${RED}❌ Opção inválida${NC}"
                    ;;
            esac
            echo ""
        done
        ;;
    "help"|"-h"|"--help")
        echo "Uso: $0 [opção]"
        echo ""
        echo "Opções:"
        echo "  endpoints, 1    Executar teste de endpoints da API"
        echo "  setup, 2        Executar teste de configuração"
        echo "  all, 3          Executar todos os testes"
        echo "  logs, 4         Ver logs de teste"
        echo "  clean, 5        Limpar logs de teste"
        echo "  menu            Mostrar menu interativo (padrão)"
        echo "  help            Mostrar esta ajuda"
        echo ""
        ;;
    *)
        echo -e "${RED}❌ Opção inválida: $1${NC}"
        echo -e "${CYAN}Use '$0 help' para ver as opções disponíveis${NC}"
        exit 1
        ;;
esac
