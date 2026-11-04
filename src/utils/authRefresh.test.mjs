import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

// Minimal browser globals for the module under test.
const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}
const events = []
globalThis.window = { dispatchEvent: (e) => events.push(e.type) }
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent extends Event {}
}

const { withAuthRefresh, refreshAccessToken, __setRawFetchForTests } = await import('./authRefresh.js')

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

/** API stub: accepts only `valid`; /api/auth/refresh answers with `refreshAnswer()`. */
function api({ valid, refreshAnswer }) {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    const auth = init.headers?.Authorization || init.headers?.get?.('Authorization') || ''
    calls.push({ url, auth, body: init.body })
    if (url.includes('/api/auth/refresh')) return refreshAnswer()
    return auth === `Bearer ${valid()}` ? json(200, { ok: true }) : json(401, { message: 'Token expired' })
  }
  return { calls, fetchImpl }
}

beforeEach(() => {
  store.clear()
  events.length = 0
})

test('an expired token is renewed once and the request is sent again', async () => {
  store.set('accessToken', 'old')
  let refreshes = 0
  const { calls, fetchImpl } = api({
    valid: () => 'new',
    refreshAnswer: () => {
      refreshes += 1
      return json(201, { data: { accessToken: 'new' } })
    },
  })
  __setRawFetchForTests(fetchImpl)
  const authFetch = withAuthRefresh(fetchImpl)

  const res = await authFetch('/api/workspaces/w/presentations/p/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer old' },
    body: '{"format":"PPTX"}',
  })
  assert.equal(res.status, 200)
  assert.equal(refreshes, 1)
  assert.equal(store.get('accessToken'), 'new')
  assert.deepEqual(events, ['auth:token-refreshed'])
  const retry = calls.at(-1)
  assert.equal(retry.auth, 'Bearer new')
  assert.equal(retry.body, '{"format":"PPTX"}', 'body resent')
})

test('requests failing together share one renewal (refresh tokens rotate)', async () => {
  store.set('accessToken', 'old')
  let refreshes = 0
  const { fetchImpl } = api({
    valid: () => 'new',
    refreshAnswer: async () => {
      refreshes += 1
      await new Promise((r) => setTimeout(r, 20))
      // A second use of the rotated refresh token would be refused.
      return refreshes === 1 ? json(201, { data: { accessToken: 'new' } }) : json(401, {})
    },
  })
  __setRawFetchForTests(fetchImpl)
  const authFetch = withAuthRefresh(fetchImpl)
  const send = () => authFetch('/api/x', { headers: { Authorization: 'Bearer old' } })

  const results = await Promise.all([send(), send(), send()])
  assert.deepEqual(results.map((r) => r.status), [200, 200, 200])
  assert.equal(refreshes, 1)
  // A request that went out with the old token after the renewal reuses the new one.
  assert.equal((await send()).status, 200)
  assert.equal(refreshes, 1)
})

test('when the session cannot be renewed: 401 returned, session-expired raised', async () => {
  store.set('accessToken', 'old')
  const { fetchImpl } = api({ valid: () => 'never', refreshAnswer: () => json(401, { message: 'Unauthorized' }) })
  __setRawFetchForTests(fetchImpl)
  const res = await withAuthRefresh(fetchImpl)('/api/x', { headers: { Authorization: 'Bearer old' } })
  assert.equal(res.status, 401)
  assert.ok(events.includes('auth:session-expired'))
  assert.equal(store.get('accessToken'), undefined, 'stale token cleared')
})

test('another tab renewing first: its stored token is used', async () => {
  store.set('accessToken', 'old')
  const { fetchImpl } = api({
    valid: () => 'fromOtherTab',
    refreshAnswer: () => {
      // Our refresh cookie was already rotated by the other tab, which stores its token.
      setTimeout(() => store.set('accessToken', 'fromOtherTab'), 50)
      return json(401, {})
    },
  })
  __setRawFetchForTests(fetchImpl)
  const res = await withAuthRefresh(fetchImpl)('/api/x', { headers: { Authorization: 'Bearer old' } })
  assert.equal(res.status, 200)
})

test('no renewal for auth forms, non-API URLs or requests without a token', async () => {
  let refreshes = 0
  const { fetchImpl } = api({
    valid: () => 'new',
    refreshAnswer: () => {
      refreshes += 1
      return json(201, { data: { accessToken: 'new' } })
    },
  })
  __setRawFetchForTests(fetchImpl)
  const authFetch = withAuthRefresh(fetchImpl)
  assert.equal((await authFetch('/api/auth/login', { headers: { Authorization: 'Bearer old' } })).status, 401)
  assert.equal((await authFetch('https://bucket.s3.amazonaws.com/k', { headers: { Authorization: 'Bearer old' } })).status, 401)
  assert.equal((await authFetch('/api/x', { headers: {} })).status, 401)
  assert.equal(refreshes, 0)
})

test('refreshAccessToken returns null on a network error', async () => {
  __setRawFetchForTests(async () => {
    throw new TypeError('Failed to fetch')
  })
  assert.equal(await refreshAccessToken({ staleToken: 'old' }), null)
})
