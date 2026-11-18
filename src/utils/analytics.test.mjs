#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/utils/analytics.test.mjs */
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  trackEvent,
  trackSignUp,
  trackLogin,
  trackGoogleAuth,
  rememberSignupSource,
  downloadDetails,
  installDownloadTracking,
  resetAnalyticsForTests,
} from './analytics.js'
import { gtmIdFromEnv, gtmSnippet } from '../../vite.config.js'

function memoryStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  }
}

const events = () => window.dataLayer.map(({ event, ...rest }) => ({ event, ...rest }))

describe('analytics key events (dataLayer for Google Tag Manager)', () => {
  beforeEach(() => {
    globalThis.window = {
      sessionStorage: memoryStorage(),
      location: { pathname: '/', href: 'https://virtualstudio.lmsathena.com/' },
    }
    resetAnalyticsForTests()
  })

  it('pushes { event, ...params } to dataLayer, creating it if needed', () => {
    trackEvent('login', { method: 'email' })
    assert.deepEqual(events(), [{ event: 'login', method: 'email' }])
  })

  it('sign-up and login carry the method, never personal data', () => {
    trackSignUp('email')
    trackLogin('google')
    assert.deepEqual(events(), [
      { event: 'sign_up', method: 'email' },
      { event: 'login', method: 'google' },
    ])
  })

  it('a sign-up that started on /early-access is also an early-access submission (once)', () => {
    rememberSignupSource('/early-access/')
    trackSignUp('email')
    trackSignUp('email')
    assert.deepEqual(events(), [
      { event: 'sign_up', method: 'email', signup_source: 'early_access' },
      { event: 'early_access_submit', method: 'email' },
      { event: 'sign_up', method: 'email' },
    ])
  })

  it('other pages are not an early-access source', () => {
    rememberSignupSource('/signup')
    trackSignUp('email')
    assert.deepEqual(events(), [{ event: 'sign_up', method: 'email' }])
  })

  it('Google sign-in: sign_up for a new account, login otherwise, and only once per page', () => {
    trackGoogleAuth(true)
    trackGoogleAuth(true)
    assert.deepEqual(events(), [{ event: 'sign_up', method: 'google' }])
    resetAnalyticsForTests()
    window.dataLayer = []
    trackGoogleAuth(false)
    assert.deepEqual(events(), [{ event: 'login', method: 'google' }])
  })

  it('download details: file type and where it came from, without the file name or signed query', () => {
    const anchor = (download, href) => ({ getAttribute: (k) => (k === 'download' ? download : href), href })
    assert.deepEqual(
      downloadDetails(anchor('Q3 Plan.PPTX', 'https://bucket.s3.amazonaws.com/presentation-exports/w/d/e.pptx?X-Amz-Signature=abc')),
      { file_extension: 'pptx', link_domain: 'bucket.s3.amazonaws.com', page_path: '/' }
    )
    assert.deepEqual(downloadDetails(anchor('slides.zip', 'blob:https://virtualstudio.lmsathena.com/uuid')), {
      file_extension: 'zip',
      link_domain: 'blob',
      page_path: '/',
    })
    assert.equal(downloadDetails(anchor('', 'https://cdn.example.com/video.mp4?sig=1')).file_extension, 'mp4')
  })

  it('every <a download> click is reported once; a click the app takes over is not', () => {
    let handler = null
    const doc = { addEventListener: (type, fn) => { if (type === 'click') handler = fn }, removeEventListener: () => { handler = null } }
    const stop = installDownloadTracking(doc)
    const anchor = { getAttribute: (k) => (k === 'download' ? 'deck.pdf' : 'https://x.test/deck.pdf'), href: 'https://x.test/deck.pdf' }
    const click = (target, defaultPrevented = false) => handler({ target, defaultPrevented })

    click({ closest: () => anchor })
    click({ closest: () => anchor }, true) // the dialog's Download link hands off to another link
    click({ closest: () => null }) // any other click
    assert.deepEqual(events(), [{ event: 'file_download', file_extension: 'pdf', link_domain: 'x.test', page_path: '/' }])
    stop()
    assert.equal(handler, null)
  })
})

describe('Google Tag Manager snippet', () => {
  it('uses the marketing container unless VITE_GTM_ID says otherwise', () => {
    assert.equal(gtmIdFromEnv(undefined), 'GTM-M4CC43NS')
    assert.equal(gtmIdFromEnv(''), 'GTM-M4CC43NS')
    assert.equal(gtmIdFromEnv('GTM-ABC123'), 'GTM-ABC123')
    assert.equal(gtmIdFromEnv('off'), null)
    assert.equal(gtmIdFromEnv('"><script>'), null, 'only a real container id')
  })

  it('is the snippet from the Google tag setup page', () => {
    const html = gtmSnippet('GTM-M4CC43NS')
    assert.ok(html.includes('<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-M4CC43NS"></script>'))
    assert.ok(html.includes('window.dataLayer = window.dataLayer || [];'))
    assert.ok(html.includes('function gtag(){dataLayer.push(arguments);}'))
    assert.ok(html.includes("gtag('js', new Date());"))
  })
})
