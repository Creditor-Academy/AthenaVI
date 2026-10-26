import { forwardRef, useCallback, useEffect, useRef } from 'react'
import {
  applyMarkdownToEditor,
  createMarkdownFragment,
  foldClosedMarkdownAtCaret,
  foldUnformattedTextNodes,
  placeCaretAtEnd,
  serializeEditorToMarkdown,
} from '../../../utils/markdownPrompt.jsx'
import './MarkdownPromptInput.css'

const MarkdownPromptInput = forwardRef(function MarkdownPromptInput(
  {
    value,
    onChange,
    onKeyDown,
    onPaste,
    onFocus,
    onInput,
    className = '',
    placeholder,
    autoFocus,
    disabled,
    id,
    maxLength,
    'aria-label': ariaLabel,
  },
  ref
) {
  const editorRef = useRef(null)
  const lastValueRef = useRef(value || '')

  const setEditorRef = useCallback(
    (el) => {
      editorRef.current = el
      if (el) {
        el.setSelectionRange = () => placeCaretAtEnd(el)
      }
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref]
  )

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const next = value || ''
    if (next === lastValueRef.current && el.childNodes.length) return
    lastValueRef.current = next
    applyMarkdownToEditor(el, next)
    placeCaretAtEnd(el)
  }, [value])

  useEffect(() => {
    if (!autoFocus) return
    editorRef.current?.focus()
  }, [autoFocus])

  const emitFromEditor = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    let md = serializeEditorToMarkdown(el)
    if (maxLength && md.length > maxLength) {
      md = md.slice(0, maxLength)
      applyMarkdownToEditor(el, md)
      placeCaretAtEnd(el)
    }
    lastValueRef.current = md
    onChange?.({ target: { value: md } })
  }, [maxLength, onChange])

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const observer = new MutationObserver(() => {
      const imgs = el.querySelectorAll('img')
      if (imgs.length) {
        imgs.forEach((img) => img.remove())
        emitFromEditor()
      }
    })
    observer.observe(el, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [emitFromEditor])

  const handleInput = useCallback(
    (e) => {
      const el = editorRef.current
      if (el) {
        const imgs = el.querySelectorAll('img')
        if (imgs.length) {
          imgs.forEach((img) => img.remove())
        }
      }
      foldClosedMarkdownAtCaret(editorRef.current)
      foldUnformattedTextNodes(editorRef.current)
      emitFromEditor()
      onInput?.(e)
    },
    [emitFromEditor, onInput]
  )

  const handlePaste = useCallback(
    (e) => {
      onPaste?.(e)
      if (e.defaultPrevented) return

      // Prevent browser default paste so raw HTML / <img> tags / image files are never inserted
      e.preventDefault()

      // Check for image files / clipboard image items
      const files = Array.from(e.clipboardData?.files || [])
      const items = Array.from(e.clipboardData?.items || [])
      const hasImage =
        files.some((f) => f.type?.startsWith('image/')) ||
        items.some((it) => it.type?.startsWith('image/') || (it.kind === 'file' && it.type?.startsWith('image/'))) ||
        Boolean(e.clipboardData?.types?.includes('Files'))

      if (hasImage) {
        // Explicitly block pasting image files/copied images
        return
      }

      // Extract ONLY plain text
      const text = e.clipboardData?.getData('text/plain') || ''
      if (!text || text.trim().startsWith('data:image/')) {
        // If an image or file with no plain text was pasted, ignore it completely
        return
      }

      const el = editorRef.current
      if (!el) return
      el.focus()
      const sel = el.ownerDocument.defaultView.getSelection()
      if (!sel) return
      if (!sel.rangeCount || (sel.anchorNode && !el.contains(sel.anchorNode) && sel.anchorNode !== el)) {
        placeCaretAtEnd(el)
      }
      const range = sel.getRangeAt(0)
      range.deleteContents()
      const frag = createMarkdownFragment(el.ownerDocument, text)
      const last = frag.lastChild
      range.insertNode(frag)
      if (last) {
        const after = el.ownerDocument.createRange()
        after.setStartAfter(last)
        after.collapse(true)
        sel.removeAllRanges()
        sel.addRange(after)
      }
      foldUnformattedTextNodes(el)
      emitFromEditor()
    },
    [emitFromEditor, onPaste]
  )

  const handleBeforeInput = useCallback(
    (e) => {
      if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
        const dt = e.dataTransfer
        if (dt) {
          const files = Array.from(dt.files || [])
          const items = Array.from(dt.items || [])
          const hasImage =
            files.some((f) => f.type?.startsWith('image/')) ||
            items.some((it) => it.type?.startsWith('image/') || (it.kind === 'file' && it.type?.startsWith('image/'))) ||
            Boolean(dt.types?.includes('Files'))
          if (hasImage) {
            e.preventDefault()
          }
        }
      }
    },
    []
  )

  const handleDrop = useCallback(
    (e) => {
      // Block dropping images or files into the prompt field
      e.preventDefault()

      const files = Array.from(e.dataTransfer?.files || [])
      const items = Array.from(e.dataTransfer?.items || [])
      const hasImage =
        files.some((f) => f.type?.startsWith('image/')) ||
        items.some((it) => it.type?.startsWith('image/') || (it.kind === 'file' && it.type?.startsWith('image/'))) ||
        Boolean(e.dataTransfer?.types?.includes('Files'))

      if (hasImage) return

      const text = e.dataTransfer?.getData('text/plain') || ''
      if (!text.trim() || text.trim().startsWith('data:image/')) return

      const el = editorRef.current
      if (!el) return
      el.focus()
      const sel = el.ownerDocument.defaultView.getSelection()
      if (!sel) return
      if (!sel.rangeCount || (sel.anchorNode && !el.contains(sel.anchorNode) && sel.anchorNode !== el)) {
        placeCaretAtEnd(el)
      }
      const range = sel.getRangeAt(0)
      range.deleteContents()
      const frag = createMarkdownFragment(el.ownerDocument, text)
      const last = frag.lastChild
      range.insertNode(frag)
      if (last) {
        const after = el.ownerDocument.createRange()
        after.setStartAfter(last)
        after.collapse(true)
        sel.removeAllRanges()
        sel.addRange(after)
      }
      foldUnformattedTextNodes(el)
      emitFromEditor()
    },
    [emitFromEditor]
  )

  const handleDragOver = useCallback((e) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
    }
  }, [])

  return (
    <div className={`aig-md-field ${className}`.trim()}>
      {!String(value || '').trim() && (
        <span className="aig-md-placeholder">{placeholder}</span>
      )}
      <div
        id={id}
        ref={setEditorRef}
        className="aig-md-editor"
        contentEditable={!disabled}
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        suppressContentEditableWarning
        onInput={handleInput}
        onBeforeInput={handleBeforeInput}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
    </div>
  )
})

export default MarkdownPromptInput
