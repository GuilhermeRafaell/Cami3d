import { useState } from 'react'
import { Shirt, Sparkles, Users, Mail, ArrowRight, User, LogOut } from 'lucide-react'
import Modal from './Modal'
import AuthModal from './AuthModal'
import logoImage from '../assets/logo.png'
import './Home.css'

function Home({ onNavigateToApp, user, onLogin, onLogout }) {
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <div className="home">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <div className="logo">
            <img src={logoImage} alt="Cami3D Logo" className="logo-icon" />
            <span className="logo-text">Cami3D</span>
          </div>
          
          {user && (
            <div className="welcome-user">
              <User size={18} />
              <span>Olá, {user.name || user.email}!</span>
            </div>
          )}

          <nav className="nav-buttons">
            <button
              className="nav-btn"
              onClick={() => setShowAboutModal(true)}
            >
              Sobre
            </button>
            <button
              className="nav-btn"
              onClick={() => setShowContactModal(true)}
            >
              Contato
            </button>

            {user ? (
              // Usuário logado - mostrar nome e botões
              <div className="user-nav">
                <button
                  className="nav-btn primary"
                  onClick={onNavigateToApp}
                >
                  Ir para App
                  <ArrowRight size={16} />
                </button>
                <button
                  className="nav-btn primary"
                  onClick={onLogout}
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            ) : (
              // Usuário não logado - mostrar botão de acesso
              <button
                className="nav-btn primary"
                onClick={() => setShowLoginModal(true)}
              >
                Acessar
                <ArrowRight size={16} />
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="home-main">
        <div className="hero-content">
          <h1 className="hero-title">
            Personalize sua camiseta em
            <span className="highlight"> 3D</span>
          </h1>

          <p className="hero-description">
            Crie designs únicos, visualize em tempo real e tenha sua camiseta
            personalizada sem complicação. Tudo em uma plataforma moderna e intuitiva.
          </p>

          <div className="hero-features">
            <div className="feature">
              <Sparkles className="feature-icon" />
              <span>Visualização 3D em tempo real</span>
            </div>
            <div className="feature">
              <Users className="feature-icon" />
              <span>Interface intuitiva e fácil</span>
            </div>
            <div className="feature">
              <Shirt className="feature-icon" />
              <span>Personalização completa</span>
            </div>
          </div>

          <button className="cta-button" onClick={user ? onNavigateToApp : () => setShowLoginModal(true)}>
            {user ? 'Ir para o App' : 'Começar a personalizar'}
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="hero-visual">
          <div className="floating-shirt">
            <Shirt size={120} />
          </div>
        </div>
      </main>

      {/* Modal de Login */}
      {showLoginModal && (
        <AuthModal
          onLogin={(userData) => {
            onLogin(userData)
            setShowLoginModal(false)
            // Removido: onNavigateToApp() - usuário permanece na Home
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Modals */}
      {showAboutModal && (
        <Modal onClose={() => setShowAboutModal(false)}>
          <h2>Sobre o Cami3D</h2>
          <p>
            O Cami3D é uma plataforma inovadora que permite personalizar camisetas
            usando tecnologia 3D avançada. Nossa missão é democratizar a criação
            de roupas personalizadas, oferecendo uma experiência única e intuitiva.
          </p>
          <p>
            <strong>Recursos principais:</strong>
          </p>
          <ul>
            <li>Visualização 3D em tempo real</li>
            <li>Upload de logos e imagens personalizadas</li>
            <li>Edição de texto e cores</li>
            <li>Integração direta com a fabricação</li>
          </ul>
        </Modal>
      )}

      {showContactModal && (
        <Modal onClose={() => setShowContactModal(false)}>
          <h2>Entre em Contato</h2>
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={20} />
              <span>contato@cami3d.com</span>
            </div>
            <div className="contact-item">
              <span>📱</span>
              <span>(11) 99999-9999</span>
            </div>
            <div className="contact-item">
              <span>📍</span>
              <span>São Paulo, SP - Brasil</span>
            </div>
          </div>
          <p>
            Estamos aqui para ajudar! Entre em contato conosco para dúvidas,
            sugestões ou suporte técnico.
          </p>
        </Modal>
      )}
    </div>
  )
}

export default Home
