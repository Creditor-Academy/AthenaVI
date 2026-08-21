/** SVG chart renderer for PPT canvas elements. */

import { normalizeChartContent } from '../../../utils/chartContentNormalize'

function normalizeChartType(chartType) {
  const type = String(chartType || 'column').toLowerCase()
  if (type === 'doughnut') return 'donut'
  return type
}

function resolveColor(col, palette, fallback) {
  if (!col) return fallback
  if (String(col).startsWith('#') || String(col).startsWith('rgb') || String(col).startsWith('color-mix')) {
    return col
  }
  const role = String(col).toLowerCase()
  if (palette?.[role]) return palette[role]
  return fallback
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
  return (
    <div className={`ppt-chart-bars-wrap${premium ? ' ppt-chart-bars-wrap--premium' : ''}${horizontal ? ' ppt-chart-bars-wrap--horizontal' : ''}`}>
      <ChartGrid premium={premium} />
      <div className="ppt-chart-bars">
        {values.map((v, i) => (
          <span
            key={i}
            className={premium ? 'ppt-chart-bar ppt-chart-bar--premium' : undefined}
            style={{
              height: `${Math.max(8, (Number(v) / max) * 100)}%`,
              background: resolveColor(colors[i % colors.length], palette, '#64748b'),
            }}
          />
        ))}
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

function LineChart({ values, labels, colors, palette, premium }) {
  const max = Math.max(...values.map(Number), 1)
  const min = Math.min(...values.map(Number), 0)
  const range = max - min || 1
  const pts = values
    .map((v, i) => {
      const x = 4 + (i / Math.max(values.length - 1, 1)) * 92
      const y = 94 - ((Number(v) - min) / range) * 82
      return `${x},${y}`
    })
    .join(' ')
  const color = resolveColor(colors[0], palette, '#475569')

  return (
    <div className={`ppt-chart-line-wrap${premium ? ' ppt-chart-line-wrap--premium' : ''}`}>
      <svg viewBox="0 0 100 100" className="ppt-chart-line-svg" preserveAspectRatio="none">
        {premium &&
          [0.25, 0.5, 0.75].map((p, i) => (
            <line
              key={i}
              x1="4"
              x2="96"
              y1={94 - p * 82}
              y2={94 - p * 82}
              stroke="rgba(100, 116, 139, 0.18)"
              strokeWidth="0.6"
              strokeDasharray="2 3"
            />
          ))}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={premium ? 2.2 : 2.5}
          points={pts}
          vectorEffect="non-scaling-stroke"
        />
        {premium &&
          values.map((v, i) => {
            const x = 4 + (i / Math.max(values.length - 1, 1)) * 92
            const y = 94 - ((Number(v) - min) / range) * 82
            return <circle key={i} cx={x} cy={y} r={1.8} fill={color} />
          })}
      </svg>
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

function PieChart({ values, colors, palette, labels = [], donut = false, showLegend = true }) {
  const total = values.reduce((s, v) => s + Number(v), 0) || 1
  let angle = -90
  const cx = 50
  const cy = 50
  const r = 40
  const ir = donut ? 22 : 0
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
    if (donut) {
      const ix1 = cx + ir * Math.cos(rad(start))
      const iy1 = cy + ir * Math.sin(rad(start))
      const ix2 = cx + ir * Math.cos(rad(end))
      const iy2 = cy + ir * Math.sin(rad(end))
      return (
        <path
          key={i}
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`}
          fill={fill}
        />
      )
    }
    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={fill}
      />
    )
  })
  return (
    <div className="ppt-chart-pie-wrap">
      <svg viewBox="0 0 100 100" className="ppt-chart-pie-svg">
        {slices}
      </svg>
      {showLegend && labels?.length > 0 ? (
        <div className="ppt-chart-pie-legend">
          {labels.slice(0, values.length).map((label, i) => (
            <div key={`${label}-${i}`} className="ppt-chart-pie-legend-item">
              <span
                className="ppt-chart-pie-legend-swatch"
                style={{ background: resolveColor(colors[i % colors.length], palette, '#64748b') }}
              />
              <span className="ppt-chart-pie-legend-label">{label}</span>
            </div>
          ))}
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
