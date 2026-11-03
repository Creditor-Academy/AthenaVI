/**
 * Shared behaviour for editable text boxes (slide editor + canvas editor):
 *  - pasting comes in as plain text in the box's own style, never as foreign HTML
 *  - resizing a text box can never crop its text
 */

const ZERO_WIDTH = /\u200B|\u200C|\u200D|\u2060|\uFEFF/g
const BLOCK_TAGS = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT', 'FIGCAPTION', 'FIGURE',
  'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P',
  'PRE', 'SECTION', 'TABLE', 'TR', 'UL',
])
const SKIP_TAGS = new Set(['HEAD', 'META', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'TEMPLATE', 'TITLE'])

/**
 * Clean clipboard text before it goes into a text box. Copies from docs, chat apps and web
 * pages carry blank lines around and between paragraphs; inside a box those render as empty
 * space above the text and push the rest out of view.
 */
export function normalizePastedText(raw) {
  const text = String(raw ?? '')
    .replace(/\r\n?|[\u2028\u2029]/g, '\n')
    .replace(ZERO_WIDTH, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
  return text.replace(/^\n+/, '').replace(/\n+$/, '')
}

/** Fallback for clipboards that only offer HTML: block-aware text extraction. */
export function htmlToPlainText(html) {
  const source = String(html ?? '')
  if (!source) return ''
  if (typeof DOMParser === 'undefined') {
    return source
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)\b[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  }
  const doc = new DOMParser().parseFromString(source, 'text/html')
  let out = ''
  const breakLine = () => {
    if (out && !out.endsWith('\n')) out += '\n'
  }
  const walk = (node) => {
    if (node.nodeType === 3) {
      // HTML source whitespace is not significant: collapse it like a browser would, and
      // drop the indentation/newline nodes that sit between blocks.
      const chunk = (node.nodeValue || '').replace(/\s+/g, ' ')
      if (chunk === ' ' && (!out || out.endsWith('\n'))) return
      out += chunk
      return
    }
    if (node.nodeType !== 1) return
    const tag = node.tagName
    if (SKIP_TAGS.has(tag)) return
    if (tag === 'BR') {
      out += '\n'
      return
    }
    const block = BLOCK_TAGS.has(tag)
    if (block) breakLine()
    node.childNodes.forEach(walk)
    if (block) breakLine()
  }
  walk(doc.body)
  return out.replace(/^ +| +$/gm, '')
}

/** Plain text from a paste/drop DataTransfer (text/plain preferred, HTML as fallback). */
export function clipboardPlainText(data) {
  if (!data) return ''
  const plain = data.getData('text/plain')
  if (plain) return normalizePastedText(plain)
  return normalizePastedText(htmlToPlainText(data.getData('text/html')))
}

/**
 * Insert text at the caret of a focused contentEditable. `insertText` keeps native undo and
 * picks up the style of the text around the caret; the manual path is only for browsers
 * that refuse the command.
 */
export function insertPlainTextAtCaret(root, text) {
  if (!root || !text) return
  if (typeof document.execCommand === 'function') {
    try {
      if (document.execCommand('insertText', false, text)) return
    } catch {
      /* fall through */
    }
  }
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return
  range.deleteContents()
  const node = document.createTextNode(text)
  range.insertNode(node)
  range.setStartAfter(node)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
  root.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }))
}

/** True when the selection covers all of `root`'s text (Ctrl+A), or the box is empty. */
export function selectionCoversWholeBox(root) {
  if (!root) return false
  const total = (root.textContent || '').length
  if (!total) return true
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return false
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer) && range.commonAncestorContainer !== root) return false
  const before = document.createRange()
  before.selectNodeContents(root)
  before.setEnd(range.startContainer, range.startOffset)
  return before.toString().length === 0 && range.toString().length >= total
}

const RUN_FORMAT_STYLES = ['fontWeight', 'fontStyle', 'fontFamily', 'textDecoration', 'textDecorationLine']

/**
 * Replace everything in the box with `text` in the box's own style. The browser's insertText
 * would carry over the formatting of the first replaced character, so text pasted over a box
 * that starts with a bold word came out bold. The colour of that first character is kept —
 * a box coloured as a whole keeps its colour.
 */
export function replaceBoxWithPlainText(root, text) {
  if (!root) return
  const first = root.querySelector('span')
  const span = first ? first.cloneNode(false) : document.createElement('span')
  for (const prop of RUN_FORMAT_STYLES) span.style[prop] = ''
  delete span.dataset.run
  span.textContent = text
  root.replaceChildren(span)
  const sel = window.getSelection()
  if (sel) {
    const range = document.createRange()
    range.selectNodeContents(root)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  }
  root.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }))
}

/**
 * paste handler for the text box editor: always plain text, never images or foreign markup.
 * Pasting over the whole box gives normal text in the box's style; pasting inside the text
 * takes the style of the text around the caret, like any editor.
 */
export function handlePlainTextPaste(event) {
  const data = event?.clipboardData
  if (!data) return
  event.preventDefault()
  const text = clipboardPlainText(data)
  if (!text) return
  const root = event.currentTarget
  if (selectionCoversWholeBox(root)) {
    replaceBoxWithPlainText(root, text)
    return
  }
  insertPlainTextAtCaret(root, text)
}

/**
 * Layout-bound text (generated slide slots) shrinks its font to fit its box, so it may be
 * sized freely. Every other text box keeps its full text visible.
 */
export function textBoxShrinksToFit(el) {
  return Boolean(el?.slotId) && el?.content?.fit !== false
}

/**
 * Builds `(width) => minHeight` (canvas units) for a text box shell: the height its text needs
 * when laid out at `width`. Measures a hidden copy of the rendered text, so wrapping, fonts,
 * lists and padding match exactly what is on screen. Returns null when it can't measure.
 */
export function createTextHeightFloor(shell, startWidth, { paddingPx = 4 } = {}) {
  if (!shell || !(startWidth > 0)) return null
  const display = shell.querySelector('.ppt-text-display')
  const host = display?.parentNode
  if (!display || !host) return null
  // Curved text is drawn as SVG scaled to the box; it has no natural height.
  if (display.querySelector(':scope > svg')) return null
  const layoutWidth = shell.offsetWidth
  if (!layoutWidth) return null
  const pxPerUnit = layoutWidth / startWidth
  const cache = new Map()
  return (width) => {
    const key = Math.max(1, Math.round(width))
    if (cache.has(key)) return cache.get(key)
    const probe = display.cloneNode(true)
    Object.assign(probe.style, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: `${key * pxPerUnit}px`,
      maxWidth: 'none',
      height: 'auto',
      minHeight: '0px',
      overflow: 'visible',
      visibility: 'hidden',
      pointerEvents: 'none',
    })
    probe.setAttribute('aria-hidden', 'true')
    host.appendChild(probe)
    const needed = probe.scrollHeight
    probe.remove()
    const min = needed > 0 ? Math.ceil((needed + paddingPx) / pxPerUnit) : 0
    cache.set(key, min)
    return min
  }
}

/**
 * Height (CSS px) the text of a rendered text node needs at its current width, measured on a
 * hidden copy laid out with `height: auto`. The node's own scrollHeight can't be used: a box
 * taller than its text reports the box height, so "grow to fit" grew it a little every time.
 */
export function measureNeededTextHeight(node) {
  const host = node?.parentNode
  if (!node || !host || !node.offsetWidth) return null
  const probe = node.cloneNode(true)
  Object.assign(probe.style, {
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: `${node.offsetWidth}px`,
    maxWidth: 'none',
    height: 'auto',
    minHeight: '0px',
    overflow: 'visible',
    visibility: 'hidden',
    pointerEvents: 'none',
  })
  probe.setAttribute('aria-hidden', 'true')
  host.appendChild(probe)
  const needed = probe.scrollHeight
  probe.remove()
  return needed > 0 ? needed : null
}

/** Another element's shell rendered next to `shell` (same page/slide layer), by element id. */
export function findSiblingShell(shell, id) {
  const host = shell?.parentElement
  if (!host || !id) return null
  for (const node of host.children) {
    if (node.dataset?.elementId === id) return node
  }
  return null
}

/**
 * Keep a resized text box at least as tall as its text. Handles that move the top edge keep
 * the bottom edge where it is; every other handle grows the box downwards.
 */
export function keepTextBoxTallEnough(next, start, handle, minHeight) {
  if (!next || !(minHeight > 0) || next.height >= minHeight) return next
  const height = minHeight
  const movesTop = typeof handle === 'string' && handle.startsWith('n')
  const y = movesTop ? (start.y || 0) + (start.height || 0) - height : next.y
  return { ...next, height, y }
}
