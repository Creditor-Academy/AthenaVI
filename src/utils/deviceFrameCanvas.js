/** Compile device frame chrome + inset screen placement for canvas elements. */

const FRAME_STROKE = '#0f172a'
const FRAME_OUTER = '#1e293b'
const FRAME_FILL = '#f8fafc'
const SCREEN_FILL = '#e2e8f0'

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
    const padX = w * 0.08
    const padY = h * 0.14
    return {
      x: Math.round(x + padX),
      y: Math.round(y + padY),
      width: Math.max(40, Math.round(w - padX * 2)),
      height: Math.max(40, Math.round(h - padY * 2)),
    }
  }
  if (kind === 'watch') {
    const size = Math.min(w, h) * 0.55
    return {
      x: Math.round(x + (w - size) / 2),
      y: Math.round(y + (h - size) / 2),
      width: Math.max(24, Math.round(size)),
      height: Math.max(24, Math.round(size)),
    }
  }
  // phone vertical
  const padX = w * 0.21
  const padY = h * 0.05
  return {
    x: Math.round(x + padX),
    y: Math.round(y + padY),
    width: Math.max(40, Math.round(w - padX * 2)),
    height: Math.max(40, Math.round(h - padY * 2)),
  }
}

function frameRadius(kind, large = false) {
  if (kind === 'watch') return large ? 18 : 10
  if (kind === 'phone') return large ? 28 : 18
  if (kind === 'phone_landscape') return large ? 18 : 12
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
}) {
  const kind = deviceFrameKindFromSlot(frameSlot)
  const screen = insetScreenRect(framePlacement, kind)
  const radius = frameRadius(kind)
  const elements = []

  elements.push({
    id: `slot-${frameSlot.id}`,
    slotId: frameSlot.id,
    type: 'shape',
    role: 'device_frame',
    layer: layerBase,
    placement: framePlacement,
    content: {
      shape: 'rounded-rect',
      fill: FRAME_FILL,
      stroke: FRAME_OUTER,
      strokeWidth: 4,
      borderRadius: radius,
      shadow: '0 8px 24px rgba(15,23,42,0.18)',
      boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
      deviceFrame: kind,
      layoutSurface: true,
    },
  })

  if (kind === 'laptop') {
    const barH = Math.max(8, Math.round(screen.height * 0.07))
    elements.push({
      id: `slot-${frameSlot.id}__bar`,
      slotId: `${frameSlot.id}__bar`,
      type: 'shape',
      role: 'device_frame',
      layer: layerBase + 1,
      placement: {
        x: screen.x,
        y: screen.y,
        width: screen.width,
        height: barH,
      },
      content: {
        shape: 'rounded-rect',
        fill: '#334155',
        borderRadius: 4,
        layoutSurface: true,
      },
    })
  }

  const imageInset = {
    x: screen.x + 3,
    y: screen.y + (kind === 'laptop' ? Math.max(8, Math.round(screen.height * 0.07)) : 3),
    width: Math.max(20, screen.width - 6),
    height: Math.max(20, screen.height - (kind === 'laptop' ? Math.max(8, Math.round(screen.height * 0.07)) + 3 : 6)),
  }

  elements.push({
    id: `slot-${imageSlot.id}`,
    slotId: imageSlot.id,
    type: 'image',
    role: 'image',
    layer: layerBase + 2,
    placement: imageInset,
    content: {
      ...imageContent,
      fit: imageContent.fit || 'cover',
      borderRadius: kind === 'phone' ? 14 : 6,
    },
  })

  if (kind === 'laptop') {
    elements.push({
      id: `slot-${frameSlot.id}__base`,
      slotId: `${frameSlot.id}__base`,
      type: 'shape',
      role: 'device_frame',
      layer: layerBase,
      placement: {
        x: Math.round(framePlacement.x + framePlacement.width * 0.02),
        y: Math.round(framePlacement.y + framePlacement.height * 0.9),
        width: Math.round(framePlacement.width * 0.96),
        height: Math.max(6, Math.round(framePlacement.height * 0.04)),
      },
      content: {
        shape: 'rounded-rect',
        fill: '#475569',
        stroke: FRAME_OUTER,
        strokeWidth: 2,
        borderRadius: 4,
        layoutSurface: true,
      },
    })
  }

  if (kind === 'phone') {
    elements.push({
      id: `slot-${frameSlot.id}__home`,
      slotId: `${frameSlot.id}__home`,
      type: 'shape',
      role: 'device_frame',
      layer: layerBase + 1,
      placement: {
        x: Math.round(framePlacement.x + framePlacement.width * 0.42),
        y: Math.round(framePlacement.y + framePlacement.height * 0.93),
        width: Math.round(framePlacement.width * 0.16),
        height: Math.max(3, Math.round(framePlacement.height * 0.012)),
      },
      content: {
        shape: 'rounded-rect',
        fill: '#cbd5e1',
        borderRadius: 99,
        layoutSurface: true,
      },
    })
  }

  return elements
}
