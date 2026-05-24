import { useState } from 'react'
import { Upload, Palette, Type, RotateCcw, ShoppingCart, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { uploadImage } from '@/services/api'
import { DEFAULT_TSHIRT_CONFIG, TSHIRT_STYLES, DEFAULT_COLORS } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

function DesignerSidebar({ tshirtConfig, updateConfig, onFinalizePedido }) {
  const { token } = useAuth()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      alert('Formato não suportado. Use .png, .jpg ou .svg')
      return
    }

    if (!token) {
      alert('Você precisa estar logado para fazer upload de imagens')
      return
    }

    setIsUploading(true)
    try {
      const response = await uploadImage(file, token)
      const logoUrl = `https://capmi3d.discloud.app${response.file.url}`
      updateConfig({ logo: logoUrl })
    } catch (error) {
      console.error('Erro no upload:', error)
      alert(`Erro no upload: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => updateConfig(DEFAULT_TSHIRT_CONFIG)

  return (
    <aside className="w-80 bg-white/95 backdrop-blur-sm border-r border-white/20 shadow-sm flex flex-col min-h-0">

      <Tabs defaultValue="design" className="flex flex-col flex-1 min-h-0">
        {/* Tab triggers */}
        <TabsList className="w-full rounded-none border-b h-auto p-0 bg-transparent">
          <TabsTrigger
            value="design"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 gap-2"
          >
            <Palette size={15} /> Design
          </TabsTrigger>
          <TabsTrigger
            value="text"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 gap-2"
          >
            <Type size={15} /> Texto
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-6">

          {/* ============ ABA DESIGN ============ */}
          <TabsContent value="design" className="mt-0 space-y-6">

            {/* Logo */}
            <Section title="Logo / Imagem">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="logo-upload"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="logo-upload"
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/40 rounded-lg bg-primary/5 text-primary cursor-pointer transition-colors hover:border-primary hover:bg-primary/10 text-sm',
                    isUploading && 'opacity-60 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <Upload size={15} />
                  {isUploading ? 'Enviando...' : 'Carregar imagem'}
                </Label>

                {tshirtConfig.logo && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => updateConfig({ logo: null })}
                    className="gap-2"
                  >
                    <X size={14} /> Remover imagem
                  </Button>
                )}
              </div>

              {/* Controles de logo */}
              {tshirtConfig.logo && (
                <div className="space-y-4 mt-3 border-t pt-3">
                  <SliderField
                    label="Tamanho"
                    min={0.1} max={3.0} step={0.1}
                    value={tshirtConfig.logoScale}
                    onChange={v => updateConfig({ logoScale: v })}
                  />
                  <SliderField
                    label="Posição Horizontal"
                    min={-1} max={1} step={0.01}
                    value={tshirtConfig.logoPosition?.x ?? 0}
                    onChange={v => updateConfig({ logoPosition: { ...tshirtConfig.logoPosition, x: v } })}
                  />
                  <SliderField
                    label="Posição Vertical"
                    min={-1} max={1} step={0.01}
                    value={tshirtConfig.logoPosition?.y ?? 0}
                    onChange={v => updateConfig({ logoPosition: { ...tshirtConfig.logoPosition, y: v } })}
                  />
                  <SliderField
                    label="Rotação"
                    min={-180} max={180} step={1}
                    value={tshirtConfig.logoRotation ?? 0}
                    onChange={v => updateConfig({ logoRotation: v })}
                  />
                </div>
              )}
            </Section>

            {/* Cores */}
            <Section title="Cor da Camiseta">
              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateConfig({ color })}
                    title={color}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 transition-all cursor-pointer hover:scale-105',
                      tshirtConfig.color === color
                        ? 'border-primary scale-110 shadow-md'
                        : 'border-transparent hover:border-primary/40'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </Section>

            {/* Estilo */}
            <Section title="Estilo">
              <div className="flex flex-col gap-2">
                {TSHIRT_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => updateConfig({ style: style.id })}
                    className={cn(
                      'w-full py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all text-left',
                      tshirtConfig.style === style.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                    )}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* ============ ABA TEXTO ============ */}
          <TabsContent value="text" className="mt-0 space-y-6">

            <Section title="Adicionar Texto">
              <Input
                placeholder="Digite seu texto aqui..."
                value={tshirtConfig.text}
                onChange={e => updateConfig({ text: e.target.value })}
              />
            </Section>

            {tshirtConfig.text && (
              <>
                <Section title="Cor do Texto">
                  <input
                    type="color"
                    value={tshirtConfig.textColor}
                    onChange={e => updateConfig({ textColor: e.target.value })}
                    className="w-full h-10 rounded-md border border-input cursor-pointer"
                  />
                </Section>

                <Section title="Ajustes de Texto">
                  <div className="space-y-4">
                    <SliderField
                      label="Tamanho"
                      min={0.05} max={0.5} step={0.01}
                      value={tshirtConfig.textSize}
                      onChange={v => updateConfig({ textSize: v })}
                    />
                    <SliderField
                      label="Posição Horizontal"
                      min={-1} max={1} step={0.01}
                      value={tshirtConfig.textPosition?.x ?? 0}
                      onChange={v => updateConfig({ textPosition: { ...tshirtConfig.textPosition, x: v } })}
                    />
                    <SliderField
                      label="Posição Vertical"
                      min={-1} max={1} step={0.01}
                      value={tshirtConfig.textPosition?.y ?? 0}
                      onChange={v => updateConfig({ textPosition: { ...tshirtConfig.textPosition, y: v } })}
                    />
                    <SliderField
                      label="Rotação"
                      min={-180} max={180} step={1}
                      value={tshirtConfig.textRotation ?? 0}
                      onChange={v => updateConfig({ textRotation: v })}
                    />
                  </div>
                </Section>
              </>
            )}
          </TabsContent>

        </div>
      </Tabs>

      {/* Footer */}
      <div className="flex-shrink-0 flex gap-3 p-4 border-t border-border bg-white/80">
        <Button variant="outline" onClick={handleReset} className="flex-1 gap-2 border-destructive/40 text-destructive hover:bg-destructive hover:text-white">
          <RotateCcw size={14} /> Resetar
        </Button>
        <Button variant="gradient-cta" onClick={onFinalizePedido} className="flex-1 gap-2">
          <ShoppingCart size={14} /> Finalizar
        </Button>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Sub-componentes internos
// ---------------------------------------------------------------------------

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

function SliderField({ label, min, max, step, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
}

export default DesignerSidebar
