/**
 * A name for a deck that is still "Untitled": the title text of its first slide.
 * Used to name the presentation (and its export file) before exporting.
 *
 * Slides reach the editor in several shapes — `elements` may be the element array, or the
 * canvas document `{ canvas, elements: [...] }` — and text may live in `content.text` or only
 * in `content.runs`. This never throws: a missing title just means "no better name".
 */
import { contentPlainText } from './pptTextContent.js'

const DEFAULT_TITLES = new Set(['untitled', 'untitled presentation', 'presentation', 'title', 'add a title'])

export function isDefaultDeckTitle(title) {
  const t = String(title ?? '').trim().toLowerCase()
  return !t || DEFAULT_TITLES.has(t)
}

export function slideElementList(slide) {
  if (!slide || typeof slide !== 'object') return []
  const candidates = [slide.elements, slide.elements?.elements, slide.canvas?.elements, slide.content?.elements]
  return candidates.find((list) => Array.isArray(list)) || []
}

function isTitleElement(el) {
  const slot = String(el?.slotId || '').toUpperCase()
  return el?.role === 'title' || el?.role === 'heading' || slot.includes('TITLE') || slot.includes('HEADING')
}

function cleanTitle(text) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim()
  return isDefaultDeckTitle(t) ? null : t.slice(0, 255)
}

export function deckTitleFromSlides(slides) {
  try {
    const first = Array.isArray(slides) ? slides[0] : null
    if (!first) return null
    const texts = slideElementList(first).filter((el) => el && (el.type === 'text' || el.type === 'textbox' || el.content))
    const titled = texts.find(isTitleElement)
    const fromElement = titled ? cleanTitle(contentPlainText(titled.content || {})) : null
    if (fromElement) return fromElement
    return cleanTitle(first.title) || cleanTitle(first.content?.title) || null
  } catch {
    return null
  }
}

/** The name to export under: the deck's own name, else its first slide's title, else a fallback. */
export function exportDeckTitle(deckTitle, slides, fallback = 'Presentation') {
  if (!isDefaultDeckTitle(deckTitle)) return String(deckTitle).trim()
  return deckTitleFromSlides(slides) || (String(deckTitle ?? '').trim() || fallback)
}
