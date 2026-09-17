/**
 * Process Linear Horti Four Layout
 * Layout ID: process_linner_horti_four_v1
 *
 * Visual Reference: "Business Process"
 *  - 4 Connected Vibrant Circles:
 *      * Step 1: Vibrant Coral Red circle with Search/Magnifying Glass outline icon
 *      * Step 2: Warm Amber Orange circle with Clock/Timer outline icon
 *      * Step 3: Bright Sky Blue circle with Cog/Gear outline icon
 *      * Step 4: Deep Royal Blue circle with Target/Bullseye outline icon
 *  - Surrounding arcs:
 *      * Top dotted arc hugging upper perimeter
 *      * Bottom solid arc hugging lower perimeter
 *      * Horizontal connector line with central ring node between adjacent circles
 *  - Centered Header: "Business Process"
 *  - Labels: "OPTION 01", "OPTION 02", "OPTION 03", "OPTION 04" in matching step accent color
 *  - Centered multi-line description text below each title
 *
 * Recolorability:
 *  - Each circle node is an individual graphic element STEP_n_SHAPE with colorMode: 'recolorable'.
 *  - Selecting any badge allows instant recoloring of its circle, arcs, and connector ring.
 */

export const PROCESS_LINEAR_HORTI_FOUR_GEOM = {
  viewW: 1000,
  viewH: 560,

  // Header
  headingX: 100,
  headingY: 34,
  headingW: 800,
  headingH: 42,

  // Nodes
  cy: 220,
  rCircle: 46,
  rArc: 58,
  iconSize: 28,

  // Text below
  titleOffsetY: 82,
  titleW: 180,
  titleH: 26,
  bodyOffsetY: 112,
  bodyW: 180,
  bodyH: 64,
}

// 4 Vibrant colors matching reference image: Red, Orange, Sky Blue, Royal Blue
export const PROCESS_LINEAR_HORTI_FOUR_DEFAULT_COLORS = [
  '#EE3B3B', // 1: Coral Red
  '#FB8C00', // 2: Amber Orange
  '#38BDF8', // 3: Sky Blue
  '#2563EB', // 4: Royal Blue
]

export const PROCESS_LINEAR_HORTI_FOUR_DEFAULT_STEPS = [
  {
    title: 'OPTION 01',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  {
    title: 'OPTION 02',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  {
    title: 'OPTION 03',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  {
    title: 'OPTION 04',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
]

export function isProcessLinearHortiFourLayout(layoutId) {
  const s = String(layoutId || '').toLowerCase().trim()
  return (
    s === 'process_linner_horti_four_v1' ||
    s === 'process_linear_horti_four'
  )
}

export function isPlaceholderOrLatinText(str) {
  const s = String(str || '').toLowerCase().trim()
  if (!s) return true
  return (
    s === 'add text here' ||
    s === 'text goes here' ||
    s.includes('at vero eos') ||
    s.includes('accus qui amus') ||
    s.includes('dignissimos ducim')
  )
}

// 4 Crisp Outline Vector Icons matching reference image:
// 1: Search / Magnifying glass
// 2: Clock / Timer
// 3: Cog / Settings gear
// 4: Bullseye / Target
export const PROCESS_LINEAR_HORTI_FOUR_ICON_PATHS = [
  // 1: Magnifying glass / Search
  `
    <circle cx="11" cy="11" r="7"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  `,
  // 2: Clock / Timer
  `
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 15 15"/>
  `,
  // 3: Cog / Settings gear
  `
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  `,
  // 4: Bullseye / Target
  `
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  `,
]

/**
 * Calculates geometry for the 4 step nodes.
 */
export function calculateProcessHortiFourStepGeometries(stepCount = 4) {
  const g = PROCESS_LINEAR_HORTI_FOUR_GEOM
  const n = Math.max(2, Math.min(6, stepCount))
  const padX = n <= 3 ? 180 : n === 4 ? 135 : 90
  const usableW = g.viewW - padX * 2
  const stepGap = usableW / (n - 1)

  const steps = []
  for (let i = 0; i < n; i += 1) {
    const cx = Math.round(padX + i * stepGap)
    const isLast = i === n - 1
    const nextCx = isLast ? null : Math.round(padX + (i + 1) * stepGap)

    // Element bounding box for the badge
    const x = cx - g.rArc - 6
    const y = g.cy - g.rArc - 6
    const connectorEndX = isLast ? cx + g.rArc + 6 : nextCx - g.rArc - 6
    const w = Math.max((g.rArc + 6) * 2, connectorEndX - x)
    const h = (g.rArc + 6) * 2

    steps.push({
      index: i,
      stepNum: i + 1,
      cx,
      cy: g.cy,
      isLast,
      nextCx,
      x,
      y,
      w,
      h,
      localCx: g.rArc + 6,
      localCy: g.rArc + 6,
      connectorEndX: w,
      color: PROCESS_LINEAR_HORTI_FOUR_DEFAULT_COLORS[i % PROCESS_LINEAR_HORTI_FOUR_DEFAULT_COLORS.length],
      iconPaths: PROCESS_LINEAR_HORTI_FOUR_ICON_PATHS[i % PROCESS_LINEAR_HORTI_FOUR_ICON_PATHS.length],
    })
  }

  return steps
}

/**
 * Builds standalone SVG for a single step badge:
 * - Central filled circle in currentColor
 * - Top dotted arc
 * - Bottom solid arc
 * - Connector line with ring node to next circle
 * - White outline icon in center
 */
export function buildProcessHortiFourStepSvg(step) {
  const g = PROCESS_LINEAR_HORTI_FOUR_GEOM
  const { localCx, localCy, w, h, isLast, iconPaths } = step

  const topStartX = (localCx - g.rArc * 0.866).toFixed(1)
  const topStartY = (localCy - g.rArc * 0.5).toFixed(1)
  const topEndX = (localCx + g.rArc * 0.866).toFixed(1)
  const topEndY = (localCy - g.rArc * 0.5).toFixed(1)

  const botStartX = (localCx - g.rArc * 0.819).toFixed(1)
  const botStartY = (localCy + g.rArc * 0.574).toFixed(1)
  const botEndX = (localCx + g.rArc * 0.819).toFixed(1)
  const botEndY = (localCy + g.rArc * 0.574).toFixed(1)

  let connectorSvg = ''
  if (!isLast) {
    const lineStartX = localCx + g.rArc + 4
    const lineEndX = w
    const midRingX = (lineStartX + lineEndX) / 2
    connectorSvg = `
      <line x1="${lineStartX}" y1="${localCy}" x2="${lineEndX}" y2="${localCy}" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
      <circle cx="${midRingX.toFixed(1)}" cy="${localCy}" r="5.5" fill="#FFFFFF" stroke="currentColor" stroke-width="2.6" />
    `
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" fill="none">
    ${connectorSvg}

    <!-- Top Dotted Arc -->
    <path d="M ${topStartX} ${topStartY} A ${g.rArc} ${g.rArc} 0 0 1 ${topEndX} ${topEndY}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="2 7" />

    <!-- Bottom Solid Arc -->
    <path d="M ${botStartX} ${botStartY} A ${g.rArc} ${g.rArc} 0 0 0 ${botEndX} ${botEndY}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />

    <!-- Central Filled Circle -->
    <circle cx="${localCx}" cy="${localCy}" r="${g.rCircle}" fill="currentColor" />

    <!-- Center White Outline Icon -->
    <g transform="translate(${localCx - g.iconSize / 2}, ${localCy - g.iconSize / 2})" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${iconPaths}
    </g>
  </svg>`
}

/**
 * Builds standalone icon SVG.
 */
export function buildProcessHortiFourIconSvg(iconPaths) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    ${iconPaths}
  </svg>`
}

/**
 * Builds preview SVG for LayoutPolishedPreview.jsx.
 */
export function processLinearHortiFourPreviewSvg(previewHints = {}, theme = {}) {
  const g = PROCESS_LINEAR_HORTI_FOUR_GEOM
  const headingText = previewHints?.slots?.HEADING?.text || 'Business Process'

  let count = 0
  for (let i = 1; i <= 6; i += 1) {
    if (previewHints?.slots?.[`STEP_${i}_TITLE`] || previewHints?.slots?.[`STEP_${i}_BODY`]) {
      count = i
    }
  }
  const stepCount = count >= 2 ? count : 4
  const steps = calculateProcessHortiFourStepGeometries(stepCount)

  let svgs = ''
  let textLabels = ''

  steps.forEach((step) => {
    const color = step.color

    const topStartX = (step.cx - g.rArc * 0.866).toFixed(1)
    const topStartY = (step.cy - g.rArc * 0.5).toFixed(1)
    const topEndX = (step.cx + g.rArc * 0.866).toFixed(1)
    const topEndY = (step.cy - g.rArc * 0.5).toFixed(1)

    const botStartX = (step.cx - g.rArc * 0.819).toFixed(1)
    const botStartY = (step.cy + g.rArc * 0.574).toFixed(1)
    const botEndX = (step.cx + g.rArc * 0.819).toFixed(1)
    const botEndY = (step.cy + g.rArc * 0.574).toFixed(1)

    let connectorSvg = ''
    if (!step.isLast) {
      const lineStartX = step.cx + g.rArc + 4
      const lineEndX = step.nextCx - g.rArc - 4
      const midRingX = (lineStartX + lineEndX) / 2
      connectorSvg = `
        <line x1="${lineStartX}" y1="${step.cy}" x2="${lineEndX}" y2="${step.cy}" stroke="${color}" stroke-width="2.6" stroke-linecap="round" />
        <circle cx="${midRingX.toFixed(1)}" cy="${step.cy}" r="5.5" fill="#FFFFFF" stroke="${color}" stroke-width="2.6" />
      `
    }

    svgs += `
      ${connectorSvg}

      <!-- Top Dotted Arc -->
      <path d="M ${topStartX} ${topStartY} A ${g.rArc} ${g.rArc} 0 0 1 ${topEndX} ${topEndY}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="2 7" />

      <!-- Bottom Solid Arc -->
      <path d="M ${botStartX} ${botStartY} A ${g.rArc} ${g.rArc} 0 0 0 ${botEndX} ${botEndY}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" />

      <!-- Central Filled Circle -->
      <circle cx="${step.cx}" cy="${step.cy}" r="${g.rCircle}" fill="${color}" />

      <!-- Center White Outline Icon -->
      <g transform="translate(${step.cx - g.iconSize / 2}, ${step.cy - g.iconSize / 2})" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        ${step.iconPaths}
      </g>
    `

    const defaultStep = PROCESS_LINEAR_HORTI_FOUR_DEFAULT_STEPS[step.index % PROCESS_LINEAR_HORTI_FOUR_DEFAULT_STEPS.length]
    const rawTitle = previewHints?.slots?.[`STEP_${step.stepNum}_TITLE`]?.text
    const title = isPlaceholderOrLatinText(rawTitle) ? defaultStep.title : rawTitle
    const rawBody = previewHints?.slots?.[`STEP_${step.stepNum}_BODY`]?.text
    const body = isPlaceholderOrLatinText(rawBody) ? defaultStep.body : rawBody

    const titleY = step.cy + g.titleOffsetY
    const bodyY = step.cy + g.bodyOffsetY

    textLabels += `
      <text x="${step.cx}" y="${titleY + 14}" text-anchor="middle" fill="${color}" font-size="13.5" font-weight="800" letter-spacing="0.6" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${title.toUpperCase()}
      </text>
    `

    const words = body.split(' ')
    const line1 = words.slice(0, 4).join(' ')
    const line2 = words.slice(4, 8).join(' ')

    textLabels += `
      <text x="${step.cx}" y="${bodyY + 12}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${line1}
      </text>
      <text x="${step.cx}" y="${bodyY + 26}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${line2}
      </text>
    `
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.viewW} ${g.viewH}" width="100%" height="100%" style="background:#FFFFFF;">
    <!-- Centered Header -->
    <text x="${g.viewW / 2}" y="${g.headingY + 28}" text-anchor="middle" fill="#1E293B" font-size="28" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${headingText}
    </text>

    <!-- Badges, Arcs, and Connectors -->
    ${svgs}

    <!-- Text Labels -->
    ${textLabels}
  </svg>`
}

/**
 * Compiles and positions slide elements for process_linner_horti_four_v1.
 */
export function layoutProcessLinearHortiFour(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const g = PROCESS_LINEAR_HORTI_FOUR_GEOM

  const scaleX = canvasW / g.viewW
  const scaleY = canvasH / g.viewH

  const safeElements = Array.isArray(elements) ? elements : []
  const slots = Array.isArray(schema?.slots) ? schema.slots : []

  // Detect number of steps
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
  const steps = calculateProcessHortiFourStepGeometries(stepCount)

  // Map existing elements by slotId
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
    'Business Process'

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
      fontSize: 28,
      fontWeight: 800,
      colorRole: 'text',
      color: prevHeading?.content?.color || '#1E293B',
      lineHeight: 1.15,
      clipToSlot: false,
    },
  })

  // 2. Step Badges, Titles, and Descriptions
  steps.forEach((step) => {
    const n = step.stepNum

    // User custom fills if previously edited
    const prevShape = prevBySlot.get(`STEP_${n}_SHAPE`) || prevBySlot.get(`STEP_${n}_NODE`) || prevBySlot.get(`STEP_${n}_RING`)
    const prevTitle = prevBySlot.get(`STEP_${n}_TITLE`)
    const prevBody = prevBySlot.get(`STEP_${n}_BODY`)

    const shapeColor = prevShape?.content?.fill || prevShape?.content?.color || step.color

    // 2A. Standalone Badge Graphic (filled circle, dotted top arc, solid bottom arc, connector & ring, white icon)
    const badgeSvg = buildProcessHortiFourStepSvg(step)
    newElements.push({
      id: prevShape?.id || newId(`grp-step-${n}-shape`),
      slotId: `STEP_${n}_SHAPE`,
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
        svg: badgeSvg,
        colorMode: 'recolorable',
        fill: shapeColor,
        color: shapeColor,
        preserveAspectRatio: 'xMidYMid meet',
      },
    })

    // 2B. Step Title ("OPTION 01", etc.)
    const defaultStep = PROCESS_LINEAR_HORTI_FOUR_DEFAULT_STEPS[step.index % PROCESS_LINEAR_HORTI_FOUR_DEFAULT_STEPS.length]
    const rawTitle = prevTitle?.content?.text || prevTitle?.content?.html || slots.find((s) => s.id === `STEP_${n}_TITLE`)?.placeholder_text
    const titleText = isPlaceholderOrLatinText(rawTitle) ? defaultStep.title : rawTitle

    const textW = Math.round(g.titleW * scaleX)
    const textX = Math.round((step.cx - g.titleW / 2) * scaleX)
    const titleY = Math.round((step.cy + g.titleOffsetY) * scaleY)
    const titleColor = prevTitle?.content?.color || shapeColor

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
        text: titleText.toUpperCase(),
        align: 'center',
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: 0.6,
        colorRole: 'primary',
        color: titleColor,
        lineHeight: 1.2,
        clipToSlot: false,
      },
    })

    // 2C. Step Body Text
    const rawBody = prevBody?.content?.text || prevBody?.content?.html || slots.find((s) => s.id === `STEP_${n}_BODY`)?.placeholder_text
    const bodyText = isPlaceholderOrLatinText(rawBody) ? defaultStep.body : rawBody
    const bodyY = Math.round((step.cy + g.bodyOffsetY) * scaleY)

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
        fontSize: 11.5,
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
