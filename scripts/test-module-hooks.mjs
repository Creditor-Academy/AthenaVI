/**
 * Node loader for `npm test`.
 * Resolves extensionless app imports, stubs CSS, and transforms JSX so a test
 * can render a shared slide component without a browser.
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { transformSync } from 'esbuild'

const CANDIDATES = ['.js', '.jsx', '/index.js']

function sourceText(source) {
  if (source == null) return ''
  return typeof source === 'string' ? source : Buffer.from(source).toString('utf8')
}

function withViteEnv(source) {
  if (!source.includes('import.meta.env')) return source
  return (
    'const __viteEnv = globalThis.__ATHENA_VITE_ENV__ || { VITE_API_BASE_URL: "", VITE_ENV: "test", DEV: false, PROD: false, MODE: "test" };\n' +
    source.replace(/import\.meta\.env/g, '__viteEnv')
  )
}

function fileUrlFor(specifier, context) {
  if (!context.parentURL) return pathToFileURL(specifier).href
  return new URL(specifier, context.parentURL).href
}

const ASSET = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|woff2?)$/

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css')) {
    return { shortCircuit: true, url: 'data:text/css,/* test css stub */' }
  }
  if (ASSET.test(specifier.split('?')[0])) {
    return { shortCircuit: true, url: 'data:text/javascript,export default "asset"' }
  }
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    const jsx = specifier.endsWith('.jsx')
    if (jsx && (specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('file:'))) {
      return { shortCircuit: true, url: specifier.startsWith('file:') ? specifier : fileUrlFor(specifier, context) }
    }
    const relative = specifier.startsWith('./') || specifier.startsWith('../')
    if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !relative || /\.[cm]?jsx?$/.test(specifier)) throw error
    for (const suffix of CANDIDATES) {
      const next = specifier + suffix
      if (suffix === '.jsx') {
        const jsxUrl = fileUrlFor(next, context)
        if (existsSync(fileURLToPath(jsxUrl))) return { shortCircuit: true, url: jsxUrl }
        continue
      }
      try {
        return await nextResolve(next, context)
      } catch {
        // try the next candidate
      }
    }
    throw error
  }
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('data:text/css')) {
    return { format: 'module', source: 'export default {}', shortCircuit: true }
  }
  if (url.startsWith('data:text/javascript,')) {
    return { format: 'module', source: decodeURIComponent(url.slice('data:text/javascript,'.length)), shortCircuit: true }
  }
  if (url.endsWith('.jsx')) {
    const source = withViteEnv(transformSync(readFileSync(fileURLToPath(url), 'utf8'), {
      loader: 'jsx',
      jsx: 'automatic',
      format: 'esm',
      sourcefile: url,
    }).code)
    return { format: 'module', source, shortCircuit: true }
  }

  const result = await nextLoad(url, context)
  if (result.format !== 'module' || result.source == null) return result
  const original = sourceText(result.source)
  if (!original.includes('import.meta.env')) return result
  return { shortCircuit: true, format: 'module', source: withViteEnv(original) }
}
