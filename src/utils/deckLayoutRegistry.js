/**
 * Registry of deck layout schemas for pack slide previews.
 * Merged via deckLayoutCatalogs.js (129 layouts) — keep in sync with export-seed-layouts.mjs.
 */

import ALL_LAYOUT_CATALOGS from './deckLayoutCatalogs.js'

function layoutSchemaHasPreviewCanvas(schema) {
  const doc = schema?.preview?.canvasElements || schema?.elements
  return Boolean(Array.isArray(doc?.elements) && doc.elements.length)
}

/** Full DECK_LAYOUT v2 catalog */
const REGISTRY = {
  ...ALL_LAYOUT_CATALOGS,
}

const PLACEHOLDER_SLOT_MAP = {
  MAIN_TITLE: ['title'],
  HEADING: ['title'],
  TITLE_META: ['meta'],
  DATE_LINE: ['date'],
  SUBTITLE: ['subtitle'],
  SUBHEADLINE: ['subheadline'],
  FOOTNOTE: ['footnote'],
  CTA: ['cta'],
  CONTACT: ['contact'],
  BODY: ['body'],
  STATEMENT: ['statement', 'quote'],
  LOGO: ['logo'],
}

function slotPlaceholderText(slots, id) {
  const slot = (slots || []).find((s) => s.id === id)
  return slot?.placeholder_text ? String(slot.placeholder_text) : ''
}

function roleToPreviewVariant(role, slotId) {
  const id = String(slotId || '').toUpperCase()
  if (id.includes('LOGO') || role === 'decoration') return 'logo'
  if (role === 'heading' || role === 'quote') return 'title'
  if (role === 'subheading') return 'subheading'
  if (role === 'caption' || role === 'eyebrow') return 'caption'
  if (role === 'stat') return 'stat'
  return 'body'
}

function buildPreviewSlotsFromLayoutSlots(slots, existing = {}) {
  const out = { ...existing }
  for (const slot of slots || []) {
    if (!slot?.id) continue
    const current = out[slot.id] || {}
    if (current.text != null && String(current.text).trim()) {
      out[slot.id] = current
      continue
    }
    const text = slot.placeholder_text
    if (!text) continue
    out[slot.id] = {
      ...current,
      text: String(text),
      variant: current.variant || roleToPreviewVariant(slot.role, slot.id),
      bold: current.bold ?? (slot.role === 'heading' || slot.role === 'quote'),
      uppercase: current.uppercase ?? false,
    }
  }
  return out
}

function buildStatsFromLayoutSlots(slots) {
  const stats = []
  for (let i = 1; i <= 6; i += 1) {
    const value = slotPlaceholderText(slots, `STAT_${i}_VALUE`) || slotPlaceholderText(slots, `STAT_${i}`)
    const label = slotPlaceholderText(slots, `STAT_${i}_LABEL`)
    if (value || label) {
      stats.push({ value: value || '—', label: label || 'Metric label' })
    }
  }
  return stats.length ? stats : null
}

function buildComparisonColumnsFromSlots(slots, preview) {
  if (Array.isArray(preview?.columns) && preview.columns.length) return preview.columns
  const planColumns = buildPlansFromLayoutSlots(slots)
  if (planColumns?.length) return planColumns
  const pros = slotPlaceholderText(slots, 'PROS_LIST')
  const cons = slotPlaceholderText(slots, 'CONS_LIST')
  if (pros || cons) {
    return [
      {
        label: slotPlaceholderText(slots, 'PROS_LABEL') || 'Pros',
        items: pros ? pros.split('\n').filter(Boolean) : ['Benefit one', 'Benefit two'],
      },
      {
        label: slotPlaceholderText(slots, 'CONS_LABEL') || 'Cons',
        items: cons ? cons.split('\n').filter(Boolean) : ['Limitation one', 'Limitation two'],
      },
    ]
  }
  const labels = ['COL_1_LABEL', 'COL_2_LABEL', 'COL_3_LABEL']
    .map((id) => slotPlaceholderText(slots, id))
    .filter(Boolean)
  if (labels.length) {
    return labels.slice(0, 3).map((label, index) => ({
      label,
      items: [`Column ${index + 1} point`],
    }))
  }
  return null
}

function buildPlansFromLayoutSlots(slots) {
  const plans = []
  for (let i = 1; i <= 4; i += 1) {
    const label = slotPlaceholderText(slots, `PLAN_${i}_LABEL`)
    const price = slotPlaceholderText(slots, `PLAN_${i}_PRICE`)
    const body = slotPlaceholderText(slots, `PLAN_${i}_BODY`)
    if (label || price || body) {
      plans.push({
        label: label || `Plan ${i}`,
        price: price || '',
        items: body ? body.split('\n').filter(Boolean) : ['Feature one', 'Feature two'],
      })
    }
  }
  return plans.length ? plans : null
}

function buildMembersFromLayoutSlots(slots, max = 6) {
  const members = []
  for (let i = 1; i <= max; i += 1) {
    const name = slotPlaceholderText(slots, `MEMBER_${i}_NAME`)
    const role = slotPlaceholderText(slots, `MEMBER_${i}_ROLE`)
    const email = slotPlaceholderText(slots, `MEMBER_${i}_EMAIL`)
    if (name || role || email) {
      members.push({
        name: name || `Member ${i}`,
        role: role || 'Role',
        email: email || 'email@example.com',
      })
    }
  }
  return members.length ? members : null
}

function buildAgendaColumnsFromSlots(slots) {
  const columns = []
  for (let col = 1; col <= 3; col += 1) {
    const heading = slotPlaceholderText(slots, `AGENDA_COL_${col}_HEADING`)
    const items = []
    for (let item = 1; item <= 4; item += 1) {
      const text = slotPlaceholderText(slots, `AGENDA_COL_${col}_ITEM_${item}`)
      if (text) items.push(text)
    }
    if (heading || items.length) {
      columns.push({
        heading: heading || `Section ${col}`,
        items: items.length ? items : [`${col}.1 Topic`, `${col}.2 Discussion`],
      })
    }
  }
  return columns.length ? columns : null
}

/** Known layout_id → polished preview mode (overrides stale preview.mode in saved schemas). */
const LAYOUT_PREVIEW_MODES = {
  statement_left_v1: 'quote_attribution',
  statement_large_v1: 'quote_attribution',
  eight_short_texts_image_v1: 'eight_short_texts',
  two_cards_image_text_v1: 'two_image_columns',
  centered_text_cta_v1: 'closing_cta',
  para_image_cta_v1: 'closing_cta',
  intro_three_para_icons_v1: 'intro_three_para_icons',
  // Grids
  grid_bento_three_v1: 'grid_bento_three',
  grid_bento_four_v1: 'grid_bento_four',
  grid_six_images_v1: 'grid_six_images',
  grid_text_image_cards_v1: 'grid_text_image_cards',
  grid_three_images_text_v1: 'grid_three_images_text',
  grid_images_text_cards_v1: 'grid_images_text_cards',
  grid_insights_chart_v1: 'grid_insights_chart',
  grid_metrics_mobile_v1: 'grid_metrics_mobile',
  grid_metrics_masonry_v1: 'grid_metrics_masonry',
  grid_device_mockups_v1: 'grid_device_mockups',
  // Charts & data
  chart_single_v1: 'chart_full_width',
  chart_exponential_desc_v1: 'chart_split',
  chart_with_description_v1: 'chart_split',
  chart_two_v1: 'chart_dual',
  chart_three_v1: 'chart_triple',
  chart_two_cards_v1: 'chart_card_grid',
  chart_three_context_v1: 'chart_triple_context',
  chart_donut_context_v1: 'chart_donut_split',
  chart_three_donut_v1: 'chart_donut_row',
  table_single_v1: 'table_preview',
  table_with_description_v1: 'table_with_desc',
  table_two_desc_v1: 'table_dual',
  table_two_same_header_v1: 'table_dual_shared_header',
  process_linear_v1: 'process_flow',
  timeline_horizontal_v1: 'timeline_horizontal',
  timeline_milestones_v1: 'timeline_horizontal',
  timeline_milestones_image_v1: 'timeline_milestones_image',
  timeline_vertical_v1: 'timeline_vertical',
  timeline_roadmap_v1: 'timeline_roadmap',
  timeline_process_steps_v1: 'timeline_process_steps',
  comparison_side_by_side_v1: 'comparison_columns',
  comparison_pros_cons_v1: 'comparison_columns',
  comparison_table_v1: 'comparison_columns',
  comparison_before_after_v1: 'comparison_columns',
  bullet_list_cards_v1: 'two_image_columns',
  section_divider_numbered_v1: 'section_divider',
  section_divider_band_v1: 'section_divider',
  section_divider_split_v1: 'section_divider',
  bullet_list_dense_v1: 'bullet_list',
  bullet_list_numbered_v1: 'bullet_list',
  bullet_list_two_column_v1: 'comparison_columns',
  text_only_centered_v1: 'bullet_list',
  text_two_column_v1: 'comparison_columns',
  title_minimal_v1: 'title_centered',
  title_statement_v1: 'title_centered',
  closing_thank_you_v1: 'closing_cta',
  closing_contact_cta_v1: 'closing_cta',
  agenda_numbered_v1: 'agenda_numbered',
  agenda_minimal_v1: 'agenda_minimal',
  agenda_two_column_v1: 'agenda_two_columns',
  agenda_timeline_preview_v1: 'timeline_horizontal',
  quote_portrait_v1: 'quote_attribution',
  quote_testimonial_card_v1: 'quote_attribution',
  quote_attribution_v1: 'quote_attribution',
  quote_grid_v1: 'quote_grid',
  team_featured_lead_v1: 'team_featured_lead',
  team_speaker_bio_v1: 'team_speaker_bio',
  team_org_simple_v1: 'team_org_simple',
  logo_wall_v1: 'grid_six_images',
  logo_partner_strip_v1: 'grid_three_images',
  diagram_swot_v1: 'diagram_swot',
  diagram_funnel_v1: 'diagram_funnel',
  diagram_matrix_v1: 'diagram_matrix',
  diagram_process_steps_v1: 'diagram_process_steps',
  diagram_cycle_v1: 'diagram_cycle',
  diagram_venn_v1: 'diagram_venn',
  diagram_pyramid_v1: 'diagram_pyramid',
  metric_single_v1: 'stat_hero',
  metric_two_v1: 'stat_row',
  metric_three_v1: 'stat_row',
  metric_four_v1: 'stat_row',
  metric_five_v1: 'stat_row',
  metric_six_para_v1: 'stat_six_para',
  metric_three_vertical_v1: 'stat_vertical',
  // Pricing
  pricing_three_plans_v1: 'pricing_plans',
  pricing_three_highlight_v1: 'pricing_plans',
  pricing_four_plans_v1: 'pricing_plans',
  pricing_four_para_v1: 'pricing_four_para',
  pricing_comparison_table_v1: 'pricing_comparison_table',
  // Agenda
  agenda_three_columns_v1: 'agenda_three_columns',
  agenda_three_columns_hero_v1: 'agenda_three_columns_hero',
  // People & team
  contact_left_image_v1: 'contact_split_left',
  contact_right_image_v1: 'contact_split_right',
  team_three_horizontal_v1: 'team_three_horizontal',
  team_three_vertical_v1: 'team_vertical_list',
  team_four_v1: 'team_grid_four',
  team_five_v1: 'team_grid_five',
  team_six_v1: 'team_grid_six',
  team_three_full_cards_v1: 'team_full_image_cards',
  team_by_department_v1: 'team_by_department',
  // Device frames
  device_phone_horizontal_v1: 'device_phone_horizontal',
  device_phone_vertical_split_v1: 'device_phone_vertical_split',
  device_phone_highlights_v1: 'device_phone_highlights',
  device_phone_triple_v1: 'device_phone_triple',
  device_multi_cluster_v1: 'device_multi_cluster',
  device_tablet_centered_v1: 'device_tablet_centered',
  device_tablet_split_v1: 'device_tablet_split',
  device_laptop_split_v1: 'device_laptop_split',
}

export function resolvePreviewMode(schema) {
  const layoutId = schema?.layout_id
  if (layoutId && LAYOUT_PREVIEW_MODES[layoutId]) return LAYOUT_PREVIEW_MODES[layoutId]
  if (schema?.preview?.mode) return schema.preview.mode
  return inferPreviewMode(schema)
}

/** Infer polished preview mode from content_type + slot roles when preview.mode is absent. */
export function inferPreviewMode(schema) {
  const ct = schema?.content_type
  const slots = schema?.slots || []
  const ids = slots.map((s) => String(s.id || ''))
  const roles = new Set(slots.map((s) => s.role))
  const layoutId = schema?.layout_id

  if (layoutId && LAYOUT_PREVIEW_MODES[layoutId]) return LAYOUT_PREVIEW_MODES[layoutId]

  if (ids.includes('ROW_1_ICON') && ids.includes('ROW_2_ICON') && ids.includes('ROW_3_ICON')) {
    return 'intro_three_para_icons'
  }
  if (ids.includes('BAR_CHART') && ids.includes('INSIGHT_ICON_1') && ids.includes('POINT_IMAGE')) {
    return 'grid_insights_chart'
  }
  if (ids.filter((id) => /^IMAGE_\d+$/.test(id)).length >= 6) return 'grid_six_images'
  if (ids.filter((id) => /^IMAGE_\d+$/.test(id)).length === 4 && ids.includes('IMAGE_4')) return 'grid_bento_four'
  if (ids.filter((id) => /^IMAGE_\d+$/.test(id)).length === 3 && !ids.includes('BODY_1') && !roles.has('body')) {
    return 'grid_bento_three'
  }
  if (ids.filter((id) => /^IMAGE_\d+$/.test(id)).length >= 3 && ids.includes('BODY_1')) return 'grid_three_images_text'
  if (ids.includes('DEVICE_R') || ids.includes('DEVICE_L_1')) return 'grid_device_mockups'
  if (ids.includes('DEVICE_IMAGE') && ct === 'grid') return 'grid_metrics_mobile'
  if (ids.some((id) => /^DONUT_\d+$/.test(id))) return 'chart_donut_row'
  if (ids.includes('DONUT_CHART')) return 'chart_donut_split'
  if (ids.filter((id) => /^CHART_\d+$/.test(id)).length >= 3) return 'chart_triple'
  if (ids.filter((id) => /^CHART_\d+$/.test(id)).length === 2) return 'chart_dual'
  if (ids.includes('TABLE_1') && ids.includes('TABLE_2')) return 'table_dual'
  if (roles.has('table')) return 'table_preview'
  if (ids.includes('STAT_VALUE') && !ids.includes('STAT_1_VALUE')) return 'stat_hero'
  if (ids.filter((id) => /^STAT_\d+_VALUE$/.test(id)).length >= 6) return 'stat_six_para'
  if (ids.filter((id) => /^STAT_\d+_VALUE$/.test(id)).length >= 1 && ct === 'stat') return 'stat_row'
  if (ids.filter((id) => /^IMAGE_\d+$/.test(id)).length >= 3) return 'image_gallery_three'
  if (ids.some((id) => /^STEP_\d+_CIRCLE$/.test(id))) return 'process_flow'
  if (roles.has('stat') && ids.includes('HERO_IMAGE') && ids.some((id) => /^STAT_\d+_CARD$/.test(id))) {
    return 'stat_cards_image'
  }
  if (roles.has('chart') && ids.includes('HERO_IMAGE') && roles.has('body')) return 'chart_image_split'
  if (roles.has('chart') && (ids.includes('MAIN_CHART') || ids.includes('CHART_PANEL_BG'))) return 'chart_full_width'

  if (ct === 'device_frames' || String(layoutId || '').startsWith('device_')) {
    const layoutKey = String(layoutId || '').toLowerCase()
    if (ids.includes('WATCH_IMAGE')) return 'device_multi_cluster'
    if (ids.includes('DEVICE_IMAGE_3') || layoutKey.includes('triple')) return 'device_phone_triple'
    if (ids.includes('CALLOUT_L_HEADING') || layoutKey.includes('highlights')) return 'device_phone_highlights'
    if (ids.includes('LAPTOP_IMAGE') || layoutKey.includes('laptop')) return 'device_laptop_split'
    if (ids.includes('TABLET_IMAGE') || (layoutKey.includes('tablet') && ids.includes('BODY'))) return 'device_tablet_split'
    if (layoutKey.includes('tablet') && ids.includes('HEADING') && !ids.includes('BODY')) return 'device_tablet_centered'
    if (layoutKey.includes('horizontal')) return 'device_phone_horizontal'
    if (ids.includes('DEVICE_IMAGE') && ids.includes('BODY')) return 'device_phone_vertical_split'
    return 'device_phone_vertical_split'
  }
  if (schema?.highlightedPlanIndex != null || ids.some((id) => id.includes('PLAN_')) || ct === 'pricing') {
    if (ids.includes('TABLE_1') && ct === 'pricing') return 'pricing_comparison_table'
    if (ids.includes('BODY') && ids.filter((id) => /^PLAN_\d+_LABEL$/.test(id)).length >= 4) {
      return 'pricing_four_para'
    }
    return ids.some((id) => id.includes('PRICE')) || ct === 'pricing' || ct === 'comparison'
      ? 'pricing_plans'
      : 'comparison_columns'
  }
  if (ids.includes('HERO_IMAGE') && ids.some((id) => id.startsWith('AGENDA_COL_'))) {
    return 'agenda_three_columns_hero'
  }
  if (ct === 'agenda' || ids.some((id) => id.startsWith('AGENDA_COL_'))) return 'agenda_three_columns'
  if (ids.includes('CONTACT_IMAGE') && ids.includes('CONTACT_ADDRESS')) {
    return ids.includes('CONTACT_IMAGE') && slots.find((s) => s.id === 'CONTACT_IMAGE')?.region?.includes('cols 7')
      ? 'contact_split_right'
      : 'contact_split_left'
  }
  if (ids.some((id) => id.startsWith('DEPT_'))) return 'team_by_department'
  if (ids.includes('MEMBER_1_IMAGE') && !ids.includes('MEMBER_1_EMAIL')) return 'team_full_image_cards'
  const memberCount = ids.filter((id) => /^MEMBER_\d+_NAME$/.test(id)).length
  if (memberCount === 3 && ids.includes('HEADING') && !ids.some((id) => id.startsWith('DEPT_'))) {
    const headingSlot = slots.find((s) => s.id === 'HEADING')
    const headingRegion = String(headingSlot?.region || '')
    if (headingRegion.includes('cols 1-5') || headingRegion.includes('cols 1-4')) return 'team_vertical_list'
    return 'team_three_horizontal'
  }
  if (memberCount === 4) return 'team_grid_four'
  if (memberCount === 5) return 'team_grid_five'
  if (memberCount >= 6 && !ids.some((id) => id.startsWith('DEPT_'))) return 'team_grid_six'
  if (ct === 'stat' || (roles.has('stat') && roles.has('stat_label'))) return 'stat_row'
  if (ct === 'chart' || roles.has('chart')) return 'chart_split'
  if (ct === 'quote' || roles.has('quote')) return 'quote_attribution'
  if (ct === 'team' || ids.some((id) => id.startsWith('MEMBER'))) return 'team_staggered'
  if (ct === 'closing' || roles.has('cta')) return 'closing_cta'
  if (ids.includes('COL_1_IMAGE') && ids.includes('COL_2_IMAGE')) return 'two_image_columns'
  if (
    ids.includes('POINT_8_LABEL') ||
    ids.filter((id) => /^POINT_\d+_LABEL$/.test(id)).length >= 6
  ) {
    return 'eight_short_texts'
  }
  if (ct === 'comparison') return 'comparison_columns'
  return null
}

function fillPreviewDataFromSlots(schema) {
  const slots = schema.slots || []
  const preview = schema.preview || {}
  const mode = resolvePreviewMode(schema)

  if (mode === 'stat_row' && !Array.isArray(preview.stats)) {
    preview.stats = buildStatsFromLayoutSlots(slots)
  }
  if (mode === 'stat_hero' && !Array.isArray(preview.stats)) {
    const value = slotPlaceholderText(slots, 'STAT_VALUE')
    const label = slotPlaceholderText(slots, 'STAT_LABEL')
    preview.stats = [{ value: value || '98%', label: label || 'Customer satisfaction' }]
  }
  if (mode === 'stat_six_para' && !Array.isArray(preview.stats)) {
    preview.stats = buildStatsFromLayoutSlots(slots)
    preview.bodyText = preview.bodyText ?? slotPlaceholderText(slots, 'BODY')
  }
  if (mode === 'stat_vertical' && !Array.isArray(preview.stats)) {
    preview.stats = buildStatsFromLayoutSlots(slots)
  }
  if (mode === 'grid_three_images_text' && !Array.isArray(preview.columns)) {
    preview.columns = [1, 2, 3].map((n) => ({
      body: slotPlaceholderText(slots, `BODY_${n}`) || `Supporting text ${n}`,
    }))
  }
  if (mode === 'grid_images_text_cards' && !Array.isArray(preview.columns)) {
    preview.columns = [1, 2, 3].map((n) => ({
      title: slotPlaceholderText(slots, `COL_${n}_TITLE`) || `Feature ${String.fromCharCode(64 + n)}`,
      body: slotPlaceholderText(slots, `COL_${n}_BODY`) || 'Supporting paragraph with scannable copy.',
    }))
  }
  if (mode === 'grid_text_image_cards') {
    preview.featureTitle = preview.featureTitle ?? slotPlaceholderText(slots, 'FEATURE_TITLE')
    preview.featureBody = preview.featureBody ?? slotPlaceholderText(slots, 'FEATURE_BODY')
    preview.pointTitle = preview.pointTitle ?? slotPlaceholderText(slots, 'POINT_TITLE')
    preview.pointBody = preview.pointBody ?? slotPlaceholderText(slots, 'POINT_BODY')
  }
  if (mode === 'chart_dual' || mode === 'chart_triple' || mode === 'chart_triple_context' || mode === 'chart_card_grid' || mode === 'chart_donut_row') {
    if (!preview.slots?.HEADING?.text) {
      preview.slots = {
        ...(preview.slots || {}),
        HEADING: {
          ...(preview.slots?.HEADING || {}),
          text: preview.slots?.HEADING?.text || slotPlaceholderText(slots, 'HEADING') || 'Chart title',
          variant: 'title',
          bold: true,
        },
      }
    }
  }
  if (mode === 'table_preview' || mode === 'table_with_desc' || mode === 'table_dual' || mode === 'table_dual_shared_header') {
    preview.tableHeaders = preview.tableHeaders || ['Column A', 'Column B', 'Column C']
    preview.tableRows = preview.tableRows || [
      ['Row 1', 'Value', 'Value'],
      ['Row 2', 'Value', 'Value'],
      ['Row 3', 'Value', 'Value'],
    ]
    preview.bodyText = preview.bodyText ?? slotPlaceholderText(slots, 'BODY')
  }
  if (mode === 'chart_split' || mode === 'chart_full_width' || mode === 'chart_image_split' || mode === 'grid_insights_chart') {
    preview.bodyText = preview.bodyText ?? slotPlaceholderText(slots, 'BODY') ?? slotPlaceholderText(slots, 'POINT_BODY') ?? undefined
    preview.chartCaption = preview.chartCaption ?? slotPlaceholderText(slots, 'CHART_CAPTION') ?? undefined
    if (!preview.slots?.HEADING?.text) {
      preview.slots = {
        ...(preview.slots || {}),
        HEADING: {
          ...(preview.slots?.HEADING || {}),
          text:
            preview.slots?.HEADING?.text ||
            slotPlaceholderText(slots, 'HEADING') ||
            slotPlaceholderText(slots, 'CHART_HEADING') ||
            'Chart title',
          variant: 'title',
          bold: true,
        },
      }
    }
  }
  if (mode === 'grid_insights_chart' && !Array.isArray(preview.insights)) {
    preview.insights = [1, 2, 3].map((n) => ({
      label:
        preview.slots?.[`INSIGHT_LABEL_${n}`]?.text ||
        slotPlaceholderText(slots, `INSIGHT_LABEL_${n}`) ||
        `Insight ${n}`,
    }))
    preview.sideHeading =
      preview.sideHeading ?? preview.slots?.POINT_HEADING?.text ?? slotPlaceholderText(slots, 'POINT_HEADING')
    preview.sideBody =
      preview.sideBody ?? preview.slots?.POINT_BODY?.text ?? slotPlaceholderText(slots, 'POINT_BODY')
  }
  if (mode === 'image_gallery_three' && !Array.isArray(preview.gallery)) {
    preview.gallery = [1, 2, 3].map((n) => ({
      label:
        preview.slots?.[`IMAGE_${n}_LABEL`]?.text ||
        slotPlaceholderText(slots, `IMAGE_${n}_LABEL`) ||
        (n === 1 ? 'Feature A' : n === 2 ? 'Feature B' : 'Feature C'),
    }))
  }
  if (mode === 'process_flow' && !Array.isArray(preview.steps)) {
    preview.steps = [1, 2, 3].map((n) => ({
      title:
        preview.slots?.[`STEP_${n}_TITLE`]?.text ||
        slotPlaceholderText(slots, `STEP_${n}_TITLE`) ||
        (n === 1 ? 'Discover' : n === 2 ? 'Build' : 'Launch'),
      body:
        preview.slots?.[`STEP_${n}_BODY`]?.text ||
        slotPlaceholderText(slots, `STEP_${n}_BODY`) ||
        'Short step description',
    }))
  }
  if (mode === 'diagram_process_steps' && !Array.isArray(preview.steps)) {
    preview.steps = [1, 2, 3, 4].map((n) => ({
      title:
        preview.slots?.[`step_${n}_title`]?.text ||
        slotPlaceholderText(slots, `step_${n}_title`) ||
        `${n}. Step`,
      body:
        preview.slots?.[`step_${n}_body`]?.text ||
        slotPlaceholderText(slots, `step_${n}_body`) ||
        'Brief description',
    }))
  }
  if (mode === 'diagram_cycle' && !Array.isArray(preview.quadrants)) {
    preview.quadrants = [1, 2, 3, 4].map((n) => ({
      title:
        preview.slots?.[`Q${n}_TITLE`]?.text ||
        slotPlaceholderText(slots, `Q${n}_TITLE`) ||
        (n === 1 ? 'Plan' : n === 2 ? 'Do' : n === 3 ? 'Check' : 'Act'),
      body:
        preview.slots?.[`Q${n}_BODY`]?.text ||
        slotPlaceholderText(slots, `Q${n}_BODY`) ||
        '',
    }))
  }
  if (mode === 'diagram_swot' && !Array.isArray(preview.quadrants)) {
    preview.quadrants = [1, 2, 3, 4].map((n) => ({
      title:
        preview.slots?.[`Q${n}_TITLE`]?.text ||
        slotPlaceholderText(slots, `Q${n}_TITLE`) ||
        (n === 1 ? 'Strengths' : n === 2 ? 'Weaknesses' : n === 3 ? 'Opportunities' : 'Threats'),
      body:
        preview.slots?.[`Q${n}_BODY`]?.text ||
        slotPlaceholderText(slots, `Q${n}_BODY`) ||
        '',
    }))
  }
  if (mode === 'diagram_quadrants' && !Array.isArray(preview.quadrants)) {
    preview.quadrants = [1, 2, 3, 4].map((n) => ({
      title:
        preview.slots?.[`Q${n}_TITLE`]?.text ||
        slotPlaceholderText(slots, `Q${n}_TITLE`) ||
        `Quadrant ${n}`,
      body:
        preview.slots?.[`Q${n}_BODY`]?.text ||
        slotPlaceholderText(slots, `Q${n}_BODY`) ||
        '',
    }))
    if (schema.layout_id === 'diagram_cycle_v1' || schema.preview?.diagramVariant === 'cycle') {
      preview.diagramVariant = 'cycle'
    }
  }
  if (mode === 'diagram_funnel' && !Array.isArray(preview.funnelTiers)) {
    preview.funnelTiers = [1, 2, 3, 4].map((n) => ({
      title:
        preview.slots?.[`funnel_${n}_title`]?.text ||
        slotPlaceholderText(slots, `funnel_${n}_title`) ||
        `Stage ${n}`,
      body:
        preview.slots?.[`funnel_${n}_body`]?.text ||
        slotPlaceholderText(slots, `funnel_${n}_body`) ||
        '',
    }))
  }
  if (mode === 'diagram_pyramid' && !Array.isArray(preview.funnelTiers)) {
    preview.funnelTiers = [1, 2, 3, 4, 5].map((n) => ({
      title:
        preview.slots?.[`funnel_${n}_title`]?.text ||
        slotPlaceholderText(slots, `funnel_${n}_title`) ||
        `Title ${String(n).padStart(2, '0')}`,
      body:
        preview.slots?.[`funnel_${n}_body`]?.text ||
        slotPlaceholderText(slots, `funnel_${n}_body`) ||
        '',
    }))
  }
  if (mode === 'diagram_venn' && !Array.isArray(preview.vennSets)) {
    preview.vennSets = [1, 2, 3].map((n) => ({
      title:
        preview.slots?.[`Q${n}_TITLE`]?.text ||
        slotPlaceholderText(slots, `Q${n}_TITLE`) ||
        `Set ${String.fromCharCode(64 + n)}`,
      body:
        preview.slots?.[`Q${n}_BODY`]?.text ||
        slotPlaceholderText(slots, `Q${n}_BODY`) ||
        '',
    }))
    preview.vennCenter =
      preview.vennCenter ||
      preview.slots?.CENTER_BODY?.text ||
      slotPlaceholderText(slots, 'CENTER_BODY') ||
      'Shared overlap'
  }
  if (mode === 'stat_cards_image') {
    if (!Array.isArray(preview.stats)) preview.stats = buildStatsFromLayoutSlots(slots)
  }
  if (mode === 'quote_attribution') {
    preview.quoteText =
      preview.quoteText ??
      slotPlaceholderText(slots, 'QUOTE') ??
      slotPlaceholderText(slots, 'STATEMENT') ??
      undefined
    preview.authorName =
      preview.authorName ??
      slotPlaceholderText(slots, 'NAME') ??
      slotPlaceholderText(slots, 'AUTHOR_NAME') ??
      slotPlaceholderText(slots, 'ATTRIBUTION') ??
      undefined
    preview.authorTitle =
      preview.authorTitle ??
      slotPlaceholderText(slots, 'ROLE') ??
      slotPlaceholderText(slots, 'AUTHOR_TITLE') ??
      undefined
  }
  if (mode === 'quote_grid') {
    preview.quoteText =
      preview.quoteText ??
      slotPlaceholderText(slots, 'QUOTE_1') ??
      'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.'
    preview.authorName = preview.authorName ?? slotPlaceholderText(slots, 'NAME_1') ?? 'Gemine Macberry'
    preview.authorTitle =
      preview.authorTitle ?? slotPlaceholderText(slots, 'ROLE_1') ?? 'VP of Engineering at Acme Inc.'
  }
  if (mode === 'comparison_columns' || mode === 'pricing_plans' || mode === 'pricing_four_para') {
    const columns = buildPlansFromLayoutSlots(slots) || buildComparisonColumnsFromSlots(slots, preview)
    if (columns) preview.columns = columns
  }
  if (mode === 'pricing_four_para') {
    preview.bodyText = preview.bodyText ?? slotPlaceholderText(slots, 'BODY')
    if (!preview.slots?.HEADING?.text) {
      preview.slots = {
        ...(preview.slots || {}),
        HEADING: {
          ...(preview.slots?.HEADING || {}),
          text: preview.slots?.HEADING?.text || slotPlaceholderText(slots, 'HEADING') || 'Choose your plan',
          variant: 'title',
          bold: true,
        },
      }
    }
  }
  if (mode === 'pricing_comparison_table') {
    preview.tableHeaders = preview.tableHeaders || ['Feature', 'Basic', 'Standard', 'Pro']
    preview.tableRows = preview.tableRows || [
      ['Users', '1', '5', 'Unlimited'],
      ['Storage', '5 GB', '50 GB', '500 GB'],
      ['Support', 'Email', 'Priority', 'Dedicated'],
      ['Price', '$99', '$299', '$999'],
    ]
  }
  if ((mode === 'agenda_three_columns' || mode === 'agenda_three_columns_hero') && !Array.isArray(preview.agendaColumns)) {
    preview.agendaColumns = buildAgendaColumnsFromSlots(slots)
  }
  if (
    mode === 'contact_split_left'
    || mode === 'contact_split_right'
    || mode === 'team_three_horizontal'
    || mode === 'team_vertical_list'
    || mode === 'team_grid_four'
    || mode === 'team_grid_five'
    || mode === 'team_grid_six'
    || mode === 'team_full_image_cards'
    || mode === 'team_by_department'
    || mode === 'team_staggered'
  ) {
    if (!Array.isArray(preview.members)) {
      preview.members = buildMembersFromLayoutSlots(slots, mode === 'team_grid_six' || mode === 'team_by_department' ? 6 : 5)
    }
  }
  if (mode === 'device_phone_horizontal' || mode === 'device_phone_vertical_split' || mode === 'device_tablet_split' || mode === 'device_laptop_split') {
    preview.bodyText = preview.bodyText ?? slotPlaceholderText(slots, 'BODY')
  }
  if (mode === 'device_phone_highlights') {
    preview.callouts = [
      {
        heading: slotPlaceholderText(slots, 'CALLOUT_L_HEADING') || 'A highlight feature',
        body: slotPlaceholderText(slots, 'CALLOUT_L_BODY') || 'Say something about it here.',
      },
      {
        heading: slotPlaceholderText(slots, 'CALLOUT_R_HEADING') || 'Another highlight',
        body: slotPlaceholderText(slots, 'CALLOUT_R_BODY') || 'Say something about it here.',
      },
    ]
  }
  if (mode === 'team_by_department' && !Array.isArray(preview.departments)) {
    preview.departments = [1, 2, 3].map((n) => ({
      heading: slotPlaceholderText(slots, `DEPT_${n}_HEADING`) || (n === 1 ? 'Leadership' : n === 2 ? 'Engineering' : 'Design'),
      members: buildMembersFromLayoutSlots(slots, 6)?.slice((n - 1) * 2, n * 2) || [],
    }))
  }
  if (mode === 'two_image_columns' && !Array.isArray(preview.columns)) {
    preview.columns = [
      {
        title: slotPlaceholderText(slots, 'COL_1_TITLE') || 'Make your point',
        body: slotPlaceholderText(slots, 'COL_1_BODY') || 'Expand on it here.',
      },
      {
        title: slotPlaceholderText(slots, 'COL_2_TITLE') || 'Make another point',
        body: slotPlaceholderText(slots, 'COL_2_BODY') || 'You already know that it matters.',
      },
    ]
  }
  if (mode === 'intro_three_para_icons' && !Array.isArray(preview.columns)) {
    preview.columns = [1, 2, 3].map((n) => ({
      title: slotPlaceholderText(slots, `ROW_${n}_TITLE`) || `Pillar ${n}`,
      body:
        slotPlaceholderText(slots, `ROW_${n}_BODY`) ||
        'Short supporting copy for this pillar.',
    }))
  }
  if (mode === 'eight_short_texts' && !Array.isArray(preview.points)) {
    preview.points = Array.from({ length: 8 }, (_, index) => {
      const n = index + 1
      const labelId = `POINT_${n}_LABEL`
      const descId = `POINT_${n}_DESC`
      return {
        label:
          preview.slots?.[labelId]?.text ||
          slotPlaceholderText(slots, labelId) ||
          (n === 8 ? 'Last point' : `${['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'][index] || 'Another'} point`),
        desc:
          preview.slots?.[descId]?.text ||
          slotPlaceholderText(slots, descId) ||
          'A short description',
      }
    })
  }
  if (mode === 'closing_cta') {
    preview.slots = {
      ...(preview.slots || {}),
      HEADING: {
        ...(preview.slots?.HEADING || {}),
        text: preview.slots?.HEADING?.text || slotPlaceholderText(slots, 'HEADING') || 'Thank you',
        variant: 'title',
        bold: true,
      },
      SUBTITLE: {
        ...(preview.slots?.SUBTITLE || {}),
        text: preview.slots?.SUBTITLE?.text || slotPlaceholderText(slots, 'SUBTITLE') || '',
        variant: 'subheading',
      },
      CTA: {
        ...(preview.slots?.CTA || {}),
        text: preview.slots?.CTA?.text || slotPlaceholderText(slots, 'CTA') || '',
        variant: 'body',
        bold: true,
      },
      CONTACT: {
        ...(preview.slots?.CONTACT || {}),
        text: preview.slots?.CONTACT?.text || slotPlaceholderText(slots, 'CONTACT') || '',
        variant: 'caption',
      },
    }
  }

  if (mode) preview.mode = mode
  schema.preview = preview
  return schema
}

function mergeRegistryPreviewFallback(schema) {
  const registered = getDeckLayoutSchema(schema?.layout_id)
  if (!registered) return schema

  const merged = schema
  const rp = registered.preview || {}
  const mp = merged.preview || {}

  merged.preview = {
    ...mp,
    mode: mp.mode || rp.mode || null,
    slots: { ...(rp.slots || {}), ...(mp.slots || {}) },
    columns: mp.columns ?? rp.columns,
    members: mp.members ?? rp.members,
    stats: mp.stats ?? rp.stats,
    quoteText: mp.quoteText ?? rp.quoteText,
    authorName: mp.authorName ?? rp.authorName,
    authorTitle: mp.authorTitle ?? rp.authorTitle,
    bodyText: mp.bodyText ?? rp.bodyText,
    chartValues: mp.chartValues ?? rp.chartValues,
    chartLabels: mp.chartLabels ?? rp.chartLabels,
    chartCaption: mp.chartCaption ?? rp.chartCaption,
    highlightedColumnIndex:
      mp.highlightedColumnIndex ??
      merged.highlightedPlanIndex ??
      rp.highlightedColumnIndex ??
      registered.highlightedPlanIndex,
  }

  if (!Array.isArray(merged.slots) || merged.slots.length === 0) {
    merged.slots = registered.slots
  }

  return merged
}

/** Normalize any saved layout schema for polished preview (backend-first, registry fallback). */
export function normalizeLayoutSchemaForPreview(schema) {
  if (!schema || typeof schema !== 'object') return schema ?? {}
  const merged = JSON.parse(JSON.stringify(schema))
  if (!Array.isArray(merged.slots)) merged.slots = []
  merged.preview = merged.preview || {}
  merged.preview.slots = buildPreviewSlotsFromLayoutSlots(merged.slots, merged.preview.slots || {})
  fillPreviewDataFromSlots(merged)
  return mergeRegistryPreviewFallback(merged)
}

/** Build layout_id → schema map from DECK_LAYOUT template rows. */
export function buildLayoutSchemaMap(templates = []) {
  const map = {}
  for (const template of templates) {
    const layoutId = template?.schema?.layout_id
    if (layoutId && template.schema) {
      map[String(layoutId)] = template.schema
    }
  }
  return map
}

/** Resolve a layout schema: code catalog → saved map fallback. */
export function resolveLayoutSchemaById(layoutId, layoutSchemaMap = {}) {
  const key = String(layoutId || '').trim()
  if (!key) return null
  const registered = getDeckLayoutSchema(key)
  if (registered) return normalizeLayoutSchemaForPreview(registered)
  if (layoutSchemaMap[key]) {
    return normalizeLayoutSchemaForPreview(layoutSchemaMap[key])
  }
  return null
}

/** @returns {object|null} layout schema clone for preview */
export function getDeckLayoutSchema(layoutId) {
  const key = String(layoutId || '').trim()
  if (!key || !REGISTRY[key]) return null
  return JSON.parse(JSON.stringify(REGISTRY[key]))
}

export function listDeckLayoutIds() {
  return Object.keys(REGISTRY)
}

/** Resolve slide-level and per-slot image URLs from pack TemplateMedia rows. */
export function resolveSlideMediaFromPack(media, slideOrder) {
  const rows = Array.isArray(media) ? media : []
  const order = Number(slideOrder) || 1
  const slideHint = `slide:${order}`
  const prefix = `${slideHint}:`
  const imageUrls = {}
  let imageUrl = ''
  for (const m of rows) {
    if (!m?.url) continue
    const hint = String(m.slotHint || '')
    if (hint === slideHint) imageUrl = m.url
    else if (hint.startsWith(prefix)) {
      const slotId = hint.slice(prefix.length)
      if (slotId) imageUrls[slotId] = m.url
    }
  }
  if (!imageUrl) {
    const firstSlot = rows.find((m) => String(m.slotHint || '').startsWith(prefix))
    if (firstSlot?.url) imageUrl = firstSlot.url
  }
  return { imageUrl, imageUrls }
}

/** Merge pack slide placeholder copy into layout preview hints. */
export function buildPackSlidePreviewSchema(layoutSchema, slide, { imageUrl, imageUrls } = {}) {
  if (!layoutSchema) return null
  const schema = normalizeLayoutSchemaForPreview(layoutSchema)
  const pl = slide?.placeholder && typeof slide.placeholder === 'object' ? slide.placeholder : {}
  schema.preview = schema.preview || {}
  schema.preview.slots = { ...(schema.preview.slots || {}) }

  for (const slot of schema.slots || []) {
    const keys = PLACEHOLDER_SLOT_MAP[slot.id] || [slot.id.toLowerCase()]
    const text = keys.map((k) => pl[k]).find((v) => v != null && String(v).trim())
    if (!text) continue
    schema.preview.slots[slot.id] = {
      ...(schema.preview.slots[slot.id] || {}),
      text: String(text),
    }
  }

  if (Array.isArray(pl.stats) && pl.stats.length) {
    schema.preview.stats = pl.stats.slice(0, 3).map((stat) => ({
      value: String(stat?.value ?? stat?.stat ?? '—'),
      label: String(stat?.label ?? ''),
    }))
  }

  if (pl.subtitle != null && String(pl.subtitle).trim()) {
    schema.preview.slots.SUBTITLE = {
      ...(schema.preview.slots.SUBTITLE || {}),
      text: String(pl.subtitle),
      variant: 'subheading',
    }
  }

  const sideSources = Array.isArray(pl.sides)
    ? pl.sides
    : Array.isArray(pl.options)
      ? pl.options
      : null

  if (sideSources?.length) {
    schema.preview.columns = sideSources.slice(0, 3).map((side) => {
      const items = Array.isArray(side?.items)
        ? side.items
        : Array.isArray(side?.bullets)
          ? side.bullets
          : []
      return {
        label: String(side?.label || side?.title || side?.name || 'Plan'),
        price: side?.price != null ? String(side.price) : '',
        items: items.slice(0, 5).map((item) =>
          typeof item === 'string' ? item : String(item?.label ?? item?.text ?? item ?? '')
        ),
      }
    })
    if (schema.preview.mode === 'pricing_plans' || sideSources.some((s) => s?.price != null)) {
      schema.preview.mode = 'pricing_plans'
    }
  }

  if (Array.isArray(pl.plans) && pl.plans.length) {
    const highlightIdx =
      typeof slide?.generationHints?.highlightedPlanIndex === 'number'
        ? slide.generationHints.highlightedPlanIndex
        : typeof schema.highlightedPlanIndex === 'number'
          ? schema.highlightedPlanIndex
          : typeof schema.preview?.highlightedColumnIndex === 'number'
            ? schema.preview.highlightedColumnIndex
            : 1
    schema.preview.columns = pl.plans.slice(0, 4).map((plan, index) => ({
      label: String(plan?.label || plan?.name || 'Plan'),
      price: plan?.price != null ? String(plan.price) : '',
      highlighted: plan?.highlighted === true || index === highlightIdx,
      items: (Array.isArray(plan?.items) ? plan.items : Array.isArray(plan?.bullets) ? plan.bullets : [])
        .slice(0, 5)
        .map((item) => (typeof item === 'string' ? item : String(item?.label ?? item?.text ?? item ?? ''))),
    }))
    schema.preview.mode = 'pricing_plans'
    schema.preview.highlightedColumnIndex = highlightIdx
  }

  if (Array.isArray(pl.columns) && pl.columns.length) {
    schema.preview.columns = pl.columns.slice(0, 3).map((col) => ({
      title: String(col?.title || col?.heading || col?.label || 'Point'),
      body: String(col?.body || col?.text || ''),
    }))
    if (schema.preview.mode === 'two_image_columns' || pl.columns[0]?.body != null) {
      schema.preview.mode = schema.preview.mode || 'two_image_columns'
    }
    if (schema.preview.mode === 'grid_metrics_masonry') {
      const [left, middle, right] = schema.preview.columns
      if (left?.title) {
        schema.preview.slots.METRIC_TITLE_1 = {
          ...(schema.preview.slots.METRIC_TITLE_1 || {}),
          text: left.title,
          variant: 'title',
          bold: true,
        }
      }
      if (left?.body) {
        schema.preview.slots.METRIC_BODY_1 = {
          ...(schema.preview.slots.METRIC_BODY_1 || {}),
          text: left.body,
          variant: 'body',
        }
      }
      const rightCol = right || middle
      if (rightCol?.title) {
        schema.preview.slots.METRIC_TITLE_3 = {
          ...(schema.preview.slots.METRIC_TITLE_3 || {}),
          text: rightCol.title,
          variant: 'title',
          bold: true,
        }
      }
      if (rightCol?.body) {
        schema.preview.slots.METRIC_BODY_3 = {
          ...(schema.preview.slots.METRIC_BODY_3 || {}),
          text: rightCol.body,
          variant: 'body',
        }
      }
    }
  }

  if (Array.isArray(pl.members) && pl.members.length) {
    schema.preview.members = pl.members.slice(0, 6).map((m) => ({
      name: String(m?.name ?? ''),
      role: String(m?.role ?? m?.title ?? ''),
      email: String(m?.email ?? ''),
      phone: String(m?.phone ?? ''),
    }))
  }

  if (pl.quote != null && String(pl.quote).trim()) {
    schema.preview.quoteText = String(pl.quote)
  }
  if (pl.author != null && String(pl.author).trim()) {
    schema.preview.authorName = String(pl.author)
  }
  if (pl.authorTitle != null && String(pl.authorTitle).trim()) {
    schema.preview.authorTitle = String(pl.authorTitle)
  } else if (pl.title != null && slide?.contentType === 'quote') {
    schema.preview.authorTitle = String(pl.title)
  }

  if (pl.body != null && String(pl.body).trim()) {
    schema.preview.bodyText = String(pl.body)
  }
  if (Array.isArray(pl.series?.[0]?.data)) {
    schema.preview.chartValues = pl.series[0].data.map((v) => Number(v) || 0)
  } else if (Array.isArray(pl.chartValues)) {
    schema.preview.chartValues = pl.chartValues.map((v) => Number(v) || 0)
  }
  if (Array.isArray(pl.labels)) {
    schema.preview.chartLabels = pl.labels.map(String)
  }
  if (pl.chartCaption != null) {
    schema.preview.chartCaption = String(pl.chartCaption)
  }

  if (pl.cta != null && String(pl.cta).trim()) {
    schema.preview.slots.CTA = { ...(schema.preview.slots.CTA || {}), text: String(pl.cta), variant: 'body', bold: true }
  }
  if (pl.contact != null && String(pl.contact).trim()) {
    schema.preview.slots.CONTACT = { ...(schema.preview.slots.CONTACT || {}), text: String(pl.contact), variant: 'caption' }
  }

  if (Array.isArray(pl.members) && pl.members.length) {
    schema.preview.mode = schema.preview.mode || 'team_staggered'
  }
  if (Array.isArray(pl.plans) && pl.plans.length) {
    schema.preview.mode = 'pricing_plans'
  }
  if (pl.quote != null && String(pl.quote).trim()) {
    schema.preview.mode = schema.preview.mode || 'quote_attribution'
  }
  if (Array.isArray(pl.chartValues) && pl.chartValues.length) {
    schema.preview.mode = schema.preview.mode || 'chart_split'
  }

  const slotUrlMap = imageUrls && typeof imageUrls === 'object' ? imageUrls : {}
  const resolvedImage =
    (typeof imageUrl === 'string' && imageUrl.trim())
    || (typeof pl.imageUrl === 'string' && pl.imageUrl.trim())
    || (typeof pl.image === 'string' && pl.image.trim())
    || ''

  const galleryImageSlots = (schema.slots || []).filter(
    (s) => String(s.role || '').toLowerCase() === 'image' && /^IMAGE_\d+$/i.test(String(s.id || ''))
  )
  const multiImageGallery = galleryImageSlots.length > 1

  if (resolvedImage) {
    schema.preview.imageUrl = resolvedImage
  }

  for (const slot of schema.slots || []) {
    const role = String(slot.role || '').toLowerCase()
    const id = String(slot.id || '').toLowerCase()
    const slotId = slot.id
    const perSlotUrl =
      (slotId && slotUrlMap[slotId])
      || (slotId && slotUrlMap[String(slotId).toUpperCase()])
      || null
    const urlForSlot = perSlotUrl || (multiImageGallery ? null : resolvedImage)
    if (
      urlForSlot
      && (
        role === 'image'
        || role === 'background'
        || id.includes('image')
        || id.includes('hero')
        || id.includes('photo')
        || id.includes('avatar')
        || id.includes('member')
      )
    ) {
      schema.preview.slots[slotId] = {
        ...(schema.preview.slots[slotId] || {}),
        variant: 'image',
        imageUrl: urlForSlot,
      }
    }
  }

  fillPreviewDataFromSlots(schema)
  return schema
}

export function canPreviewDeckLayout({ layoutId, layoutSchema, layoutSchemaMap } = {}) {
  if (layoutSchemaHasPreviewCanvas(layoutSchema)) return true
  if (layoutSchema?.preview?.mode === 'canvas_elements') return true
  if (layoutSchema && (Array.isArray(layoutSchema.slots) ? layoutSchema.slots.length : layoutSchema.preview?.mode)) {
    return true
  }
  const resolved = resolveLayoutSchemaById(layoutId, layoutSchemaMap)
  if (layoutSchemaHasPreviewCanvas(resolved)) return true
  if (resolved?.preview?.mode === 'canvas_elements') return true
  return Boolean(resolved && (resolved.slots?.length || resolved.preview?.mode))
}

/** @deprecated Use canPreviewDeckLayout — kept for existing imports. */
export function hasDeckLayoutSchema(layoutId, layoutSchemaMap = {}) {
  return canPreviewDeckLayout({ layoutId, layoutSchemaMap })
}

/** Prepare a saved DECK_LAYOUT schema for polished admin preview. */
export function enrichLayoutSchemaForPreview(schema) {
  return normalizeLayoutSchemaForPreview(schema)
}

export default REGISTRY
