import { FiPlus, FiTrash2 } from 'react-icons/fi'
import './pptEditorExtras.css'

const DEFAULT_VARIABLES = [
  { key: 'logo', label: 'Logo URL', type: 'image' },
  { key: 'heroPhoto', label: 'Hero photo', type: 'image' },
  { key: 'brandColor', label: 'Brand color', type: 'color' },
]

/**
 * Deck variables — sync logos/photos/colors across slides.
 */
export default function PptVariablesPanel({
  variables = [],
  onChange,
  onSyncAll,
  disabled = false,
}) {
  const list = variables.length ? variables : DEFAULT_VARIABLES

  const update = (index, field, value) => {
    const next = list.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    onChange?.(next)
  }

  const add = () => {
    onChange?.([
      ...list,
      { key: `var_${Date.now()}`, label: 'New variable', type: 'text', value: '' },
    ])
  }

  const remove = (index) => {
    onChange?.(list.filter((_, i) => i !== index))
  }

  return (
    <div className="ppt-variables-panel">
      <p className="ppt-slide-panel-hint">
        Variables keep logos, photos, and brand colors consistent across the deck.
      </p>
      <div className="ppt-variables-list">
        {list.map((v, i) => (
          <div key={v.key || i} className="ppt-variable-row">
            <input
              placeholder="Key"
              value={v.key || ''}
              disabled={disabled}
              onChange={(e) => update(i, 'key', e.target.value)}
            />
            <input
              placeholder="Value"
              value={v.value || ''}
              disabled={disabled}
              type={v.type === 'color' ? 'color' : 'text'}
              onChange={(e) => update(i, 'value', e.target.value)}
            />
            <button type="button" disabled={disabled} onClick={() => remove(i)} title="Remove">
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="ppt-slide-panel-btn"
        style={{ marginTop: 8 }}
        disabled={disabled}
        onClick={add}
      >
        <FiPlus size={14} /> Add variable
      </button>
      <button
        type="button"
        className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
        style={{ marginTop: 8 }}
        disabled={disabled}
        onClick={() => onSyncAll?.(list)}
      >
        Sync across all slides
      </button>
    </div>
  )
}

export function applyVariablesToSlides(slides, variables) {
  if (!variables?.length) return slides
  const map = Object.fromEntries(
    variables.filter((v) => v.key && v.value).map((v) => [v.key, v.value])
  )

  return slides.map((slide) => {
    const elements = (slide.elements?.elements || []).map((el) => {
      const c = { ...(el.content || {}) }
      if (el.type === 'image' && c.variableKey && map[c.variableKey]) {
        return { ...el, content: { ...c, url: map[c.variableKey], src: map[c.variableKey] } }
      }
      if (el.type === 'text' && c.variableKey && map[c.variableKey]) {
        return { ...el, content: { ...c, color: map[c.variableKey] } }
      }
      return el
    })
    return {
      ...slide,
      elements: {
        ...(slide.elements || {}),
        elements,
      },
    }
  })
}
