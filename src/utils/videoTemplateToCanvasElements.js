const PPT_CANVAS_SIZES = {
  '16:9': { width: 1920, height: 1080 },
  '4:3': { width: 1600, height: 1200 },
}

const SOURCE_SIZE = { width: 1280, height: 720 }

function scaleNum(value, scale) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * scale)
}

function scaleFontSize(value, scale) {
  const n = parseFloat(String(value || '').replace(/px$/i, ''))
  if (!Number.isFinite(n)) return undefined
  return Math.max(8, Math.round(n * scale))
}

function readPlacement(clip, scale) {
  const x = clip.position?.x ?? clip.placement?.x ?? 0
  const y = clip.position?.y ?? clip.placement?.y ?? 0
  const width = clip.size?.width ?? clip.placement?.width ?? 100
  const height = clip.size?.height ?? clip.placement?.height ?? 40
  return {
    x: scaleNum(x, scale),
    y: scaleNum(y, scale),
    width: Math.max(1, scaleNum(width, scale)),
    height: Math.max(1, scaleNum(height, scale)),
    rotation: Number(clip.rotation ?? clip.placement?.rotation ?? 0) || 0,
    opacity: clip.opacity ?? clip.placement?.opacity ?? 1,
  }
}

function resolveImageSrc(clip, assets) {
  if (clip.assetKey && Array.isArray(assets?.images)) {
    const asset = assets.images.find((img) => img.id === clip.assetKey)
    if (asset?.src) return asset.src
  }
  if (clip.assetKey && Array.isArray(assets?.icons)) {
    const icon = assets.icons.find((item) => item.id === clip.assetKey)
    if (icon?.src) return icon.src
  }
  const src = clip.src || clip.content?.src || clip.content?.url
  if (src && typeof src === 'string') return src
  return null
}

function shouldSkipClip(clip) {
  if (!clip) return true
  if (clip.role === 'avatar' || clip.type === 'avatar') return true
  if (String(clip.id || '').toLowerCase().includes('avatar')) return true
  return false
}

function isRenderableClip(clip) {
  if (!clip || clip.visible === false) return false
  if (shouldSkipClip(clip)) return false
  if (clip.type === 'text') {
    const text = typeof clip.content === 'string' ? clip.content : clip.content?.text
    return Boolean(String(text || '').trim())
  }
  if (clip.type === 'image' || clip.type === 'icon') {
    return Boolean(clip.src || clip.assetKey || clip.content?.src)
  }
  if (clip.type === 'shape') return true
  return false
}

function textClipToElement(clip, index, scale) {
  const style = clip.style || {}
  const text = typeof clip.content === 'string' ? clip.content : clip.content?.text || ''
  return {
    id: String(clip.id || `text_${index}`),
    type: 'text',
    layer: clip.layer ?? 2,
    role: clip.role,
    placement: readPlacement(clip, scale),
    content: {
      text,
      fontFamily: style.fontFamily,
      fontSize: scaleFontSize(style.fontSize, scale),
      fontWeight: style.fontWeight,
      color: style.color,
      align: style.textAlign || 'left',
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform,
    },
  }
}

function imageClipToElement(clip, index, scale, assets) {
  const style = clip.style || {}
  const src = resolveImageSrc(clip, assets)
  const isIcon =
    clip.type === 'icon'
    || clip.role === 'icon'
    || ((clip.size?.width ?? 0) <= 72 && clip.role !== 'hero-image' && clip.role !== 'logo')
  return {
    id: String(clip.id || `image_${index}`),
    type: isIcon ? 'icon' : 'image',
    layer: clip.layer ?? 3,
    role: clip.role,
    placement: readPlacement(clip, scale),
    content: {
      src,
      url: src,
      alt: clip.alt || '',
      fit: style.objectFit || (isIcon ? 'contain' : 'cover'),
      borderRadius: style.borderRadius,
      opacity: style.opacity,
    },
  }
}

function shapeClipToElement(clip, index, scale) {
  const style = clip.style || {}
  return {
    id: String(clip.id || `shape_${index}`),
    type: 'shape',
    layer: clip.layer ?? 1,
    role: clip.role,
    placement: readPlacement(clip, scale),
    nativeStyle: {
      backgroundColor: style.backgroundColor,
      border: style.border,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      opacity: style.opacity,
    },
    content: { shape: 'rect' },
  }
}


function clipToCanvasElement(clip, index, scale, assets) {
  if (shouldSkipClip(clip)) return null
  if (clip.type === 'text') return textClipToElement(clip, index, scale)
  if (clip.type === 'image' || clip.type === 'icon') return imageClipToElement(clip, index, scale, assets)
  if (clip.type === 'shape') return shapeClipToElement(clip, index, scale)
  return null
}

function sceneBackgroundToSlideFields(background) {
  if (!background) return { backgroundColor: '#FFF5F5' }
  if (typeof background === 'string') return { backgroundColor: background }
  const value = background.value || '#FFF5F5'
  if (background.type === 'gradient' || String(value).includes('gradient(')) {
    return { backgroundColor: '#FFF5F5', backgroundGradientStart: '#FFF5F5', backgroundGradientEnd: '#FFE4E6' }
  }
  return { backgroundColor: value }
}

/**
 * Convert one video template scene (1280×720 clips) → PPT canvas elements (1920×1080).
 */
export function videoSceneToCanvasElements(scene, assets = {}, aspectRatio = '16:9') {
  const target = PPT_CANVAS_SIZES[aspectRatio] || PPT_CANVAS_SIZES['16:9']
  const scale = Math.min(target.width / SOURCE_SIZE.width, target.height / SOURCE_SIZE.height)
  const clips = Array.isArray(scene?.clips) ? scene.clips : []

  const elements = clips
    .filter(isRenderableClip)
    .map((clip, index) => clipToCanvasElement(clip, index, scale, assets))
    .filter(Boolean)
    .sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0))
    .slice(0, 50)

  const bg = sceneBackgroundToSlideFields(scene.background)

  return {
    version: 1,
    canvas: { width: target.width, height: target.height },
    elements,
    ...bg,
  }
}

export function slideHasCanvasElements(slide) {
  const doc = slide?.elements
  return Boolean(Array.isArray(doc?.elements) && doc.elements.length)
}
