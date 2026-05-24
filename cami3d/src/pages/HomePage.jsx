import { useState } from 'react'
import { Shirt, Sparkles, Users, Mail, ArrowRight, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AuthDialog from '@/components/features/auth/AuthDialog'
import { useAuth } from '@/contexts/AuthContext'
import logoImage from '@/assets/logo.png'

function HomePage({ onNavigateToApp }) {
  const { user, isAuthenticated, logout } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showContact, setShowContact] = useState(false)

  const handleCTA = () => {
    if (isAuthenticated) {
      onNavigateToApp()
    } else {
      setShowAuthDialog(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">

      {/* ====== HEADER ====== */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Cami3D" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-bold">Cami3D</span>
          </div>

          {/* Saudação */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 text-sm font-medium animate-[fadeInUp_0.5s_ease-out]">
              <User size={16} />
              Olá, {user?.name || user?.email}!
            </div>
          )}

          {/* Nav */}
          <nav className="flex items-center gap-3">
            <Button variant="glass" size="sm" onClick={() => setShowAbout(true)}>
              Sobre
            </Button>
            <Button variant="glass" size="sm" onClick={() => setShowContact(true)}>
              Contato
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button variant="glass" size="sm" onClick={onNavigateToApp} className="gap-2">
                  Ir para App <ArrowRight size={15} />
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={logout}
                  className="gap-2 border-red-300/40 text-red-200 hover:bg-red-500/20"
                >
                  <LogOut size={15} /> Sair
                </Button>
              </div>
            ) : (
              <Button variant="glass" size="sm" onClick={() => setShowAuthDialog(true)} className="gap-2">
                Acessar <ArrowRight size={15} />
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center min-h-[calc(100vh-80px)]">

        <div className="flex flex-col gap-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Personalize sua camiseta em
            <span className="bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent"> 3D</span>
          </h1>

          <p className="text-lg leading-relaxed opacity-90">
            Crie designs únicos, visualize em tempo real e tenha sua camiseta
            personalizada sem complicação. Tudo em uma plataforma moderna e intuitiva.
          </p>

          <div className="flex flex-col gap-3">
            <Feature icon={<Sparkles className="text-[#4ecdc4]" size={20} />} label="Visualização 3D em tempo real" />
            <Feature icon={<Users className="text-[#4ecdc4]" size={20} />} label="Interface intuitiva e fácil" />
            <Feature icon={<Shirt className="text-[#4ecdc4]" size={20} />} label="Personalização completa" />
          </div>

          <Button
            variant="gradient-cta"
            size="xl"
            onClick={handleCTA}
            className="self-start gap-3"
          >
            {isAuthenticated ? 'Ir para o App' : 'Começar a personalizar'}
            <ArrowRight size={20} />
          </Button>
        </div>

        {/* Ilustração */}
        <div className="flex justify-center items-center">
          <div className="text-white/60 animate-[float_6s_ease-in-out_infinite] relative">
            <div className="absolute inset-[-20px] bg-gradient-to-br from-[#ff6b6b]/30 to-[#4ecdc4]/30 rounded-full blur-2xl -z-10" />
            <Shirt size={180} strokeWidth={1} />
          </div>
        </div>
      </main>

      {/* ====== DIALOGS ====== */}
      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />

      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sobre o Cami3D</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              O Cami3D é uma plataforma inovadora que permite personalizar camisetas
              usando tecnologia 3D avançada. Nossa missão é democratizar a criação
              de roupas personalizadas, oferecendo uma experiência única e intuitiva.
            </p>
            <p className="font-medium text-foreground">Recursos principais:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Visualização 3D em tempo real</li>
              <li>Upload de logos e imagens personalizadas</li>
              <li>Edição de texto e cores</li>
              <li>Integração direta com a fabricação</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entre em Contato</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <ContactItem icon={<Mail size={18} />} label="contato@cami3d.com" />
            <ContactItem icon={<span>📱</span>} label="(11) 99999-9999" />
            <ContactItem icon={<span>📍</span>} label="São Paulo, SP - Brasil" />
            <p className="text-sm text-muted-foreground mt-3">
              Estamos aqui para ajudar! Entre em contato para dúvidas, sugestões ou suporte técnico.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function Feature({ icon, label }) {
  return (
    <div className="flex items-center gap-3 text-base">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function ContactItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
  )
}

export default HomePage
