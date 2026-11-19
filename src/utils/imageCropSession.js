/**
 * Crop on the design itself, the way Canva does it (shared by the slide, canvas and video
 * editors). While cropping, two rectangles live in the design's own units:
 *
 *   frame — the box that will show on the design (the element's new placement)
 *   photo — where the whole photo sits; it always covers the frame
 *
 * Moving / scaling the photo picks which part shows; resizing the frame changes the box.
 * `finishCropSession` turns them back into the stored crop (fractions of the photo, see
 * imageCrop.js) and the element's placement.
 */

import { fitCropToAspect, normalizeCrop } from './imageCrop.js'

export const CROP_MAX_ZOOM = 10
/** Smallest frame side, in design units. */
export const CROP_MIN_FRAME = 8

export const CROP_ASPECTS = [
  { id: 'free', label: 'Freeform', value: null },
  { id: 'original', label: 'Original', value: 'original' },
  { id: '1:1', label: '1:1', value: 1 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '3:4', label: '3:4', value: 3 / 4 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
  { id: '9:16', label: '9:16', value: 9 / 16 },
  { id: '3:2', label: '3:2', value: 3 / 2 },
  { id: '2:3', label: '2:3', value: 2 / 3 },
  { id: '4:5', label: '4:5', value: 4 / 5 },
]

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const rect = (r) => ({ x: Number(r?.x) || 0, y: Number(r?.y) || 0, width: Number(r?.width) || 0, height: Number(r?.height) || 0 })

/** Pixel aspect for an aspect id ('original' = the photo's own shape); null for Freeform. */
export function cropAspectValue(id, imageAspect) {
  const value = CROP_ASPECTS.find((a) => a.id === id)?.value
  if (value === 'original') return imageAspect
  return value || null
}

/**
 * Start cropping an image element. `box` is its placement ({ x, y, width, height, rotation }),
 * `content` its content (crop, flips), `natural` the photo's pixel size.
 */
export function startCropSession({ id = null, src = '', box, content = {}, natural }) {
  const frame = rect(box)
  const imageAspect = natural.width / natural.height
  const frameAspect = frame.width / frame.height
  const stored = normalizeCrop(content.crop)
  // What the box shows now, in the box's shape (an uncropped image shows `cover`).
  const c = fitCropToAspect(stored, frameAspect, imageAspect)
  const flipX = Boolean(content.flipHorizontal || content.flipX || content.scaleX === -1)
  const flipY = Boolean(content.flipVertical || content.flipY || content.scaleY === -1)
  // A flipped image shows the stored region mirrored: work in what is seen.
  const shownX = flipX ? 1 - c.x - c.width : c.x
  const shownY = flipY ? 1 - c.y - c.height : c.y
  const width = frame.width / c.width
  const height = width / imageAspect
  const photo = { x: frame.x - shownX * width, y: frame.y - shownY * height, width, height }
  const rotation = Number(box?.rotation) || 0
  return {
    id,
    src,
    natural: { width: natural.width, height: natural.height },
    imageAspect,
    frame,
    photo,
    rotation,
    // Rotated elements turn about their centre; the overlay keeps turning about the original one.
    pivot: { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 },
    flipX,
    flipY,
    aspectId: 'free',
    hadCrop: Boolean(stored),
    start: { frame, photo },
  }
}

/** Keep the photo covering the frame (moves it back in if it was dragged off an edge). */
function coverFrame(frame, photo) {
  return {
    ...photo,
    x: clamp(photo.x, frame.x + frame.width - photo.width, frame.x),
    y: clamp(photo.y, frame.y + frame.height - photo.height, frame.y),
  }
}

/** Smallest photo width that still covers the frame. */
function coverWidth(frame, imageAspect) {
  return Math.max(frame.width, frame.height * imageAspect)
}

/** Drag the photo behind the frame by (dx, dy) design units. */
export function panPhoto(session, dx, dy, start = session) {
  const photo = { ...start.photo, x: start.photo.x + dx, y: start.photo.y + dy }
  return { ...session, photo: coverFrame(session.frame, photo) }
}

/** Zoom: 1 = the photo just covers the frame. */
export function photoZoom(session) {
  return session.photo.width / coverWidth(session.frame, session.imageAspect)
}

/** Zoom the photo to `zoom`, keeping the point under the frame's centre where it is. */
export function zoomPhoto(session, zoom) {
  const { frame, photo, imageAspect } = session
  const z = clamp(Number(zoom) || 1, 1, CROP_MAX_ZOOM)
  const width = coverWidth(frame, imageAspect) * z
  const height = width / imageAspect
  const cx = frame.x + frame.width / 2
  const cy = frame.y + frame.height / 2
  const rx = (cx - photo.x) / photo.width
  const ry = (cy - photo.y) / photo.height
  const next = { x: cx - rx * width, y: cy - ry * height, width, height }
  return { ...session, photo: coverFrame(frame, next) }
}

/**
 * Scale the photo from one of its corners ('nw' | 'ne' | 'se' | 'sw'); the opposite corner
 * stays put. It never gets smaller than the frame.
 */
export function scalePhoto(session, corner, dx, dy, start = session) {
  const { frame, imageAspect } = session
  const p = start.photo
  const sx = corner.includes('e') ? 1 : -1
  const sy = corner.includes('s') ? 1 : -1
  const diag = Math.hypot(p.width, p.height) || 1
  // Pointer movement along the diagonal away from the fixed corner grows the photo.
  const along = (sx * dx * p.width + sy * dy * p.height) / diag
  let width = p.width * ((diag + along) / diag)
  const ax = sx > 0 ? p.x : p.x + p.width
  const ay = sy > 0 ? p.y : p.y + p.height
  const minW = sx > 0 ? frame.x + frame.width - ax : ax - frame.x
  const minH = sy > 0 ? frame.y + frame.height - ay : ay - frame.y
  width = Math.max(width, minW, minH * imageAspect)
  width = Math.min(width, coverWidth(frame, imageAspect) * CROP_MAX_ZOOM)
  const height = width / imageAspect
  const photo = { x: sx > 0 ? ax : ax - width, y: sy > 0 ? ay : ay - height, width, height }
  return { ...session, photo: coverFrame(frame, photo) }
}

/**
 * Resize the frame from a handle ('n', 'ne', 'e', …) by (dx, dy). It stays inside the photo.
 * `aspect` (pixel width / height) keeps its shape; null resizes freely.
 */
export function resizeFrame(session, handle, dx, dy, aspect = null, start = session) {
  const { photo } = session
  const f = start.frame
  const min = CROP_MIN_FRAME
  let left = f.x
  let top = f.y
  let right = f.x + f.width
  let bottom = f.y + f.height
  if (handle.includes('w')) left = clamp(left + dx, photo.x, right - min)
  if (handle.includes('e')) right = clamp(right + dx, left + min, photo.x + photo.width)
  if (handle.includes('n')) top = clamp(top + dy, photo.y, bottom - min)
  if (handle.includes('s')) bottom = clamp(bottom + dy, top + min, photo.y + photo.height)
  let frame = { x: left, y: top, width: right - left, height: bottom - top }
  if (aspect > 0) frame = lockFrameAspect(f, frame, handle, aspect, photo)
  return { ...session, frame }
}

/** `next` given `aspect`, anchored at the side(s) opposite `handle`, inside `photo`. */
function lockFrameAspect(start, next, handle, aspect, photo) {
  const horizontal = handle.includes('e') || handle.includes('w')
  const vertical = handle.includes('n') || handle.includes('s')
  let width = next.width
  let height = next.height
  if (horizontal) height = width / aspect
  else if (vertical) width = height * aspect
  const cx = start.x + start.width / 2
  const cy = start.y + start.height / 2
  const anchorL = handle.includes('e') ? start.x : null
  const anchorR = handle.includes('w') ? start.x + start.width : null
  const anchorT = handle.includes('s') ? start.y : null
  const anchorB = handle.includes('n') ? start.y + start.height : null
  const photoR = photo.x + photo.width
  const photoB = photo.y + photo.height
  const maxW =
    anchorL != null ? photoR - anchorL : anchorR != null ? anchorR - photo.x : 2 * Math.min(cx - photo.x, photoR - cx)
  const maxH =
    anchorT != null ? photoB - anchorT : anchorB != null ? anchorB - photo.y : 2 * Math.min(cy - photo.y, photoB - cy)
  const shrink = Math.min(1, maxW / width, maxH / height)
  width *= shrink
  height *= shrink
  const x = anchorL != null ? anchorL : anchorR != null ? anchorR - width : cx - width / 2
  const y = anchorT != null ? anchorT : anchorB != null ? anchorB - height : cy - height / 2
  return { x, y, width, height }
}

/**
 * Give the frame a shape (pixel width / height), about as big as it was, centred where it was,
 * inside the photo. null (Freeform) leaves it as it is.
 */
export function setFrameAspect(session, aspectId) {
  const aspect = cropAspectValue(aspectId, session.imageAspect)
  if (!aspect) return { ...session, aspectId }
  const { frame, photo } = session
  let width = Math.sqrt(frame.width * frame.height * aspect)
  let height = width / aspect
  const shrink = Math.min(1, photo.width / width, photo.height / height)
  width *= shrink
  height *= shrink
  const cx = frame.x + frame.width / 2
  const cy = frame.y + frame.height / 2
  const next = {
    x: clamp(cx - width / 2, photo.x, photo.x + photo.width - width),
    y: clamp(cy - height / 2, photo.y, photo.y + photo.height - height),
    width,
    height,
  }
  return { ...session, aspectId, frame: next }
}

/** Back to how the element looked when cropping started. */
export function resetCropSession(session) {
  return { ...session, aspectId: 'free', frame: session.start.frame, photo: session.start.photo }
}

/** True when the frame or the photo moved since cropping started. */
export function cropSessionChanged(session) {
  const same = (a, b) => ['x', 'y', 'width', 'height'].every((k) => Math.abs(a[k] - b[k]) < 0.01)
  return !(same(session.frame, session.start.frame) && same(session.photo, session.start.photo))
}

/** The part of the photo the frame shows, as stored (fractions, before any flip). */
export function sessionCrop(session) {
  const { frame, photo, flipX, flipY } = session
  const width = frame.width / photo.width
  const height = frame.height / photo.height
  const shownX = (frame.x - photo.x) / photo.width
  const shownY = (frame.y - photo.y) / photo.height
  return normalizeCrop({
    x: flipX ? 1 - shownX - width : shownX,
    y: flipY ? 1 - shownY - height : shownY,
    width,
    height,
  })
}

/**
 * The result: `crop` (null = whole photo) and the element's new `placement` (x, y, width,
 * height; a rotated element keeps turning about the right point). `changed` is false when
 * nothing moved, so an uncropped image can stay uncropped.
 */
export function finishCropSession(session) {
  const changed = cropSessionChanged(session)
  const { frame, rotation, pivot } = session
  let x = frame.x
  let y = frame.y
  if (rotation) {
    // The overlay turned about the original centre; the element turns about its own centre.
    const rad = (rotation * Math.PI) / 180
    const lx = frame.x + frame.width / 2 - pivot.x
    const ly = frame.y + frame.height / 2 - pivot.y
    const cx = pivot.x + lx * Math.cos(rad) - ly * Math.sin(rad)
    const cy = pivot.y + lx * Math.sin(rad) + ly * Math.cos(rad)
    x = cx - frame.width / 2
    y = cy - frame.height / 2
  }
  return {
    changed,
    crop: changed || session.hadCrop ? sessionCrop(session) : null,
    placement: { x, y, width: frame.width, height: frame.height },
  }
}

/** Pointer movement on screen (dx, dy in design units) turned into the element's own axes. */
export function unrotateDelta(dx, dy, rotation = 0) {
  if (!rotation) return { dx, dy }
  const rad = (-rotation * Math.PI) / 180
  return { dx: dx * Math.cos(rad) - dy * Math.sin(rad), dy: dx * Math.sin(rad) + dy * Math.cos(rad) }
}

/** Load a photo's pixel size. */
export function loadNaturalSize(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () =>
      img.naturalWidth && img.naturalHeight
        ? resolve({ width: img.naturalWidth, height: img.naturalHeight })
        : reject(new Error('Image has no size'))
    img.onerror = () => {
      // Some hosts refuse CORS: retry without it (only the size is needed).
      const plain = new Image()
      plain.onload = () => resolve({ width: plain.naturalWidth, height: plain.naturalHeight })
      plain.onerror = () => reject(new Error('Image could not be loaded'))
      plain.src = src
    }
    img.src = src
  })
}
