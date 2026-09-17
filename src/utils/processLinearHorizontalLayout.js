/**
 * Process Linear Horizontal Layout
 * Layout ID: process_linear_horizontal_v2
 *
 * Visual Reference: "Linear Process Template"
 *  - 5 Tall Outlined Rounded Rectangle Cards
 *  - Top Zone: Minimal Outline Vector Icons (contract/pen, hand sketching, brain gear, timer, trophy)
 *  - Center Zone: Horizontal Track connecting cards with small dots, and on each card a vibrant
 *                 colored ribbon labeled "STEP 01" .. "STEP 05" in bold white text
 *  - Bottom Zone: Step Title in matching step color + centered description text
 *  - Header: Centered title ("Linear Process Template") with subtle divider
 *
 * Recolorability:
 *  - Each card's ribbon is recolorable via STEP_n_CARD (`colorMode: 'recolorable'`)
 *  - Titles and icons are individually editable and recolorable
 */

export const PROCESS_LINEAR_HORIZONTAL_GEOM = {
  viewW: 1000,
  viewH: 560,

  // Header
  headingX: 100,
  headingY: 28,
  headingW: 800,
  headingH: 38,

  // Cards layout
  cardY: 116,
  cardH: 310,
  cardRadius: 14,
  cardBorderWidth: 1.8,

  // Ribbon Belt
  beltOffsetY: 122, // relative to cardY -> beltY = 238
  beltH: 36,
  beltRadius: 7,

  // Top Icon
  iconOffsetY: 44, // relative to cardY -> iconCenterY = 160
  iconSize: 34,

  // Text below ribbon
  titleOffsetY: 172, // relative to cardY -> titleY = 288
  titleH: 26,
  bodyOffsetY: 202, // relative to cardY -> bodyY = 318
  bodyH: 96,
}

// 5 default colors matching reference image:
// 1: Amber Yellow, 2: Orange, 3: Magenta Pink, 4: Aqua Blue, 5: Royal Blue
export const PROCESS_LINEAR_HORIZONTAL_DEFAULT_COLORS = [
  '#F5A623', // 1: Warm Amber / Yellow
  '#FF793F', // 2: Vibrant Orange
  '#E84393', // 3: Magenta / Rose Pink
  '#00CEC9', // 4: Aqua / Turquoise
  '#0984E3', // 5: Royal / Sky Blue
  '#6C5CE7', // 6: Purple (if 6 steps)
  '#00B894', // 7: Mint Green (if 7 steps)
]

export const PROCESS_LINEAR_HORIZONTAL_DEFAULT_STEPS = [
  {
    title: 'Discovery',
    body: 'Identify core goals, understand stakeholder needs, and align the scope.',
  },
  {
    title: 'Strategy',
    body: 'Formulate strategic roadmaps, allocate resources, and set milestones.',
  },
  {
    title: 'Ideation',
    body: 'Explore creative ideas, build rapid prototypes, and refine concepts.',
  },
  {
    title: 'Execution',
    body: 'Build robust features iteratively, test quality, and ensure excellence.',
  },
  {
    title: 'Launch',
    body: 'Deploy with confidence, track key metrics, and celebrate success.',
  },
]

export function isProcessLinearHorizontalLayout(layoutId) {
  const s = String(layoutId || '').toLowerCase().trim()
  return (
    s === 'process_linear_horizontal_v2' ||
    s === 'process_linear_horizontal'
  )
}

export function isPlaceholderOrLatin(str) {
  const s = String(str || '').toLowerCase().trim()
  if (!s) return true
  return (
    s === 'add text here' ||
    s === 'text goes here' ||
    s.includes('lorem ipsum') ||
    s.includes('dolor sit') ||
    s.includes('consectetur') ||
    s.includes('adipiscing') ||
    s.includes('incididunt') ||
    s.includes('at vero eos')
  )
}

// 5 Crisp Vector Icons matching reference image
export const PROCESS_LINEAR_HORIZONTAL_ICON_PATHS = [
  // 1: Contract / Document with pen
  `
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6"/>
    <line x1="8" y1="13" x2="13" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
    <path d="m15 11 3 3"/>
  `,
  // 2: Hand sketching / writing with pen
  `
    <path d="M18 2l4 4-10 10H8v-4L18 2z"/>
    <path d="M14 6l4 4"/>
    <path d="M4 22h6"/>
  `,
  // 3: Head profile with brain gear / thinking
  `
    <path d="M16 16c2 0 4-2 4-5.5a5.5 5.5 0 0 0-11 0c0 1.5.5 2.5 1.5 3.5L10 22h6v-2"/>
    <circle cx="14" cy="10" r="2"/>
    <path d="M14 6v2m0 4v2m-4-4h2m4 0h2"/>
  `,
  // 4: Stopwatch / Timer
  `
    <circle cx="12" cy="14" r="7"/>
    <path d="M12 11v3l2 2"/>
    <path d="M10 2h4"/>
    <path d="M12 2v3"/>
  `,
  // 5: Head profile with achievement / trophy
  `
    <path d="M14 21v-3a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3"/>
    <circle cx="10" cy="8" r="4"/>
    <path d="M17 9h4v2a2 2 0 0 1-2 2h-2"/>
    <path d="M19 13v3"/>
    <path d="M17 19h4"/>
  `,
]

/**
 * Calculates step positions and geometry based on number of steps.
 */
export function calculateLinearHorizontalStepGeometries(stepCount = 5) {
  const g = PROCESS_LINEAR_HORIZONTAL_GEOM
  const n = Math.max(2, Math.min(7, stepCount))
  const gap = n <= 3 ? 40 : n <= 4 ? 32 : 24
  const totalGaps = (n - 1) * gap
  const padX = n <= 3 ? 120 : n <= 4 ? 70 : 44
  const usableW = g.viewW - padX * 2
  const cardW = Math.round((usableW - totalGaps) / n)

  const steps = []
  for (let i = 0; i < n; i += 1) {
    const cardX = Math.round(padX + i * (cardW + gap))
    const isFirst = i === 0
    const isLast = i === n - 1

    steps.push({
      index: i,
      stepNum: i + 1,
      cardX,
      cardY: g.cardY,
      cardW,
      cardH: g.cardH,
      cx: cardX + cardW / 2,
      isFirst,
      isLast,
      gap,
      beltY: g.cardY + g.beltOffsetY,
      beltH: g.beltH,
      iconX: Math.round(cardX + cardW / 2 - g.iconSize / 2),
      iconY: Math.round(g.cardY + g.iconOffsetY - g.iconSize / 2),
      color: PROCESS_LINEAR_HORIZONTAL_DEFAULT_COLORS[i % PROCESS_LINEAR_HORIZONTAL_DEFAULT_COLORS.length],
      iconPaths: PROCESS_LINEAR_HORIZONTAL_ICON_PATHS[i % PROCESS_LINEAR_HORIZONTAL_ICON_PATHS.length],
    })
  }

  return steps
}

/**
 * Builds standalone SVG for a single card (frame, connector lines, dots, and colored ribbon pill).
 */
export function buildLinearHorizontalCardSvg(step) {
  const g = PROCESS_LINEAR_HORIZONTAL_GEOM
  const { cardW, cardH, beltH, isFirst, isLast, gap } = step
  const beltY = g.beltOffsetY
  const stepLabel = `STEP ${String(step.stepNum).padStart(2, '0')}`

  // Lead connector lines to adjacent cards
  const leadLeft = isFirst ? 14 : Math.round(gap / 2)
  const leadRight = isLast ? 14 : Math.round(gap / 2)
  const midBeltY = beltY + beltH / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardW} ${cardH}" width="100%" height="100%" fill="none">
    <!-- Card outer rounded outline -->
    <rect x="${g.cardBorderWidth / 2}" y="${g.cardBorderWidth / 2}" width="${cardW - g.cardBorderWidth}" height="${cardH - g.cardBorderWidth}" rx="${g.cardRadius}" fill="#FFFFFF" stroke="#4A5568" stroke-width="${g.cardBorderWidth}" />
    
    <!-- Track line on left edge -->
    <line x1="0" y1="${midBeltY}" x2="10" y2="${midBeltY}" stroke="#CBD5E1" stroke-width="2" />
    
    <!-- Track line on right edge -->
    <line x1="${cardW - 10}" y1="${midBeltY}" x2="${cardW}" y2="${midBeltY}" stroke="#CBD5E1" stroke-width="2" />

    <!-- Colored Ribbon Belt across card -->
    <rect x="0" y="${beltY}" width="${cardW}" height="${beltH}" rx="${g.beltRadius}" fill="currentColor" />
    
    <!-- Ribbon label "STEP 01" -->
    <text x="${cardW / 2}" y="${beltY + beltH / 2 + 5}" text-anchor="middle" fill="#FFFFFF" font-size="12.5" font-weight="800" letter-spacing="1" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${stepLabel}
    </text>
  </svg>`
}

/**
 * Builds standalone icon SVG (24x24 viewBox).
 */
export function buildLinearHorizontalIconSvg(iconPaths) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    ${iconPaths}
  </svg>`
}

/**
 * Builds preview SVG for LayoutPolishedPreview.jsx.
 */
export function processLinearHorizontalPreviewSvg(previewHints = {}, theme = {}) {
  const g = PROCESS_LINEAR_HORIZONTAL_GEOM
  const headingText = previewHints?.slots?.HEADING?.text || 'Linear Process Template'

  let count = 0
  for (let i = 1; i <= 7; i += 1) {
    if (previewHints?.slots?.[`STEP_${i}_TITLE`] || previewHints?.slots?.[`STEP_${i}_BODY`]) {
      count = i
    }
  }
  const stepCount = count >= 2 ? count : 5
  const steps = calculateLinearHorizontalStepGeometries(stepCount)

  let cardsSvg = ''
  let textLabels = ''

  // Continuous track connecting cards
  const firstStep = steps[0]
  const lastStep = steps[steps.length - 1]
  const midBeltY = g.cardY + g.beltOffsetY + g.beltH / 2
  const trackLine = `<line x1="${firstStep.cardX - 16}" y1="${midBeltY}" x2="${lastStep.cardX + lastStep.cardW + 16}" y2="${midBeltY}" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="4 3" />`

  steps.forEach((step) => {
    const color = step.color
    const defaultStep = PROCESS_LINEAR_HORIZONTAL_DEFAULT_STEPS[step.index % PROCESS_LINEAR_HORIZONTAL_DEFAULT_STEPS.length]
    const rawTitle = previewHints?.slots?.[`STEP_${step.stepNum}_TITLE`]?.text
    const title = isPlaceholderOrLatin(rawTitle) ? defaultStep.title : rawTitle
    const rawBody = previewHints?.slots?.[`STEP_${step.stepNum}_BODY`]?.text
    const body = isPlaceholderOrLatin(rawBody) ? defaultStep.body : rawBody

    const stepLabel = `STEP ${String(step.stepNum).padStart(2, '0')}`
    const beltY = step.beltY

    // Direct SVG elements for perfect scaling:
    cardsSvg += `
      <!-- Card frame -->
      <rect x="${step.cardX}" y="${step.cardY}" width="${step.cardW}" height="${step.cardH}" rx="${g.cardRadius}" fill="#FFFFFF" stroke="#4A5568" stroke-width="${g.cardBorderWidth}" />
      
      <!-- Top Icon -->
      <g transform="translate(${step.iconX}, ${step.iconY})" color="#4A5568" stroke="#4A5568" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <svg viewBox="0 0 24 24" width="${g.iconSize}" height="${g.iconSize}">
          ${step.iconPaths}
        </svg>
      </g>

      <!-- Colored Ribbon -->
      <rect x="${step.cardX}" y="${beltY}" width="${step.cardW}" height="${g.beltH}" rx="${g.beltRadius}" fill="${color}" />
      
      <!-- Step Label -->
      <text x="${step.cx}" y="${beltY + g.beltH / 2 + 4.5}" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="800" letter-spacing="1" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${stepLabel}
      </text>

      <!-- Connector Dot outside left edge -->
      <circle cx="${step.cardX - step.gap / 2}" cy="${midBeltY}" r="3.5" fill="#4A5568" />
    `

    const titleY = step.cardY + g.titleOffsetY
    const bodyY = step.cardY + g.bodyOffsetY

    textLabels += `
      <text x="${step.cx}" y="${titleY + 12}" text-anchor="middle" fill="${color}" font-size="13" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${title}
      </text>
    `

    const words = body.split(' ')
    const line1 = words.slice(0, 4).join(' ')
    const line2 = words.slice(4, 8).join(' ')
    const line3 = words.slice(8, 12).join(' ')

    textLabels += `
      <text x="${step.cx}" y="${bodyY + 10}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${line1}
      </text>
      <text x="${step.cx}" y="${bodyY + 23}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${line2}
      </text>
      <text x="${step.cx}" y="${bodyY + 36}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${line3}
      </text>
    `
  })

  // Far right dot
  cardsSvg += `<circle cx="${lastStep.cardX + lastStep.cardW + 12}" cy="${midBeltY}" r="3.5" fill="#4A5568" />`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.viewW} ${g.viewH}" width="100%" height="100%" style="background:#FFFFFF;">
    <!-- Title -->
    <text x="500" y="${g.headingY + 26}" text-anchor="middle" fill="#222222" font-size="28" font-weight="800" letter-spacing="0.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${headingText}
    </text>
    <!-- Divider -->
    <line x1="465" y1="${g.headingY + 38}" x2="535" y2="${g.headingY + 38}" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />

    <!-- Connecting Track behind -->
    ${trackLine}
    ${cardsSvg}
    ${textLabels}
  </svg>`
}

/**
 * Layout compiler for canvas elements:
 * Generates modular elements on the AthenaVI canvas:
 *  - HEADING (text)
 *  - STEP_n_CARD (graphic, recolorable frame + ribbon)
 *  - STEP_n_ICON (graphic, outline icon)
 *  - STEP_n_TITLE (text, colored with step accent)
 *  - STEP_n_BODY (text, body description)
 */
export function layoutProcessLinearHorizontal(elements = [], schema = {}, palette = {}, canvas = {}) {
  const g = PROCESS_LINEAR_HORIZONTAL_GEOM
  const canvasW = canvas?.width || 1000
  const canvasH = canvas?.height || 560
  const scaleX = canvasW / g.viewW
  const scaleY = canvasH / g.viewH

  const safeElements = Array.isArray(elements) ? elements : []
  const slots = Array.isArray(schema?.slots) ? schema.slots : []

  let detectedCount = 0
  for (let i = 1; i <= 7; i += 1) {
    if (
      slots.some((s) => s.id === `STEP_${i}_TITLE` || s.id === `STEP_${i}_BODY`) ||
      safeElements.some((el) => el.slotId === `STEP_${i}_TITLE` || el.slotId === `STEP_${i}_BODY`)
    ) {
      detectedCount = i
    }
  }
  const stepCount = detectedCount >= 2 ? detectedCount : 5
  const steps = calculateLinearHorizontalStepGeometries(stepCount)

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
    'Linear Process Template'

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
      align: 'center',
      fontSize: 26,
      fontWeight: 800,
      colorRole: 'text',
      color: prevHeading?.content?.color || '#222222',
      lineHeight: 1.15,
      clipToSlot: false,
    },
  })

  // 2. Track Line background
  const firstStep = steps[0]
  const lastStep = steps[steps.length - 1]
  const midBeltY = g.cardY + g.beltOffsetY + g.beltH / 2
  const trackStartX = Math.round((firstStep.cardX - 16) * scaleX)
  const trackEndX = Math.round((lastStep.cardX + lastStep.cardW + 16) * scaleX)

  newElements.push({
    id: prevBySlot.get('PROCESS_TRACK')?.id || newId('shp-track'),
    slotId: 'PROCESS_TRACK',
    type: 'graphic',
    layer: 1,
    role: 'decoration',
    placement: {
      x: trackStartX,
      y: Math.round((midBeltY - 2) * scaleY),
      width: Math.max(10, trackEndX - trackStartX),
      height: Math.round(4 * scaleY),
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${trackEndX - trackStartX} 4" width="100%" height="100%" fill="none">
        <line x1="0" y1="2" x2="${trackEndX - trackStartX}" y2="2" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="4 3" />
      </svg>`,
      colorMode: 'fixed',
      fill: '#CBD5E1',
      alt: 'Process Track',
    },
  })

  // 3. Step Cards, Icons, Titles, and Descriptions
  steps.forEach((step) => {
    const n = step.stepNum
    const defaultStep = PROCESS_LINEAR_HORIZONTAL_DEFAULT_STEPS[step.index % PROCESS_LINEAR_HORIZONTAL_DEFAULT_STEPS.length]

    const prevCard = prevBySlot.get(`STEP_${n}_CARD`) || prevBySlot.get(`STEP_${n}_SHAPE`)
    const prevIcon = prevBySlot.get(`STEP_${n}_ICON`)
    const prevTitle = prevBySlot.get(`STEP_${n}_TITLE`)
    const prevBody = prevBySlot.get(`STEP_${n}_BODY`)

    const cardColor = prevCard?.content?.fill || prevCard?.content?.color || step.color

    // 3A. Standalone Card Graphic (frame + colored ribbon)
    const cardSvg = buildLinearHorizontalCardSvg(step)
    newElements.push({
      id: prevCard?.id || newId(`grp-step-${n}-card`),
      slotId: `STEP_${n}_CARD`,
      type: 'graphic',
      layer: 2,
      role: 'decoration',
      placement: {
        x: Math.round(step.cardX * scaleX),
        y: Math.round(step.cardY * scaleY),
        width: Math.round(step.cardW * scaleX),
        height: Math.round(step.cardH * scaleY),
        rotation: 0,
        opacity: 1,
      },
      content: {
        svg: cardSvg,
        colorMode: 'recolorable',
        fill: cardColor,
        color: cardColor,
        colorRole: 'primary',
        alt: `Step ${n} Card`,
      },
    })

    // 3B. Standalone Icon Graphic (top of card)
    const iconDeleted = prevBySlot.has(`STEP_${n}_ICON_DELETED`)
    if (!iconDeleted) {
      const iconSvg = buildLinearHorizontalIconSvg(step.iconPaths)
      newElements.push({
        id: prevIcon?.id || newId(`grp-step-${n}-icon`),
        slotId: `STEP_${n}_ICON`,
        type: 'graphic',
        layer: 5,
        role: 'decoration',
        placement: {
          x: Math.round(step.iconX * scaleX),
          y: Math.round(step.iconY * scaleY),
          width: Math.round(g.iconSize * scaleX),
          height: Math.round(g.iconSize * scaleY),
          rotation: 0,
          opacity: 1,
        },
        content: {
          svg: iconSvg,
          colorMode: 'recolorable',
          fill: prevIcon?.content?.fill || '#4A5568',
          color: prevIcon?.content?.color || '#4A5568',
          alt: `Step ${n} Icon`,
        },
      })
    }

    // 3C. STEP_n_TITLE Text Element
    const titleSlot = slots.find((s) => s.id === `STEP_${n}_TITLE`)
    const rawTitle =
      prevTitle?.content?.text ||
      prevTitle?.content?.html ||
      titleSlot?.placeholder_text
    const titleText = isPlaceholderOrLatin(rawTitle) ? defaultStep.title : rawTitle

    const textX = Math.round((step.cardX + 8) * scaleX)
    const textW = Math.round((step.cardW - 16) * scaleX)
    const titleY = Math.round((step.cardY + g.titleOffsetY) * scaleY)

    newElements.push({
      id: prevTitle?.id || newId(`txt-step-${n}-title`),
      slotId: `STEP_${n}_TITLE`,
      type: 'text',
      layer: 10,
      placement: {
        x: textX,
        y: titleY,
        width: textW,
        height: Math.round(g.titleH * scaleY),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        align: 'center',
        fontSize: 13,
        fontWeight: 800,
        colorRole: 'primary',
        color: prevTitle?.content?.color || cardColor,
        lineHeight: 1.15,
        clipToSlot: false,
      },
    })

    // 3D. STEP_n_BODY Text Element
    const bodySlot = slots.find((s) => s.id === `STEP_${n}_BODY`)
    const rawBody =
      prevBody?.content?.text ||
      prevBody?.content?.html ||
      bodySlot?.placeholder_text
    const bodyText = isPlaceholderOrLatin(rawBody) ? defaultStep.body : rawBody

    const bodyY = Math.round((step.cardY + g.bodyOffsetY) * scaleY)

    newElements.push({
      id: prevBody?.id || newId(`txt-step-${n}-body`),
      slotId: `STEP_${n}_BODY`,
      type: 'text',
      layer: 10,
      placement: {
        x: textX,
        y: bodyY,
        width: textW,
        height: Math.round(g.bodyH * scaleY),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: bodyText,
        align: 'center',
        fontSize: 11,
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
