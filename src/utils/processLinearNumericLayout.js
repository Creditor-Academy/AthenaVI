/**
 * Process Linear Numeric Layout
 * Layout ID: process_linner_numeric_v1
 *
 * Visual Reference: "Linear Process Diagram for PowerPoint" (5-Step Version)
 *  - 5 Overlapping Circular Teardrop Pin Badges:
 *      * Outer teardrop pin shape with downward pointing tip in step color
 *      * Inner solid white circle
 *      * Bold 2-digit number ("01", "02", "03", "04", "05") in matching step color
 *  - Horizontal Spine Track:
 *      * Subtle light gray line running across all steps
 *      * Below each pin tip, a small circular connector node on the spine track
 *  - Labels Below:
 *      * Step Title in matching step accent color (bold)
 *      * Centered multi-line description text
 *  - Header: Centered or Left "Linear Process Diagram" (or slide HEADING)
 *
 * Recolorability:
 *  - Each pin badge is an individual graphic element STEP_n_SHAPE with colorMode: 'recolorable'.
 *  - Selecting any badge allows instant recoloring of its pin shape, number, and connector ring.
 */

export const PROCESS_LINEAR_NUMERIC_GEOM = {
  viewW: 1000,
  viewH: 560,

  // Header
  headingX: 70,
  headingY: 40,
  headingW: 860,
  headingH: 42,

  // Nodes (5 steps)
  cy: 175,
  rOuter: 68,
  rInner: 48,
  tipH: 22,
  stepGap: 140,

  // Horizontal spine track
  spineY: 288,
  spineStartX: 90,
  spineEndX: 910,
  dotRadius: 7.5,

  // Text below spine
  titleOffsetY: 26, // spineY + 26 = 314
  titleW: 136,
  titleH: 24,
  bodyOffsetY: 52, // spineY + 52 = 340
  bodyW: 136,
  bodyH: 80,
}

// 5 harmonious step colors matching reference image:
// Yellow -> Warm Amber -> Ochre/Rust -> Brick Red -> Crimson/Berry
export const PROCESS_LINEAR_NUMERIC_DEFAULT_COLORS = [
  '#EAB308', // 1: Golden Yellow
  '#F59E0B', // 2: Warm Amber
  '#D97706', // 3: Ochre / Rust Orange
  '#DC2626', // 4: Brick Red
  '#BE185D', // 5: Crimson / Berry Red
]

export const PROCESS_LINEAR_NUMERIC_DEFAULT_STEPS = [
  {
    title: 'Sample Text',
    body: 'This is a sample text. Insert your desired text here.',
  },
  {
    title: 'Sample Text',
    body: 'This is a sample text. Insert your desired text here.',
  },
  {
    title: 'Sample Text',
    body: 'This is a sample text. Insert your desired text here.',
  },
  {
    title: 'Sample Text',
    body: 'This is a sample text. Insert your desired text here.',
  },
  {
    title: 'Sample Text',
    body: 'This is a sample text. Insert your desired text here.',
  },
]

export function isProcessLinearNumericLayout(layoutId) {
  const s = String(layoutId || '').toLowerCase().trim()
  return (
    s === 'process_linner_numeric_v1' ||
    s === 'process_linear_numeric' ||
    s === 'process_linner_numeric'
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
    s.includes('at vero eos') ||
    s.includes('lorem ipsum') ||
    s.includes('accus qui amus') ||
    s.includes('dignissimos ducim')
  )
}

/**
 * Calculates geometry for 5 step nodes.
 */
export function calculateProcessLinearNumericStepGeometries(stepCount = 5) {
  const g = PROCESS_LINEAR_NUMERIC_GEOM
  const n = Math.max(2, Math.min(6, stepCount))
  const totalSpan = (n - 1) * g.stepGap
  const startX = Math.round((g.viewW - totalSpan) / 2)

  const steps = []
  for (let i = 0; i < n; i += 1) {
    const cx = startX + i * g.stepGap
    const numStr = String(i + 1).padStart(2, '0')

    // Bounding box for badge element:
    // Top of circle: g.cy - g.rOuter = 175 - 68 = 107. With 8px top padding: y = 99.
    // Connector dot is at g.spineY = 288 with dotRadius = 7.5.
    // With 8px bottom padding: bottomY = 288 + 7.5 + 8 = 303.5.
    // Total height = 303.5 - 99 ≈ 204px!
    const y = g.cy - g.rOuter - 8
    const h = Math.round((g.spineY + g.dotRadius + 8) - y)
    const w = (g.rOuter + 12) * 2 // 160
    const x = cx - w / 2

    steps.push({
      index: i,
      stepNum: i + 1,
      numStr,
      cx,
      cy: g.cy,
      x,
      y,
      w,
      h,
      localCx: w / 2, // 80
      localCy: g.cy - y, // 76
      color: PROCESS_LINEAR_NUMERIC_DEFAULT_COLORS[i % PROCESS_LINEAR_NUMERIC_DEFAULT_COLORS.length],
    })
  }

  return steps
}

/**
 * Builds standalone SVG for a single pin badge (outer pointer shape, inner white circle, colored number, and connector ring).
 */
export function buildLinearNumericPinSvg(step) {
  const g = PROCESS_LINEAR_NUMERIC_GEOM
  const { localCx, localCy, w, h, numStr } = step
  const R = g.rOuter
  const dx = 20
  const dy = Math.round(Math.sqrt(R * R - dx * dx)) // 65
  const tipY = localCy + R + g.tipH // 76 + 68 + 22 = 166
  const dotY = localCy + (g.spineY - g.cy) // 76 + 113 = 189
  const filterId = `pin-sh-${step.stepNum || 1}`

  const pinPath = `M ${localCx},${tipY} L ${localCx - dx},${localCy + dy} A ${R},${R} 0 1,1 ${localCx + dx},${localCy + dy} Z`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" fill="none" style="overflow:visible;">
    <defs>
      <filter id="${filterId}" x="-25%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.14" />
      </filter>
    </defs>

    <!-- Outer Teardrop Pin Pointer Badge with Drop Shadow -->
    <path d="${pinPath}" fill="currentColor" filter="url(#${filterId})" />

    <!-- Inner Solid White Circle -->
    <circle cx="${localCx}" cy="${localCy}" r="${g.rInner}" fill="#FFFFFF" />

    <!-- 2-Digit Bold Number in Matching Color -->
    <text x="${localCx}" y="${localCy + 12}" text-anchor="middle" fill="currentColor" font-size="34" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${numStr}
    </text>

    <!-- Connector Ring Sitting on Spine Track -->
    <circle cx="${localCx}" cy="${dotY}" r="${g.dotRadius}" fill="#FFFFFF" stroke="currentColor" stroke-width="3.5" />
  </svg>`
}

/**
 * Builds preview SVG for LayoutPolishedPreview.jsx.
 */
export function processLinearNumericPreviewSvg(previewHints = {}, theme = {}) {
  const g = PROCESS_LINEAR_NUMERIC_GEOM
  const headingText = previewHints?.slots?.HEADING?.text || 'Linear Process Diagram'

  let count = 0
  for (let i = 1; i <= 6; i += 1) {
    if (previewHints?.slots?.[`STEP_${i}_TITLE`] || previewHints?.slots?.[`STEP_${i}_BODY`]) {
      count = i
    }
  }
  const stepCount = count >= 2 ? count : 5
  const steps = calculateProcessLinearNumericStepGeometries(stepCount)

  let badgesSvg = ''
  let textLabels = ''

  steps.forEach((step) => {
    const color = step.color
    const R = g.rOuter
    const dx = 20
    const dy = Math.round(Math.sqrt(R * R - dx * dx))
    const tipY = step.cy + R + g.tipH
    const pinPath = `M ${step.cx},${tipY} L ${step.cx - dx},${step.cy + dy} A ${R},${R} 0 1,1 ${step.cx + dx},${step.cy + dy} Z`
    const filterId = `prev-pin-${step.stepNum}`

    badgesSvg += `
      <defs>
        <filter id="${filterId}" x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.14" />
        </filter>
      </defs>

      <!-- Outer Teardrop Pin Pointer Badge -->
      <path d="${pinPath}" fill="${color}" filter="url(#${filterId})" />

      <!-- Inner White Circle -->
      <circle cx="${step.cx}" cy="${step.cy}" r="${g.rInner}" fill="#FFFFFF" />

      <!-- 2-Digit Number -->
      <text x="${step.cx}" y="${step.cy + 12}" text-anchor="middle" fill="${color}" font-size="34" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${step.numStr}
      </text>

      <!-- Connector Ring on Spine -->
      <circle cx="${step.cx}" cy="${g.spineY}" r="${g.dotRadius}" fill="#FFFFFF" stroke="${color}" stroke-width="3.5" />
    `

    const defaultStep = PROCESS_LINEAR_NUMERIC_DEFAULT_STEPS[step.index % PROCESS_LINEAR_NUMERIC_DEFAULT_STEPS.length]
    const rawTitle = previewHints?.slots?.[`STEP_${step.stepNum}_TITLE`]?.text
    const title = isPlaceholderOrLatinText(rawTitle) ? defaultStep.title : rawTitle
    const rawBody = previewHints?.slots?.[`STEP_${step.stepNum}_BODY`]?.text
    const body = isPlaceholderOrLatinText(rawBody) ? defaultStep.body : rawBody

    const titleY = g.spineY + g.titleOffsetY
    const bodyY = g.spineY + g.bodyOffsetY

    textLabels += `
      <text x="${step.cx}" y="${titleY + 14}" text-anchor="middle" fill="${color}" font-size="13.5" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${title}
      </text>
    `

    const words = body.split(' ')
    const line1 = words.slice(0, 4).join(' ')
    const line2 = words.slice(4, 8).join(' ')
    const line3 = words.slice(8, 13).join(' ')

    textLabels += `
      <text x="${step.cx}" y="${bodyY + 12}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${line1}
      </text>
      <text x="${step.cx}" y="${bodyY + 25}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${line2}
      </text>
      <text x="${step.cx}" y="${bodyY + 38}" text-anchor="middle" fill="#64748B" font-size="10.5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
        ${line3}
      </text>
    `
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.viewW} ${g.viewH}" width="100%" height="100%" fill="none">
    <!-- Background -->
    <rect width="${g.viewW}" height="${g.viewH}" fill="#FFFFFF" />

    <!-- Centered Header -->
    <text x="${g.viewW / 2}" y="${g.headingY + 24}" text-anchor="middle" fill="#1E293B" font-size="28" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${headingText}
    </text>

    <!-- Horizontal Spine Line -->
    <line x1="${g.spineStartX}" y1="${g.spineY}" x2="${g.spineEndX}" y2="${g.spineY}" stroke="#E2E8F0" stroke-width="6" stroke-linecap="round" />

    <!-- Badges -->
    ${badgesSvg}

    <!-- Labels -->
    ${textLabels}
  </svg>`
}

/**
 * Compiles and positions slide elements for process_linner_numeric_v1.
 */
export function layoutProcessLinearNumeric(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const g = PROCESS_LINEAR_NUMERIC_GEOM

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
  const stepCount = detectedCount >= 2 ? detectedCount : 5
  const steps = calculateProcessLinearNumericStepGeometries(stepCount)

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
    'Linear Process Diagram'

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

  // 2. Horizontal Spine Line
  const spineSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round((g.spineEndX - g.spineStartX) * scaleX)} 6" width="100%" height="100%" fill="none">
    <line x1="0" y1="3" x2="${Math.round((g.spineEndX - g.spineStartX) * scaleX)}" y2="3" stroke="#E2E8F0" stroke-width="6" stroke-linecap="round" />
  </svg>`

  newElements.push({
    id: newId('spine-track'),
    slotId: 'PROCESS_NUMERIC_SPINE',
    type: 'graphic',
    layer: 1,
    role: 'decoration',
    placement: {
      x: Math.round(g.spineStartX * scaleX),
      y: Math.round(g.spineY * scaleY - 3),
      width: Math.round((g.spineEndX - g.spineStartX) * scaleX),
      height: 6,
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: spineSvg,
      preserveAspectRatio: 'none',
    },
  })

  // 3. Pin Pointer Badges, Titles, and Descriptions
  steps.forEach((step, idx) => {
    const n = step.stepNum

    const prevShape = prevBySlot.get(`STEP_${n}_SHAPE`) || prevBySlot.get(`STEP_${n}_PIN`) || prevBySlot.get(`STEP_${n}_NUMBER_SLOT`)
    const prevTitle = prevBySlot.get(`STEP_${n}_TITLE`)
    const prevBody = prevBySlot.get(`STEP_${n}_BODY`)

    const badgeColor = prevShape?.content?.fill || prevShape?.content?.color || step.color

    // 3A. Pin Pointer Badge (with white inner circle, number, and connector dot)
    const pinSvg = buildLinearNumericPinSvg(step)
    newElements.push({
      id: prevShape?.id || newId(`grp-step-${n}-pin`),
      slotId: `STEP_${n}_SHAPE`,
      type: 'graphic',
      layer: 2 + idx, // progressive layering so badges overlap cleanly
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
        svg: pinSvg,
        colorMode: 'recolorable',
        fill: badgeColor,
        color: badgeColor,
        preserveAspectRatio: 'xMidYMid meet',
      },
    })

    // 3B. Step Title
    const defaultStep = PROCESS_LINEAR_NUMERIC_DEFAULT_STEPS[step.index % PROCESS_LINEAR_NUMERIC_DEFAULT_STEPS.length]
    const rawTitle = prevTitle?.content?.text || prevTitle?.content?.html || slots.find((s) => s.id === `STEP_${n}_TITLE`)?.placeholder_text
    const titleText = isPlaceholderOrLatinText(rawTitle) ? defaultStep.title : rawTitle

    const textW = Math.round(g.titleW * scaleX)
    const textX = Math.round((step.cx - g.titleW / 2) * scaleX)
    const titleY = Math.round((g.spineY + g.titleOffsetY) * scaleY)
    const titleColor = prevTitle?.content?.color || badgeColor

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
        fontSize: 14,
        fontWeight: 800,
        colorRole: 'primary',
        color: titleColor,
        lineHeight: 1.2,
        clipToSlot: false,
      },
    })

    // 3C. Step Description
    const rawBody = prevBody?.content?.text || prevBody?.content?.html || slots.find((s) => s.id === `STEP_${n}_BODY`)?.placeholder_text
    const bodyText = isPlaceholderOrLatinText(rawBody) ? defaultStep.body : rawBody
    const bodyY = Math.round((g.spineY + g.bodyOffsetY) * scaleY)

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
