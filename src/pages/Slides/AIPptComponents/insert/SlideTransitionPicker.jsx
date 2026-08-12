import { useId } from 'react'
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

function TransitionPreview({ id }) {
  const gradId = useId().replace(/:/g, '')

  if (id === 'none') {
    return (
      <svg viewBox="0 0 80 54" className="ppt-transition-thumb-svg" aria-hidden>
        <rect x="10" y="8" width="60" height="38" rx="6" fill="#fff" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="18" y1="42" x2="62" y2="12" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (id === 'continuity') {
    return (
      <svg viewBox="0 0 80 54" className="ppt-transition-thumb-svg" aria-hidden>
        <rect x="8" y="12" width="34" height="24" rx="5" fill="#fff" stroke="#94A3B8" strokeWidth="1.8" />
        <rect x="26" y="16" width="34" height="24" rx="5" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.8" />
        <rect x="44" y="20" width="28" height="20" rx="5" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.8" />
        <path d="M16 22h8M16 26h6" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M34 26h8M34 30h6" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M52 28h8M52 32h6" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (id === 'fade') {
    return (
      <svg viewBox="0 0 80 54" className="ppt-transition-thumb-svg" aria-hidden>
        <defs>
          <linearGradient id={`fade-${gradId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>
        <rect x="10" y="8" width="60" height="38" rx="6" fill={`url(#fade-${gradId})`} stroke="#94A3B8" strokeWidth="1.8" />
        <rect x="16" y="14" width="22" height="6" rx="2" fill="#fff" opacity="0.85" />
        <rect x="16" y="24" width="34" height="4" rx="2" fill="#fff" opacity="0.65" />
        <rect x="16" y="32" width="28" height="4" rx="2" fill="#fff" opacity="0.45" />
      </svg>
    )
  }

  const arrow =
    id === 'slide-left'
      ? 'M22 27h10M28 23l-4 4 4 4'
      : id === 'slide-right'
        ? 'M48 27H38M42 23l4 4-4 4'
        : id === 'slide-up'
          ? 'M40 32V22M36 28l4-4 4 4'
          : 'M40 22v10M36 28l4 4 4-4'

  const slideOffset =
    id === 'slide-left'
      ? { a: '8,10', b: '32,14' }
      : id === 'slide-right'
        ? { a: '38,10', b: '14,14' }
        : id === 'slide-up'
          ? { a: '14,18', b: '14,6' }
          : { a: '14,6', b: '14,18' }

  const [ax, ay] = slideOffset.a.split(',').map(Number)
  const [bx, by] = slideOffset.b.split(',').map(Number)

  return (
    <svg viewBox="0 0 80 54" className="ppt-transition-thumb-svg" aria-hidden>
      <rect x="10" y="8" width="60" height="38" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x={ax} y={ay} width="28" height="20" rx="4" fill="#fff" stroke="#94A3B8" strokeWidth="1.6" />
      <rect x={bx} y={by} width="28" height="20" rx="4" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.6" />
      <path d={arrow} fill="none" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
