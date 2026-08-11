/** SVG chart renderer for PPT canvas elements. */

function normalizeChartType(chartType) {
  const type = String(chartType || 'column').toLowerCase()
  if (type === 'doughnut') return 'donut'
  return type
}

function resolveColor(col, palette, fallback) {
  if (!col) return fallback
  if (String(col).startsWith('#') || String(col).startsWith('rgb')) return col
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
  const values = Array.isArray(series[0]?.values)
    ? series[0].values
    : Array.isArray(series) && typeof series[0] === 'number'
      ? series
      : [12, 19, 14, 22]
  return { labels, values, seriesName: series[0]?.name || 'Series' }
}

function BarChart({ values, colors, palette }) {
  const max = Math.max(...values.map(Number), 1)
  return (
    <div className="ppt-chart-bars">
      {values.map((v, i) => (
        <span
          key={i}
          style={{
            height: `${Math.max(6, (Number(v) / max) * 100)}%`,
            background: resolveColor(colors[i % colors.length], palette, '#7C3AED'),
          }}
        />
      ))}
    </div>
  )
}

function LineChart({ values, colors, palette }) {
  const max = Math.max(...values.map(Number), 1)
  const min = Math.min(...values.map(Number), 0)
  const range = max - min || 1
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100
      const y = 100 - ((Number(v) - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')
  const color = resolveColor(colors[0], palette, '#7C3AED')
  return (
    <svg viewBox="0 0 100 100" className="ppt-chart-line-svg" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2.5" points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function PieChart({ values, colors, palette, donut = false }) {
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
    const fill = resolveColor(colors[i % colors.length], palette, '#7C3AED')
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
    <svg viewBox="0 0 100 100" className="ppt-chart-pie-svg">
      {slices}
    </svg>
  )
}

function KpiChart({ values, content, palette }) {
  const val = values[0] ?? content?.kpiValue ?? '42%'
  const label = content?.kpiLabel || content?.title || 'Metric'
  return (
    <div className="ppt-chart-kpi">
      <div className="ppt-chart-kpi-value" style={{ color: palette?.primary || '#7C3AED' }}>
        {val}
      </div>
      <div className="ppt-chart-kpi-label">{label}</div>
    </div>
  )
}

export default function PptChartRenderer({ content, palette, style }) {
  const chartType = normalizeChartType(content?.chartType)
  const { values } = getSeriesData(content)
  const colors = (content?.colors || ['#7C3AED', '#A78BFA', '#FDBA74', '#34D399']).map((c) =>
    resolveColor(c, palette, c)
  )

  const isLine = chartType.includes('line') || chartType.includes('area')
  const isPie = chartType === 'pie'
  const isDonut = chartType === 'donut'
  const isKpi = chartType === 'kpi'
  const isBar = chartType.includes('bar') && !chartType.includes('column')

  return (
    <div className="ppt-chart-renderer" style={style}>
      <div className="ppt-chart-renderer-label">{chartType}</div>
      {isKpi ? (
        <KpiChart values={values} content={content} palette={palette} />
      ) : isPie || isDonut ? (
        <PieChart values={values} colors={colors} palette={palette} donut={isDonut} />
      ) : isLine ? (
        <LineChart values={values} colors={colors} palette={palette} />
      ) : (
        <BarChart
          values={values}
          colors={colors}
          palette={palette}
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
