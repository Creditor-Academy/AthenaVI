/**
 * Chart single bar SPLIT — bar chart with side description panel.
 * Layout id: chart_single_split_v1.
 */

export const CSBS_GEOM = {
  viewW: 1000,
  viewH: 560,
  headingX: 100,
  headingY: 20,
  headingW: 300,
  headingH: 60,
  // Bar chart area (left side)
  chartX: 120,
  chartY: 150,
  chartW: 540,
  chartH: 340,
  barCount: 7,
  barPadding: 16,
  // Side panel (right side)
  panelX: 700,
  panelY: 200,
  panelW: 260,
  panelTitleH: 40,
  panelBodyH: 140,
  // Accent bar (left edge)
  accentW: 6,
  accentH: 360,
  accentY: 130,
}

export const CSBS_PALETTE = ['#1E40AF', '#DC2626', '#F97316', '#7C3AED', '#0891B2', '#059669', '#84CC16']

const LOREM = 'This is a sample text. Insert your desired text here.'

export const CSBS_DEFAULTS = {
  HEADING: 'Flat Bar Chart',
  PANEL_TITLE: 'Sample Text',
  PANEL_BODY: 'This is a sample text. Insert your desired text here.',
}

function isChartSingleBarSplitLayout(layoutId) {
  return /chart_single_split_v1$/i.test(String(layoutId || ''))
}

function isChartSingleBarSplitTextSlot(slotId) {
  const sid = String(slotId || '')
  return sid === 'HEADING'
    || sid === 'PANEL_TITLE'
    || sid === 'PANEL_BODY'
}

function accentBarSvg() {
  const g = CSBS_GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.accentW} ${g.accentH}" width="100%" height="100%" preserveAspectRatio="none">
    <rect x="0" y="0" width="${g.accentW}" height="${g.accentH}" fill="currentColor" rx="2"/>
  </svg>`
}

function gridLinesSvg() {
  const g = CSBS_GEOM
  const lines = []
  const steps = 5
  for (let i = 0; i <= steps; i += 1) {
    const y = (g.chartH / steps) * i
    lines.push(`<line x1="0" y1="${y}" x2="${g.chartW}" y2="${y}" stroke="#E5E7EB" stroke-width="1"/>`)
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.chartW} ${g.chartH}" width="100%" height="100%" preserveAspectRatio="none">
    ${lines.join('\n    ')}
  </svg>`
}

function barSvg(spec) {
  const w = spec.w
  const h = spec.h
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">
    <rect x="0" y="0" width="${w}" height="${h}" fill="currentColor" rx="2"/>
  </svg>`
}

function sidePanelBgSvg() {
  const g = CSBS_GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.panelW} ${g.panelTitleH + g.panelBodyH + 40}" width="100%" height="100%" preserveAspectRatio="none">
    <rect x="0" y="0" width="${g.panelW}" height="${g.panelTitleH + g.panelBodyH + 40}" fill="#F3F4F6" rx="8"/>
  </svg>`
}

function hexLum(hex) {
  const s = String(hex || '').replace('#', '')
  if (s.length !== 6) return 1
  const r = parseInt(s.slice(0, 2), 16) / 255
  const g = parseInt(s.slice(2, 4), 16) / 255
  const b = parseInt(s.slice(4, 6), 16) / 255
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function headingInk(palette = {}) {
  const bg = palette.bg || palette.background || palette.slideBg
    || palette.colors?.bg || palette.colors?.background || '#ffffff'
  return hexLum(bg) < 0.45 ? '#F3F4F6' : '#111827'
}

export function chartSingleBarSplitChromeSpecs(chartValues = []) {
  const g = CSBS_GEOM
  const values = chartValues.length ? chartValues : [56, 44, 62, 48, 32, 62, 44]
  const max = Math.max(...values, 70)
  const barW = (g.chartW - g.barPadding * (g.barCount + 1)) / g.barCount
  
  const specs = [
    {
      slotId: 'CSBS_ACCENT',
      x: 80,
      y: g.accentY,
      w: g.accentW,
      h: g.accentH,
      color: CSBS_PALETTE[0],
      layer: 5,
      kind: 'accent',
      fill: CSBS_PALETTE[0],
    },
    {
      slotId: 'CSBS_GRID',
      x: g.chartX,
      y: g.chartY,
      w: g.chartW,
      h: g.chartH,
      color: '#E5E7EB',
      layer: 2,
      kind: 'grid',
    },
    {
      slotId: 'CSBS_PANEL_BG',
      x: g.panelX,
      y: g.panelY,
      w: g.panelW,
      h: g.panelTitleH + g.panelBodyH + 40,
      color: '#F3F4F6',
      layer: 3,
      kind: 'panelBg',
    },
  ]
  
  for (let i = 0; i < values.length; i += 1) {
    const barX = g.chartX + g.barPadding + i * (barW + g.barPadding)
    const barH = (values[i] / max) * g.chartH
    const barY = g.chartY + g.chartH - barH
    const color = CSBS_PALETTE[i % CSBS_PALETTE.length]
    
    specs.push({
      slotId: `CSBS_BAR_${i + 1}`,
      n: i + 1,
      x: barX,
      y: barY,
      w: barW,
      h: barH,
      color,
      layer: 6,
      kind: 'bar',
      fill: color,
    })
  }
  
  return specs
}

export function chartSingleBarSplitOverlay(gx, gy, gw, gh) {
  const g = CSBS_GEOM
  const sx = gw / g.viewW
  const sy = gh / g.viewH
  const box = (x, y, w, h) => ({
    x: Math.round(gx + x * sx),
    y: Math.round(gy + y * sy),
    width: Math.max(12, Math.round(w * sx)),
    height: Math.max(10, Math.round(h * sy)),
  })
  
  return {
    heading: box(g.headingX, g.headingY, g.headingW, g.headingH),
    panelTitle: box(g.panelX + 20, g.panelY + 20, g.panelW - 40, g.panelTitleH),
    panelBody: box(g.panelX + 20, g.panelY + g.panelTitleH + 30, g.panelW - 40, g.panelBodyH),
  }
}

export function specToChartSingleBarSplitContent(spec) {
  if (spec.kind === 'accent') return { svg: accentBarSvg(), colorMode: 'recolorable', fill: spec.fill }
  if (spec.kind === 'grid') return { svg: gridLinesSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'panelBg') return { svg: sidePanelBgSvg(), colorMode: 'fixed', fill: spec.color }
  return { svg: barSvg(spec), colorMode: 'recolorable', fill: spec.fill }
}

function plainTextFromContent(content = {}) {
  if (typeof content.text === 'string' && content.text.trim()) return content.text
  if (Array.isArray(content.runs)) {
    const joined = content.runs.map((r) => r.text || '').join('')
    if (joined.trim()) return joined
  }
  return ''
}

function filledContent(el, slotId, style) {
  const sid = String(slotId || '')
  const existing = plainTextFromContent(el?.content)
  const text = existing && existing.toLowerCase() !== 'double-click to edit'
    ? existing
    : (CSBS_DEFAULTS[sid] || existing)
  return {
    ...(el?.content || {}),
    ...style,
    text,
    runs: null,
    listType: null,
    letterSpacing: style.letterSpacing ?? '0',
    padding: 0,
    paddingX: 0,
    stroke: undefined,
    strokeWidth: 0,
  }
}

function newId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function layoutChartSingleBarSplit(elements, schema, palette = {}, canvas = {}, chartData = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const sx = canvasW / CSBS_GEOM.viewW
  const sy = canvasH / CSBS_GEOM.viewH
  const overlay = chartSingleBarSplitOverlay(0, 0, canvasW, canvasH)
  const chromeRe = /^CSBS_/i
  const prevBySlot = new Map(
    elements.filter((el) => chromeRe.test(String(el.slotId || ''))).map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const filtered = elements.filter((el) => !chromeRe.test(String(el.slotId || '')) && isChartSingleBarSplitTextSlot(el.slotId))
  const bySlot = new Map(filtered.map((el) => [String(el.slotId || ''), el]))

  const placeText = (slotId, box, style, role) => {
    const prev = bySlot.get(slotId) || bySlot.get(slotId.toUpperCase())
    return {
      id: prev?.id || newId('txt-csbs'),
      type: 'text',
      slotId,
      role: prev?.role || role || 'body',
      layer: 12,
      placement: { x: box.x, y: box.y, width: box.width, height: box.height, rotation: 0, opacity: 1 },
      content: filledContent(prev, slotId, style),
    }
  }

  const next = [
    placeText('HEADING', overlay.heading, {
      align: 'left', verticalAlign: 'top', fontSize: 32, fontWeight: 700, color: headingInk(palette), clipToSlot: true, lineHeight: 1.2,
    }, 'heading'),
    placeText('PANEL_TITLE', overlay.panelTitle, {
      align: 'left', verticalAlign: 'top', fontSize: 18, fontWeight: 600, color: '#6B7280', clipToSlot: true, lineHeight: 1.3,
    }, 'heading'),
    placeText('PANEL_BODY', overlay.panelBody, {
      align: 'left', verticalAlign: 'top', fontSize: 13, fontWeight: 400, color: '#6B7280', clipToSlot: true, lineHeight: 1.5, wrap: 'wrap',
    }, 'body'),
  ]

  const chartEl = elements.find((el) => el.slotId === 'MAIN_CHART')
  const chartValues = chartEl?.content?.values || chartEl?.content?.data || []
  
  const chrome = chartSingleBarSplitChromeSpecs(chartValues).map((spec) => {
    const prev = prevBySlot.get(spec.slotId.toUpperCase())
    const graphic = specToChartSingleBarSplitContent(spec)
    return {
      id: prev?.id || newId('shp-csbs'),
      type: 'graphic',
      layer: spec.layer || 4,
      placement: {
        x: Math.round(spec.x * sx),
        y: Math.round(spec.y * sy),
        width: Math.max(4, Math.round(spec.w * sx)),
        height: Math.max(4, Math.round(spec.h * sy)),
        rotation: 0,
        opacity: 1,
      },
      content: { svg: graphic.svg, colorMode: graphic.colorMode, fill: graphic.fill, alt: spec.slotId },
      role: 'decoration',
      slotId: spec.slotId,
    }
  })
  
  return [...chrome, ...next]
}

export function chartSingleBarSplitPreviewSvg() {
  const specs = chartSingleBarSplitChromeSpecs()
  const g = CSBS_GEOM
  const parts = specs.map((spec) => {
    const inner = specToChartSingleBarSplitContent(spec).svg
    const match = inner.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
    const vb = inner.match(/viewBox="([^"]+)"/)
    return `<svg x="${spec.x}" y="${spec.y}" width="${spec.w}" height="${spec.h}" viewBox="${vb ? vb[1] : '0 0 100 100'}" preserveAspectRatio="none" color="${spec.color}">${match ? match[1] : ''}</svg>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.viewW} ${g.viewH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${parts.join('')}</svg>`
}

export { isChartSingleBarSplitLayout, isChartSingleBarSplitTextSlot }
