/** Backend-allowed slot roles for DECK_LAYOUT templates. */
export const DECK_LAYOUT_SLOT_ROLES = [
  'heading',
  'subheading',
  'body',
  'caption',
  'stat',
  'stat_label',
  'decoration',
  'background',
  'image',
  'chart',
  'table',
  'quote',
  'attribution',
  'cta',
  'contact',
  'eyebrow',
  'divider',
]

/** Common mistakes → valid backend role. */
export const DECK_LAYOUT_ROLE_ALIASES = {
  label: 'caption',
  icon: 'decoration',
  text: 'body',
  title: 'heading',
  subtitle: 'subheading',
  logo: 'decoration',
  photo: 'image',
  picture: 'image',
  graph: 'chart',
  author: 'attribution',
  bg: 'background',
}

export function normalizeDeckLayoutRole(role) {
  const raw = String(role || '').trim().toLowerCase()
  if (DECK_LAYOUT_SLOT_ROLES.includes(raw)) return raw
  return DECK_LAYOUT_ROLE_ALIASES[raw] || null
}

export function fixDeckLayoutSchemaRoles(schema) {
  const fixed = JSON.parse(JSON.stringify(schema || {}))
  const changes = []
  if (!Array.isArray(fixed.slots)) return { schema: fixed, changes }

  fixed.slots.forEach((slot, index) => {
    const next = normalizeDeckLayoutRole(slot?.role)
    if (!next) return
    if (slot.role !== next) {
      changes.push({ index, id: slot.id, from: slot.role, to: next })
      slot.role = next
    }
  })

  return { schema: fixed, changes }
}

export function validateDeckLayoutSchema(schema) {
  const errors = []
  if (!schema || typeof schema !== 'object') {
    return { ok: false, errors: ['Schema must be a JSON object'] }
  }
  if (!schema.layout_id) errors.push('layout_id is required')
  if (!Array.isArray(schema.slots)) {
    errors.push('slots must be an array')
    return { ok: false, errors }
  }

  schema.slots.forEach((slot, index) => {
    if (!slot?.id) errors.push(`slots[${index}].id is required`)
    if (!slot?.region) errors.push(`slots[${index}].region is required`)
    const role = String(slot?.role || '').trim().toLowerCase()
    if (!DECK_LAYOUT_SLOT_ROLES.includes(role)) {
      const suggested = normalizeDeckLayoutRole(slot?.role)
      errors.push(
        suggested
          ? `slots[${index}].role "${slot.role}" is invalid — use "${suggested}" instead`
          : `slots[${index}].role must be one of [${DECK_LAYOUT_SLOT_ROLES.join(', ')}]`
      )
    }
  })

  return { ok: errors.length === 0, errors }
}

function slot(id, region, role, placeholder_text, extra = {}) {
  return { id, region, role, ...(placeholder_text ? { placeholder_text } : {}), ...extra }
}

/** Ready-made layouts — pick in admin instead of writing JSON from scratch. */
export const DECK_LAYOUT_STARTERS = {
  title_centered: {
    label: 'Title — centered',
    suggestedName: 'Title Centered',
    contentType: 'title',
    schema: {
      layout_id: 'title_centered_v1',
      content_type: 'title',
      grid: '12-col',
      slots: [
        slot('MAIN_TITLE', 'cols 2-11, rows 4-6', 'heading', 'Presentation title'),
        slot('SUBTITLE', 'cols 3-10, rows 6-8', 'subheading', 'Tagline or company name'),
      ],
    },
  },
  image_right: {
    label: 'Text + image (right)',
    suggestedName: 'Section Right Image',
    contentType: 'image+text',
    schema: {
      layout_id: 'section_right_image_v1',
      content_type: 'image+text',
      grid: '12-col',
      slots: [
        slot('HEADING', 'cols 1-7, rows 3-5', 'heading', 'Section title'),
        slot('BODY', 'cols 1-7, rows 5-8', 'body', 'Explain what this section is about'),
        slot('HERO_IMAGE', 'cols 8-12, rows 1-10', 'image'),
      ],
    },
  },
  chart_split: {
    label: 'Chart + explanation',
    suggestedName: 'Chart Split',
    contentType: 'chart',
    schema: {
      layout_id: 'chart_exponential_split_v1',
      content_type: 'chart',
      grid: '12-col',
      preview: { mode: 'chart_split' },
      slots: [
        slot('HEADING', 'cols 2-6, rows 3-5', 'heading', 'Chart title'),
        slot('BODY', 'cols 2-6, rows 5-8', 'body', 'Supporting explanation'),
        slot('CHART', 'cols 7-11, rows 2-9', 'chart'),
        slot('CHART_CAPTION', 'cols 7-11, rows 9-10', 'caption', 'Chart subtitle'),
      ],
    },
  },
  grid_insights_chart: {
    label: 'Insights + chart + image',
    suggestedName: 'Grid Insights Chart',
    contentType: 'grid',
    schema: {
      layout_id: 'grid_insights_chart_v1',
      content_type: 'grid',
      grid: '12-col',
      preview: { mode: 'grid_insights_chart' },
      slots: [
        slot('INSIGHT_CARD_1_BG', 'cols 1-3, rows 1-2', 'background'),
        slot('INSIGHT_ICON_1', 'cols 1-3, rows 1-2', 'decoration'),
        slot('INSIGHT_LABEL_1', 'cols 1-3, rows 3-4', 'caption', 'Insight one', { max_lines: 2 }),
        slot('INSIGHT_CARD_2_BG', 'cols 4-6, rows 1-2', 'background'),
        slot('INSIGHT_ICON_2', 'cols 4-6, rows 1-2', 'decoration'),
        slot('INSIGHT_LABEL_2', 'cols 4-6, rows 3-4', 'caption', 'Insight two', { max_lines: 2 }),
        slot('INSIGHT_CARD_3_BG', 'cols 7-9, rows 1-2', 'background'),
        slot('INSIGHT_ICON_3', 'cols 7-9, rows 1-2', 'decoration'),
        slot('INSIGHT_LABEL_3', 'cols 7-9, rows 3-4', 'caption', 'Insight three', { max_lines: 2 }),
        slot('CHART_CARD_BG', 'cols 1-9, rows 5-10', 'background'),
        slot('CHART_HEADING', 'cols 1-9, rows 5-6', 'heading', 'Revenue growth', { max_lines: 1 }),
        slot('BAR_CHART', 'cols 1-9, rows 7-10', 'chart'),
        slot('CHART_CAPTION', 'cols 1-9, rows 10-11', 'caption', 'Monthly performance'),
        slot('POINT_CARD_BG', 'cols 10-12, rows 1-10', 'background'),
        slot('POINT_HEADING', 'cols 10-12, rows 1-2', 'heading', 'Key takeaway', { max_lines: 1 }),
        slot('POINT_BODY', 'cols 10-12, rows 3-5', 'body', 'Summarize what the chart means.', { max_lines: 3 }),
        slot('POINT_IMAGE', 'cols 10-12, rows 6-10', 'image'),
      ],
    },
  },
  stat_three: {
    label: 'Three stats row',
    suggestedName: 'Stat Three Up',
    contentType: 'stat',
    schema: {
      layout_id: 'stat_three_up_v2',
      content_type: 'stat',
      grid: '12-col',
      preview: { mode: 'stat_row' },
      slots: [
        slot('HEADING', 'cols 2-11, rows 2-3', 'heading', 'Why customers choose us'),
        slot('STAT_1_VALUE', 'cols 2-4, rows 5-7', 'stat', '98%'),
        slot('STAT_1_LABEL', 'cols 2-4, rows 7-8', 'stat_label', 'Customer satisfaction'),
        slot('STAT_2_VALUE', 'cols 5-8, rows 5-7', 'stat', '3.2x'),
        slot('STAT_2_LABEL', 'cols 5-8, rows 7-8', 'stat_label', 'Average ROI'),
        slot('STAT_3_VALUE', 'cols 9-11, rows 5-7', 'stat', '500+'),
        slot('STAT_3_LABEL', 'cols 9-11, rows 7-8', 'stat_label', 'Active teams'),
      ],
    },
  },
  image_gallery_three: {
    label: 'Three images row',
    suggestedName: 'Three Image Gallery',
    contentType: 'image+text',
    schema: {
      layout_id: 'image_three_gallery_v1',
      content_type: 'image+text',
      grid: '12-col',
      preview: { mode: 'image_gallery_three' },
      slots: [
        slot('HEADING', 'cols 2-11, rows 2-3', 'heading', 'Product highlights'),
        slot('SUBTITLE', 'cols 2-11, rows 3-4', 'subheading', 'Show three visuals with short labels.'),
        slot('IMAGE_1', 'cols 2-4, rows 5-8', 'image'),
        slot('IMAGE_1_LABEL', 'cols 2-4, rows 8-9', 'caption', 'Feature A'),
        slot('IMAGE_2', 'cols 5-8, rows 5-8', 'image'),
        slot('IMAGE_2_LABEL', 'cols 5-8, rows 8-9', 'caption', 'Feature B'),
        slot('IMAGE_3', 'cols 9-11, rows 5-8', 'image'),
        slot('IMAGE_3_LABEL', 'cols 9-11, rows 8-9', 'caption', 'Feature C'),
        slot('DOT_ACCENT', 'cols 2-11, rows 9-10', 'decoration'),
      ],
    },
  },
  agenda_numbered: {
    label: 'Agenda — numbered',
    suggestedName: 'Agenda Numbered',
    contentType: 'agenda',
    schema: {
      layout_id: 'agenda_numbered_v1',
      content_type: 'agenda',
      grid: '12-col',
      slots: [
        slot('HEADING', 'cols 2-11, rows 2-3', 'heading', "Today's agenda"),
        slot('NUM_1', 'cols 2-3, rows 4-5', 'stat', '01'),
        slot('ITEM_1', 'cols 4-11, rows 4-5', 'body', 'Context & goals'),
        slot('NUM_2', 'cols 2-3, rows 5-6', 'stat', '02'),
        slot('ITEM_2', 'cols 4-11, rows 5-6', 'body', 'Product walkthrough'),
        slot('NUM_3', 'cols 2-3, rows 6-7', 'stat', '03'),
        slot('ITEM_3', 'cols 4-11, rows 6-7', 'body', 'Proof & results'),
        slot('NUM_4', 'cols 2-3, rows 7-8', 'stat', '04'),
        slot('ITEM_4', 'cols 4-11, rows 7-8', 'body', 'Discussion & next steps'),
      ],
    },
  },
  quote_centered: {
    label: 'Quote — centered',
    suggestedName: 'Quote Centered',
    contentType: 'quote',
    schema: {
      layout_id: 'quote_centered_v1',
      content_type: 'quote',
      grid: '12-col',
      preview: { mode: 'quote_attribution' },
      slots: [
        slot('QUOTE', 'cols 2-11, rows 3-7', 'quote', 'A short quote that makes your point.'),
        slot('AUTHOR_NAME', 'cols 3-10, rows 8-9', 'attribution', 'Author name'),
        slot('AUTHOR_TITLE', 'cols 3-10, rows 9-10', 'caption', 'Author title · Company'),
      ],
    },
  },
  device_iphone: {
    label: 'Device — iPhone screenshot',
    suggestedName: 'Device iPhone Screenshot',
    contentType: 'device_frames',
    schema: {
      layout_id: 'device_iphone_screenshot_v1',
      content_type: 'device_frames',
      grid: '12-col',
      slots: [
        slot('HEADING', 'cols 1-6, rows 2-4', 'heading', 'Built for mobile-first teams'),
        slot('BODY', 'cols 1-6, rows 4-7', 'body', 'Show your product UI inside a phone frame.'),
        slot('DEVICE_FRAME', 'cols 7-11, rows 1-10', 'decoration'),
        slot('DEVICE_SCREEN', 'cols 7-11, rows 2-9', 'image'),
        slot('CAPTION', 'cols 7-11, rows 9-10', 'caption', 'iPhone · Product screenshot'),
      ],
    },
  },
  device_laptop: {
    label: 'Device — laptop / browser',
    suggestedName: 'Device Laptop Browser',
    contentType: 'device_frames',
    schema: {
      layout_id: 'device_laptop_browser_v1',
      content_type: 'device_frames',
      grid: '12-col',
      slots: [
        slot('HEADING', 'cols 2-11, rows 1-2', 'heading', 'Your product, full screen'),
        slot('SUBTITLE', 'cols 2-11, rows 2-3', 'subheading', 'Browser / laptop mockup for desktop UI'),
        slot('DEVICE_FRAME', 'cols 2-11, rows 3-9', 'decoration'),
        slot('DEVICE_SCREEN', 'cols 2-11, rows 4-8', 'image'),
        slot('CAPTION', 'cols 2-11, rows 9-10', 'caption', 'Desktop app screenshot'),
      ],
    },
  },
}

export function getDeckLayoutStarter(id) {
  return DECK_LAYOUT_STARTERS[id] || null
}

export function listDeckLayoutStarters() {
  return Object.entries(DECK_LAYOUT_STARTERS).map(([id, starter]) => ({
    id,
    label: starter.label,
    contentType: starter.contentType,
    layoutId: starter.schema?.layout_id,
  }))
}
