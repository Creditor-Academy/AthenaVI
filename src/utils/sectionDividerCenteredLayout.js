/** Custom canvas layout for section_divider_numbered_v1 and section_divider_centered_v1 */

export function isSectionDividerCenteredLayout(layoutId) {
  return layoutId === 'section_divider_centered_v1' || layoutId === 'section_divider_numbered_v1'
}

export function isSectionDividerNumberedLayout(layoutId) {
  return layoutId === 'section_divider_numbered_v1' || layoutId === 'section_divider_centered_v1'
}

/**
 * Geometry for the centered numbered section divider on a 1920×1080 canvas.
 *
 * Content cluster:
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │              [soft radial aura bloom behind number]              │
 *  │                                                                  │
 *  │                     ─────   02   ─────                          │
 *  │                         Next chapter                             │
 *  │                 What we cover in this section                    │
 *  │                             ▔▔▔▔                                │
 *  └──────────────────────────────────────────────────────────────────┘
 *
 * Total block height:
 *   numberH (80) + gap (20) + headingH (100) + gap (16) + subtitleH (60) + gap (24) + pillH (5) = 305px
 *   → blockStartY = cy − 305/2 ≈ 540 − 152 = 388
 */
function sectionDividerCenteredGeom(canvasW = 1920, canvasH = 1080) {
  const cx = canvasW / 2
  const cy = canvasH / 2

  const numberH   = 80
  const gap1      = 20
  const headingH  = 100
  const gap2      = 16
  const subtitleH = 60
  const gap3      = 24
  const pillH     = 5
  const pillW     = 64

  const totalH = numberH + gap1 + headingH + gap2 + subtitleH + gap3 + pillH
  const startY = Math.round(cy - totalH / 2)

  const numberY   = startY
  const headingY  = numberY + numberH + gap1
  const subtitleY = headingY + headingH + gap2
  const pillY     = subtitleY + subtitleH + gap3

  // Side bars flanking the number (vertically aligned with the center of the number)
  const sideBarW   = 72
  const sideBarH   = 2
  const sideBarGap = 20
  const sideBarY   = Math.round(numberY + numberH / 2 - sideBarH / 2)
  const auraCy     = Math.round(numberY + numberH / 2)

  return {
    cx, cy, canvasW, canvasH,
    numberBox:   { x: Math.round(cx - 300), y: numberY,   w: 600,  h: numberH  },
    headingBox:  { x: Math.round(cx - 640), y: headingY,  w: 1280, h: headingH },
    subtitleBox: { x: Math.round(cx - 560), y: subtitleY, w: 1120, h: subtitleH },
    pill:        { cx, y: pillY, w: pillW, h: pillH },
    sideBar:     { w: sideBarW, h: sideBarH, gap: sideBarGap, y: sideBarY },
    auraCy,
  }
}

/**
 * Decorative SVG layer:
 *  - Soft radial aura bloom behind the number and flanking side bars
 *  - Left + Right short accent bars flanking the number
 *  - Bottom accent pill underline
 */
function renderCenteredDecorSvg(g, accent, accentSoft) {
  const { canvasW: W, canvasH: H, cx, auraCy } = g
  const auraRx = 340
  const auraRy = 180

  // Side bars flanking SECTION_NUMBER
  const { w: barW, h: barH, gap, y: barY } = g.sideBar
  const halfNumberTextW = 48   // approx half-width of '02' at 56px bold
  const leftBarX  = Math.round(cx - halfNumberTextW - gap - barW)
  const rightBarX = Math.round(cx + halfNumberTextW + gap)

  // Pill
  const { w: pillW, h: pillH, y: pillY } = g.pill
  const pillX = Math.round(cx - pillW / 2)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="sdcAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${accentSoft}" stop-opacity="0.8"/>
      <stop offset="50%"  stop-color="${accentSoft}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${accentSoft}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Soft radial aura centred on number and side bars -->
  <ellipse cx="${cx}" cy="${auraCy}" rx="${auraRx}" ry="${auraRy}" fill="url(#sdcAura)"/>
  <!-- Side accent bars flanking the number -->
  <rect x="${leftBarX}"  y="${barY}" width="${barW}" height="${barH}" rx="${barH}" fill="${accent}" opacity="0.6"/>
  <rect x="${rightBarX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH}" fill="${accent}" opacity="0.6"/>
  <!-- Accent pill underline -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH}" fill="${accent}" opacity="0.88"/>
</svg>`
}

/**
 * Layout entry-point: repositions slots and prepends the decorative SVG layer.
 */
export function layoutSectionDividerCentered(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements

  const canvasW = canvas.width  || 1920
  const canvasH = canvas.height || 1080
  const g = sectionDividerCenteredGeom(canvasW, canvasH)

  const accent     = palette.accent     || palette.primary    || '#6366f1'
  const accentSoft = palette.accentSoft || palette.accentLight || '#eef2ff'

  const out = []

  elements.forEach((el) => {
    const slotId = String(el.slotId || '').toUpperCase()

    if (slotId === 'SECTION_NUMBER') {
      out.push({
        ...el,
        layer: 10,
        placement: {
          x: g.numberBox.x, y: g.numberBox.y,
          width: g.numberBox.w, height: g.numberBox.h,
          rotation: 0, opacity: 1,
        },
        content: {
          ...(el.content || {}),
          text: el.content?.text || '02',
          runs: null,
          fontSize: 56,
          fontWeight: 900,
          bold: true,
          lineHeight: 1,
          wrap: 'nowrap',
          clipToSlot: false,
          padding: 0,
          paddingX: 0,
          align: 'center',
          verticalAlign: 'center',
          color: accent,
          colorRole: 'accent',
        },
      })
    } else if (slotId === 'HEADING' || el.role === 'heading') {
      out.push({
        ...el,
        layer: 10,
        placement: {
          x: g.headingBox.x, y: g.headingBox.y,
          width: g.headingBox.w, height: g.headingBox.h,
          rotation: 0, opacity: 1,
        },
        content: {
          ...(el.content || {}),
          align: 'center',
          verticalAlign: 'center',
        },
      })
    } else if (slotId === 'SUBTITLE' || el.role === 'subheading') {
      out.push({
        ...el,
        layer: 10,
        placement: {
          x: g.subtitleBox.x, y: g.subtitleBox.y,
          width: g.subtitleBox.w, height: g.subtitleBox.h,
          rotation: 0, opacity: 1,
        },
        content: {
          ...(el.content || {}),
          align: 'center',
          verticalAlign: 'top',
        },
      })
    } else {
      out.push(el)
    }
  })

  // Prepend decorative SVG layer (layer 1 — behind all text)
  out.unshift({
    id: 'shp-section-divider-centered-decor',
    type: 'graphic',
    layer: 1,
    role: 'decoration',
    slotId: 'DECOR',
    placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
    content: {
      svg: renderCenteredDecorSvg(g, accent, accentSoft),
      colorMode: 'preserve',
    },
  })

  return out
}

export const layoutSectionDividerNumbered = layoutSectionDividerCentered
export { sectionDividerCenteredGeom }
