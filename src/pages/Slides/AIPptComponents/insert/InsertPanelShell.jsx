import './insertPanels.css'

/**
 * Shared dual-rail shell used by Media / Shape / Chart / Embed panels.
 */
export default function InsertPanelShell({
  title,
  rail,
  activeRailId,
  onSelectRail,
  children,
  footer = null,
  className = '',
  wide = false,
}) {
  return (
    <div
      className={`ppt-insert-panel ${wide ? 'ppt-insert-panel--wide' : ''} ${className}`}
      role="dialog"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
    >
      <aside className="ppt-insert-rail">
        <div className="ppt-insert-rail-title">{title}</div>
        <div className="ppt-insert-rail-scroll">
          {rail.map((section) => (
            <div key={section.label} className="ppt-insert-rail-section">
              {section.label ? (
                <div className="ppt-insert-rail-section-label">{section.label}</div>
              ) : null}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`ppt-insert-rail-item ${activeRailId === item.id ? 'is-active' : ''} ${item.disabled ? 'is-disabled' : ''}`}
                  disabled={item.disabled}
                  onClick={() => onSelectRail?.(item.id)}
                >
                  {item.icon ? <span className="ppt-insert-rail-icon">{item.icon}</span> : null}
                  <span className="ppt-insert-rail-label">{item.label}</span>
                  {item.badge ? <span className="ppt-insert-rail-badge">{item.badge}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </div>
        {footer ? <div className="ppt-insert-rail-footer">{footer}</div> : null}
      </aside>
      <div className="ppt-insert-main">{children}</div>
    </div>
  )
}
