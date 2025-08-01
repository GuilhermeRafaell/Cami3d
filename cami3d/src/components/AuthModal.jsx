import { useState } from 'react'
import { X, User, Mail, Lock } from 'lucide-react'

function AuthModal({ onLogin, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!isLogin && !formData.name) {
      newErrors.name = 'Nome é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (showForgotPassword) {
      // Lógica para recuperação de senha
      if (!formData.email) {
        setErrors({ email: 'Email é obrigatório' })
        return
      }
      alert('Email de recuperação enviado!')
      setShowForgotPassword(false)
      return
    }
    
    if (!validateForm()) {
      return
    }

    // Simular autenticação
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      email: formData.email,
      name: formData.name || formData.email.split('@')[0]
    }

    onLogin(userData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {showForgotPassword ? 'Recuperar Senha' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {showForgotPassword ? (
            // Formulário de recuperação de senha
            <div className="form-group">
              <label>
                <Mail size={16} />
                Email para recuperação
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          ) : (
            // Formulário de login/cadastro
            <>
              {!isLogin && (
                <div className="form-group">
                  <label>
                    <User size={16} />
                    Nome
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              )}

              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Digite seu email"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Lock size={16} />
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {/* Link esqueceu a senha - apenas no modo login */}
              {isLogin && (
                <div className="forgot-password">
                  <button 
                    type="button" 
                    className="forgot-link"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}
            </>
          )}

          <button type="submit" className="submit-btn">
            {showForgotPassword ? 'Enviar' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>

          {!showForgotPassword && (
            <div className="auth-switch">
              <p>
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setErrors({})
                    setFormData({ email: '', password: '', name: '' })
                  }}
                  className="switch-btn"
                >
                  {isLogin ? 'Cadastre-se' : 'Faça login'}
                </button>
              </p>
            </div>
          )}

          {showForgotPassword && (
            <div className="auth-switch">
              <button 
                type="button" 
                onClick={() => {
                  setShowForgotPassword(false)
                  setErrors({})
                  setFormData({ email: '', password: '', name: '' })
                }}
                className="switch-btn"
              >
                ← Voltar ao login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default AuthModal
