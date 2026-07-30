import { useState, useRef } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'
import './SelectMediaModal.css'

const DUMMY_GENERATIONS = [
  { id: 'g1', seed: 'aurora1',   prompt: 'Aurora borealis over snowy mountains' },
  { id: 'g2', seed: 'city2',     prompt: 'Neon-lit cyberpunk city street' },
  { id: 'g3', seed: 'forest3',   prompt: 'Misty forest at sunrise' },
  { id: 'g4', seed: 'product4',  prompt: 'Minimalist product shot' },
  { id: 'g5', seed: 'ocean5',    prompt: 'Aerial view of turquoise ocean' },
  { id: 'g6', seed: 'portrait6', prompt: 'Portrait, soft natural light' },
]

export default function SelectMediaModal({ onClose, onConfirm }) {
  const [tab, setTab]             = useState('uploads')
  const [uploads, setUploads]     = useState([])
  const [selected, setSelected]   = useState(null)
  const fileRef = useRef(null)

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const items = files.map(f => ({ id: `u-${Date.now()}-${f.name}`, url: URL.createObjectURL(f), name: f.name, file: f }))
    setUploads(prev => [...items, ...prev])
    e.target.value = ''
  }

  const removeUpload = (id) => {
    setUploads(prev => {
      const item = prev.find(u => u.id === id)
      if (item) URL.revokeObjectURL(item.url)
      return prev.filter(u => u.id !== id)
    })
    if (selected?.id === id) setSelected(null)
  }

  const handleConfirm = () => {
    if (selected) onConfirm(selected)
    onClose()
  }

  const uploadsItems = uploads
  const genItems = DUMMY_GENERATIONS.map(g => ({
    ...g,
    url: `https://picsum.photos/seed/${g.seed}/400/400`,
  }))

  const items = tab === 'uploads' ? uploadsItems : genItems

  return (
    <div className="smm-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="smm-modal" role="dialog" aria-modal aria-label="Select Media">

        {/* Header */}
        <div className="smm-header">
          <h2 className="smm-title">Select Media</h2>
        </div>

        {/* Tabs */}
        <div className="smm-tabs">
          <button type="button" className={`smm-tab ${tab === 'uploads' ? 'smm-tab--active' : ''}`} onClick={() => setTab('uploads')}>
            Your Uploads
          </button>
          <button type="button" className={`smm-tab ${tab === 'generations' ? 'smm-tab--active' : ''}`} onClick={() => setTab('generations')}>
            Your Generations
          </button>
        </div>

        {/* Grid */}
        <div className="smm-body">
          <div className="smm-grid">

            {/* Upload zone — only on uploads tab */}
            {tab === 'uploads' && (
              <button type="button" className="smm-upload-card" onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
                <Upload size={28} strokeWidth={1.5} />
                <span className="smm-upload-title">Upload an image</span>
                <span className="smm-upload-sub">PNG, JPG or WEBP up to 25MB</span>
              </button>
            )}

            {/* Image items */}
            {items.map(item => (
              <div
                key={item.id}
                className={`smm-item ${selected?.id === item.id ? 'smm-item--selected' : ''}`}
                onClick={() => setSelected(prev => prev?.id === item.id ? null : item)}
              >
                <img src={item.url} alt={item.prompt || item.name} className="smm-item-img" />
                {selected?.id === item.id && (
                  <div className="smm-item-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* Empty generations */}
            {tab === 'generations' && genItems.length === 0 && (
              <p className="smm-empty">No generations yet. Create your first image.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="smm-footer">
          <div className="smm-footer-left">
            {selected && tab === 'uploads' && (
              <button type="button" className="smm-delete-btn" onClick={() => removeUpload(selected.id)} title="Remove image">
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            )}
          </div>
          <div className="smm-footer-right">
            <button type="button" className="smm-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="button" className="smm-confirm-btn" disabled={!selected} onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
