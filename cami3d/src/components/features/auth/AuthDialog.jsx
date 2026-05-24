import { useState } from 'react'
import { User, Mail, Lock, CheckCircle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { login, register, forgotPassword } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Modal de feedback (sucesso / erro)
// ---------------------------------------------------------------------------
function FeedbackDialog({ open, onClose, type, title, message }) {
  const isSuccess = type === 'success'
  const Icon = isSuccess ? CheckCircle : XCircle

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <div className="flex flex-col items-center gap-4 pt-2">
          <Icon
            size={52}
            className={cn(isSuccess ? 'text-green-500' : 'text-destructive')}
          />
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// AuthDialog principal
// ---------------------------------------------------------------------------
function AuthDialog({ open, onClose }) {
  const { login: authLogin } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null) // { type, title, message }

  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  const resetForm = (newMode) => {
    setMode(newMode)
    setErrors({})
    setFormData({ name: '', email: '', password: '' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.email) errs.email = 'Email é obrigatório'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email inválido'
    if (mode !== 'forgot') {
      if (!formData.password) errs.password = 'Senha é obrigatória'
      else if (formData.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    }
    if (mode === 'register' && !formData.name) errs.name = 'Nome é obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const showFeedback = (type, title, message) => {
    setFeedback({ type, title, message })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      if (mode === 'forgot') {
        await forgotPassword(formData.email)
        showFeedback('success', 'Email Enviado!', 'Verifique sua caixa de entrada para redefinir sua senha.')
        resetForm('login')
        return
      }

      if (mode === 'login') {
        const response = await login(formData.email, formData.password)
        authLogin({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          token: response.token,
        })
        showFeedback('success', 'Login Realizado!', `Bem-vindo de volta, ${response.user.name}!`)
        setTimeout(onClose, 1500)
      } else {
        await register(formData.email, formData.password, formData.name)
        showFeedback('success', 'Cadastro Realizado!', 'Agora você pode fazer login com suas credenciais.')
        setTimeout(() => resetForm('login'), 2000)
      }
    } catch (error) {
      showFeedback(
        'error',
        mode === 'login' ? 'Erro no Login' : mode === 'register' ? 'Erro no Cadastro' : 'Erro',
        error.message || 'Ocorreu um erro. Tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const titles = { login: 'Entrar', register: 'Criar conta', forgot: 'Recuperar senha' }
  const submitLabels = { login: 'Entrar', register: 'Cadastrar', forgot: 'Enviar email' }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{titles[mode]}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">

            {/* Nome (somente cadastro) */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User size={14} /> Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail size={14} /> Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Senha (login e cadastro) */}
            {mode !== 'forgot' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <Lock size={14} /> Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}

                {/* Esqueceu a senha */}
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => resetForm('forgot')}
                    className="self-end text-xs text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
            )}

            <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processando...' : submitLabels[mode]}
            </Button>

            {/* Troca de modo */}
            <div className="text-center text-sm text-muted-foreground border-t pt-3">
              {mode === 'login' && (
                <p>Não tem conta?{' '}
                  <button type="button" onClick={() => resetForm('register')} className="text-primary font-medium hover:underline">
                    Cadastre-se
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p>Já tem conta?{' '}
                  <button type="button" onClick={() => resetForm('login')} className="text-primary font-medium hover:underline">
                    Faça login
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <button type="button" onClick={() => resetForm('login')} className="text-primary hover:underline">
                  ← Voltar ao login
                </button>
              )}
            </div>

          </form>
        </DialogContent>
      </Dialog>

      {/* Feedback modal */}
      {feedback && (
        <FeedbackDialog
          open={!!feedback}
          onClose={() => setFeedback(null)}
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
        />
      )}
    </>
  )
}

export default AuthDialog
