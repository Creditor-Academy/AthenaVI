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
  PAGE_DESCRIPTIONS,
  jsonLdForPath,
  openGraphTags,
  OG_IMAGE_URL,
} from './seoRoutes.js'
import { withSeoTags, NOT_FOUND_HTML } from '../../scripts/render-postbuild.mjs'
import { rewriteBuiltAssets } from '../../scripts/asset-rewrite.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')

describe('canonical and robots per page', () => {
  it('public pages get a self-referencing canonical in the form the server answers (trailing slash)', () => {
    assert.deepEqual(seoForPath('/'), {
      indexable: true,
      canonical: `${SITE_URL}/`,
      robots: 'index, follow',
      title: 'AI Video Generator | Athena Virtual Studio',
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

  it('every indexable page has a unique description under 160 characters', () => {
    for (const p of INDEXABLE_PATHS) {
      const d = seoForPath(p).description
      assert.ok(d && d.length >= 100 && d.length < 160, `${p}: ${d?.length} characters`)
    }
    assert.match(seoForPath('/products/').description, /AI avatar and video tools/)
    assert.equal(seoForPath('/login').description, null, 'none given for login / sign-up')
  })

  it('every public page has its own title and one H1; the app and hidden pages get the defaults', () => {
    const pages = [...INDEXABLE_PATHS, ...NOINDEX_PUBLIC_PATHS]
    const titles = pages.map((p) => seoForPath(p).title)
    const h1s = pages.map((p) => seoForPath(p).h1)
    for (const [i, p] of pages.entries()) {
      assert.ok(titles[i]?.endsWith('| Athena Virtual Studio') && titles[i].length < 60, `${p}: ${titles[i]} (${titles[i]?.length})`)
      assert.ok(h1s[i], `${p} has an H1`)
    }
    assert.equal(new Set(titles).size, pages.length, 'titles are unique')
    assert.equal(new Set(h1s).size, pages.length, 'H1s are unique')
    assert.match(seoForPath('/products/').title, /AI Avatar & Video Tools/)
    for (const p of ['/dashboard', '/download']) {
      assert.equal(seoForPath(p).title, 'Athena Virtual Studio', p)
      assert.equal(seoForPath(p).h1, null, p)
    }
    for (const p of ['/news', '/nope', '/technology', '/about-us', '/resources']) {
      assert.equal(seoForPath(p).title, 'Page not found | Athena Virtual Studio', p)
      assert.equal(seoForPath(p).indexable, false, p)
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
    const sitemap = read('public/sitemap.xml')
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
    // The app loads its template data from /templates/*.json while rendering public pages.
    assert.ok(!disallowed.some((d) => d.startsWith('/templates')))
  })
})

describe('built HTML', () => {
  const html =
    '<!doctype html><html><head>\n    <title>Athena Virtual Studio</title>\n  </head><body>\n    <div id="root"></div>\n    <script type="module" src="/assets/index.js"></script>\n  </body></html>'

  it('a public page gets its title and the prerendered body inside #root, not a hidden snippet', () => {
    const body = '<main><h1>Create Engaging Videos with AI</h1><a href="/products/">Products</a></main>'
    const out = withSeoTags(html, '/ai-videos', body)
    assert.ok(out.includes('<title>Text to Video AI | Athena Virtual Studio</title>'))
    assert.ok(out.includes(`<div id="root">${body}</div>`))
    assert.doesNotMatch(out, /seo-prerender/)
    assert.doesNotMatch(out, /clip:rect/)
    const nested = '<main><div><h1>E-Learning &amp; Corporate Training Videos Powered by AI</h1></div></main>'
    assert.ok(withSeoTags(html, '/learning-development', nested).includes(nested))
    assert.equal(withSeoTags(html, '/signup').match(/<h1>/g), null)
  })

  it('the app shell stays empty; unknown paths get a noindex not-found page', () => {
    for (const p of ['/dashboard/home', '/download']) {
      const out = withSeoTags(html, p)
      assert.ok(out.includes('<title>Athena Virtual Studio</title>'), p)
      assert.ok(out.includes('<div id="root"></div>'), p)
      assert.doesNotMatch(out, /seo-prerender/, p)
    }
    const missing = withSeoTags(html, '/__not-found__')
    assert.ok(missing.includes('<title>Page not found | Athena Virtual Studio</title>'))
    assert.ok(missing.includes(NOT_FOUND_HTML))
    assert.match(missing, /name="robots" content="noindex, follow"/)
    assert.doesNotMatch(missing, /rel="canonical"/)
  })

  it('a public page gets its description and canonical in <head>', () => {
    const out = withSeoTags(html, '/products')
    assert.match(out, /<link rel="canonical" href="https:\/\/virtualstudio\.lmsathena\.com\/products\/" \/>/)
    assert.ok(out.includes(`<meta name="description" content="${PAGE_DESCRIPTIONS['/products']}" />`))
    assert.doesNotMatch(out, /name="robots"/)
    assert.ok(out.includes(`property="og:image" content="${OG_IMAGE_URL}"`))
    assert.ok(out.includes('name="twitter:card" content="summary_large_image"'))
    assert.ok(out.includes('property="og:title" content="AI Avatar &amp; Video Tools | Athena Virtual Studio"'))
    assert.equal(jsonLdForPath('/products').length, 0)
  })

  it('the homepage carries Organization, WebSite and SoftwareApplication JSON-LD; help carries FAQPage', () => {
    const home = withSeoTags(html, '/')
    assert.match(home, /<script type="application\/ld\+json" id="seo-jsonld">/)
    assert.match(home, /"@type":"Organization"/)
    assert.match(home, /"@type":"WebSite"/)
    assert.match(home, /"@type":"SoftwareApplication"/)
    assert.equal(jsonLdForPath('/').map((b) => b['@type']).join(','), 'Organization,WebSite,SoftwareApplication')
    const help = withSeoTags(html, '/help')
    assert.match(help, /"@type":"FAQPage"/)
    assert.match(help, /How do I create my first video/)
    assert.equal(jsonLdForPath('/products').length, 0)
    assert.equal(openGraphTags(seoForPath('/login')).length, 0)
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
    const body = '<main><div><h1>Create AI Agents</h1><a href="/ai-videos/">AI Videos</a></div></main>'
    const withBody = withSeoTags(withSeoTags(html, '/products', body), '/products', body)
    assert.equal(withBody.match(/<h1>/g).length, 1)
    assert.equal(withBody.match(/property="og:title"/g).length, 1)
    assert.doesNotMatch(withBody, /seo-prerender/)
    assert.equal(switched.match(/<h1>/g), null)
    assert.equal(withSeoTags(withSeoTags(html, '/products', body), '/dashboard').match(/<h1>|seo-prerender|og:title/g), null)
  })

  it('rewrites prerendered source asset paths to the built files', () => {
    const html = '<img src="/src/assets/herologo.webp"><video src="/src/assets/video/preview_video_target%20(1).mp4"></video>'
    const manifest = {
      'src/assets/herologo.webp': { file: 'assets/herologo-abc.webp' },
      'src/assets/video/preview_video_target (1).mp4': { file: 'assets/preview_video_target (1)-def.mp4' },
    }
    const out = rewriteBuiltAssets(html, manifest)
    assert.equal(
      out,
      '<img src="/assets/herologo-abc.webp"><video src="/assets/preview_video_target%20(1)-def.mp4"></video>',
    )
  })
})
