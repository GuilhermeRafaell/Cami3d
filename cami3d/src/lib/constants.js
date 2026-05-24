// ---------------------------------------------------------------------------
// Constantes da aplicação Cami3D
// ---------------------------------------------------------------------------

export const APP_NAME = 'Cami3D'
export const APP_VERSION = '1.0.0'

// Configurações de upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg']

// Estilos de camiseta
export const TSHIRT_STYLES = [
  { id: 'crew-neck',   name: 'Gola Redonda'  },
  { id: 'v-neck',      name: 'Gola V'        },
  { id: 'tank-top',    name: 'Regata'        },
  { id: 'long-sleeve', name: 'Manga Longa'   },
]

// Paleta de cores padrão
export const DEFAULT_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
]

// Limites dos controles de design
export const LOGO_SCALE_LIMITS   = { min: 0.1,  max: 3.0,  step: 0.1  }
export const TEXT_SIZE_LIMITS    = { min: 0.05, max: 0.5,  step: 0.01 }
export const POSITION_LIMITS     = { min: -1,   max: 1,    step: 0.01 }
export const ROTATION_LIMITS     = { min: -180, max: 180,  step: 1    }
export const TEXT_MAX_LENGTH     = 50

// Configuração padrão do design
export const DEFAULT_TSHIRT_CONFIG = {
  color:         '#ffffff',
  logo:          null,
  logoPosition:  { x: 0, y: 0 },
  logoScale:     1,
  logoRotation:  0,
  text:          '',
  textPosition:  { x: 0, y: -0.3 },
  textColor:     '#000000',
  textSize:      0.1,
  textRotation:  0,
  style:         'crew-neck',
  modelType:     'procedural',
  externalModel: null,
  renderQuality: 'medium',
}

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  NETWORK_ERROR:     'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED:      'Sessão expirada. Faça login novamente.',
  FILE_TOO_LARGE:    'Arquivo muito grande. Tamanho máximo: 5MB',
  INVALID_FILE_TYPE: 'Formato não suportado. Use .png, .jpg ou .svg',
  MISSING_ELEMENTS:  'Adicione ao menos um elemento para finalizar sua camiseta.',
  GENERIC_ERROR:     'Ocorreu um erro inesperado. Tente novamente.',
}
