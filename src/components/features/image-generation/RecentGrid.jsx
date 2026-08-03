import { Download, Trash2, Copy, Eye } from 'lucide-react'

function RecentGrid({ items = [], onView, onDelete, onDuplicate }) {
  if (items.length === 0) {
    return (
      <div className="igr-empty">
        <div className="igr-empty-icon">
          {/* Simple SVG canvas illustration — no emoji */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
            <rect x="4" y="8" width="40" height="32" rx="4" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="16" cy="20" r="4" stroke="#d1d5db" strokeWidth="1.5" />
            <path d="M4 32l10-8 8 6 6-5 16 13" stroke="#d1d5db" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="igr-empty-title">No generations yet</p>
        <p className="igr-empty-sub">Describe something and hit Generate.</p>
      </div>
    )
  }

  return (
    <div className="igr-section">
      <div className="igr-header">
        <span className="igr-title">Recent</span>
        <span className="igr-count">{items.length} image{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="igr-grid">
        {items.map((item) => (
          <div key={item.id} className="igr-item">
            <div className="igr-image-wrap" onClick={() => onView?.(item)}>
              <img src={item.url} alt={item.prompt} className="igr-image" loading="lazy" />
              <div className="igr-overlay">
                <div className="igr-overlay-actions">
                  <button type="button" className="igr-oa-btn" aria-label="View" onClick={(e) => { e.stopPropagation(); onView?.(item) }}>
                    <Eye size={14} />
                  </button>
                  <button type="button" className="igr-oa-btn" aria-label="Download">
                    <Download size={14} />
                  </button>
                  <button type="button" className="igr-oa-btn" aria-label="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate?.(item) }}>
                    <Copy size={14} />
                  </button>
                  <button type="button" className="igr-oa-btn igr-oa-btn--danger" aria-label="Delete" onClick={(e) => { e.stopPropagation(); onDelete?.(item) }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="igr-caption">
              <span className="igr-caption-prompt">{item.prompt}</span>
              <span className="igr-caption-meta">{item.model} · {item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentGrid
