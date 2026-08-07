import { useState } from 'react'
import {
  buildEmptyTableCells,
  PPT_TABLE_MAX_COLS,
  PPT_TABLE_MAX_ROWS,
  PPT_TABLE_QUICK_PRESETS,
} from '../../../../constants/pptInsertCatalog'

export default function TablePopover({ onInsert, disabled }) {
  const [hover, setHover] = useState({ cols: 0, rows: 0 })

  const cols = hover.cols || 0
  const rows = hover.rows || 0

  const insert = (c, r) => {
    if (disabled || c < 1 || r < 1) return
    onInsert({
      type: 'table',
      presetId: 'table_basic',
      content: {
        rows: r,
        cols: c,
        hasHeader: true,
        cells: buildEmptyTableCells(r, c, { hasHeader: true }),
      },
    })
  }

  return (
    <div
      className="ppt-insert-popover ppt-table-popover"
      role="dialog"
      aria-label="Table"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ppt-insert-popover-title">Table</div>
      <p className="ppt-insert-popover-sub">Drag across the grid or pick a quick size</p>
      <div
        className="ppt-table-grid-picker"
        onMouseLeave={() => setHover({ cols: 0, rows: 0 })}
      >
        {Array.from({ length: PPT_TABLE_MAX_ROWS }, (_, rowIdx) => (
          <div key={rowIdx} className="ppt-table-grid-row">
            {Array.from({ length: PPT_TABLE_MAX_COLS }, (_, colIdx) => {
              const c = colIdx + 1
              const r = rowIdx + 1
              const active = cols >= c && rows >= r
              return (
                <button
                  key={`${c}x${r}`}
                  type="button"
                  className={`ppt-table-cell ${active ? 'is-active' : ''}`}
                  disabled={disabled}
                  aria-label={`${c} by ${r}`}
                  onMouseEnter={() => setHover({ cols: c, rows: r })}
                  onClick={() => insert(c, r)}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className={`ppt-table-feedback ${cols && rows ? 'is-ready' : ''}`}>
        {cols && rows ? `Insert ${cols}×${rows} table` : 'Select table size'}
      </div>
      <div className="ppt-insert-section-head ppt-table-quick-label">
        <span>Quick insert</span>
      </div>
      <div className="ppt-insert-chip-row">
        {PPT_TABLE_QUICK_PRESETS.map((p) => (
          <button
            key={`${p.cols}x${p.rows}`}
            type="button"
            className="ppt-insert-chip"
            disabled={disabled}
            onClick={() => insert(p.cols, p.rows)}
          >
            {p.cols}×{p.rows}
          </button>
        ))}
      </div>
    </div>
  )
}
