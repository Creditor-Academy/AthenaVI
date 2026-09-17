/**
 * Process Linear Numeric Cards Layout
 * Layout ID: process_linear_numeric_cards_v1
 *
 * Visual Reference: "4-Stage Connected Process Cards"
 *  - 4 Rounded Rectangular Cards:
 *      * Thick colored outer border with large rounded corners (rx: 28)
 *      * Solid white inner card area
 *      * Soft tinted circular number badge at top ("01", "02", "03", "04")
 *      * Bold Step Title in matching card accent color
 *      * Multi-line centered body text
 *  - Alternating Curved Bridges / Links:
 *      * Bridge 1 (Card 1 -> 2): High bridge in Card 2's color (Coral Red)
 *      * Bridge 2 (Card 2 -> 3): Low bridge in Card 3's color (Slate Navy)
 *      * Bridge 3 (Card 3 -> 4): High bridge in Card 4's color (Cyan)
 *      * Smooth concave fillets connecting the card bodies
 *  - Header: Centered main slide HEADING at top
 *
 * Recolorability:
 *  - Each card is an individual graphic element STEP_n_CARD with colorMode: 'recolorable'.
 */

export const PROCESS_LINEAR_NUMERIC_CARDS_GEOM = {
  viewW: 1000,
  viewH: 560,

  // Header
  headingX: 70,
  headingY: 36,
  headingW: 860,
  headingH: 42,

  // 4 Cards
  cardCount: 4,
  cardW: 192,
  cardH: 370,
  cardY: 116,
  gap: 48,
  cardRx: 28,
  borderWidth: 16,

  // Inner card contents
  badgeCy: 60,
  badgeR: 28,

  titleOffsetY: 108,
  titleH: 26,

  bodyOffsetY: 144,
  bodyW: 160,
  bodyH: 180,

  // Bridges
  bridgeW: 48,
  bridgeH: 52,
  bridgeUpperY: 190, // Card 1 -> 2 and Card 3 -> 4
  bridgeLowerY: 342, // Card 2 -> 3
  bridgeFilletR: 16,
}

// 4 distinct card colors matching the reference image:
// 1: Warm Amber / Golden Orange
// 2: Coral / Poppy Red
// 3: Deep Slate Navy
// 4: Vibrant Cyan / Sky Blue
export const PROCESS_LINEAR_NUMERIC_CARDS_DEFAULT_COLORS = [
  '#F59E0B', // 1: Warm Amber
  '#EF4444', // 2: Coral Red
  '#1E3A5F', // 3: Deep Slate Navy
  '#06B6D4', // 4: Vibrant Cyan
]

export const PROCESS_LINEAR_NUMERIC_CARDS_TINT_COLORS = [
  '#FEF3C7', // 1: Amber light tint
  '#FEE2E2', // 2: Coral light tint
  '#E0E7FF', // 3: Navy light tint
  '#E0F2FE', // 4: Cyan light tint
]

export const PROCESS_LINEAR_NUMERIC_CARDS_DEFAULT_STEPS = [
  {
    title: 'Lorem Ipsum',
    body: 'Lorem ipsum dolor sit amet, nibh est. A magna maecenas, quam magna nec quis, lorem nunc. Suspendisse viverra sodales mauris, cras pharetra proin egestas arcu erat dolor, at.',
  },
  {
    title: 'Lorem Ipsum',
    body: 'Lorem ipsum dolor sit amet, nibh est. A magna maecenas, quam magna nec quis, lorem nunc. Suspendisse viverra sodales mauris, cras pharetra proin egestas arcu erat dolor, at.',
  },
  {
    title: 'Lorem Ipsum',
    body: 'Lorem ipsum dolor sit amet, nibh est. A magna maecenas, quam magna nec quis, lorem nunc. Suspendisse viverra sodales mauris, cras pharetra proin egestas arcu erat dolor, at.',
  },
  {
    title: 'Lorem Ipsum',
    body: 'Lorem ipsum dolor sit amet, nibh est. A magna maecenas, quam magna nec quis, lorem nunc. Suspendisse viverra sodales mauris, cras pharetra proin egestas arcu erat dolor, at.',
  },
]

export function isProcessLinearNumericCardsLayout(layoutId) {
  const s = String(layoutId || '').toLowerCase().trim()
  return (
    s === 'process_linear_numeric_cards_v1' ||
    s === 'process_linear_numeric_cards'
  )
}

export function isPlaceholderOrLatinText(str) {
  const s = String(str || '').toLowerCase().trim()
  if (!s) return true
  return (
    s === 'shape title' ||
    s === 'process overview' ||
    s === 'add text here' ||
    s === 'text goes here' ||
    s.includes('accus qui amus') ||
    s.includes('dignissimos ducim')
  )
}

/**
 * Calculates geometry for 4 cards.
 */
export function calculateProcessLinearNumericCardsGeometries(stepCount = 4) {
  const g = PROCESS_LINEAR_NUMERIC_CARDS_GEOM
  const n = Math.max(2, Math.min(4, stepCount))
  const totalW = n * g.cardW + (n - 1) * g.gap
  const startX = Math.round((g.viewW - totalW) / 2)

  const steps = []
  for (let i = 0; i < n; i += 1) {
    const x = startX + i * (g.cardW + g.gap)
    const numStr = String(i + 1).padStart(2, '0')
    const color = PROCESS_LINEAR_NUMERIC_CARDS_DEFAULT_COLORS[i % PROCESS_LINEAR_NUMERIC_CARDS_DEFAULT_COLORS.length]
    const tintColor = PROCESS_LINEAR_NUMERIC_CARDS_TINT_COLORS[i % PROCESS_LINEAR_NUMERIC_CARDS_TINT_COLORS.length]

    steps.push({
      index: i,
      stepNum: i + 1,
      numStr,
      x,
      y: g.cardY,
      w: g.cardW,
      h: g.cardH,
      cx: x + g.cardW / 2,
      color,
      tintColor,
    })
  }

  return steps
}

/**
 * Builds standalone SVG for a single card container.
 */
export function buildLinearNumericCardSvg(step) {
  const g = PROCESS_LINEAR_NUMERIC_CARDS_GEOM
  const { w, h, numStr, tintColor } = step
  const bw = g.borderWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" fill="none">
    <!-- Outer Thick Rounded Frame in Step Color -->
    <rect x="${bw / 2}" y="${bw / 2}" width="${w - bw}" height="${h - bw}" rx="${g.cardRx}" ry="${g.cardRx}" fill="#FFFFFF" stroke="currentColor" stroke-width="${bw}" />

    <!-- Soft Tinted Circular Number Badge -->
    <circle cx="${w / 2}" cy="${g.badgeCy}" r="${g.badgeR}" fill="${tintColor}" />

    <!-- Bold 2-Digit Number in Matching Color -->
    <text x="${w / 2}" y="${g.badgeCy + 8}" text-anchor="middle" fill="currentColor" font-size="24" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${numStr}
    </text>
  </svg>`
}

/**
 * Builds preview SVG for LayoutPolishedPreview.jsx.
 */
export function processLinearNumericCardsPreviewSvg(previewHints = {}, theme = {}) {
  const g = PROCESS_LINEAR_NUMERIC_CARDS_GEOM
  const headingText = previewHints?.slots?.HEADING?.text || 'Linear Process Cards'
  const steps = calculateProcessLinearNumericCardsGeometries(4)

  // 1. Bridges between cards
  let bridgesSvg = ''
  for (let i = 0; i < steps.length - 1; i += 1) {
    const nextStep = steps[i + 1]
    const curStep = steps[i]
    const bridgeX = curStep.x + g.cardW - 8
    const bridgeW = g.gap + 16
    const isUpper = i % 2 === 0
    const bridgeY = isUpper ? g.bridgeUpperY - g.bridgeFilletR : g.bridgeLowerY - g.bridgeFilletR
    const bridgeH = g.bridgeH + g.bridgeFilletR * 2
    const color = nextStep.color

    const r = g.bridgeFilletR
    const path = `M 0,0 
      Q 0,${r} ${r},${r} 
      L ${bridgeW - r},${r} 
      Q ${bridgeW},${r} ${bridgeW},0 
      L ${bridgeW},${bridgeH} 
      Q ${bridgeW},${bridgeH - r} ${bridgeW - r},${bridgeH - r} 
      L ${r},${bridgeH - r} 
      Q 0,${bridgeH - r} 0,${bridgeH} 
      Z`

    bridgesSvg += `
      <g transform="translate(${bridgeX}, ${bridgeY})">
        <path d="${path}" fill="${color}" />
      </g>
    `
  }

  // 2. Cards and text
  let cardsSvg = ''
  steps.forEach((step) => {
    const defaultStep = PROCESS_LINEAR_NUMERIC_CARDS_DEFAULT_STEPS[step.index % PROCESS_LINEAR_NUMERIC_CARDS_DEFAULT_STEPS.length]
    const rawTitle = previewHints?.slots?.[`STEP_${step.stepNum}_TITLE`]?.text
    const title = isPlaceholderOrLatinText(rawTitle) ? defaultStep.title : rawTitle
    const rawBody = previewHints?.slots?.[`STEP_${step.stepNum}_BODY`]?.text
    const body = isPlaceholderOrLatinText(rawBody) ? defaultStep.body : rawBody

    const bw = g.borderWidth
    const cx = step.x + step.w / 2

    cardsSvg += `
      <!-- Card Container -->
      <g transform="translate(${step.x}, ${step.y})">
        <!-- Outer Frame -->
        <rect x="${bw / 2}" y="${bw / 2}" width="${step.w - bw}" height="${step.h - bw}" rx="${g.cardRx}" ry="${g.cardRx}" fill="#FFFFFF" stroke="${step.color}" stroke-width="${bw}" />

        <!-- Number Badge Circle -->
        <circle cx="${step.w / 2}" cy="${g.badgeCy}" r="${g.badgeR}" fill="${step.tintColor}" />

        <!-- 2-Digit Number -->
        <text x="${step.w / 2}" y="${g.badgeCy + 8}" text-anchor="middle" fill="${step.color}" font-size="24" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
          ${step.numStr}
        </text>
      </g>

      <!-- Step Title -->
      <text x="${cx}" y="${step.y + g.titleOffsetY + 16}" text-anchor="middle" fill="${step.color}" font-size="16" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${title}
      </text>
    `

    // Multi-line body text
    const words = body.split(' ')
    const lines = []
    let curLine = ''
    words.forEach((w) => {
      if ((curLine + ' ' + w).length > 22) {
        if (curLine) lines.push(curLine.trim())
        curLine = w
      } else {
        curLine += ' ' + w
      }
    })
    if (curLine) lines.push(curLine.trim())

    const maxLines = Math.min(8, lines.length)
    for (let l = 0; l < maxLines; l += 1) {
      cardsSvg += `
        <text x="${cx}" y="${step.y + g.bodyOffsetY + 14 + l * 17}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
          ${lines[l]}
        </text>
      `
    }
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.viewW} ${g.viewH}" width="100%" height="100%" fill="none">
    <!-- Clean White Background -->
    <rect width="${g.viewW}" height="${g.viewH}" fill="#FFFFFF" />

    <!-- Centered Header -->
    <text x="${g.viewW / 2}" y="${g.headingY + 24}" text-anchor="middle" fill="#1E293B" font-size="28" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${headingText}
    </text>

    <!-- Connecting Bridges (Layer 1) -->
    ${bridgesSvg}

    <!-- Cards & Text (Layer 2) -->
    ${cardsSvg}
  </svg>`
}

/**
 * Compiles and positions slide elements for process_linear_numeric_cards_v1.
 */
export function layoutProcessLinearNumericCards(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const g = PROCESS_LINEAR_NUMERIC_CARDS_GEOM

  const scaleX = canvasW / g.viewW
  const scaleY = canvasH / g.viewH

  const safeElements = Array.isArray(elements) ? elements : []
  const slots = Array.isArray(schema?.slots) ? schema.slots : []

  const prevBySlot = new Map()
  safeElements.forEach((el) => {
    if (el?.slotId) prevBySlot.set(el.slotId, el)
  })

  const newId = (prefix) => `plnc-${prefix}-${Math.random().toString(36).slice(2, 9)}`
  const steps = calculateProcessLinearNumericCardsGeometries(4)

  const newElements = []

  // 1. Centered Header
  const prevHeading = prevBySlot.get('HEADING')
  const defaultHeading = slots.find((s) => s.id === 'HEADING')?.placeholder_text || 'Linear Process Cards'
  const headingText = prevHeading?.content?.text || defaultHeading

  newElements.push({
    id: prevHeading?.id || newId('heading'),
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
      align: 'center',
      fontSize: 28,
      fontWeight: 800,
      colorRole: 'text',
      color: prevHeading?.content?.color || '#1E293B',
      lineHeight: 1.15,
      clipToSlot: false,
    },
  })

  // 2. Connecting Bridges (Layer 1)
  for (let i = 0; i < steps.length - 1; i += 1) {
    const curStep = steps[i]
    const nextStep = steps[i + 1]

    const prevCardNext = prevBySlot.get(`STEP_${nextStep.stepNum}_CARD`) || prevBySlot.get(`STEP_${nextStep.stepNum}_SHAPE`)
    const bridgeColor = prevCardNext?.content?.fill || prevCardNext?.content?.color || nextStep.color

    const bridgeX = curStep.x + g.cardW - 8
    const bridgeW = g.gap + 16
    const isUpper = i % 2 === 0
    const bridgeY = isUpper ? g.bridgeUpperY - g.bridgeFilletR : g.bridgeLowerY - g.bridgeFilletR
    const bridgeH = g.bridgeH + g.bridgeFilletR * 2

    const r = g.bridgeFilletR
    const bridgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bridgeW} ${bridgeH}" width="100%" height="100%" fill="none">
      <path d="M 0,0 Q 0,${r} ${r},${r} L ${bridgeW - r},${r} Q ${bridgeW},${r} ${bridgeW},0 L ${bridgeW},${bridgeH} Q ${bridgeW},${bridgeH - r} ${bridgeW - r},${bridgeH - r} L ${r},${bridgeH - r} Q 0,${bridgeH - r} 0,${bridgeH} Z" fill="${bridgeColor}" />
    </svg>`

    newElements.push({
      id: newId(`bridge-${i + 1}-${i + 2}`),
      slotId: `BRIDGE_${i + 1}_${i + 2}`,
      type: 'graphic',
      layer: 1,
      role: 'decoration',
      placement: {
        x: Math.round(bridgeX * scaleX),
        y: Math.round(bridgeY * scaleY),
        width: Math.round(bridgeW * scaleX),
        height: Math.round(bridgeH * scaleY),
        rotation: 0,
        opacity: 1,
      },
      content: {
        svg: bridgeSvg,
        colorMode: 'recolorable',
        fill: bridgeColor,
        color: bridgeColor,
        preserveAspectRatio: 'none',
      },
    })
  }

  // 3. Four Cards, Titles, and Descriptions (Layer 2+)
  steps.forEach((step, idx) => {
    const n = step.stepNum
    const prevCard = prevBySlot.get(`STEP_${n}_CARD`) || prevBySlot.get(`STEP_${n}_SHAPE`)
    const prevTitle = prevBySlot.get(`STEP_${n}_TITLE`)
    const prevBody = prevBySlot.get(`STEP_${n}_BODY`)

    const cardColor = prevCard?.content?.fill || prevCard?.content?.color || step.color
    const defaultStep = PROCESS_LINEAR_NUMERIC_CARDS_DEFAULT_STEPS[step.index % PROCESS_LINEAR_NUMERIC_CARDS_DEFAULT_STEPS.length]

    // 3A. Card Container
    const cardSvg = buildLinearNumericCardSvg({ ...step, color: cardColor })
    newElements.push({
      id: prevCard?.id || newId(`card-${n}`),
      slotId: `STEP_${n}_CARD`,
      type: 'graphic',
      layer: 2 + idx,
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

    // 3B. Step Title
    const rawTitle = prevTitle?.content?.text || prevTitle?.content?.html || slots.find((s) => s.id === `STEP_${n}_TITLE`)?.placeholder_text
    const titleText = isPlaceholderOrLatinText(rawTitle) ? defaultStep.title : rawTitle

    const titleW = Math.round((step.w - 32) * scaleX)
    const titleX = Math.round((step.x + 16) * scaleX)
    const titleY = Math.round((step.y + g.titleOffsetY) * scaleY)
    const titleColor = prevTitle?.content?.color || cardColor

    newElements.push({
      id: prevTitle?.id || newId(`title-${n}`),
      slotId: `STEP_${n}_TITLE`,
      type: 'text',
      layer: 10,
      placement: {
        x: titleX,
        y: titleY,
        width: titleW,
        height: Math.round(g.titleH * scaleY),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        align: 'center',
        fontSize: 16,
        fontWeight: 800,
        colorRole: 'primary',
        color: titleColor,
        lineHeight: 1.2,
        clipToSlot: false,
      },
    })

    // 3C. Step Body
    const rawBody = prevBody?.content?.text || prevBody?.content?.html || slots.find((s) => s.id === `STEP_${n}_BODY`)?.placeholder_text
    const bodyText = isPlaceholderOrLatinText(rawBody) ? defaultStep.body : rawBody

    const bodyW = Math.round(g.bodyW * scaleX)
    const bodyX = Math.round((step.x + (step.w - g.bodyW) / 2) * scaleX)
    const bodyY = Math.round((step.y + g.bodyOffsetY) * scaleY)

    newElements.push({
      id: prevBody?.id || newId(`body-${n}`),
      slotId: `STEP_${n}_BODY`,
      type: 'text',
      layer: 10,
      placement: {
        x: bodyX,
        y: bodyY,
        width: bodyW,
        height: Math.round(g.bodyH * scaleY),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: bodyText,
        align: 'center',
        fontSize: 12,
        fontWeight: 400,
        colorRole: 'muted',
        color: prevBody?.content?.color || '#64748B',
        lineHeight: 1.45,
        clipToSlot: false,
      },
    })
  })

  return newElements
}
