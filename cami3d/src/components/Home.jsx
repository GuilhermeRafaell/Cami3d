import { useState, useEffect } from 'react'
import { Shirt, Sparkles, Users, Mail, ArrowRight, User, LogOut, Grid, Plus, Eye, RefreshCw } from 'lucide-react'
import Modal from './Modal'
import AuthModal from './AuthModal'
import logoImage from '../assets/logo.png'
import { getMyDesigns } from '../utils/api'
import './Home.css'

function Home({ onNavigateToApp, user, onLogin, onLogout }) {
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [userDesigns, setUserDesigns] = useState([])
  const [loadingDesigns, setLoadingDesigns] = useState(false)
  const [designCount, setDesignCount] = useState(0)

  // Carregar designs do usuário quando ele estiver logado
  useEffect(() => {
    const loadUserDesigns = async () => {
      try {
        setLoadingDesigns(true)
        const designs = await getMyDesigns(user.token)
        setUserDesigns(designs.designs || [])
        // Animar contador
        animateCounter(designs.designs?.length || 0)
      } catch (error) {
        console.error('Erro ao carregar designs:', error)
        setUserDesigns([])
        setDesignCount(0)
      } finally {
        setLoadingDesigns(false)
      }
    }

    if (user && user.token) {
      loadUserDesigns()
    } else {
      setUserDesigns([])
      setDesignCount(0)
    }
  }, [user])

  const animateCounter = (targetCount) => {
    let current = 0
    const increment = targetCount / 30 // 30 frames para chegar ao número
    const timer = setInterval(() => {
      current += increment
      if (current >= targetCount) {
        setDesignCount(targetCount)
        clearInterval(timer)
      } else {
        setDesignCount(Math.floor(current))
      }
    }, 50)
  }

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
              <div className="user-status-indicator"></div>
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
            {user ? (
              <>
                Bem-vindo de volta,
                <span className="highlight"> {user.name || user.email}!</span>
              </>
            ) : (
              <>
                Personalize sua camiseta em
                <span className="highlight"> 3D</span>
              </>
            )}
          </h1>

          <p className="hero-description">
            {user ? (
              "Continue criando designs únicos ou explore sua galeria de camisetas personalizadas."
            ) : (
              "Crie designs únicos, visualize em tempo real e tenha sua camiseta personalizada sem complicação. Tudo em uma plataforma moderna e intuitiva."
            )}
          </p>

          {!user && (
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
          )}

          <button className="cta-button" onClick={user ? onNavigateToApp : () => setShowLoginModal(true)}>
            {user ? 'Criar Nova Camiseta' : 'Começar a personalizar'}
            <Plus size={20} />
          </button>
        </div>

        <div className="hero-visual">
          <div className="floating-logo">
            <img src={logoImage} alt="Cami3D Logo" className="floating-logo-image" />
          </div>
        </div>
      </main>

      {/* Galeria de Designs do Usuário */}
      {user && (
        <section className="user-gallery">
          <div className="gallery-content">
            <div className="gallery-header">
              <h2 className="gallery-title">
                <Grid className="gallery-icon" />
                Meus Designs
                {!loadingDesigns && (
                  <button 
                    className="refresh-btn" 
                    onClick={() => {
                      if (user && user.token) {
                        const loadUserDesigns = async () => {
                          try {
                            setLoadingDesigns(true)
                            const designs = await getMyDesigns(user.token)
                            setUserDesigns(designs.designs || [])
                            animateCounter(designs.designs?.length || 0)
                          } catch (error) {
                            console.error('Erro ao carregar designs:', error)
                          } finally {
                            setLoadingDesigns(false)
                          }
                        }
                        loadUserDesigns()
                      }
                    }}
                    title="Atualizar designs"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </h2>
              <p className="gallery-subtitle">
                {userDesigns.length > 0 
                  ? (
                    <>
                      Você já criou <span className="count-highlight">{designCount}</span> design{designCount > 1 ? 's' : ''} personalizado{designCount > 1 ? 's' : ''}!
                    </>
                  )
                  : "Comece criando seu primeiro design personalizado!"
                }
              </p>
            </div>

            {loadingDesigns ? (
              <div className="gallery-loading">
                <div className="spinner"></div>
                <span>Carregando seus designs...</span>
              </div>
            ) : userDesigns.length > 0 ? (
              <div className="designs-grid">
                {userDesigns.slice(0, 6).map((design, index) => (
                  <div 
                    key={design.id} 
                    className="design-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="design-image">
                      {design.config?.logo ? (
                        <img 
                          src={design.config.logo} 
                          alt={design.name || 'Design'} 
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextElementSibling.style.display = 'flex'
                          }}
                        />
                      ) : (
                        <div className="design-placeholder" style={{ display: design.config?.logo ? 'none' : 'flex' }}>
                          <Shirt size={48} />
                        </div>
                      )}
                      <div className="design-placeholder" style={{ display: 'none' }}>
                        <Shirt size={48} />
                      </div>
                    </div>
                    <div className="design-info">
                      <h3 className="design-name">{design.name || 'Design sem nome'}</h3>
                      <p className="design-date">
                        {new Date(design.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="design-details">
                        {design.config?.text && (
                          <div className="design-text">
                            <span className="detail-label">Texto:</span>
                            <span className="detail-value">"{design.config.text}"</span>
                          </div>
                        )}
                        <div className="design-colors">
                          <span className="detail-label">Cores:</span>
                          <div className="colors-container">
                            <div 
                              className="color-dot" 
                              style={{ backgroundColor: design.config?.color || '#ffffff' }}
                              title={`Cor da camiseta: ${design.config?.color || '#ffffff'}`}
                            ></div>
                            {design.config?.textColor && (
                              <div 
                                className="color-dot" 
                                style={{ backgroundColor: design.config.textColor }}
                                title={`Cor do texto: ${design.config.textColor}`}
                              ></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="design-view-btn" onClick={onNavigateToApp}>
                      <Eye size={16} />
                      Ver Design
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-gallery">
                <Shirt size={64} className="empty-icon" />
                <h3>Nenhum design ainda</h3>
                <p>Que tal criar sua primeira camiseta personalizada?</p>
                <button className="create-first-design" onClick={onNavigateToApp}>
                  <Plus size={16} />
                  Criar Primeiro Design
                </button>
              </div>
            )}

            {userDesigns.length > 6 && (
              <div className="gallery-footer">
                <button className="view-all-btn" onClick={onNavigateToApp}>
                  Ver todos os {userDesigns.length} designs
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

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
