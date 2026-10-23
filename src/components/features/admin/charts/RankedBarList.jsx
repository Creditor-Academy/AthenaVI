const CAT_COLORS = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6']

/**
 * Horizontal ranked bar chart. Rows use a fixed categorical color order
 * (never reassigned when the list re-sorts) so a feature keeps its identity.
 */
function RankedBarList({ rows, formatValue = (v) => String(v), formatMeta }) {
  if (!rows?.length) return null
  const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1)

  return (
    <div className="dash-ranked-list">
      {rows.map((row, i) => {
        const pct = Math.max(3, Math.round(((Number(row.value) || 0) / max) * 100))
        const colorVar = `var(--${CAT_COLORS[i % CAT_COLORS.length]})`
        return (
          <div className="dash-ranked-row" key={row.key ?? row.label}>
            <span className="dash-ranked-dot" style={{ background: colorVar }} aria-hidden="true" />
            <span className="dash-ranked-label" title={row.label}>{row.label}</span>
            <div className="dash-ranked-track">
              <div
                className="dash-ranked-fill"
                style={{ width: `${pct}%`, background: colorVar }}
              />
            </div>
            <span className="dash-ranked-value">{formatValue(row.value)}</span>
            {formatMeta && row.meta != null && (
              <span className="dash-ranked-meta">{formatMeta(row.meta)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default RankedBarList
