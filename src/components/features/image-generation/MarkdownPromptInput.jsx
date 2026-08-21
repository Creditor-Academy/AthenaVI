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

  const handleInput = useCallback(
    (e) => {
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
      const text = e.clipboardData?.getData('text/plain') || ''
      if (!text) return
      e.preventDefault()
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
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
      />
    </div>
  )
})

export default MarkdownPromptInput
