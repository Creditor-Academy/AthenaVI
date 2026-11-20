#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/seo/seo.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITE_URL,
  INDEXABLE_PATHS,
  NOINDEX_PUBLIC_PATHS,
  canonicalUrl,
  seoForPath,
  normalizeSeoPath,
  PAGE_DESCRIPTIONS,
} from './seoRoutes.js'
import { withSeoTags } from '../../scripts/render-postbuild.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')

describe('canonical and robots per page', () => {
  it('public pages get a self-referencing canonical in the form the server answers (trailing slash)', () => {
    assert.deepEqual(seoForPath('/'), {
      indexable: true,
      canonical: `${SITE_URL}/`,
      robots: 'index, follow',
      title: 'AI Course Creation Platform | Athena Virtual Studio',
      description: PAGE_DESCRIPTIONS['/'],
      h1: 'Create AI-Powered Videos That Speak Your Language',
    })
    assert.equal(seoForPath('/products').canonical, `${SITE_URL}/products/`)
    assert.equal(seoForPath('/products/').canonical, `${SITE_URL}/products/`)
    assert.equal(seoForPath('/ai-avatars-videos?utm_source=x#top').canonical, `${SITE_URL}/ai-avatars-videos/`)
    for (const p of INDEXABLE_PATHS) assert.ok(seoForPath(p).indexable, p)
  })

  it('sign-in pages, the app and unknown paths: noindex, follow and no canonical', () => {
    for (const p of [...NOINDEX_PUBLIC_PATHS, '/dashboard', '/dashboard/editor', '/create', '/p/abc', '/templates', '/nope', '/news', '/technology', '/about-us', '/resources', '/download']) {
      const seo = seoForPath(p)
      assert.equal(seo.indexable, false, p)
      assert.equal(seo.canonical, null, p)
      assert.equal(seo.robots, 'noindex, follow', p)
    }
    assert.equal(seoForPath('/dashboard').description, null, 'the app has no description')
  })

  it('every indexable page has its meta description from the marketing sheet', () => {
    for (const p of INDEXABLE_PATHS) {
      const d = seoForPath(p).description
      assert.ok(d && d.length >= 100 && d.length <= 170, `${p}: ${d?.length} characters`)
    }
    assert.match(seoForPath('/products/').description, /^Explore Athena Virtual Studio products/)
    assert.equal(seoForPath('/login').description, null, 'none given for login / sign-up')
  })

  it('every public page has its own title and one H1; the app and hidden pages get the defaults', () => {
    const pages = [...INDEXABLE_PATHS, ...NOINDEX_PUBLIC_PATHS]
    const titles = pages.map((p) => seoForPath(p).title)
    const h1s = pages.map((p) => seoForPath(p).h1)
    for (const [i, p] of pages.entries()) {
      assert.ok(titles[i]?.endsWith('| Athena Virtual Studio') && titles[i].length <= 65, `${p}: ${titles[i]}`)
      assert.ok(h1s[i], `${p} has an H1`)
    }
    assert.equal(new Set(titles).size, pages.length, 'titles are unique')
    assert.equal(new Set(h1s).size, pages.length, 'H1s are unique')
    assert.match(seoForPath('/products/').title, /online course creation tools/i, 'uses the sheet keyword')
    for (const p of ['/dashboard', '/news', '/nope', '/download']) {
      assert.equal(seoForPath(p).title, 'Athena Virtual Studio', p)
      assert.equal(seoForPath(p).h1, null, p)
    }
    assert.equal(seoForPath('/p/abc').title, null, 'a shared deck keeps its own tab title')
  })

  it('normalises paths', () => {
    assert.equal(normalizeSeoPath(''), '/')
    assert.equal(normalizeSeoPath('products//'), '/products')
    assert.equal(canonicalUrl('//products'), `${SITE_URL}/products/`)
  })
})

describe('sitemap.xml and robots.txt', () => {
  it('the sitemap lists exactly the indexable pages, by their canonical URL', () => {
    const sitemap = read('public/sitemap.xml').replace(/<!--[\s\S]*?-->/g, '') // pages hidden for now
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    assert.deepEqual(locs, INDEXABLE_PATHS.map(canonicalUrl))
    for (const p of NOINDEX_PUBLIC_PATHS) assert.ok(!locs.some((l) => l.includes(p)), `${p} is not in the sitemap`)
  })

  it('robots.txt points at the sitemap and lets crawlers see the noindex on sign-in pages', () => {
    const robots = read('public/robots.txt')
    assert.match(robots, /^User-agent: \*$/m)
    assert.match(robots, new RegExp(`^Sitemap: ${SITE_URL}/sitemap\\.xml$`, 'm'))
    const disallowed = [...robots.matchAll(/^Disallow:\s*(\S*)/gm)].map((m) => m[1])
    for (const p of [...NOINDEX_PUBLIC_PATHS, ...INDEXABLE_PATHS.filter((x) => x !== '/')]) {
      assert.ok(!disallowed.some((d) => d && p.startsWith(d)), `${p} must not be blocked`)
    }
    assert.ok(disallowed.includes('/dashboard/'))
    // Template JSON is /template-assets/*.json. /templates is an SPA route (Not Found, noindex);
    // crawlers must be allowed to fetch it to see that tag, and must be allowed to fetch the JSON.
    assert.ok(!disallowed.some((d) => d.startsWith('/templates')))
    assert.ok(!disallowed.some((d) => d.startsWith('/template-assets')))
    assert.equal(existsSync(path.join(root, 'public/templates')), false, 'public/templates would 403 on nginx')
    assert.ok(existsSync(path.join(root, 'public/template-assets/pitch_template.json')))
  })
})

describe('built HTML', () => {
  const html =
    '<!doctype html><html><head>\n    <title>Athena Virtual Studio</title>\n  </head><body>\n    <div id="root"></div>\n    <script type="module" src="/assets/index.js"></script>\n  </body></html>'

  it('a public page gets its title, and its H1 + description inside #root for crawlers', () => {
    const out = withSeoTags(html, '/ai-videos')
    assert.ok(out.includes('<title>AI Video Creation | Athena Virtual Studio</title>'))
    assert.ok(
      out.includes(
        `<div id="root"><div class="seo-prerender"><h1>Create Engaging Videos with AI</h1><p>${PAGE_DESCRIPTIONS['/ai-videos']}</p></div></div>`
      )
    )
    // Hidden from view until the app replaces it (no flash of unstyled text), still in the HTML.
    assert.match(out, /<style>\.seo-prerender\{[^<]*clip:rect\(0 0 0 0\)[^<]*<\/style>[\s\S]*<\/head>/)
    // Characters are escaped in the HTML.
    assert.ok(withSeoTags(html, '/learning-development').includes('<h1>E-Learning &amp; Corporate Training Videos Powered by AI</h1>'))
    assert.equal(withSeoTags(html, '/signup').match(/<h1>/g).length, 1)
  })

  it('the app and the 404 fallback get the default title and no prerendered heading', () => {
    for (const p of ['/dashboard/home', '/__not-found__', '/download']) {
      const out = withSeoTags(html, p)
      assert.ok(out.includes('<title>Athena Virtual Studio</title>'), p)
      assert.ok(out.includes('<div id="root"></div>'), p)
      assert.doesNotMatch(out, /seo-prerender/, p)
    }
  })

  it('a public page gets its description and canonical in <head>', () => {
    const out = withSeoTags(html, '/products')
    assert.match(out, /<link rel="canonical" href="https:\/\/virtualstudio\.lmsathena\.com\/products\/" \/>\s*<\/head>/)
    assert.ok(out.includes(`<meta name="description" content="${PAGE_DESCRIPTIONS['/products']}" />`))
    assert.doesNotMatch(out, /name="robots"/)
    // An apostrophe in a description stays inside the double-quoted attribute.
    assert.ok(withSeoTags(html, '/ethics').includes(`content="Learn about Athena's approach`))
  })

  it('sign-in and app pages get noindex, follow and no canonical', () => {
    for (const p of ['/login', '/signup', '/early-access', '/dashboard/home']) {
      const out = withSeoTags(html, p)
      assert.match(out, /<meta name="robots" content="noindex, follow" \/>/, p)
      assert.doesNotMatch(out, /rel="canonical"/, p)
    }
  })

  it('tags already in the HTML are replaced, never doubled', () => {
    const once = withSeoTags(withSeoTags(html, '/products'), '/products')
    assert.equal(once.match(/rel="canonical"/g).length, 1)
    const switched = withSeoTags(withSeoTags(html, '/products'), '/login')
    assert.doesNotMatch(switched, /rel="canonical"/)
    assert.equal(switched.match(/name="robots"/g).length, 1)
    assert.equal(once.match(/<h1>/g).length, 1)
    assert.equal(once.match(/\.seo-prerender\{/g).length, 1)
    assert.ok(switched.includes('<h1>Your studio awaits</h1>') && !switched.includes('Create AI Agents'))
    assert.equal(withSeoTags(withSeoTags(html, '/products'), '/dashboard').match(/<h1>|seo-prerender/g), null)
  })
})
