import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Loader2, Plus } from 'lucide-react'
import './ModalSelect.css'

function ModalSelect({
  id,
  label,
  helper,
  icon: Icon,
  value,
  options = [],
  placeholder = 'Select an option',
  emptyLabel = 'No options available',
  loading = false,
  disabled = false,
  open = false,
  onOpenChange,
  onChange,
  createActionLabel = '',
  onCreateAction,
}) {
  const listId = useId()
  const rootRef = useRef(null)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const selected = options.find((item) => String(item.id) === String(value)) || null
  const hasCreate = Boolean(createActionLabel && onCreateAction)
  const createIndex = 0
  const optionOffset = hasCreate ? 1 : 0
  const maxIndex = hasCreate ? options.length : options.length - 1

  useEffect(() => {
    if (!open) {
      setHighlightIndex(-1)
      return undefined
    }

    const selectedIndex = options.findIndex((item) => String(item.id) === String(value))
    if (selectedIndex >= 0) {
      setHighlightIndex(selectedIndex + optionOffset)
    } else if (hasCreate) {
      setHighlightIndex(createIndex)
    } else if (options.length) {
      setHighlightIndex(0)
    } else {
      setHighlightIndex(-1)
    }

    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        onOpenChange?.(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onOpenChange?.(false)
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleEscape, true)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [open, options, value, onOpenChange, hasCreate, createIndex, optionOffset])

  useEffect(() => {
    if (disabled || loading) onOpenChange?.(false)
  }, [disabled, loading, onOpenChange])

  const selectAt = (index) => {
    if (hasCreate && index === createIndex) {
      onCreateAction?.()
      onOpenChange?.(false)
      return
    }

    const item = options[index - optionOffset]
    if (!item) return
    onChange?.(item.id)
    onOpenChange?.(false)
  }

  const handleKeyDown = (event) => {
    if (disabled || loading) return

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      if (!open) {
        event.preventDefault()
        onOpenChange?.(true)
        return
      }
    }

    if (!open) return

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onOpenChange?.(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((prev) => {
        if (maxIndex < 0) return -1
        return prev < maxIndex ? prev + 1 : 0
      })
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((prev) => {
        if (maxIndex < 0) return -1
        return prev > 0 ? prev - 1 : maxIndex
      })
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (highlightIndex >= 0) selectAt(highlightIndex)
    }
  }

  return (
    <div
      className={`modal-select ${open ? 'is-open' : ''} ${disabled || loading ? 'is-disabled' : ''}`}
      ref={rootRef}
    >
      {(label || helper) && (
        <div className="modal-select-meta">
          {label && (
            <label className="modal-select-label" htmlFor={id}>
              {label}
            </label>
          )}
          {helper && <span className="modal-select-helper">{helper}</span>}
        </div>
      )}

      <button
        id={id}
        type="button"
        className={`modal-select-trigger ${!selected && !loading ? 'is-placeholder' : ''}`}
        onClick={() => {
          if (!disabled && !loading) onOpenChange?.(!open)
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className="modal-select-trigger-main">
          <span className="modal-select-icon" aria-hidden="true">
            {loading ? (
              <Loader2 size={16} className="modal-select-spin" />
            ) : Icon ? (
              <Icon size={16} />
            ) : null}
          </span>
          <span className="modal-select-copy">
            <span className="modal-select-value">
              {loading ? 'Loading…' : selected?.name || placeholder}
            </span>
            {selected && !loading && <span className="modal-select-sub">Selected</span>}
          </span>
        </span>
        <ChevronDown size={17} className="modal-select-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="modal-select-menu" role="listbox" id={listId} aria-label={label || 'Options'}>
          {hasCreate && (
            <>
              <button
                type="button"
                role="option"
                aria-selected={false}
                className={[
                  'modal-select-option',
                  'modal-select-option-create',
                  highlightIndex === createIndex ? 'is-highlighted' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setHighlightIndex(createIndex)}
                onClick={() => selectAt(createIndex)}
              >
                <span className="modal-select-option-icon" aria-hidden="true">
                  <Plus size={15} />
                </span>
                <span className="modal-select-option-text">{createActionLabel}</span>
              </button>
              {options.length > 0 && <div className="modal-select-divider" role="separator" />}
            </>
          )}
          {!options.length && <div className="modal-select-empty">{emptyLabel}</div>}
          {options.map((item, index) => {
            const optionIndex = index + optionOffset
            const isActive = String(item.id) === String(value)
            const isHighlighted = optionIndex === highlightIndex
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={[
                  'modal-select-option',
                  isActive ? 'is-active' : '',
                  isHighlighted ? 'is-highlighted' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setHighlightIndex(optionIndex)}
                onClick={() => selectAt(optionIndex)}
              >
                <span className="modal-select-option-icon" aria-hidden="true">
                  {Icon ? <Icon size={15} /> : null}
                </span>
                <span className="modal-select-option-text">{item.name}</span>
                {isActive && <Check size={15} className="modal-select-check" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ModalSelect
