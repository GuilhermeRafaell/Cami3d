// API helpers para integração com backend
const API_BASE_URL = 'http://localhost:3001/api';

// URL da documentação Swagger (agora na raiz)
export const SWAGGER_URL = 'http://localhost:3001/';

// Helper para fazer upload de imagem
export const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao fazer upload');
  }

  return response.json();
};

// Helper para salvar design
export const saveDesign = async (designData, token) => {
  const response = await fetch(`${API_BASE_URL}/tshirt/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(designData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao salvar design');
  }

  return response.json();
};

// Helper para login
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro no login');
  }

  return response.json();
};

// Helper para registro
export const register = async (email, password, name) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro no registro');
  }

  return response.json();
};

// Helper para recuperação de senha
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro na recuperação');
  }

  return response.json();
};

// Helper para buscar meus designs
export const getMyDesigns = async (token) => {
  const response = await fetch(`${API_BASE_URL}/tshirt/my-designs`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao buscar designs');
  }

  return response.json();
};
