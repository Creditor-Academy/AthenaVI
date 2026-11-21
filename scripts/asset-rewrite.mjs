/**
 * Vite SSR renders imported images as their source path (`/src/assets/logo.webp`).
 * Names with spaces are percent-encoded in the HTML. The client build records the
 * hashed file in the manifest. Point the prerendered HTML at those files.
 */
function encodePath(path) {
  return String(path)
    .split('/')
    .map((part) => encodeURI(part))
    .join('/')
}

export function rewriteBuiltAssets(html, manifest) {
  if (!html || !manifest) return html
  const entries = Object.entries(manifest).filter(([, value]) => value && value.file)
  entries.sort((a, b) => String(b[0]).length - String(a[0]).length)
  let out = html
  for (const [key, value] of entries) {
    const src = String(key).replace(/\\/g, '/')
    const file = encodePath(value.file.startsWith('/') ? value.file.slice(1) : value.file)
    const hashed = `/${file}`
    if (!src || hashed.endsWith(src)) continue
    for (const from of new Set([src, encodePath(src)])) {
      out = out.split(`/${from}`).join(hashed)
      if (out.includes(from)) out = out.split(from).join(hashed)
    }
  }
  return out
}
