/**
 * Collect absolute/relative image URLs that a slide needs before it looks complete.
 */
export function collectSlideMediaUrls(slide) {
  const urls = new Set()

  const push = (value) => {
    if (typeof value !== 'string') return
    const trimmed = value.trim()
    if (!trimmed) return
    if (trimmed.startsWith('data:')) return
    if (/^(https?:|blob:|\/)/i.test(trimmed) || trimmed.includes('/')) {
      urls.add(trimmed)
    }
  }

  const walkContent = (content = {}) => {
    push(content.src)
    push(content.url)
    push(content.previewUrl)
    push(content.imageUrl)
    push(content.fileUrl)
    push(content.thumbnailUrl)
    push(content.poster)
    if (Array.isArray(content.sources)) {
      content.sources.forEach((s) => push(typeof s === 'string' ? s : s?.src || s?.url))
    }
  }

  for (const el of slide?.elements?.elements || []) {
    if (!el) continue
    const type = String(el.type || '').toLowerCase()
    if (
      type === 'image' ||
      type === 'icon' ||
      type === 'graphic' ||
      type === 'logo' ||
      type === 'video' ||
      type === 'shape'
    ) {
      walkContent(el.content || {})
    } else if (el.content) {
      // Background / media slots may live on other types
      walkContent(el.content)
    }
  }

  const bg = slide?.background || slide?.content?.background || null
  if (bg && typeof bg === 'object') {
    push(bg.src)
    push(bg.url)
    push(bg.imageUrl)
  }

  return [...urls]
}

export function slideMediaSignature(slide) {
  if (!slide) return ''
  const urls = collectSlideMediaUrls(slide).sort()
  const graphicIds = (slide?.elements?.elements || [])
    .filter((el) => el?.type === 'graphic' && el?.content?.assetId)
    .map((el) => String(el.content.assetId))
    .sort()
  return `${slide.id || ''}|${urls.join(',')}|${graphicIds.join(',')}`
}

export function preloadImageUrl(url, timeoutMs = 12000) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false)
      return
    }
    const img = new Image()
    let settled = false
    const done = (ok) => {
      if (settled) return
      settled = true
      resolve(ok)
    }
    const timer = setTimeout(() => done(false), timeoutMs)
    img.onload = () => {
      clearTimeout(timer)
      done(true)
    }
    img.onerror = () => {
      clearTimeout(timer)
      done(false)
    }
    img.decoding = 'async'
    img.src = url
  })
}

export async function preloadSlideMedia(slide, { timeoutMs = 12000 } = {}) {
  const urls = collectSlideMediaUrls(slide)
  if (urls.length) {
    await Promise.all(urls.map((url) => preloadImageUrl(url, timeoutMs)))
  }
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((r) => setTimeout(r, 1500)),
      ])
    } catch {
      /* ignore */
    }
  }
}
