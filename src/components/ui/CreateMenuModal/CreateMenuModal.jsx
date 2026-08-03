import { useEffect } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { CREATE_OPTIONS } from '../../../constants/createOptions.js'
import './CreateMenuModal.css'

function CreateMenuModal({
  isOpen,
  onClose,
  onSelectAvatarVideo,
  onNavigateSection,
  projectOnly = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const options = projectOnly
    ? CREATE_OPTIONS.filter((option) =>
        ['avatar-video', 'ppt-ai', 'ppt-builder'].includes(option.id)
      )
    : CREATE_OPTIONS

  const handleSelect = (id) => {
    if (id === 'avatar-video') {
      onSelectAvatarVideo?.()
    } else {
      onNavigateSection?.(id)
    }
  }

  return (
    <div className="create-menu-modal-overlay" onClick={onClose}>
      <div
        className="create-menu-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-menu-modal-title"
      >
        <div className="create-menu-modal-header">
          <div>
            <p className="create-menu-modal-eyebrow">Start something new</p>
            <h3 id="create-menu-modal-title">Create New</h3>
            <p className="create-menu-modal-subtitle">
              Pick a creation type. You’ll choose the workspace next for non-video projects.
            </p>
          </div>
          <button type="button" className="create-menu-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="create-menu-modal-grid">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                type="button"
                className={`create-menu-card option-${option.id} accent-${option.accent}`}
                onClick={() => handleSelect(option.id)}
              >
                <div className={`create-menu-card-icon ${option.accent}`}>
                  <Icon size={22} />
                </div>
                <div className="create-menu-card-text">
                  <h4>{option.title}</h4>
                  <p>{option.description}</p>
                </div>
                <span className="create-menu-card-arrow" aria-hidden="true">
                  <ArrowUpRight size={16} />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CreateMenuModal
