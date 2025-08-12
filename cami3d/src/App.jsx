import { useState, useEffect } from 'react'
import Home from './components/Home'
import MainApp from './components/MainApp'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home' ou 'app'
  const [user, setUser] = useState(null)

  // Verificar se há usuário logado ao carregar a aplicação
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('userData')
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        userData.token = savedToken
        setUser(userData)
        console.log('Usuário logado carregado:', userData)
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
  }, [])

  const navigateToApp = () => {
    setCurrentPage('app')
  }

  const navigateToHome = () => {
    setCurrentPage('home')
  }

  const handleLogin = (userData) => {
    setUser(userData)
    // Salvar dados no localStorage
    localStorage.setItem('authToken', userData.token)
    localStorage.setItem('userData', JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name
    }))
    // Permanecer na página Home após login
    setCurrentPage('home')
    console.log('Usuário logado:', userData)
  }

  const handleLogout = () => {
    setUser(null)
    // Limpar localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    // Voltar para home ao fazer logout
    setCurrentPage('home')
    console.log('Usuário deslogado')
  }

  return (
    <div className="app">
      {currentPage === 'home' ? (
        <Home 
          onNavigateToApp={navigateToApp} 
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      ) : (
        <MainApp 
          onNavigateToHome={navigateToHome}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
