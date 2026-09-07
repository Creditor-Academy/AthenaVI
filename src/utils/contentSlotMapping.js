/** Map slide content objects to per-slot text for canvas compile. */
import { normalizeChartContent } from './chartContentNormalize'
import { normalizeContentForLayout } from './contentContract'

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

export function buildContentBySlotIdFromSlideContent(rawContent = {}, schema = null) {
  const out = {}
  if (!rawContent || typeof rawContent !== 'object') return out

  const content = normalizeContentForLayout(rawContent, schema)
  const slots = Array.isArray(schema?.slots) ? schema.slots : []

  // Globals
  if (content.title) {
    out.HEADING = content.title
    out.MAIN_TITLE = content.title
    out.TITLE = content.title
    out.HEADING_L = content.title
  }
  if (content.subtitle) {
    out.SUBTITLE = content.subtitle
    out.SUBHEADING = content.subtitle
  }
  if (content.body) {
    out.BODY = content.body
    out.BODY_L = content.body
  }
  if (content.quote) {
    out.QUOTE = content.quote
    out.STATEMENT = content.quote
  }
  if (content.cta) {
    out.CTA = content.cta
  }
  if (content.contact) {
    if (typeof content.contact === 'string') out.CONTACT = content.contact
    else {
      out.CONTACT = [content.contact.email, content.contact.phone, content.contact.address]
        .filter(Boolean)
        .join(' · ')
    }
  }
  if (content.bullets && !content.body) {
     out.BODY = content.bullets.map(b => typeof b === 'string' ? b : String(b?.text || b?.label)).filter(Boolean).map(l => l.startsWith('•') ? l : `• ${l}`).join('\n')
  }

  // Strict mapping based on actual slots to avoid overflow
  for (const slot of slots) {
    const id = String(slot.id || '').toUpperCase()

    // Match column-like slots
    const colMatch = id.match(/^(?:CARD|COL|ROW|FEATURE|METRIC)_(\d+)_(TITLE|BODY|HEADING)$/i) || id.match(/^METRIC_(TITLE|BODY)_(\d+)$/i)
    if (colMatch && Array.isArray(content.columns)) {
      const idxStr = colMatch[1] === 'TITLE' || colMatch[1] === 'BODY' ? colMatch[2] : colMatch[1]
      const fieldStr = colMatch[1] === 'TITLE' || colMatch[1] === 'BODY' ? colMatch[1] : colMatch[2]
      
      const idx = parseInt(idxStr, 10) - 1
      const field = fieldStr.toUpperCase()
      const col = content.columns[idx]
      if (col) {
        if ((field === 'TITLE' || field === 'HEADING') && (col.title || col.heading || col.label)) out[slot.id] = col.title || col.heading || col.label
        if (field === 'BODY' && (col.body || col.text)) out[slot.id] = col.body || col.text
      }
    }

    const bodyMatch = id.match(/^BODY_(\d+)$/i)
    if (bodyMatch && Array.isArray(content.columns)) {
      const idx = parseInt(bodyMatch[1], 10) - 1
      const col = content.columns[idx]
      if (col && (col.body || col.text)) out[slot.id] = col.body || col.text
    }
    const labelMatch = id.match(/^IMAGE_(\d+)_LABEL$/i)
    if (labelMatch && Array.isArray(content.columns)) {
      const idx = parseInt(labelMatch[1], 10) - 1
      const col = content.columns[idx]
      if (col && (col.title || col.heading || col.label)) out[slot.id] = col.title || col.heading || col.label
    }

    // Match stats
    const statMatch = id.match(/^STAT_(\d+)_(VALUE|LABEL)$/i)
    if (statMatch && Array.isArray(content.stats)) {
      const idx = parseInt(statMatch[1], 10) - 1
      const field = statMatch[2].toUpperCase()
      const stat = content.stats[idx]
      if (stat) {
        if (field === 'VALUE' && stat.value) out[slot.id] = stat.value
        if (field === 'LABEL' && stat.label) out[slot.id] = stat.label
      }
    }

    // Match members
    const memberMatch = id.match(/^MEMBER_(\d+)_(NAME|ROLE|BIO|EMAIL)$/i)
    if (memberMatch && Array.isArray(content.members)) {
      const idx = parseInt(memberMatch[1], 10) - 1
      const field = memberMatch[2].toUpperCase()
      const member = content.members[idx]
      if (member) {
        if (field === 'NAME' && member.name) out[slot.id] = member.name
        if (field === 'ROLE' && (member.role || member.title)) out[slot.id] = member.role || member.title
        if (field === 'BIO' && (member.bio || member.description)) out[slot.id] = member.bio || member.description
        if (field === 'EMAIL' && member.email) out[slot.id] = member.email
      }
    }

    // Match timeline
    const mileMatch = id.match(/^MILESTONE_(\d+)_(LABEL|DETAIL)$/i)
    if (mileMatch && Array.isArray(content.timeline)) {
      const idx = parseInt(mileMatch[1], 10) - 1
      const field = mileMatch[2].toUpperCase()
      const item = content.timeline[idx]
      if (item) {
        if (field === 'LABEL' && item.label) out[slot.id] = item.label
        if (field === 'DETAIL' && item.detail) out[slot.id] = item.detail
      }
    }
    const legacyMileMatch = id.match(/^MILESTONE_(\d+)$/i)
    if (legacyMileMatch && Array.isArray(content.timeline)) {
      const idx = parseInt(legacyMileMatch[1], 10) - 1
      const item = content.timeline[idx]
      if (item) {
        out[slot.id] = item.label && item.detail ? `${item.label}\n${item.detail}` : item.label || item.detail
      }
    }

    // Match diagrams
    const qMatch = id.match(/^Q(\d+)_(TITLE|BODY)$/i) || id.match(/^(?:FUNNEL|STEP)_(\d+)_(TITLE|BODY)$/i)
    if (qMatch) {
      const idx = parseInt(qMatch[1], 10) - 1
      const field = qMatch[2].toUpperCase()
      const cells = content.diagram?.cells || content.cells || content.quadrants || content.steps || content.funnel
      if (Array.isArray(cells)) {
        const cell = cells[idx]
        if (cell) {
          if (field === 'TITLE' && (cell.title || cell.label || cell.heading)) out[slot.id] = cell.title || cell.label || cell.heading
          if (field === 'BODY' && (cell.body || cell.text || cell.detail)) out[slot.id] = cell.body || cell.text || cell.detail
        }
      }
    }

    // Match bullets and items
    const bulletMatch = id.match(/^BULLET_(\d+)$/i)
    if (bulletMatch && Array.isArray(content.bullets)) {
      const idx = parseInt(bulletMatch[1], 10) - 1
      const b = content.bullets[idx]
      if (b) out[slot.id] = typeof b === 'string' ? b : String(b.text || b.label)
    }

    const itemMatch = id.match(/^ITEM_(\d+)$/i)
    if (itemMatch && Array.isArray(content.items)) {
      const idx = parseInt(itemMatch[1], 10) - 1
      const it = content.items[idx]
      if (it) out[slot.id] = typeof it === 'string' ? it : String(it.title || it.label || it.text)
    }

    // Match quotes
    const quoteMatch = id.match(/^QUOTE_(\d+)$/i)
    if (quoteMatch && Array.isArray(content.quotes)) {
      const idx = parseInt(quoteMatch[1], 10) - 1
      const q = content.quotes[idx]
      if (q) out[slot.id] = typeof q === 'string' ? q : String(q.text || q.quote)
    }
    
    // Match agenda
    const agendaHeadingMatch = id.match(/^AGENDA_COL_(\d+)_HEADING$/i)
    if (agendaHeadingMatch && Array.isArray(content.agenda?.columns)) {
      const idx = parseInt(agendaHeadingMatch[1], 10) - 1
      const col = content.agenda.columns[idx]
      if (col && (col.heading || col.title)) out[slot.id] = col.heading || col.title
    }
    
    const agendaItemMatch = id.match(/^AGENDA_COL_(\d+)_ITEM_(\d+)$/i)
    if (agendaItemMatch && Array.isArray(content.agenda?.columns)) {
      const colIdx = parseInt(agendaItemMatch[1], 10) - 1
      const itemIdx = parseInt(agendaItemMatch[2], 10) - 1
      const col = content.agenda.columns[colIdx]
      if (col && Array.isArray(col.items)) {
        const item = col.items[itemIdx]
        if (item) out[slot.id] = typeof item === 'string' ? item : String(item.text || '')
      }
    }
  }

  mapChartToSlots(content, schema, out)

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
