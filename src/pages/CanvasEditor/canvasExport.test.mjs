#!/usr/bin/env node
/** Run: node --test src/pages/CanvasEditor/canvasExport.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  EXPORT_FORMATS,
  buildDesignPdf,
  describeExportError,
  exportFileName,
  imageLabelsOnPage,
  pagesForExport,
  zipStoredFiles,
} from './canvasExport.js'

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function page(id, text) {
  return {
    id,
    width: 200,
    height: 100,
    elements: [
      {
        id: `${id}-text`,
        type: 'text',
        content: { text, color: '#112233', fontFamily: 'Georgia' },
      },
      {
        id: `${id}-image`,
        type: 'image',
        content: { url: 'https://cdn.example.com/assets/hero%20photo.png' },
      },
    ],
  }
}

describe('canvas export', () => {
  const pages = Array.from({ length: 10 }, (_, index) => page(`p${index + 1}`, `Page ${index + 1}`))

  it('does not offer an SVG that is only a background rectangle', () => {
    assert.equal(EXPORT_FORMATS.some((item) => item.id === 'svg'), false)
    assert.deepEqual(
      EXPORT_FORMATS.map((item) => item.id),
      ['png', 'jpeg', 'webp', 'pdf']
    )
  })

  it('selects the current page, every page, or a range', () => {
    assert.deepEqual(pagesForExport(pages, { scope: 'current', activeIndex: 2 }).pages.map((item) => item.id), ['p3'])
    assert.equal(pagesForExport(pages, { scope: 'all' }).pages.length, 10)
    const range = pagesForExport(pages, { scope: 'range', rangeStart: 2, rangeEnd: 4 })
    assert.deepEqual(range.pages.map((item) => item.id), ['p2', 'p3', 'p4'])
    assert.match(pagesForExport(pages, { scope: 'range', rangeStart: 4, rangeEnd: 2 }).error, /1 to 10/)
  })

  it('names a blocked workspace image in the modal error', () => {
    const labels = imageLabelsOnPage(pages[0])
    assert.equal(labels[0].name, 'hero photo.png')
    const message = describeExportError(new Error('Tainted canvas'), labels)
    assert.match(message, /hero photo\.png/)
    assert.match(message, /nothing was saved/)
  })

  it('builds a 10-page PDF at each page’s pixel size', async () => {
    const pdf = await buildDesignPdf(
      pages.map((item) => ({ width: item.width, height: item.height, dataUrl: PNG }))
    )
    const bytes = new Uint8Array(await pdf.arrayBuffer())
    const text = new TextDecoder('latin1').decode(bytes)
    assert.equal(text.includes('/Type /Page'), true)
    const pageCount = text.match(/\/Type \/Page\b/g)?.length || 0
    assert.equal(pageCount, 10)
    assert.equal((text.match(/\/MediaBox \[0 0 200\.? 100\.?\]/g) || []).length, 10)
  })

  it('packs several raster pages into one zip', () => {
    const zip = zipStoredFiles([
      { name: exportFileName('Launch', { ext: '.png', pageNumber: 1, pageCount: 2, width: 200, height: 100 }), bytes: new Uint8Array([1, 2]) },
      { name: 'launch-page-2-200x100.png', bytes: new Uint8Array([3]) },
    ])
    assert.equal(zip[0], 0x50)
    assert.equal(zip[1], 0x4b)
    const listing = new TextDecoder().decode(zip)
    assert.match(listing, /launch-page-1-200x100\.png/)
    assert.match(listing, /launch-page-2-200x100\.png/)
  })
})
