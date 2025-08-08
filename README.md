# 🎨 Cami3D - Customizador de Camisetas 3D

Uma aplicação web moderna que permite a personalização completa de camisetas em um ambiente 3D interativo, proporcionando uma experiência imersiva de design e visualização.

## ✨ Características

- **Visualização 3D em Tempo Real**: Veja suas personalizações instantaneamente em um modelo 3D interativo
- **Interface Intuitiva**: Design moderno e responsivo para uma experiência de usuário fluida
- **Sistema de Autenticação**: Login seguro com opções de cadastro e recuperação de senha
- **Personalização Completa**: Modifique cores, padrões e designs da camiseta
- **Controles Interativos**: Rotacione, amplie e explore o modelo 3D com facilidade

## 🚀 Tecnologias Utilizadas

- **React 19.1.0** - Framework principal para interface de usuário
- **Vite 7.0.0** - Ferramenta de build rápida e moderna
- **Three.js** - Renderização 3D avançada
  - `@react-three/fiber` - Integração React com Three.js
  - `@react-three/drei` - Utilitários e componentes 3D
- **Lucide React** - Biblioteca de ícones moderna
- **CSS Modules** - Estilização componetizada

## 📁 Estrutura do Projeto

```
Cami3d/
├── backend/                 # API Backend (Node.js/Express)
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares de autenticação
│   │   └── config/         # Configurações (Swagger, etc)
│   ├── data/              # Arquivos de dados JSON
│   └── uploads/           # Arquivos enviados pelos usuários
├── cami3d/                # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── utils/         # Utilitários (API client)
│   │   └── assets/        # Recursos estáticos
│   └── public/            # Arquivos públicos
├── tests/                 # Scripts de teste
│   ├── endpoints.sh       # Teste de endpoints da API
│   └── README.md          # Documentação dos testes
├── logs/                  # Logs do sistema
├── *.sh                   # Scripts de gerenciamento
└── test.sh               # Script principal de testes
```

## 🎯 Funcionalidades

### 🏠 Página Inicial
- Landing page atrativa com informações do produto
- Navegação fluida entre seções (Sobre, Contato, Acessar)
- Design responsivo com gradientes modernos

### 🔐 Sistema de Autenticação
- Modal de login/cadastro integrado
- Validação de formulários em tempo real
- Funcionalidade de recuperação de senha
- Interface limpa sem scroll desnecessário

### 🎨 Editor 3D
- Modelo 3D interativo de camiseta
- Controles de órbita para navegação
- Iluminação realista e sombras
- Personalização de cores em tempo real

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### 🚀 Execução Rápida

```bash
# Clone o repositório
git clone https://github.com/GuilhermeRafaell/Cami3d.git
cd Cami3d

# Execute o script de configuração (instala dependências)
./setup.sh

# Execute o projeto completo (backend + frontend)
./start.sh
```

### 📋 Scripts de Gerenciamento

- `./setup.sh` - Configura o projeto (instala dependências)
- `./start.sh` - Inicia backend e frontend simultaneamente  
- `./stop.sh` - Para todos os serviços
- `./logs.sh` - Visualiza logs em tempo real
- `./test.sh` - Executa suite de testes

### 🧪 Executar Testes

```bash
# Executar todos os testes
./test.sh all

# Testar apenas endpoints da API
./test.sh endpoints

# Ver resultados dos testes
./test.sh logs
```

### 🎯 Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Documentação**: http://localhost:3001/ (Swagger)

## 📝 Scripts Disponíveis

### Scripts de Gerenciamento
- `./setup.sh` - Configuração inicial do projeto
- `./start.sh` - Inicia backend e frontend
- `./stop.sh` - Para todos os serviços  
- `./logs.sh` - Visualiza logs do sistema
- `./test.sh` - Suite de testes completa

### Scripts do Frontend (cami3d/)
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificação de código

### Scripts do Backend (backend/)
- `npm start` - Inicia servidor de produção
- `npm run dev` - Servidor com hot-reload
- `npm test` - Executa testes unitários

## 🎨 Capturas de Tela

### Página Inicial
Uma landing page moderna com design atrativo e navegação intuitiva.

### Interface de Customização
Editor 3D com controles intuitivos para personalização completa.

### Sistema de Login
Modal de autenticação com design limpo e validação em tempo real.

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Guilherme Rafael**
- GitHub: [@GuilhermeRafaell](https://github.com/GuilhermeRafaell)

## 🙏 Agradecimentos

- React Three Fiber community
- Three.js contributors
- Lucide Icons team
- Vite development team

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!