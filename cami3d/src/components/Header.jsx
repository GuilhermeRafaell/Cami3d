import { User, LogOut } from 'lucide-react'

function Header({ isLoggedIn, onLogin, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="app-title">Cami3D</h1>
          <span className="app-subtitle">Personalize sua camiseta em 3D</span>
        </div>
        
        <div className="auth-section">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="welcome-text">Bem-vindo!</span>
              <button onClick={onLogout} className="logout-btn">
                <LogOut size={16} />
                Sair
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="login-btn">
              <User size={16} />
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
