/**
 * Rasterize a rendered slide node to a JPEG blob for deck cover upload.
 * Caps output under 2 MB by stepping quality down when needed.
 */
export async function captureNodeToJpegBlob(node, { quality = 0.82, pixelRatio = 1 } = {}) {
  if (!node) return null
  const { toJpeg } = await import('html-to-image')
  const maxBytes = 2 * 1024 * 1024
  let q = quality
  for (let attempt = 0; attempt < 4; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const dataUrl = await toJpeg(node, {
      quality: q,
      pixelRatio,
      cacheBust: true,
      skipFonts: false,
    })
    // eslint-disable-next-line no-await-in-loop
    const blob = await (await fetch(dataUrl)).blob()
    if (blob.size <= maxBytes) return blob
    q = Math.max(0.45, q - 0.15)
  }
  return null
}

export const PPT_PREVIEW_HANDOFF_KEY = (presentationId) =>
  `athena:ppt-preview-handoff:${presentationId}`

export function stashPreviewHandoff(presentationId, payload) {
  if (!presentationId || !payload) return
  try {
    sessionStorage.setItem(
      PPT_PREVIEW_HANDOFF_KEY(presentationId),
      JSON.stringify({
        ...payload,
        stashedAt: Date.now(),
      })
    )
  } catch {
    /* quota / private mode */
  }
}

export function takePreviewHandoff(presentationId) {
  if (!presentationId) return null
  try {
    const raw = sessionStorage.getItem(PPT_PREVIEW_HANDOFF_KEY(presentationId))
    if (!raw) return null
    sessionStorage.removeItem(PPT_PREVIEW_HANDOFF_KEY(presentationId))
    return JSON.parse(raw)
  } catch {
    return null
  }
}
