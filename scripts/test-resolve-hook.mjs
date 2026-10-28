/**
 * Node resolve hook for `npm test`: app modules import siblings without an extension
 * (`./presentationHelpers`), which Vite resolves but Node's ESM loader does not.
 * JSX files are transformed so a test can render a shared component.
 */
import { register } from 'node:module'

register(new URL('./test-module-hooks.mjs', import.meta.url).href, import.meta.url)
