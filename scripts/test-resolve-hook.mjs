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
`)
)
