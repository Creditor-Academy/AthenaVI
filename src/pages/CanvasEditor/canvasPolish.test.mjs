import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import test from 'node:test'
import PptCanvasElement from '../Slides/AIPptComponents/PptCanvasElement.jsx'
import { createElement, createPage } from './canvasDocument.js'
import { tabTarget } from './canvasDialogFocus.js'
import { CANVAS_SHORTCUTS, isShortcutHelpKey } from './canvasShortcuts.js'
import { CANVAS_MIN_WIDTH, NARROW_CANVAS_MESSAGE, canvasViewportSupported } from './canvasViewport.js'
import { pageCoverDataUrl } from './canvasThumbnail.js'

/** Element types the canvas editor inserts and PptCanvasElement renders. */
const CANVAS_ELEMENT_TYPES = [
  'text',
  'textbox',
  'image',
  'icon',
  'graphic',
  'shape',
  'chart',
  'table',
  'embed',
  'group',
]

const PALETTE = {
  bg: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#172033',
  title: '#172033',
  accent: '#2563EB',
}

function elementFor(type, page) {
  const content = {}
  if (type === 'chart') {
    content.chartType = 'column'
    content.labels = ['A', 'B']
    content.series = [{ name: 'Series', values: [2, 4] }]
  }
  if (type === 'table') content.cells = [['H'], ['Cell']]
  if (type === 'embed') content.url = 'https://example.com'
  if (type === 'shape') content.fill = '#2563EB'
  if (type === 'graphic') content.url = 'https://example.com/mark.svg'
  return createElement({ type, content }, page, 0, { id: `element-${type}` })
}

test('tab moves through a dialog and wraps', () => {
  const items = ['a', 'b', 'c']
  assert.equal(tabTarget(items, 'a', false), 'b')
  assert.equal(tabTarget(items, 'c', false), 'a')
  assert.equal(tabTarget(items, 'a', true), 'c')
  assert.equal(tabTarget(items, 'outside', false), 'a')
})

test('question mark opens the shortcut list and the list matches the handler', () => {
  assert.equal(isShortcutHelpKey({ key: '?', shiftKey: true }), true)
  assert.equal(isShortcutHelpKey({ key: 'k', ctrlKey: true }), false)
  assert.equal(isShortcutHelpKey({ key: '?', ctrlKey: true }), false)
  const source = readFileSync(new URL('./CanvasEditor.jsx', import.meta.url), 'utf8')
  const handler = source.slice(source.indexOf('Comprehensive Keyboard Shortcuts'))
  for (const fragment of ['undo()', 'redo()', 'setQuickMenuOpen', 'setZoom', 'copySelection', 'cutSelection', 'pasteClipboard', 'duplicateSelection', 'groupSelection', 'ungroupSelection', 'toggleLock', 'deleteElements', 'bringForward', 'bringToFront', 'sendBackward', 'sendToBack']) {
    assert.ok(handler.includes(fragment), fragment)
  }
  assert.ok(CANVAS_SHORTCUTS.some((item) => item.keys === '?'))
  assert.ok(source.includes('isShortcutHelpKey'))
})

test('a narrow window is below the supported width', () => {
  assert.equal(canvasViewportSupported(CANVAS_MIN_WIDTH), true)
  assert.equal(canvasViewportSupported(CANVAS_MIN_WIDTH - 1), false)
  assert.equal(NARROW_CANVAS_MESSAGE, 'Canvas Editor works best on a larger screen')
})

test('a page card cover draws elements, not only the background', () => {
  const page = createPage()
  page.elements = [createElement({ type: 'shape', content: { fill: '#2563EB' } }, page, 0, { id: 'shape-1' })]
  const url = pageCoverDataUrl(page)
  assert.match(url, /^data:image\/svg\+xml/)
  const svg = decodeURIComponent(url.split(',')[1])
  assert.match(svg, /#2563EB/i)
})

test('every canvas element type renders through the shared stage renderer', () => {
  const page = createPage()
  for (const type of CANVAS_ELEMENT_TYPES) {
    const el = elementFor(type, page)
    const html = renderToStaticMarkup(h(PptCanvasElement, {
      el,
      palette: PALETTE,
      canvasW: page.width,
      selected: false,
      editable: false,
      editingText: false,
      showEmptyTextHint: false,
    }))
    assert.equal(typeof html, 'string', type)
    assert.ok(html.length > 0, type)
  }
})
