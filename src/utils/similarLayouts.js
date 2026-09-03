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
    /process_step|process_flow|process_linner|funnel_|swot_|matrix_/.test(id)
  ) {
    return 'diagram'
  }
  if (ct === 'device_frames' || /^device_/.test(id)) return 'device'
  if (ct === 'chart' || ct === 'stat' || /chart_|donut_|metrics_/.test(id)) return 'chart'
  if (ct === 'timeline' || /^timeline_/.test(id)) return 'timeline'
  if (ct === 'closing') return 'closing'
  if (ct === 'team' || /team_|people_/.test(id)) return 'team'
  if (ct === 'quote' || /quote_/.test(id)) return 'quote'
  if (ct === 'pricing' || /pricing_/.test(id)) return 'pricing'
  if (ct === 'agenda' || /agenda_/.test(id)) return 'agenda'
  if (/closing_|thank_you|contact_.*cta|speaker_bio|minimal_text_cta|overlay_image_cta|image_para_cta|para_image_cta/.test(id)) {
    return 'closing'
  }
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

/** Explicit similar-layout links for curated picker groups (shown on canvas rail). */
export const LAYOUT_SIMILAR_OVERRIDES = {
  contact_left_image_v1: ['contact_right_image_v1', 'contact_image_bottom_v1'],
  contact_right_image_v1: ['contact_left_image_v1', 'contact_image_bottom_v1'],
  contact_image_bottom_v1: ['contact_left_image_v1', 'contact_right_image_v1'],
  team_speaker_bio_v1: ['speaker_bio_image_right_v1', 'speaker_bio_centered_v1'],
  speaker_bio_image_right_v1: ['team_speaker_bio_v1', 'speaker_bio_centered_v1'],
  speaker_bio_centered_v1: ['team_speaker_bio_v1', 'speaker_bio_image_right_v1'],
  centered_text_cta_v1: ['closing_thank_you_v1', 'minimal_text_cta_v1'],
  closing_thank_you_v1: ['centered_text_cta_v1', 'minimal_text_cta_v1'],
  minimal_text_cta_v1: ['centered_text_cta_v1', 'closing_thank_you_v1'],
  closing_contact_cta_v1: ['contact_card_cta_v1', 'contact_split_cta_v1'],
  contact_card_cta_v1: ['closing_contact_cta_v1', 'contact_split_cta_v1'],
  contact_split_cta_v1: ['closing_contact_cta_v1', 'contact_card_cta_v1'],
  para_image_cta_v1: ['image_para_cta_v1', 'overlay_image_cta_v1'],
  image_para_cta_v1: ['para_image_cta_v1', 'overlay_image_cta_v1'],
  overlay_image_cta_v1: ['para_image_cta_v1', 'image_para_cta_v1'],
  diagram_cycle_v1: ['diagram_cycle_horizontal_v1', 'diagram_cycle_ring_v1'],
  diagram_cycle_horizontal_v1: ['diagram_cycle_v1', 'diagram_cycle_ring_v1'],
  diagram_cycle_ring_v1: ['diagram_cycle_v1', 'diagram_cycle_horizontal_v1'],
  diagram_funnel_v1: ['diagram_funnel_horizontal_v1'],
  diagram_funnel_horizontal_v1: ['diagram_funnel_v1'],
  diagram_matrix_v1: ['diagram_matrix_grid_v1', 'diagram_matrix_quadrant_v1'],
  diagram_matrix_grid_v1: ['diagram_matrix_v1', 'diagram_matrix_quadrant_v1'],
  diagram_matrix_quadrant_v1: ['diagram_matrix_v1', 'diagram_matrix_grid_v1'],
  diagram_process_steps_v1: ['diagram_process_horizontal_v1', 'diagram_process_vertical_v1'],
  diagram_process_horizontal_v1: ['diagram_process_steps_v1', 'diagram_process_vertical_v1'],
  diagram_process_vertical_v1: ['diagram_process_steps_v1', 'diagram_process_horizontal_v1'],
  diagram_pyramid_v1: ['diagram_pyramid_layers_v1', 'diagram_pyramid_inverted_v1'],
  diagram_pyramid_layers_v1: ['diagram_pyramid_v1', 'diagram_pyramid_inverted_v1'],
  diagram_pyramid_inverted_v1: ['diagram_pyramid_v1', 'diagram_pyramid_layers_v1'],
  diagram_swot_v1: ['diagram_swot_grid_v1', 'diagram_swot_cards_v1'],
  diagram_swot_grid_v1: ['diagram_swot_v1', 'diagram_swot_cards_v1'],
  diagram_swot_cards_v1: ['diagram_swot_v1', 'diagram_swot_grid_v1'],
  diagram_venn_v1: ['diagram_venn_three_circle_v1', 'diagram_venn_stacked_v1'],
  diagram_venn_three_circle_v1: ['diagram_venn_v1', 'diagram_venn_stacked_v1'],
  diagram_venn_stacked_v1: ['diagram_venn_v1', 'diagram_venn_three_circle_v1'],
  agenda_minimal_v1: ['agenda_editorial_v1', 'agenda_cards_v1'],
  agenda_editorial_v1: ['agenda_minimal_v1', 'agenda_cards_v1'],
  agenda_cards_v1: ['agenda_minimal_v1', 'agenda_editorial_v1'],
  agenda_numbered_v1: ['agenda_numbered_bold_v1', 'agenda_numbered_timeline_v1'],
  agenda_numbered_bold_v1: ['agenda_numbered_v1', 'agenda_numbered_timeline_v1'],
  agenda_numbered_timeline_v1: ['agenda_numbered_v1', 'agenda_numbered_bold_v1'],
  agenda_three_columns_hero_v1: ['agenda_three_cards_hero_v1', 'agenda_three_panel_hero_v1'],
  agenda_three_cards_hero_v1: ['agenda_three_columns_hero_v1', 'agenda_three_panel_hero_v1'],
  agenda_three_panel_hero_v1: ['agenda_three_columns_hero_v1', 'agenda_three_cards_hero_v1'],
  agenda_three_columns_v1: ['agenda_three_cards_v1', 'agenda_three_tiles_v1', 'agenda_three_icons_v1'],
  agenda_three_cards_v1: ['agenda_three_columns_v1', 'agenda_three_tiles_v1', 'agenda_three_icons_v1'],
  agenda_three_tiles_v1: ['agenda_three_columns_v1', 'agenda_three_cards_v1', 'agenda_three_icons_v1'],
  agenda_three_icons_v1: ['agenda_three_columns_v1', 'agenda_three_cards_v1', 'agenda_three_tiles_v1'],
  agenda_timeline_preview_v1: ['agenda_vertical_roadmap_v1', 'agenda_progress_path_v1'],
  agenda_vertical_roadmap_v1: ['agenda_timeline_preview_v1', 'agenda_progress_path_v1'],
  agenda_progress_path_v1: ['agenda_timeline_preview_v1', 'agenda_vertical_roadmap_v1'],
  agenda_two_column_v1: ['agenda_split_panel_v1', 'agenda_asymmetric_v1'],
  agenda_split_panel_v1: ['agenda_two_column_v1', 'agenda_asymmetric_v1'],
  agenda_asymmetric_v1: ['agenda_two_column_v1', 'agenda_split_panel_v1'],
  pricing_comparison_table_v1: ['pricing_comparison_cards_v1', 'pricing_comparison_matrix_v1'],
  pricing_comparison_cards_v1: ['pricing_comparison_table_v1', 'pricing_comparison_matrix_v1'],
  pricing_comparison_matrix_v1: ['pricing_comparison_table_v1', 'pricing_comparison_cards_v1'],
  pricing_four_para_v1: ['pricing_four_para_cards_v1', 'pricing_four_para_grid_v1'],
  pricing_four_para_cards_v1: ['pricing_four_para_v1', 'pricing_four_para_grid_v1'],
  pricing_four_para_grid_v1: ['pricing_four_para_v1', 'pricing_four_para_cards_v1'],
  pricing_four_plans_v1: ['pricing_four_plans_featured_v1'],
  pricing_four_plans_featured_v1: ['pricing_four_plans_v1'],
  pricing_three_highlight_v1: ['pricing_three_highlight_split_v1', 'pricing_three_highlight_stack_v1'],
  pricing_three_highlight_split_v1: ['pricing_three_highlight_v1', 'pricing_three_highlight_stack_v1'],
  pricing_three_highlight_stack_v1: ['pricing_three_highlight_v1', 'pricing_three_highlight_split_v1'],
  pricing_three_plans_v1: ['pricing_three_plans_featured_v1'],
  pricing_three_plans_featured_v1: ['pricing_three_plans_v1'],
  timeline_horizontal_v1: ['timeline_horizontal_nodes_v1', 'timeline_horizontal_cards_v1'],
  timeline_horizontal_nodes_v1: ['timeline_horizontal_v1', 'timeline_horizontal_cards_v1'],
  timeline_horizontal_cards_v1: ['timeline_horizontal_v1', 'timeline_horizontal_nodes_v1'],
  timeline_milestones_image_v1: ['timeline_milestones_image_right_v1', 'timeline_milestones_image_top_v1'],
  timeline_milestones_image_right_v1: ['timeline_milestones_image_v1', 'timeline_milestones_image_top_v1'],
  timeline_milestones_image_top_v1: ['timeline_milestones_image_v1', 'timeline_milestones_image_right_v1'],
  timeline_milestones_v1: ['timeline_milestones_cards_v1', 'timeline_milestones_path_v1'],
  timeline_milestones_cards_v1: ['timeline_milestones_v1', 'timeline_milestones_path_v1'],
  timeline_milestones_path_v1: ['timeline_milestones_v1', 'timeline_milestones_cards_v1'],
  timeline_roadmap_v1: ['timeline_roadmap_horizontal_v1', 'timeline_roadmap_lanes_v1'],
  timeline_roadmap_horizontal_v1: ['timeline_roadmap_v1', 'timeline_roadmap_lanes_v1'],
  timeline_roadmap_lanes_v1: ['timeline_roadmap_v1', 'timeline_roadmap_horizontal_v1'],
  timeline_process_steps_v1: ['timeline_process_horizontal_v1', 'timeline_process_vertical_v1'],
  timeline_process_horizontal_v1: ['timeline_process_steps_v1', 'timeline_process_vertical_v1'],
  timeline_process_vertical_v1: ['timeline_process_steps_v1', 'timeline_process_horizontal_v1'],
  timeline_vertical_v1: ['timeline_vertical_nodes_v1', 'timeline_vertical_cards_v1'],
  timeline_vertical_nodes_v1: ['timeline_vertical_v1', 'timeline_vertical_cards_v1'],
  timeline_vertical_cards_v1: ['timeline_vertical_v1', 'timeline_vertical_nodes_v1'],
  chart_donut_context_v1: ['chart_donut_context_right_v1', 'chart_donut_context_bottom_v1'],
  chart_donut_context_right_v1: ['chart_donut_context_v1', 'chart_donut_context_bottom_v1'],
  chart_donut_context_bottom_v1: ['chart_donut_context_v1', 'chart_donut_context_right_v1'],
  chart_exponential_desc_v1: ['chart_exponential_desc_side_v1', 'chart_exponential_desc_bottom_v1'],
  chart_exponential_desc_side_v1: ['chart_exponential_desc_v1', 'chart_exponential_desc_bottom_v1'],
  chart_exponential_desc_bottom_v1: ['chart_exponential_desc_v1', 'chart_exponential_desc_side_v1'],
  chart_with_description_v1: ['chart_with_description_side_v1', 'chart_with_description_bottom_v1'],
  chart_with_description_side_v1: ['chart_with_description_v1', 'chart_with_description_bottom_v1'],
  chart_with_description_bottom_v1: ['chart_with_description_v1', 'chart_with_description_side_v1'],
  chart_single_v1: ['chart_single_large_v1', 'chart_single_split_v1'],
  chart_single_large_v1: ['chart_single_v1', 'chart_single_split_v1'],
  chart_single_split_v1: ['chart_single_v1', 'chart_single_large_v1'],
  chart_three_context_v1: ['chart_three_context_cards_v1', 'chart_three_context_horizontal_v1'],
  chart_three_context_cards_v1: ['chart_three_context_v1', 'chart_three_context_horizontal_v1'],
  chart_three_context_horizontal_v1: ['chart_three_context_v1', 'chart_three_context_cards_v1'],
  chart_three_donut_v1: ['chart_three_donut_horizontal_v1', 'chart_three_donut_cards_v1'],
  chart_three_donut_horizontal_v1: ['chart_three_donut_v1', 'chart_three_donut_cards_v1'],
  chart_three_donut_cards_v1: ['chart_three_donut_v1', 'chart_three_donut_horizontal_v1'],
  chart_three_v1: ['chart_three_horizontal_v1', 'chart_three_cards_v1'],
  chart_three_horizontal_v1: ['chart_three_v1', 'chart_three_cards_v1'],
  chart_three_cards_v1: ['chart_three_v1', 'chart_three_horizontal_v1'],
  chart_two_cards_v1: ['chart_two_cards_horizontal_v1', 'chart_two_cards_split_v1'],
  chart_two_cards_horizontal_v1: ['chart_two_cards_v1', 'chart_two_cards_split_v1'],
  chart_two_cards_split_v1: ['chart_two_cards_v1', 'chart_two_cards_horizontal_v1'],
  chart_two_v1: ['chart_two_horizontal_v1', 'chart_two_split_v1'],
  chart_two_horizontal_v1: ['chart_two_v1', 'chart_two_split_v1'],
  chart_two_split_v1: ['chart_two_v1', 'chart_two_horizontal_v1'],
  metric_five_v1: ['metric_five_horizontal_v1', 'metric_five_cards_v1'],
  metric_five_horizontal_v1: ['metric_five_v1', 'metric_five_cards_v1'],
  metric_five_cards_v1: ['metric_five_v1', 'metric_five_horizontal_v1'],
  metric_four_v1: ['metric_four_horizontal_v1', 'metric_four_cards_v1'],
  metric_four_horizontal_v1: ['metric_four_v1', 'metric_four_cards_v1'],
  metric_four_cards_v1: ['metric_four_v1', 'metric_four_horizontal_v1'],
  metric_three_v1: ['metric_three_horizontal_v1', 'metric_three_cards_v1'],
  metric_three_horizontal_v1: ['metric_three_v1', 'metric_three_cards_v1'],
  metric_three_cards_v1: ['metric_three_v1', 'metric_three_horizontal_v1'],
  metric_single_v1: ['metric_single_hero_v1', 'metric_single_split_v1'],
  metric_single_hero_v1: ['metric_single_v1', 'metric_single_split_v1'],
  metric_single_split_v1: ['metric_single_v1', 'metric_single_hero_v1'],
  metric_six_para_v1: ['metric_six_cards_v1', 'metric_six_grid_v1'],
  metric_six_cards_v1: ['metric_six_para_v1', 'metric_six_grid_v1'],
  metric_six_grid_v1: ['metric_six_para_v1', 'metric_six_cards_v1'],
  metric_three_vertical_v1: ['metric_three_vertical_cards_v1', 'metric_three_vertical_nodes_v1'],
  metric_three_vertical_cards_v1: ['metric_three_vertical_v1', 'metric_three_vertical_nodes_v1'],
  metric_three_vertical_nodes_v1: ['metric_three_vertical_v1', 'metric_three_vertical_cards_v1'],
  metric_two_v1: ['metric_two_horizontal_v1', 'metric_two_split_v1'],
  metric_two_horizontal_v1: ['metric_two_v1', 'metric_two_split_v1'],
  metric_two_split_v1: ['metric_two_v1', 'metric_two_horizontal_v1'],
  process_linner_horti_four_v1: ['process_linear_horizontal_four_v1', 'process_linear_four_cards_v1'],
  process_linear_horizontal_four_v1: ['process_linner_horti_four_v1', 'process_linear_four_cards_v1'],
  process_linear_four_cards_v1: ['process_linner_horti_four_v1', 'process_linear_horizontal_four_v1'],
  process_linner_horti_v1: ['process_linear_horizontal_v2', 'process_linear_path_v1'],
  process_linear_horizontal_v2: ['process_linner_horti_v1', 'process_linear_path_v1'],
  process_linear_path_v1: ['process_linner_horti_v1', 'process_linear_horizontal_v2'],
  process_linner_numeric_v1: ['process_linear_numeric_cards_v1', 'process_linear_numeric_path_v1'],
  process_linear_numeric_cards_v1: ['process_linner_numeric_v1', 'process_linear_numeric_path_v1'],
  process_linear_numeric_path_v1: ['process_linner_numeric_v1', 'process_linear_numeric_cards_v1'],
  table_single_v1: ['table_single_cards_v1', 'table_single_matrix_v1'],
  table_single_cards_v1: ['table_single_v1', 'table_single_matrix_v1'],
  table_single_matrix_v1: ['table_single_v1', 'table_single_cards_v1'],
  table_two_desc_v1: ['table_two_desc_split_v1', 'table_two_desc_cards_v1'],
  table_two_desc_split_v1: ['table_two_desc_v1', 'table_two_desc_cards_v1'],
  table_two_desc_cards_v1: ['table_two_desc_v1', 'table_two_desc_split_v1'],
  table_two_same_header_v1: ['table_two_same_header_cards_v1', 'table_two_same_header_split_v1'],
  table_two_same_header_cards_v1: ['table_two_same_header_v1', 'table_two_same_header_split_v1'],
  table_two_same_header_split_v1: ['table_two_same_header_v1', 'table_two_same_header_cards_v1'],
  table_with_description_v1: ['table_with_description_side_v1', 'table_with_description_top_v1'],
  table_with_description_side_v1: ['table_with_description_v1', 'table_with_description_top_v1'],
  table_with_description_top_v1: ['table_with_description_v1', 'table_with_description_side_v1'],
  eight_short_texts_image_v1: ['eight_short_texts_image_right_v1', 'eight_short_texts_image_center_v1'],
  eight_short_texts_image_right_v1: ['eight_short_texts_image_v1', 'eight_short_texts_image_center_v1'],
  eight_short_texts_image_center_v1: ['eight_short_texts_image_v1', 'eight_short_texts_image_right_v1'],
  grid_bento_four_v1: ['grid_four_asymmetric_v1', 'grid_four_mosaic_v1'],
  grid_four_asymmetric_v1: ['grid_bento_four_v1', 'grid_four_mosaic_v1'],
  grid_four_mosaic_v1: ['grid_bento_four_v1', 'grid_four_asymmetric_v1'],
  grid_bento_three_v1: ['grid_three_asymmetric_v1', 'grid_three_staggered_v1'],
  grid_three_asymmetric_v1: ['grid_bento_three_v1', 'grid_three_staggered_v1'],
  grid_three_staggered_v1: ['grid_bento_three_v1', 'grid_three_asymmetric_v1'],
  grid_device_mockups_v1: ['grid_device_mockups_staggered_v1', 'grid_device_mockups_feature_v1'],
  grid_device_mockups_staggered_v1: ['grid_device_mockups_v1', 'grid_device_mockups_feature_v1'],
  grid_device_mockups_feature_v1: ['grid_device_mockups_v1', 'grid_device_mockups_staggered_v1'],
  grid_images_text_cards_v1: ['grid_images_text_split_v1', 'grid_images_text_mosaic_v1'],
  grid_images_text_split_v1: ['grid_images_text_cards_v1', 'grid_images_text_mosaic_v1'],
  grid_images_text_mosaic_v1: ['grid_images_text_cards_v1', 'grid_images_text_split_v1'],
  grid_insights_chart_v1: ['grid_insights_chart_split_v1', 'grid_insights_chart_focus_v1'],
  grid_insights_chart_split_v1: ['grid_insights_chart_v1', 'grid_insights_chart_focus_v1'],
  grid_insights_chart_focus_v1: ['grid_insights_chart_v1', 'grid_insights_chart_split_v1'],
  grid_metrics_masonry_v1: ['grid_metrics_asymmetric_v1', 'grid_metrics_staggered_v1'],
  grid_metrics_asymmetric_v1: ['grid_metrics_masonry_v1', 'grid_metrics_staggered_v1'],
  grid_metrics_staggered_v1: ['grid_metrics_masonry_v1', 'grid_metrics_asymmetric_v1'],
  grid_metrics_mobile_v1: ['grid_metrics_devices_v1', 'grid_metrics_phone_stack_v1'],
  grid_metrics_devices_v1: ['grid_metrics_mobile_v1', 'grid_metrics_phone_stack_v1'],
  grid_metrics_phone_stack_v1: ['grid_metrics_mobile_v1', 'grid_metrics_devices_v1'],
  grid_six_images_v1: ['grid_six_images_mosaic_v1', 'grid_six_images_staggered_v1'],
  grid_six_images_mosaic_v1: ['grid_six_images_v1', 'grid_six_images_staggered_v1'],
  grid_six_images_staggered_v1: ['grid_six_images_v1', 'grid_six_images_mosaic_v1'],
  grid_text_image_cards_v1: ['grid_text_image_split_v1', 'grid_text_image_mosaic_v1'],
  grid_text_image_split_v1: ['grid_text_image_cards_v1', 'grid_text_image_mosaic_v1'],
  grid_text_image_mosaic_v1: ['grid_text_image_cards_v1', 'grid_text_image_split_v1'],
  grid_three_images_text_v1: ['grid_three_images_text_horizontal_v1', 'grid_three_images_text_asymmetric_v1'],
  grid_three_images_text_horizontal_v1: ['grid_three_images_text_v1', 'grid_three_images_text_asymmetric_v1'],
  grid_three_images_text_asymmetric_v1: ['grid_three_images_text_v1', 'grid_three_images_text_horizontal_v1'],
  intro_three_para_icons_v1: ['intro_three_para_icons_horizontal_v1', 'intro_three_para_icons_radial_v1'],
  intro_three_para_icons_horizontal_v1: ['intro_three_para_icons_v1', 'intro_three_para_icons_radial_v1'],
  intro_three_para_icons_radial_v1: ['intro_three_para_icons_v1', 'intro_three_para_icons_horizontal_v1'],
  logo_partner_strip_v1: ['logo_partner_grid_v1', 'logo_partner_wall_v1'],
  logo_partner_grid_v1: ['logo_partner_strip_v1', 'logo_partner_wall_v1'],
  logo_partner_wall_v1: ['logo_partner_strip_v1', 'logo_partner_grid_v1'],
  logo_wall_v1: ['logo_wall_masonry_v1', 'logo_wall_centered_v1'],
  logo_wall_masonry_v1: ['logo_wall_v1', 'logo_wall_centered_v1'],
  logo_wall_centered_v1: ['logo_wall_v1', 'logo_wall_masonry_v1'],
  bullet_list_cards_v1: ['bullet_list_grid_v1', 'bullet_list_icon_rows_v1'],
  bullet_list_grid_v1: ['bullet_list_cards_v1', 'bullet_list_icon_rows_v1'],
  bullet_list_icon_rows_v1: ['bullet_list_cards_v1', 'bullet_list_grid_v1'],
  bullet_list_numbered_v1: ['bullet_list_numbered_vertical_v1', 'bullet_list_numbered_path_v1'],
  bullet_list_numbered_vertical_v1: ['bullet_list_numbered_v1', 'bullet_list_numbered_path_v1'],
  bullet_list_numbered_path_v1: ['bullet_list_numbered_v1', 'bullet_list_numbered_vertical_v1'],
  bullet_list_two_column_v1: ['bullet_list_split_v1', 'bullet_list_two_column_cards_v1'],
  bullet_list_split_v1: ['bullet_list_two_column_v1', 'bullet_list_two_column_cards_v1'],
  bullet_list_two_column_cards_v1: ['bullet_list_two_column_v1', 'bullet_list_split_v1'],
  comparison_side_by_side_v1: ['comparison_side_by_side_cards_v1', 'comparison_side_by_side_centerline_v1'],
  comparison_side_by_side_cards_v1: ['comparison_side_by_side_v1', 'comparison_side_by_side_centerline_v1'],
  comparison_side_by_side_centerline_v1: ['comparison_side_by_side_v1', 'comparison_side_by_side_cards_v1'],
  comparison_table_v1: ['comparison_table_grid_v1', 'comparison_table_highlight_v1'],
  comparison_table_grid_v1: ['comparison_table_v1', 'comparison_table_highlight_v1'],
  comparison_table_highlight_v1: ['comparison_table_v1', 'comparison_table_grid_v1'],
  four_images_text_v1: ['four_images_text_grid_v1', 'four_images_text_mosaic_v1'],
  four_images_text_grid_v1: ['four_images_text_v1', 'four_images_text_mosaic_v1'],
  four_images_text_mosaic_v1: ['four_images_text_v1', 'four_images_text_grid_v1'],
  four_para_image_v1: ['four_para_image_grid_v1', 'four_para_image_quadrant_v1'],
  four_para_image_grid_v1: ['four_para_image_v1', 'four_para_image_quadrant_v1'],
  four_para_image_quadrant_v1: ['four_para_image_v1', 'four_para_image_grid_v1'],
  full_bg_image_overlay_v1: ['full_bg_image_overlay_bottom_v1', 'full_bg_image_overlay_side_v1'],
  full_bg_image_overlay_bottom_v1: ['full_bg_image_overlay_v1', 'full_bg_image_overlay_side_v1'],
  full_bg_image_overlay_side_v1: ['full_bg_image_overlay_v1', 'full_bg_image_overlay_bottom_v1'],
  headline_centered_v1: ['headline_centered_statement_v1', 'headline_centered_frame_v1'],
  headline_centered_statement_v1: ['headline_centered_v1', 'headline_centered_frame_v1'],
  headline_centered_frame_v1: ['headline_centered_v1', 'headline_centered_statement_v1'],
  para_landscape_image_v1: ['para_landscape_image_top_v1', 'para_landscape_image_bottom_v1'],
  para_landscape_image_top_v1: ['para_landscape_image_v1', 'para_landscape_image_bottom_v1'],
  para_landscape_image_bottom_v1: ['para_landscape_image_v1', 'para_landscape_image_top_v1'],
  para_three_images_v1: ['para_three_images_horizontal_v1', 'para_three_images_staggered_v1'],
  para_three_images_horizontal_v1: ['para_three_images_v1', 'para_three_images_staggered_v1'],
  para_three_images_staggered_v1: ['para_three_images_v1', 'para_three_images_horizontal_v1'],
  para_title_left_image_boxed_v1: ['para_title_left_image_framed_v1', 'para_title_left_image_overlay_v1'],
  para_title_left_image_framed_v1: ['para_title_left_image_boxed_v1', 'para_title_left_image_overlay_v1'],
  para_title_left_image_overlay_v1: ['para_title_left_image_boxed_v1', 'para_title_left_image_framed_v1'],
  para_title_right_image_boxed_v1: ['para_title_right_image_framed_v1', 'para_title_right_image_overlay_v1'],
  para_title_right_image_framed_v1: ['para_title_right_image_boxed_v1', 'para_title_right_image_overlay_v1'],
  para_title_right_image_overlay_v1: ['para_title_right_image_boxed_v1', 'para_title_right_image_framed_v1'],
  section_divider_band_v1: ['section_divider_band_full_v1', 'section_divider_band_center_v1'],
  section_divider_band_full_v1: ['section_divider_band_v1', 'section_divider_band_center_v1'],
  section_divider_band_center_v1: ['section_divider_band_v1', 'section_divider_band_full_v1'],
  section_divider_centered_v1: ['section_divider_centered_large_v1', 'section_divider_centered_frame_v1'],
  section_divider_centered_large_v1: ['section_divider_centered_v1', 'section_divider_centered_frame_v1'],
  section_divider_centered_frame_v1: ['section_divider_centered_v1', 'section_divider_centered_large_v1'],
  section_divider_numbered_v1: ['section_divider_numbered_circle_v1', 'section_divider_numbered_side_v1'],
  section_divider_numbered_circle_v1: ['section_divider_numbered_v1', 'section_divider_numbered_side_v1'],
  section_divider_numbered_side_v1: ['section_divider_numbered_v1', 'section_divider_numbered_circle_v1'],
  section_divider_split_v1: ['section_divider_split_diagonal_v1', 'section_divider_split_image_v1'],
  section_divider_split_diagonal_v1: ['section_divider_split_v1', 'section_divider_split_image_v1'],
  section_divider_split_image_v1: ['section_divider_split_v1', 'section_divider_split_diagonal_v1'],
  section_left_image_v1: ['section_left_image_framed_v1', 'section_left_image_fullheight_v1'],
  section_left_image_framed_v1: ['section_left_image_v1', 'section_left_image_fullheight_v1'],
  section_left_image_fullheight_v1: ['section_left_image_v1', 'section_left_image_framed_v1'],
  section_right_image_v1: ['section_right_image_framed_v1', 'section_right_image_fullheight_v1'],
  section_right_image_framed_v1: ['section_right_image_v1', 'section_right_image_fullheight_v1'],
  section_right_image_fullheight_v1: ['section_right_image_v1', 'section_right_image_framed_v1'],
  text_two_column_v1: ['text_two_column_split_v1', 'text_two_column_balanced_v1'],
  text_two_column_split_v1: ['text_two_column_v1', 'text_two_column_balanced_v1'],
  text_two_column_balanced_v1: ['text_two_column_v1', 'text_two_column_split_v1'],
  title_minimal_v1: ['title_minimal_centered_v1', 'title_minimal_offset_v1'],
  title_minimal_centered_v1: ['title_minimal_v1', 'title_minimal_offset_v1'],
  title_minimal_offset_v1: ['title_minimal_v1', 'title_minimal_centered_v1'],
  title_fullbleed_v1: ['title_fullbleed_image_v1', 'title_fullbleed_overlay_v1'],
  title_fullbleed_image_v1: ['title_fullbleed_v1', 'title_fullbleed_overlay_v1'],
  title_fullbleed_overlay_v1: ['title_fullbleed_v1', 'title_fullbleed_image_v1'],
  title_hero_left_blob_v1: ['title_hero_left_shape_v1', 'title_hero_left_orbit_v1'],
  title_hero_left_shape_v1: ['title_hero_left_blob_v1', 'title_hero_left_orbit_v1'],
  title_hero_left_orbit_v1: ['title_hero_left_blob_v1', 'title_hero_left_shape_v1'],
  title_hero_left_fade_v1: ['title_hero_left_gradient_v1', 'title_hero_left_glow_v1'],
  title_hero_left_gradient_v1: ['title_hero_left_fade_v1', 'title_hero_left_glow_v1'],
  title_hero_left_glow_v1: ['title_hero_left_fade_v1', 'title_hero_left_gradient_v1'],
  title_hero_right_fade_v1: ['title_hero_right_gradient_v1', 'title_hero_right_glow_v1'],
  title_hero_right_gradient_v1: ['title_hero_right_fade_v1', 'title_hero_right_glow_v1'],
  title_hero_right_glow_v1: ['title_hero_right_fade_v1', 'title_hero_right_gradient_v1'],
  title_statement_v1: ['title_statement_large_v1', 'title_statement_split_v1'],
  title_statement_large_v1: ['title_statement_v1', 'title_statement_split_v1'],
  title_statement_split_v1: ['title_statement_v1', 'title_statement_large_v1'],
  title_with_logo_v1: ['title_with_logo_corner_v1', 'title_with_logo_centered_v1'],
  title_with_logo_corner_v1: ['title_with_logo_v1', 'title_with_logo_centered_v1'],
  title_with_logo_centered_v1: ['title_with_logo_v1', 'title_with_logo_corner_v1'],
  two_para_right_image_v1: ['two_para_right_image_bottom_v1', 'two_para_right_image_framed_v1'],
  two_para_right_image_bottom_v1: ['two_para_right_image_v1', 'two_para_right_image_framed_v1'],
  two_para_right_image_framed_v1: ['two_para_right_image_v1', 'two_para_right_image_bottom_v1'],
  wide_image_statement_bottom_v1: ['wide_image_statement_overlay_v1', 'wide_image_statement_center_v1'],
  wide_image_statement_overlay_v1: ['wide_image_statement_bottom_v1', 'wide_image_statement_center_v1'],
  wide_image_statement_center_v1: ['wide_image_statement_bottom_v1', 'wide_image_statement_overlay_v1'],
}

function resolveOverrideTemplates(currentLayoutId, layoutTemplates, layoutSchemaMap, overrideIds, limit) {
  const list = Array.isArray(layoutTemplates) ? layoutTemplates : []
  const out = []
  const seen = new Set()
  for (const lid of overrideIds) {
    const id = String(lid || '').trim()
    if (!id || id === currentLayoutId || seen.has(id)) continue
    const tpl =
      list.find((t) => templateLayoutId(t) === id) ||
      (layoutSchemaMap?.[id]
        ? { id, schema: layoutSchemaMap[id], contentType: layoutSchemaMap[id].content_type }
        : null)
    if (!tpl) continue
    seen.add(id)
    out.push(tpl)
    if (out.length >= limit) break
  }
  return out
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
  if (!list.length && !layoutSchemaMap) return []
  if (limit <= 0) return []

  const currentLayoutId = String(slide?.layoutId || slide?.layout_id || '').trim()
  const overrideIds = LAYOUT_SIMILAR_OVERRIDES[currentLayoutId]
  if (overrideIds?.length) {
    const fromOverrides = resolveOverrideTemplates(
      currentLayoutId,
      list,
      layoutSchemaMap,
      overrideIds,
      limit
    )
    if (fromOverrides.length) return fromOverrides
  }

  if (!list.length) return []
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
