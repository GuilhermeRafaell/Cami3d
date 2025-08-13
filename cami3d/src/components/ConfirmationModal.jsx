import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import './ConfirmationModal.css'

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  type = 'success', // 'success' ou 'error'
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000 
}) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  if (!isOpen) return null

  const IconComponent = type === 'success' ? CheckCircle : XCircle

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="confirmation-close-btn">
          <X size={20} />
        </button>
        
        <div className={`confirmation-icon ${type}`}>
          <IconComponent size={48} />
        </div>
        
        <div className="confirmation-text">
          <h3 className="confirmation-title">{title}</h3>
          <p className="confirmation-message">{message}</p>
        </div>
        
        {autoClose && (
          <div className="confirmation-progress">
            <div className="confirmation-progress-bar"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmationModal
