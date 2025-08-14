import { useState } from 'react'
import { Upload, Palette, Type, RotateCcw, ShoppingCart, X } from 'lucide-react'
import { uploadImage } from '../utils/api'

function Sidebar({ tshirtConfig, updateConfig, onFinalizePedido, userToken }) {
  const [activeTab, setActiveTab] = useState('design')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validação de formato
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      alert('Formato não suportado. Use .png, .jpg ou .svg')
      return
    }

    // Verificar se usuário está logado
    if (!userToken) {
      alert('Você precisa estar logado para fazer upload de imagens')
      return
    }

    setIsUploading(true)
    
    try {
      // Upload real para o backend
      const response = await uploadImage(file, userToken)
      
      // Usar a URL retornada pelo backend
      const logoUrl = `https://capmi3d.discloud.app${response.file.url}`
      updateConfig({ logo: logoUrl })
      
      console.log('Upload realizado com sucesso:', response)
    } catch (error) {
      console.error('Erro no upload:', error)
      alert(`Erro no upload: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ]

  const fonts = [
    { name: 'Arial', value: 'Arial, sans-serif', category: 'Sans Serif' },
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif', category: 'Sans Serif' },
    { name: 'Georgia', value: 'Georgia, serif', category: 'Serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif', category: 'Serif' },
    { name: 'Courier New', value: 'Courier New, monospace', category: 'Monospace' },
    { name: 'Verdana', value: 'Verdana, sans-serif', category: 'Sans Serif' },
    { name: 'Impact', value: 'Impact, sans-serif', category: 'Display' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive', category: 'Casual' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif', category: 'Sans Serif' },
    { name: 'Palatino', value: 'Palatino, serif', category: 'Serif' },
    { name: 'Lucida Console', value: 'Lucida Console, monospace', category: 'Monospace' },
    { name: 'Brush Script MT', value: 'Brush Script MT, cursive', category: 'Script' }
  ]

  const styles = [
    { id: 'crew-neck', name: 'Gola Redonda' },
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
                <label htmlFor="logo-upload" className={`upload-btn ${isUploading ? 'uploading' : ''}`}>
                  <Upload size={16} />
                  {isUploading ? 'Enviando...' : 'Carregar Imagem'}
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
                  <div className="control-group">
                    <input
                      type="range"
                      min="0.05"
                      max="5.0"
                      step="0.05"
                      value={tshirtConfig.logoScale}
                      onChange={(e) => updateConfig({ logoScale: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="0.05"
                      max="5.0"
                      step="0.05"
                      value={tshirtConfig.logoScale.toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0.05 && value <= 5.0) {
                          updateConfig({ logoScale: value });
                        }
                      }}
                      className="number-input"
                    />
                  </div>
                  
                  <label>Posição Horizontal:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="-3"
                      max="3"
                      step="0.01"
                      value={tshirtConfig.logoPosition?.x || 0}
                      onChange={e => updateConfig({ logoPosition: { ...tshirtConfig.logoPosition, x: parseFloat(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="-3"
                      max="3"
                      step="0.01"
                      value={(tshirtConfig.logoPosition?.x || 0).toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -3 && value <= 3) {
                          updateConfig({ logoPosition: { ...tshirtConfig.logoPosition, x: value } });
                        }
                      }}
                      className="number-input"
                    />
                  </div>
                  
                  <label>Posição Vertical:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.01"
                      value={tshirtConfig.logoPosition?.y || 0}
                      onChange={e => updateConfig({ logoPosition: { ...tshirtConfig.logoPosition, y: parseFloat(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.01"
                      value={(tshirtConfig.logoPosition?.y || 0).toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -2 && value <= 2) {
                          updateConfig({ logoPosition: { ...tshirtConfig.logoPosition, y: value } });
                        }
                      }}
                      className="number-input"
                    />
                  </div>
                  
                  <label>Rotação:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="-360"
                      max="360"
                      step="1"
                      value={tshirtConfig.logoRotation || 0}
                      onChange={e => updateConfig({ logoRotation: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="-360"
                      max="360"
                      step="1"
                      value={tshirtConfig.logoRotation || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -360 && value <= 360) {
                          updateConfig({ logoRotation: value });
                        }
                      }}
                      className="number-input angle-input"
                    />
                    <span className="unit">°</span>
                  </div>
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
                  <div className="upload-area">
                    <input
                      type="color"
                      value={tshirtConfig.textColor}
                      onChange={(e) => updateConfig({ textColor: e.target.value })}
                      className="color-input"
                    />
                    <button 
                      onClick={() => updateConfig({ text: '' })}
                      className="remove-btn"
                    >
                      <X size={16} />
                      Remover
                    </button>
                  </div>
                </div>
                
                <div className="section">
                  <label>Fonte:</label>
                  <select
                    value={tshirtConfig.textFont || fonts[0].value}
                    onChange={(e) => updateConfig({ textFont: e.target.value })}
                    className="font-select"
                  >
                    {fonts.map((font) => (
                      <option 
                        key={font.value} 
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name} ({font.category})
                      </option>
                    ))}
                  </select>
                  <div className="font-preview" style={{ fontFamily: tshirtConfig.textFont || fonts[0].value }}>
                    {tshirtConfig.text || 'Texto de exemplo'}
                  </div>
                </div>
                <div className="section">
                  <label>Tamanho:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="0.02"
                      max="0.8"
                      step="0.01"
                      value={tshirtConfig.textSize}
                      onChange={(e) => updateConfig({ textSize: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="0.02"
                      max="0.8"
                      step="0.01"
                      value={tshirtConfig.textSize.toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0.02 && value <= 0.8) {
                          updateConfig({ textSize: value });
                        }
                      }}
                      className="number-input"
                    />
                  </div>
                </div>
                <div className="section">
                  <label>Posição Horizontal:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.01"
                      value={tshirtConfig.textPosition?.x || -1.40}
                      onChange={e => updateConfig({ textPosition: { ...tshirtConfig.textPosition, x: parseFloat(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.01"
                      value={(tshirtConfig.textPosition?.x || -1.40).toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -2 && value <= 2) {
                          updateConfig({ textPosition: { ...tshirtConfig.textPosition, x: value } });
                        }
                      }}
                      className="number-input"
                    />
                  </div>
                  
                  <label>Posição Vertical:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.01"
                      value={tshirtConfig.textPosition?.y || 0.60}
                      onChange={e => updateConfig({ textPosition: { ...tshirtConfig.textPosition, y: parseFloat(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.01"
                      value={(tshirtConfig.textPosition?.y || 0.60).toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -2 && value <= 2) {
                          updateConfig({ textPosition: { ...tshirtConfig.textPosition, y: value } });
                        }
                      }}
                      className="number-input"
                    />
                  </div>
                  
                  <label>Rotação:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="-360"
                      max="360"
                      step="1"
                      value={tshirtConfig.textRotation || -180}
                      onChange={e => updateConfig({ textRotation: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="-360"
                      max="360"
                      step="1"
                      value={tshirtConfig.textRotation || -180}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -360 && value <= 360) {
                          updateConfig({ textRotation: value });
                        }
                      }}
                      className="number-input angle-input"
                    />
                    <span className="unit">°</span>
                  </div>
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
            textPosition: { x: -1.40, y: 0.60 },
            textColor: '#000000',
            textSize: 0.1,
            textFont: 'Arial, sans-serif',
            textRotation: -180,
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
