/**
 * Process Linear Four Cards Layout
 * Layout ID: process_linear_four_cards_v1
 *
 * Visual Reference: "Linear Four Stage Cards – Slide Template"
 *  - Header: "Linear Four Stage Cards – Slide Template" (or slide HEADING)
 *  - 4 Tall Outlined Stage Cards:
 *      * Top banner with rounded top corners in stage accent color
 *      * Darker circular badge with white number ("1", "2", "3", "4") on the left of banner
 *      * White Stage Title on the right of banner
 *      * White card body with matching stage border stroke
 *      * 3 bullet points / description text
 *      * Bottom centered outline vector icon in matching stage accent color:
 *          - Card 1: Trending Bar Chart 📈
 *          - Card 2: Broken Chain / Link ⛓️
 *          - Card 3: Plant Sprout / Seedling 🌱
 *          - Card 4: Warning Triangle ⚠️
 *
 * Recolorability:
 *  - Each card container is a recolorable graphic element STEP_n_CARD with colorMode: 'recolorable'.
 *  - Selecting any card allows instant recoloring of its banner, border, number badge, and bottom icon.
 */

export const PROCESS_LINEAR_FOUR_CARDS_GEOM = {
  viewW: 1000,
  viewH: 560,

  // Header
  headingX: 54,
  headingY: 34,
  headingW: 892,
  headingH: 42,

  // Cards layout
  cardY: 96,
  cardW: 208,
  cardH: 416,
  cardGap: 20,
  cardRadius: 14,
  bannerH: 60,
  borderWidth: 2,

  // Circle number badge in banner
  circleOffsetX: 28,
  circleOffsetY: 30,
  circleR: 16,

  // Title in banner
  titleOffsetX: 54,
  titleOffsetY: 18,
  titleW: 144,
  titleH: 26,

  // Bullet / text body
  bodyOffsetX: 16,
  bodyOffsetY: 76,
  bodyW: 176,
  bodyH: 220,

  // Bottom Icon
  iconOffsetY: 326,
  iconSize: 38,
}

export const PROCESS_LINEAR_FOUR_CARDS_DEFAULT_COLORS = [
  '#E15537', // 1: Coral Red
  '#E08E1A', // 2: Amber Gold
  '#659765', // 3: Sage Green
  '#29A2CC', // 4: Sky Blue
]

export const PROCESS_LINEAR_FOUR_CARDS_DARK_COLORS = [
  '#B8381D', // 1: Dark Red
  '#B36E0D', // 2: Dark Amber
  '#487348', // 3: Dark Green
  '#1C7D9E', // 4: Dark Blue
]

export const PROCESS_LINEAR_FOUR_CARDS_DEFAULT_STEPS = [
  {
    title: 'Lorem Ipsum',
    bullets: [
      'Lorem ipsum dolor sit amet, nibh est. A magna Maecenas.',
      'Quam magna nec quis, lorem.',
      'Suspendisse viverra sodales mauris, cras pharetra proin egestas arcu erat dolor, at amet.',
    ],
  },
  {
    title: 'Lorem Ipsum',
    bullets: [
      'Lorem ipsum dolor sit amet, nibh est. A magna Maecenas.',
      'Quam magna nec quis, lorem.',
      'Suspendisse viverra sodales mauris, cras pharetra proin egestas arcu erat dolor, at amet.',
    ],
  },
  {
    title: 'Lorem Ipsum',
    bullets: [
      'Lorem ipsum dolor sit amet, nibh est. A magna Maecenas.',
      'Quam magna nec quis, lorem.',
      'Suspendisse viverra sodales mauris, cras pharetra proin egestas arcu erat dolor, at amet.',
    ],
  },
  {
    title: 'Lorem Ipsum',
    bullets: [
      'Lorem ipsum dolor sit amet, nibh est. A magna Maecenas.',
      'Quam magna nec quis, lorem.',
      'Suspendisse viverra sodales mauris, cras pharetra proin egestas arcu erat dolor, at amet.',
    ],
  },
]

export function isProcessLinearFourCardsLayout(layoutId) {
  const s = String(layoutId || '').toLowerCase().trim()
  return (
    s === 'process_linear_four_cards_v1' ||
    s === 'process_linear_four_cards' ||
    s === 'linear_four_stage_cards'
  )
}

export function isPlaceholderOrLatin(str) {
  const s = String(str || '').toLowerCase().trim()
  if (!s) return true
  return (
    s === 'phase 1' ||
    s === 'phase 2' ||
    s === 'phase 3' ||
    s === 'phase 4' ||
    s === 'research and define.' ||
    s === 'design and iterate.' ||
    s === 'build and validate.' ||
    s === 'launch and scale.' ||
    s === 'add text here' ||
    s === 'text goes here'
  )
}

// 4 Crisp Outline Vector Icons matching reference image:
// 1: Bar Chart with Upward Trend Arrow
// 2: Broken Chain / Link
// 3: Plant Sprout / Seedling
// 4: Warning Triangle
export const PROCESS_LINEAR_FOUR_CARDS_ICON_PATHS = [
  // 1: Bar Chart with Upward Trend Arrow
  `
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
    <rect x="3" y="16" width="3" height="5" rx="0.5"/>
    <rect x="9" y="13" width="3" height="8" rx="0.5"/>
    <rect x="15" y="10" width="3" height="11" rx="0.5"/>
  `,
  // 2: Broken Chain / Link
  `
    <path d="m14 10 3-3a3.5 3.5 0 0 1 5 5l-3 3"/>
    <path d="m10 14-3 3a3.5 3.5 0 0 1-5-5l3-3"/>
    <line x1="10" y1="8" x2="8" y2="6"/>
    <line x1="16" y1="14" x2="14" y2="16"/>
  `,
  // 3: Plant Sprout / Seedling with ground mound
  `
    <path d="M4 21c2-1.5 5-2 8-2s6 .5 8 2"/>
    <path d="M12 19V9"/>
    <path d="M12 13c-3 0-5-2-5-5a5 5 0 0 1 5 5z"/>
    <path d="M12 9c3 0 5-2 5-5a5 5 0 0 0-5 5z"/>
  `,
  // 4: Warning Triangle with exclamation mark
  `
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <circle cx="12" cy="17" r="0.8" fill="currentColor"/>
  `,
]

/**
 * Calculates geometry for the 4 cards.
 */
export function calculateLinearFourCardsGeometries(stepCount = 4) {
  const g = PROCESS_LINEAR_FOUR_CARDS_GEOM
  const n = Math.max(2, Math.min(5, stepCount))
  const usableW = g.viewW - g.headingX * 2
  const cardW = Math.round((usableW - (n - 1) * g.cardGap) / n)

  const steps = []
  for (let i = 0; i < n; i += 1) {
    const x = g.headingX + i * (cardW + g.cardGap)
    steps.push({
      index: i,
      stepNum: i + 1,
      x,
      y: g.cardY,
      w: cardW,
      h: g.cardH,
      color: PROCESS_LINEAR_FOUR_CARDS_DEFAULT_COLORS[i % PROCESS_LINEAR_FOUR_CARDS_DEFAULT_COLORS.length],
      darkColor: PROCESS_LINEAR_FOUR_CARDS_DARK_COLORS[i % PROCESS_LINEAR_FOUR_CARDS_DARK_COLORS.length],
      iconPaths: PROCESS_LINEAR_FOUR_CARDS_ICON_PATHS[i % PROCESS_LINEAR_FOUR_CARDS_ICON_PATHS.length],
    })
  }

  return steps
}

/**
 * Builds standalone SVG for a single card container:
 * - Card outer border & white background
 * - Top filled header banner with rounded top corners
 * - Darker number circle with white number
 * - Bottom centered vector icon
 */
export function buildLinearFourCardSvg(step) {
  const g = PROCESS_LINEAR_FOUR_CARDS_GEOM
  const { w, h, stepNum, darkColor, iconPaths } = step
  const r = g.cardRadius
  const bh = g.bannerH
  const iconX = (w - g.iconSize) / 2
  const iconY = g.iconOffsetY

  // SVG clip path for top banner rounded corners:
  // Banner path: M 0,r A r,r 0 0 1 r,0 L w-r,0 A r,r 0 0 1 w,r L w,bh L 0,bh Z
  const bannerPath = `M 0,${r} A ${r},${r} 0 0 1 ${r},0 L ${w - r},0 A ${r},${r} 0 0 1 ${w},${r} L ${w},${bh} L 0,${bh} Z`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" fill="none">
    <!-- Card Outer Box with White Fill & Border -->
    <rect x="${g.borderWidth / 2}" y="${g.borderWidth / 2}" width="${w - g.borderWidth}" height="${h - g.borderWidth}" rx="${r}" fill="#FFFFFF" stroke="currentColor" stroke-width="${g.borderWidth}" />

    <!-- Top Filled Header Banner -->
    <path d="${bannerPath}" fill="currentColor" />

    <!-- Darker Number Circle Badge -->
    <circle cx="${g.circleOffsetX}" cy="${g.circleOffsetY}" r="${g.circleR}" fill="${darkColor}" />

    <!-- White Bold Step Number -->
    <text x="${g.circleOffsetX}" y="${g.circleOffsetY + 5.5}" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${stepNum}
    </text>

    <!-- Bottom Vector Icon in Card Accent Color -->
    <g transform="translate(${iconX}, ${iconY})" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${iconPaths}
    </g>
  </svg>`
}

/**
 * Builds preview SVG for LayoutPolishedPreview.jsx.
 */
export function processLinearFourCardsPreviewSvg(previewHints = {}, theme = {}) {
  const g = PROCESS_LINEAR_FOUR_CARDS_GEOM
  const headingText = previewHints?.slots?.HEADING?.text || 'Linear Four Stage Cards – Slide Template'

  let count = 0
  for (let i = 1; i <= 6; i += 1) {
    if (previewHints?.slots?.[`STEP_${i}_TITLE`] || previewHints?.slots?.[`STEP_${i}_BODY`]) {
      count = i
    }
  }
  const stepCount = count >= 2 ? count : 4
  const steps = calculateLinearFourCardsGeometries(stepCount)

  let cardsSvg = ''
  let textLabels = ''

  steps.forEach((step) => {
    const color = step.color
    const r = g.cardRadius
    const bh = g.bannerH
    const iconX = step.x + (step.w - g.iconSize) / 2
    const iconY = step.y + g.iconOffsetY
    const bannerPath = `M ${step.x},${step.y + r} A ${r},${r} 0 0 1 ${step.x + r},${step.y} L ${step.x + step.w - r},${step.y} A ${r},${r} 0 0 1 ${step.x + step.w},${step.y + r} L ${step.x + step.w},${step.y + bh} L ${step.x},${step.y + bh} Z`

    cardsSvg += `
      <!-- Card Container Box -->
      <rect x="${step.x + 1}" y="${step.y + 1}" width="${step.w - 2}" height="${step.h - 2}" rx="${r}" fill="#FFFFFF" stroke="${color}" stroke-width="${g.borderWidth}" />

      <!-- Top Header Banner -->
      <path d="${bannerPath}" fill="${color}" />

      <!-- Darker Number Circle Badge -->
      <circle cx="${step.x + g.circleOffsetX}" cy="${step.y + g.circleOffsetY}" r="${g.circleR}" fill="${step.darkColor}" />

      <!-- White Number -->
      <text x="${step.x + g.circleOffsetX}" y="${step.y + g.circleOffsetY + 5.5}" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${step.stepNum}
      </text>

      <!-- Bottom Vector Icon -->
      <g transform="translate(${iconX}, ${iconY})" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none">
        ${step.iconPaths}
      </g>
    `

    const defaultStep = PROCESS_LINEAR_FOUR_CARDS_DEFAULT_STEPS[step.index % PROCESS_LINEAR_FOUR_CARDS_DEFAULT_STEPS.length]
    const rawTitle = previewHints?.slots?.[`STEP_${step.stepNum}_TITLE`]?.text
    const title = isPlaceholderOrLatin(rawTitle) ? defaultStep.title : rawTitle

    const rawBody = previewHints?.slots?.[`STEP_${step.stepNum}_BODY`]?.text
    const bodyLines = isPlaceholderOrLatin(rawBody)
      ? defaultStep.bullets
      : rawBody.split('\n').filter(Boolean)

    // White Title in banner
    textLabels += `
      <text x="${step.x + g.titleOffsetX}" y="${step.y + g.titleOffsetY + 16}" fill="#FFFFFF" font-size="15" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${title}
      </text>
    `

    // Bullet points in body
    const bulletStartY = step.y + g.bodyOffsetY + 16
    const b1 = bodyLines[0] || 'Lorem ipsum dolor sit amet, nibh est.'
    const b2 = bodyLines[1] || 'Quam magna nec quis, lorem.'
    const b3 = bodyLines[2] || 'Suspendisse viverra sodales mauris, cras pharetra.'

    textLabels += `
      <text x="${step.x + g.bodyOffsetX}" y="${bulletStartY}" fill="#475569" font-size="10" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        <tspan x="${step.x + g.bodyOffsetX}" dy="0">• ${b1.slice(0, 36)}</tspan>
        <tspan x="${step.x + g.bodyOffsetX + 8}" dy="14">${b1.slice(36, 70)}</tspan>
        <tspan x="${step.x + g.bodyOffsetX}" dy="22">• ${b2.slice(0, 36)}</tspan>
        <tspan x="${step.x + g.bodyOffsetX + 8}" dy="14">${b2.slice(36, 70)}</tspan>
        <tspan x="${step.x + g.bodyOffsetX}" dy="22">• ${b3.slice(0, 36)}</tspan>
        <tspan x="${step.x + g.bodyOffsetX + 8}" dy="14">${b3.slice(36, 70)}</tspan>
      </text>
    `
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.viewW} ${g.viewH}" width="100%" height="100%" style="background:#FFFFFF;">
    <!-- Title Header -->
    <text x="${g.headingX}" y="${g.headingY + 28}" fill="#0F172A" font-size="28" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${headingText}
    </text>

    <!-- Cards & Banners -->
    ${cardsSvg}

    <!-- Titles & Bullet Texts -->
    ${textLabels}
  </svg>`
}

/**
 * Compiles and positions slide elements for process_linear_four_cards_v1.
 */
export function layoutProcessLinearFourCards(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const g = PROCESS_LINEAR_FOUR_CARDS_GEOM

  const scaleX = canvasW / g.viewW
  const scaleY = canvasH / g.viewH

  const safeElements = Array.isArray(elements) ? elements : []
  const slots = Array.isArray(schema?.slots) ? schema.slots : []

  let detectedCount = 0
  for (let i = 1; i <= 6; i += 1) {
    if (
      slots.some((s) => s.id === `STEP_${i}_TITLE` || s.id === `STEP_${i}_BODY`) ||
      safeElements.some((el) => el.slotId === `STEP_${i}_TITLE` || el.slotId === `STEP_${i}_BODY`)
    ) {
      detectedCount = i
    }
  }
  const stepCount = detectedCount >= 2 ? detectedCount : 4
  const steps = calculateLinearFourCardsGeometries(stepCount)

  const prevBySlot = new Map()
  safeElements.forEach((el) => {
    const sid = String(el.slotId || el.id || '').toUpperCase()
    if (sid) prevBySlot.set(sid, el)
  })

  const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`
  const newElements = []

  // 1. HEADING Text Element
  const prevHeading = prevBySlot.get('HEADING')
  const headingSlot = slots.find((s) => s.id === 'HEADING')
  const headingText =
    prevHeading?.content?.text ||
    prevHeading?.content?.html ||
    headingSlot?.placeholder_text ||
    'Linear Four Stage Cards – Slide Template'

  newElements.push({
    id: prevHeading?.id || newId('txt-heading'),
    slotId: 'HEADING',
    type: 'text',
    layer: 10,
    placement: {
      x: Math.round(g.headingX * scaleX),
      y: Math.round(g.headingY * scaleY),
      width: Math.round(g.headingW * scaleX),
      height: Math.round(g.headingH * scaleY),
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: headingText,
      align: 'left',
      fontSize: 28,
      fontWeight: 800,
      colorRole: 'text',
      color: prevHeading?.content?.color || '#0F172A',
      lineHeight: 1.15,
      clipToSlot: false,
    },
  })

  // 2. Stage Cards
  steps.forEach((step) => {
    const n = step.stepNum

    const prevCard = prevBySlot.get(`STEP_${n}_CARD`) || prevBySlot.get(`STEP_${n}_SHAPE`)
    const prevTitle = prevBySlot.get(`STEP_${n}_TITLE`)
    const prevBody = prevBySlot.get(`STEP_${n}_BODY`)

    const cardColor = prevCard?.content?.fill || prevCard?.content?.color || step.color

    // 2A. Recolorable Card Container (outer box, banner, number circle, and bottom icon)
    const cardSvg = buildLinearFourCardSvg(step)
    newElements.push({
      id: prevCard?.id || newId(`grp-step-${n}-card`),
      slotId: `STEP_${n}_CARD`,
      type: 'graphic',
      layer: 2,
      role: 'decoration',
      placement: {
        x: Math.round(step.x * scaleX),
        y: Math.round(step.y * scaleY),
        width: Math.round(step.w * scaleX),
        height: Math.round(step.h * scaleY),
        rotation: 0,
        opacity: 1,
      },
      content: {
        svg: cardSvg,
        colorMode: 'recolorable',
        fill: cardColor,
        color: cardColor,
        preserveAspectRatio: 'none',
      },
    })

    // 2B. Stage Title (inside top banner)
    const defaultStep = PROCESS_LINEAR_FOUR_CARDS_DEFAULT_STEPS[step.index % PROCESS_LINEAR_FOUR_CARDS_DEFAULT_STEPS.length]
    const rawTitle = prevTitle?.content?.text || prevTitle?.content?.html || slots.find((s) => s.id === `STEP_${n}_TITLE`)?.placeholder_text
    const titleText = isPlaceholderOrLatin(rawTitle) ? defaultStep.title : rawTitle

    const titleX = Math.round((step.x + g.titleOffsetX) * scaleX)
    const titleY = Math.round((step.y + g.titleOffsetY) * scaleY)
    const titleW = Math.round(g.titleW * scaleX)
    const titleH = Math.round(g.titleH * scaleY)

    newElements.push({
      id: prevTitle?.id || newId(`txt-step-${n}-title`),
      slotId: `STEP_${n}_TITLE`,
      type: 'text',
      layer: 10,
      placement: {
        x: titleX,
        y: titleY,
        width: titleW,
        height: titleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        align: 'left',
        fontSize: 16,
        fontWeight: 800,
        colorRole: 'white',
        color: '#FFFFFF',
        lineHeight: 1.15,
        clipToSlot: false,
      },
    })

    // 2C. Stage Bullet Points / Body Text
    const rawBody = prevBody?.content?.text || prevBody?.content?.html || slots.find((s) => s.id === `STEP_${n}_BODY`)?.placeholder_text
    let bodyText = ''
    if (isPlaceholderOrLatin(rawBody)) {
      bodyText = defaultStep.bullets.map((b) => `• ${b}`).join('\n')
    } else {
      bodyText = rawBody.includes('•') ? rawBody : rawBody.split('\n').map((l) => l.trim().startsWith('•') ? l : `• ${l}`).join('\n')
    }

    const bodyX = Math.round((step.x + g.bodyOffsetX) * scaleX)
    const bodyY = Math.round((step.y + g.bodyOffsetY) * scaleY)
    const bodyW = Math.round(g.bodyW * scaleX)
    const bodyH = Math.round(g.bodyH * scaleY)

    newElements.push({
      id: prevBody?.id || newId(`txt-step-${n}-body`),
      slotId: `STEP_${n}_BODY`,
      type: 'text',
      layer: 10,
      placement: {
        x: bodyX,
        y: bodyY,
        width: bodyW,
        height: bodyH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: bodyText,
        align: 'left',
        fontSize: 11.5,
        fontWeight: 400,
        colorRole: 'muted',
        color: prevBody?.content?.color || '#475569',
        lineHeight: 1.5,
        clipToSlot: false,
      },
    })
  })

  return newElements
}
