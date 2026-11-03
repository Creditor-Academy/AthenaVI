import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { imageFilesFromDataTransfer } from '../utils/imageUploadFormat'

/** Marks the system clipboard as holding elements copied in the editor. */
export const ELEMENTS_CLIPBOARD_TYPE = 'application/x-athena-elements'

const TYPING_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [contenteditable=""], .ppt-text-editable'

export function isTypingTarget(node) {
  if (!node || node.nodeType !== 1) return false
  if (node.isContentEditable) return true
  return Boolean(node.closest?.(TYPING_SELECTOR))
}

/**
 * Copy/paste between the slide/page and the system clipboard.
 *
 * The editors used to swallow Ctrl+V and only paste elements copied inside the editor, so an
 * image copied from a browser, a screenshot or a file manager could never be pasted. Now the
 * browser's paste event is used: images on the clipboard are inserted, and elements copied in
 * the editor still paste as before. Copying elements writes a marker to the system clipboard,
 * so whichever was copied last — elements here or an image elsewhere — is what gets pasted.
 */
export function useEditorClipboard({ enabled = true, hasElements, onPasteElements, onPasteImages }) {
  const latest = useRef({ enabled, hasElements, onPasteElements, onPasteImages })
  useLayoutEffect(() => {
    latest.current = { enabled, hasElements, onPasteElements, onPasteImages }
  })
  const pendingCopyRef = useRef(null)
  // false when the last element copy could not mark the system clipboard (browser fired no
  // copy event): the clipboard can't tell us what is newer, so the editor's elements win.
  const markedRef = useRef(true)
  const expectPasteRef = useRef(0)

  /** Call right after copying elements into the editor's own clipboard. */
  const noteElementCopy = useCallback((plainText = '') => {
    pendingCopyRef.current = { text: plainText || ' ' }
    markedRef.current = false
    // Keyboard copy: the browser fires `copy` next. Menu copy: trigger it ourselves.
    setTimeout(() => {
      pendingCopyRef.current = null
    }, 0)
  }, [])

  const copyFromMenu = useCallback(
    (plainText = '') => {
      noteElementCopy(plainText)
      try {
        document.execCommand('copy')
      } catch {
        /* the editor's own clipboard still holds the elements */
      }
    },
    [noteElementCopy]
  )

  /**
   * Keyboard Ctrl+V outside a text field: let the browser's paste event decide. If no paste
   * event arrives (some browsers fire none without an editable focus), paste elements.
   */
  const expectPaste = useCallback(() => {
    const ticket = Date.now()
    expectPasteRef.current = ticket
    setTimeout(() => {
      if (expectPasteRef.current !== ticket) return
      expectPasteRef.current = 0
      const { enabled: on, hasElements: has, onPasteElements: paste } = latest.current
      if (on && has?.()) paste?.()
    }, 150)
  }, [])

  useEffect(() => {
    const onCopy = (e) => {
      const pending = pendingCopyRef.current
      if (!pending || !e.clipboardData) return
      pendingCopyRef.current = null
      try {
        e.clipboardData.setData('text/plain', pending.text)
        e.clipboardData.setData(ELEMENTS_CLIPBOARD_TYPE, String(Date.now()))
        e.preventDefault()
        markedRef.current = true
      } catch {
        markedRef.current = false
      }
    }

    const onPaste = (e) => {
      const { enabled: on, hasElements: has, onPasteElements: pasteElements, onPasteImages: pasteImages } =
        latest.current
      if (!on || e.defaultPrevented) return
      if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) return
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      expectPasteRef.current = 0
      const data = e.clipboardData
      const types = Array.from(data?.types || [])
      const internal = Boolean(has?.())
      const images = imageFilesFromDataTransfer(data)
      if (internal && (types.includes(ELEMENTS_CLIPBOARD_TYPE) || !markedRef.current)) {
        e.preventDefault()
        pasteElements?.()
        return
      }
      if (images.length && pasteImages) {
        e.preventDefault()
        pasteImages(images)
        return
      }
      if (internal) {
        e.preventDefault()
        pasteElements?.()
      }
    }

    // Ctrl+X fires `cut`, not `copy`: mark the clipboard for both.
    window.addEventListener('copy', onCopy)
    window.addEventListener('cut', onCopy)
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('copy', onCopy)
      window.removeEventListener('cut', onCopy)
      window.removeEventListener('paste', onPaste)
    }
  }, [])

  return useMemo(
    () => ({ noteElementCopy, copyFromMenu, expectPaste }),
    [noteElementCopy, copyFromMenu, expectPaste]
  )
}

/**
 * While an editor is open, a file dropped anywhere that doesn't take it (side panels, the
 * gap around the page) is ignored instead of the browser opening it and leaving the editor.
 */
export function useBlockStrayFileDrops(active = true) {
  useEffect(() => {
    if (!active) return undefined
    const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files')
    const onDragOver = (e) => {
      if (e.defaultPrevented || !hasFiles(e)) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'none'
    }
    const onDrop = (e) => {
      if (e.defaultPrevented || !hasFiles(e)) return
      e.preventDefault()
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [active])
}

/** Text of copied text elements, so pasting into another app gives something sensible. */
export function copiedElementsText(elements = []) {
  return elements
    .map((el) => {
      const c = el?.content || {}
      if (typeof c.text === 'string') return c.text
      if (Array.isArray(c.runs)) return c.runs.map((run) => run?.text || '').join('')
      return ''
    })
    .filter((text) => text.trim())
    .join('\n')
}
