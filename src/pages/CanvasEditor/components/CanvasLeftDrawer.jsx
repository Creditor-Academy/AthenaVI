import { useState } from 'react'
import {
  FiSearch,
  FiX,
  FiPlus,
  FiCopy,
  FiTrash2,
  FiUploadCloud,
  FiSquare,
  FiCircle,
  FiStar,
  FiArrowUpRight,
  FiMinus,
  FiHexagon,
} from 'react-icons/fi'
import ColorFillPicker from '../../Slides/AIPptComponents/insert/ColorFillPicker'

const SAMPLE_STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
]

const SHAPE_PRESETS = [
  { id: 'rectangle', label: 'Rectangle', shape: 'rect', icon: FiSquare },
  { id: 'circle', label: 'Circle', shape: 'circle', icon: FiCircle },
  { id: 'star', label: 'Star', shape: 'star', icon: FiStar },
  { id: 'arrow', label: 'Arrow', shape: 'arrow', icon: FiArrowUpRight },
  { id: 'line', label: 'Line', shape: 'line', icon: FiMinus },
  { id: 'hexagon', label: 'Hexagon', shape: 'hexagon', icon: FiHexagon },
]

export default function CanvasLeftDrawer({
  activeTab,
  isOpen,
  onClose,
  onInsertElement,
  canvases,
  activeCanvasIndex,
  setActiveCanvasIndex,
  onAddCanvas,
  onDuplicateCanvas,
  onDeleteCanvas,
  activeCanvas,
  onUpdateBackground,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const handleTextInsert = (presetType) => {
    if (presetType === 'heading') {
      onInsertElement({
        type: 'text',
        content: { text: 'Add a heading', fontSize: 36, fontWeight: 'bold' },
        placement: { width: 400, height: 60 },
      })
    } else if (presetType === 'subheading') {
      onInsertElement({
        type: 'text',
        content: { text: 'Add a subheading', fontSize: 22, fontWeight: '600' },
        placement: { width: 340, height: 48 },
      })
    } else if (presetType === 'body') {
      onInsertElement({
        type: 'text',
        content: { text: 'Add body text. Double-click to start editing.', fontSize: 15, fontWeight: 'normal' },
        placement: { width: 300, height: 80 },
      })
    }
  }

  const handleShapeInsert = (shapeItem) => {
    onInsertElement({
      type: 'shape',
      content: { shape: shapeItem.shape, fill: '#3B82F6', stroke: '#1D4ED8' },
      placement: { width: 160, height: 160 },
    })
  }

  const handleImageInsert = (url) => {
    onInsertElement({
      type: 'image',
      content: { url, src: url },
      placement: { width: 320, height: 240 },
    })
  }

  return (
    <aside className="canva-drawer">
      <header className="canva-drawer-header">
        <h3 className="canva-drawer-title">
          {activeTab === 'elements' && 'Elements'}
          {activeTab === 'text' && 'Text'}
          {activeTab === 'uploads' && 'Uploads'}
          {activeTab === 'shapes' && 'Shapes'}
          {activeTab === 'brand' && 'Brand Kit'}
          {activeTab === 'canvases' && 'Pages & Canvases'}
          {activeTab === 'settings' && 'Canvas Settings'}
        </h3>
        <button type="button" className="canva-drawer-close-btn" onClick={onClose} aria-label="Close panel">
          <FiX />
        </button>
      </header>

      {/* Search Input */}
      {['elements', 'text', 'uploads', 'shapes'].includes(activeTab) && (
        <div className="canva-drawer-search">
          <FiSearch className="canva-drawer-search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="canva-drawer-search-clear" onClick={() => setSearchQuery('')}>
              <FiX />
            </button>
          )}
        </div>
      )}

      <div className="canva-drawer-body">
        {/* TAB: TEXT */}
        {activeTab === 'text' && (
          <div className="canva-drawer-section">
            <label className="canva-drawer-label">Add Text</label>

            <button
              type="button"
              className="canva-text-preset-card heading"
              onClick={() => handleTextInsert('heading')}
            >
              <strong>Add a heading</strong>
            </button>

            <button
              type="button"
              className="canva-text-preset-card subheading"
              onClick={() => handleTextInsert('subheading')}
            >
              <span>Add a subheading</span>
            </button>

            <button
              type="button"
              className="canva-text-preset-card body"
              onClick={() => handleTextInsert('body')}
            >
              <small>Add body text</small>
            </button>
          </div>
        )}

        {/* TAB: SHAPES & ELEMENTS */}
        {(activeTab === 'shapes' || activeTab === 'elements') && (
          <div className="canva-drawer-section">
            <label className="canva-drawer-label">Shapes & Graphics</label>
            <div className="canva-shapes-grid">
              {SHAPE_PRESETS.map((shapeItem) => {
                const Icon = shapeItem.icon
                return (
                  <button
                    type="button"
                    key={shapeItem.id}
                    className="canva-shape-card"
                    onClick={() => handleShapeInsert(shapeItem)}
                  >
                    <Icon className="canva-shape-icon" />
                    <span>{shapeItem.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB: UPLOADS & PHOTOS */}
        {(activeTab === 'uploads' || activeTab === 'elements') && (
          <div className="canva-drawer-section">
            <label className="canva-drawer-label">Photos & Media</label>

            <label className="canva-upload-dropzone">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = URL.createObjectURL(file)
                    handleImageInsert(url)
                  }
                }}
                style={{ display: 'none' }}
              />
              <FiUploadCloud className="canva-upload-icon" />
              <strong>Upload Image</strong>
              <span>JPG, PNG, WebP up to 10MB</span>
            </label>

            <div className="canva-photos-grid">
              {SAMPLE_STOCK_PHOTOS.map((photoUrl, i) => (
                <div
                  key={i}
                  className="canva-photo-card"
                  onClick={() => handleImageInsert(photoUrl)}
                >
                  <img src={photoUrl} alt={`Stock photo ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BRAND KIT */}
        {activeTab === 'brand' && (
          <div className="canva-drawer-section">
            <label className="canva-drawer-label">Brand Color Palettes</label>
            <div className="canva-brand-palettes">
              {[
                ['#2563EB', '#1D4ED8', '#60A5FA', '#EFF6FF'],
                ['#7C3AED', '#6D28D9', '#A78BFA', '#F5F3FF'],
                ['#059669', '#047857', '#34D399', '#ECFDF5'],
                ['#DC2626', '#B91C1C', '#F87171', '#FEF2F2'],
              ].map((palette, idx) => (
                <div key={idx} className="canva-brand-palette-row">
                  {palette.map((hex, colorIdx) => (
                    <button
                      type="button"
                      key={colorIdx}
                      className="canva-brand-color-swatch"
                      style={{ background: hex }}
                      title={hex}
                      onClick={() => onUpdateBackground(hex)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PAGES & CANVASES */}
        {activeTab === 'canvases' && (
          <div className="canva-drawer-section">
            <label className="canva-drawer-label">Pages Overview</label>
            <div className="canva-pages-list">
              {canvases.map((c, index) => (
                <div
                  key={c.id}
                  className={`canva-page-card ${index === activeCanvasIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveCanvasIndex(index)}
                >
                  <div className="canva-page-card-thumb" style={{ background: c.background || '#ffffff' }}>
                    <small>Page {index + 1}</small>
                  </div>
                  <div className="canva-page-card-info">
                    <strong>Page {index + 1}</strong>
                    <small>{c.width} × {c.height} px</small>
                  </div>
                  <div className="canva-page-card-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateCanvas(c)
                      }}
                      title="Duplicate page"
                    >
                      <FiCopy />
                    </button>
                    {canvases.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteCanvas(c.id)
                        }}
                        title="Delete page"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="canva-add-page-btn" onClick={onAddCanvas}>
              <FiPlus /> Add New Page
            </button>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="canva-drawer-section">
            <label className="canva-drawer-label">Canvas Background</label>
            <ColorFillPicker
              value={{ type: 'solid', color: activeCanvas?.background || '#FFFFFF' }}
              palette={{ bg: '#FFF', surface: '#FFF', text: '#000', title: '#000', accent: '#2563EB' }}
              onChange={(fill) => onUpdateBackground(fill?.color || fill)}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
