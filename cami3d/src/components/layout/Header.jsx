import { Home, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import logoImage from '@/assets/logo.png'

function Header({ onNavigateToHome, onLogin }) {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-sm">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto px-6 py-3">

        {/* Esquerda: navegação + branding */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToHome}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <Home size={16} />
            Home
          </Button>

          <div className="flex items-center gap-2">
            <img src={logoImage} alt="Cami3D" className="w-7 h-7 object-contain" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent leading-none">
                Cami3D
              </h1>
              <span className="text-xs text-muted-foreground">Personalize sua camiseta em 3D</span>
            </div>
          </div>
        </div>

        {/* Direita: auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:block">
                Olá, <span className="font-medium text-foreground">{user?.name || user?.email}</span>!
              </span>
              <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                <LogOut size={15} />
                Sair
              </Button>
            </>
          ) : (
            <Button variant="gradient" size="sm" onClick={onLogin} className="gap-2">
              <User size={15} />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
