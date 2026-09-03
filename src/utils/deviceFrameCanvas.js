/** Compile device frame chrome + inset screen placement for canvas elements. */

const FRAME_STROKE_LIGHT = '#0f172a'
const FRAME_OUTER_LIGHT = '#1e293b'
const FRAME_FILL_LIGHT = '#f8fafc'
const FRAME_STROKE_DARK = '#6B7280'
const FRAME_OUTER_DARK = '#9CA3AF'
const FRAME_FILL_DARK = '#D1D5DB'
const SCREEN_FILL = '#e2e8f0'

function isDarkThemeTokens(themeTokens = {}) {
  const appearance = String(themeTokens?.appearance || '').toLowerCase()
  if (appearance === 'dark') return true
  if (appearance === 'light') return false
  const bg = themeTokens?.palette?.bg || themeTokens?.palette?.background || ''
  const s = String(bg).replace('#', '')
  if (s.length !== 6) return false
  const r = parseInt(s.slice(0, 2), 16) / 255
  const g = parseInt(s.slice(2, 4), 16) / 255
  const b = parseInt(s.slice(4, 6), 16) / 255
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return lum < 0.45
}

export function deviceFrameChromeColors(themeTokens = {}, kind = 'phone') {
  const dark = isDarkThemeTokens(themeTokens)
  const isPhone = kind === 'phone' || kind === 'phone_landscape'
  if (dark) {
    return {
      fill: isPhone ? FRAME_OUTER_DARK : FRAME_FILL_DARK,
      stroke: FRAME_STROKE_DARK,
      strokeWidth: isPhone ? 0 : 3,
    }
  }
  return {
    fill: isPhone ? FRAME_OUTER_LIGHT : FRAME_FILL_LIGHT,
    stroke: FRAME_STROKE_LIGHT,
    strokeWidth: isPhone ? 0 : 4,
  }
}

export function deviceFrameKindFromSlot(slot = {}) {
  const id = String(slot.id || '').toUpperCase()
  const hintKind = String(slot.shapeHint?.kind || '')
  if (/LAPTOP/.test(id) || hintKind === 'laptopFrame') return 'laptop'
  if (/TABLET/.test(id) || hintKind === 'tabletFrame') return 'tablet'
  if (/LANDSCAPE/.test(id) || hintKind === 'phoneLandscapeFrame') return 'phone_landscape'
  if (/WATCH/.test(id) || hintKind === 'watchFrame') return 'watch'
  return 'phone'
}

export function findDeviceFrameSlot(slots, imageSlotId) {
  const target = String(imageSlotId || '')
  if (!target) return null
  return (
    (slots || []).find((slot) => {
      const pairs = slot?.shapeHint?.pairsWithSlotId
      if (!pairs || String(pairs) !== target) return false
      const id = String(slot?.id || '')
      const kind = String(slot?.shapeHint?.kind || '')
      // Only real device frames — not cardBehind / surface hints that also use pairsWithSlotId
      return (
        /FRAME$/i.test(id) ||
        /Frame$/i.test(kind) ||
        kind === 'deviceFrame' ||
        /^(phone|tablet|laptop|watch)/i.test(kind)
      )
    }) || null
  )
}

/** Fit a device into its slot without stretching (portrait 9:19.5, landscape 19.5:9). */
export function fitDeviceFramePlacement(placement, kind) {
  const p = placement || {}
  const x = p.x ?? 0
  const y = p.y ?? 0
  const w = Math.max(1, p.width ?? 400)
  const h = Math.max(1, p.height ?? 300)
  let aspect = null
  if (kind === 'phone_landscape') aspect = 19.5 / 9
  if (kind === 'phone') {
    aspect = 9 / 19.5
    const mx = w * 0.01
    const my = h * 0.01
    const innerW = Math.max(1, w - mx * 2)
    const innerH = Math.max(1, h - my * 2)
    let rw = innerW
    let rh = rw / aspect
    if (rh > innerH) {
      rh = innerH
      rw = rh * aspect
    }
    return {
      ...p,
      x: Math.round(x + (w - rw) / 2),
      y: Math.round(y + (h - rh) / 2),
      width: Math.round(rw),
      height: Math.round(rh),
    }
  }
  if (!aspect) return { ...p, x, y, width: w, height: h }
  let rw = w
  let rh = rw / aspect
  if (rh > h) {
    rh = h
    rw = rh * aspect
  }
  return {
    ...p,
    x: Math.round(x + (w - rw) / 2),
    y: Math.round(y + (h - rh) / 2),
    width: Math.round(rw),
    height: Math.round(rh),
  }
}

function insetScreenRect(placement, kind) {
  const p = placement || {}
  const x = p.x ?? 0
  const y = p.y ?? 0
  const w = p.width ?? 400
  const h = p.height ?? 300

  if (kind === 'laptop') {
    const padX = w * 0.05
    const padTop = h * 0.06
    const padBottom = h * 0.16
    return {
      x: Math.round(x + padX),
      y: Math.round(y + padTop),
      width: Math.max(40, Math.round(w - padX * 2)),
      height: Math.max(40, Math.round(h - padTop - padBottom)),
    }
  }
  if (kind === 'tablet') {
    const padX = w * 0.12
    const padY = h * 0.08
    return {
      x: Math.round(x + padX),
      y: Math.round(y + padY),
      width: Math.max(40, Math.round(w - padX * 2)),
      height: Math.max(40, Math.round(h - padY * 2)),
    }
  }
  if (kind === 'phone_landscape') {
    const bezel = Math.max(10, Math.round(Math.min(w, h) * 0.032))
    return {
      x: Math.round(x + bezel),
      y: Math.round(y + bezel),
      width: Math.max(40, Math.round(w - bezel * 2)),
      height: Math.max(40, Math.round(h - bezel * 2)),
    }
  }
  if (kind === 'watch') {
    const caseW = w * 0.76
    const caseH = h * 0.54
    return {
      x: Math.round(x + (w - caseW) / 2),
      y: Math.round(y + (h - caseH) / 2),
      width: Math.max(24, Math.round(caseW)),
      height: Math.max(24, Math.round(caseH)),
    }
  }
  // phone vertical — thin even bezel once the box is 9:19.5
  const bezel = Math.max(8, Math.round(Math.min(w, h) * 0.022))
  return {
    x: Math.round(x + bezel),
    y: Math.round(y + bezel),
    width: Math.max(40, Math.round(w - bezel * 2)),
    height: Math.max(40, Math.round(h - bezel * 2)),
  }
}

function frameRadius(kind, large = false) {
  if (kind === 'watch') return large ? 18 : 10
  if (kind === 'phone') return large ? 28 : 22
  if (kind === 'phone_landscape') return large ? 34 : 22
  if (kind === 'tablet') return large ? 22 : 14
  return large ? 16 : 10
}

/**
 * @returns {object[]} canvas elements — frame chrome + inset image
 */
export function buildDeviceFrameCanvasElements({
  frameSlot,
  imageSlot,
  framePlacement,
  imageContent = {},
  layerBase = 8,
  themeTokens = null,
}) {
  const kind = deviceFrameKindFromSlot(frameSlot)
  const isPhone = kind === 'phone' || kind === 'phone_landscape'
  const fitted = fitDeviceFramePlacement(framePlacement, kind)
  const screen = insetScreenRect(fitted, kind)
  const radius = frameRadius(kind, isPhone)
  const elements = []
  const nest = isPhone ? 0 : 2
  const phoneShadow = '0 22px 54px rgba(15,23,42,0.22), 0 4px 12px rgba(15,23,42,0.12)'
  const chrome = deviceFrameChromeColors(themeTokens, kind)

  elements.push({
    id: `slot-${frameSlot.id}`,
    slotId: frameSlot.id,
    type: 'shape',
    role: 'device_frame',
    layer: layerBase,
    placement: fitted,
    content: {
      shape: 'rounded-rect',
      fill: chrome.fill,
      stroke: chrome.stroke,
      strokeWidth: chrome.strokeWidth,
      borderRadius: radius,
      shadow: isPhone ? phoneShadow : '0 8px 24px rgba(15,23,42,0.18)',
      boxShadow: isPhone
        ? kind === 'phone'
          ? 'inset 0 0 0 1px rgba(226,232,240,0.28), 0 28px 64px rgba(15,23,42,0.18), 0 8px 18px rgba(15,23,42,0.08)'
          : phoneShadow
        : '0 8px 24px rgba(15,23,42,0.18)',
      deviceFrame: kind,
      layoutSurface: true,
    },
  })

  const imageInset = {
    x: screen.x + nest,
    y: screen.y + (kind === 'laptop' ? Math.max(8, Math.round(screen.height * 0.07)) : nest),
    width: Math.max(20, screen.width - nest * 2),
    height: Math.max(20, screen.height - (kind === 'laptop' ? Math.max(8, Math.round(screen.height * 0.07)) + nest : nest * 2)),
  }

  const { shadow: _shadow, boxShadow: _boxShadow, ...screenImageContent } = imageContent || {}

  elements.push({
    id: `slot-${imageSlot.id}`,
    slotId: imageSlot.id,
    type: 'image',
    role: 'image',
    layer: layerBase + 2,
    placement: imageInset,
    content: {
      ...screenImageContent,
      fit: screenImageContent.fit || 'cover',
      borderRadius: kind === 'phone' ? 28 : kind === 'phone_landscape' ? 22 : 6,
      shadow: undefined,
      boxShadow: undefined,
    },
  })

  return elements
}

export { SCREEN_FILL }
