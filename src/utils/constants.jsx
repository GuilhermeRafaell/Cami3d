// Constantes da aplicação
export const APP_NAME = 'Cami3D';
export const APP_VERSION = '1.0.0';

// Configurações de upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg'];

// Configurações de design
export const TSHIRT_STYLES = [
  { id: 'crew-neck', name: 'Gola Redonda' },
  { id: 'tank-top', name: 'Regata' },
  { id: 'long-sleeve', name: 'Manga Longa' }
];

export const DEFAULT_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
];

// Limites de configuração
export const LOGO_SCALE_LIMITS = { min: 0.1, max: 3.0, step: 0.1 };
export const TEXT_SIZE_LIMITS = { min: 0.05, max: 0.5, step: 0.01 };
export const TEXT_MAX_LENGTH = 50;

// Configurações padrão de design
export const DEFAULT_TSHIRT_CONFIG = {
  color: '#ffffff',
  logo: null,
  logoPosition: { x: 0, y: 0 },
  logoScale: 1,
  text: '',
  textPosition: { x: 0, y: -0.3 },
  textColor: '#000000',
  textSize: 0.1,
  style: 'crew-neck',
  modelType: 'procedural',
  externalModel: null,
  renderQuality: 'medium'
};

// Mensagens de erro comuns
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: 5MB',
  INVALID_FILE_TYPE: 'Formato não suportado. Use .png, .jpg ou .svg',
  MISSING_ELEMENTS: 'Adicione ao menos um elemento para finalizar sua camiseta.',
  GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.'
};

// URLs e endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_TOKEN: '/auth/verify-token',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  TSHIRT: {
    SAVE: '/tshirt/save',
    MY_DESIGNS: '/tshirt/my-designs',
    GET_DESIGN: '/tshirt',
    PUBLIC_GALLERY: '/tshirt/public/gallery'
  },
  UPLOAD: {
    IMAGE: '/upload/image',
    USER_IMAGES: '/upload/user-images'
  },
  USER: {
    PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    STATS: '/user/stats'
  },
  HEALTH: '/health'
};
