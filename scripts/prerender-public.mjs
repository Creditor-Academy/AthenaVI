/**
 * Renders the public marketing pages (and the 404 page) in headless Chrome and saves that HTML.
 * App and editor routes are left as the noindex shell from render-postbuild.mjs.
 *
 * Chrome: PUPPETEER_EXECUTABLE_PATH, otherwise a local Chrome/Chromium, otherwise the
 * browser Puppeteer downloaded.
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { dirname, extname, join, normalize } from 'node:path'
import { pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer'
import {
  INDEXABLE_PATHS,
  NOINDEX_PUBLIC_PATHS,
  browserPathFor,
  seoForPath,
} from '../src/seo/seoRoutes.js'
import { gtmIdFromEnv } from '../vite.config.js'
import { inspectPublicHtml } from './inspect-public-html.mjs'

const distDir = join(process.cwd(), 'dist')
const PUBLIC_PATHS = [...INDEXABLE_PATHS, ...NOINDEX_PUBLIC_PATHS]
const NOT_FOUND_URL_PATH = '/this-page-does-not-exist'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

const APP_PREFIX = /^\/(dashboard|slides|create|p|share|invitations|invite|reset-password|auth|oauth|login\/callback)(\/|$)/
const APP_EXACT = new Set(['/hub', '/products/choose'])

function chromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH
  for (const candidate of [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]) {
    if (existsSync(candidate)) return candidate
  }
  return puppeteer.executablePath()
}

function safeFile(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const rel = decoded.replace(/^\/+/, '')
  const full = normalize(join(root, rel))
  if (!full.startsWith(normalize(root))) return null
  return full
}

function sendFile(res, status, file) {
  res.writeHead(status, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
}

/**
 * Same rules as nginx.conf: a real file, a page directory, the app shell for app routes,
 * otherwise 404.html with status 404.
 */
function createHost(root, { spaFallback }) {
  return http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    let pathname = decodeURIComponent(url.pathname)
    const app = APP_PREFIX.test(pathname) || APP_EXACT.has(pathname)
    const target = safeFile(root, pathname)
    if (target && existsSync(target) && extname(target)) {
      sendFile(res, 200, target)
      return
    }
    const asDir = target && existsSync(target) ? target : null
    const index = asDir ? join(asDir, 'index.html') : join(root, pathname.replace(/^\/+|\/+$/g, ''), 'index.html')
    if (existsSync(index) && pathname !== '/') {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${pathname}/${url.search}` })
        res.end()
        return
      }
      sendFile(res, 200, index)
      return
    }
    if (pathname === '/' || pathname === '/index.html') {
      sendFile(res, 200, join(root, 'index.html'))
      return
    }
    if (app && existsSync(join(root, 'spa.html'))) {
      sendFile(res, 200, join(root, 'spa.html'))
      return
    }
    if (spaFallback && existsSync(join(root, 'spa.html'))) {
      sendFile(res, 200, join(root, 'spa.html'))
      return
    }
    const missing = join(root, '404.html')
    if (existsSync(missing)) sendFile(res, 404, missing)
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not found')
    }
  })
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port))
  })
}

function outputFile(pathname) {
  if (pathname === '/') return join(distDir, 'index.html')
  if (pathname === '/__not-found__') return join(distDir, '404.html')
  const dir = browserPathFor(pathname).replace(/^\//, '').replace(/\/$/, '')
  return join(distDir, dir, 'index.html')
}

function gtmIdFromHtml(html) {
  const match = html.match(/googletagmanager\.com\/ns\.html\?id=(GTM-[A-Z0-9]+)/)
  return match ? match[1] : gtmIdFromEnv(process.env.VITE_GTM_ID)
}

async function renderPath(browser, origin, urlPath, seo) {
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1280, height: 900 })
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      const url = request.url()
      if (url.startsWith(origin)) request.continue().catch(() => {})
      else request.abort().catch(() => {})
    })
    page.on('pageerror', () => {})
    await page.goto(`${origin}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
    try {
      await page.waitForFunction(
        (expected) => {
          const heading = [...document.querySelectorAll('h1')]
            .map((el) =>
              el.innerHTML
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&nbsp;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim(),
            )
            .filter(Boolean)
          const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
          const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || ''
          const canonicalOk = expected.canonical ? canonical === expected.canonical : canonical === ''
          return (
            document.title === expected.title &&
            heading.length === 1 &&
            heading[0] === expected.h1 &&
            description === expected.description &&
            canonicalOk &&
            !document.querySelector('.dots-wave')
          )
        },
        { timeout: 25000 },
        {
          title: seo.title,
          h1: seo.h1,
          description: seo.description || '',
          canonical: seo.canonical || '',
        },
      )
    } catch (error) {
      const state = await page.evaluate(() => ({
        title: document.title,
        h1: [...document.querySelectorAll('h1')].map((el) =>
          el.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        ),
        loader: Boolean(document.querySelector('.dots-wave')),
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      }))
      throw new Error(`${urlPath} did not render (${error.message}). Page state: ${JSON.stringify(state)}`)
    }
    // The GTM and Clarity snippets insert a <script src> while the page is open.
    // Saving that tag would load each container twice on the next visit. Keep the inline snippets.
    const html = (await page.content())
      .split(origin)
      .join('')
      .replace(/<script\b[^>]*\bsrc="https:\/\/www\.googletagmanager\.com\/gtm\.js[^"]*"[^>]*>\s*<\/script>/gi, '')
      .replace(/<script\b[^>]*\bsrc="https:\/\/www\.clarity\.ms\/tag\/[^"]*"[^>]*>\s*<\/script>/gi, '')
    return html
  } finally {
    await page.close()
  }
}

function assertHtml(file, html, seo, gtmId) {
  const problems = inspectPublicHtml(html, {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    robots: seo.robots,
    h1: seo.h1,
    expectJsonLd: seo.canonical === 'https://virtualstudio.lmsathena.com/',
    gtmId,
    requireContent: true,
    minWords: 40,
  })
  if (problems.length) {
    throw new Error(`${file}\n  - ${problems.join('\n  - ')}`)
  }
}

async function fetchStatus(port, urlPath) {
  const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, { redirect: 'manual' })
  const text = await res.text()
  return { status: res.status, text }
}

async function main() {
  if (!existsSync(join(distDir, 'spa.html'))) {
    console.error('[prerender] dist/spa.html is missing — run the Vite build and render-postbuild first')
    process.exit(1)
  }
  const server = createHost(distDir, { spaFallback: true })
  const port = await listen(server)
  const origin = `http://127.0.0.1:${port}`
  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })
  try {
    const jobs = [
      ...PUBLIC_PATHS.map((pathname) => ({ pathname, urlPath: browserPathFor(pathname), seo: seoForPath(pathname) })),
      { pathname: '/__not-found__', urlPath: NOT_FOUND_URL_PATH, seo: seoForPath('/__not-found__') },
    ]
    let gtmId = null
    for (const job of jobs) {
      const html = await renderPath(browser, origin, job.urlPath, job.seo)
      if (!gtmId) gtmId = gtmIdFromHtml(html)
      const file = outputFile(job.pathname)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, html)
      assertHtml(file, html, job.seo, gtmId)
      const words = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').split(/\s+/).length
      console.log(`[prerender] ${job.urlPath} → ${file.replace(distDir, 'dist')} (${job.seo.title}, ~${words} tokens)`)
    }
    if (gtmId !== 'GTM-WFMG65MD') {
      throw new Error(`Expected GTM-WFMG65MD from VITE_GTM_ID, found ${gtmId || 'nothing'}`)
    }

    const shell = readFileSync(join(distDir, 'spa.html'), 'utf8')
    const shellProblems = inspectPublicHtml(shell, {
      title: 'Athena Virtual Studio',
      description: null,
      canonical: null,
      robots: 'noindex, follow',
      h1: null,
      expectJsonLd: false,
      gtmId,
      requireContent: false,
    })
    if (shellProblems.length) throw new Error(`dist/spa.html\n  - ${shellProblems.join('\n  - ')}`)
    if (shell.includes('<h1')) throw new Error('dist/spa.html prerendered an app route')
  } finally {
    await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }

  const check = createHost(distDir, { spaFallback: false })
  const checkPort = await listen(check)
  try {
    const missing = await fetchStatus(checkPort, NOT_FOUND_URL_PATH)
    if (missing.status !== 404) throw new Error(`Unknown URL returned HTTP ${missing.status}, expected 404`)
    const notFound = seoForPath('/__not-found__')
    const problems = inspectPublicHtml(missing.text, {
      title: notFound.title,
      description: notFound.description,
      canonical: null,
      robots: notFound.robots,
      h1: notFound.h1,
      expectJsonLd: false,
      gtmId: 'GTM-WFMG65MD',
      requireContent: true,
    })
    if (problems.length) throw new Error(`404 response\n  - ${problems.join('\n  - ')}`)

    const home = await fetchStatus(checkPort, '/')
    if (home.status !== 200) throw new Error(`Home returned HTTP ${home.status}`)
    if (!home.text.includes('<title>AI Avatar Videos for Training | Athena Virtual Studio</title>')) {
      throw new Error('Home HTML does not include its own title')
    }
    const products = await fetchStatus(checkPort, '/products/')
    if (products.status !== 200) throw new Error(`/products/ returned HTTP ${products.status}`)
    if (!products.text.includes('Online Course Creation Tools | Athena Virtual Studio')) {
      throw new Error('/products/ is missing its title')
    }
    const dashboard = await fetchStatus(checkPort, '/dashboard/editor')
    if (dashboard.status !== 200) throw new Error(`/dashboard/editor returned HTTP ${dashboard.status}`)
    if (!dashboard.text.includes('name="robots" content="noindex, follow"')) {
      throw new Error('App route was not served as the noindex shell')
    }
    if (dashboard.text.includes('Create AI-Powered Videos')) {
      throw new Error('App route was served the prerendered homepage')
    }
    console.log('[prerender] Unknown URL returns 404. Public pages and the app shell check out.')
  } finally {
    await new Promise((resolve) => check.close(resolve))
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('[prerender]', error)
    process.exit(1)
  })
}
