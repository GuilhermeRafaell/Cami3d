import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { verifyToken, refreshToken, isTokenExpired } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carregar sessão salva ao inicializar
  useEffect(() => {
    const loadSavedAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken')
        const savedUser = localStorage.getItem('userData')

        if (savedToken && savedUser) {
          if (isTokenExpired(savedToken)) {
            console.log('Token expirado, tentando renovar...')
            try {
              const response = await refreshToken(savedToken)
              const newToken = response.token
              const userData = JSON.parse(savedUser)

              localStorage.setItem('authToken', newToken)
              setToken(newToken)
              setUser({ ...userData, token: newToken })
            } catch {
              _clearAuth()
            }
          } else {
            const userData = JSON.parse(savedUser)
            setToken(savedToken)
            setUser({ ...userData, token: savedToken })
          }
        }
      } catch (error) {
        console.error('Erro ao carregar autenticação:', error)
        _clearAuth()
      } finally {
        setLoading(false)
      }
    }

    loadSavedAuth()
  }, [])

  const _clearAuth = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  }

  const login = useCallback((userData) => {
    setUser(userData)
    setToken(userData.token)
    localStorage.setItem('authToken', userData.token)
    localStorage.setItem('userData', JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
    }))
  }, [])

  const logout = useCallback(() => {
    _clearAuth()
  }, [])

  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para consumir o AuthContext.
 * Deve ser usado dentro de um <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
