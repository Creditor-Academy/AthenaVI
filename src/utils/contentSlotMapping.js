/** Map slide content objects to per-slot text for canvas compile. */
import { normalizeChartContent } from './chartContentNormalize.js'
import {
  normalizeContentForLayout,
  deriveContentContract,
  textForSlot,
  coerceSlotText,
  clampSlotText,
} from './contentContract.js'

const NON_TEXT_SLOT_ROLES = new Set(['image', 'chart', 'decoration', 'background', 'table'])

function applyContentAliases(content, out) {
  if (content.title) {
    out.HEADING = out.HEADING || content.title
    out.MAIN_TITLE = out.MAIN_TITLE || content.title
    out.TITLE = out.TITLE || content.title
    out.HEADING_L = out.HEADING_L || content.title
  }
  if (content.subtitle) {
    out.SUBTITLE = out.SUBTITLE || content.subtitle
    out.SUBHEADING = out.SUBHEADING || content.subtitle
  }
  if (content.body) {
    out.BODY = out.BODY || content.body
    out.BODY_L = out.BODY_L || content.body
  }
  if (content.quote) {
    out.QUOTE = out.QUOTE || content.quote
    out.STATEMENT = out.STATEMENT || content.quote
  }
  if (content.cta) out.CTA = out.CTA || content.cta
  if (content.contact) {
    if (typeof content.contact === 'string') out.CONTACT = out.CONTACT || content.contact
    else {
      out.CONTACT =
        out.CONTACT ||
        [content.contact.email, content.contact.phone, content.contact.address].filter(Boolean).join(' · ')
    }
  }
  if (content.bullets && !content.body && !out.BODY) {
    out.BODY = content.bullets
      .map((b) => (typeof b === 'string' ? b : String(b?.text || b?.label)))
      .filter(Boolean)
      .map((l) => (l.startsWith('•') ? l : `• ${l}`))
      .join('\n')
  }
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

export function buildContentBySlotIdFromSlideContent(rawContent = {}, schema = null) {
  const out = {}
  if (!rawContent || typeof rawContent !== 'object') return out

  const content = normalizeContentForLayout(rawContent, schema)
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  const contract = deriveContentContract(schema)

  for (const slot of slots) {
    if (!slot?.id) continue
    const role = String(slot.role || '').toLowerCase()
    if (NON_TEXT_SLOT_ROLES.has(role)) continue
    const raw = textForSlot(slot.id, content, schema)
    const text = clampSlotText(coerceSlotText(raw), contract.slots[slot.id])
    if (text) out[slot.id] = text
  }

  applyContentAliases(content, out)
  mapChartToSlots(content, schema, out)

  const members = Array.isArray(content.members)
    ? content.members
    : Array.isArray(content.team)
      ? content.team
      : Array.isArray(content.people)
        ? content.people
        : []
  members.slice(0, 8).forEach((member, i) => {
    const n = i + 1
    if (!member) return
    if (typeof member === 'string') {
      const name = member.trim()
      if (name) out[`MEMBER_${n}_NAME`] = name
      return
    }
    const name = String(member.name ?? '').trim()
    const role = String(member.role ?? member.title ?? '').trim()
    const email = String(member.email ?? '').trim()
    const bio = String(member.bio ?? member.body ?? member.description ?? '').trim()
    if (name) {
      out[`MEMBER_${n}_NAME`] = name
      out[`MEMBER_${n}_name`] = name
    }
    if (role) {
      out[`MEMBER_${n}_ROLE`] = role
      out[`MEMBER_${n}_TITLE`] = role
    }
    if (email) out[`MEMBER_${n}_EMAIL`] = email
    if (bio) {
      out[`MEMBER_${n}_BIO`] = bio
      out[`MEMBER_${n}_BODY`] = bio
      out[`MEMBER_${n}_DESC`] = bio
    }
  })

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
    out[`milestone_${n}_title`] = typeof item === 'string'
      ? ''
      : String(item?.title ?? item?.phase ?? item?.heading ?? item?.name ?? item?.option ?? '').trim()
    out[`milestone_${n}_card`] = typeof item === 'string'
      ? ''
      : String(item?.card ?? item?.summary ?? item?.blurb ?? '').trim()
    out[`milestone_${n}_num`] = typeof item === 'string'
      ? ''
      : String(item?.year ?? item?.num ?? '').trim()
    out[`milestone_${n}_detail`] = detail
    out[`milestone_${n}_foot`] = typeof item === 'string'
      ? ''
      : String(item?.focus ?? item?.caption ?? item?.footer ?? '').trim()
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

  if (content.table && typeof content.table === 'object') {
    const { headers = [], rows = [], total, totals } = content.table
    const isCards = /table_single_cards_v1$/i.test(String(schema?.layout_id || ''))
    headers.slice(0, 7).forEach((h, i) => {
      const text = typeof h === 'string' ? h.trim() : String(h?.title || h?.name || '').trim()
      if (text) {
        if (isCards) {
          out[`COL_${i}_HEADER`] = text
        } else {
          out[`COL_${i + 1}_HEADER`] = text
        }
      }
    })
    const isSide = /table_with_description_side_v1$/i.test(String(schema?.layout_id || ''))
    rows.slice(0, 6).forEach((row, r) => {
      if (isSide) {
        const cells = Array.isArray(row) ? row : (Array.isArray(row?.values) ? row.values : (row?.cells || []))
        cells.slice(0, 4).forEach((cell, c) => {
          if (cell != null) out[`CELL_${r + 1}_${c + 1}`] = String(cell).trim()
        })
      } else if (Array.isArray(row)) {
        if (row[0]) out[`ROW_${r + 1}_LABEL`] = String(row[0]).trim()
        row.slice(1, 7).forEach((cell, c) => {
          if (cell != null) out[`CELL_${r + 1}_${c + 1}`] = String(cell).trim()
        })
      } else if (row && typeof row === 'object') {
        const label = row.label || row.title || row.name || row[0]
        if (label) out[`ROW_${r + 1}_LABEL`] = String(label).trim()
        const vals = Array.isArray(row.values) ? row.values : (row.cells || [])
        vals.slice(0, 6).forEach((val, c) => {
          if (val != null) out[`CELL_${r + 1}_${c + 1}`] = String(val).trim()
        })
      }
    })
    const tot = total || totals
    if (Array.isArray(tot)) {
      if (tot[0]) out.TOTAL_LABEL = String(tot[0]).trim()
      tot.slice(1, 7).forEach((val, i) => {
        if (val != null) out[`TOTAL_${i + 1}`] = String(val).trim()
      })
    }
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

  // Diagnostic logging
  if (import.meta?.env?.DEV) {
    console.log('[slotBindings] Strict mapping complete for schema:', schema?.layout_id, {
      rawContent,
      normalizedContent: content,
      out
    })
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
