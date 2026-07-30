import { X } from 'lucide-react'
import { CREATE_OPTIONS } from '../../../constants/createOptions.js'
import './CreateMenuModal.css'

function CreateMenuModal({ isOpen, onClose, onSelectAvatarVideo, onNavigateSection }) {
  if (!isOpen) return null

  const handleSelect = (id) => {
    if (id === 'avatar-video') {
      onSelectAvatarVideo?.()
    } else {
      onNavigateSection?.(id)
    }
  }

  return (
    <div className="create-menu-modal-overlay" onClick={onClose}>
      <div className="create-menu-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="create-menu-modal-header">
          <h3>Create New</h3>
          <button className="create-menu-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="create-menu-modal-grid">
          {CREATE_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                className={`create-menu-card option-${option.id}`}
                onClick={() => handleSelect(option.id)}
              >
                <div className={`create-menu-card-icon ${option.accent}`}>
                  <Icon size={24} />
                </div>
                <div className="create-menu-card-text">
                  <h4>{option.title}</h4>
                  <p>{option.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CreateMenuModal
