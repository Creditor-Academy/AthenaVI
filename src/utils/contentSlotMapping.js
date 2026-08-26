/** Map slide content objects to per-slot text for canvas compile. */
import { normalizeChartContent } from './chartContentNormalize'

function columnAt(content, index) {
  const cols = content?.columns
  if (!Array.isArray(cols)) return null
  return cols[index] || null
}

function statAt(content, index) {
  const stats = content?.stats
  if (!Array.isArray(stats)) return null
  return stats[index] || null
}

function chartDatasetAt(content, index) {
  if (!content || typeof content !== 'object') return null
  if (Array.isArray(content.charts) && content.charts[index]) return content.charts[index]
  if (index === 0 && content.chart) return content.chart
  if (index === 1 && content.chart2) return content.chart2
  return null
}

function buildChartPayload(chart, slot, schema) {
  const layoutId = String(schema?.layout_id || '').toLowerCase()
  const slotId = String(slot?.id || '').toUpperCase()
  let chartType = chart.type || chart.chartType || slot?.chartType || slot?.chart_type
  if (!chartType) {
    if (/^DONUT/.test(slotId) || /donut|pie/.test(layoutId)) chartType = 'donut'
    else if (/line|exponential|area/.test(layoutId) || /^LINE_/.test(slotId)) chartType = 'line'
    else chartType = 'column-grouped'
  }
  return normalizeChartContent(
    {
      chartType,
      labels: chart.labels || [],
      series: Array.isArray(chart.series)
        ? chart.series
        : [{ name: 'Series', values: chart.series?.[0]?.values || chart.data || chart.values || [] }],
      values: chart.series?.[0]?.values || chart.data || chart.values || [],
    },
    {}
  )
}

function mapChartToSlots(content, schema, out) {
  const chart = content?.chart
  if (!chart || typeof chart !== 'object') return
  const chartSlots = (schema?.slots || []).filter((s) => String(s.role || '').toLowerCase() === 'chart')
  if (!chartSlots.length) {
    out.MAIN_CHART__chart = buildChartPayload(chart, null, schema)
    return
  }

  chartSlots.forEach((slot) => {
    const slotId = String(slot.id || '').toUpperCase()
    const chartMatch = slotId.match(/^CHART_(\d+)$/)
    let chartObj = chart
    if (chartMatch) {
      chartObj = chartDatasetAt(content, Number(chartMatch[1]) - 1)
    }
    if (!chartObj) return
    out[`${slot.id}__chart`] = buildChartPayload(chartObj, slot, schema)
  })
}

export function buildContentBySlotIdFromSlideContent(content = {}, schema = null) {
  const out = {}
  if (!content || typeof content !== 'object') return out

  const title = content.title != null ? String(content.title).trim() : ''
  const subtitle = content.subtitle != null ? String(content.subtitle).trim() : ''
  const body = content.body != null ? String(content.body).trim() : ''
  const quote = content.quote != null ? String(content.quote).trim() : ''
  const summary = content.summary != null ? String(content.summary).trim() : ''
  const ctaText = content.cta || content.callToAction

  if (title) {
    out.HEADING = title
    out.TITLE = title
    out.MAIN_TITLE = title
  }
  if (subtitle) out.SUBTITLE = subtitle
  else if (summary) out.SUBTITLE = summary.split(/[.!?]/)[0]?.trim() || summary
  if (body) out.BODY = body
  if (quote) out.QUOTE = quote
  if (ctaText) out.CTA = String(ctaText).trim()
  if (!out.BODY && summary) out.BODY = summary
  if (content.contact) {
    if (typeof content.contact === 'string') out.CONTACT = content.contact
    else {
      const parts = [content.contact.email, content.contact.phone, content.contact.address]
        .map((part) => (part != null ? String(part).trim() : ''))
        .filter(Boolean)
      if (parts.length) out.CONTACT = parts.join(' · ')
    }
  }

  const bullets = Array.isArray(content.bullets) ? content.bullets : []
  if (bullets.length) {
    out.BULLETS = bullets
      .map((item) => (typeof item === 'string' ? item : String(item?.text ?? item?.label ?? '')))
      .filter(Boolean)
      .map((line) => (String(line).startsWith('•') ? String(line) : `• ${line}`))
      .join('\n')
  }
  bullets.slice(0, 8).forEach((item, i) => {
    const text = typeof item === 'string' ? item : String(item?.text ?? item?.label ?? '')
    out[`BULLET_${i + 1}`] = text
  })
  if (!out.BODY && bullets.length) out.BODY = out.BULLETS

  const columns = Array.isArray(content.columns) ? content.columns : []
  const slideTitleLower = String(content.title || '').trim().toLowerCase()
  const seenColTitles = new Set()
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  const hasDedicatedTitles = slots.some((s) =>
    /^(card|col|row|feature)_\d+_title$/i.test(String(s.id || ''))
  )
  columns.slice(0, 6).forEach((col, i) => {
    const n = i + 1
    let colTitle = String(col?.title ?? col?.heading ?? col?.label ?? '').trim()
    const colBody = String(col?.body ?? col?.text ?? '').trim()
    const titleLower = colTitle.toLowerCase()
    if (!colTitle || titleLower === slideTitleLower || seenColTitles.has(titleLower)) {
      const words = colBody.split(/\s+/).filter(Boolean).slice(0, 4).join(' ')
      const wordsLower = words.toLowerCase()
      colTitle =
        words && wordsLower !== slideTitleLower && !seenColTitles.has(wordsLower)
          ? words
          : `Aspect ${n}`
    }
    seenColTitles.add(colTitle.toLowerCase())
    const bulletText =
      hasDedicatedTitles
        ? colBody || colTitle
        : colTitle && colBody
          ? `${colTitle}\n${colBody}`
          : colBody || colTitle
    out[`CARD_${n}_TITLE`] = colTitle
    out[`CARD_${n}_BODY`] = colBody
    out[`COL_${n}_TITLE`] = colTitle
    out[`COL_${n}_BODY`] = colBody
    out[`ROW_${n}_TITLE`] = colTitle
    out[`ROW_${n}_BODY`] = colBody
    out[`BODY_${n}`] = colBody || (hasDedicatedTitles ? '' : colTitle)
    out[`METRIC_TITLE_${n}`] = colTitle
    out[`METRIC_BODY_${n}`] = colBody
    if (colTitle) out[`IMAGE_${n}_LABEL`] = colTitle
    if (bulletText) out[`BULLET_${n}`] = bulletText
  })

  if (statAt(content, 0)) {
    out.STAT_1_VALUE = String(statAt(content, 0).value ?? '')
    out.STAT_1_LABEL = String(statAt(content, 0).label ?? '')
  }
  if (statAt(content, 1)) {
    out.STAT_2_VALUE = String(statAt(content, 1).value ?? '')
    out.STAT_2_LABEL = String(statAt(content, 1).label ?? '')
  }

  if (columnAt(content, 0) && !out.METRIC_TITLE_1) {
    out.METRIC_TITLE_1 = String(columnAt(content, 0).title ?? columnAt(content, 0).heading ?? '')
    out.METRIC_BODY_1 = String(columnAt(content, 0).body ?? columnAt(content, 0).text ?? '')
  }
  if (columnAt(content, 1) && !out.METRIC_TITLE_2) {
    out.METRIC_TITLE_2 = String(columnAt(content, 1).title ?? columnAt(content, 1).heading ?? '')
    out.METRIC_BODY_2 = String(columnAt(content, 1).body ?? columnAt(content, 1).text ?? '')
  }
  if (columnAt(content, 2) && !out.METRIC_TITLE_3) {
    out.METRIC_TITLE_3 = String(columnAt(content, 2).title ?? columnAt(content, 2).heading ?? '')
    out.METRIC_BODY_3 = String(columnAt(content, 2).body ?? columnAt(content, 2).text ?? '')
  }

  const agendaCols = content.agenda?.columns
  if (Array.isArray(agendaCols)) {
    agendaCols.slice(0, 3).forEach((col, i) => {
      const n = i + 1
      out[`AGENDA_COL_${n}_HEADING`] = String(col?.heading ?? col?.title ?? '')
      const items = Array.isArray(col?.items) ? col.items : []
      items.slice(0, 4).forEach((item, j) => {
        out[`AGENDA_COL_${n}_ITEM_${j + 1}`] = typeof item === 'string' ? item : String(item?.text ?? '')
      })
    })
  }

  mapChartToSlots(content, schema, out)

  const timelineItems = Array.isArray(content.timeline)
    ? content.timeline
    : Array.isArray(content.milestones)
      ? content.milestones
      : Array.isArray(content.events)
        ? content.events
        : []
  timelineItems.slice(0, 6).forEach((item, i) => {
    const n = i + 1
    const label =
      typeof item === 'string'
        ? item.trim()
        : String(item?.label ?? item?.year ?? item?.date ?? item?.period ?? item?.title ?? '').trim()
    const detail =
      typeof item === 'string'
        ? ''
        : String(item?.detail ?? item?.body ?? item?.text ?? item?.description ?? '').trim()
    out[`milestone_${n}_label`] = label
    out[`milestone_${n}_detail`] = detail
    out[`milestone_${n}`] = label && detail ? `${label}\n${detail}` : label || detail
  })

  const diagramCells =
    content.diagram?.cells ||
    content.cells ||
    content.quadrants ||
    content.steps ||
    content.funnel ||
    []
  if (Array.isArray(diagramCells)) {
    diagramCells.slice(0, 6).forEach((cell, i) => {
      const n = i + 1
      const cellTitle = String(cell?.title ?? cell?.label ?? cell?.heading ?? '').trim()
      const cellBody = String(cell?.body ?? cell?.text ?? cell?.detail ?? '').trim()
      out[`Q${n}_TITLE`] = cellTitle
      out[`Q${n}_BODY`] = cellBody
      out[`funnel_${n}_title`] = cellTitle
      out[`funnel_${n}_body`] = cellBody
      out[`step_${n}_title`] = cellTitle
      out[`step_${n}_body`] = cellBody
    })
  }

  const items = Array.isArray(content.items) ? content.items : []
  items.slice(0, 8).forEach((item, i) => {
    const n = i + 1
    const text =
      typeof item === 'string'
        ? item.trim()
        : String(item?.title ?? item?.heading ?? item?.label ?? item?.body ?? item?.text ?? '').trim()
    if (text) out[`ITEM_${n}`] = text
  })

  const left = content.left && typeof content.left === 'object' ? content.left : null
  const right = content.right && typeof content.right === 'object' ? content.right : null
  if (left) {
    out.LEFT_TITLE = String(left.title ?? left.heading ?? '').trim()
    out.LEFT_BODY = String(left.body ?? left.text ?? '').trim()
  }
  if (right) {
    out.RIGHT_TITLE = String(right.title ?? right.heading ?? '').trim()
    out.RIGHT_BODY = String(right.body ?? right.text ?? '').trim()
  }

  const slotImageUrls = content.slotImageUrls || {}
  for (const [slotId, url] of Object.entries(slotImageUrls)) {
    if (url) out[`${slotId}__url`] = url
  }
  const imageSlots = (schema?.slots || []).filter((s) => String(s.role || '').toLowerCase() === 'image')
  const galleryImageSlots = imageSlots.filter((s) => /^IMAGE_\d+$/i.test(String(s.id || '')))
  if (Array.isArray(content.imageUrls)) {
    const targets = galleryImageSlots.length ? galleryImageSlots : imageSlots
    targets.forEach((slot, i) => {
      if (content.imageUrls[i] && !out[`${slot.id}__url`]) out[`${slot.id}__url`] = content.imageUrls[i]
    })
  }
  const heroUrl =
    content.imageRef?.url ||
    content.imageRef?.src ||
    content.imageUrl ||
    (Array.isArray(content.imageUrls) ? content.imageUrls[0] : null)
  if (heroUrl && imageSlots.length === 1 && !out[`${imageSlots[0].id}__url`]) {
    out[`${imageSlots[0].id}__url`] = heroUrl
  } else if (heroUrl) {
    for (const slot of imageSlots) {
      const id = String(slot.id || '').toUpperCase()
      if ((id === 'HERO_IMAGE' || id === 'BACKGROUND_IMAGE') && !out[`${slot.id}__url`]) {
        out[`${slot.id}__url`] = heroUrl
      }
    }
  }

  return out
}

function isUsableMappedValue(value) {
  if (value == null || value === '') return false
  if (typeof value === 'string') {
    const t = value.trim()
    if (!t) return false
    if (/^double-?click to edit$/i.test(t)) return false
  }
  return true
}

export function mergeContentBySlotId(...maps) {
  const out = {}
  for (const map of maps) {
    if (!map || typeof map !== 'object') continue
    for (const [key, value] of Object.entries(map)) {
      if (!isUsableMappedValue(value)) continue
      if (isUsableMappedValue(out[key])) continue
      out[key] = value
    }
  }
  return out
}
