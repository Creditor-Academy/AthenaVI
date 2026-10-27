/**
 * Mounts CanvasEditor against a fake canvas API.
 * Run with the rest of the suite: npm test
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

const { window } = dom
window.innerWidth = 1280
window.innerHeight = 800
window.matchMedia = () => ({
  matches: false,
  media: '',
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() { return false },
})
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.document.fonts = { ready: Promise.resolve(), addEventListener() {}, removeEventListener() {} }

function defineGlobal(name, value) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
}

defineGlobal('window', window)
defineGlobal('document', window.document)
defineGlobal('localStorage', window.localStorage)
defineGlobal('HTMLElement', window.HTMLElement)
defineGlobal('SVGElement', window.SVGElement)
defineGlobal('Element', window.Element)
defineGlobal('Node', window.Node)
defineGlobal('DocumentFragment', window.DocumentFragment)
defineGlobal('MutationObserver', window.MutationObserver)
defineGlobal('getComputedStyle', window.getComputedStyle.bind(window))
defineGlobal('requestAnimationFrame', window.requestAnimationFrame.bind(window))
defineGlobal('cancelAnimationFrame', window.cancelAnimationFrame.bind(window))
defineGlobal('matchMedia', window.matchMedia)
defineGlobal('ResizeObserver', window.ResizeObserver)
defineGlobal('IS_REACT_ACT_ENVIRONMENT', true)

const { createElement, act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { default: CanvasEditor } = await import('./CanvasEditor.jsx')

const WORKSPACE = 'ws-1'
const CANVAS = 'canvas-1'

function storedProject(revision = 1) {
  return {
    id: CANVAS,
    name: 'Poster',
    thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
    data: {
      version: 1,
      revision,
      docTitle: 'Poster',
      size: { width: 1080, height: 1080 },
      canvases: [{
        id: 'page-1',
        width: 1080,
        height: 1080,
        background: '#FFFFFF',
        elements: [],
      }],
    },
  }
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

function installFetch({ onData } = {}) {
  const dataSaves = []
  let revision = 1
  globalThis.fetch = async (url, options = {}) => {
    const href = String(url)
    const method = String(options.method || 'GET').toUpperCase()
    if (method === 'GET' && href.includes(`/canvases/${CANVAS}`)) {
      return jsonResponse(200, { data: { canvas: storedProject(revision) } })
    }
    if (method === 'PATCH' && href.endsWith('/data')) {
      dataSaves.push(JSON.parse(options.body))
      const decision = onData ? onData(dataSaves.length) : 'ok'
      if (decision === 'reject') return jsonResponse(400, { message: 'Rejected' })
      if (decision === 'conflict') return jsonResponse(409, { message: 'Conflict' })
      revision += 1
      const sent = JSON.parse(options.body).data
      return jsonResponse(200, {
        data: { canvas: { ...storedProject(revision), data: { ...sent, revision } } },
      })
    }
    if (method === 'PATCH') return jsonResponse(200, { data: { canvas: storedProject(revision) } })
    return jsonResponse(404, { message: 'Not found' })
  }
  return dataSaves
}

function badgeText() {
  return document.querySelector('.canva-header-save-badge')?.textContent?.replace(/\s+/g, ' ').trim() || ''
}

async function settle(ms) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })
}

async function waitFor(read, label) {
  const start = Date.now()
  let latest = ''
  while (Date.now() - start < 4000) {
    latest = read() || ''
    if (latest) return latest
    await settle(40)
  }
  throw new Error(`Timed out waiting for ${label}. Last: ${latest}`)
}

async function mountEditor() {
  localStorage.clear()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(createElement(CanvasEditor, {
      workspaceId: WORKSPACE,
      folderId: 'folder-1',
      canvasId: CANVAS,
      initialTitle: 'Poster',
      onBack() {},
    }))
  })
  await waitFor(() => (badgeText() === 'Saved' ? 'Saved' : ''), 'Saved')
  return {
    root,
    unmount() {
      act(() => root.unmount())
      host.remove()
    },
  }
}

async function insertTitle() {
  const button = document.querySelector('button.ppt-text-card')
  assert.ok(button, 'text style button')
  await act(async () => {
    button.click()
  })
}

test('reopen does not autosave a clean document', async () => {
  const dataSaves = installFetch()
  const view = await mountEditor()
  await settle(1200)
  assert.equal(dataSaves.length, 0)
  assert.equal(document.querySelectorAll('[data-element-id]').length, 0)
  view.unmount()
})

test('insert then undo restores the page', async () => {
  installFetch()
  const view = await mountEditor()
  await insertTitle()
  assert.equal(document.querySelectorAll('[data-element-id]').length, 1)
  const undo = document.querySelector('button[title="Undo (Ctrl+Z)"]')
  assert.equal(undo.disabled, false)
  await act(async () => {
    undo.click()
  })
  assert.equal(document.querySelectorAll('[data-element-id]').length, 0)
  view.unmount()
})

test('one autosave is sent after the debounce', async () => {
  const dataSaves = installFetch()
  const view = await mountEditor()
  await insertTitle()
  await waitFor(() => (dataSaves.length >= 1 ? 'saved' : ''), 'autosave')
  await settle(1200)
  assert.equal(dataSaves.length, 1)
  assert.equal(dataSaves[0].baseRevision, 1)
  assert.equal(dataSaves[0].data.canvases[0].elements.length, 1)
  view.unmount()
})

async function withQuietConsole(run) {
  const error = console.error
  console.error = () => {}
  try {
    await run()
  } finally {
    console.error = error
  }
}

test('a rejected save shows the badge', async () => {
  await withQuietConsole(async () => {
    installFetch({ onData: () => 'reject' })
    const view = await mountEditor()
    await insertTitle()
    const text = await waitFor(
      () => (badgeText().includes('Not saved') ? badgeText() : ''),
      'Not saved badge',
    )
    assert.match(text, /Not saved/)
    assert.equal(document.getElementById('canvas-recovery-dialog-title'), null)
    view.unmount()
  })
})

test('a 409 opens the conflict dialog', async () => {
  await withQuietConsole(async () => {
    installFetch({ onData: () => 'conflict' })
    const view = await mountEditor()
    await insertTitle()
    const title = await waitFor(
      () => document.getElementById('canvas-recovery-dialog-title')?.textContent || '',
      'conflict dialog',
    )
    assert.equal(title, 'This design changed somewhere else')
    view.unmount()
  })
})
