// API helpers para integração com backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://capmi3d.discloud.app/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://capmi3d.discloud.app';

export const SWAGGER_URL = `${BACKEND_URL}/`;

// Helper para lidar com erros de resposta
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'Erro na requisição';
    
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      // Se não conseguir fazer parse do JSON, usar mensagem padrão
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Helper para fazer requisições com retry automático
const fetchWithRetry = async (url, options, retries = 1) => {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    if (retries > 0 && error.message.includes('Failed to fetch')) {
      console.log(`Tentando novamente... (${retries} tentativas restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// Helper para fazer upload de imagem
export const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);

  return fetchWithRetry(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
};

// Helper para salvar design
export const saveDesign = async (designData, token) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(designData)
  });
};

// Helper para login
export const login = async (email, password) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
};

// Helper para registro
export const register = async (email, password, name) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name })
  });
};

// Helper para recuperação de senha
export const forgotPassword = async (email) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
};

// Helper para verificar token
export const verifyToken = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/verify-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helper para refresh token
export const refreshToken = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helper para buscar meus designs
export const getMyDesigns = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/my-designs`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helper para buscar um design específico
export const getDesign = async (designId, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}`, {
    headers
  });
};

// Helper para atualizar design
export const updateDesign = async (designId, designData, token) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(designData)
  });
};

// Helper para deletar design
export const deleteDesign = async (designId, token) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helper para duplicar design
export const duplicateDesign = async (designId, token) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}/duplicate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helper para buscar galeria pública
export const getPublicGallery = async (page = 1, limit = 12) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/public/gallery?page=${page}&limit=${limit}`);
};

// Helper para buscar imagens do usuário
export const getUserImages = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/upload/user-images`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helper para deletar imagem
export const deleteImage = async (imageId, token) => {
  return fetchWithRetry(`${API_BASE_URL}/upload/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helper para buscar informações da imagem
export const getImageInfo = async (imageId, token) => {
  return fetchWithRetry(`${API_BASE_URL}/upload/info/${imageId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helpers para gerenciamento de usuário
export const getUserProfile = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const updateUserProfile = async (profileData, token) => {
  return fetchWithRetry(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
};

export const changePassword = async (passwordData, token) => {
  return fetchWithRetry(`${API_BASE_URL}/user/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(passwordData)
  });
};

export const deleteAccount = async (password, token) => {
  return fetchWithRetry(`${API_BASE_URL}/user/account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ password })
  });
};

export const getUserStats = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/user/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Helper para health check
export const healthCheck = async () => {
  return fetchWithRetry(`${BACKEND_URL}/health`);
};

// Utilitários para token
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};
