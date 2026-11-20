/**
 * Table sizing shared by the slide and canvas editors.
 *
 * - `content.colWidths`: each column's share of the table width (fractions that add up to 1),
 *   so columns keep their proportions when the table box is resized.
 * - `content.rowHeights`: each row's minimum height in editor-stage px (the same unit as font
 *   sizes). A row is never shorter than its text needs, so text wraps and the row grows, as in
 *   PowerPoint and Canva.
 */

/** Smallest column, as a share of the table width. */
export const TABLE_MIN_COL_FRACTION = 0.04
/** Smallest column in stage px (wins over the fraction on narrow tables). */
export const TABLE_MIN_COL_PX = 24
/** Smallest row in stage px. */
export const TABLE_MIN_ROW_PX = 12

/** The table's rows of cell strings (`cells`, or the older `rows` array of arrays). */
export function tableCellsOf(content) {
  const c = content || {}
  if (Array.isArray(c.cells)) return c.cells
  if (Array.isArray(c.rows) && Array.isArray(c.rows[0])) return c.rows
  return []
}

export function tableColumnCount(cells) {
  return Math.max(0, ...(cells || []).map((row) => (Array.isArray(row) ? row.length : 0)))
}

const round4 = (n) => Math.round(n * 10000) / 10000

/**
 * Column shares for `count` columns: the stored ones when they match, else equal columns.
 * Always `count` positive numbers that add up to 1.
 */
export function normalizeColWidths(colWidths, count) {
  if (!(count > 0)) return []
  const equal = () => Array.from({ length: count }, () => 1 / count)
  if (!Array.isArray(colWidths) || colWidths.length !== count) return equal()
  const nums = colWidths.map((w) => Number(w))
  if (nums.some((w) => !Number.isFinite(w) || w <= 0)) return equal()
  const sum = nums.reduce((a, b) => a + b, 0)
  return nums.map((w) => w / sum)
}

/**
 * Move the border between column `index` and `index + 1` by `deltaFraction` of the table
 * width. Only those two columns change, so the table keeps its width (as in PowerPoint).
 */
export function resizeColumnBorder(widths, index, deltaFraction, minFraction = TABLE_MIN_COL_FRACTION) {
  if (!Array.isArray(widths) || index < 0 || index >= widths.length - 1) return widths
  const pair = widths[index] + widths[index + 1]
  const min = Math.min(minFraction, pair / 2)
  const left = Math.min(pair - min, Math.max(min, widths[index] + (Number(deltaFraction) || 0)))
  const next = [...widths]
  next[index] = round4(left)
  next[index + 1] = round4(pair - left)
  return next
}

/** Smallest column share for a table drawn `tableWidthPx` wide. */
export function minColFraction(tableWidthPx) {
  const w = Number(tableWidthPx) || 0
  if (w <= 0) return TABLE_MIN_COL_FRACTION
  return Math.max(TABLE_MIN_COL_FRACTION, TABLE_MIN_COL_PX / w)
}

/**
 * Stored row minimums for `count` rows (stage px), or null when the table has none (rows then
 * share the box height and only grow to fit their text).
 */
export function normalizeRowHeights(rowHeights, count) {
  if (!Array.isArray(rowHeights) || rowHeights.length !== count || !count) return null
  const nums = rowHeights.map((h) => Number(h))
  if (nums.some((h) => !Number.isFinite(h) || h < 0)) return null
  return nums.map((h) => Math.max(TABLE_MIN_ROW_PX, Math.round(h * 10) / 10))
}

/**
 * The height the rows need: each row is the larger of its stored minimum and its text.
 * `contentHeights` and the result are stage px.
 */
export function naturalRowHeights(contentHeights, rowHeights) {
  return (contentHeights || []).map((h, i) =>
    Math.max(Number(h) || 0, Number(rowHeights?.[i]) || 0, TABLE_MIN_ROW_PX)
  )
}

/**
 * Row minimums that keep the table looking as it is drawn now (stage px).
 * A row taller than its text (it has room to spare, e.g. an AI table spread over its box) keeps
 * that height. A row only as tall as its text keeps its stored minimum, or the smallest row, so
 * it shrinks back when the text is removed (PowerPoint: a row grown by text shrinks again).
 */
export function rowMinimumsFromLayout(rendered, contentHeights, rowHeights = null) {
  return (rendered || []).map((h, i) => {
    const drawn = Number(h) || 0
    if (drawn > (Number(contentHeights?.[i]) || 0) + 2) return Math.round(drawn * 10) / 10
    return Math.max(TABLE_MIN_ROW_PX, Number(rowHeights?.[i]) || 0)
  })
}

/** Row minimums after dragging the bottom border of row `index` by `deltaPx` (stage px). */
export function resizeRowBorder(baseHeights, contentHeights, index, deltaPx) {
  if (!Array.isArray(baseHeights) || index < 0 || index >= baseHeights.length) return baseHeights
  const next = baseHeights.map((h) => Math.round(Math.max(TABLE_MIN_ROW_PX, Number(h) || 0) * 10) / 10)
  const floor = Math.max(TABLE_MIN_ROW_PX, Number(contentHeights?.[index]) || 0)
  next[index] = Math.round(Math.max(floor, (Number(baseHeights[index]) || 0) + (Number(deltaPx) || 0)) * 10) / 10
  return next
}

/**
 * When the table box should change height after something moved.
 * - The text needs more room than the box: grow to fit (never cut text).
 * - The table has its own row heights and the text changed: fit exactly (rows shrink back
 *   when text is removed, as in PowerPoint).
 * - Otherwise (an older table without row heights, or the user stretched the box): leave it;
 *   the rows share the extra height.
 * Returns the new box height, or null for no change. All values stage px.
 */
export function tableBoxHeightToApply({ boxHeight, naturalHeight, hasRowHeights, contentChanged, tolerance = 2 }) {
  const box = Number(boxHeight) || 0
  const natural = Number(naturalHeight) || 0
  if (natural <= 0) return null
  if (natural > box + tolerance) return natural
  if (hasRowHeights && contentChanged && box > natural + tolerance) return natural
  return null
}
