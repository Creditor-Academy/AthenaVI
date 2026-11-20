#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  imageNameOf,
  inlinePageImages,
  loadImageDataUrl,
  pageImageRefs,
  pageWithoutImages,
} from './inlineImages.js'

const S3 = 'https://virtual-instructor.s3.us-east-1.amazonaws.com/workspace/w1/assets'
const AI = `${S3}/eb21ccf0-d7e4-4a3a-bd75-8878cf069858.png`
const BG = `${S3}/background.jpg`
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])

const page = {
  id: 'p1',
  backgroundImage: BG,
  elements: [
    { id: 'img', type: 'image', content: { url: AI } },
    { id: 'txt', type: 'text', content: { text: 'Title' } },
    { id: 'web', type: 'embed', content: { url: 'https://www.youtube.com/watch?v=x', thumbnailUrl: `${S3}/thumb.png` } },
  ],
}

/** A fake fetch: `hosts` answers per URL (true = a PNG, 'cors' = refused, 'html' = not an image). */
function fakeFetch(answers) {
  const calls = []
  const impl = async (url, opts = {}) => {
    calls.push({ url, opts })
    const answer = answers(url, opts)
    if (answer === 'cors') throw new TypeError('Failed to fetch')
    if (answer === 'html') return { ok: true, blob: async () => new Blob(['<html></html>'], { type: 'text/html' }) }
    if (answer === 'octet') return { ok: true, blob: async () => new Blob([PNG_BYTES], { type: 'application/octet-stream' }) }
    if (answer === 404) return { ok: false, status: 404, blob: async () => new Blob([]) }
    return { ok: true, blob: async () => new Blob([PNG_BYTES], { type: 'image/png' }) }
  }
  impl.calls = calls
  return impl
}

const proxy = { url: (u) => `https://api.test/api/media/image?url=${encodeURIComponent(u)}`, headers: () => ({ Authorization: 'Bearer t' }) }

describe('pictures on a page', () => {
  it('finds the background and picture fields, not a web page address', () => {
    const urls = pageImageRefs(page).map((r) => r.url)
    assert.deepEqual(urls, [BG, AI, `${S3}/thumb.png`])
    assert.equal(imageNameOf(AI), 'eb21ccf0-d7e4-4a3a-bd75-8878cf069858.png')
  })
})

describe('loading a picture', () => {
  it('bypasses the browser cache (the cached copy has no CORS headers)', async () => {
    const fetchImpl = fakeFetch(() => true)
    const dataUrl = await loadImageDataUrl(AI, { fetchImpl })
    assert.match(dataUrl, /^data:image\/png;base64,/)
    assert.equal(fetchImpl.calls[0].url, AI, 'the address is not changed (presigned links keep working)')
    assert.equal(fetchImpl.calls[0].opts.cache, 'no-store')
    assert.equal(fetchImpl.calls[0].opts.mode, 'cors')
  })

  it('falls back to our API when the host refuses', async () => {
    const fetchImpl = fakeFetch((url) => (url.startsWith('https://api.test') ? true : 'cors'))
    const dataUrl = await loadImageDataUrl(AI, { fetchImpl, proxy })
    assert.match(dataUrl, /^data:image\/png/)
    assert.equal(fetchImpl.calls[1].url, proxy.url(AI))
    assert.equal(fetchImpl.calls[1].opts.headers.Authorization, 'Bearer t')
  })

  it('reads a picture stored with the wrong type, and refuses what is not a picture', async () => {
    assert.match(await loadImageDataUrl(AI, { fetchImpl: fakeFetch(() => 'octet') }), /^data:image\/png/)
    await assert.rejects(loadImageDataUrl(AI, { fetchImpl: fakeFetch(() => 'html') }), /eb21ccf0/)
  })

  it('fails with the file name when neither way works', async () => {
    await assert.rejects(loadImageDataUrl(AI, { fetchImpl: fakeFetch(() => 404), proxy }), /Couldn't load eb21ccf0/)
  })
})

describe('preparing a page', () => {
  it('swaps every picture for its copy and leaves the rest', async () => {
    const { page: ready, blocked } = await inlinePageImages(page, { fetchImpl: fakeFetch(() => true) })
    assert.deepEqual(blocked, [])
    assert.match(ready.backgroundImage, /^data:image\/png/)
    assert.match(ready.elements[0].content.url, /^data:image\/png/)
    assert.equal(ready.elements[1], page.elements[1], 'untouched elements are the same objects')
    assert.equal(ready.elements[2].content.url, 'https://www.youtube.com/watch?v=x')
    assert.equal(page.elements[0].content.url, AI, 'the design itself is not changed')
  })

  it('reports pictures that could not be loaded, in page order, and loads each address once', async () => {
    const fetchImpl = fakeFetch((url) => (url === AI ? 404 : true))
    const cache = new Map()
    const { blocked } = await inlinePageImages(page, { fetchImpl, cache })
    assert.deepEqual(blocked.map((b) => b.name), ['eb21ccf0-d7e4-4a3a-bd75-8878cf069858.png'])
    const before = fetchImpl.calls.length
    await inlinePageImages(page, { fetchImpl, cache })
    assert.equal(fetchImpl.calls.length - before, 1, 'only the failed one is tried again')
  })

  it('"Export without this image" leaves the picture element and background out', () => {
    const without = pageWithoutImages(page, new Set([AI, BG]))
    assert.deepEqual(without.elements.map((e) => e.id), ['txt', 'web'])
    assert.equal(without.backgroundImage, undefined)
  })
})
