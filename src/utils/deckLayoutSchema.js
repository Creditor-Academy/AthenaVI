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
  para_split: {
    label: 'Para + 50/50 image split',
    suggestedName: 'Para Split 50 50',
    contentType: 'image+text',
    schema: {
      layout_id: 'para_split_50_50_v1',
      content_type: 'image+text',
      schemaVersion: 2,
      grid: '12-col',
      slots: [
        slot('HERO_IMAGE', 'cols 1-6, rows 1-10', 'image', null, { layer: 2, fit: 'cover' }),
        slot('HEADING', 'cols 7-11, rows 3-4', 'heading', 'Describe this slide'),
        slot('BODY', 'cols 7-11, rows 4-8', 'body', 'Supporting paragraph text.'),
      ],
    },
  },
  statement_left: {
    label: 'Statement — left aligned',
    suggestedName: 'Statement Left',
    contentType: 'quote',
    schema: {
      layout_id: 'statement_left_v1',
      content_type: 'quote',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'quote_attribution' },
      slots: [
        slot('EYEBROW', 'cols 2-10, rows 3-4', 'eyebrow', 'Section context'),
        slot('STATEMENT', 'cols 2-10, rows 4-7', 'quote', 'Real beauty is to be true to oneself.'),
      ],
    },
  },
  three_cards: {
    label: 'Three cards — image + text',
    suggestedName: 'Three Cards Image Text',
    contentType: 'image+text',
    schema: {
      layout_id: 'three_cards_image_text_v1',
      content_type: 'image+text',
      schemaVersion: 2,
      grid: '12-col',
      slots: [
        slot('HEADING', 'cols 2-10, rows 2-3', 'heading', 'Product highlights'),
        slot('IMAGE_1', 'cols 2-4, rows 3-6', 'image'),
        slot('CARD_1_TITLE', 'cols 2-4, rows 6-7', 'heading', 'Feature A'),
        slot('IMAGE_2', 'cols 5-8, rows 3-6', 'image'),
        slot('CARD_2_TITLE', 'cols 5-8, rows 6-7', 'heading', 'Feature B'),
        slot('IMAGE_3', 'cols 9-11, rows 3-6', 'image'),
        slot('CARD_3_TITLE', 'cols 9-11, rows 6-7', 'heading', 'Feature C'),
      ],
    },
  },
  intro_four: {
    label: 'Intro — four items',
    suggestedName: 'Intro Four Para',
    contentType: 'bullet_list',
    schema: {
      layout_id: 'intro_four_para_v1',
      content_type: 'bullet_list',
      schemaVersion: 2,
      grid: '12-col',
      slots: [
        slot('INTRO', 'cols 2-10, rows 2-3', 'subheading', 'What we will cover'),
        slot('ITEM_1', 'cols 2-10, rows 3-4', 'body', '01 · Introduction'),
        slot('ITEM_2', 'cols 2-10, rows 4-5', 'body', '02 · Problem & opportunity'),
        slot('ITEM_3', 'cols 2-10, rows 5-6', 'body', '03 · Solution & proof'),
        slot('ITEM_4', 'cols 2-10, rows 6-7', 'body', '04 · Next steps'),
      ],
    },
  },
  full_bg_overlay: {
    label: 'Full-bleed image + overlay text',
    suggestedName: 'Full Bg Image Overlay',
    contentType: 'image+text',
    schema: {
      layout_id: 'full_bg_image_overlay_v1',
      content_type: 'image+text',
      schemaVersion: 2,
      grid: '12-col',
      slots: [
        slot('BACKGROUND_IMAGE', 'cols 1-12, rows 1-10', 'background', null, { layer: 0, fit: 'cover' }),
        slot('MAIN_TITLE', 'cols 2-10, rows 3-5', 'heading', 'Presentation title'),
        slot('SUBTITLE', 'cols 2-10, rows 5-6', 'subheading', 'Supporting line'),
      ],
    },
  },
  closing_cta: {
    label: 'Closing — centered CTA',
    suggestedName: 'Centered Text CTA',
    contentType: 'closing',
    schema: {
      layout_id: 'centered_text_cta_v1',
      content_type: 'closing',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'closing_cta' },
      slots: [
        slot('HEADING', 'cols 3-10, rows 3-5', 'heading', 'Thank you'),
        slot('CTA', 'cols 4-9, rows 6-7', 'cta', 'Book a demo'),
        slot('CONTACT', 'cols 4-9, rows 8-9', 'caption', 'hello@company.com'),
      ],
    },
  },
  grid_bento_three: {
    label: 'Grid — bento three images',
    suggestedName: 'Grid Bento Three',
    contentType: 'grid',
    schema: {
      layout_id: 'grid_bento_three_v1',
      content_type: 'grid',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'grid_bento_three' },
      slots: [
        slot('IMAGE_1', 'cols 1-6, rows 1-5', 'image'),
        slot('IMAGE_2', 'cols 1-6, rows 6-10', 'image'),
        slot('IMAGE_3', 'cols 7-12, rows 1-10', 'image'),
      ],
    },
  },
  grid_insights_chart: {
    label: 'Grid — insights + chart',
    suggestedName: 'Grid Insights Chart',
    contentType: 'grid',
    schema: {
      layout_id: 'grid_insights_chart_v1',
      content_type: 'grid',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'grid_insights_chart' },
      slots: [
        slot('INSIGHT_LABEL_1', 'cols 1-3, rows 3-4', 'caption', 'Insight one'),
        slot('INSIGHT_LABEL_2', 'cols 4-6, rows 3-4', 'caption', 'Insight two'),
        slot('INSIGHT_LABEL_3', 'cols 7-9, rows 3-4', 'caption', 'Insight three'),
        slot('CHART_HEADING', 'cols 1-9, rows 5-6', 'heading', 'Revenue growth'),
        slot('BAR_CHART', 'cols 1-9, rows 7-10', 'chart'),
        slot('POINT_HEADING', 'cols 10-12, rows 1-2', 'heading', 'Key takeaway'),
        slot('POINT_BODY', 'cols 10-12, rows 3-5', 'body', 'Summarize what the chart means.'),
        slot('POINT_IMAGE', 'cols 10-12, rows 6-10', 'image'),
      ],
    },
  },
  chart_with_description: {
    label: 'Chart + description',
    suggestedName: 'Chart With Description',
    contentType: 'chart',
    schema: {
      layout_id: 'chart_with_description_v1',
      content_type: 'chart',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'chart_split' },
      slots: [
        slot('HEADING', 'cols 2-6, rows 2-3', 'heading', 'Chart title'),
        slot('BODY', 'cols 2-6, rows 3-8', 'body', 'Explain the data.'),
        slot('MAIN_CHART', 'cols 7-11, rows 2-10', 'chart'),
      ],
    },
  },
  metric_three: {
    label: 'Three metrics row',
    suggestedName: 'Metric Three',
    contentType: 'stat',
    schema: {
      layout_id: 'metric_three_v1',
      content_type: 'stat',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'stat_row' },
      slots: [
        slot('HEADING', 'cols 2-11, rows 1-2', 'heading', 'Key metrics'),
        slot('STAT_1_VALUE', 'cols 1-4, rows 4-5', 'stat', '98%'),
        slot('STAT_1_LABEL', 'cols 1-4, rows 5-7', 'stat_label', 'Customer satisfaction'),
        slot('STAT_2_VALUE', 'cols 5-8, rows 4-5', 'stat', '3.2x'),
        slot('STAT_2_LABEL', 'cols 5-8, rows 5-7', 'stat_label', 'Average ROI'),
        slot('STAT_3_VALUE', 'cols 9-12, rows 4-5', 'stat', '500+'),
        slot('STAT_3_LABEL', 'cols 9-12, rows 5-7', 'stat_label', 'Active teams'),
      ],
    },
  },
  table_single: {
    label: 'Table only',
    suggestedName: 'Table Single',
    contentType: 'chart',
    schema: {
      layout_id: 'table_single_v1',
      content_type: 'chart',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'table_preview' },
      slots: [
        slot('HEADING', 'cols 2-11, rows 1-2', 'heading', 'Data table'),
        slot('TABLE', 'cols 2-11, rows 3-10', 'table'),
      ],
    },
  },
  pricing_three: {
    label: 'Pricing — three plans',
    suggestedName: 'Pricing Three Plans',
    contentType: 'pricing',
    schema: {
      layout_id: 'pricing_three_plans_v1',
      content_type: 'pricing',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'pricing_plans' },
      slots: [
        slot('EYEBROW', 'cols 2-11, rows 1-2', 'eyebrow', 'Choose a plan'),
        slot('PLAN_1_LABEL', 'cols 1-4, rows 2-3', 'heading', 'Basic'),
        slot('PLAN_1_PRICE', 'cols 1-4, rows 3-4', 'stat', '$99'),
        slot('PLAN_2_LABEL', 'cols 5-8, rows 2-3', 'heading', 'Standard'),
        slot('PLAN_2_PRICE', 'cols 5-8, rows 3-4', 'stat', '$299'),
        slot('PLAN_3_LABEL', 'cols 9-12, rows 2-3', 'heading', 'Pro'),
        slot('PLAN_3_PRICE', 'cols 9-12, rows 3-4', 'stat', '$999'),
      ],
    },
  },
  agenda_three: {
    label: 'Agenda — three columns',
    suggestedName: 'Agenda Three Columns',
    contentType: 'agenda',
    schema: {
      layout_id: 'agenda_three_columns_v1',
      content_type: 'agenda',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'agenda_three_columns' },
      slots: [
        slot('HEADING', 'cols 2-11, rows 1-2', 'heading', 'Agenda'),
        slot('AGENDA_COL_1_HEADING', 'cols 1-4, rows 2-3', 'heading', 'Morning'),
        slot('AGENDA_COL_2_HEADING', 'cols 5-8, rows 2-3', 'heading', 'Afternoon'),
        slot('AGENDA_COL_3_HEADING', 'cols 9-12, rows 2-3', 'heading', 'Evening'),
      ],
    },
  },
  team_three: {
    label: 'Team — three members',
    suggestedName: 'Team Three Horizontal',
    contentType: 'team',
    schema: {
      layout_id: 'team_three_horizontal_v1',
      content_type: 'team',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'team_three_horizontal' },
      slots: [
        slot('HEADING', 'cols 2-11, rows 1-2', 'heading', 'Meet the team'),
        slot('MEMBER_1_NAME', 'cols 2-4, rows 6-7', 'heading', 'Johanna Doe'),
        slot('MEMBER_1_ROLE', 'cols 2-4, rows 7-8', 'caption', 'CEO'),
        slot('MEMBER_2_NAME', 'cols 5-7, rows 6-7', 'heading', 'Jane Doe'),
        slot('MEMBER_3_NAME', 'cols 8-10, rows 6-7', 'heading', 'Joe Doe'),
      ],
    },
  },
  contact_split: {
    label: 'Contact — image left',
    suggestedName: 'Contact Left Image',
    contentType: 'team',
    schema: {
      layout_id: 'contact_left_image_v1',
      content_type: 'team',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'contact_split_left' },
      slots: [
        slot('CONTACT_IMAGE', 'cols 1-6, rows 1-10', 'image'),
        slot('HEADING', 'cols 7-11, rows 2-3', 'heading', 'Contact me'),
        slot('CONTACT_ADDRESS', 'cols 7-11, rows 5-6', 'body', '123 Main Street'),
        slot('CONTACT_PHONE', 'cols 7-11, rows 7-8', 'body', '+1 (555) 123-4567'),
        slot('CONTACT_EMAIL', 'cols 7-11, rows 9-10', 'body', 'hello@example.com'),
      ],
    },
  },
  device_phone_split: {
    label: 'Device — phone + description',
    suggestedName: 'Device Phone Vertical Split',
    contentType: 'device_frames',
    schema: {
      layout_id: 'device_phone_vertical_split_v1',
      content_type: 'device_frames',
      schemaVersion: 2,
      grid: '12-col',
      preview: { mode: 'device_phone_vertical_split' },
      slots: [
        slot('HEADING', 'cols 1-6, rows 2-3', 'heading', 'Describe this mockup'),
        slot('BODY', 'cols 1-6, rows 7-9', 'body', 'Supporting description.'),
        slot('DEVICE_IMAGE', 'cols 9-12, rows 2-9', 'image'),
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
