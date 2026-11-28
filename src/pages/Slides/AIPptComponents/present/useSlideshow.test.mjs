/**
 * useSlideshow / useSpotlight: the slideshow's state, including following a live presenter.
 * Run with the rest of the suite: npm test
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
function defineGlobal(name, value) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
}
defineGlobal('window', dom.window)
defineGlobal('document', dom.window.document)
defineGlobal('HTMLElement', dom.window.HTMLElement)
defineGlobal('Node', dom.window.Node)
defineGlobal('IS_REACT_ACT_ENVIRONMENT', true)

const { createElement, act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { default: useSlideshow, useSpotlight } = await import('./useSlideshow.js')

const slides = (n) => Array.from({ length: n }, (_, i) => ({ id: `s${i + 1}` }))
const cursor = (slideIndex, seq, displayName = 'Sam') => ({ slideIndex, seq, displayName })

/** Mounts a component that runs the hook; `current` is the hook's latest result. */
async function mountShow(props) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  const out = { current: null, indexCalls: [] }
  const Probe = (p) => {
    out.current = useSlideshow({ ...p, onIndexChange: (i) => out.indexCalls.push(i) })
    return null
  }
  const render = async (next) => {
    await act(async () => root.render(createElement(Probe, next)))
  }
  await render(props)
  out.rerender = render
  out.unmount = () => act(() => root.unmount())
  return out
}

test('a guest follows the presenter, newest seq only', async () => {
  const show = await mountShow({ slides: slides(5), chrome: 'audience', presence: { presenter: cursor(2, 1) } })
  assert.equal(show.current.following, true)
  assert.equal(show.current.index, 2)
  await show.rerender({ slides: slides(5), chrome: 'audience', presence: { presenter: cursor(3, 2) } })
  assert.equal(show.current.index, 3)
  // An older update arriving late is ignored.
  await show.rerender({ slides: slides(5), chrome: 'audience', presence: { presenter: cursor(1, 1) } })
  assert.equal(show.current.index, 3)
  show.unmount()
})

test('moving on your own stops following; "back to presenter" follows again', async () => {
  const base = { slides: slides(5), chrome: 'audience' }
  const show = await mountShow({ ...base, presence: { presenter: cursor(1, 1) } })
  await act(async () => show.current.goTo(4))
  assert.equal(show.current.following, false)
  assert.equal(show.current.index, 4)
  await show.rerender({ ...base, presence: { presenter: cursor(2, 2) } })
  assert.equal(show.current.index, 4, 'not following: the presenter moving does not move me')
  await act(async () => show.current.jumpToPresenter())
  assert.equal(show.current.following, true)
  assert.equal(show.current.index, 2)
  await show.rerender({ ...base, presence: { presenter: cursor(3, 3) } })
  assert.equal(show.current.index, 3)
  show.unmount()
})

test('a member only follows once someone else holds the lock', async () => {
  const base = { slides: slides(5), chrome: 'presenter' }
  const show = await mountShow({ ...base, initialSlideIndex: 0, presence: { presenter: cursor(3, 1) } })
  assert.equal(show.current.following, false)
  assert.equal(show.current.index, 0)
  const conflict = { displayName: 'Sam' }
  await show.rerender({ ...base, presence: { presenter: cursor(3, 1), conflict } })
  assert.equal(show.current.following, true)
  assert.equal(show.current.index, 3)
  show.unmount()
})

test('a conflict already there when Present opens counts', async () => {
  const show = await mountShow({
    slides: slides(4),
    chrome: 'presenter',
    presence: { presenter: cursor(2, 5), conflict: { displayName: 'Sam' } },
  })
  assert.equal(show.current.following, true)
  assert.equal(show.current.index, 2)
  show.unmount()
})

test('starting to present stops following', async () => {
  const base = { slides: slides(4), chrome: 'audience' }
  const show = await mountShow({ ...base, presence: { presenter: cursor(1, 1) } })
  assert.equal(show.current.following, true)
  await show.rerender({ ...base, presence: { presenter: cursor(1, 1), isPresenting: true } })
  assert.equal(show.current.following, false)
  show.unmount()
})

test('slide index is clamped and onIndexChange fires once per change, not per render', async () => {
  const show = await mountShow({ slides: slides(5), initialSlideIndex: 4 })
  await show.rerender({ slides: slides(5), initialSlideIndex: 4 })
  await show.rerender({ slides: slides(5), initialSlideIndex: 4 })
  assert.deepEqual(show.indexCalls, [4])
  await show.rerender({ slides: slides(3), initialSlideIndex: 4 })
  assert.equal(show.current.index, 2)
  await act(async () => show.current.go(-1))
  assert.equal(show.current.index, 1)
  assert.deepEqual(show.indexCalls, [4, 2, 1])
  show.unmount()
})

test('transitions: forward plays the next slide\'s, back replays the current one reversed', async () => {
  const deck = [{ id: 'a' }, { id: 'b', transition: 'fade' }, { id: 'c', transition: 'slide-left' }]
  const show = await mountShow({ slides: deck })
  await act(async () => show.current.go(1))
  assert.deepEqual([show.current.motion.id, show.current.motion.reverse], ['fade', false])
  await act(async () => show.current.go(1))
  assert.deepEqual([show.current.motion.id, show.current.motion.reverse], ['slide-left', false])
  await act(async () => show.current.go(-1))
  assert.deepEqual([show.current.motion.id, show.current.motion.reverse], ['slide-left', true])
  show.unmount()
})

test('spotlight steps through blocks, then ends; a new slide ends it', async () => {
  const host = document.createElement('div')
  const root = createRoot(host)
  const out = { current: null }
  const Probe = ({ ids, index }) => {
    out.current = useSpotlight(ids, index)
    return null
  }
  const render = (props) => act(async () => root.render(createElement(Probe, props)))
  await render({ ids: ['t', 'b'], index: 0 })
  assert.equal(out.current.activeId, null)
  await act(async () => out.current.cycle())
  assert.deepEqual([out.current.activeId, out.current.position, out.current.total], ['t', 1, 2])
  await act(async () => out.current.cycle())
  assert.equal(out.current.activeId, 'b')
  await act(async () => out.current.cycle())
  assert.equal(out.current.activeId, null)
  await act(async () => out.current.select('b'))
  assert.equal(out.current.activeId, 'b')
  await render({ ids: ['x', 'y'], index: 1 })
  assert.equal(out.current.activeId, null, 'another slide: spotlight is over')
  act(() => root.unmount())
})
