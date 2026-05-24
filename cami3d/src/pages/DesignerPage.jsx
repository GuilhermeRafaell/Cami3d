import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import DesignerSidebar from '@/components/features/designer/DesignerSidebar'
import TShirtOBJViewer from '@/components/features/designer/TShirtOBJViewer'
import AuthDialog from '@/components/features/auth/AuthDialog'
import { saveDesign, getMyDesigns } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { DEFAULT_TSHIRT_CONFIG, ERROR_MESSAGES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

function DesignerPage({ onNavigateToHome }) {
  const { user, token, isAuthenticated } = useAuth()

  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [savedDesigns, setSavedDesigns] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  const [tshirtConfig, setTshirtConfig] = useState(DEFAULT_TSHIRT_CONFIG)

  // Carregar designs ao autenticar
  useEffect(() => {
    if (token) loadUserDesigns(token)
  }, [token])

  const loadUserDesigns = async (authToken) => {
    try {
      const response = await getMyDesigns(authToken)
      setSavedDesigns(response.designs || [])
    } catch (error) {
      console.error('Erro ao carregar designs:', error)
    }
  }

  const updateConfig = (updates) => {
    setTshirtConfig(prev => ({ ...prev, ...updates }))
  }

  const showSaveMessage = (type, text) => {
    setSaveMessage({ type, text })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleFinalizePedido = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

    if (!tshirtConfig.logo && !tshirtConfig.text) {
      showSaveMessage('error', ERROR_MESSAGES.MISSING_ELEMENTS)
      return
    }

    setIsSaving(true)
    try {
      const designData = {
        ...tshirtConfig,
        name: `Design ${new Date().toLocaleString('pt-BR')}`,
      }
      await saveDesign(designData, token)
      showSaveMessage('success', 'Design salvo com sucesso!')
      await loadUserDesigns(token)
    } catch (error) {
      console.error('Erro ao salvar design:', error)
      showSaveMessage('error', `Erro ao salvar: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">

      <Header
        onNavigateToHome={onNavigateToHome}
        onLogin={() => setShowAuthDialog(true)}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">

        <DesignerSidebar
          tshirtConfig={tshirtConfig}
          updateConfig={updateConfig}
          onFinalizePedido={handleFinalizePedido}
        />

        {/* Área do viewer */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          <TShirtOBJViewer config={tshirtConfig} />

          {/* Contador de designs salvos */}
          {savedDesigns.length > 0 && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md text-sm">
              <span className="font-medium text-foreground">Meus Designs</span>
              <Badge variant="secondary" className="ml-2">{savedDesigns.length}</Badge>
            </div>
          )}

          {/* Feedback de salvamento */}
          {saveMessage && (
            <div
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
                saveMessage.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-destructive text-white'
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          {/* Dica de interação */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs pointer-events-none select-none">
            💡 Clique e arraste para girar • Role para zoom
          </div>
        </div>
      </div>

      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </div>
  )
}

export default DesignerPage
