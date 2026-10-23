/** Map video template scene layoutType → presentation layout_id + contentType hints. */

export const LAYOUT_TYPE_MAP = {
  ServiceGrid: { layoutId: 'grid_bento_three_v1', contentType: 'grid' },
  Syllabus: { layoutId: 'intro_four_para_v1', contentType: 'bullet_list' },
  Pillars: { layoutId: 'grid_images_text_cards_v1', contentType: 'grid' },
  ListRight: { layoutId: 'four_para_image_v1', contentType: 'bullet_list' },
  Outcomes: { layoutId: 'four_para_image_v1', contentType: 'bullet_list' },
  Tracker: { layoutId: 'metric_three_v1', contentType: 'stat' },
  Timeline: { layoutId: 'timeline_horizontal_v1', contentType: 'timeline' },
  Nutrition: { layoutId: 'section_with_image_v1', contentType: 'image+text' },
  Promo: { layoutId: 'centered_text_cta_v1', contentType: 'closing' },
  CTA: { layoutId: 'centered_text_cta_v1', contentType: 'closing' },
  Bio: { layoutId: 'section_left_image_v1', contentType: 'image+text' },
  StatsHighlight: { layoutId: 'metric_single_v1', contentType: 'stat' },
  Cover: { layoutId: 'title_image_logo_v1', contentType: 'title' },
  TwoColumn: { layoutId: 'section_with_image_v1', contentType: 'image+text' },
  ContactSplit: { layoutId: 'contact_left_image_v1', contentType: 'closing' },
  PricingPlans: { layoutId: 'pricing_three_plans_v1', contentType: 'pricing' },
  TeamGrid: { layoutId: 'team_four_v1', contentType: 'team' },
  DeviceFrames: { layoutId: 'device_phone_vertical_split_v1', contentType: 'device_frames' },
}

export const DEFAULT_LAYOUT = {
  layoutId: 'section_divider_centered_v1',
  contentType: 'section_divider',
}

/**
 * @param {string} layoutType
 * @param {Record<string, string>} [overrides] layoutType → layout_id
 */
export function resolveLayoutMapping(layoutType, overrides = {}) {
  const key = String(layoutType || '').trim()
  if (overrides[key]) {
    const layoutId = overrides[key]
    const base = LAYOUT_TYPE_MAP[key] || DEFAULT_LAYOUT
    return { layoutId, contentType: base.contentType }
  }
  const mapped = LAYOUT_TYPE_MAP[key]
  if (mapped) return mapped
  return DEFAULT_LAYOUT
}

/** Collect unique layout ids referenced by scenes (respecting overrides). */
export function collectRequiredLayoutIds(scenes, overrides = {}) {
  const ids = new Set()
  for (const scene of scenes || []) {
    const { layoutId } = resolveLayoutMapping(scene.layoutType, overrides)
    if (layoutId) ids.add(layoutId)
  }
  return [...ids]
}
