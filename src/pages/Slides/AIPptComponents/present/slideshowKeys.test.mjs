import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clampIndex, slideshowKeyAction, targetIndex } from './slideshowKeys.js'

test('clicker, arrow and space keys move the show', () => {
  for (const key of ['ArrowRight', 'ArrowDown', 'PageDown', ' ']) assert.equal(slideshowKeyAction({ key }), 'next', key)
  for (const key of ['ArrowLeft', 'ArrowUp', 'PageUp']) assert.equal(slideshowKeyAction({ key }), 'prev', key)
  assert.equal(slideshowKeyAction({ key: 'Home' }), 'first')
  assert.equal(slideshowKeyAction({ key: 'End' }), 'last')
})

test('modifier combinations are left to the browser; Tab is always handled', () => {
  assert.equal(slideshowKeyAction({ key: 'ArrowRight', ctrlKey: true }), null)
  assert.equal(slideshowKeyAction({ key: 'PageDown', metaKey: true }), null)
  assert.equal(slideshowKeyAction({ key: 'ArrowLeft', altKey: true }), null)
  assert.equal(slideshowKeyAction({ key: 'Tab', shiftKey: true }), 'tab')
})

test('Space on a focused toolbar button presses the button, not "next"', () => {
  assert.equal(slideshowKeyAction({ key: ' ', onButton: true }), null)
  assert.equal(slideshowKeyAction({ key: 'PageDown', onButton: true }), 'next')
})

test('Escape, spotlight and notes', () => {
  assert.equal(slideshowKeyAction({ key: 'Escape' }), 'escape')
  assert.equal(slideshowKeyAction({ key: 'f' }), 'spotlight')
  assert.equal(slideshowKeyAction({ key: 'S' }), 'notes')
  assert.equal(slideshowKeyAction({ key: 'x' }), null)
})

test('targets stay inside the deck', () => {
  assert.equal(targetIndex('next', 3, 4), 3)
  assert.equal(targetIndex('next', 1, 4), 2)
  assert.equal(targetIndex('prev', 0, 4), 0)
  assert.equal(targetIndex('first', 3, 4), 0)
  assert.equal(targetIndex('last', 0, 4), 3)
  assert.equal(targetIndex('spotlight', 0, 4), null)
})

test('the index is clamped when slides are removed', () => {
  assert.equal(clampIndex(9, 4), 3)
  assert.equal(clampIndex(-2, 4), 0)
  assert.equal(clampIndex(2, 0), 0)
})
