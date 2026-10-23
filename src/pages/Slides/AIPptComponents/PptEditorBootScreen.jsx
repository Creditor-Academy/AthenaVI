import './PptEditorBootScreen.css'

/**
 * Quiet editor open loader — not the generation shuffle.
 * Dashboard shell + ghost editor chrome, almost no copy.
 */
export default function PptEditorBootScreen({ title = '' }) {
  const label = String(title || '').trim()
    ? `Loading ${String(title).trim()}`
    : 'Loading presentation'

  return (
    <div className="ppt-boot" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
      <div className="ppt-boot-card">
        <div className="ppt-boot-progress" aria-hidden>
          <span />
        </div>

        <div className="ppt-boot-topbar" aria-hidden>
          <span className="ppt-boot-chip ppt-boot-chip--wide" />
          <span className="ppt-boot-chip" />
          <span className="ppt-boot-topbar-spacer" />
          <span className="ppt-boot-dot" />
          <span className="ppt-boot-dot" />
          <span className="ppt-boot-chip ppt-boot-chip--sm" />
        </div>

        <div className="ppt-boot-body">
          <div className="ppt-boot-rail ppt-boot-rail--left" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="ppt-boot-stage">
            <div className="ppt-boot-canvas">
              <div className="ppt-boot-mark">
                <div className="ppt-boot-stack" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <span className="ppt-boot-word">Loading</span>
              </div>
            </div>
          </div>

          <div className="ppt-boot-rail ppt-boot-rail--right" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  )
}
