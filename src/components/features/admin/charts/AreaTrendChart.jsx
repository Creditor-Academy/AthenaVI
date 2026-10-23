import { useId, useMemo, useRef, useState } from 'react'

const VB_W = 1000
const VB_H = 360
const PAD = { top: 24, right: 20, bottom: 36, left: 12 }

function buildSmoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

/**
 * Smooth area/line trend chart with hover crosshair + tooltip.
 * data: [{ label, value, meta? }] — already sorted ascending.
 */
function AreaTrendChart({
  data,
  formatValue = (v) => String(v),
  formatLabel = (l) => String(l),
  metaLabel,
  height = 220,
}) {
  const gradientId = useId()
  const wrapRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)

  const { points, gridLines } = useMemo(() => {
    if (!data?.length) return { points: [], gridLines: [] }
    const values = data.map((d) => Number(d.value) || 0)
    const maxRaw = Math.max(...values, 0)
    const minRaw = Math.min(...values, 0)
    const max = maxRaw === minRaw ? maxRaw + 1 : maxRaw
    const min = minRaw > 0 ? 0 : minRaw
    const chartW = VB_W - PAD.left - PAD.right
    const chartH = VB_H - PAD.top - PAD.bottom
    const n = data.length
    const pts = data.map((d, i) => {
      const x = n === 1 ? PAD.left + chartW / 2 : PAD.left + (i / (n - 1)) * chartW
      const v = Number(d.value) || 0
      const y = PAD.top + chartH - ((v - min) / (max - min || 1)) * chartH
      return { x, y, value: v, label: d.label, meta: d.meta }
    })
    const lines = [0.25, 0.5, 0.75].map((f) => PAD.top + chartH * (1 - f))
    return { points: pts, gridLines: lines }
  }, [data])

  if (!data?.length) return null

  const linePath = buildSmoothPath(points)
  const baseline = VB_H - PAD.bottom
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
  const hover = hoverIdx != null ? points[hoverIdx] : null

  const handleMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || !points.length) return
    const relX = (e.clientX - rect.left) / rect.width
    const targetX = relX * VB_W
    let closest = 0
    let closestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - targetX)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIdx(closest)
  }

  const tooltipLeftPct = hover ? (hover.x / VB_W) * 100 : 0
  const tooltipSide = tooltipLeftPct > 70 ? 'left' : tooltipLeftPct < 15 ? 'right' : 'center'

  return (
    <div
      className="dash-trend-chart"
      ref={wrapRef}
      style={{ height }}
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="dash-trend-chart-svg"
        role="img"
        aria-label="Trend chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((y, i) => (
          <line
            key={i}
            x1={PAD.left}
            x2={VB_W - PAD.right}
            y1={y}
            y2={y}
            className="dash-trend-grid"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {hover && (
          <line
            x1={hover.x}
            x2={hover.x}
            y1={PAD.top}
            y2={baseline}
            className="dash-trend-crosshair"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {hover && (
          <circle cx={hover.x} cy={hover.y} r="10" className="dash-trend-marker-ring" />
        )}
        {hover && (
          <circle cx={hover.x} cy={hover.y} r="5" className="dash-trend-marker" />
        )}
      </svg>

      {hover && (
        <div
          className={`dash-trend-tooltip dash-trend-tooltip--${tooltipSide}`}
          style={{ left: `${tooltipLeftPct}%`, top: `${(hover.y / VB_H) * 100}%` }}
        >
          <div className="dash-trend-tooltip-date">{formatLabel(hover.label)}</div>
          <div className="dash-trend-tooltip-value">{formatValue(hover.value)}</div>
          {metaLabel && hover.meta != null && (
            <div className="dash-trend-tooltip-meta">{metaLabel(hover.meta)}</div>
          )}
        </div>
      )}

      <div className="dash-trend-axis">
        <span>{formatLabel(data[0].label)}</span>
        {data.length > 2 && <span>{formatLabel(data[Math.floor((data.length - 1) / 2)].label)}</span>}
        <span>{formatLabel(data[data.length - 1].label)}</span>
      </div>
    </div>
  )
}

export default AreaTrendChart
