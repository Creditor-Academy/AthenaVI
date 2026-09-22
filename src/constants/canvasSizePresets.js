export const CANVAS_SIZE_PRESETS = [
  { id: 'instagram-post', label: 'Instagram Post', group: 'Social', width: 1080, height: 1080, aspect: '1 / 1', desc: '1080 × 1080 px' },
  { id: 'instagram-reel', label: 'Story / Reel', group: 'Social', width: 1080, height: 1920, aspect: '9 / 16', desc: '1080 × 1920 px' },
  { id: 'youtube-banner', label: 'YouTube Banner', group: 'Social', width: 2560, height: 1440, aspect: '16 / 9', desc: '2560 × 1440 px' },
  { id: 'linkedin-post', label: 'LinkedIn Post', group: 'Social', width: 1200, height: 627, aspect: '1200 / 627', desc: '1200 × 627 px' },
  { id: 'flyer', label: 'Flyer', group: 'Print', width: 1275, height: 1650, aspect: '1275 / 1650', desc: '1275 × 1650 px' },
  { id: 'a4', label: 'A4 Document', group: 'Print', width: 794, height: 1123, aspect: '794 / 1123', desc: '794 × 1123 px' },
  { id: 'presentation', label: 'Presentation 16:9', group: 'Global', width: 1920, height: 1080, aspect: '16 / 9', desc: '1920 × 1080 px' },
  { id: 'desktop', label: 'Desktop Canvas', group: 'Global', width: 1440, height: 900, aspect: '16 / 10', desc: '1440 × 900 px' },
  { id: 'square', label: 'Square Canvas', group: 'Global', width: 1200, height: 1200, aspect: '1 / 1', desc: '1200 × 1200 px' },
]

export const DEFAULT_CANVAS_SIZE = { width: 1080, height: 1080 }

export function normalizeCanvasSize(input) {
  const width = Math.round(Number(input?.width) || 0)
  const height = Math.round(Number(input?.height) || 0)
  if (width < 1 || height < 1) return { ...DEFAULT_CANVAS_SIZE }
  return {
    width: Math.min(8192, Math.max(320, width)),
    height: Math.min(8192, Math.max(320, height)),
  }
}

export function matchCanvasSizePreset(size) {
  const next = normalizeCanvasSize(size)
  return (
    CANVAS_SIZE_PRESETS.find(
      (preset) => preset.width === next.width && preset.height === next.height
    ) || null
  )
}

export function isCanvasEditorDoc(doc) {
  return String(doc?.editorKind || doc?.elements?.editorKind || '').toLowerCase() === 'canvas'
}

export function withCanvasEditorKind(doc, canvas) {
  return {
    ...(doc && typeof doc === 'object' ? doc : {}),
    version: doc?.version || 1,
    canvas: normalizeCanvasSize(canvas || doc?.canvas),
    elements: Array.isArray(doc?.elements) ? doc.elements : [],
    editorKind: 'canvas',
  }
}
