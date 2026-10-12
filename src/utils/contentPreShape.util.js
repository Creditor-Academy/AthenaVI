/** Slot-oriented content normalization before textForSlot (mirrors backend Part A pre-shape). */

function titleWordsFromBody(body, fallback) {
  const words = String(body || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(' ')
  return words || fallback || ''
}

function layoutHasComparisonSides(slots) {
  return (slots || []).some((s) => /^LEFT_(TITLE|BODY)$/i.test(String(s?.id || '')))
}

function layoutHasComparisonTableRows(slots) {
  return (slots || []).some((s) => /^ROW_\d+_LEFT_/i.test(String(s?.id || '')))
}

function countPointSlots(slots) {
  const nums = new Set()
  for (const s of slots || []) {
    const m = String(s?.id || '').match(/^POINT_(\d+)_/i)
    if (m) nums.add(m[1])
  }
  return nums.size
}

function bulletsToSide(sideSrc, bullets) {
  const src = sideSrc && typeof sideSrc === 'object' ? { ...sideSrc } : {}
  if (!Array.isArray(src.bullets) || !src.bullets.length) {
    if (Array.isArray(bullets) && bullets.length) src.bullets = bullets
  }
  return src
}

export function normalizeComparisonSideContent(content, layoutSchema) {
  if (!content || typeof content !== 'object' || !layoutSchema?.slots?.length) return content
  if (!layoutHasComparisonSides(layoutSchema.slots)) return content

  const next = { ...content }
  const cmp = next.comparison && typeof next.comparison === 'object' ? { ...next.comparison } : {}
  let left = { ...(next.left || cmp.left || {}) }
  let right = { ...(next.right || cmp.right || {}) }

  if (Array.isArray(next.columns) && next.columns.length >= 2) {
    if (!left.title) left.title = String(next.columns[0]?.title ?? next.columns[0]?.heading ?? '').trim()
    if (!right.title) right.title = String(next.columns[1]?.title ?? next.columns[1]?.heading ?? '').trim()
    if (!left.bullets?.length && next.columns[0]?.body) {
      left.bullets = [String(next.columns[0].body).trim()]
    }
    if (!right.bullets?.length && next.columns[1]?.body) {
      right.bullets = [String(next.columns[1].body).trim()]
    }
  }

  left = bulletsToSide(left, left.bullets)
  right = bulletsToSide(right, right.bullets)

  next.left = left
  next.right = right
  next.comparison = { ...cmp, left, right }
  return next
}

export function normalizeComparisonTableContent(content, layoutSchema) {
  if (!content || typeof content !== 'object' || !layoutSchema?.slots?.length) return content
  if (!layoutHasComparisonTableRows(layoutSchema.slots)) return content

  const next = { ...content }
  const cmp = next.comparison && typeof next.comparison === 'object' ? { ...next.comparison } : {}
  let rows = Array.isArray(cmp.rows) ? [...cmp.rows] : Array.isArray(next.comparisonRows) ? [...next.comparisonRows] : []

  let needed = 0
  for (const s of layoutSchema.slots) {
    const m = String(s.id || '').match(/^ROW_(\d+)_LEFT_/i)
    if (m) needed = Math.max(needed, Number(m[1]))
  }
  if (!needed) return content

  if (!rows.length && Array.isArray(next.columns) && next.columns.length >= needed * 2) {
    rows = []
    for (let i = 0; i < needed; i += 1) {
      const l = next.columns[i * 2] || {}
      const r = next.columns[i * 2 + 1] || {}
      rows.push({
        leftTitle: String(l.title ?? l.heading ?? '').trim(),
        leftBody: String(l.body ?? l.text ?? '').trim(),
        rightTitle: String(r.title ?? r.heading ?? '').trim(),
        rightBody: String(r.body ?? r.text ?? '').trim(),
      })
    }
  }

  while (rows.length < needed) {
    rows.push({ leftTitle: '', leftBody: '', rightTitle: '', rightBody: '' })
  }

  next.comparison = { ...cmp, rows: rows.slice(0, needed) }
  next.comparisonRows = next.comparison.rows
  return next
}

export function normalizeMultiColumnContent(content, layoutSchema) {
  if (!content || typeof content !== 'object' || !layoutSchema?.slots?.length) return content
  const slots = layoutSchema.slots
  const needsColumns =
    slots.some((s) => /^(card|col|row)_\d+_(title|body)$/i.test(String(s.id || ''))) ||
    slots.some((s) => /^point_\d+_(title|desc)$/i.test(String(s.id || ''))) ||
    slots.some((s) => /^bullet_\d+$/i.test(String(s.id || ''))) ||
    slots.some((s) => /^body_\d+$/i.test(String(s.id || '')))
  if (!needsColumns) return content

  let colsKey = Array.isArray(content.columns)
    ? 'columns'
    : Array.isArray(content.cards)
      ? 'cards'
      : Array.isArray(content.features)
        ? 'features'
        : null

  const next = { ...content }

  if (!colsKey) {
    const bullets = Array.isArray(content.bullets) ? content.bullets : []
    const items = Array.isArray(content.items) ? content.items : []
    if (items.length >= 2) {
      next.columns = items.map((item, index) => {
        if (typeof item === 'string') {
          const text = item.trim()
          const split = text.split(/[:\-\u2014\u2013]\s*/)
          return {
            title: split.length > 1 ? split[0].trim() : titleWordsFromBody(text, `Item ${index + 1}`),
            body: split.length > 1 ? split.slice(1).join(' ').trim() : text,
          }
        }
        return {
          title: String(item.title ?? item.heading ?? item.label ?? titleWordsFromBody(item.body ?? item.text ?? '', `Item ${index + 1}`)).trim(),
          body: String(item.body ?? item.text ?? item.description ?? '').trim(),
        }
      })
      colsKey = 'columns'
    } else if (bullets.length >= 2) {
      next.columns = bullets.map((bullet, index) => {
        const text = typeof bullet === 'string' ? bullet.trim() : String(bullet?.text ?? bullet?.label ?? '').trim()
        const split = text.split(/[:\-\u2014\u2013]\s*/)
        const inlineTitle = split.length > 1 ? split[0].trim() : ''
        const body = split.length > 1 ? split.slice(1).join(' ').trim() : text
        return {
          title: inlineTitle || titleWordsFromBody(body, `Point ${index + 1}`),
          body,
        }
      })
      colsKey = 'columns'
    }
  }

  if (!colsKey) return content

  next[colsKey] = [...next[colsKey]]
  const slideTitle = String(next.title || '').trim().toLowerCase()
  const seen = new Set()

  next[colsKey] = next[colsKey].map((col, index) => {
    if (!col || typeof col !== 'object') return col
    const copy = { ...col }
    let title = String(copy.title ?? copy.heading ?? copy.label ?? '').trim()
    const body = String(copy.body ?? copy.text ?? '').trim()
    const titleLower = title.toLowerCase()
    if (!title || titleLower === slideTitle || seen.has(titleLower)) {
      const fromBody = titleWordsFromBody(body, '')
      const fromBodyLower = String(fromBody || '').trim().toLowerCase()
      if (fromBody && fromBodyLower !== slideTitle && !seen.has(fromBodyLower)) {
        title = fromBody
      } else {
        title = `Aspect ${index + 1}`
      }
      copy.title = title
    }
    seen.add(String(copy.title ?? '').trim().toLowerCase())
    return copy
  })

  return next
}

export function normalizePointGridContent(content, layoutSchema) {
  if (!content || typeof content !== 'object' || !layoutSchema?.slots?.length) return content
  const pointSlots = countPointSlots(layoutSchema.slots)
  if (pointSlots < 2) return content

  const next = normalizeMultiColumnContent(content, {
    ...layoutSchema,
    slots: [
      ...layoutSchema.slots,
      ...Array.from({ length: pointSlots }, (_, i) => ({ id: `POINT_${i + 1}_TITLE` })),
    ],
  })

  const needed = countPointSlots(layoutSchema.slots)
  const cols = Array.isArray(next.columns)
    ? [...next.columns]
    : Array.isArray(next.cards)
      ? [...next.cards]
      : Array.isArray(next.features)
        ? [...next.features]
        : []
  while (cols.length < needed) cols.push({ title: '', body: '' })
  next.columns = cols.slice(0, needed)
  return next
}

export function normalizeTableSlotContent(content, layoutSchema) {
  if (!content || typeof content !== 'object' || !layoutSchema?.slots?.length) return content
  const hasCells = layoutSchema.slots.some((s) => /^CELL_\d+_\d+$/i.test(String(s?.id || '')))
  if (!hasCells) return content

  const next = { ...content }
  if (!next.table || typeof next.table !== 'object') next.table = {}

  let headers = Array.isArray(next.table.headers) ? [...next.table.headers] : []
  const colHeaders = layoutSchema.slots.filter((s) => /^COL_\d+_HEADER$/i.test(String(s?.id || '')))
  const colCount = colHeaders.length
  if (!headers.length && colCount > 0) {
    headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`)
  }

  let rows = Array.isArray(next.table.rows)
    ? next.table.rows.map((row) => (Array.isArray(row) ? [...row] : [String(row ?? '')]))
    : Array.isArray(next.table.cells)
      ? next.table.cells.map((row) => (Array.isArray(row) ? [...row] : [String(row ?? '')]))
      : []

  const cellRows = layoutSchema.slots
    .map((s) => String(s.id || '').match(/^CELL_(\d+)_(\d+)$/i))
    .filter(Boolean)
  const maxR = cellRows.reduce((m, c) => Math.max(m, Number(c[1])), 0)
  const maxC = cellRows.reduce((m, c) => Math.max(m, Number(c[2])), 0)

  while (rows.length < maxR) rows.push(Array.from({ length: maxC }, () => ''))
  rows = rows.map((row) => {
    const copy = [...row]
    while (copy.length < maxC) copy.push('')
    return copy.slice(0, maxC)
  })

  next.table = { ...next.table, headers, rows, cells: rows }
  return next
}

export function normalizeDualMetricContent(content, layoutSchema) {
  if (!content || typeof content !== 'object' || !layoutSchema?.slots?.length) return content
  const hasA = layoutSchema.slots.some((s) => /^METRIC_A_/i.test(String(s?.id || '')))
  const hasB = layoutSchema.slots.some((s) => /^METRIC_B_/i.test(String(s?.id || '')))
  if (!hasA || !hasB) return content

  const next = { ...content }
  const stats = Array.isArray(next.stats) ? [...next.stats] : Array.isArray(next.metrics) ? [...next.metrics] : []
  while (stats.length < 2) stats.push({ title: '', body: '', label: '', value: '' })
  next.stats = stats.slice(0, 2)
  return next
}

export function normalizeTimelineContent(content, layoutSchema) {
  if (!content || typeof content !== 'object' || !layoutSchema?.slots?.length) return content

  const slots = layoutSchema.slots
  const layoutId = String(layoutSchema.layout_id || '')
  const isTimeline =
    /timeline/i.test(layoutId) ||
    slots.some((s) => /^milestone_/i.test(String(s.id || ''))) ||
    slots.some((s) => /^step_\d+_/i.test(String(s.id || '')))
  if (!isTimeline) return content

  const key = Array.isArray(content.timeline)
    ? 'timeline'
    : Array.isArray(content.milestones)
      ? 'milestones'
      : Array.isArray(content.events)
        ? 'events'
        : 'timeline'

  let items = Array.isArray(content[key]) ? [...content[key]] : []
  if (items.length < 2 && Array.isArray(content.bullets) && content.bullets.length) {
    items = content.bullets
      .map((bullet) => {
        const text = typeof bullet === 'string' ? bullet : String(bullet?.text ?? bullet?.label ?? '')
        return text.trim()
      })
      .filter(Boolean)
  }

  const milestoneSlots = slots.filter(
    (s) => /^milestone_\d+$/i.test(String(s.id || '')) || /^milestone_\d+_label$/i.test(String(s.id || ''))
  )
  const needed = Math.max(2, milestoneSlots.length || 4)
  const summary = String(content.summary || content.body || content.subtitle || '').trim()
  const summaryParts = summary ? summary.split(/[.;]\s+/).map((part) => part.trim()).filter(Boolean) : []

  const normalized = items.map((item, index) => {
    if (typeof item === 'string') {
      const trimmed = item.trim()
      const yearOnly = /^\d{4}$/.test(trimmed)
      const split = trimmed.split(/[:\-\u2014\u2013]\s*/)
      const label = yearOnly ? trimmed : (split[0] || trimmed).trim()
      const inlineDetail = yearOnly ? '' : split.slice(1).join(' ').trim()
      const detail =
        inlineDetail ||
        summaryParts[index % Math.max(summaryParts.length, 1)] ||
        (summary ? summary.slice(0, 120) : `Key milestone ${index + 1}`)
      return { label, detail, title: label, body: detail }
    }

    const copy = { ...item }
    let label = String(copy.label ?? copy.date ?? copy.year ?? copy.period ?? copy.title ?? copy.name ?? '').trim()
    let detail = String(copy.detail ?? copy.body ?? copy.text ?? copy.description ?? copy.summary ?? '').trim()
    if (!label) label = String(copy.value ?? copy.head ?? `Phase ${index + 1}`).trim()
    if (!detail) {
      detail =
        summaryParts[index % Math.max(summaryParts.length, 1)] ||
        (summary ? summary.slice(0, 120) : `Key development for ${label || `milestone ${index + 1}`}`)
    }
    return { ...copy, label, detail, body: detail }
  })

  while (normalized.length < needed) {
    const n = normalized.length + 1
    normalized.push({
      label: String(2010 + n * 3),
      detail: summaryParts[n % Math.max(summaryParts.length, 1)] || summary.slice(0, 100) || `Milestone ${n}`,
      title: `Milestone ${n}`,
      body: summary.slice(0, 100) || `Milestone ${n}`,
    })
  }

  return {
    ...content,
    [key]: normalized,
    timeline: key === 'timeline' ? normalized : content.timeline || normalized,
    milestones: key === 'milestones' ? normalized : content.milestones || normalized,
  }
}

export function runContentPreShape(content, layoutSchema) {
  if (!layoutSchema?.slots?.length) return content
  let next = content && typeof content === 'object' ? { ...content } : {}
  next = normalizeComparisonSideContent(next, layoutSchema)
  next = normalizeComparisonTableContent(next, layoutSchema)
  next = normalizeMultiColumnContent(next, layoutSchema)
  next = normalizePointGridContent(next, layoutSchema)
  next = normalizeTableSlotContent(next, layoutSchema)
  next = normalizeDualMetricContent(next, layoutSchema)
  next = normalizeTimelineContent(next, layoutSchema)
  return next
}
