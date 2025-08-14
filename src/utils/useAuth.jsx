import { useState, useEffect, useCallback } from 'react';
import { verifyToken, refreshToken, isTokenExpired } from './api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const loadSavedAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('userData');

        if (savedToken && savedUser) {
          // Verificar se token está expirado
          if (isTokenExpired(savedToken)) {
            console.log('Token expirado, tentando renovar...');
            try {
              const response = await refreshToken(savedToken);
              const newToken = response.token;
              const userData = JSON.parse(savedUser);
              
              localStorage.setItem('authToken', newToken);
              setToken(newToken);
              setUser({ ...userData, token: newToken });
            } catch (error) {
              console.error('Erro ao renovar token:', error);
              logout();
            }
          } else {
            // Token ainda válido
            const userData = JSON.parse(savedUser);
            setToken(savedToken);
            setUser({ ...userData, token: savedToken });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar autenticação:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadSavedAuth();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    setToken(userData.token);
    
    // Salvar no localStorage
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userData', JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name
    }));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }, []);

  const isAuthenticated = !!user && !!token;

  return {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated
  };
};
