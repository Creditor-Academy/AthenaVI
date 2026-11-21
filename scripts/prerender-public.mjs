/**
 * Render each indexable marketing page to HTML at build time (Vite SSR + React prerender).
 * App and auth routes are not rendered: they stay a noindex shell.
 */
import { finished } from 'node:stream/promises'
import { createServer } from 'vite'
import { prerenderToNodeStream } from 'react-dom/static'

async function readNodeStream(stream) {
  const chunks = []
  stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
  await finished(stream)
  return Buffer.concat(chunks).toString('utf8')
}

export async function prerenderIndexablePages() {
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const mod = await vite.ssrLoadModule('/src/seo/prerenderPages.jsx')
    const pages = {}
    for (const pathname of mod.INDEXABLE_PATHS) {
      const element = mod.pageElement(pathname)
      if (!element) throw new Error(`[prerender] no page component for ${pathname}`)
      const { prelude } = await prerenderToNodeStream(element)
      pages[pathname] = await readNodeStream(prelude)
      const text = pages[pathname].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (!/<h1[\s>]/i.test(pages[pathname]) || !/<a [^>]*href="\/[^"]*"/i.test(pages[pathname])) {
        throw new Error(`[prerender] ${pathname} is missing a heading or a real link`)
      }
      console.log(`[prerender] ${pathname} (${text.length} chars of text)`)
    }
    return pages
  } finally {
    await vite.close()
  }
}
