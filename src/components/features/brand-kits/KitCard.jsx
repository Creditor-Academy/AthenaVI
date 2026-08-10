import {
  MdMoreVert,
  MdDelete,
  MdContentCopy,
  MdStar,
  MdStarBorder,
} from 'react-icons/md'
import { formatRelativeTime } from '../../../utils/brandKitHelpers'

export default function KitCard({
  kit,
  viewMode,
  canWrite,
  menuOpen,
  setMenuOpen,
  setMenuRef,
  onEdit,
  onSetDefault,
  onCopyId,
  onDelete,
  index,
}) {
  const colors = kit.data?.colors || []
  const ribbonColors =
    colors.length > 0
      ? colors.slice(0, 5)
      : [
          { id: 'f1', hex: '#CBD5E1' },
          { id: 'f2', hex: '#94A3B8' },
          { id: 'f3', hex: '#64748B' },
        ]

  return (
    <div
      className="brandkit-card"
      onClick={() => onEdit(kit)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit(kit)
        }
      }}
      role="button"
      tabIndex={0}
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <div className="brandkit-ribbon" aria-hidden>
        {ribbonColors.map((c) => (
          <span key={c.id} style={{ background: c.hex }} />
        ))}
      </div>

      <div className="brandkit-card-body">
        <div className="brandkit-info">
          {viewMode === 'grid' && (
            <div className="brandkit-swatches">
              {ribbonColors.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  className="brandkit-swatch"
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h3 className="brandkit-name">{kit.name}</h3>
            <div className="brandkit-meta">
              {kit.isDefault && (
                <span className="default-badge">
                  <MdStar size={12} /> Default
                </span>
              )}
              <span className="brandkit-date">
                {kit.mediaCount || 0} media
                {kit.updatedAt ? ` · ${formatRelativeTime(kit.updatedAt)}` : ''}
              </span>
            </div>
          </div>
        </div>

        {canWrite && (
          <div
            className="brandkit-menu-wrap"
            ref={(el) => setMenuRef?.(kit.id, el)}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="brandkit-menu-btn"
              aria-label="Kit actions"
              onClick={() => setMenuOpen(menuOpen === kit.id ? null : kit.id)}
            >
              <MdMoreVert size={20} />
            </button>
            {menuOpen === kit.id && (
              <div className="brandkit-menu">
                <button type="button" className="menu-item" onClick={() => onSetDefault(kit.id)}>
                  {kit.isDefault ? (
                    <MdStarBorder className="menu-icon" />
                  ) : (
                    <MdStar className="menu-icon" />
                  )}
                  {kit.isDefault ? 'Default kit' : 'Set as default'}
                </button>
                <button type="button" className="menu-item" onClick={() => onCopyId(kit.id)}>
                  <MdContentCopy className="menu-icon" />
                  Copy ID
                </button>
                <button type="button" className="menu-item delete" onClick={() => onDelete(kit.id)}>
                  <MdDelete className="menu-icon" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
