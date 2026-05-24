/**
 * Serviço de API — centraliza todas as chamadas ao backend Cami3D.
 * Importar funções individualmente para evitar bundle desnecessário.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://capmi3d.discloud.app/api'
const BACKEND_URL  = import.meta.env.VITE_BACKEND_URL || 'https://capmi3d.discloud.app'

export const SWAGGER_URL = `${BACKEND_URL}/`

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'Erro na requisição'
    try {
      const error = await response.json()
      errorMessage = error.message || error.error || errorMessage
    } catch {
      errorMessage = `Erro ${response.status}: ${response.statusText}`
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

const fetchWithRetry = async (url, options, retries = 1) => {
  try {
    const response = await fetch(url, options)
    return await handleResponse(response)
  } catch (error) {
    if (retries > 0 && error.message.includes('Failed to fetch')) {
      console.log(`Tentando novamente... (${retries} tentativas restantes)`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const login = (email, password) =>
  fetchWithRetry(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

export const register = (email, password, name) =>
  fetchWithRetry(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })

export const forgotPassword = (email) =>
  fetchWithRetry(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

export const verifyToken = (token) =>
  fetchWithRetry(`${API_BASE_URL}/auth/verify-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

export const refreshToken = (token) =>
  fetchWithRetry(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export const uploadImage = (file, token) => {
  const formData = new FormData()
  formData.append('image', file)
  return fetchWithRetry(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
}

export const getUserImages = (token) =>
  fetchWithRetry(`${API_BASE_URL}/upload/user-images`, {
    headers: { Authorization: `Bearer ${token}` },
  })

export const deleteImage = (imageId, token) =>
  fetchWithRetry(`${API_BASE_URL}/upload/${imageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

export const getImageInfo = (imageId, token) =>
  fetchWithRetry(`${API_BASE_URL}/upload/info/${imageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

// ---------------------------------------------------------------------------
// Designs
// ---------------------------------------------------------------------------

export const saveDesign = (designData, token) =>
  fetchWithRetry(`${API_BASE_URL}/tshirt/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(designData),
  })

export const getMyDesigns = (token) =>
  fetchWithRetry(`${API_BASE_URL}/tshirt/my-designs`, {
    headers: { Authorization: `Bearer ${token}` },
  })

export const getDesign = (designId, token = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  return fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}`, { headers })
}

export const updateDesign = (designId, designData, token) =>
  fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(designData),
  })

export const deleteDesign = (designId, token) =>
  fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

export const duplicateDesign = (designId, token) =>
  fetchWithRetry(`${API_BASE_URL}/tshirt/${designId}/duplicate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

export const getPublicGallery = (page = 1, limit = 12) =>
  fetchWithRetry(`${API_BASE_URL}/tshirt/public/gallery?page=${page}&limit=${limit}`)

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export const getUserProfile = (token) =>
  fetchWithRetry(`${API_BASE_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })

export const updateUserProfile = (profileData, token) =>
  fetchWithRetry(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  })

export const changePassword = (passwordData, token) =>
  fetchWithRetry(`${API_BASE_URL}/user/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  })

export const deleteAccount = (password, token) =>
  fetchWithRetry(`${API_BASE_URL}/user/account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  })

export const getUserStats = (token) =>
  fetchWithRetry(`${API_BASE_URL}/user/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  })

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export const healthCheck = () => fetchWithRetry(`${BACKEND_URL}/health`)

// ---------------------------------------------------------------------------
// Utilidades de token
// ---------------------------------------------------------------------------

export const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp < Date.now() / 1000
  } catch {
    return true
  }
}

export const getTokenPayload = (token) => {
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}
