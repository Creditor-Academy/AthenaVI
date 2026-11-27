import assert from 'node:assert/strict'
import { test } from 'node:test'
import { showsSlideFallback } from './presentationHelpers.js'

test('B-3: the content placeholder is only for slides the user never edited', () => {
  assert.equal(showsSlideFallback({ manuallyEdited: false, title: 'Generated' }), true)
  assert.equal(showsSlideFallback({ title: 'Old deck slide' }), true)
  assert.equal(showsSlideFallback({ manuallyEdited: true, title: 'Untitled Presentation', imageRef: { url: 'x' } }), false)
  assert.equal(showsSlideFallback(null), true)
})
