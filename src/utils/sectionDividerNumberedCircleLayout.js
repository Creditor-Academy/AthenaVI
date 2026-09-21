/** Custom canvas layout for section_divider_numbered_circle_v1 */

export function isSectionDividerNumberedCircleLayout(layoutId) {
  return layoutId === 'section_divider_numbered_circle_v1'
}

/**
 * Geometry for the numbered circle section divider on a 1920×1080 canvas.
 *
 *  ┌───────────────────────────────────────────────────────────────────┐
 *  │          [soft radial aura bloom around the circle badge]         │
 *  │                                                                   │
 *  │                   ╔══════════════╗                                │
 *  │                   ║      02      ║  ← circle badge 180px dia      │
 *  │                   ╚══════════════╝                                │
 *  │                     Next chapter                                  │
 *  │              What we cover in this section                        │
 *  │                        ▔▔▔▔▔                                     │
 *  └───────────────────────────────────────────────────────────────────┘
 *
 * Schema font sizes: number=56px (fits circle), heading=40px, subtitle=24px
 * Total block:  circleD(200) + gap(24) + headingH(120) + gap(16) + subtitleH(72) + gap(20) + pillH(6) = 458px
 * startY = cy − 229 = 311
 */
function sectionDividerNumberedCircleGeom(canvasW = 1920, canvasH = 1080) {
  const cx = canvasW / 2
  const cy = canvasH / 2

  const circleD  = 200   // circle diameter
  const circleR  = circleD / 2
  const gap1     = 24
  const headingH = 120
  const gap2     = 16
  const subtitleH = 72
  const gap3     = 20
  const pillH    = 6
  const pillW    = 64

  const totalH = circleD + gap1 + headingH + gap2 + subtitleH + gap3 + pillH
  const startY = Math.round(cy - totalH / 2)

  const circleY   = startY   // top of circle bounding box
  const circleCx  = cx
  const circleCy  = Math.round(circleY + circleR)

  const headingY  = circleY + circleD + gap1
  const subtitleY = headingY + headingH + gap2
  const pillY     = subtitleY + subtitleH + gap3

  // Decorative ring: slightly larger than the main circle
  const ringR     = circleR + 16
  const ringDash  = 6
  const ringGap   = 5

  return {
    cx, cy, canvasW, canvasH,
    circle:    { cx: circleCx, cy: circleCy, r: circleR },
    ring:      { cx: circleCx, cy: circleCy, r: ringR, dashLen: ringDash, dashGap: ringGap },
    // Number text box — centred on the circle with ample width to prevent wrapping
    numberBox: {
      x: Math.round(cx - 180),
      y: Math.round(circleCy - circleR),
      w: 360,
      h: circleD,
    },
    headingBox:  { x: Math.round(cx - 640), y: headingY,  w: 1280, h: headingH },
    subtitleBox: { x: Math.round(cx - 520), y: subtitleY, w: 1040, h: subtitleH },
    pill:        { cx, y: pillY, w: pillW, h: pillH },
    auraCy:      circleCy,   // aura centred on the circle badge
  }
}

/**
 * Decorative SVG layer:
 *  - Soft radial aura bloom around the number circle
 *  - Solid filled accent circle (the badge background)
 *  - Dashed concentric ring outside the badge
 *  - Four tiny accent corner dots at cardinal positions on the ring
 *  - Short horizontal rules (left + right) off the circle
 *  - Bottom accent pill underline
 */
function renderNumberedCircleDecorSvg(g, accent, accentSoft, bg) {
  const { canvasW: W, canvasH: H } = g
  const { cx: ccx, cy: ccy, r } = g.circle
  const { r: rr, dashLen, dashGap } = g.ring

  // Circumference for stroke-dasharray
  const circ = Math.round(2 * Math.PI * rr)
  const dashArray = `${dashLen} ${dashGap}`

  // Cardinal dot positions on the outer ring
  const dotR = 4
  const cardinals = [
    { x: ccx,      y: ccy - rr },   // top
    { x: ccx + rr, y: ccy },        // right
    { x: ccx,      y: ccy + rr },   // bottom
    { x: ccx - rr, y: ccy },        // left
  ]
  const cardinalDots = cardinals.map(
    (p) => `<circle cx="${Math.round(p.x)}" cy="${Math.round(p.y)}" r="${dotR}" fill="${accent}" opacity="0.7"/>`
  ).join('\n  ')

  // Short horizontal rules flanking the circle
  const ruleW  = 80
  const ruleH  = 2
  const ruleGap = 24   // gap from circle edge to rule start
  const ruleY  = Math.round(ccy - ruleH / 2)
  const leftRuleX  = Math.round(ccx - r - ruleGap - ruleW)
  const rightRuleX = Math.round(ccx + r + ruleGap)

  // Pill
  const pillX = Math.round(ccx - g.pill.w / 2)

  // Aura
  const auraRx = 280
  const auraRy = 280

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="sndcAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${accentSoft}" stop-opacity="0.65"/>
      <stop offset="50%"  stop-color="${accentSoft}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${accentSoft}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Soft radial aura around circle badge -->
  <ellipse cx="${ccx}" cy="${g.auraCy}" rx="${auraRx}" ry="${auraRy}" fill="url(#sndcAura)"/>
  <!-- Dashed concentric outer ring -->
  <circle cx="${ccx}" cy="${ccy}" r="${rr}"
    fill="none"
    stroke="${accent}"
    stroke-width="1.5"
    stroke-dasharray="${dashArray}"
    opacity="0.4"/>
  <!-- Cardinal accent dots on ring -->
  ${cardinalDots}
  <!-- Short horizontal rules -->
  <rect x="${leftRuleX}"  y="${ruleY}" width="${ruleW}" height="${ruleH}" rx="${ruleH}" fill="${accent}" opacity="0.4"/>
  <rect x="${rightRuleX}" y="${ruleY}" width="${ruleW}" height="${ruleH}" rx="${ruleH}" fill="${accent}" opacity="0.4"/>
  <!-- Solid circle badge background -->
  <circle cx="${ccx}" cy="${ccy}" r="${r}" fill="${accent}" opacity="1"/>
  <!-- Accent pill underline -->
  <rect x="${pillX}" y="${g.pill.y}" width="${g.pill.w}" height="${g.pill.h}" rx="${g.pill.h}" fill="${accent}" opacity="0.88"/>
</svg>`
}

/**
 * Layout entry-point: repositions slots and prepends the decorative SVG.
 * Number slot is placed INSIDE the circle badge box (text will be white).
 */
export function layoutSectionDividerNumberedCircle(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements

  const canvasW = canvas.width  || 1920
  const canvasH = canvas.height || 1080
  const g = sectionDividerNumberedCircleGeom(canvasW, canvasH)

  const accent     = palette.accent     || palette.primary    || '#6366f1'
  const accentSoft = palette.accentSoft || palette.accentLight || '#eef2ff'
  const bg         = palette.background || palette.bg         || '#ffffff'

  const out = []

  elements.forEach((el) => {
    const slotId = String(el.slotId || '').toUpperCase()

    if (slotId === 'SECTION_NUMBER') {
      out.push({
        ...el,
        layer: 11,   // above circle badge (layer 10 in SVG)
        placement: {
          x: g.numberBox.x, y: g.numberBox.y,
          width: g.numberBox.w, height: g.numberBox.h,
          rotation: 0, opacity: 1,
        },
        content: {
          ...(el.content || {}),
          text: el.content?.text || '02',
          runs: null,
          fontSize: 54,
          fontWeight: 900,
          bold: true,
          lineHeight: 1,
          wrap: 'nowrap',
          clipToSlot: false,
          padding: 0,
          paddingX: 0,
          align: 'center',
          verticalAlign: 'center',
          color: '#ffffff',
          colorRole: 'textOnImage',
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
          verticalAlign: 'middle',
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

  // Prepend decorative SVG layer
  out.unshift({
    id: 'shp-section-divider-numbered-circle-decor',
    type: 'graphic',
    layer: 1,
    role: 'decoration',
    slotId: 'DECOR',
    placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
    content: {
      svg: renderNumberedCircleDecorSvg(g, accent, accentSoft, bg),
      colorMode: 'preserve',
    },
  })

  return out
}
