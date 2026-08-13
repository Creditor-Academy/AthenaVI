/** Map slide content objects to per-slot text for canvas compile. */

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

export function buildContentBySlotIdFromSlideContent(content = {}, schema = null) {
  const out = {}
  if (!content || typeof content !== 'object') return out

  const title = content.title != null ? String(content.title).trim() : ''
  const subtitle = content.subtitle != null ? String(content.subtitle).trim() : ''
  const body = content.body != null ? String(content.body).trim() : ''

  if (title) {
    out.HEADING = title
    out.TITLE = title
    out.MAIN_TITLE = title
  }
  if (subtitle) out.SUBTITLE = subtitle
  if (body) out.BODY = body

  const bullets = Array.isArray(content.bullets) ? content.bullets : []
  bullets.slice(0, 8).forEach((item, i) => {
    const text = typeof item === 'string' ? item : String(item?.text ?? item?.label ?? '')
    out[`BULLET_${i + 1}`] = text
  })

  if (statAt(content, 0)) {
    out.STAT_1_VALUE = String(statAt(content, 0).value ?? '')
    out.STAT_1_LABEL = String(statAt(content, 0).label ?? '')
  }
  if (statAt(content, 1)) {
    out.STAT_2_VALUE = String(statAt(content, 1).value ?? '')
    out.STAT_2_LABEL = String(statAt(content, 1).label ?? '')
  }

  if (columnAt(content, 0)) {
    out.METRIC_TITLE_1 = String(columnAt(content, 0).title ?? columnAt(content, 0).heading ?? '')
    out.METRIC_BODY_1 = String(columnAt(content, 0).body ?? columnAt(content, 0).text ?? '')
  }
  if (columnAt(content, 1)) {
    out.METRIC_TITLE_2 = String(columnAt(content, 1).title ?? columnAt(content, 1).heading ?? '')
    out.METRIC_BODY_2 = String(columnAt(content, 1).body ?? columnAt(content, 1).text ?? '')
  }
  if (columnAt(content, 2)) {
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

  const slotImageUrls = content.slotImageUrls || {}
  for (const [slotId, url] of Object.entries(slotImageUrls)) {
    if (url) out[`${slotId}__url`] = url
  }
  if (Array.isArray(content.imageUrls)) {
    const imageSlots = (schema?.slots || []).filter((s) => s.role === 'image' || String(s.id || '').includes('IMAGE'))
    imageSlots.forEach((slot, i) => {
      if (content.imageUrls[i]) out[`${slot.id}__url`] = content.imageUrls[i]
    })
  }

  return out
}

export function mergeContentBySlotId(...maps) {
  return Object.assign({}, ...maps.filter(Boolean))
}
