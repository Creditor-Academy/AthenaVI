import { useState, useRef } from 'react'
import { X, Search, Upload, Star, Palette, User, Layers, Sparkles, Camera, BookMarked, Plus, ImageIcon } from 'lucide-react'
import './StyleReferenceModal.css'

const STYLE_CATS = [
  { id: 'all',   label: 'All' },
  { id: 'photo', label: 'Photo' },
  { id: 'illus', label: 'Illustration' },
  { id: 'design',label: 'Design' },
  { id: '3d',    label: '3D' },
  { id: 'anime', label: 'Anime' },
  { id: 'saved', label: 'Saved' },
]

const LEFT_CATS = [
  { id: 'styles',   label: 'Styles',        Icon: Star },
  { id: 'color',    label: 'Color Palette',  Icon: Palette },
  { id: 'chars',    label: 'Characters',     Icon: User },
  { id: 'elements', label: 'Elements',       Icon: Layers },
  { id: 'effects',  label: 'Effects',        Icon: Sparkles },
  { id: 'camera',   label: 'Camera Angles',  Icon: Camera },
  { id: 'brand',    label: 'Brand Kits',     Icon: BookMarked },
]

const STYLES = [
  { id: 'editorial',  label: 'Editorial Film',     cat: 'photo',  seed: 'editorial1' },
  { id: 'noir',       label: 'Noir Cinematic',      cat: 'photo',  seed: 'noir2' },
  { id: 'golden',     label: 'Golden Hour',         cat: 'photo',  seed: 'golden3' },
  { id: 'street',     label: 'Street Doc',          cat: 'photo',  seed: 'street4' },
  { id: 'anime',      label: 'Anime Soft',          cat: 'anime',  seed: 'anime5' },
  { id: 'manga',      label: 'Manga Ink',           cat: 'anime',  seed: 'manga6' },
  { id: 'watercolor', label: 'Watercolor',          cat: 'illus',  seed: 'water7' },
  { id: 'popart',     label: 'Pop Art',             cat: 'illus',  seed: 'popart8' },
  { id: 'flatdesign', label: 'Flat Design',         cat: 'design', seed: 'flat9' },
  { id: 'cyberpunk',  label: 'Cyberpunk Neon',      cat: 'design', seed: 'cyber10' },
  { id: '3drender',   label: '3D Render',           cat: '3d',     seed: '3drender11' },
  { id: 'claymation', label: 'Claymation',          cat: '3d',     seed: 'clay12' },
  { id: 'darkacad',   label: 'Dark Academia',       cat: 'illus',  seed: 'darkac13' },
  { id: 'vaporwave',  label: 'Vaporwave',           cat: 'design', seed: 'vapor14' },
  { id: 'minimalist', label: 'Minimalist',          cat: 'design', seed: 'mini15' },
  { id: 'filmnoir',   label: 'Film Noir BW',        cat: 'photo',  seed: 'filmnoir16' },
]

function ReferenceTab({ refs, onAdd, onRemove }) {
  const fileRef = useRef(null)
  const handleUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name, id: `${Date.now()}-${f.name}` }))
    onAdd(previews)
    e.target.value = ''
  }
  return (
    <div className="srm-ref-tab">
      <button type="button" className="srm-upload-zone" onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
        <Upload size={26} strokeWidth={1.5} />
        <p>Click to upload reference images</p>
        <span>PNG, JPG, WEBP — up to 4 images</span>
      </button>
      {refs.length > 0 && (
        <div className="srm-ref-grid">
          {refs.map((ref) => (
            <div key={ref.id} className="srm-ref-item">
              <img src={ref.url} alt={ref.name} />
              <button type="button" className="srm-ref-remove" onClick={() => onRemove(ref.id)}>
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StyleReferenceModal({ onClose, onApplyStyle, onApplyRefs, selectedStyleId, existingRefs = [] }) {
  const [tab, setTab]           = useState('style')
  const [leftCat, setLeftCat]   = useState('styles')
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch]     = useState('')
  const [activeStyle, setActiveStyle] = useState(selectedStyleId || null)
  const [refs, setRefs]         = useState(existingRefs)

  const filtered = STYLES.filter((s) => {
    const matchCat = filterCat === 'all' || s.cat === filterCat
    const matchQ   = !search || s.label.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  const handleApply = () => {
    if (tab === 'style') onApplyStyle?.(activeStyle ? STYLES.find((s) => s.id === activeStyle) : null)
    else onApplyRefs?.(refs)
    onClose()
  }

  const addRefs = (newRefs) => setRefs((prev) => [...prev, ...newRefs].slice(0, 4))
  const removeRef = (id) => setRefs((prev) => {
    const item = prev.find((r) => r.id === id)
    if (item?.url?.startsWith('blob:')) URL.revokeObjectURL(item.url)
    return prev.filter((r) => r.id !== id)
  })

  const activeStyleObj = STYLES.find((s) => s.id === activeStyle)

  return (
    /* panel grows upward from bottom — attached to prompt card */
    <div className="srm-panel">

      {/* Panel header */}
      <div className="srm-header">
        <div className="srm-header-left">
          <h2 className="srm-title">Add references</h2>
        </div>
        <div className="srm-header-right">
          <div className="srm-search">
            <Search size={13} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search Styles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="srm-new-btn">
            <Plus size={13} /> New Styles
          </button>
          <button type="button" className="srm-close" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Panel body */}
      <div className="srm-body">

        {/* Left nav */}
        <nav className="srm-sidebar">
          {LEFT_CATS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`srm-cat-btn ${leftCat === id ? 'srm-cat-btn--active' : ''}`}
              onClick={() => setLeftCat(id)}
            >
              <Icon size={14} strokeWidth={1.75} />
              <span>{label}</span>
              {id === 'styles' && activeStyle && <span className="srm-cat-count">1</span>}
            </button>
          ))}
        </nav>

        {/* Main grid area */}
        <div className="srm-main">
          {/* Top filter tabs */}
          <div className="srm-filter-row">
            {STYLE_CATS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`srm-filter-btn ${filterCat === id ? 'srm-filter-btn--on' : ''}`}
                onClick={() => setFilterCat(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="srm-grid">
            {/* New style placeholder */}
            <button type="button" className="srm-style-card srm-style-card--add">
              <Plus size={20} strokeWidth={1.5} className="srm-add-icon" />
              <span>New Style</span>
            </button>

            {filtered.map((style) => (
              <button
                key={style.id}
                type="button"
                className={`srm-style-card ${activeStyle === style.id ? 'srm-style-card--selected' : ''}`}
                onClick={() => setActiveStyle((prev) => prev === style.id ? null : style.id)}
              >
                <img
                  src={`https://picsum.photos/seed/${style.seed}/300/300`}
                  alt={style.label}
                  className="srm-style-img"
                  loading="lazy"
                />
                {activeStyle === style.id && (
                  <div className="srm-check-badge">
                    <CheckIcon />
                  </div>
                )}
                <span className="srm-style-label">{style.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="srm-footer">
        <button type="button" className="srm-cancel-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="srm-apply-btn" onClick={handleApply}>
          Apply{activeStyleObj ? ` — ${activeStyleObj.label}` : ''}
          {tab === 'reference' && refs.length > 0 ? ` — ${refs.length} image${refs.length > 1 ? 's' : ''}` : ''}
        </button>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default StyleReferenceModal
