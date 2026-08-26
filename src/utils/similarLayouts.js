export function templateRecordId(tpl) {
  return String(tpl?.id || tpl?.templateId || tpl?._id || '').trim()
}

export function templateLayoutId(tpl) {
  return String(tpl?.schema?.layout_id || tpl?.layoutId || tpl?.layout_id || '').trim()
}

export function templateContentType(tpl) {
  return String(tpl?.schema?.content_type || tpl?.contentType || tpl?.variant || '')
    .trim()
    .toLowerCase()
}

/** Tight visual family so a hero never ranks next to a process diagram. */
export function layoutFamily(layoutId, contentType) {
  const id = String(layoutId || '').toLowerCase()
  const ct = String(contentType || '').toLowerCase()

  if (
    ct === 'diagram' ||
    /^diagram_/.test(id) ||
    /process_step|process_flow|process_linear|funnel_|swot_|matrix_/.test(id)
  ) {
    return 'diagram'
  }
  if (ct === 'device_frames' || /^device_/.test(id)) return 'device'
  if (ct === 'chart' || ct === 'stat' || /chart_|donut_|metrics_/.test(id)) return 'chart'
  if (ct === 'timeline' || /^timeline_/.test(id)) return 'timeline'
  if (ct === 'team' || /team_|people_/.test(id)) return 'team'
  if (ct === 'quote' || /quote_/.test(id)) return 'quote'
  if (ct === 'pricing' || /pricing_/.test(id)) return 'pricing'
  if (ct === 'agenda' || /agenda_/.test(id)) return 'agenda'
  if (ct === 'closing' || /closing_|thank_you/.test(id)) return 'closing'
  if (ct === 'grid' || /^grid_/.test(id)) return 'grid'
  if (ct === 'title' || /title_|hero_|fullbleed|cover_/.test(id)) return 'title'
  if (ct === 'comparison' || /comparison_|pros_cons/.test(id)) return 'comparison'
  if (ct === 'bullet_list' || /bullet_/.test(id)) return 'bullets'
  if (
    ct === 'image+text' ||
    ct === 'image_text' ||
    /para_|split_.*image|section_.*image/.test(id)
  ) {
    return 'image_text'
  }
  return ct || 'other'
}

function normalizeSlotRole(role) {
  const r = String(role || '').toLowerCase()
  if (!r) return 'other'
  if (r === 'image' || r === 'background') return 'image'
  if (r === 'heading' || r === 'title' || r === 'headline') return 'heading'
  if (r === 'subheading' || r === 'subtitle' || r === 'tagline') return 'subheading'
  if (r === 'body' || r === 'paragraph' || r === 'text') return 'body'
  if (r === 'caption' || r === 'label') return 'caption'
  if (r === 'chart') return 'chart'
  if (r === 'table') return 'table'
  if (r === 'cta' || r === 'call_to_action') return 'cta'
  return r
}

function structureSignature(schema) {
  const counts = {
    image: 0,
    heading: 0,
    subheading: 0,
    body: 0,
    caption: 0,
    chart: 0,
    table: 0,
    cta: 0,
  }
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  for (const slot of slots) {
    const key = normalizeSlotRole(slot?.role)
    if (counts[key] != null) counts[key] += 1
  }
  return {
    total: slots.length,
    ...counts,
  }
}

function sameStructure(a, b) {
  if (!a || !b) return false
  // Match core author-visible structure only; ignore decorative/support slots.
  const keys = ['image', 'heading', 'subheading', 'body', 'chart', 'table']
  return keys.every((k) => Number(a[k] || 0) === Number(b[k] || 0))
}

function candidateSchema(tpl, layoutSchemaMap) {
  const layoutId = templateLayoutId(tpl)
  return tpl?.schema || (layoutId && layoutSchemaMap?.[layoutId]) || null
}

function scoreSimilarLayout(candidate, { currentLayoutId, currentFamily, currentSchema, layoutSchemaMap }) {
  const candLayoutId = templateLayoutId(candidate)
  if (!candLayoutId || candLayoutId === currentLayoutId) return -Infinity

  const schema = candidateSchema(candidate, layoutSchemaMap)
  const candFamily = layoutFamily(candLayoutId, templateContentType({ ...candidate, schema }))
  if (!currentFamily || candFamily !== currentFamily) return -Infinity

  const curSig = structureSignature(currentSchema)
  const candSig = structureSignature(schema)
  if (!sameStructure(curSig, candSig)) return -Infinity

  let score = 40
  // Exact structure already matches; nudge stable ordering with tiny tie-breakers.
  score += candSig.image * 0.01
  score += candSig.heading * 0.01

  if (candidate?.name || candidate?.label) score += 1
  return score
}

/**
 * Pick up to `limit` layout templates in the same family as the current slide.
 * Never pads with unrelated families (e.g. process next to hero).
 */
export function pickSimilarLayouts(slide, layoutTemplates = [], layoutSchemaMap = {}, limit = 3) {
  const list = Array.isArray(layoutTemplates) ? layoutTemplates : []
  if (!list.length || limit <= 0) return []

  const currentLayoutId = String(slide?.layoutId || slide?.layout_id || '').trim()
  const currentSchema =
    (currentLayoutId && layoutSchemaMap?.[currentLayoutId]) ||
    list.find((tpl) => templateLayoutId(tpl) === currentLayoutId)?.schema ||
    list.find((tpl) => templateRecordId(tpl) === currentLayoutId)?.schema ||
    null
  const currentCt = String(
    currentSchema?.content_type ||
      slide?.contentType ||
      slide?.content_type ||
      ''
  )
    .trim()
    .toLowerCase()
  const currentFamily = layoutFamily(currentLayoutId, currentCt)

  const ranked = list
    .map((tpl) => ({
      tpl,
      score: scoreSimilarLayout(tpl, {
        currentLayoutId,
        currentFamily,
        currentSchema,
        layoutSchemaMap,
      }),
    }))
    .filter((row) => Number.isFinite(row.score) && row.score > 0 && templateRecordId(row.tpl))
    .sort(
      (a, b) =>
        b.score - a.score || templateLayoutId(a.tpl).localeCompare(templateLayoutId(b.tpl))
    )

  const seen = new Set()
  const out = []
  for (const row of ranked) {
    const lid = templateLayoutId(row.tpl) || templateRecordId(row.tpl)
    if (!lid || seen.has(lid)) continue
    seen.add(lid)
    out.push(row.tpl)
    if (out.length >= limit) break
  }
  return out
}

export function findTemplateForSlideLayout(slide, layoutTemplates = []) {
  const currentLayoutId = String(slide?.layoutId || slide?.layout_id || '').trim()
  if (!currentLayoutId) return null
  const list = Array.isArray(layoutTemplates) ? layoutTemplates : []
  return (
    list.find((tpl) => templateLayoutId(tpl) === currentLayoutId) ||
    list.find((tpl) => templateRecordId(tpl) === currentLayoutId) ||
    null
  )
}
