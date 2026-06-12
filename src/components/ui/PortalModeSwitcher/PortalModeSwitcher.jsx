import { Clapperboard, Radar } from 'lucide-react'
import './PortalModeSwitcher.css'

function PortalModeSwitcher({ mode = 'main', onSelectMain, onSelectAdmin, onCloseMobile }) {
  const isAdmin = mode === 'admin'

  const handleSelect = (next) => {
    if (next === mode) return
    if (next === 'main') {
      onSelectMain?.()
    } else {
      onSelectAdmin?.()
    }
    onCloseMobile?.()
  }

  return (
    <div className="vi-mode-rail" role="group" aria-label="Switch workspace mode">
      <div className="vi-mode-rail-track">
        <div
          className={`vi-mode-rail-thumb ${isAdmin ? 'vi-mode-rail-thumb--admin' : ''}`}
          aria-hidden
        />
        <button
          type="button"
          className={`vi-mode-rail-btn ${!isAdmin ? 'vi-mode-rail-btn--active' : ''}`}
          onClick={() => handleSelect('main')}
          aria-pressed={!isAdmin}
          title="Creator Studio"
        >
          <Clapperboard size={13} strokeWidth={1.75} aria-hidden />
          <span>Studio</span>
        </button>
        <button
          type="button"
          className={`vi-mode-rail-btn ${isAdmin ? 'vi-mode-rail-btn--active' : ''}`}
          onClick={() => handleSelect('admin')}
          aria-pressed={isAdmin}
          title="Superadmin"
        >
          <Radar size={13} strokeWidth={1.75} aria-hidden />
          <span>Superadmin</span>
        </button>
      </div>
    </div>
  )
}

export default PortalModeSwitcher
