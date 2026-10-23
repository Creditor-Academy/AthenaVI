import { useMemo } from 'react'
import { PPT_TEXT_CATEGORIES, PPT_TEXT_PRESETS } from '../../../../constants/pptInsertCatalog'

function categoryForPreset(preset) {
  if (preset.category) return preset.category
  const id = String(preset.presetId || preset.id || '')
  if (id.includes('title') || id.includes('section') || id.includes('subtitle')) return 'Titles'
  if (id.includes('quote') || id.includes('caption') || id.includes('label')) return 'Callouts'
  if (id.includes('stat') || id.includes('number') || id.includes('big')) return 'Stats'
  return 'Body'
}

export default function TextPanel({ onInsert, disabled, elementPresets = [] }) {
  const presets = useMemo(() => {
    const apiText = (elementPresets || []).filter((p) => p.type === 'text')
    if (!apiText.length) return PPT_TEXT_PRESETS

    const byId = new Map()
    PPT_TEXT_PRESETS.forEach((p) => byId.set(p.id, { ...p }))
    apiText.forEach((p) => {
      const id = p.presetId || p.id
      const local = byId.get(id)
      byId.set(id, {
        id,
        category: categoryForPreset(p),
        label: p.label || local?.label || id,
        content: { ...(local?.content || {}), ...(p.content || {}) },
        defaultPlacement: p.defaultPlacement || null,
      })
    })
    // Prefer API-seeded order; append local-only leftovers
    const ordered = []
    const seen = new Set()
    apiText.forEach((p) => {
      const id = p.presetId || p.id
      if (seen.has(id)) return
      seen.add(id)
      ordered.push(byId.get(id))
    })
    PPT_TEXT_PRESETS.forEach((p) => {
      if (!seen.has(p.id)) ordered.push(byId.get(p.id))
    })
    return ordered
  }, [elementPresets])

  const categories = useMemo(
    () => [...new Set(presets.map((p) => p.category || categoryForPreset(p)))],
    [presets]
  )

  return (
    <div
      className="ppt-insert-popover ppt-text-panel"
      role="dialog"
      aria-label="Text"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ppt-insert-popover-title">Text</div>
      <p className="ppt-insert-popover-sub">Click a style to add it to the slide</p>
      {(categories.length ? categories : PPT_TEXT_CATEGORIES).map((category) => (
        <div key={category} className="ppt-insert-section">
          <div className="ppt-insert-section-head">
            <span>{category}</span>
          </div>
          <div className="ppt-text-grid">
            {presets
              .filter((p) => (p.category || categoryForPreset(p)) === category)
              .map((preset) => (
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
                      ...(preset.defaultPlacement
                        ? { placement: preset.defaultPlacement }
                        : {}),
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
                  <span className="ppt-text-card-meta">
                    {preset.content.fontSize ? `${preset.content.fontSize}px` : 'Text'}
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
