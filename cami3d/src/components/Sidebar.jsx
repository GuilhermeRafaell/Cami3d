import { useState } from 'react'
import { Upload, Palette, Type, RotateCcw, ShoppingCart, X, Circle, Square, Triangle, Heart, Star, Diamond, Hexagon, Zap, Sun, Moon, Coffee } from 'lucide-react'
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
    '#ffffff', // Branco
    '#000000', // Preto
    '#808080', // Cinza
    '#ff0000', // Vermelho
    '#00ff00', // Verde
    '#0000ff', // Azul
    '#ffff00', // Amarelo
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#ffa500', // Laranja
    '#800080', // Roxo
    '#ffc0cb'  // Rosa
  ]

  const shapes = [
    { id: 'circle', name: 'Círculo', icon: Circle, svg: '<circle cx="50" cy="50" r="40" fill="currentColor"/>' },
    { id: 'square', name: 'Quadrado', icon: Square, svg: '<rect x="15" y="15" width="70" height="70" fill="currentColor"/>' },
    { id: 'triangle', name: 'Triângulo', icon: Triangle, svg: '<polygon points="50,15 85,85 15,85" fill="currentColor"/>' },
    { id: 'heart', name: 'Coração', icon: Heart, svg: '<path d="M50,85 C20,60 5,35 25,20 C35,10 50,20 50,20 C50,20 65,10 75,20 C95,35 80,60 50,85 Z" fill="currentColor"/>' },
    { id: 'star', name: 'Estrela', icon: Star, svg: '<polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="currentColor"/>' },
    { id: 'diamond', name: 'Losango', icon: Diamond, svg: '<polygon points="50,10 80,50 50,90 20,50" fill="currentColor"/>' },
    { id: 'hexagon', name: 'Hexágono', icon: Hexagon, svg: '<polygon points="25,20 75,20 90,50 75,80 25,80 10,50" fill="currentColor"/>' },
    { id: 'lightning', name: 'Raio', icon: Zap, svg: '<polygon points="35,5 25,40 45,40 30,95 70,35 50,35 65,5" fill="currentColor"/>' },
    { id: 'sun', name: 'Sol', icon: Sun, svg: '<circle cx="50" cy="50" r="20" fill="currentColor"/><path d="M50,5 L50,15 M85,15 L79,21 M95,50 L85,50 M85,85 L79,79 M50,95 L50,85 M15,85 L21,79 M5,50 L15,50 M15,15 L21,21" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' },
    { id: 'moon', name: 'Lua', icon: Moon, svg: '<path d="M50,10 A20,20 0 1,0 50,90 A30,30 0 0,1 50,10 Z" fill="currentColor"/>' },
    { id: 'coffee', name: 'Xícara', icon: Coffee, svg: '<path d="M20,30 L20,70 Q20,80 30,80 L60,80 Q70,80 70,70 L70,30 Z" fill="currentColor"/><path d="M70,40 L85,40 Q90,40 90,45 L90,55 Q90,60 85,60 L70,60" fill="none" stroke="currentColor" stroke-width="3"/><path d="M25,25 Q35,15 45,25 Q55,15 65,25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' }
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
    { id: 'crew-neck', name: 'Modelo Masculino' },
    { id: 'tank-top', name: 'Modelo Feminino' },
    { id: 'long-sleeve', name: 'Modelo Manga Longa' }
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
          className={`tab ${activeTab === 'shapes' ? 'active' : ''}`}
          onClick={() => setActiveTab('shapes')}
        >
          <Circle size={16} />
          Formas
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
              <div className="color-palette expanded">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${tshirtConfig.color === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateConfig({ color })}
                    title={color}
                  />
                ))}
              </div>
              <div className="color-picker-section">
                <label>Cor personalizada:</label>
                <input
                  type="color"
                  value={tshirtConfig.color || '#ffffff'}
                  onChange={(e) => updateConfig({ color: e.target.value })}
                  className="custom-color-input"
                />
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

        {activeTab === 'shapes' && (
          <div className="shapes-section">
            <div className="section">
              <h3>Formas Geométricas</h3>
              <div className="shapes-grid">
                {shapes.map(shape => {
                  const IconComponent = shape.icon
                  return (
                    <button
                      key={shape.id}
                      className={`shape-btn ${tshirtConfig.selectedShape?.id === shape.id ? 'active' : ''}`}
                      onClick={() => updateConfig({ 
                        selectedShape: shape,
                        shapeColor: tshirtConfig.shapeColor || '#000000'
                      })}
                      title={shape.name}
                    >
                      <IconComponent size={20} />
                      <span>{shape.name}</span>
                    </button>
                  )
                })}
              </div>
              
              {tshirtConfig.selectedShape && (
                <button 
                  onClick={() => updateConfig({ selectedShape: null, shapeColor: null })}
                  className="remove-btn"
                >
                  <X size={16} />
                  Remover Forma
                </button>
              )}
            </div>

            {tshirtConfig.selectedShape && (
              <>
                <div className="section">
                  <h3>Cor da Forma</h3>
                  <div className="color-palette expanded">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${tshirtConfig.shapeColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig({ shapeColor: color })}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="color-picker-section">
                    <label>Cor personalizada:</label>
                    <input
                      type="color"
                      value={tshirtConfig.shapeColor || '#000000'}
                      onChange={(e) => updateConfig({ shapeColor: e.target.value })}
                      className="custom-color-input"
                    />
                  </div>
                </div>

                <div className="section">
                  <label>Tamanho:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={tshirtConfig.shapeScale || 1}
                      onChange={(e) => updateConfig({ shapeScale: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={(tshirtConfig.shapeScale || 1).toFixed(1)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0.1 && value <= 3.0) {
                          updateConfig({ shapeScale: value });
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
                      value={tshirtConfig.shapePosition?.x || 0}
                      onChange={e => updateConfig({ shapePosition: { ...tshirtConfig.shapePosition, x: parseFloat(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.01"
                      value={(tshirtConfig.shapePosition?.x || 0).toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -2 && value <= 2) {
                          updateConfig({ shapePosition: { ...tshirtConfig.shapePosition, x: value } });
                        }
                      }}
                      className="number-input"
                    />
                  </div>
                  
                  <label>Posição Vertical:</label>
                  <div className="control-group">
                    <input
                      type="range"
                      min="-1.5"
                      max="1.5"
                      step="0.01"
                      value={tshirtConfig.shapePosition?.y || 0}
                      onChange={e => updateConfig({ shapePosition: { ...tshirtConfig.shapePosition, y: parseFloat(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="-1.5"
                      max="1.5"
                      step="0.01"
                      value={(tshirtConfig.shapePosition?.y || 0).toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -1.5 && value <= 1.5) {
                          updateConfig({ shapePosition: { ...tshirtConfig.shapePosition, y: value } });
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
                      value={tshirtConfig.shapeRotation || 0}
                      onChange={e => updateConfig({ shapeRotation: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="-360"
                      max="360"
                      step="1"
                      value={tshirtConfig.shapeRotation || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= -360 && value <= 360) {
                          updateConfig({ shapeRotation: value });
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
                  <h3>Cor do Texto</h3>
                  <div className="color-palette expanded">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${tshirtConfig.textColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig({ textColor: color })}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="color-picker-section">
                    <label>Cor personalizada:</label>
                    <input
                      type="color"
                      value={tshirtConfig.textColor || '#000000'}
                      onChange={(e) => updateConfig({ textColor: e.target.value })}
                      className="custom-color-input"
                    />
                  </div>
                  <button 
                    onClick={() => updateConfig({ text: '' })}
                    className="remove-btn"
                  >
                    <X size={16} />
                    Remover Texto
                  </button>
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
            logoRotation: 0,
            text: '',
            textPosition: { x: -1.40, y: 0.60 },
            textColor: '#000000',
            textSize: 0.1,
            textFont: 'Arial, sans-serif',
            textRotation: -180,
            selectedShape: null,
            shapeColor: '#000000',
            shapeScale: 1,
            shapePosition: { x: 0, y: 0 },
            shapeRotation: 0,
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
