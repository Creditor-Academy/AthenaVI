/**
 * Hyperlinks in text boxes.
 *
 * A link is stored on a text run as `href` (set from the Link control). Web addresses typed or
 * pasted as plain text ("https://…", "www.…") are shown as links too, without being stored, so
 * a URL pasted into a text box is clickable straight away.
 *
 * Only http(s), mailto and tel links are ever rendered: hrefs come from user content.
 */

const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i
const ANY_SCHEME = /^[a-z][a-z0-9+.-]*:/i
const EMAIL = /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/
// "https://…" or "www.…" up to whitespace; trailing punctuation is trimmed in trimUrlEnd.
const URL_IN_TEXT = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi

/** The href a run may be rendered with, or null for anything that is not a safe web link. */
export function safeLinkHref(value) {
  const raw = String(value ?? '').trim()
  if (!raw || !SAFE_SCHEME.test(raw)) return null
  try {
    const url = new URL(raw)
    if (!SAFE_SCHEME.test(url.protocol)) return null
    return raw
  } catch {
    return null
  }
}

/**
 * Turns what someone typed in the Link box into an href: "example.com" → "https://example.com",
 * "name@site.com" → "mailto:name@site.com". Returns '' when it can't be a safe link.
 */
export function normalizeLinkHref(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (SAFE_SCHEME.test(raw)) return safeLinkHref(raw) || ''
  if (EMAIL.test(raw)) return safeLinkHref(`mailto:${raw}`) || ''
  // Any other scheme (javascript:, data:, file:…) is refused rather than prefixed with https.
  if (ANY_SCHEME.test(raw) && !/^[^:/]+:\d+(\/|$)/.test(raw)) return ''
  const candidate = `https://${raw.replace(/^\/+/, '')}`
  const href = safeLinkHref(candidate)
  if (!href) return ''
  // Needs a host that looks like a site ("example.com", "localhost:3000"), not a lone word.
  const host = new URL(href).hostname
  return host.includes('.') || host === 'localhost' ? href : ''
}

function trimUrlEnd(url) {
  let out = url
  for (;;) {
    const last = out[out.length - 1]
    if (/[.,;:!?'"]/.test(last)) {
      out = out.slice(0, -1)
      continue
    }
    // A closing bracket belongs to the URL only when the URL opened it ("…/Foo_(bar)").
    const pairs = { ')': '(', ']': '[', '}': '{' }
    if (pairs[last]) {
      const opens = out.split(pairs[last]).length - 1
      const closes = out.split(last).length - 1
      if (closes > opens) {
        out = out.slice(0, -1)
        continue
      }
    }
    return out
  }
}

/** Splits plain text into pieces, giving the web addresses in it an `href`. */
export function splitTextLinks(text) {
  const value = String(text ?? '')
  if (!value) return []
  const pieces = []
  let cursor = 0
  for (const match of value.matchAll(URL_IN_TEXT)) {
    const url = trimUrlEnd(match[0])
    const href = safeLinkHref(/^www\./i.test(url) ? `https://${url}` : url)
    if (!href || url.length < 5) continue
    if (match.index > cursor) pieces.push({ text: value.slice(cursor, match.index) })
    pieces.push({ text: url, href, auto: true })
    cursor = match.index + url.length
  }
  if (cursor < value.length) pieces.push({ text: value.slice(cursor) })
  return pieces
}

/**
 * Runs ready to draw: a run with a stored link keeps it (when safe); any other run has the web
 * addresses in its text split out as links.
 */
export function linkedRuns(runs) {
  const out = []
  for (const run of runs || []) {
    const text = typeof run?.text === 'string' || typeof run?.text === 'number' ? String(run.text) : ''
    if (!text) continue
    const stored = run?.href ? safeLinkHref(run.href) : null
    if (stored) {
      out.push({ ...run, text, href: stored })
      continue
    }
    const { href: _unsafe, ...rest } = run || {}
    for (const piece of splitTextLinks(text)) {
      out.push(piece.href ? { ...rest, text: piece.text, href: piece.href, autoLink: true } : { ...rest, text: piece.text })
    }
  }
  return out
}

export function textHasLinks(text) {
  return splitTextLinks(text).some((piece) => piece.href)
}
