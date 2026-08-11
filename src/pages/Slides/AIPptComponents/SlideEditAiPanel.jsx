import { useEffect, useRef, useState } from 'react'
import {
  FiPlus,
  FiArrowUp,
  FiEdit3,
  FiCheckCircle,
  FiGlobe,
  FiAlignLeft,
  FiAlignCenter,
  FiMessageCircle,
  FiCrosshair,
  FiImage,
  FiBarChart2,
  FiGrid,
  FiX,
} from 'react-icons/fi'
import { BsStars } from 'react-icons/bs'
import { MdOutlineAutoAwesome } from 'react-icons/md'
import './SlideEditAiPanel.css'

export const SLIDE_AI_ACTIONS = {
  'try-new-layout': {
    label: 'Try new layout',
    prompt: 'Try a new layout for this slide while keeping the same message.',
    target: 'full',
    primary: true,
  },
  'improve-writing': {
    label: 'Improve writing',
    prompt: 'Improve the writing on this slide.',
    section: 'writing',
  },
  'fix-spelling': {
    label: 'Fix spelling & grammar',
    prompt: 'Fix spelling and grammar on this slide.',
    section: 'writing',
  },
  translate: {
    label: 'Translate',
    prompt: 'Translate this slide.',
    section: 'writing',
  },
  'make-longer': {
    label: 'Make longer',
    prompt: 'Make the content on this slide longer.',
    section: 'writing',
  },
  'make-shorter': {
    label: 'Make shorter',
    prompt: 'Make the content on this slide shorter.',
    section: 'writing',
  },
  'simplify-language': {
    label: 'Simplify language',
    prompt: 'Simplify the language on this slide.',
    section: 'writing',
  },
  'be-more-specific': {
    label: 'Be more specific',
    prompt: 'Be more specific and add useful detail to this slide.',
    section: 'writing',
  },
  'make-visual': {
    label: 'Make this more visual',
    prompt: 'Make this slide more visual with stronger layout and imagery.',
    section: 'image',
  },
  'add-image': {
    label: 'Add an image',
    prompt: 'Add a relevant image to this slide.',
    section: 'image',
  },
  'add-chart': {
    label: 'Add a chart',
    prompt: 'Add a chart that supports the message on this slide.',
    section: 'image',
  },
}

const WRITING_ACTIONS = [
  { id: 'improve-writing', Icon: FiEdit3 },
  { id: 'fix-spelling', Icon: FiCheckCircle },
  { id: 'translate', Icon: FiGlobe },
  { id: 'make-longer', Icon: FiAlignLeft },
  { id: 'make-shorter', Icon: FiAlignCenter },
  { id: 'simplify-language', Icon: FiMessageCircle },
  { id: 'be-more-specific', Icon: FiCrosshair },
]

const IMAGE_ACTIONS = [
  { id: 'make-visual', Icon: FiGrid },
  { id: 'add-image', Icon: FiImage },
  { id: 'add-chart', Icon: FiBarChart2 },
]

function ActionPills({ actions, disabled, busy, onAction }) {
  return (
    <div className="ppt-slide-ai-pills">
      {actions.map(({ id, Icon }) => (
        <button
          key={id}
          type="button"
          className="ppt-slide-ai-pill"
          disabled={disabled || busy}
          onClick={() => onAction(id)}
        >
          <Icon size={13} aria-hidden />
          <span>{SLIDE_AI_ACTIONS[id].label}</span>
        </button>
      ))}
    </div>
  )
}

export default function SlideEditAiPanel({
  open,
  slideTitle = '',
  disabled = false,
  busy = false,
  onClose,
  onSubmit,
}) {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setPrompt('')
      return undefined
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => textareaRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [open, onClose])

  if (!open) return null

  const canSend = prompt.trim().length > 0 && !disabled && !busy

  const runAction = (actionId) => {
    if (disabled || busy) return
    const action = SLIDE_AI_ACTIONS[actionId]
    if (!action) return
    onSubmit?.({
      actionId,
      prompt: action.prompt,
      target: action.target || 'full',
    })
  }

  const handleSend = () => {
    if (!canSend) return
    onSubmit?.({
      actionId: 'custom',
      prompt: prompt.trim(),
      target: 'full',
    })
  }

  const stopBubble = (e) => {
    e.stopPropagation()
  }

  return (
    <div
      className="ppt-slide-ai-overlay"
      role="presentation"
      onMouseDown={stopBubble}
      onClick={stopBubble}
    >
      <div className="ppt-slide-ai-panel" role="dialog" aria-modal="true" aria-label="Edit this slide">
        <div className="ppt-slide-ai-badge" aria-hidden>
          <BsStars size={13} />
        </div>

        <div className="ppt-slide-ai-head">
          <div className="ppt-slide-ai-head-text">
            <h3 className="ppt-slide-ai-title">Edit this slide</h3>
            {slideTitle ? <p className="ppt-slide-ai-subtitle">{slideTitle}</p> : null}
          </div>
          <button
            type="button"
            className="ppt-slide-ai-close"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="ppt-slide-ai-input-wrap">
          <textarea
            ref={textareaRef}
            className="ppt-slide-ai-input"
            placeholder="How would you like to edit this slide?"
            value={prompt}
            disabled={disabled || busy}
            rows={2}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            onMouseDown={stopBubble}
            onClick={stopBubble}
          />
          <div className="ppt-slide-ai-input-actions">
            <button
              type="button"
              className="ppt-slide-ai-icon-btn"
              title="Add context"
              disabled={disabled || busy}
              aria-label="Add context"
            >
              <FiPlus size={14} />
            </button>
            <button
              type="button"
              className={`ppt-slide-ai-send-btn ${canSend ? 'is-ready' : ''}`}
              title="Send"
              disabled={!canSend}
              aria-label="Send edit request"
              onClick={handleSend}
            >
              <FiArrowUp size={14} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="ppt-slide-ai-primary-action"
          disabled={disabled || busy}
          onClick={() => runAction('try-new-layout')}
        >
          <MdOutlineAutoAwesome size={14} />
          Try new layout
        </button>

        <div className="ppt-slide-ai-section">
          <div className="ppt-slide-ai-section-label">Writing</div>
          <ActionPills
            actions={WRITING_ACTIONS}
            disabled={disabled}
            busy={busy}
            onAction={runAction}
          />
        </div>

        <div className="ppt-slide-ai-section">
          <div className="ppt-slide-ai-section-label">Image</div>
          <ActionPills
            actions={IMAGE_ACTIONS}
            disabled={disabled}
            busy={busy}
            onAction={runAction}
          />
        </div>

        {busy && <div className="ppt-slide-ai-busy">Applying AI edit…</div>}
      </div>
    </div>
  )
}
