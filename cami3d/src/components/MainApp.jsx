import { useState, useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import TShirtOBJViewer from './TShirtOBJViewer'
import AuthModal from './AuthModal'
import { saveDesign, getMyDesigns } from '../utils/api'
import './MainApp.css'

function MainApp({ onNavigateToHome }) {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [savedDesigns, setSavedDesigns] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [tshirtConfig, setTshirtConfig] = useState({
    color: '#ffffff',
    logo: null,
    logoPosition: { x: 0, y: 0 },
    logoScale: 1,
    text: '',
    textPosition: { x: 0, y: -0.3 },
    textColor: '#000000',
    textSize: 0.1,
    style: 'crew-neck', // crew-neck, v-neck, tank-top, long-sleeve
    modelType: 'procedural', // Backend expects this
    externalModel: null, // Backend expects this
    renderQuality: 'medium' // Backend expects this
  })

  // Verificar se há token salvo ao carregar
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('userData')
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        userData.token = savedToken
        setUser(userData)
        loadUserDesigns(savedToken)
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
  }, [])

  const loadUserDesigns = async (token) => {
    try {
      const response = await getMyDesigns(token)
      setSavedDesigns(response.designs || [])
    } catch (error) {
      console.error('Erro ao carregar designs:', error)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setShowAuthModal(false)
    
    // Salvar dados no localStorage
    localStorage.setItem('authToken', userData.token)
    localStorage.setItem('userData', JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name
    }))
    
    // Carregar designs do usuário
    loadUserDesigns(userData.token)
    
    console.log('Usuário logado:', userData)
  }

  const handleLogout = () => {
    setUser(null)
    setSavedDesigns([])
    
    // Limpar localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    
    onNavigateToHome() // Volta para home ao fazer logout
  }

  const updateTshirtConfig = (updates) => {
    setTshirtConfig(prev => ({ ...prev, ...updates }))
  }

  const handleFinalizePedido = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    // Validação
    if (!tshirtConfig.logo && !tshirtConfig.text) {
      alert('Adicione ao menos um elemento para finalizar sua camiseta.')
      return
    }

    setIsLoading(true)

    try {
      // Salvar design no backend
      const designData = {
        ...tshirtConfig,
        name: `Design ${new Date().toLocaleString()}`
      }
      
      const response = await saveDesign(designData, user.token)
      
      console.log('Design salvo:', response)
      alert('Design salvo com sucesso!')
      
      // Recarregar lista de designs
      await loadUserDesigns(user.token)
      
    } catch (error) {
      console.error('Erro ao salvar design:', error)
      alert(`Erro ao salvar design: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="main-app">
      <Header 
        isLoggedIn={!!user} 
        user={user}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onNavigateToHome={onNavigateToHome}
      />
      
      <div className="app-content">
        <Sidebar 
          tshirtConfig={tshirtConfig}
          updateConfig={updateTshirtConfig}
          onFinalizePedido={handleFinalizePedido}
          userToken={user?.token}
        />
        
        <div className="viewer-container">
          <TShirtOBJViewer config={tshirtConfig} />
          
          {savedDesigns.length > 0 && (
            <div className="saved-designs">
              <h3>Meus Designs ({savedDesigns.length})</h3>
              <p>Designs salvos no backend disponíveis</p>
            </div>
          )}
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
