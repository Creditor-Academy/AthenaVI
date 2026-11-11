#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/utils/export/slideSelection.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  exportPrefsKey,
  extractSlideElements,
  formatPageRange,
  getSlideTitle,
  imagePixelSize,
  loadExportPrefs,
  pageNumbersFromSlideIds,
  parsePageRange,
  resolveExportSelection,
  saveExportPrefs,
  shouldCaptureInBrowser,
  slideIdsFromPageNumbers,
  slideImageFilename,
  toggleSlideSelection,
} from './slideSelection.js'
import { readStoredZip, zipStoredFiles } from './zip.js'

const slides = ['a', 'b', 'c', 'd', 'e'].map((id, order) => ({ id, order }))

function memoryStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    map,
  }
}

describe('which slides an export covers', () => {
  it('all slides sends no list (the whole deck)', () => {
    assert.deepEqual(resolveExportSelection({ scope: 'all', slides }), { slideIds: null, count: 5, error: null })
  })

  it('current slide is just that slide, and needs one', () => {
    assert.deepEqual(resolveExportSelection({ scope: 'current', slides, currentSlideId: 'c' }).slideIds, ['c'])
    assert.ok(resolveExportSelection({ scope: 'current', slides, currentSlideId: null }).error)
    assert.ok(resolveExportSelection({ scope: 'current', slides, currentSlideId: 'gone' }).error)
  })

  it('chosen slides come back in deck order, whatever order they were clicked', () => {
    const r = resolveExportSelection({ scope: 'custom', slides, selectedIds: ['e', 'b', 'd'] })
    assert.deepEqual(r.slideIds, ['b', 'd', 'e'])
    assert.equal(r.count, 3)
  })

  it('an empty choice is an error; ids no longer in the deck are dropped', () => {
    assert.equal(resolveExportSelection({ scope: 'custom', slides, selectedIds: [] }).error, 'Select at least one slide.')
    assert.deepEqual(resolveExportSelection({ scope: 'custom', slides, selectedIds: ['zz', 'a'] }).slideIds, ['a'])
    assert.ok(resolveExportSelection({ scope: 'custom', slides, selectedIds: ['zz'] }).error)
  })

  it('choosing every slide is the whole deck', () => {
    const r = resolveExportSelection({ scope: 'custom', slides, selectedIds: ['a', 'b', 'c', 'd', 'e'] })
    assert.equal(r.slideIds, null)
    assert.equal(r.count, 5)
  })
})

describe('clicking slides in the picker', () => {
  it('a click toggles one slide', () => {
    assert.deepEqual(toggleSlideSelection([], slides, 'c'), ['c'])
    assert.deepEqual(toggleSlideSelection(['c', 'a'], slides, 'c'), ['a'])
  })

  it('shift-click selects the range from the last clicked slide, either direction', () => {
    assert.deepEqual(toggleSlideSelection(['b'], slides, 'd', { range: true, anchorId: 'b' }), ['b', 'c', 'd'])
    assert.deepEqual(toggleSlideSelection(['e'], slides, 'b', { range: true, anchorId: 'e' }), ['b', 'c', 'd', 'e'])
    // No anchor yet: a plain toggle.
    assert.deepEqual(toggleSlideSelection([], slides, 'b', { range: true }), ['b'])
  })
})

describe('image files', () => {
  it('names match the server: <Deck>-slide-03.png, by deck position', () => {
    assert.equal(slideImageFilename('Q3 Review: Final!', 3, 'png'), 'Q3 Review Final-slide-03.png')
    assert.equal(slideImageFilename('', 12, 'jpg'), 'presentation-slide-12.jpg')
  })

  it('pixel size is the canvas size times the scale', () => {
    assert.deepEqual(imagePixelSize({ width: 1920, height: 1080 }, 2), { width: 3840, height: 2160 })
    assert.deepEqual(imagePixelSize({ width: 1440, height: 1080 }, 3), { width: 4320, height: 3240 })
    assert.deepEqual(imagePixelSize({ width: 1920, height: 1080 }, 7), { width: 1920, height: 1080 })
  })

  it('big image exports go to the server instead of browser memory', () => {
    assert.equal(shouldCaptureInBrowser({ count: 40, scale: 1 }), true)
    assert.equal(shouldCaptureInBrowser({ count: 10, scale: 2 }), true)
    assert.equal(shouldCaptureInBrowser({ count: 11, scale: 2 }), false)
    assert.equal(shouldCaptureInBrowser({ count: 4, scale: 3 }), true)
    assert.equal(shouldCaptureInBrowser({ count: 5, scale: 3 }), false)
    assert.equal(shouldCaptureInBrowser({ count: 0 }), false)
  })

  it('a zip built in the browser reads back file for file', () => {
    const files = [
      { name: 'Deck-slide-01.png', bytes: new Uint8Array([1, 2, 3]) },
      { name: 'Deck-slide-04.png', bytes: new Uint8Array([9, 8, 7, 6]) },
    ]
    const back = readStoredZip(zipStoredFiles(files))
    assert.deepEqual(back.map((f) => f.name), ['Deck-slide-01.png', 'Deck-slide-04.png'])
    assert.deepEqual([...back[1].bytes], [9, 8, 7, 6])
  })
})

describe('remembered choices per deck', () => {
  it('saves and loads, cleaning up bad values', () => {
    const storage = memoryStorage()
    saveExportPrefs('deck-1', { format: 'PNG', scope: 'custom', selectedIds: ['a', 5, 'c'], scale: 2, quality: 85, transparent: true }, storage)
    assert.deepEqual(loadExportPrefs('deck-1', storage), {
      format: 'PNG',
      scope: 'custom',
      selectedIds: ['a', 'c'],
      scale: 2,
      quality: 85,
      transparent: true,
    })
    storage.setItem(exportPrefsKey('deck-2'), JSON.stringify({ format: 'DOCX', scale: 9, quality: 10, scope: 'weird' }))
    assert.deepEqual(loadExportPrefs('deck-2', storage), {})
  })

  it('never throws: no storage, blocked storage, broken JSON', () => {
    assert.deepEqual(loadExportPrefs('x', null), {})
    const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    assert.deepEqual(loadExportPrefs('x', blocked), {})
    assert.equal(saveExportPrefs('x', {}, blocked), false)
    const storage = memoryStorage()
    storage.setItem(exportPrefsKey('x'), '{nope')
    assert.deepEqual(loadExportPrefs('x', storage), {})
  })
})

describe('Canva-style page range parsing and formatting', () => {
  it('parses individual numbers and ranges', () => {
    assert.deepEqual(parsePageRange('1-3, 5', 5), [1, 2, 3, 5])
    assert.deepEqual(parsePageRange('2, 4', 5), [2, 4])
    assert.deepEqual(parsePageRange('1 - 2, 4-5', 5), [1, 2, 4, 5])
    assert.deepEqual(parsePageRange('all', 3), [1, 2, 3])
    assert.deepEqual(parsePageRange('', 5), [])
    assert.deepEqual(parsePageRange('10', 5), []) // out of bounds ignored
    assert.deepEqual(parsePageRange('5-2', 5), [2, 3, 4, 5]) // reversed normalized
  })

  it('formats page numbers into compact range strings', () => {
    assert.equal(formatPageRange([1, 2, 3, 5], 5), '1-3, 5')
    assert.equal(formatPageRange([2, 4], 5), '2, 4')
    assert.equal(formatPageRange([1, 2, 3, 4, 5], 5), 'All pages (1-5)')
    assert.equal(formatPageRange([3], 5), '3')
    assert.equal(formatPageRange([], 5), '')
  })

  it('maps between slide IDs and 1-based page numbers', () => {
    assert.deepEqual(pageNumbersFromSlideIds(slides, ['b', 'd']), [2, 4])
    assert.deepEqual(slideIdsFromPageNumbers(slides, [2, 4]), ['b', 'd'])
  })

  it('extracts slide titles from elements in any wrapper format without throwing', () => {
    const s1 = { elements: [{ role: 'heading', content: { text: 'Market Overview' } }] }
    const s2 = { elements: [] }
    // When elements is an object (e.g. { canvas, elements: [...] }) as used in AIPptEditor
    const s3 = { elements: { canvas: {}, elements: [{ slotId: 'HEADING', content: { text: 'Roadmap 2026' } }] } }
    // When elements is an empty object
    const s4 = { elements: {} }
    // When slide is null or malformed
    const s5 = null

    assert.equal(getSlideTitle(s1, 0), 'Market Overview')
    assert.equal(getSlideTitle(s2, 1), 'Slide 2')
    assert.equal(getSlideTitle(s3, 2), 'Roadmap 2026')
    assert.equal(getSlideTitle(s4, 3), 'Slide 4')
    assert.equal(getSlideTitle(s5, 4), 'Slide 5')
    assert.deepEqual(extractSlideElements(s3), [{ slotId: 'HEADING', content: { text: 'Roadmap 2026' } }])
  })
})
