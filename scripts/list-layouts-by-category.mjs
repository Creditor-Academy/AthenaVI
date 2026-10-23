#!/usr/bin/env node
import ALL from '../src/utils/deckLayoutCatalogs.js'
import { pickSimilarLayouts, templateLayoutId } from '../src/utils/similarLayouts.js'

const CATEGORIES = [
  { id: 'simple_slides', label: 'Simple slides' },
  { id: 'grid', label: 'Grid' },
  { id: 'charts_and_data', label: 'Charts and data' },
  { id: 'timeline_and_plans', label: 'Timeline and project plans' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'people_and_team', label: 'People and team' },
  { id: 'quotes_and_testimonials', label: 'Quotes and testimonial' },
  { id: 'device_frames', label: 'Device frames' },
  { id: 'diagrams', label: 'Diagrams' },
  { id: 'closing', label: 'Closing' },
]

function layoutCategoryId(schema) {
  const ct = String(schema?.content_type || '').toLowerCase()
  const layoutId = String(schema?.layout_id || '').toLowerCase()
  if (ct === 'grid') return 'grid'
  if (ct === 'chart' || ct === 'stat') return 'charts_and_data'
  if (ct === 'timeline') return 'timeline_and_plans'
  if (ct === 'pricing' || layoutId.includes('pricing')) return 'pricing'
  if (ct === 'agenda') return 'agenda'
  if (ct === 'team') return 'people_and_team'
  if (ct === 'quote') return 'quotes_and_testimonials'
  if (ct === 'device_frames' || layoutId.startsWith('device_')) return 'device_frames'
  if (ct === 'diagram' || layoutId.startsWith('diagram_')) return 'diagrams'
  if (ct === 'closing') return 'closing'
  if (ct === 'comparison' || ct === 'pros_cons') return 'simple_slides'
  if (['title', 'bullet_list', 'section_divider', 'image+text', 'image_text'].includes(ct)) {
    return 'simple_slides'
  }
  return 'simple_slides'
}

const layoutSchemaMap = ALL
const templates = Object.entries(ALL).map(([layoutId, schema]) => ({
  id: layoutId,
  schema: { ...schema, layout_id: schema.layout_id || layoutId },
  contentType: schema.content_type,
}))

const byCat = Object.fromEntries(CATEGORIES.map((c) => [c.id, []]))

for (const [layoutId, schema] of Object.entries(ALL)) {
  const cat = layoutCategoryId(schema)
  const slide = { layoutId, layout_id: layoutId }
  const similar = pickSimilarLayouts(slide, templates, layoutSchemaMap, 2)
  const simIds = similar.map((t) => templateLayoutId(t)).filter(Boolean)
  byCat[cat]?.push({ layoutId, contentType: schema.content_type, similar: simIds })
}

for (const cat of CATEGORIES) {
  const rows = (byCat[cat.id] || []).sort((a, b) => a.layoutId.localeCompare(b.layoutId))
  console.log(`### ${cat.label} (${rows.length})`)
  for (const r of rows) {
    const sim = r.similar.length ? r.similar.join(', ') : '(none)'
    console.log(`- ${r.layoutId} [${r.contentType}] -> ${sim}`)
  }
  console.log('')
}
console.log('TOTAL', Object.keys(ALL).length)
