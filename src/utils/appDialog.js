/**
 * In-app replacements for window.alert / confirm / prompt.
 * <AppDialogHost /> (mounted once in App) renders them with the site's own design.
 * Callable from anywhere, no hooks needed:
 *   notify('Saved', 'success')
 *   if (!(await confirmDialog('Delete this?', { variant: 'danger' }))) return
 *   const name = await promptDialog('Rename asset', current)   // null when cancelled
 */

let host = null

export function registerDialogHost(next) {
  host = next
  return () => {
    if (host === next) host = null
  }
}

const ERROR_HINT =
  /\b(fail(ed|ure)?|error|denied|not enough|insufficient|could not|couldn'?t|unable|invalid|must be|missing|not found|not supported|not available|not hooked)\b/i
const SUCCESS_HINT = /\b(success(fully)?|saved|copied|done)\b/i

/** Picks a toast style from the wording so call sites can stay a one-argument swap. */
function inferType(message) {
  const text = String(message || '')
  if (ERROR_HINT.test(text)) return 'error'
  if (SUCCESS_HINT.test(text)) return 'success'
  return 'warning'
}

/** Non-blocking message (replaces alert). */
export function notify(message, type) {
  const text = String(message ?? '').trim()
  if (!text) return
  if (host) host.notify(text, type || inferType(text))
  else console.warn('[appDialog] no host mounted:', text)
}

/** Resolves true when confirmed, false when cancelled (replaces confirm). */
export function confirmDialog(message, options = {}) {
  if (!host) return Promise.resolve(false)
  return host.confirm(String(message ?? ''), options)
}

/** Resolves the entered text, or null when cancelled (replaces prompt). */
export function promptDialog(message, defaultValue = '', options = {}) {
  if (!host) return Promise.resolve(null)
  return host.prompt(String(message ?? ''), String(defaultValue ?? ''), options)
}
