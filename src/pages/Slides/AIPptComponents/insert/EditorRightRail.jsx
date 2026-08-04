import { useEffect, useRef, useState } from 'react'
import {
  FiMessageCircle,
  FiCheckCircle,
  FiUser,
  FiX,
  FiImage,
} from 'react-icons/fi'
import { MdOutlineDesignServices, MdOutlineAnimation } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'
import { HiOutlineClipboard } from 'react-icons/hi'
import './insertPanels.css'

const RAIL_TOOLS = [
  { id: 'design', label: 'Design', Icon: MdOutlineDesignServices },
  { id: 'transition', label: 'Slide transition', Icon: MdOutlineAnimation },
  { id: 'comments', label: 'Comments', Icon: FiMessageCircle },
  { id: 'status', label: 'Status', Icon: HiOutlineClipboard },
]

export const PPT_SLIDE_TRANSITIONS = [
  { id: 'none', label: 'None' },
  { id: 'continuity', label: 'Continuity' },
  { id: 'fade', label: 'Fade' },
  { id: 'slide-left', label: 'Slide left' },
  { id: 'slide-right', label: 'Slide right' },
  { id: 'slide-up', label: 'Slide up' },
]

export const PPT_SLIDE_STATUSES = [
  { id: 'none', label: 'No status' },
  { id: 'todo', label: 'To do' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

function StatusDot({ id }) {
  return <span className={`ppt-status-dot ppt-status-dot--${id}`} aria-hidden />
}

function TransitionThumb({ id }) {
  if (id === 'none') {
    return (
      <svg viewBox="0 0 64 44" className="ppt-transition-thumb-svg" aria-hidden>
        <line x1="18" y1="36" x2="46" y2="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'continuity') {
    return (
      <svg viewBox="0 0 64 44" className="ppt-transition-thumb-svg" aria-hidden>
        <rect x="8" y="10" width="28" height="22" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="28" y="14" width="28" height="22" rx="5" fill="#F1F5F9" stroke="currentColor" strokeWidth="2" />
        <path d="M18 21 l2 2 4-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M38 25 l2 2 4-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'fade') {
    return (
      <svg viewBox="0 0 64 44" className="ppt-transition-thumb-svg" aria-hidden>
        <defs>
          <linearGradient id="pptFadeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>
        <rect x="10" y="8" width="44" height="28" rx="6" fill="url(#pptFadeGrad)" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  if (id === 'slide-left') {
    return (
      <svg viewBox="0 0 64 44" className="ppt-transition-thumb-svg" aria-hidden>
        <rect x="8" y="8" width="48" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="18" y="16" width="12" height="12" rx="2" fill="#94A3B8" />
        <circle cx="40" cy="22" r="6" fill="#CBD5E1" />
        <path d="M14 22 h6 M16 19 l-3 3 3 3" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'slide-right') {
    return (
      <svg viewBox="0 0 64 44" className="ppt-transition-thumb-svg" aria-hidden>
        <rect x="8" y="8" width="48" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="18" y="16" width="12" height="12" rx="2" fill="#94A3B8" />
        <circle cx="40" cy="22" r="6" fill="#CBD5E1" />
        <path d="M50 22 h-6 M48 19 l3 3 -3 3" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  // slide-up
  return (
    <svg viewBox="0 0 64 44" className="ppt-transition-thumb-svg" aria-hidden>
      <rect x="8" y="8" width="48" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="14" width="12" height="12" rx="2" fill="#94A3B8" />
      <circle cx="40" cy="20" r="6" fill="#CBD5E1" />
      <path d="M32 34 v-5 M29 31 l3 -3 3 3" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Right floating rail: Design / Transition / Comments / Status + zoom + AI.
 */
export default function EditorRightRail({
  zoom = 100,
  deckStatus = 'READY',
  generationPrompt = '',
  slide = null,
  themeVisual = null,
  onResetBackground,
  onAddBackgroundImage,
  onChangeTransition,
  onChangeSlideStatus,
  disabled = false,
}) {
  const [active, setActive] = useState(null)
  const [aiOpen, setAiOpen] = useState(false)
  const rootRef = useRef(null)

  const currentTransition =
    slide?.transition ||
    slide?.elements?.transition ||
    'none'

  const currentSlideStatus =
    slide?.contributorStatus ||
    slide?.slideStatus ||
    'none'

  useEffect(() => {
    if (!active && !aiOpen) return undefined
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setActive(null)
        setAiOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setActive(null)
        setAiOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [active, aiOpen])

  const toggle = (id) => {
    if (disabled) return
    setAiOpen(false)
    setActive((prev) => (prev === id ? null : id))
  }

  return (
    <div className="ppt-right-rail" ref={rootRef}>
      <div className="ppt-right-rail-stack">
        {RAIL_TOOLS.map((tool) => {
          const Icon = tool.Icon
          return (
            <button
              key={tool.id}
              type="button"
              className={`ppt-right-rail-btn ${active === tool.id ? 'is-active' : ''}`}
              title={tool.label}
              disabled={disabled}
              aria-label={tool.label}
              onClick={() => toggle(tool.id)}
            >
              <Icon size={18} />
            </button>
          )
        })}
        <button type="button" className="ppt-right-rail-btn" title="Assignee" disabled>
          <FiUser size={18} />
        </button>
        <div className="ppt-right-rail-zoom">{Math.round(zoom)}%</div>
      </div>

      <button
        type="button"
        className={`ppt-ai-fab ${aiOpen ? 'is-active' : ''}`}
        title="AI prompt"
        onClick={() => {
          setActive(null)
          setAiOpen((v) => !v)
        }}
      >
        <BsStars size={20} />
      </button>

      {active === 'design' && (
        <div className="ppt-slide-panel" role="dialog" aria-label="Slide">
          <div className="ppt-slide-panel-head">
            <strong>Slide</strong>
            <button type="button" className="ppt-slide-panel-close" onClick={() => setActive(null)}>
              <FiX size={16} />
            </button>
          </div>

          <div className="ppt-slide-panel-section">
            <div className="ppt-slide-panel-label">Slide style</div>
            <div className="ppt-slide-panel-select">
              {themeVisual?.name || 'Current theme'}
            </div>
          </div>

          <div className="ppt-slide-panel-section">
            <div className="ppt-slide-panel-label">Background color</div>
            <div className="ppt-slide-panel-row">
              <span
                className="ppt-slide-bg-swatch"
                style={{ background: themeVisual?.inner || themeVisual?.background || '#fff' }}
              />
              <button
                type="button"
                className="ppt-slide-panel-btn"
                onClick={() => onResetBackground?.()}
              >
                Reset background
              </button>
            </div>
          </div>

          <div className="ppt-slide-panel-section">
            <div className="ppt-slide-panel-label">Background image</div>
            <button
              type="button"
              className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
              onClick={() => onAddBackgroundImage?.()}
            >
              <FiImage size={14} /> Add background image
            </button>
          </div>

          <div className="ppt-slide-panel-section">
            <div className="ppt-slide-panel-label">Slide number</div>
            <label className="ppt-slide-toggle">
              <input type="checkbox" disabled />
              <span />
            </label>
          </div>

          <div className="ppt-slide-panel-section">
            <div className="ppt-slide-panel-label">Layers</div>
            <div className="ppt-slide-layers">
              {(slide?.elements?.elements || []).length === 0 ? (
                <div className="ppt-slide-layer-empty">No layers yet — insert from the top bar</div>
              ) : (
                (slide?.elements?.elements || []).map((el, i) => (
                  <div key={el.id || i} className="ppt-slide-layer-row">
                    <span className="ppt-slide-layer-num">{i + 1}</span>
                    <span className="ppt-slide-layer-type">{el.type || 'element'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {active === 'transition' && (
        <div className="ppt-slide-panel ppt-transition-panel" role="dialog" aria-label="Slide transition">
          <div className="ppt-slide-panel-head">
            <strong>Slide transition</strong>
            <button type="button" className="ppt-slide-panel-close" onClick={() => setActive(null)}>
              <FiX size={16} />
            </button>
          </div>

          <div className="ppt-transition-grid">
            {PPT_SLIDE_TRANSITIONS.map((opt) => {
              const selected = currentTransition === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`ppt-transition-card ${selected ? 'is-active' : ''}`}
                  disabled={disabled}
                  onClick={() => onChangeTransition?.(opt.id)}
                >
                  <span className="ppt-transition-thumb">
                    <TransitionThumb id={opt.id} />
                  </span>
                  <span className="ppt-transition-label">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {active === 'comments' && (
        <div className="ppt-slide-panel ppt-slide-panel--sm" role="dialog" aria-label="Comments">
          <div className="ppt-slide-panel-head">
            <strong>Comments</strong>
            <button type="button" className="ppt-slide-panel-close" onClick={() => setActive(null)}>
              <FiX size={16} />
            </button>
          </div>
          <p className="ppt-slide-panel-hint">No comments on this slide yet.</p>
        </div>
      )}

      {active === 'status' && (
        <div className="ppt-slide-panel ppt-slide-panel--sm ppt-status-panel" role="dialog" aria-label="Status">
          <div className="ppt-slide-panel-head">
            <strong>Status</strong>
            <button type="button" className="ppt-slide-panel-close" onClick={() => setActive(null)}>
              <FiX size={16} />
            </button>
          </div>

          <div className="ppt-status-options">
            {PPT_SLIDE_STATUSES.map((opt) => {
              const selected = currentSlideStatus === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`ppt-status-option ${selected ? 'is-active' : ''}`}
                  disabled={disabled}
                  onClick={() => onChangeSlideStatus?.(opt.id)}
                >
                  <StatusDot id={opt.id} />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>

          <div className="ppt-slide-panel-section">
            <div className="ppt-status-row">
              <FiCheckCircle size={16} />
              <span>Deck: {String(deckStatus || 'READY')}</span>
            </div>
            <div className="ppt-status-row">
              <span>Elements: {(slide?.elements?.elements || []).length}</span>
            </div>
          </div>
        </div>
      )}

      {aiOpen && (
        <div className="ppt-ai-prompt-panel" role="dialog" aria-label="AI prompt">
          <div className="ppt-slide-panel-head">
            <strong>AI prompt</strong>
            <button type="button" className="ppt-slide-panel-close" onClick={() => setAiOpen(false)}>
              <FiX size={16} />
            </button>
          </div>
          {generationPrompt?.trim() ? (
            <p className="ppt-ai-prompt-body">{generationPrompt.trim()}</p>
          ) : (
            <p className="ppt-slide-panel-hint">
              No generation prompt was saved for this deck. Create via AI PPT wizard to capture one.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
