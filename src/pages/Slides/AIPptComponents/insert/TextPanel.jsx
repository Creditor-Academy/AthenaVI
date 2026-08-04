import { PPT_TEXT_CATEGORIES, PPT_TEXT_PRESETS } from '../../../../constants/pptInsertCatalog'

export default function TextPanel({ onInsert, disabled }) {
  return (
    <div
      className="ppt-insert-popover ppt-text-panel"
      role="dialog"
      aria-label="Text"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ppt-insert-popover-title">Text</div>
      <p className="ppt-insert-popover-sub">Click a style to add it to the slide</p>
      {PPT_TEXT_CATEGORIES.map((category) => (
        <div key={category} className="ppt-insert-section">
          <div className="ppt-insert-section-head">
            <span>{category}</span>
          </div>
          <div className="ppt-text-grid">
            {PPT_TEXT_PRESETS.filter((p) => p.category === category).map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="ppt-text-card"
                disabled={disabled}
                onClick={() =>
                  onInsert({
                    type: 'text',
                    presetId: preset.id,
                    content: { ...preset.content },
                  })
                }
              >
                <span
                  className="ppt-text-card-preview"
                  style={{
                    fontWeight: preset.content.bold ? 700 : 500,
                    fontStyle: preset.content.italic ? 'italic' : 'normal',
                    fontSize:
                      preset.content.fontSize >= 64
                        ? 22
                        : preset.content.fontSize >= 36
                          ? 16
                          : 13,
                    textAlign: preset.content.align || 'left',
                  }}
                >
                  {preset.label}
                </span>
                <span className="ppt-text-card-meta">{preset.content.fontSize}px</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
