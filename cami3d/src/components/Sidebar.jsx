import { useState } from 'react'
import { Upload, Palette, Type, RotateCcw, ShoppingCart, X } from 'lucide-react'

function Sidebar({ tshirtConfig, updateConfig, onFinalizePedido }) {
  const [activeTab, setActiveTab] = useState('design')

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validação de formato
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      alert('Formato não suportado. Use .png, .jpg ou .svg')
      return
    }

    // Criar URL para preview
    const logoUrl = URL.createObjectURL(file)
    updateConfig({ logo: logoUrl })
  }

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ]

  const styles = [
    { id: 'crew-neck', name: 'Gola Redonda' },
    { id: 'v-neck', name: 'Gola V' },
    { id: 'tank-top', name: 'Regata' },
    { id: 'long-sleeve', name: 'Manga Longa' }
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button 
          className={`tab ${activeTab === 'design' ? 'active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          <Palette size={16} />
          Design
        </button>
        <button 
          className={`tab ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <Type size={16} />
          Texto
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'design' && (
          <div className="design-section">
            <div className="section">
              <h3>Logo/Imagem</h3>
              <div className="upload-area">
                <input
                  type="file"
                  id="logo-upload"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="logo-upload" className="upload-btn">
                  <Upload size={16} />
                  Carregar Imagem
                </label>
                {tshirtConfig.logo && (
                  <button 
                    onClick={() => updateConfig({ logo: null })}
                    className="remove-btn"
                  >
                    <X size={16} />
                    Remover
                  </button>
                )}
              </div>
              
              {tshirtConfig.logo && (
                <div className="logo-controls">
                  <label>Tamanho:</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={tshirtConfig.logoScale}
                    onChange={(e) => updateConfig({ logoScale: parseFloat(e.target.value) })}
                  />
                </div>
              )}
            </div>

            <div className="section">
              <h3>Cor da Camiseta</h3>
              <div className="color-palette">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${tshirtConfig.color === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateConfig({ color })}
                  />
                ))}
              </div>
            </div>

            <div className="section">
              <h3>Estilo</h3>
              <div className="style-options">
                {styles.map(style => (
                  <button
                    key={style.id}
                    className={`style-btn ${tshirtConfig.style === style.id ? 'active' : ''}`}
                    onClick={() => updateConfig({ style: style.id })}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="text-section">
            <div className="section">
              <h3>Adicionar Texto</h3>
              <input
                type="text"
                placeholder="Digite seu texto aqui..."
                value={tshirtConfig.text}
                onChange={(e) => updateConfig({ text: e.target.value })}
                className="text-input"
              />
            </div>

            {tshirtConfig.text && (
              <>
                <div className="section">
                  <label>Cor do Texto:</label>
                  <input
                    type="color"
                    value={tshirtConfig.textColor}
                    onChange={(e) => updateConfig({ textColor: e.target.value })}
                    className="color-input"
                  />
                </div>

                <div className="section">
                  <label>Tamanho:</label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.01"
                    value={tshirtConfig.textSize}
                    onChange={(e) => updateConfig({ textSize: parseFloat(e.target.value) })}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <button 
          onClick={() => updateConfig({
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
          })}
          className="reset-btn"
        >
          <RotateCcw size={16} />
          Resetar
        </button>
        
        <button onClick={onFinalizePedido} className="finalize-btn">
          <ShoppingCart size={16} />
          Finalizar Pedido
        </button>
      </div>
    </div>
  )
}

export default Sidebar
