/** SVG chart renderer for PPT canvas elements. */

import { resolveFillCss } from '../../../utils/presentationHelpers'
import { normalizeChartContent } from '../../../utils/chartContentNormalize'

function normalizeChartType(chartType) {
  const type = String(chartType || 'column').toLowerCase()
  if (type === 'doughnut') return 'donut'
  return type
}

function resolveColor(col, palette, fallback) {
  if (col && typeof col === 'object') {
    return resolveFillCss(col, palette, fallback)
  }
  if (!col) return fallback
  const raw = String(col)
  if (
    raw.startsWith('#') ||
    raw.startsWith('rgb') ||
    raw.startsWith('hsl') ||
    raw.startsWith('color-mix') ||
    raw.includes('gradient')
  ) {
    return raw
  }
  const role = raw.toLowerCase()
  if (palette?.[role]) return palette[role]
  return fallback
}

function svgSafeFill(css, fallback) {
  if (!css || /gradient/i.test(String(css))) {
    const match = String(css || '').match(/#[0-9a-fA-F]{3,8}/)
    return match ? match[0] : fallback
  }
  return css
}

function getSeriesData(content) {
  const labels =
    content?.data?.labels ||
    content?.labels ||
    ['A', 'B', 'C', 'D']
  const series =
    content?.data?.series ||
    content?.series ||
    [{ name: 'Series', values: [12, 19, 14, 22] }]
  let values = Array.isArray(series[0]?.values)
    ? series[0].values
    : Array.isArray(series) && typeof series[0] === 'number'
      ? series
      : null
  if (!Array.isArray(values) || !values.length) {
    values = [12, 19, 14, 22]
  }
  return { labels, values, seriesName: series[0]?.name || 'Series' }
}

function ChartGrid({ premium }) {
  if (!premium) return null
  return (
    <svg viewBox="0 0 100 100" className="ppt-chart-grid-svg" preserveAspectRatio="none" aria-hidden>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1="4"
          x2="96"
          y1={100 - p * 88 - 6}
          y2={100 - p * 88 - 6}
          stroke="rgba(100, 116, 139, 0.18)"
          strokeWidth="0.6"
          strokeDasharray="2 3"
        />
      ))}
    </svg>
  )
}

function BarChart({ values, labels, colors, palette, premium, horizontal = false }) {
  const max = Math.max(...values.map(Number), 1)
  const defaultColors = [
    palette?.accent || '#6366F1',
    palette?.primary || '#3B82F6',
    '#06B6D4',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
  ]
  return (
    <div className={`ppt-chart-bars-wrap${premium ? ' ppt-chart-bars-wrap--premium' : ''}${horizontal ? ' ppt-chart-bars-wrap--horizontal' : ''}`}>
      <ChartGrid premium={premium} />
      <div className="ppt-chart-bars">
        {values.map((v, i) => {
          const rawColor = colors[i % colors.length] || defaultColors[i % defaultColors.length]
          const isVib = isColorVibrant(rawColor)
          const baseColor = isVib ? rawColor : defaultColors[i % defaultColors.length]
          const col = resolveColor(baseColor, palette, defaultColors[i % defaultColors.length])
          const pct = Math.max(10, (Number(v) / max) * 100)
          const valStr = typeof v === 'number' ? v.toLocaleString() : String(v)

          return (
            <div
              key={i}
              className="ppt-chart-bar-col"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flex: 1,
                height: '100%',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {premium && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: col,
                    marginBottom: '6px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    letterSpacing: '-0.01em',
                    opacity: 0.9,
                  }}
                >
                  {valStr}
                </span>
              )}
              <span
                className={premium ? 'ppt-chart-bar ppt-chart-bar--premium' : undefined}
                style={{
                  height: `${pct}%`,
                  width: '100%',
                  background: `linear-gradient(180deg, ${col} 0%, color-mix(in srgb, ${col} 80%, #000) 100%)`,
                  borderRadius: '6px 6px 2px 2px',
                  boxShadow: `0 4px 12px color-mix(in srgb, ${col} 25%, transparent)`,
                  transition: 'height 0.3s ease',
                }}
              />
            </div>
          )
        })}
      </div>
      {premium && labels?.length > 0 && (
        <div className="ppt-chart-axis-labels">
          {labels.map((label, i) => (
            <span key={`${label}-${i}`}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function isColorVibrant(c) {
  if (!c || typeof c !== 'string') return false
  const m = c.replace('#', '')
  if (m.length !== 6) return false
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return Math.max(r, g, b) - Math.min(r, g, b) >= 36
}

function LineChart({ values, labels, colors, palette, premium }) {
  const max = Math.max(...values.map(Number), 1)
  const min = 0
  const range = max - min || 1
  const coords = values.map((v, i) => {
    const x = 10 + (i / Math.max(values.length - 1, 1)) * 80
    const y = 88 - ((Number(v) - min) / range) * 72
    return { x, y }
  })
  const cand = [
    colors[0],
    palette?.accent,
    palette?.primary,
    '#6366F1',
  ].find((c) => isColorVibrant(c)) || colors[0] || palette?.primary || '#6366F1'
  const color = resolveColor(cand, palette, '#6366F1')
  const strokeColor = svgSafeFill(color, '#6366F1')
  const uid = Math.random().toString(36).slice(2, 7)
  const gradId = `lineAreaGrad-${uid}`

  let linePath = ''
  if (coords.length > 1) {
    linePath = `M ${coords[0].x} ${coords[0].y}`
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1]
      const p1 = coords[i]
      const p2 = coords[i + 1]
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1]
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    }
  }
  const areaPath = linePath ? `${linePath} L ${coords[coords.length - 1].x} 88 L ${coords[0].x} 88 Z` : ''

  return (
    <div className={`ppt-chart-line-wrap${premium ? ' ppt-chart-line-wrap--premium' : ''}`}>
      <svg viewBox="0 0 100 100" className="ppt-chart-line-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.42" />
            <stop offset="45%" stopColor={strokeColor} stopOpacity="0.16" />
            <stop offset="85%" stopColor={strokeColor} stopOpacity="0.02" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {premium &&
          [0.25, 0.5, 0.75].map((p, i) => (
            <line
              key={i}
              x1="6"
              x2="94"
              y1={88 - p * 72}
              y2={88 - p * 72}
              stroke="rgba(100, 116, 139, 0.16)"
              strokeWidth="0.6"
              strokeDasharray="2 3"
            />
          ))}
        {/* Vertical dashed drop-line from peak to baseline */}
        {premium && coords.length > 0 && (
          <line
            x1={coords[coords.length - 1].x}
            y1={coords[coords.length - 1].y}
            x2={coords[coords.length - 1].x}
            y2={88}
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeDasharray="2 3"
            opacity="0.45"
          />
        )}
        {/* Luminous gradient area fill */}
        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
        {/* Smooth curve stroke */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={premium ? 3.0 : 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Point markers with halo on peak */}
        {premium &&
          coords.map((pt, i) => {
            const isPeak = i === coords.length - 1
            return (
              <g key={i}>
                {isPeak && <circle cx={pt.x} cy={pt.y} r={6.0} fill={strokeColor} opacity="0.18" />}
                {isPeak && <circle cx={pt.x} cy={pt.y} r={4.0} fill={strokeColor} opacity="0.32" />}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isPeak ? 2.6 : 2.0}
                  fill="#ffffff"
                  stroke={strokeColor}
                  strokeWidth={isPeak ? 1.6 : 1.3}
                />
              </g>
            )
          })}
        {/* Floating peak value tag */}
        {premium && coords.length > 0 && (() => {
          const lastPt = coords[coords.length - 1]
          const lastVal = values[values.length - 1]
          const valStr = typeof lastVal === 'number' ? lastVal.toLocaleString() : String(lastVal)
          const pillW = Math.max(18, valStr.length * 4.2 + 8)
          const pillX = Math.min(Math.max(lastPt.x - pillW / 2, 6), 94 - pillW)
          const pillY = Math.max(lastPt.y - 10, 4)
          return (
            <g className="ppt-chart-peak-pill">
              <rect
                x={pillX}
                y={pillY}
                width={pillW}
                height={6.5}
                rx={3.25}
                fill={strokeColor}
              />
              <text
                x={pillX + pillW / 2}
                y={pillY + 4.6}
                fill="#ffffff"
                fontSize="3.2"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {valStr}
              </text>
            </g>
          )
        })()}
      </svg>
      {premium && labels?.length > 0 && (
        <div className="ppt-chart-axis-labels" style={{ padding: '0 8%' }}>
          {labels.map((label, i) => (
            <span key={`${label}-${i}`}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// Curated accessible color palette for donut slices
const DONUT_PALETTE = [
  { base: '#3B82F6', light: '#60A5FA', dark: '#1D4ED8' },
  { base: '#8B5CF6', light: '#A78BFA', dark: '#6D28D9' },
  { base: '#10B981', light: '#34D399', dark: '#047857' },
  { base: '#F59E0B', light: '#FCD34D', dark: '#B45309' },
  { base: '#EF4444', light: '#F87171', dark: '#B91C1C' },
  { base: '#64748B', light: '#94A3B8', dark: '#334155' },
]

function classyDonutPath(cx, cy, ir, r, startDeg, endDeg) {
  const rad = (d) => ((d - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(rad(startDeg))
  const y1 = cy + r * Math.sin(rad(startDeg))
  const x2 = cx + r * Math.cos(rad(endDeg))
  const y2 = cy + r * Math.sin(rad(endDeg))
  const ix1 = cx + ir * Math.cos(rad(startDeg))
  const iy1 = cy + ir * Math.sin(rad(startDeg))
  const ix2 = cx + ir * Math.cos(rad(endDeg))
  const iy2 = cy + ir * Math.sin(rad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${ir} ${ir} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`
}

function PieChart({ values, colors, palette, labels = [], donut = false, showLegend = true }) {
  const total = values.reduce((s, v) => s + Math.max(Number(v), 0), 0) || 1
  const cx = 50
  const cy = 50
  const r = donut ? 40 : 42
  const ir = donut ? 22 : 0
  const midR = (ir + r) / 2
  const depthShift = donut ? 3 : 0 // 3D vertical depth
  const gapDeg = donut ? 3.5 : 0
  const uid = Math.random().toString(36).slice(2, 8)

  if (!donut) {
    // Simple flat pie (unchanged)
    let angle = -90
    const slices = values.map((v, i) => {
      const sweep = (Number(v) / total) * 360
      const start = angle
      angle += sweep
      const end = angle
      const large = sweep > 180 ? 1 : 0
      const rad = (deg) => (deg * Math.PI) / 180
      const x1 = cx + r * Math.cos(rad(start))
      const y1 = cy + r * Math.sin(rad(start))
      const x2 = cx + r * Math.cos(rad(end))
      const y2 = cy + r * Math.sin(rad(end))
      const fill = resolveColor(colors[i % colors.length], palette, '#64748b')
      return (
        <path
          key={i}
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
          fill={svgSafeFill(fill, '#64748b')}
        />
      )
    })
    return (
      <div className="ppt-chart-pie-wrap">
        <svg viewBox="0 0 100 100" className="ppt-chart-pie-svg">{slices}</svg>
        {showLegend && labels?.length > 0 ? (
          <div className="ppt-chart-pie-legend">
            {labels.slice(0, values.length).map((label, i) => (
              <div key={`${label}-${i}`} className="ppt-chart-pie-legend-item">
                <span className="ppt-chart-pie-legend-swatch" style={{ background: resolveColor(colors[i % colors.length], palette, '#64748b') }} />
                <span className="ppt-chart-pie-legend-label">{label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  // ── Classy 3D Donut ───────────────────────────────────────────────────────
  let angle = 0 // start at top (handled via rad offset)
  const sliceData = values.map((v, i) => {
    const sweep = (Math.max(Number(v), 0) / total) * 360
    const pct = Math.round((Math.max(Number(v), 0) / total) * 100)
    const startDeg = angle
    angle += sweep
    const endDeg = angle
    const midDeg = (startDeg + endDeg) / 2
    const palette_i = DONUT_PALETTE[i % DONUT_PALETTE.length]
    // Try to use provided color, fall back to curated palette
    const providedColor = colors[i % colors.length]
    const useProvided = providedColor && isColorVibrant(svgSafeFill(resolveColor(providedColor, palette, ''), ''))
    const base = useProvided ? svgSafeFill(resolveColor(providedColor, palette, palette_i.base), palette_i.base) : palette_i.base
    const light = palette_i.light
    const dark = palette_i.dark

    // Apply gap
    const halfGap = sweep > 8 ? gapDeg / 2 : Math.max(0.3, gapDeg / 4)
    const sAngle = startDeg + halfGap
    const eAngle = endDeg - halfGap

    // Label position at mid-arc midR
    const rad = (d) => ((d - 90) * Math.PI) / 180
    const labelX = cx + midR * Math.cos(rad(midDeg))
    const labelY = cy + midR * Math.sin(rad(midDeg))

    return { sAngle, eAngle, midDeg, pct, base, light, dark, labelX, labelY, sweep }
  })

  return (
    <div className="ppt-chart-pie-wrap" style={{ position: 'relative' }}>
      <svg viewBox="0 0 100 100" className="ppt-chart-pie-svg" style={{ overflow: 'visible' }}>
        <defs>
          {sliceData.map((s, i) => (
            <linearGradient key={i} id={`dg_${uid}_${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={s.light} />
              <stop offset="100%" stopColor={s.base} />
            </linearGradient>
          ))}
          <filter id={`dshadow_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="rgba(15,23,42,0.18)" />
          </filter>
          <filter id={`dtxt_${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0.5" stdDeviation="0.8" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>

        {/* 3D base extrusions (render first so they sit behind top faces) */}
        {sliceData.map((s, i) =>
          s.sweep > 1 ? (
            <path
              key={`base_${i}`}
              d={classyDonutPath(cx, cy + depthShift, ir, r, s.sAngle, s.eAngle)}
              fill={s.dark}
              opacity="0.9"
            />
          ) : null
        )}

        {/* Top face slices with gradient + white rim */}
        {sliceData.map((s, i) =>
          s.sweep > 1 ? (
            <path
              key={`top_${i}`}
              d={classyDonutPath(cx, cy, ir, r, s.sAngle, s.eAngle)}
              fill={`url(#dg_${uid}_${i})`}
              stroke="#fff"
              strokeWidth="0.7"
              strokeLinejoin="round"
              filter={`url(#dshadow_${uid})`}
            />
          ) : null
        )}

        {/* Percentage labels on slices */}
        {sliceData.map((s, i) =>
          s.sweep > 20 ? (
            <text
              key={`lbl_${i}`}
              x={s.labelX.toFixed(1)}
              y={s.labelY.toFixed(1)}
              fill="#ffffff"
              fontSize="5.2"
              fontWeight="800"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              filter={`url(#dtxt_${uid})`}
            >
              {s.pct}%
            </text>
          ) : null
        )}

        {/* Elevated center plate */}
        <circle cx={cx} cy={cy} r={ir - 1} fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
        <circle cx={cx} cy={cy} r={ir - 4} fill="none" stroke="#f1f5f9" strokeWidth="0.8" />

        {/* Center value text */}
        {values.length > 0 && (
          <>
            <text
              x={cx}
              y={cy - 2.5}
              fill="#0f172a"
              fontSize="9"
              fontWeight="900"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {total > 0 && values[0] != null ? `${Math.round((Math.max(Number(values[0]), 0) / total) * 100)}%` : '—'}
            </text>
            <text
              x={cx}
              y={cy + 6}
              fill="#64748b"
              fontSize="3.5"
              fontWeight="700"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              letterSpacing="0.5"
            >
              {labels[0] ? String(labels[0]).toUpperCase().slice(0, 10) : 'TOTAL'}
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      {showLegend && labels?.length > 0 ? (
        <div className="ppt-chart-pie-legend">
          {labels.slice(0, values.length).map((label, i) => {
            const s = sliceData[i] || {}
            return (
              <div key={`${label}-${i}`} className="ppt-chart-pie-legend-item">
                <span className="ppt-chart-pie-legend-swatch" style={{ background: s.base || '#64748b', borderRadius: '50%' }} />
                <span className="ppt-chart-pie-legend-label">{label}</span>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}


function KpiChart({ values, content, palette }) {
  const val = values[0] ?? content?.kpiValue ?? '42%'
  const label = content?.kpiLabel || content?.title || 'Metric'
  return (
    <div className="ppt-chart-kpi">
      <div className="ppt-chart-kpi-value" style={{ color: palette?.primary || '#334155' }}>
        {val}
      </div>
      <div className="ppt-chart-kpi-label">{label}</div>
    </div>
  )
}

export default function PptChartRenderer({ content, palette, style }) {
  const normalized = normalizeChartContent(content || {}, palette || {})
  const chartType = normalizeChartType(normalized.chartType)
  const { labels, values } = getSeriesData(normalized)
  const colors = (normalized.colors || ['#475569']).map((c) => resolveColor(c, palette, c))
  const premium = normalized.premium !== false

  const isLine = chartType.includes('line') || chartType.includes('area')
  const isPie = chartType === 'pie'
  const isDonut = chartType === 'donut'
  const isKpi = chartType === 'kpi'
  const isBar = chartType.includes('bar') && !chartType.includes('column')

  return (
    <div className={`ppt-chart-renderer${premium ? ' ppt-chart-renderer--premium' : ''}`} style={style}>
      {isKpi ? (
        <KpiChart values={values} content={content} palette={palette} />
      ) : isPie || isDonut ? (
        <PieChart
          values={values}
          colors={colors}
          palette={palette}
          labels={labels}
          donut={isDonut}
          showLegend={normalized.showLabels !== false}
        />
      ) : isLine ? (
        <LineChart values={values} labels={labels} colors={colors} palette={palette} premium={premium} />
      ) : (
        <BarChart
          values={values}
          labels={labels}
          colors={colors}
          palette={palette}
          premium={premium}
          horizontal={isBar}
        />
      )}
    </div>
  )
}

export function getEmbedIframeUrl(content) {
  const url = String(content?.url || '').trim()
  if (!url) return null
  const provider = content?.provider || ''

  if (provider === 'youtube' || /youtube\.com|youtu\.be/i.test(url)) {
    const id = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1]
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (provider === 'vimeo' || /vimeo\.com/i.test(url)) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1]
    return id ? `https://player.vimeo.com/video/${id}` : null
  }
  if (provider === 'loom' || /loom\.com/i.test(url)) {
    const id = url.match(/loom\.com\/share\/([\w-]+)/)?.[1]
    return id ? `https://www.loom.com/embed/${id}` : null
  }
  return null
}
