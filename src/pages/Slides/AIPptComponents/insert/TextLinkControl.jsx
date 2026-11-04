import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiExternalLink, FiLink } from 'react-icons/fi'
import { applyElementTextLink, elementTextHasLink, elementTextLink } from '../../../../utils/pptTextContent'
import { normalizeLinkHref, safeLinkHref } from '../../../../utils/textLinks'

const POP_WIDTH = 300
const POP_HEIGHT = 150

/**
 * Link button for text boxes: links the selected words (or the whole box when nothing is
 * selected) to a web address, or removes the link.
 */
export default function TextLinkControl({ element, disabled = false, onChange }) {
  // The element the popover was opened for: selecting another element closes it.
  const [openFor, setOpenFor] = useState(null)
  const [value, setValue] = useState('')
  const [current, setCurrent] = useState('')
  const [linked, setLinked] = useState(false)
  const [error, setError] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const popRef = useRef(null)
  const inputRef = useRef(null)
  const elementId = element?.id
  const open = openFor != null && openFor === elementId
  const setOpen = (value) => setOpenFor(value ? elementId : null)
  const hasLinks = (element?.content?.runs || []).some((run) => run?.href)

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      if (popRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return
      setOpenFor(null)
    }
    const onScroll = (e) => {
      if (popRef.current?.contains(e.target)) return
      setOpenFor(null)
    }
    const onResize = () => setOpenFor(null)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const openPopover = () => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) {
      const below = rect.bottom + 8
      setPos({
        top: below + POP_HEIGHT > window.innerHeight ? Math.max(8, rect.top - POP_HEIGHT - 8) : below,
        left: Math.min(Math.max(8, rect.left), window.innerWidth - POP_WIDTH - 8),
      })
    }
    const href = elementTextLink(element)
    setCurrent(href)
    setLinked(elementTextHasLink(element))
    setValue(href)
    setError('')
    setOpen(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }

  const apply = (e) => {
    e?.preventDefault()
    const href = normalizeLinkHref(value)
    if (!href) {
      setError(value.trim() ? 'That isn’t a web address. Try e.g. example.com' : 'Enter a web address')
      return
    }
    onChange?.(applyElementTextLink(element, href))
    setOpen(false)
  }

  const remove = () => {
    onChange?.(applyElementTextLink(element, ''))
    setOpen(false)
  }

  const openable = safeLinkHref(current)

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`ppt-element-toolbar-btn ${hasLinks ? 'is-active' : ''}`}
        disabled={disabled}
        title="Link (selected text, or the whole box)"
        aria-label="Link"
        aria-haspopup="dialog"
        aria-expanded={open}
        // Keep the text selection made in the box being edited.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (disabled) return
          if (open) setOpen(false)
          else openPopover()
        }}
      >
        <FiLink size={15} />
      </button>
      {open &&
        createPortal(
          <form
            ref={popRef}
            className="ppt-link-pop"
            role="dialog"
            aria-label="Link"
            style={{ top: pos.top, left: pos.left, width: POP_WIDTH }}
            onSubmit={apply}
            onKeyDown={(e) => {
              // Typing here mustn't reach the editor's shortcuts (Delete removes the element…).
              e.stopPropagation()
              if (e.key === 'Escape') {
                e.preventDefault()
                setOpen(false)
              }
            }}
          >
            <label className="ppt-link-pop-label" htmlFor={`ppt-link-${elementId}`}>
              Link to
            </label>
            <div className="ppt-link-pop-row">
              <input
                ref={inputRef}
                id={`ppt-link-${elementId}`}
                className="ppt-link-pop-input"
                type="text"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://example.com"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (error) setError('')
                }}
              />
              <button type="submit" className="ppt-link-pop-apply">
                Apply
              </button>
            </div>
            {error ? <p className="ppt-link-pop-error">{error}</p> : null}
            {linked ? (
              <div className="ppt-link-pop-actions">
                {openable ? (
                  <a className="ppt-link-pop-open" href={openable} target="_blank" rel="noopener noreferrer">
                    <FiExternalLink size={13} aria-hidden /> Open link
                  </a>
                ) : null}
                <button type="button" className="ppt-link-pop-remove" onClick={remove}>
                  Remove link
                </button>
              </div>
            ) : null}
          </form>,
          document.body
        )}
    </>
  )
}
