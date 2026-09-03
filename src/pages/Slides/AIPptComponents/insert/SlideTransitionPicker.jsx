import './insertPanels.css'

export const PPT_SLIDE_TRANSITIONS = [
  { id: 'none', label: 'None' },
  { id: 'continuity', label: 'Continuity' },
  { id: 'fade', label: 'Fade' },
  { id: 'slide-left', label: 'Slide left' },
  { id: 'slide-right', label: 'Slide right' },
  { id: 'slide-up', label: 'Slide up' },
  { id: 'slide-down', label: 'Slide down' },
]

function MiniSlide({ tone = 'a' }) {
  return (
    <span className={`ppt-tx-slide ppt-tx-slide--${tone}`} aria-hidden>
      <span className="ppt-tx-chrome">
        <i />
        <i />
        <i />
      </span>
      <span className="ppt-tx-line ppt-tx-line--lg" />
      <span className="ppt-tx-line" />
      <span className="ppt-tx-line ppt-tx-line--sm" />
      <span className="ppt-tx-block" />
    </span>
  )
}

function TransitionPreview({ id }) {
  if (id === 'none') {
    return (
      <span className="ppt-tx-stage ppt-tx-stage--none" aria-hidden>
        <MiniSlide tone="a" />
        <span className="ppt-tx-none-mark" />
      </span>
    )
  }

  return (
    <span className="ppt-tx-stage" aria-hidden>
      <MiniSlide tone="a" />
      <MiniSlide tone="b" />
    </span>
  )
}

export default function SlideTransitionPicker({
  value = 'none',
  onChange,
  disabled = false,
  compact = false,
}) {
  const current = value || 'none'

  return (
    <div
      className={`ppt-transition-grid ${compact ? 'ppt-transition-grid--compact' : ''}`}
      role="listbox"
      aria-label="Slide transition"
    >
      {PPT_SLIDE_TRANSITIONS.map((opt) => {
        const selected = current === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="option"
            aria-selected={selected}
            className={`ppt-transition-card ${selected ? 'is-active' : ''}`}
            disabled={disabled}
            onClick={() => onChange?.(opt.id)}
          >
            <span className={`ppt-transition-thumb ppt-transition-thumb--${opt.id}`}>
              <TransitionPreview id={opt.id} />
            </span>
            <span className="ppt-transition-label">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
