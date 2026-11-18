#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/seo/seo.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITE_URL,
  INDEXABLE_PATHS,
  NOINDEX_PUBLIC_PATHS,
  canonicalUrl,
  seoForPath,
  normalizeSeoPath,
} from './seoRoutes.js'
import { withSeoTags } from '../../scripts/render-postbuild.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')

describe('canonical and robots per page', () => {
  it('public pages get a self-referencing canonical in the form the server answers (trailing slash)', () => {
    assert.deepEqual(seoForPath('/'), { indexable: true, canonical: `${SITE_URL}/`, robots: 'index, follow' })
    assert.equal(seoForPath('/products').canonical, `${SITE_URL}/products/`)
    assert.equal(seoForPath('/products/').canonical, `${SITE_URL}/products/`)
    assert.equal(seoForPath('/ai-avatars-videos?utm_source=x#top').canonical, `${SITE_URL}/ai-avatars-videos/`)
    for (const p of INDEXABLE_PATHS) assert.ok(seoForPath(p).indexable, p)
  })

  it('sign-in pages, the app and unknown paths: noindex, follow and no canonical', () => {
    for (const p of [...NOINDEX_PUBLIC_PATHS, '/dashboard', '/dashboard/editor', '/create', '/p/abc', '/templates', '/nope']) {
      assert.deepEqual(seoForPath(p), { indexable: false, canonical: null, robots: 'noindex, follow' }, p)
    }
  })

  it('normalises paths', () => {
    assert.equal(normalizeSeoPath(''), '/')
    assert.equal(normalizeSeoPath('products//'), '/products')
    assert.equal(canonicalUrl('//news'), `${SITE_URL}/news/`)
  })
})

describe('sitemap.xml and robots.txt', () => {
  it('the sitemap lists exactly the indexable pages, by their canonical URL', () => {
    const locs = [...read('public/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
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
    // The app loads its template data from /templates/*.json while rendering public pages.
    assert.ok(!disallowed.some((d) => d.startsWith('/templates')))
  })
})

describe('built HTML', () => {
  const html = '<!doctype html><html><head>\n    <title>Virtual Studio</title>\n  </head><body></body></html>'

  it('a public page gets its canonical in <head>', () => {
    const out = withSeoTags(html, '/products')
    assert.match(out, /<link rel="canonical" href="https:\/\/virtualstudio\.lmsathena\.com\/products\/" \/>\s*<\/head>/)
    assert.doesNotMatch(out, /name="robots"/)
  })

  it('sign-in and app pages get noindex, follow and no canonical', () => {
    for (const p of ['/login', '/signup', '/early-access', '/dashboard/home']) {
      const out = withSeoTags(html, p)
      assert.match(out, /<meta name="robots" content="noindex, follow" \/>/, p)
      assert.doesNotMatch(out, /rel="canonical"/, p)
    }
  })

  it('tags already in the HTML are replaced, never doubled', () => {
    const once = withSeoTags(withSeoTags(html, '/news'), '/news')
    assert.equal(once.match(/rel="canonical"/g).length, 1)
    const switched = withSeoTags(withSeoTags(html, '/news'), '/login')
    assert.doesNotMatch(switched, /rel="canonical"/)
    assert.equal(switched.match(/name="robots"/g).length, 1)
  })
})
