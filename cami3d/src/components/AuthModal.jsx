import { useState } from 'react'
import { X, User, Mail, Lock } from 'lucide-react'
import { login, register, forgotPassword } from '../utils/api'
import ConfirmationModal from './ConfirmationModal'

function AuthModal({ onLogin, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState({
    type: 'success',
    title: '',
    message: ''
  })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (showForgotPassword) {
      // Lógica para recuperação de senha
      if (!formData.email) {
        setErrors({ email: 'Email é obrigatório' })
        return
      }
      
      setIsLoading(true)
      try {
        await forgotPassword(formData.email)
        setConfirmationData({
          type: 'success',
          title: 'Email Enviado!',
          message: 'Verifique sua caixa de entrada para redefinir sua senha.'
        })
        setShowConfirmation(true)
        setShowForgotPassword(false)
      } catch (error) {
        setErrors({ email: error.message })
      } finally {
        setIsLoading(false)
      }
      return
    }
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      let response
      
      if (isLogin) {
        // Login real
        response = await login(formData.email, formData.password)
        
        // Salvar token no localStorage
        localStorage.setItem('authToken', response.token)
        
        // Dados do usuário para o frontend
        const userData = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          token: response.token
        }

        // Mostrar modal de confirmação de login
        setConfirmationData({
          type: 'success',
          title: 'Login Realizado!',
          message: `Bem-vindo de volta, ${response.user.name}!`
        })
        setShowConfirmation(true)

        // Chamar onLogin para atualizar o estado no App (permanece na Home)
        onLogin(userData)
        
        // Fechar modal após pequeno delay
        setTimeout(() => {
          onClose()
        }, 1500)
        
      } else {
        // Registro real
        response = await register(formData.email, formData.password, formData.name)
        
        // Mostrar modal de confirmação de cadastro
        setConfirmationData({
          type: 'success',
          title: 'Cadastro Realizado com Sucesso!',
          message: 'Agora você pode fazer login com suas credenciais.'
        })
        setShowConfirmation(true)
        
        // Limpar formulário após cadastro
        setFormData({ email: '', password: '', name: '' })
        
        // Mudar para tela de login após 2 segundos
        setTimeout(() => {
          setIsLogin(true)
        }, 2000)
      }

    } catch (error) {
      console.error('Authentication error:', error)
      
      // Mostrar modal de erro
      setConfirmationData({
        type: 'error',
        title: isLogin ? 'Erro no Login' : 'Erro no Cadastro',
        message: error.message || 'Erro na autenticação. Tente novamente.'
      })
      setShowConfirmation(true)
      
    } finally {
      setIsLoading(false)
    }
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
          {errors.general && (
            <div className="error-general">
              {errors.general}
            </div>
          )}
          
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

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Processando...' : (showForgotPassword ? 'Enviar' : (isLogin ? 'Entrar' : 'Cadastrar'))}
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
      
      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        type={confirmationData.type}
        title={confirmationData.title}
        message={confirmationData.message}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  )
}

export default AuthModal
