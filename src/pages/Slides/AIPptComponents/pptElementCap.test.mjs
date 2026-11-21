/**
 * The per-slide element cap (PPT_CAPS.ELEMENTS_PER_SLIDE) and saving slides while the tab closes.
 * Duplicate, paste and group used to skip the cap: the slide went over it locally, the server
 * refused every save of it, and the edits were lost on reload.
 * Run with the rest of the suite: npm test
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
})
function defineGlobal(name, value) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
}
defineGlobal('window', dom.window)
defineGlobal('document', dom.window.document)
defineGlobal('localStorage', dom.window.localStorage)
defineGlobal('HTMLElement', dom.window.HTMLElement)
defineGlobal('IS_REACT_ACT_ENVIRONMENT', true)

const { createElement, act, useState } = await import('react')
const { createRoot } = await import('react-dom/client')
const { PPT_CAPS } = await import('../../../utils/presentationHelpers.js')
const { usePptElementMutations } = await import('./usePptElementMutations.js')
const { createKeepaliveBudget, bodyByteLength, KEEPALIVE_BUDGET_BYTES } = await import(
  '../../../services/keepaliveBudget.js'
)
const { default: presentationService } = await import('../../../services/presentationService.js')

const CAP = PPT_CAPS.ELEMENTS_PER_SLIDE

function element(i) {
  return {
    id: `el-${i}`,
    type: 'shape',
    layer: i + 1,
    placement: { x: i, y: i, width: 10, height: 10, rotation: 0, opacity: 1 },
    content: {},
  }
}

function slideWith(count) {
  return {
    id: 'slide-1',
    elements: {
      version: 1,
      canvas: { width: 1920, height: 1080 },
      elements: Array.from({ length: count }, (_, i) => element(i)),
    },
  }
}

/** Mounts the hook on one slide; returns live handles to its state and calls. */
async function mount(count) {
  const out = { capCalls: [], saves: [] }
  function Harness() {
    const [slides, setSlides] = useState([slideWith(count)])
    const [selectedElementId, setSelectedElementId] = useState(null)
    out.slides = slides
    out.mutations = usePptElementMutations({
      localSlides: slides,
      setLocalSlides: setSlides,
      selectedSlideId: 'slide-1',
      selectedElementId,
      setSelectedElementId,
      setMultiSelectIds: () => {},
      aspectRatio: '16:9',
      workspaceId: null,
      presentationId: null,
      isGenerating: false,
      presentationService: {},
      queueCanvasSave: (id, doc) => out.saves.push(doc.elements.length),
      pushHistory: () => {},
      onElementCapReached: (cap) => out.capCalls.push(cap),
    })
    return null
  }
  const root = createRoot(document.getElementById('root'))
  await act(async () => root.render(createElement(Harness)))
  out.count = () => out.slides[0].elements.elements.length
  out.unmount = () => act(async () => root.unmount())
  return out
}

test('the cap is 500 elements per slide', () => {
  assert.equal(CAP, 500)
})

test('duplicate works below the cap and is refused when it would go over', async () => {
  const h = await mount(CAP - 2)
  await act(async () => h.mutations.duplicateElement(['el-0', 'el-1']))
  assert.equal(h.count(), CAP, 'two copies fit exactly')
  assert.deepEqual(h.capCalls, [])

  await act(async () => h.mutations.duplicateElement(['el-0']))
  assert.equal(h.count(), CAP, 'nothing added past the cap')
  assert.deepEqual(h.capCalls, [CAP])
  assert.ok(h.saves.every((n) => n <= CAP), 'no save ever carries more than the cap')
  await h.unmount()
})

test('paste is refused when the clipboard would push the slide over the cap', async () => {
  const h = await mount(CAP - 1)
  await act(async () => {
    assert.equal(h.mutations.copySelection(['el-0', 'el-1']), true)
  })
  await act(async () => h.mutations.pasteClipboard())
  assert.equal(h.count(), CAP - 1)
  assert.deepEqual(h.capCalls, [CAP])
  assert.deepEqual(h.saves, [])
  await h.unmount()
})

test('paste still works with room left', async () => {
  const h = await mount(60) // the old limit: no longer a limit
  await act(async () => h.mutations.copySelection(['el-0', 'el-1', 'el-2']))
  await act(async () => h.mutations.pasteClipboard())
  assert.equal(h.count(), 63)
  assert.deepEqual(h.capCalls, [])
  await h.unmount()
})

test('group (which adds a group element) is refused on a full slide', async () => {
  const full = await mount(CAP)
  await act(async () => full.mutations.groupSelection(['el-0', 'el-1']))
  assert.equal(full.count(), CAP)
  assert.deepEqual(full.capCalls, [CAP])
  await full.unmount()

  const roomy = await mount(CAP - 1)
  await act(async () => roomy.mutations.groupSelection(['el-0', 'el-1']))
  assert.equal(roomy.count(), CAP, 'the group element fills the last slot')
  assert.deepEqual(roomy.capCalls, [])
  await roomy.unmount()
})

test('keepalive budget: counts UTF-8 bytes, refuses what does not fit, frees on release', () => {
  assert.equal(bodyByteLength('abc'), 3)
  assert.equal(bodyByteLength('é'), 2)
  const budget = createKeepaliveBudget(100)
  const a = budget.reserve('x'.repeat(60))
  assert.ok(a)
  assert.equal(budget.reserve('x'.repeat(50)), null, 'over what is left')
  const b = budget.reserve('x'.repeat(40))
  assert.ok(b)
  assert.equal(budget.inFlight, 100)
  a()
  a() // releasing twice is harmless
  assert.equal(budget.inFlight, 40)
  assert.ok(budget.reserve('x'.repeat(60)))
  assert.ok(KEEPALIVE_BUDGET_BYTES < 64 * 1024)
})

test('saveCanvas on tab close: small slides go keepalive, oversized ones go as ordinary requests', async () => {
  const sent = []
  const pending = []
  globalThis.fetch = (url, options = {}) => {
    sent.push({ keepalive: options.keepalive === true, bytes: options.body.length })
    return new Promise((resolve) => {
      pending.push(() => resolve({ ok: true, status: 200, json: async () => ({ data: {} }) }))
    })
  }
  const doc = (elements) => ({ version: 1, canvas: { width: 1920, height: 1080 }, elements })
  const small = doc([element(0)])
  const big = doc(Array.from({ length: 400 }, (_, i) => ({ ...element(i), content: { text: 'x'.repeat(200) } })))
  assert.ok(JSON.stringify(big).length > 64 * 1024, 'fixture is over the browser limit')

  const saves = [
    presentationService.saveCanvas('ws', 'p', 's1', small, { keepalive: true }),
    presentationService.saveCanvas('ws', 'p', 's2', big, { keepalive: true }),
    presentationService.saveCanvas('ws', 'p', 's3', small, { keepalive: true }),
    presentationService.saveCanvas('ws', 'p', 's4', big), // normal save: never keepalive
  ]
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(sent.length, 4, 'every slide is sent; none dropped')
  assert.deepEqual(
    sent.map((s) => s.keepalive),
    [true, false, true, false]
  )
  pending.forEach((resolve) => resolve())
  await Promise.all(saves)

  // Room is given back once requests settle, so a later close-save uses keepalive again.
  sent.length = 0
  pending.length = 0
  const again = presentationService.saveCanvas('ws', 'p', 's1', small, { keepalive: true })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(sent[0].keepalive, true)
  pending.forEach((resolve) => resolve())
  await again
})
