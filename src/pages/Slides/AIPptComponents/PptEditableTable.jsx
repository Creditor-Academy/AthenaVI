import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { isPptGroupScaling } from '../../../utils/pptGroupUtils'
import {
  minColFraction,
  naturalRowHeights,
  normalizeColWidths,
  normalizeRowHeights,
  resizeColumnBorder,
  resizeRowBorder,
  rowMinimumsFromLayout,
  tableBoxHeightToApply,
  tableCellsOf,
  tableColumnCount,
} from '../../../utils/pptTableLayout'

/*
 * A slide / canvas table. Cell text wraps onto new lines and each row grows to fit it, so
 * nothing is cut off; the table box grows with its rows. When the table is selected, its column
 * and row borders can be dragged (PowerPoint / Canva style). Sizes are stored on the element:
 * `colWidths` (shares of the width) and `rowHeights` (stage px minimums).
 *
 * `onLayoutChange(contentPatch, { boxPx, kind })`:
 * - `contentPatch`: `{ colWidths }` / `{ rowHeights }`, or null for a box-height-only change;
 * - `boxPx`: the new element height in the element's own layout px (the editor converts it);
 * - `kind`: 'drag' (live, while a border is dragged), 'drag-end' (the drag's final values) or
 *   'auto' (the box following its text; not an undo step of its own).
 */

// Is a pointer pressed anywhere (a box being moved or resized)? The table waits until it is
// released before fitting its box, so it doesn't fight the drag.
let pointerDown = false
const afterPointerUp = new Set()
let trackerInstalled = false
function installPointerTracker() {
  if (trackerInstalled || typeof document === 'undefined') return
  trackerInstalled = true
  document.addEventListener('pointerdown', () => { pointerDown = true }, true)
  const release = () => {
    pointerDown = false
    if (!afterPointerUp.size) return
    const run = [...afterPointerUp]
    afterPointerUp.clear()
    // After the drag's own commit has rendered.
    setTimeout(() => run.forEach((fn) => fn()), 40)
  }
  document.addEventListener('pointerup', release, true)
  document.addEventListener('pointercancel', release, true)
}

const px = (v) => parseFloat(v) || 0

/** Wrapper padding + border (layout px): the box height around the table. */
function chromeHeight(wrap) {
  const s = getComputedStyle(wrap)
  return px(s.paddingTop) + px(s.paddingBottom) + px(s.borderTopWidth) + px(s.borderBottomWidth)
}

/** Height each row's text needs (layout px): the tallest cell's text plus its padding. */
function measureRowContentHeights(table) {
  return [...table.rows].map((row) => {
    let tallest = 0
    for (const cell of row.cells) {
      const text = cell.querySelector('.ppt-table-cell-measure, .ppt-table-cell-text')
      const s = getComputedStyle(cell)
      const h =
        (text ? text.offsetHeight : 0) +
        px(s.paddingTop) +
        px(s.paddingBottom) +
        // Collapsed borders: half of each border belongs to this row.
        (px(s.borderTopWidth) + px(s.borderBottomWidth)) / 2
      if (h > tallest) tallest = h
    }
    return Math.ceil(tallest)
  })
}

// Keeps an empty or newline-ended cell one line tall in the measuring copy.
const ZERO_WIDTH_SPACE = '​'
const sum = (list) => list.reduce((a, b) => a + b, 0)

function focusCell(table, row, col) {
  const target = table?.querySelector(`textarea[data-cell="${row}:${col}"]`)
  if (!target) return false
  target.focus()
  const end = target.value.length
  target.setSelectionRange?.(end, end)
  return true
}

export default function PptEditableTable({
  el,
  content,
  editable = false,
  selected = false,
  onCellChange,
  onActivate,
  onLayoutChange,
  style,
}) {
  const c = content || {}
  const cells = tableCellsOf(c)
  const colCount = tableColumnCount(cells)
  const hasHeader = c.hasHeader !== false
  const colWidths = normalizeColWidths(c.colWidths, colCount)
  const rowHeights = normalizeRowHeights(c.rowHeights, cells.length)
  const canResize = Boolean(editable && onLayoutChange)
  const showHandles = canResize && selected

  const wrapRef = useRef(null)
  const tableRef = useRef(null)
  const dragRef = useRef(null)
  const lastSigRef = useRef(null)
  const lastBoxRef = useRef(null)
  // The last settled layout (rows drawn and the height their text needs), from before a change.
  const lastLayoutRef = useRef(null)

  const layoutRef = useRef({})
  const contentSig = JSON.stringify([cells, c.colWidths || null, c.rowHeights || null, el?.placement?.width || null])
  const contentSigRef = useRef(contentSig)
  // Latest props for the measuring callbacks (they outlive a render).
  useLayoutEffect(() => {
    layoutRef.current = { rowHeights, onLayoutChange, groupId: el?.groupId }
    contentSigRef.current = contentSig
  })

  // A stable entry point (observers, the pointer-up queue) to this render's `fitBox`.
  const fitBoxRef = useRef(null)
  const reconcile = useCallback(() => fitBoxRef.current?.(), [])

  /** Fit the box to the rows after a change (never cut text; see tableBoxHeightToApply). */
  const fitBox = () => {
    const wrap = wrapRef.current
    const table = tableRef.current
    const { rowHeights: mins, onLayoutChange: notify, groupId } = layoutRef.current
    if (!wrap || !table || !notify || !wrap.offsetHeight) return
    if (dragRef.current === 'row') return
    if (pointerDown && !dragRef.current) {
      afterPointerUp.add(reconcile)
      return
    }
    // A grouped table is sized by its group.
    if (groupId || isPptGroupScaling()) return

    const box = wrap.offsetHeight
    const rows = [...table.rows]
    const contentHeights = measureRowContentHeights(table)
    const needed = naturalRowHeights(contentHeights, mins)
    const rendered = rows.map((r) => r.offsetHeight)
    // Collapsed outer border: the table is a pixel or so taller than its rows.
    const tableExtra = Math.max(0, table.offsetHeight - sum(rendered))
    const natural = Math.ceil(chromeHeight(wrap) + sum(needed) + tableExtra)

    const sig = lastSigRef.current
    const contentChanged = sig != null && sig !== contentSigRef.current
    const boxChanged = lastBoxRef.current != null && Math.abs(box - lastBoxRef.current) > 1
    lastSigRef.current = contentSigRef.current
    const prev = lastLayoutRef.current
    const settled = table.offsetHeight <= wrap.clientHeight + 1
    lastLayoutRef.current = settled ? { rendered, contentHeights } : null
    const chrome = chromeHeight(wrap)
    const fit = (minimums) => Math.ceil(chrome + sum(naturalRowHeights(contentHeights, minimums)) + tableExtra)

    // First edit of a table without row heights (e.g. AI-made, rows spread over the box): keep
    // every row as it was drawn and let only the edited row grow or shrink, as in PowerPoint.
    if (!mins && contentChanged && prev && prev.rendered.length === rendered.length) {
      const frozen = rowMinimumsFromLayout(prev.rendered, prev.contentHeights)
      const height = fit(frozen)
      lastBoxRef.current = height
      lastLayoutRef.current = null
      notify({ rowHeights: frozen }, { boxPx: Math.abs(height - box) > 2 ? height : undefined, kind: 'auto' })
      return
    }
    // The user stretched a table that has its own row heights: keep the rows as drawn now.
    if (mins && boxChanged && !contentChanged && box > natural + 2) {
      lastBoxRef.current = box
      notify({ rowHeights: rowMinimumsFromLayout(rendered, contentHeights, mins) }, { kind: 'auto' })
      return
    }
    const target = tableBoxHeightToApply({
      boxHeight: box,
      naturalHeight: natural,
      hasRowHeights: Boolean(mins),
      contentChanged,
    })
    lastBoxRef.current = target ?? box
    if (target != null) notify(null, { boxPx: target, kind: 'auto' })
  }
  useLayoutEffect(() => {
    fitBoxRef.current = fitBox
  })

  useLayoutEffect(() => {
    if (!canResize) {
      lastSigRef.current = null
      lastBoxRef.current = null
      return
    }
    installPointerTracker()
    reconcile()
  }, [canResize, contentSig, el?.placement?.height, reconcile])

  // Fonts loading or the box resizing change how the text wraps.
  useEffect(() => {
    if (!canResize || typeof ResizeObserver === 'undefined') return undefined
    const wrap = wrapRef.current
    const table = tableRef.current
    if (!wrap || !table) return undefined
    let frame = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(reconcile)
    })
    ro.observe(wrap)
    ro.observe(table)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      afterPointerUp.delete(reconcile)
    }
  }, [canResize, reconcile])

  const beginDrag = (e, kind, onMove) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    onActivate?.()
    dragRef.current = kind
    const target = e.currentTarget
    target.setPointerCapture?.(e.pointerId)
    let last = null
    const move = (ev) => {
      last = onMove(ev)
      if (last) onLayoutChange?.(last.patch, { boxPx: last.boxPx, kind: 'drag' })
    }
    const end = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', end)
      target.removeEventListener('pointercancel', end)
      dragRef.current = null
      if (last) onLayoutChange?.(last.patch, { boxPx: last.boxPx, kind: 'drag-end' })
      requestAnimationFrame(reconcile)
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', end)
    target.addEventListener('pointercancel', end)
  }

  const startColumnDrag = (e, index) => {
    const table = tableRef.current
    if (!table) return
    const startX = e.clientX
    const screenWidth = table.getBoundingClientRect().width || 1
    const start = colWidths
    const minFraction = minColFraction(table.offsetWidth)
    beginDrag(e, 'col', (ev) => ({
      patch: { colWidths: resizeColumnBorder(start, index, (ev.clientX - startX) / screenWidth, minFraction) },
    }))
  }

  const startRowDrag = (e, index) => {
    const table = tableRef.current
    const wrap = wrapRef.current
    if (!table || !wrap) return
    const startY = e.clientY
    const rendered = [...table.rows].map((r) => r.offsetHeight)
    const contentHeights = measureRowContentHeights(table)
    const scale = wrap.getBoundingClientRect().height / (wrap.offsetHeight || 1) || 1
    const chrome = chromeHeight(wrap)
    const tableExtra = Math.max(0, table.offsetHeight - sum(rendered))
    // The other rows keep their look; the dragged one starts from its drawn height.
    const base = rowMinimumsFromLayout(rendered, contentHeights, rowHeights)
    base[index] = rendered[index]
    beginDrag(e, 'row', (ev) => {
      const next = resizeRowBorder(base, contentHeights, index, (ev.clientY - startY) / scale)
      const height = Math.ceil(chrome + sum(naturalRowHeights(contentHeights, next)) + tableExtra)
      return { patch: { rowHeights: next }, boxPx: height }
    })
  }

  const handleKeyDown = (e, ri, ci) => {
    if (e.key !== 'Tab') return
    const table = tableRef.current
    const flat = cells.flatMap((row, r) => (row || []).map((_, cc) => [r, cc]))
    const at = flat.findIndex(([r, cc]) => r === ri && cc === ci)
    const next = flat[at + (e.shiftKey ? -1 : 1)]
    if (next && focusCell(table, next[0], next[1])) e.preventDefault()
  }

  return (
    <div
      ref={wrapRef}
      className={`aig-canvas-table${showHandles ? ' is-resizable' : ''}`}
      style={style}
    >
      <table ref={tableRef} className="aig-canvas-table-grid">
        {colCount ? (
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: `${(w * 100).toFixed(3)}%` }} />
            ))}
          </colgroup>
        ) : null}
        <tbody>
          {cells.map((row, ri) => (
            <tr key={ri} style={rowHeights ? { height: `${rowHeights[ri]}px` } : undefined}>
              {(row || []).map((cell, ci) => {
                const Tag = hasHeader && ri === 0 ? 'th' : 'td'
                const text = typeof cell === 'string' || typeof cell === 'number' ? String(cell) : ''
                return (
                  <Tag key={ci}>
                    {editable ? (
                      <div className="ppt-table-cell-fit">
                        {/* Sizes the cell: the textarea sits on top of a copy of its text. */}
                        <div className="ppt-table-cell-measure" aria-hidden>
                          {text.endsWith('\n') || !text ? text + ZERO_WIDTH_SPACE : text}
                        </div>
                        <textarea
                          className="ppt-table-cell-input"
                          rows={1}
                          value={text}
                          data-cell={`${ri}:${ci}`}
                          spellCheck={false}
                          placeholder={hasHeader && ri === 0 ? `Header ${ci + 1}` : 'Type here'}
                          onChange={(e) => {
                            const inputType = e.nativeEvent?.inputType
                            if (inputType === 'historyUndo' || inputType === 'historyRedo') return
                            onCellChange?.(ri, ci, e.target.value)
                          }}
                          onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                          onFocus={() => onActivate?.()}
                          onClick={(e) => {
                            e.stopPropagation()
                            onActivate?.()
                          }}
                        />
                      </div>
                    ) : (
                      <div className="ppt-table-cell-text">{text}</div>
                    )}
                    {showHandles && ci < (row || []).length - 1 ? (
                      <span
                        className="ppt-table-col-handle"
                        title="Drag to resize the column"
                        onPointerDown={(e) => startColumnDrag(e, ci)}
                      />
                    ) : null}
                    {showHandles ? (
                      <span
                        className="ppt-table-row-handle"
                        title="Drag to resize the row"
                        onPointerDown={(e) => startRowDrag(e, ri)}
                      />
                    ) : null}
                  </Tag>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
