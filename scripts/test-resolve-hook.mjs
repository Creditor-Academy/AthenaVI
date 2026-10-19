/**
 * Node resolve hook for `npm test`: app modules import siblings without an extension
 * (`./presentationHelpers`), which Vite resolves but Node's ESM loader does not.
 * Retry those specifiers with `.js` / `/index.js` before giving up.
 */
import { register } from 'node:module'

register(
  'data:text/javascript,' +
    encodeURIComponent(`
const CANDIDATES = ['.js', '/index.js']
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../')
    if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !relative || /\\.[cm]?jsx?$/.test(specifier)) throw error
    for (const suffix of CANDIDATES) {
      try {
        return await nextResolve(specifier + suffix, context)
      } catch {
        // try the next candidate
      }
    }
    throw error
  }
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context)
  if (result.format !== 'module' || result.source == null) return result
  const original = typeof result.source === 'string'
    ? result.source
    : Buffer.from(result.source).toString('utf8')
  if (!original.includes('import.meta.env')) return result
  const source =
    'const __viteEnv = globalThis.__ATHENA_VITE_ENV__ || { VITE_API_BASE_URL: "", VITE_ENV: "test", DEV: false, PROD: false, MODE: "test" };\\n' +
    original.replace(/import\\.meta\\.env/g, '__viteEnv')
  return { shortCircuit: true, format: 'module', source }
}
`)
)
