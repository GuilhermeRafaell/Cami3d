import { useState } from 'react'
import HomePage from '@/pages/HomePage'
import DesignerPage from '@/pages/DesignerPage'

/**
 * App — roteador simples de página única.
 * A lógica de autenticação está no AuthProvider (main.jsx).
 * Para escalar, substituir por React Router.
 */
function App() {
  const [page, setPage] = useState('home') // 'home' | 'designer'

  return (
    <>
      {page === 'home' ? (
        <HomePage onNavigateToApp={() => setPage('designer')} />
      ) : (
        <DesignerPage onNavigateToHome={() => setPage('home')} />
      )}
    </>
  )
}

export default App
