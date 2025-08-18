// Funções para comunicação com a API do backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://capmi3d.discloud.app/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://capmi3d.discloud.app';

export const SWAGGER_URL = `${BACKEND_URL}/`;

// Processa respostas da API e trata erros
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'Erro na requisição';
    
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      // Se não conseguir ler o JSON de erro
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Faz requisições com tentativas automáticas em caso de falha
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

// Envia uma imagem para o servidor
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

// Salva um design de camiseta no servidor
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

// Faz login do usuário
export const login = async (email, password) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
};

// Registra um novo usuário
export const register = async (email, password, name) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name })
  });
};

// Solicita recuperação de senha por email
export const forgotPassword = async (email) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
};

// Verifica se o token de acesso é válido
export const verifyToken = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/verify-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Renova o token de acesso
export const refreshToken = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Busca todos os designs do usuário logado
export const getMyDesigns = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/my-designs`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Busca um design específico pelo ID
export const getDesign = async (designId, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}`, {
    headers
  });
};

// Atualiza um design existente
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

// Remove um design do usuário
export const deleteDesign = async (designId, token) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Cria uma cópia de um design existente
export const duplicateDesign = async (designId, token) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}/duplicate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Busca designs públicos na galeria
export const getPublicGallery = async (page = 1, limit = 12) => {
  return fetchWithRetry(`${API_BASE_URL}/tshirt/public/gallery?page=${page}&limit=${limit}`);
};

// Busca todas as imagens do usuário
export const getUserImages = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/upload/user-images`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Remove uma imagem do usuário
export const deleteImage = async (imageId, token) => {
  return fetchWithRetry(`${API_BASE_URL}/upload/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Busca detalhes de uma imagem específica
export const getImageInfo = async (imageId, token) => {
  return fetchWithRetry(`${API_BASE_URL}/upload/info/${imageId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Busca os dados do perfil do usuário logado
export const getUserProfile = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Atualiza os dados do perfil do usuário
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

// Altera a senha do usuário
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

// Remove a conta do usuário
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

// Busca estatísticas do usuário (número de designs, uploads, etc.)
export const getUserStats = async (token) => {
  return fetchWithRetry(`${API_BASE_URL}/user/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Verifica se o servidor está funcionando
export const healthCheck = async () => {
  return fetchWithRetry(`${BACKEND_URL}/health`);
};

// Verifica se o token JWT expirou
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

// Extrai as informações do token JWT (payload)
export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};
