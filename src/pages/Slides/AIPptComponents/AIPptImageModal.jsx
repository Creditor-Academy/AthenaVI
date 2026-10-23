import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, Check } from 'lucide-react'

const FILTERS = ['All', 'Scenic', 'Realistic', 'Minimal', 'Playful', 'Bold', 'Abstract']

export default function AIPptImageModal({ isOpen, onClose, imageStyles, initialStyle, onSelectStyle }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    if (!isOpen) return
    setSearchQuery('')
    setActiveFilter('All')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    const container = document.querySelector('.aig-container')
    const prevContainerOverflow = container?.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    if (container) container.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      if (container) container.style.overflow = prevContainerOverflow || ''
      document.body.style.overflow = prevBodyOverflow
    }
  }, [isOpen, onClose])

  const handleClose = useCallback(
    (event) => {
      event?.preventDefault?.()
      event?.stopPropagation?.()
      onClose()
    },
    [onClose]
  )

  if (!isOpen) return null

  const filteredStyles = imageStyles.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'All' || (s.tags && s.tags.includes(activeFilter))
    return matchesSearch && matchesFilter
  })

  const selectStyle = (id) => {
    onSelectStyle(id)
    onClose()
  }

  return createPortal(
    <>
      <div
        className="aig-template-drawer-backdrop"
        onClick={handleClose}
        aria-hidden
      />
      <aside
        className="aig-template-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Image choices"
      >
        <div className="aig-template-drawer-header">
          <div>
            <h2>Image choices</h2>
            <p>Tap a style to apply it</p>
          </div>
          <button
            type="button"
            className="aig-template-drawer-close"
            onClick={handleClose}
            aria-label="Close sidebar"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="aig-template-drawer-tools">
          <label className="aig-template-drawer-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search for a style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
          <div className="aig-theme-filters aig-theme-filters--drawer" role="group" aria-label="Art style filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="aig-template-drawer-body aig-template-drawer-body--art-styles">
          {filteredStyles.length === 0 ? (
            <div className="aig-template-drawer-empty">No styles match your search.</div>
          ) : (
            filteredStyles.map((style) => {
              const isSelected = String(initialStyle) === String(style.id)
              return (
                <button
                  key={style.id}
                  type="button"
                  className={`aig-image-style-card ${isSelected ? 'active' : ''}`}
                  onClick={() => selectStyle(style.id)}
                >
                  <div className="aig-image-card-img-wrapper">
                    <img src={style.img} alt="" />
                    {isSelected ? (
                      <div className="aig-image-card-check-overlay">
                        <Check size={16} color="#ffffff" strokeWidth={3} />
                      </div>
                    ) : null}
                  </div>
                  <span className="aig-image-card-label">{style.name}</span>
                </button>
              )
            })
          )}
        </div>
      </aside>
    </>,
    document.body
  )
}
