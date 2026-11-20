/**
 * Loading a deck paints the slides first and fills in their graphics afterwards. Edits made in
 * between (or a slide added meanwhile) used to be overwritten when the loaded copy landed, and a
 * pending save then sent the old content back (QA P-1). This keeps them.
 *
 * `current`: the slides on screen; `loaded`: the slides from the server (hydrated);
 * `edited`: ids of slides edited since the load started.
 * Returns the slides to show: the loaded copy of each slide, except slides edited meanwhile
 * (kept as they are) and slides the server doesn't have yet (kept, in place). Slides deleted
 * meanwhile stay deleted.
 */
export function mergeLoadedSlides(current, loaded, edited = new Set()) {
  const next = Array.isArray(loaded) ? loaded : []
  if (!Array.isArray(current) || !current.length) return next
  const sameOrder =
    current.length === next.length && next.every((slide, i) => current[i]?.id === slide?.id)
  if (sameOrder && !next.some((slide) => edited.has(slide?.id))) return next
  const byId = new Map(next.map((slide) => [slide?.id, slide]))
  return current.map((slide) => (edited.has(slide?.id) || !byId.has(slide?.id) ? slide : byId.get(slide.id)))
}
