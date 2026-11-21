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
  PLACEHOLDER_PATHS,
  canonicalUrl,
  seoForPath,
  normalizeSeoPath,
  browserPathFor,
  jsonLdForPath,
  PAGE_DESCRIPTIONS,
  LCP_IMAGE_PATH,
} from './seoRoutes.js'
import { withSeoTags } from '../../scripts/render-postbuild.mjs'
import { inspectPublicHtml } from '../../scripts/inspect-public-html.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')

describe('canonical and robots per page', () => {
  it('public pages get a self-referencing canonical in the form the server answers (trailing slash)', () => {
    assert.deepEqual(seoForPath('/'), {
      indexable: true,
      canonical: `${SITE_URL}/`,
      robots: 'index, follow',
      title: 'AI Avatar Videos for Training | Athena Virtual Studio',
      description: PAGE_DESCRIPTIONS['/'],
      h1: 'Create AI-Powered Videos That Speak Your Language',
    })
    assert.equal(seoForPath('/products').canonical, `${SITE_URL}/products/`)
    assert.equal(seoForPath('/products/').canonical, `${SITE_URL}/products/`)
    assert.equal(seoForPath('/ai-avatars-videos?utm_source=x#top').canonical, `${SITE_URL}/ai-avatars-videos/`)
    for (const p of INDEXABLE_PATHS) assert.ok(seoForPath(p).indexable, p)
  })

  it('sign-in pages are public and noindex, with their own canonical', () => {
    for (const p of NOINDEX_PUBLIC_PATHS) {
      const seo = seoForPath(p)
      assert.equal(seo.indexable, false, p)
      assert.equal(seo.canonical, canonicalUrl(p), p)
      assert.equal(seo.robots, 'noindex, follow', p)
      assert.ok(seo.description && seo.description.length < 155, p)
      assert.ok(seo.title.length < 60, p)
    }
  })

  it('the app and unknown paths: noindex, follow and no canonical', () => {
    for (const p of ['/dashboard', '/dashboard/editor', '/create', '/p/abc', '/templates', '/nope', '/news', '/technology', '/about-us', '/resources', '/download']) {
      const seo = seoForPath(p)
      assert.equal(seo.indexable, false, p)
      assert.equal(seo.canonical, null, p)
      assert.equal(seo.robots, 'noindex, follow', p)
    }
    assert.equal(seoForPath('/dashboard').description, null, 'the app has no description')
    assert.equal(seoForPath('/nope').title, 'Page Not Found | Athena Virtual Studio')
    assert.equal(seoForPath('/nope').h1, 'Page Not Found')
  })

  it('every public page has a unique title under 60 characters and a description under 155', () => {
    const pages = [...INDEXABLE_PATHS, ...NOINDEX_PUBLIC_PATHS]
    const titles = pages.map((p) => seoForPath(p).title)
    const h1s = pages.map((p) => seoForPath(p).h1)
    for (const [i, p] of pages.entries()) {
      assert.ok(titles[i]?.endsWith('| Athena Virtual Studio') && titles[i].length < 60, `${p}: ${titles[i]} (${titles[i]?.length})`)
      assert.ok(h1s[i], `${p} has an H1`)
      const description = seoForPath(p).description
      assert.ok(description && description.length < 155, `${p}: ${description?.length} characters`)
    }
    assert.equal(new Set(titles).size, pages.length, 'titles are unique')
    assert.equal(new Set(h1s).size, pages.length, 'H1s are unique')
    assert.match(seoForPath('/products/').title, /online course creation tools/i, 'uses the sheet keyword')
    assert.equal(seoForPath('/').title, 'AI Avatar Videos for Training | Athena Virtual Studio')
    assert.equal(seoForPath('/dashboard').title, 'Athena Virtual Studio')
    assert.equal(seoForPath('/dashboard').h1, null)
    assert.equal(seoForPath('/download').title, 'Athena Virtual Studio')
    assert.equal(seoForPath('/p/abc').title, null, 'a shared deck keeps its own tab title')
    for (const p of INDEXABLE_PATHS) {
      const description = seoForPath(p).description
      assert.ok(description.length >= 100, `${p}: ${description.length} characters`)
    }
  })

  it('normalises paths', () => {
    assert.equal(normalizeSeoPath(''), '/')
    assert.equal(normalizeSeoPath('products//'), '/products')
    assert.equal(canonicalUrl('//products'), `${SITE_URL}/products/`)
  })
})

describe('sitemap.xml and robots.txt', () => {
  it('the sitemap lists exactly the indexable pages, by their canonical URL', () => {
    const raw = read('public/sitemap.xml')
    const sitemap = raw.replace(/<!--[\s\S]*?-->/g, '')
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    assert.deepEqual(locs, INDEXABLE_PATHS.map(canonicalUrl))
    for (const p of NOINDEX_PUBLIC_PATHS) assert.ok(!locs.some((l) => l.includes(p)), `${p} is not in the sitemap`)
    for (const p of PLACEHOLDER_PATHS) {
      assert.equal(raw.includes(`${SITE_URL}${p}`), false, `${p} is not in the sitemap file`)
    }
  })

  it('header and footer expose real links, including signup with its trailing slash', () => {
    const navMap = read('src/seo/publicNav.js')
    const nav = read('src/components/layout/Navbar/Navbar.jsx')
    const footer = read('src/components/layout/Footer/Footer.jsx')
    const hero = read('src/components/layout/Hero.jsx')
    for (const p of INDEXABLE_PATHS.filter((path) => path !== '/')) {
      assert.ok(navMap.includes(`'${browserPathFor(p)}'`), `${browserPathFor(p)} is a public href`)
    }
    assert.match(nav, /href=\{hrefForProduct/)
    assert.match(nav, /href=\{hrefForSolution/)
    assert.match(nav, /href=\{HREF\.useCases\}/)
    assert.match(nav, /href=\{HREF\.signup\}/)
    assert.match(nav, /href=\{HREF\.login\}/)
    assert.match(footer, /href=\{HREF\.ethics\}/)
    assert.match(footer, /href=\{HREF\.privacy\}/)
    assert.match(footer, /href=\{HREF\.help\}/)
    assert.match(footer, /href=\{HREF\.athenaLms\}/)
    assert.match(navMap, /https:\/\/lmsathena\.com/)
    assert.match(hero, /href=\{HREF\.signup\}/)
    assert.match(hero, /href=\{HREF\.sales\}/)
    const linked = navMap + nav + footer + hero
    for (const p of PLACEHOLDER_PATHS) {
      assert.equal(linked.includes(`href="${p}`), false, `${p} is not linked`)
      assert.equal(navMap.includes(`'${p}/'`), false, `${p} is not a public href`)
    }
    assert.equal(linked.includes('href="/signup"'), false)
    assert.equal(linked.includes("'/signup'"), false)
    assert.ok(navMap.includes("signup: '/signup/'"))
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

  it('the head shell does not invent a hidden heading; the prerender step writes the page', () => {
    const out = withSeoTags(html, '/ai-videos')
    assert.ok(out.includes('<title>AI Video Creation | Athena Virtual Studio</title>'))
    assert.ok(out.includes('<div id="root"></div>'))
    assert.doesNotMatch(out, /seo-prerender/)
    assert.equal(out.match(/<h1>/g), null)
  })

  it('the app gets the default title and an empty root', () => {
    for (const p of ['/dashboard/home', '/download']) {
      const out = withSeoTags(html, p)
      assert.ok(out.includes('<title>Athena Virtual Studio</title>'), p)
      assert.ok(out.includes('<div id="root"></div>'), p)
      assert.doesNotMatch(out, /seo-prerender/, p)
      assert.match(out, /<meta name="robots" content="noindex, follow" \/>/, p)
    }
  })

  it('the 404 shell is noindex and the Not Found page has one H1', () => {
    const out = withSeoTags(html, '/__not-found__')
    assert.ok(out.includes('<title>Page Not Found | Athena Virtual Studio</title>'))
    assert.match(out, /<meta name="robots" content="noindex, follow" \/>/)
    assert.doesNotMatch(out, /rel="canonical"/)
    assert.doesNotMatch(out, /application\/ld\+json/)
    const page = read('src/pages/NotFound/NotFound.jsx')
    assert.equal(page.match(/<h1\b/g).length, 1)
    assert.ok(page.includes('Page Not Found'))
  })

  it('a public page gets description, canonical, Open Graph and Twitter tags in <head>', () => {
    const out = withSeoTags(html, '/products')
    assert.match(out, /<link rel="canonical" href="https:\/\/virtualstudio\.lmsathena\.com\/products\/" \/>/)
    assert.ok(out.includes(`<meta name="description" content="${PAGE_DESCRIPTIONS['/products']}" />`))
    assert.match(out, /<meta name="robots" content="index, follow" \/>/)
    assert.match(out, /property="og:title" content="Online Course Creation Tools \| Athena Virtual Studio"/)
    assert.match(out, /property="og:url" content="https:\/\/virtualstudio\.lmsathena\.com\/products\/"/)
    assert.match(out, /property="og:image" content="https:\/\/virtualstudio\.lmsathena\.com\/og-cover\.webp"/)
    assert.match(out, /name="twitter:card" content="summary_large_image"/)
    assert.match(out, /name="twitter:title" content="Online Course Creation Tools \| Athena Virtual Studio"/)
    assert.doesNotMatch(out, /application\/ld\+json/)
    // An apostrophe in a description stays inside the double-quoted attribute.
    assert.ok(withSeoTags(html, '/ethics').includes(`content="Learn about Athena's approach`))
    const home = withSeoTags(html, '/')
    assert.match(home, new RegExp(`href="${LCP_IMAGE_PATH.replace('/', '\\/')}"`))
    assert.match(home, /data-seo-lcp="1"/)
    assert.match(home, /<script type="application\/ld\+json" id="seo-jsonld">/)
    const json = JSON.parse(home.match(/<script type="application\/ld\+json" id="seo-jsonld">([\s\S]*?)<\/script>/)[1])
    assert.equal(json['@type'], 'SoftwareApplication')
    assert.equal(json.name, 'Athena Virtual Studio')
    assert.equal(json.url, 'https://virtualstudio.lmsathena.com/')
    assert.equal(json.description, PAGE_DESCRIPTIONS['/'])
    assert.equal(json.telephone, undefined)
    assert.equal(json.address, undefined)
    assert.equal(json.aggregateRating, undefined)
    assert.equal(jsonLdForPath('/products'), null)
    assert.equal(jsonLdForPath('/login'), null)
  })

  it('sign-in pages get their own canonical; the app does not', () => {
    for (const p of ['/login', '/signup', '/early-access']) {
      const out = withSeoTags(html, p)
      assert.match(out, /<meta name="robots" content="noindex, follow" \/>/, p)
      assert.match(out, new RegExp(`rel="canonical" href="${canonicalUrl(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), p)
      assert.match(out, /property="og:title"/, p)
      assert.match(out, /name="twitter:card"/, p)
      assert.doesNotMatch(out, /seo-jsonld/, p)
    }
    const app = withSeoTags(html, '/dashboard/home')
    assert.match(app, /<meta name="robots" content="noindex, follow" \/>/)
    assert.doesNotMatch(app, /rel="canonical"/)
    assert.doesNotMatch(app, /property="og:/)
    assert.doesNotMatch(app, /twitter:/)
  })

  it('a saved page with an apostrophe or ampersand still matches its title and description', () => {
    const seo = seoForPath('/marketing-suite')
    const html = `<!doctype html><html><head>
      <script>j.src='https://www.googletagmanager.com/gtm.js?id='+i;})(window,document,'script','dataLayer','GTM-WFMG65MD');</script>
      <title>${seo.title}</title>
      <meta name="description" content="${seo.description.replace(/'/g, '&#39;')}">
      <link rel="canonical" href="${seo.canonical}">
      <meta name="robots" content="${seo.robots}">
      <meta property="og:type" content="website">
      <meta property="og:site_name" content="Athena Virtual Studio">
      <meta property="og:title" content="${seo.title}">
      <meta property="og:description" content="${seo.description}">
      <meta property="og:url" content="${seo.canonical}">
      <meta property="og:image" content="https://virtualstudio.lmsathena.com/og-cover.webp">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${seo.title}">
      <meta name="twitter:description" content="${seo.description}">
      <meta name="twitter:image" content="https://virtualstudio.lmsathena.com/og-cover.webp">
      </head><body>
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WFMG65MD"></iframe></noscript>
      <h1>${seo.h1}</h1>
      <p>${'Athena Virtual Studio publishes marketing pages for teams that create videos. '.repeat(6)}</p>
      <img alt="Athena Virtual Studio logo" src="/logo.webp">
      </body></html>`
    const learning = seoForPath('/learning-development')
    const titled = html.replace(seo.title, 'Learning &amp; Development Tools | Athena Virtual Studio')
    assert.deepEqual(inspectPublicHtml(html, {
      title: seo.title,
      description: seo.description,
      canonical: seo.canonical,
      robots: seo.robots,
      h1: seo.h1,
      expectJsonLd: false,
      gtmId: 'GTM-WFMG65MD',
      requireContent: true,
    }), [])
    assert.equal(
      inspectPublicHtml(titled, {
        title: learning.title,
        description: seo.description,
        canonical: seo.canonical,
        robots: seo.robots,
        h1: seo.h1,
        gtmId: 'GTM-WFMG65MD',
        requireContent: true,
      }).some((problem) => problem.startsWith('title is')),
      false,
    )
  })

  it('tags already in the HTML are replaced, never doubled', () => {
    const once = withSeoTags(withSeoTags(html, '/products'), '/products')
    assert.equal(once.match(/rel="canonical"/g).length, 1)
    assert.equal(once.match(/property="og:title"/g).length, 1)
    assert.equal(once.match(/name="twitter:card"/g).length, 1)
    assert.equal(once.match(/id="seo-jsonld"/g), null)
    const switched = withSeoTags(withSeoTags(html, '/'), '/login')
    assert.equal(switched.match(/rel="canonical"/g).length, 1)
    assert.match(switched, /href="https:\/\/virtualstudio\.lmsathena\.com\/login\/"/)
    assert.doesNotMatch(switched, /seo-jsonld/)
    assert.equal(switched.match(/name="robots"/g).length, 1)
    assert.equal(once.match(/<h1>|seo-prerender/g), null)
    const app = withSeoTags(withSeoTags(html, '/products'), '/dashboard')
    assert.equal(app.match(/rel="canonical"|property="og:|twitter:|seo-jsonld|<h1>/g), null)
  })
})
