/**
 * Image crop shared by the slide editor and the canvas editor.
 *
 * `content.crop = { x, y, width, height }` — the visible region of the source image, as
 * fractions (0–1) of its natural size. Missing / full-image crops mean "no crop".
 * When a crop is applied the element frame takes the crop's aspect ratio, so the region is
 * drawn stretched to the frame without distortion.
 */

export const MIN_CROP_FRACTION = 0.02

const clamp01 = (n) => Math.min(1, Math.max(0, n))

/** Clamp a stored crop to the image; null when there is nothing to crop. */
export function normalizeCrop(crop) {
  if (!crop || typeof crop !== 'object') return null
  const x = clamp01(Number(crop.x) || 0)
  const y = clamp01(Number(crop.y) || 0)
  let width = Number(crop.width)
  let height = Number(crop.height)
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null
  width = Math.min(Math.max(MIN_CROP_FRACTION, width), 1 - x)
  height = Math.min(Math.max(MIN_CROP_FRACTION, height), 1 - y)
  if (width <= 0 || height <= 0) return null
  const full = x < 0.001 && y < 0.001 && width > 0.999 && height > 0.999
  return full ? null : { x, y, width, height }
}

/** Style for an absolutely positioned <img> so that `crop` exactly fills its container. */
export function croppedImageStyle(crop) {
  const c = normalizeCrop(crop)
  if (!c) return null
  return {
    position: 'absolute',
    left: `${(-c.x / c.width) * 100}%`,
    top: `${(-c.y / c.height) * 100}%`,
    width: `${100 / c.width}%`,
    height: `${100 / c.height}%`,
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'fill',
  }
}

/** Width / height of the cropped region in source pixels' proportions. */
export function cropAspectRatio(crop, naturalWidth, naturalHeight) {
  const w = Number(naturalWidth) || 0
  const h = Number(naturalHeight) || 0
  if (!(w > 0 && h > 0)) return null
  const c = normalizeCrop(crop) || { x: 0, y: 0, width: 1, height: 1 }
  return (c.width * w) / (c.height * h)
}

/**
 * Placement after applying a crop: keep the frame's width and centre, and take the crop's
 * aspect ratio (what PowerPoint / Canva do), so nothing is squashed.
 */
export function placementForCrop(placement, crop, naturalWidth, naturalHeight) {
  const p = placement || {}
  const ratio = cropAspectRatio(crop, naturalWidth, naturalHeight)
  const width = Number(p.width) || 0
  if (!ratio || !(width > 0)) return p
  const height = Math.max(8, Math.round(width / ratio))
  const oldHeight = Number(p.height) || height
  const y = Math.round((Number(p.y) || 0) + (oldHeight - height) / 2)
  return { ...p, height, y }
}

/**
 * Move / resize a crop rectangle (fractions) from a drag, keeping it inside the image.
 * `handle` is 'move' or a corner/edge id ('nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w').
 * `aspect` (optional) locks width/height in *pixel* terms: imageAspect = naturalW / naturalH.
 */
export function dragCrop(start, handle, dx, dy, { aspect = null, imageAspect = 1 } = {}) {
  const s = normalizeCrop(start) || { x: 0, y: 0, width: 1, height: 1 }
  const min = MIN_CROP_FRACTION
  if (handle === 'move') {
    return {
      ...s,
      x: Math.min(1 - s.width, Math.max(0, s.x + dx)),
      y: Math.min(1 - s.height, Math.max(0, s.y + dy)),
    }
  }
  let left = s.x
  let top = s.y
  let right = s.x + s.width
  let bottom = s.y + s.height
  if (handle.includes('w')) left = Math.min(right - min, Math.max(0, left + dx))
  if (handle.includes('e')) right = Math.max(left + min, Math.min(1, right + dx))
  if (handle.includes('n')) top = Math.min(bottom - min, Math.max(0, top + dy))
  if (handle.includes('s')) bottom = Math.max(top + min, Math.min(1, bottom + dy))
  let next = { x: left, y: top, width: right - left, height: bottom - top }
  if (aspect && aspect > 0) next = lockCropAspect(next, aspect, imageAspect, handle)
  return next
}

/** Fit a crop to a pixel aspect ratio, anchored at the edge opposite the dragged handle. */
export function lockCropAspect(crop, aspect, imageAspect = 1, handle = 'se') {
  const c = { ...crop }
  // fraction-space ratio: (w * W) / (h * H) = aspect  →  w / h = aspect / imageAspect
  const fr = aspect / (imageAspect || 1)
  let width = c.width
  let height = width / fr
  if (height > 1) {
    height = 1
    width = height * fr
  }
  if (width > 1) {
    width = 1
    height = width / fr
  }
  const anchorRight = typeof handle === 'string' && handle.includes('w')
  const anchorBottom = typeof handle === 'string' && handle.includes('n') && handle !== 'move'
  let x = anchorRight ? c.x + c.width - width : c.x
  let y = anchorBottom ? c.y + c.height - height : c.y
  x = Math.min(1 - width, Math.max(0, x))
  y = Math.min(1 - height, Math.max(0, y))
  return { x, y, width, height }
}

/** Largest centred crop with the given pixel aspect ratio. */
export function centeredCropForAspect(aspect, imageAspect = 1) {
  const fr = aspect / (imageAspect || 1)
  let width = 1
  let height = 1 / fr
  if (height > 1) {
    height = 1
    width = fr
  }
  return { x: (1 - width) / 2, y: (1 - height) / 2, width, height }
}

/** True when two stored crops describe a different visible region. */
export function cropChanged(previous, next) {
  const a = normalizeCrop(previous)
  const b = normalizeCrop(next)
  if (!a || !b) return Boolean(a) !== Boolean(b)
  return ['x', 'y', 'width', 'height'].some((k) => Math.abs(a[k] - b[k]) > 1e-4)
}

/** Content with the crop set (or removed when the whole image is kept). */
export function withImageCrop(content, crop) {
  const next = { ...(content || {}) }
  const c = normalizeCrop(crop)
  if (c) next.crop = c
  else delete next.crop
  return next
}
