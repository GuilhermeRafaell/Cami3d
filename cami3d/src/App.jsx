import { useState } from 'react'
import Home from './components/Home'
import MainApp from './components/MainApp'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home' ou 'app'

  const navigateToApp = () => {
    setCurrentPage('app')
  }

  const navigateToHome = () => {
    setCurrentPage('home')
  }

  return (
    <div className="app">
      {currentPage === 'home' ? (
        <Home onNavigateToApp={navigateToApp} />
      ) : (
        <MainApp onNavigateToHome={navigateToHome} />
      )}
    </div>
  )
}

export default App
