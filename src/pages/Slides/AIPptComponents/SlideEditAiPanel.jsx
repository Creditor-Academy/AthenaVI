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
  FiRefreshCw,
  FiX,
  FiFileText,
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

// Backend caps the slide AI prompt (slideAiPromptField) at 2000 characters.
const MAX_PROMPT_LENGTH = 2000
const CONTEXT_HEADER = '\n\nAdditional context:\n'
const CONTEXT_ONLY_PROMPT = 'Update this slide using the additional context below.'
const CONTEXT_FILE_ACCEPT = '.txt,.md,.markdown,.csv,.json,text/plain,text/markdown,text/csv,application/json'

function buildPromptWithContext(prompt, context) {
  const base = prompt || CONTEXT_ONLY_PROMPT
  if (!context?.text) return base
  const room = MAX_PROMPT_LENGTH - base.length - CONTEXT_HEADER.length
  if (room <= 0) return base.slice(0, MAX_PROMPT_LENGTH)
  return `${base}${CONTEXT_HEADER}${context.text.slice(0, room)}`
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
  onRegenerate,
}) {
  const [prompt, setPrompt] = useState('')
  const [context, setContext] = useState(null)
  const [contextError, setContextError] = useState('')
  const textareaRef = useRef(null)
  const contextInputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setPrompt('')
      setContext(null)
      setContextError('')
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

  const canSend = (prompt.trim().length > 0 || Boolean(context)) && !disabled && !busy
  const contextTrimmed = Boolean(
    context &&
      (prompt.trim() || CONTEXT_ONLY_PROMPT).length + CONTEXT_HEADER.length + context.text.length >
        MAX_PROMPT_LENGTH
  )

  const runAction = (actionId) => {
    if (disabled || busy) return
    const action = SLIDE_AI_ACTIONS[actionId]
    if (!action) return
    onSubmit?.({
      actionId,
      prompt: buildPromptWithContext(action.prompt, context),
      target: action.target || 'full',
    })
  }

  const handleSend = () => {
    if (!canSend) return
    onSubmit?.({
      actionId: 'custom',
      prompt: buildPromptWithContext(prompt.trim(), context),
      target: 'full',
    })
  }

  const handleContextFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setContextError('')
    try {
      const text = (await file.text()).replace(/\s+\n/g, '\n').trim()
      if (!text) {
        setContextError('That file has no readable text.')
        return
      }
      setContext({ name: file.name, text })
      textareaRef.current?.focus()
    } catch {
      setContextError('Could not read that file. Use a .txt, .md, .csv or .json file.')
    }
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
              title="Add context from a text file"
              disabled={disabled || busy}
              aria-label="Add context"
              onClick={() => contextInputRef.current?.click()}
            >
              <FiPlus size={14} />
            </button>
            <input
              ref={contextInputRef}
              type="file"
              accept={CONTEXT_FILE_ACCEPT}
              hidden
              onChange={handleContextFile}
            />
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

        {context && (
          <div className="ppt-slide-ai-context">
            <FiFileText size={13} aria-hidden />
            <span className="ppt-slide-ai-context-name" title={context.name}>
              {context.name}
            </span>
            {contextTrimmed ? <span className="ppt-slide-ai-context-note">trimmed to fit</span> : null}
            <button
              type="button"
              className="ppt-slide-ai-context-remove"
              aria-label="Remove context"
              disabled={busy}
              onClick={() => setContext(null)}
            >
              <FiX size={12} />
            </button>
          </div>
        )}
        {contextError && <p className="ppt-slide-ai-context-error">{contextError}</p>}

        <button
          type="button"
          className="ppt-slide-ai-primary-action"
          disabled={disabled || busy}
          onClick={() => runAction('try-new-layout')}
        >
          <MdOutlineAutoAwesome size={14} />
          Try new layout
        </button>

        {onRegenerate && (
          <button
            type="button"
            className="ppt-slide-ai-primary-action"
            disabled={disabled || busy}
            onClick={() => onRegenerate()}
          >
            <FiRefreshCw size={14} />
            Regenerate slide
          </button>
        )}

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
