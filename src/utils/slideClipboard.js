/**
 * Copy and paste whole slides (CANVAS_FIX_PLAN_25NOV2026, S-1).
 *
 * A copied slide holds everything that makes it look the same: its elements, background
 * (colour, gradient, background photo), transition, speaker notes, title and layout. It is kept
 * in local storage, so it also pastes in another deck in the same browser, and in memory when
 * storage isn't available (private windows, blocked storage).
 */

const STORAGE_KEY = 'athena.ppt.slideClipboard.v1'
let memoryClip = null

const BACKGROUND_KEYS = [
  'backgroundColor',
  'backgroundGradientStart',
  'backgroundGradientEnd',
  'backgroundGradientAngle',
  'backgroundGradientKind',
  'backgroundGradientStops',
  'backgroundFill',
  'backgroundImage',
  'backgroundImageFit',
  'backgroundImageElementId',
]

function copy(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

/**
 * The clipboard entry for a slide. `doc` is the canvas doc a save would send for it (elements and
 * background keys); slide-level fields fill in what the doc doesn't carry.
 */
export function buildSlideClip(slide, doc) {
  if (!slide || !doc || !Array.isArray(doc.elements)) return null
  const background = {}
  for (const key of BACKGROUND_KEYS) {
    const value = doc[key] !== undefined ? doc[key] : slide[key]
    if (value !== undefined && value !== null && value !== '') background[key] = value
  }
  return copy({
    v: 1,
    copiedAt: new Date().toISOString(),
    title: slide.title || '',
    layoutId: slide.layoutId || slide.layout_id || null,
    canvas: doc.canvas || null,
    elements: doc.elements,
    background,
    transition: doc.transition || slide.transition || 'none',
    speakerNotes: doc.speakerNotes ?? slide.speakerNotes ?? '',
  })
}

export function writeSlideClipboard(clip) {
  if (!clip) return false
  memoryClip = clip
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clip))
  } catch {
    // Storage blocked or full: the in-memory copy still pastes in this tab.
  }
  return true
}

export function readSlideClipboard() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const clip = JSON.parse(raw)
      if (clip?.v === 1 && Array.isArray(clip.elements)) return clip
    }
  } catch {
    // fall back to memory
  }
  return memoryClip
}

export function hasSlideClipboard() {
  return Boolean(readSlideClipboard())
}

/**
 * What a paste creates: new element ids (groups and the background photo keep pointing at the
 * right elements), the background, transition and notes.
 * @param {(oldId: string, index: number) => string} [newId]
 */
export function pastedSlideFromClip(clip, newId) {
  if (!clip || !Array.isArray(clip.elements)) return null
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  const makeId = newId || ((oldId, i) => `el-paste-${stamp}-${i}`)
  const idMap = new Map()
  clip.elements.forEach((el, i) => {
    if (el?.id != null) idMap.set(el.id, makeId(el.id, i))
  })
  const mapId = (id) => (id != null && idMap.has(id) ? idMap.get(id) : id)
  const elements = copy(clip.elements).map((el) => {
    const next = { ...el, id: mapId(el.id) }
    if (next.groupId != null) next.groupId = mapId(next.groupId)
    if (Array.isArray(next.childIds)) next.childIds = next.childIds.map(mapId)
    return next
  })
  const background = { ...(clip.background || {}) }
  if (background.backgroundImageElementId) {
    background.backgroundImageElementId = mapId(background.backgroundImageElementId)
  }
  return {
    title: clip.title || 'Slide',
    layoutId: clip.layoutId || null,
    elements,
    background,
    transition: clip.transition || 'none',
    speakerNotes: clip.speakerNotes || '',
  }
}
