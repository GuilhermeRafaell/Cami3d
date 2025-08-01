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
cami3d/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx      # Modal de autenticação
│   │   ├── Home.jsx           # Página inicial
│   │   ├── MainApp.jsx        # Aplicação principal
│   │   ├── Modal.jsx          # Componente modal base
│   │   └── TShirtOBJViewer.jsx # Visualizador 3D
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx               # Componente raiz
│   ├── main.jsx             # Ponto de entrada
│   └── index.css            # Estilos globais
├── index.html
├── package.json
└── vite.config.js
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

### Passos para execução

1. **Clone o repositório**
   ```bash
   git clone https://github.com/GuilhermeRafaell/Cami3d.git
   cd Cami3d/cami3d
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**
   ```
   http://localhost:5173
   ```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa verificação de código

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