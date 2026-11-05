import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rgbToHex } from './exportRenderSettle.js'

test('computed colours are reported as #RRGGBB for PPTX', () => {
  assert.equal(rgbToHex('rgb(15, 23, 42)'), '#0F172A')
  assert.equal(rgbToHex('rgba(255, 255, 255, 0.5)'), '#FFFFFF')
  assert.equal(rgbToHex('rgb(0 128 255)'), '#0080FF')
  assert.equal(rgbToHex('transparent'), null)
  assert.equal(rgbToHex(''), null)
})
