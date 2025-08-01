import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import TShirtOBJViewer from './TShirtOBJViewer'
import AuthModal from './AuthModal'
import './MainApp.css'

function MainApp({ onNavigateToHome }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [tshirtConfig, setTshirtConfig] = useState({
    color: '#ffffff',
    logo: null,
    logoPosition: { x: 0, y: 0 },
    logoScale: 1,
    text: '',
    textPosition: { x: 0, y: -0.3 },
    textColor: '#000000',
    textSize: 0.1,
    style: 'crew-neck' // crew-neck, v-neck, tank-top
  })

  const handleLogin = (userData) => {
    setIsLoggedIn(true)
    setShowAuthModal(false)
    console.log('Usuário logado:', userData)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    onNavigateToHome() // Volta para home ao fazer logout
  }

  const updateTshirtConfig = (updates) => {
    setTshirtConfig(prev => ({ ...prev, ...updates }))
  }

  const handleFinalizePedido = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true)
      return
    }
    
    // Validação
    if (!tshirtConfig.logo && !tshirtConfig.text) {
      alert('Adicione ao menos um elemento para finalizar sua camiseta.')
      return
    }

    // Gerar dados do pedido
    const pedidoData = {
      config: tshirtConfig,
      timestamp: new Date().toISOString(),
      user: 'current_user' // seria pego do contexto de auth real
    }
    
    console.log('Pedido finalizado:', pedidoData)
    alert('Pedido enviado para produção com sucesso!')
  }

  return (
    <div className="main-app">
      <Header 
        isLoggedIn={isLoggedIn} 
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onNavigateToHome={onNavigateToHome}
      />
      
      <div className="app-content">
        <Sidebar 
          tshirtConfig={tshirtConfig}
          updateConfig={updateTshirtConfig}
          onFinalizePedido={handleFinalizePedido}
        />
        
        <div className="viewer-container">
          <TShirtOBJViewer config={tshirtConfig} />
        </div>  
      </div>

      {showAuthModal && (
        <AuthModal 
          onLogin={handleLogin}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}

export default MainApp
