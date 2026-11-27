#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/utils/analytics.test.mjs */
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
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
import { gtmIdFromEnv, gtmSnippet, injectGoogleTagManager } from '../../vite.config.js'
import { withSeoTags } from '../../scripts/render-postbuild.mjs'

const OWNED_GTM_ID = 'GTM-WFMG65MD'
const RETIRED_GTM_ID = 'GTM-M4CC43NS'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const countOf = (html, needle) => html.split(needle).length - 1

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
  const shell =
    '<!doctype html><html><head>\n    <title>Athena Virtual Studio</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body></html>'

  it('uses the owned container unless VITE_GTM_ID says otherwise', () => {
    assert.equal(gtmIdFromEnv(undefined), OWNED_GTM_ID)
    assert.equal(gtmIdFromEnv(''), OWNED_GTM_ID)
    assert.equal(gtmIdFromEnv('GTM-ABC123'), 'GTM-ABC123')
    for (const off of ['off', 'false', '0', 'none', 'OFF', 'False']) {
      assert.equal(gtmIdFromEnv(off), null, off)
    }
    assert.equal(gtmIdFromEnv('"><script>'), null, 'only a real container id')
  })

  it("is Google's standard head snippet (gtm.start, no separate gtag.js)", () => {
    const html = gtmSnippet(OWNED_GTM_ID)
    assert.equal(
      html,
      `<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${OWNED_GTM_ID}');</script><!-- End Google Tag Manager -->`
    )
    assert.equal(html.includes('function gtag'), false)
    assert.equal(html.includes('googletagmanager.com/gtag/js'), false)
    assert.equal(html.includes(RETIRED_GTM_ID), false)
  })

  it('puts the container once in <head> and once in the <body> noscript', () => {
    const built = injectGoogleTagManager(shell, gtmIdFromEnv(undefined))
    const head = built.slice(0, built.search(/<\/head>/i))
    const body = built.slice(built.search(/<body/i))
    assert.equal(countOf(head, OWNED_GTM_ID), 1)
    assert.equal(countOf(body, OWNED_GTM_ID), 1)
    assert.match(head, /<head>\s*<!-- Google Tag Manager -->/)
    assert.match(
      body,
      new RegExp(
        `^<body>\\s*<noscript><iframe src="https://www\\.googletagmanager\\.com/ns\\.html\\?id=${OWNED_GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
      )
    )
    assert.equal(built.includes(RETIRED_GTM_ID), false)
    assert.equal(injectGoogleTagManager(shell, null), shell)
  })

  it('postbuild copies keep the head snippet and the noscript', () => {
    const built = injectGoogleTagManager(shell, OWNED_GTM_ID)
    for (const pathname of ['/', '/products', '/login', '/dashboard/home', '/__not-found__']) {
      const page = withSeoTags(built, pathname)
      const head = page.slice(0, page.search(/<\/head>/i))
      const body = page.slice(page.search(/<body/i))
      assert.equal(countOf(head, OWNED_GTM_ID), 1, pathname)
      assert.equal(countOf(body, OWNED_GTM_ID), 1, pathname)
      assert.match(body, /<noscript><iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-WFMG65MD"/, pathname)
      assert.equal(page.includes(RETIRED_GTM_ID), false, pathname)
    }
  })
})

function walkFiles(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...walkFiles(full))
    else if (statSync(full).isFile()) found.push(full)
  }
  return found
}

describe('built HTML', () => {
  const distDir = path.join(root, 'dist')
  const distIndex = path.join(distDir, 'index.html')

  it('contains the owned container once in head and once in noscript, and never the retired container', {
    skip: existsSync(distIndex) ? false : 'dist/index.html is written by npm run build',
  }, () => {
    const files = walkFiles(distDir)
    const retired = files.filter((file) => readFileSync(file).includes(RETIRED_GTM_ID))
    assert.deepEqual(retired, [], 'GTM-M4CC43NS must not appear in the built output')

    const htmlFiles = files.filter((file) => file.endsWith('.html'))
    // App pages are the built index.html and the postbuild copies of it. export-render.html
    // is a headless backend page and must stay free of the marketing container.
    const generated = htmlFiles.filter((file) => {
      if (path.basename(file) === 'export-render.html') return false
      const html = readFileSync(file, 'utf8')
      return html.includes('id="root"') || html.includes("id='root'")
    })
    assert.ok(generated.includes(distIndex))
    for (const file of generated) {
      const html = readFileSync(file, 'utf8')
      const head = html.slice(0, html.search(/<\/head>/i))
      const body = html.slice(html.search(/<body/i))
      const rel = path.relative(distDir, file)
      assert.equal(countOf(head, OWNED_GTM_ID), 1, `${rel} head`)
      assert.equal(countOf(body, OWNED_GTM_ID), 1, `${rel} noscript`)
      assert.match(body, /<noscript><iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-WFMG65MD"/, rel)
      assert.equal(html.includes('googletagmanager.com/gtag/js'), false, rel)
    }

    const exportRender = path.join(distDir, 'export-render.html')
    if (existsSync(exportRender)) {
      assert.equal(readFileSync(exportRender, 'utf8').includes(OWNED_GTM_ID), false)
    }
  })
})
