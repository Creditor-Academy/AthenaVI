/**
 * The server's latest copy of each slide's elements doc, with its revision
 * (CANVAS_FIX_PLAN_25NOV2026, D-1 / D-3).
 *
 * Fed from every presentation API reply (presentationService.request), so no reply path is
 * missed. The editor uses it to send `baseRevision` with canvas saves and as the merge base
 * when a save is refused (409) or a server reply arrives while local edits are unsaved.
 */

const latest = new Map() // slideId -> { revision, doc }
const KEEP_PER_SLIDE = 8
const history = new Map() // slideId -> [{ revision, doc }] oldest → newest
// slideId -> the server revision the editor's local copy is built on. Set only when the editor
// takes a server copy in (load, an applied reply, its own save, a merge). Replies it does not
// apply (element PATCH echoes) never move it: the local copy does not contain their changes.
const localBase = new Map()

function readRevision(doc) {
  const revision = Number(doc?.revision)
  return Number.isInteger(revision) && revision >= 0 ? revision : null
}

function copy(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

function noteSlide(slide) {
  if (!slide || typeof slide !== 'object' || slide.id == null) return
  const doc = slide.elements
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.elements)) return
  const revision = readRevision(doc)
  if (revision == null) return
  const current = latest.get(slide.id)
  // Replies can arrive out of order: never step back to an older copy.
  if (current && current.revision > revision) return
  if (current && current.revision === revision) return
  const entry = { revision, doc: copy(doc) }
  latest.set(slide.id, entry)
  const list = history.get(slide.id) || []
  list.push(entry)
  while (list.length > KEEP_PER_SLIDE) list.shift()
  history.set(slide.id, list)
}

function slidesIn(payload) {
  if (!payload || typeof payload !== 'object') return []
  return [
    payload,
    payload.slide,
    payload.data?.slide,
    ...(Array.isArray(payload.slides) ? payload.slides : []),
    ...(Array.isArray(payload.deck?.slides) ? payload.deck.slides : []),
    ...(Array.isArray(payload.presentation?.deck?.slides) ? payload.presentation.deck.slides : []),
    ...(Array.isArray(payload.data?.slides) ? payload.data.slides : []),
  ]
}

/** Record every slide found in an API reply (single slide, slide list or a whole deck). */
export function noteServerSlides(payload) {
  for (const slide of slidesIn(payload)) noteSlide(slide)
}

/**
 * Slide id → revision as found in a raw API reply. The editor's normalised slides drop
 * `elements.revision`, so the load reads it from the reply itself.
 */
export function revisionsInReply(payload) {
  const map = new Map()
  for (const slide of slidesIn(payload)) {
    const revision = readRevision(slide?.elements)
    if (slide?.id != null && revision != null) map.set(slide.id, revision)
  }
  return map
}

/** The server's latest known copy of a slide: `{ revision, doc }` or null. */
export function getServerSlide(slideId) {
  return latest.get(slideId) || null
}

/** The newest stored copy older than `revision` (the base a reply at `revision` built on). */
export function getServerSlideBefore(slideId, revision) {
  const list = history.get(slideId) || []
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].revision < revision) return list[i]
  }
  return null
}

/** A slide got a new id from the server (temporary → real). */
export function renameServerSlide(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return
  if (latest.has(fromId) && !latest.has(toId)) {
    latest.set(toId, latest.get(fromId))
    history.set(toId, history.get(fromId) || [])
  }
  if (localBase.has(fromId) && !localBase.has(toId)) localBase.set(toId, localBase.get(fromId))
}

/** The editor's local copy of this slide now contains the server's copy at `revision`. */
export function setLocalBase(slideId, revision) {
  const r = Number(revision)
  if (slideId == null || !Number.isInteger(r) || r < 0) return
  localBase.set(slideId, r)
}

/**
 * What the local copy of a slide is built on: `{ revision, doc }` (`doc` may be null when that
 * copy is no longer kept), or null when unknown (then saves are sent without a revision).
 */
export function getLocalBase(slideId) {
  if (!localBase.has(slideId)) return null
  const revision = localBase.get(slideId)
  const entry = (history.get(slideId) || []).find((e) => e.revision === revision)
  return { revision, doc: entry ? entry.doc : null }
}

export function clearServerSlides() {
  latest.clear()
  history.clear()
  localBase.clear()
}
