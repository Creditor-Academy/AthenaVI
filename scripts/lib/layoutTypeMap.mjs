/** Map video template scene layoutType → presentation layout_id + contentType hints. */

export const LAYOUT_TYPE_MAP = {
  Cover: { layoutId: 'title_with_image_v1', contentType: 'image+text' },
  TwoColumn: { layoutId: 'section_with_image_v1', contentType: 'image+text' },
  ContactSplit: { layoutId: 'section_with_image_v1', contentType: 'image+text' },
  StatsHighlight: { layoutId: 'stat_three_up_v2', contentType: 'stat' },
  ServiceGrid: { layoutId: 'agenda_four_items_v1', contentType: 'agenda' },
  Syllabus: { layoutId: 'agenda_four_items_v1', contentType: 'agenda' },
  Pillars: { layoutId: 'agenda_four_items_v1', contentType: 'agenda' },
  ListRight: { layoutId: 'bullet_list_classic_v1', contentType: 'bullet_list' },
  Outcomes: { layoutId: 'bullet_list_classic_v1', contentType: 'bullet_list' },
  Tracker: { layoutId: 'bullet_list_classic_v1', contentType: 'bullet_list' },
  Timeline: { layoutId: 'timeline_four_steps_v1', contentType: 'timeline' },
  Nutrition: { layoutId: 'section_with_image_v1', contentType: 'image+text' },
  Promo: { layoutId: 'closing_centered_cta_v1', contentType: 'closing' },
  CTA: { layoutId: 'closing_centered_cta_v1', contentType: 'closing' },
  Bio: { layoutId: 'section_left_image_v1', contentType: 'image+text' },
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
