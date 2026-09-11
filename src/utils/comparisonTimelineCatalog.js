/**
 * Comparison + timeline layouts (previously missing from catalog).
 */

import {
  slot,
  typo,
  centeredTypo,
  layoutBase,
  heading,
  body,
  imageRight,
  cardShapeHint,
} from './deckLayoutV2Helpers.js'

const P = {
  short: 'Supporting paragraph with three to four lines of scannable copy that explains the key idea without overwhelming the slide.',
  one: 'Supporting paragraph with three to four lines of scannable copy that explains the key idea without overwhelming the slide.',
}

function milestoneSlots(count = 4) {
  const cols = [
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
  ]
  const slots = []
  for (let i = 0; i < count; i += 1) {
    const [c1, c2] = cols[i] || [2 + i * 2, 3 + i * 2]
    slots.push(
      slot(`milestone_${i + 1}`, `cols ${c1}-${c2}, rows 4-5`, 'body', `${i + 1}. Milestone label`, {
        layer: 10,
        typography: { ...typo('heading', { fontSize: 16, align: 'center' }) },
        max_lines: 2,
      })
    )
  }
  return slots
}

function milestoneDetailSlots(count = 4) {
  const cols = [
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
  ]
  const slots = []
  for (let i = 0; i < count; i += 1) {
    const [c1, c2] = cols[i] || [2 + i * 2, 3 + i * 2]
    slots.push(
      cardShapeHint(`cols ${c1}-${c2}, rows 3-6`, `MILESTONE_${i + 1}_CARD_BG`, 10, `milestone_${i + 1}_label`),
      slot(`milestone_${i + 1}_label`, `cols ${c1}-${c2}, rows 3-4`, 'subheading', '2020', {
        layer: 10,
        typography: { ...typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }) },
        max_lines: 1,
      }),
      slot(`milestone_${i + 1}_detail`, `cols ${c1}-${c2}, rows 4-6`, 'body', 'Key event summary', {
        layer: 10,
        typography: { ...typo('body', { fontSize: 14, align: 'center' }) },
        max_lines: 3,
      })
    )
  }
  return slots
}

function milestoneImageDetailSlots(count = 4) {
  const cols = [
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
  ]
  const slots = []
  for (let i = 0; i < count; i += 1) {
    const [c1, c2] = cols[i] || [2 + i * 2, 3 + i * 2]
    const n = i + 1
    slots.push(
      slot(`IMAGE_${n}`, `cols ${c1}-${c2}, rows 3-5`, 'image', null, { layer: 2, fit: 'cover' }),
      cardShapeHint(`cols ${c1}-${c2}, rows 5-8`, `MILESTONE_${n}_CARD_BG`, 10, `milestone_${n}_label`),
      slot(`milestone_${n}_label`, `cols ${c1}-${c2}, rows 5-6`, 'subheading', '2020', {
        layer: 10,
        typography: { ...typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }) },
        max_lines: 1,
      }),
      slot(`milestone_${n}_detail`, `cols ${c1}-${c2}, rows 6-8`, 'body', 'Key event summary', {
        layer: 10,
        typography: typo('body', { fontSize: 14, align: 'center' }),
        max_lines: 3,
      })
    )
  }
  return slots
}

const CATALOG = {
  comparison_side_by_side_v1: layoutBase('comparison_side_by_side_v1', 'comparison', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Compare options', { max_lines: 2 }),
    slot('LEFT_TITLE', 'cols 1-6, rows 2-3', 'heading', 'Option A', {
      layer: 10,
      typography: typo('heading', { fontSize: 24 }),
      max_lines: 2,
    }),
    slot('RIGHT_TITLE', 'cols 7-12, rows 2-3', 'heading', 'Option B', {
      layer: 10,
      typography: typo('heading', { fontSize: 24 }),
      max_lines: 2,
    }),
    body('LEFT_BODY', 'cols 1-6, rows 3-9', P.one, 5),
    body('RIGHT_BODY', 'cols 7-12, rows 3-9', P.one, 5),
  ], { mode: 'comparison_columns' }),

  comparison_pros_cons_v1: layoutBase('comparison_pros_cons_v1', 'comparison', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Pros and cons', { max_lines: 2 }),
    slot('PROS_PROJECT_TITLE', 'cols 1-3, rows 3-4', 'heading', 'Project One', {
      layer: 10,
      typography: typo('heading', { fontSize: 24, align: 'center', colorRole: 'surface' }),
    }),
    slot('CONS_PROJECT_TITLE', 'cols 10-12, rows 3-4', 'heading', 'Project Two', {
      layer: 10,
      typography: typo('heading', { fontSize: 24, align: 'center', colorRole: 'surface' }),
    }),
    ...[1, 2, 3, 4, 5].flatMap((r) => [
      slot(`PROS_${r}_TITLE`, `cols 4-5, rows ${r+2}-${r+3}`, 'heading', 'Advantage', { layer: 10, typography: typo('heading', { fontSize: 16, align: 'right' }) }),
      slot(`PROS_${r}_BODY`, `cols 4-5, rows ${r+3}-${r+4}`, 'body', 'Supporting details', { layer: 10, typography: typo('body', { fontSize: 12, align: 'right' }) }),
      slot(`CONS_${r}_TITLE`, `cols 8-9, rows ${r+2}-${r+3}`, 'heading', 'Risk', { layer: 10, typography: typo('heading', { fontSize: 16, align: 'left' }) }),
      slot(`CONS_${r}_BODY`, `cols 8-9, rows ${r+3}-${r+4}`, 'body', 'Supporting details', { layer: 10, typography: typo('body', { fontSize: 12, align: 'left' }) })
    ])
  ], { mode: 'comparison_pros_cons' }),

  comparison_pros_cons_split_v1: layoutBase('comparison_pros_cons_split_v1', 'comparison', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Pros and Cons', { max_lines: 2 }),
    ...[1, 2, 3].flatMap((r) => [
      slot(`PROS_${r}_TITLE`, `cols ${r*3+1}-${r*3+3}, rows 3-4`, 'heading', 'Insert Headline', { layer: 10, typography: typo('heading', { fontSize: 16, align: 'left', colorRole: 'primary' }) }),
      slot(`PROS_${r}_BODY`, `cols ${r*3+1}-${r*3+3}, rows 4-5`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', { layer: 10, typography: typo('body', { fontSize: 12, align: 'left' }) }),
      slot(`CONS_${r}_TITLE`, `cols ${r*3+1}-${r*3+3}, rows 6-7`, 'heading', 'Insert Headline', { layer: 10, typography: typo('heading', { fontSize: 16, align: 'left', colorRole: 'secondary' }) }),
      slot(`CONS_${r}_BODY`, `cols ${r*3+1}-${r*3+3}, rows 7-8`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', { layer: 10, typography: typo('body', { fontSize: 12, align: 'left' }) })
    ])
  ], { mode: 'comparison_pros_cons_split' }),

  timeline_horizontal_v1: layoutBase('timeline_horizontal_v1', 'timeline', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Timeline', { max_lines: 2 }),
    ...milestoneSlots(4),
  ], { mode: 'timeline_horizontal', timelineVariant: 'default' }),

  timeline_milestones_v1: layoutBase('timeline_milestones_v1', 'timeline', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key milestones', { max_lines: 2 }),
    ...milestoneDetailSlots(4),
  ], { mode: 'timeline_horizontal', timelineVariant: 'default' }),

  timeline_milestones_image_v1: layoutBase('timeline_milestones_image_v1', 'timeline', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key milestones', { max_lines: 2 }),
    ...milestoneImageDetailSlots(4),
  ], { mode: 'timeline_milestones_image', timelineVariant: 'default' }),

  timeline_vertical_v1: layoutBase('timeline_vertical_v1', 'timeline', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Project phases', { max_lines: 2 }),
    slot('milestone_1_label', 'cols 2-4, rows 2-3', 'subheading', 'Phase 1', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
      max_lines: 1,
    }),
    slot('milestone_1_detail', 'cols 2-4, rows 3-5', 'body', 'Discovery and planning', {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 3,
    }),
    slot('milestone_2_label', 'cols 2-4, rows 5-6', 'subheading', 'Phase 2', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    slot('milestone_2_detail', 'cols 2-4, rows 6-8', 'body', 'Build and iterate', {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 3,
    }),
    slot('milestone_3_label', 'cols 2-4, rows 8-9', 'subheading', 'Phase 3', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    slot('milestone_3_detail', 'cols 2-4, rows 9-10', 'body', 'Launch and scale', {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 2,
    }),
    slot('milestone_4_label', 'cols 6-8, rows 2-3', 'subheading', '2024 Q1', {
      layer: 10,
      typography: typo('caption', { fontSize: 13, fontWeight: 700 }),
    }),
    slot('milestone_4_detail', 'cols 6-8, rows 3-5', 'body', 'Milestone detail', {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 3,
    }),
    slot('milestone_5_label', 'cols 6-8, rows 5-6', 'subheading', '2024 Q3', {
      layer: 10,
      typography: typo('caption', { fontSize: 13, fontWeight: 700 }),
    }),
    slot('milestone_5_detail', 'cols 6-8, rows 6-8', 'body', 'Milestone detail', {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 3,
    }),
  ], { mode: 'timeline_vertical', timelineVariant: 'default' }),

  timeline_roadmap_v1: layoutBase('timeline_roadmap_v1', 'timeline', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Product roadmap', { max_lines: 2 }),
    slot('milestone_1_label', 'cols 1-3, rows 3-4', 'subheading', 'Q1', {
      layer: 10,
      typography: { ...typo('heading', { fontSize: 20, align: 'center' }), colorRole: 'primary' },
    }),
    slot('milestone_1_detail', 'cols 1-3, rows 4-6', 'body', 'Foundation release', {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 3,
    }),
    slot('milestone_2_label', 'cols 4-6, rows 3-4', 'subheading', 'Q2', {
      layer: 10,
      typography: { ...typo('heading', { fontSize: 20, align: 'center' }), colorRole: 'primary' },
    }),
    slot('milestone_2_detail', 'cols 4-6, rows 4-6', 'body', 'Growth features', {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 3,
    }),
    slot('milestone_3_label', 'cols 7-9, rows 3-4', 'subheading', 'Q3', {
      layer: 10,
      typography: { ...typo('heading', { fontSize: 20, align: 'center' }), colorRole: 'primary' },
    }),
    slot('milestone_3_detail', 'cols 7-9, rows 4-6', 'body', 'Enterprise push', {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 3,
    }),
    slot('milestone_4_label', 'cols 10-12, rows 3-4', 'subheading', 'Q4', {
      layer: 10,
      typography: { ...typo('heading', { fontSize: 20, align: 'center' }), colorRole: 'primary' },
    }),
    slot('milestone_4_detail', 'cols 10-12, rows 4-6', 'body', 'Scale and optimize', {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 3,
    }),
  ], { mode: 'timeline_roadmap', timelineVariant: 'default' }),

  timeline_process_steps_v1: layoutBase('timeline_process_steps_v1', 'timeline', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'How it works', {
      typography: typo('heading', { fontSize: 28, align: 'left' }),
      max_lines: 1,
    }),
    ...[1, 2, 3, 4, 5, 6].flatMap((n) => {
      const labels = ['01', '02', '03', '04', '05', '06']
      const titles = ['Discover', 'Design', 'Build', 'Launch', 'Scale', 'Title']
      const col = n === 1 ? '1-2' : n === 2 ? '3-4' : n === 3 ? '5-6' : n === 4 ? '7-8' : n === 5 ? '9-10' : '11-12'
      return [
        slot(`step_${n}_label`, `cols ${col}, rows 5-6`, 'caption', labels[n - 1], {
          layer: 10,
          typography: typo('caption', { fontSize: 28, align: 'center', fontWeight: 800 }),
          max_lines: 1,
        }),
        slot(`step_${n}_title`, `cols ${col}, rows ${n % 2 === 1 ? '7-8' : '4-5'}`, 'heading', titles[n - 1], {
          layer: 10,
          typography: typo('heading', { fontSize: 14, align: 'center', fontWeight: 700 }),
          max_lines: 1,
        }),
        slot(`step_${n}_desc`, `cols ${col}, rows ${n % 2 === 1 ? '3-4' : '8-9'}`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', {
          layer: 10,
          typography: typo('body', { fontSize: 11, align: 'center' }),
          max_lines: 2,
        }),
        slot(`step_${n}_detail`, `cols ${col}, rows ${n % 2 === 1 ? '9-10' : '2-3'}`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', {
          layer: 10,
          typography: typo('body', { fontSize: 10, align: 'center' }),
          max_lines: 3,
        }),
      ]
    }),
  ], { mode: 'timeline_process_steps', timelineVariant: 'default' }),

  comparison_table_v1: layoutBase('comparison_table_v1', 'comparison', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Feature comparison', { max_lines: 2, typography: typo('heading', { align: 'center' }) }),
    slot('LEFT_HEADER', 'cols 1-5, rows 2-3', 'heading', 'Option A', { layer: 10, typography: typo('heading', { fontSize: 24, align: 'center', colorRole: 'surface' }) }),
    slot('RIGHT_HEADER', 'cols 8-12, rows 2-3', 'heading', 'Option B', { layer: 10, typography: typo('heading', { fontSize: 24, align: 'center', colorRole: 'surface' }) }),
    ...[1, 2, 3].flatMap((r) => [
      slot(`ROW_${r}_LEFT_TITLE`, `cols 1-5, rows ${r+2}-${r+3}`, 'heading', 'Lorem Ipsum', { layer: 10, typography: typo('heading', { fontSize: 20, align: 'center' }) }),
      slot(`ROW_${r}_LEFT_BODY`, `cols 1-5, rows ${r+3}-${r+4}`, 'body', P.short, { layer: 10, typography: typo('body', { fontSize: 14, align: 'center' }) }),
      slot(`ROW_${r}_RIGHT_TITLE`, `cols 8-12, rows ${r+2}-${r+3}`, 'heading', 'Lorem Ipsum', { layer: 10, typography: typo('heading', { fontSize: 20, align: 'center' }) }),
      slot(`ROW_${r}_RIGHT_BODY`, `cols 8-12, rows ${r+3}-${r+4}`, 'body', P.short, { layer: 10, typography: typo('body', { fontSize: 14, align: 'center' }) }),
    ])
  ], { mode: 'comparison_table_cards' }),

  comparison_before_after_v1: layoutBase('comparison_before_after_v1', 'comparison', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Before and after', { max_lines: 2 }),
    slot('LEFT_TITLE', 'cols 2-4, rows 2-3', 'heading', 'Before', {
      layer: 10,
      typography: typo('heading', { fontSize: 24, align: 'center' }),
    }),
    slot('RIGHT_TITLE', 'cols 9-11, rows 2-3', 'heading', 'After', {
      layer: 10,
      typography: typo('heading', { fontSize: 24, align: 'center' }),
    }),
    ...[1, 2, 3].flatMap((r) => [
      slot(`ROW_${r}_LEFT_TITLE`, `cols 1-4, rows ${r*2}-${r*2+1}`, 'heading', 'Title Text Here', { layer: 10, typography: typo('heading', { fontSize: 18, align: 'right' }) }),
      slot(`ROW_${r}_LEFT_BODY`, `cols 1-4, rows ${r*2+1}-${r*2+2}`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', { layer: 10, typography: typo('body', { fontSize: 12, align: 'right' }) }),
      slot(`ROW_${r}_METRIC`, `cols 5-8, rows ${r*2}-${r*2+2}`, 'heading', '25% ➔ 50%', { layer: 10, typography: typo('heading', { fontSize: 28, align: 'center', colorRole: 'surface' }) }),
      slot(`ROW_${r}_RIGHT_TITLE`, `cols 9-12, rows ${r*2}-${r*2+1}`, 'heading', 'Title Text Here', { layer: 10, typography: typo('heading', { fontSize: 18, align: 'left' }) }),
      slot(`ROW_${r}_RIGHT_BODY`, `cols 9-12, rows ${r*2+1}-${r*2+2}`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', { layer: 10, typography: typo('body', { fontSize: 12, align: 'left' }) })
    ])
  ], { mode: 'comparison_before_after' }),

  bullet_list_cards_v1: layoutBase('bullet_list_cards_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key points', { max_lines: 2 }),
    cardShapeHint('cols 1-3, rows 2-6', 'CARD_1_BG', 10, 'CARD_1_TITLE'),
    slot('CARD_1_TITLE', 'cols 1-3, rows 2-3', 'heading', 'Point one', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('CARD_1_BODY', 'cols 1-3, rows 3-6', P.short, 3),
    cardShapeHint('cols 4-6, rows 2-6', 'CARD_2_BG', 10, 'CARD_2_TITLE'),
    slot('CARD_2_TITLE', 'cols 4-6, rows 2-3', 'heading', 'Point two', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('CARD_2_BODY', 'cols 4-6, rows 3-6', P.short, 3),
    cardShapeHint('cols 7-9, rows 2-6', 'CARD_3_BG', 10, 'CARD_3_TITLE'),
    slot('CARD_3_TITLE', 'cols 7-9, rows 2-3', 'heading', 'Point three', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('CARD_3_BODY', 'cols 7-9, rows 3-6', P.short, 3),
    cardShapeHint('cols 10-12, rows 2-6', 'CARD_4_BG', 10, 'CARD_4_TITLE'),
    slot('CARD_4_TITLE', 'cols 10-12, rows 2-3', 'heading', 'Point four', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('CARD_4_BODY', 'cols 10-12, rows 3-6', P.short, 3),
  ], { mode: 'two_image_columns', slideVariant: 'cards' }),

  section_divider_numbered_v1: layoutBase('section_divider_numbered_v1', 'section_divider', [
    slot('SECTION_NUMBER', 'cols 5-8, rows 3-4', 'stat', '02', {
      layer: 10,
      typography: centeredTypo('stat', { fontSize: 56 }),
    }),
    heading('HEADING', 'cols 2-11, rows 4-6', 'Next chapter', {
      typography: centeredTypo('heading'),
    }),
    slot('SUBTITLE', 'cols 3-10, rows 6-7', 'subheading', 'What we cover in this section', {
      layer: 10,
      typography: centeredTypo('subheading'),
    }),
  ]),
}

function timelineFromSource(layoutId, sourceId, timelineVariant) {
  const source = CATALOG[sourceId]
  if (!source?.slots?.length) {
    throw new Error(`timelineFromSource: missing source ${sourceId}`)
  }
  return layoutBase(
    layoutId,
    'timeline',
    JSON.parse(JSON.stringify(source.slots)),
    { mode: source.preview?.mode, timelineVariant }
  )
}

function comparisonFromSource(layoutId, sourceId, slideVariant, extraPreview = {}) {
  const source = CATALOG[sourceId]
  if (!source?.slots?.length) {
    throw new Error(`comparisonFromSource: missing source ${sourceId}`)
  }
  const { mode, ...restPreview } = source.preview || {}
  return layoutBase(
    layoutId,
    source.content_type,
    JSON.parse(JSON.stringify(source.slots)),
    { mode, slideVariant, ...restPreview, ...extraPreview }
  )
}

Object.assign(CATALOG, {
  timeline_horizontal_cards_v1: timelineFromSource('timeline_horizontal_cards_v1', 'timeline_horizontal_v1', 'cards'),
  timeline_milestones_image_right_v1: timelineFromSource('timeline_milestones_image_right_v1', 'timeline_milestones_image_v1', 'image_right'),
  timeline_milestones_cards_v1: timelineFromSource('timeline_milestones_cards_v1', 'timeline_milestones_v1', 'cards'),
  timeline_process_horizontal_v1: layoutBase('timeline_process_horizontal_v1', 'timeline', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Horizontal Timeline Infographic', {
      typography: typo('heading', { fontSize: 32, align: 'center' }),
      max_lines: 1,
    }),
    ...[1, 2, 3, 4, 5, 6].flatMap((n) => {
      const years = ['1980', '1985', '2000', '2005', '2010', '2015']
      const col = n === 1 ? '1-2' : n === 2 ? '3-4' : n === 3 ? '5-6' : n === 4 ? '7-8' : n === 5 ? '9-10' : '11-12'
      return [
        slot(`step_${n}_year`, `cols ${col}, rows 6-7`, 'caption', years[n - 1], {
          layer: 10,
          typography: typo('caption', { fontSize: 20, align: 'center', fontWeight: 700 }),
          max_lines: 1,
        }),
        slot(`step_${n}_title`, `cols ${col}, rows 8-9`, 'heading', 'Add Your Text Here', {
          layer: 10,
          typography: typo('heading', { fontSize: 16, align: 'center', fontWeight: 700 }),
          max_lines: 1,
        }),
        slot(`step_${n}_desc`, `cols ${col}, rows 9-10`, 'body', 'Lorem ipsum dolor sit amet.', {
          layer: 10,
          typography: typo('body', { fontSize: 11, align: 'center' }),
          max_lines: 2,
        }),
      ]
    }),
  ], { mode: 'timeline_process_horizontal', timelineVariant: 'horizontal' }),
  timeline_vertical_cards_v1: timelineFromSource('timeline_vertical_cards_v1', 'timeline_vertical_v1', 'cards'),
  bullet_list_grid_v1: comparisonFromSource('bullet_list_grid_v1', 'bullet_list_cards_v1', 'grid'),
  comparison_side_by_side_cards_v1: comparisonFromSource('comparison_side_by_side_cards_v1', 'comparison_side_by_side_v1', 'cards'),
  comparison_side_by_side_centerline_v1: comparisonFromSource('comparison_side_by_side_centerline_v1', 'comparison_side_by_side_v1', 'centerline'),
  comparison_table_grid_v1: comparisonFromSource('comparison_table_grid_v1', 'comparison_table_v1', 'grid'),
  section_divider_numbered_circle_v1: comparisonFromSource('section_divider_numbered_circle_v1', 'section_divider_numbered_v1', 'circle'),
})

const TLH_BODY = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'
CATALOG.timeline_horizontal_v1 = layoutBase('timeline_horizontal_v1', 'timeline', [
  heading('HEADING', 'cols 1-12, rows 1-2', '5-Year Horizontal Timeline', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4, 5].flatMap((n) => {
    const years = ['2021', '2022', '2023', '2024', '2025']
    const col = n === 1 ? '1-3' : n === 2 ? '3-5' : n === 3 ? '5-7' : n === 4 ? '7-9' : '10-12'
    return [
      slot(`milestone_${n}_label`, `cols ${col}, rows 2-3`, 'caption', years[n - 1], { layer: 10, typography: typo('caption', { fontSize: 16, align: 'center', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_num`, `cols ${col}, rows 3-4`, 'stat', String(n), { layer: 10, typography: typo('stat', { fontSize: 12, align: 'center' }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols ${col}, rows 5-10`, 'body', TLH_BODY, { layer: 10, typography: typo('body', { fontSize: 11, align: 'center' }), max_lines: 6 }),
    ]
  }),
], { mode: 'timeline_horizontal', timelineVariant: 'default' })

CATALOG.timeline_horizontal_cards_v1 = layoutBase('timeline_horizontal_cards_v1', 'timeline', [
  heading('HEADING', 'cols 1-12, rows 1-2', 'Horizontal Swim-Lane Timeline', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4, 5].flatMap((n) => {
    const phases = [
      ['Phase 01', 'Discovery', 'Kickoff', '• Stakeholder interviews\n• Market research\n• Define KPIs'],
      ['Phase 02', 'Design', 'Prototype', '• Design system\n• Prototyping\n• User testing'],
      ['Phase 03', 'Development', 'Build', '• Core features\n• API build\n• QA & testing'],
      ['Phase 04', 'Launch', 'Go live', '• Go-to-market\n• Press release\n• Onboarding'],
      ['Phase 05', 'Scale', 'Expand', '• New markets\n• V2 planning\n• Growth KPIs'],
    ]
    const [kicker, title, foot, detail] = phases[n - 1]
    const col = n === 1 ? '1-3' : n === 2 ? '3-5' : n === 3 ? '5-7' : n === 4 ? '7-9' : '10-12'
    return [
      slot(`milestone_${n}_label`, `cols ${col}, rows 2-3`, 'caption', kicker, { layer: 10, typography: typo('caption', { fontSize: 11, align: 'left', fontWeight: 700 }), max_lines: 1 }),
      slot(`milestone_${n}_title`, `cols ${col}, rows 3-4`, 'subheading', title, { layer: 10, typography: typo('heading', { fontSize: 16, align: 'left', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols ${col}, rows 4-7`, 'body', detail, { layer: 10, typography: typo('body', { fontSize: 11, align: 'left' }), max_lines: 5 }),
      slot(`milestone_${n}_num`, `cols ${col}, rows 7-8`, 'stat', String(n).padStart(2, '0'), { layer: 10, typography: typo('stat', { fontSize: 14, align: 'center' }), max_lines: 1 }),
      slot(`milestone_${n}_foot`, `cols ${col}, rows 9-10`, 'caption', foot, { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 700 }), max_lines: 1 }),
    ]
  }),
], { mode: 'timeline_horizontal', timelineVariant: 'cards' })

CATALOG.timeline_milestones_v1 = layoutBase('timeline_milestones_v1', 'timeline', [
  heading('HEADING', 'cols 1-12, rows 1-2', 'Key milestones', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => {
    const ribbons = ['Launch', 'Capital', 'Insights', 'Growth', 'Campus', 'Global']
    const years = ['2018', '2019', '2020', '2021', '2022', '2023']
    const col = n <= 2 ? `${n * 2 - 1}-${n * 2}` : n === 3 ? '5-6' : n === 4 ? '7-8' : n === 5 ? '9-10' : '11-12'
    return [
      slot(`milestone_${n}_card`, `cols ${col}, rows 2-4`, 'body', 'Insert your desired text here.', { layer: 10, typography: typo('body', { fontSize: 10, align: 'center' }), max_lines: 3 }),
      slot(`milestone_${n}_label`, `cols ${col}, rows 4-5`, 'caption', ribbons[n - 1], { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 700 }), max_lines: 1 }),
      slot(`milestone_${n}_num`, `cols ${col}, rows 5-6`, 'stat', years[n - 1], { layer: 10, typography: typo('stat', { fontSize: 11, align: 'center' }), max_lines: 1 }),
      slot(`milestone_${n}_title`, `cols ${col}, rows 6-7`, 'subheading', `Option 0${n}`, { layer: 10, typography: typo('heading', { fontSize: 12, align: 'center', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols ${col}, rows 7-10`, 'body', 'This is a sample text. Insert your desired text here.', { layer: 10, typography: typo('body', { fontSize: 10, align: 'center' }), max_lines: 4 }),
    ]
  }),
], { mode: 'timeline_horizontal', timelineVariant: 'default' })

CATALOG.timeline_milestones_cards_v1 = layoutBase('timeline_milestones_cards_v1', 'timeline', [
  heading('HEADING', 'cols 1-12, rows 1-2', 'Key milestones', {
    typography: typo('heading', { fontSize: 20, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4, 5].flatMap((n) => {
    const years = ['2027', '2028', '2029', '2030', '2031']
    const col = n === 1 ? '1-3' : n === 2 ? '3-5' : n === 3 ? '5-7' : n === 4 ? '7-9' : '10-12'
    return [
      slot(`milestone_${n}_num`, `cols ${col}, rows 2-3`, 'stat', years[n - 1], { layer: 10, typography: typo('stat', { fontSize: 16, align: 'center', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_label`, `cols ${col}, rows 5-6`, 'caption', `Milestone 0${n}`, { layer: 10, typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols ${col}, rows 6-10`, 'body', 'Insert your desired text here. This is a sample text.', { layer: 10, typography: typo('body', { fontSize: 12, align: 'center' }), max_lines: 6 }),
    ]
  }),
], { mode: 'timeline_horizontal', timelineVariant: 'cards' })

CATALOG.timeline_milestones_image_v1 = layoutBase('timeline_milestones_image_v1', 'timeline', [
  heading('HEADING', 'cols 1-10, rows 1-2', 'Company milestones', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  slot('SUBHEADING', 'cols 1-8, rows 2-3', 'caption', 'INFOGRAPHIC TEMPLATE', {
    layer: 10,
    typography: typo('caption', { fontSize: 10, align: 'left', fontWeight: 600 }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => {
    const years = ['1998', '2001', '2005', '2011', '2013', '2017']
    const titles = ['FOUNDATION', 'EXPANSION', 'PRODUCT', 'SCALE', 'PARTNERS', 'GLOBAL']
    const col = n === 1 ? '1-2' : n === 2 ? '3-4' : n === 3 ? '5-6' : n === 4 ? '7-8' : n === 5 ? '9-10' : '11-12'
    return [
      slot(`IMAGE_${n}`, `cols ${col}, rows 4-6`, 'image', null, { layer: 8, fit: 'cover' }),
      slot(`milestone_${n}_num`, `cols ${col}, rows 3-4`, 'stat', years[n - 1], { layer: 10, typography: typo('stat', { fontSize: 16, align: 'center', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_label`, `cols ${col}, rows 6-7`, 'caption', titles[n - 1], { layer: 10, typography: typo('caption', { fontSize: 10, align: 'center', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols ${col}, rows 7-9`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.', { layer: 10, typography: typo('body', { fontSize: 9, align: 'center' }), max_lines: 4 }),
    ]
  }),
], { mode: 'timeline_milestones_image', timelineVariant: 'default' })

CATALOG.timeline_milestones_image_right_v1 = layoutBase('timeline_milestones_image_right_v1', 'timeline', [
  heading('HEADING', 'cols 1-8, rows 1-2', 'Milestones at a glance', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  slot('SUBHEADING', 'cols 1-8, rows 2-3', 'caption', 'CHAPTER TIMELINE', {
    layer: 10,
    typography: typo('caption', { fontSize: 10, align: 'left', fontWeight: 600 }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4].flatMap((n) => {
    const years = ['2018', '2021', '2023', '2026']
    const titles = ['LAUNCH', 'GROWTH', 'PRODUCT', 'GLOBAL']
    const row = n === 1 ? '3-4' : n === 2 ? '5-6' : n === 3 ? '7-8' : '9-10'
    return [
      slot(`IMAGE_${n}`, `cols 10-12, rows ${row}`, 'image', null, { layer: 8, fit: 'cover' }),
      slot(`milestone_${n}_num`, `cols 1-3, rows ${row}`, 'stat', years[n - 1], { layer: 10, typography: typo('stat', { fontSize: 16, align: 'left', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_label`, `cols 3-9, rows ${row}`, 'caption', titles[n - 1], { layer: 10, typography: typo('caption', { fontSize: 13, align: 'left', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols 3-9, rows ${row}`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.', { layer: 10, typography: typo('body', { fontSize: 11, align: 'left' }), max_lines: 3 }),
    ]
  }),
], { mode: 'timeline_milestones_image', timelineVariant: 'image_right' })

CATALOG.timeline_vertical_v1 = layoutBase('timeline_vertical_v1', 'timeline', [
  heading('HEADING', 'cols 1-10, rows 1-2', 'Five staged vertical timeline', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4, 5].flatMap((n) => {
    const nums = ['01', '02', '03', '04', '05']
    const titles = ['Discover', 'Design', 'Build', 'Launch', 'Scale']
    const subs = ['Research and scope', 'Prototype and test', 'Engineer the core', 'Go to market', 'Grow and expand']
    const row = n === 1 ? '2-3' : n === 2 ? '4-5' : n === 3 ? '6-7' : n === 4 ? '8-9' : '10-11'
    const side = n % 2 === 1 ? '8-12' : '1-5'
    const numCol = n % 2 === 1 ? '7-8' : '5-6'
    return [
      slot(`milestone_${n}_num`, `cols ${numCol}, rows ${row}`, 'stat', nums[n - 1], { layer: 10, typography: typo('stat', { fontSize: 18, align: 'center', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_label`, `cols ${side}, rows ${row}`, 'caption', titles[n - 1], { layer: 10, typography: typo('caption', { fontSize: 14, align: n % 2 === 1 ? 'left' : 'right', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_title`, `cols ${side}, rows ${row}`, 'caption', subs[n - 1], { layer: 10, typography: typo('caption', { fontSize: 10, align: n % 2 === 1 ? 'left' : 'right' }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols ${side}, rows ${row}`, 'body', 'Bring your presentation to life. Capture your audience\'s attention.', { layer: 10, typography: typo('body', { fontSize: 10, align: n % 2 === 1 ? 'left' : 'right' }), max_lines: 2 }),
    ]
  }),
], { mode: 'timeline_vertical', timelineVariant: 'default' })

CATALOG.timeline_vertical_cards_v1 = layoutBase('timeline_vertical_cards_v1', 'timeline', [
  heading('HEADING', 'cols 1-8, rows 1-2', '5 Stage Planning Process', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4, 5].flatMap((n) => {
    const dates = ['JAN 2023', 'MAR 2023', 'JUN 2023', 'SEP 2023', 'DEC 2023']
    const titles = ['STAGE 1: MASTER PLAN', 'STAGE 2: PERMITS', 'STAGE 3: DESIGN', 'STAGE 4: SCHEDULE', 'STAGE 5: BUILD']
    const row = n === 1 ? '2-3' : n === 2 ? '4-5' : n === 3 ? '6-7' : n === 4 ? '8-9' : '10-11'
    const side = n % 2 === 1 ? '1-5' : '8-12'
    return [
      slot(`milestone_${n}_num`, `cols ${side}, rows ${row}`, 'stat', dates[n - 1], { layer: 10, typography: typo('stat', { fontSize: 10, align: 'left', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_label`, `cols ${side}, rows ${row}`, 'caption', titles[n - 1], { layer: 10, typography: typo('caption', { fontSize: 10, align: 'left', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols ${side}, rows ${row}`, 'body', 'Plan, coordinate, and deliver this stage with clear owners and checkpoints.', { layer: 10, typography: typo('body', { fontSize: 10, align: 'left' }), max_lines: 3 }),
    ]
  }),
], { mode: 'timeline_vertical', timelineVariant: 'cards' })

const TLRH_BODY = 'Maecenas non laoreet odio. Fusce lobortis porttitor purus, vel vestibulum libero pharetra vel.'
CATALOG.timeline_roadmap_horizontal_v1 = layoutBase('timeline_roadmap_horizontal_v1', 'timeline', [
  heading('HEADING', 'cols 1-12, rows 1-2', 'Roadmap Timeline Template', {
    typography: typo('heading', { fontSize: 26, align: 'center' }),
    max_lines: 2,
  }),
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => {
    const years = ['2022', '2023', '2024', '2025', '2026', '2027']
    const col = n === 1 ? '1-2' : n === 2 ? '3-4' : n === 3 ? '5-6' : n === 4 ? '7-8' : n === 5 ? '9-10' : '11-12'
    const peak = n % 2 === 1
    return [
      slot(`milestone_${n}_label`, `cols ${col}, rows ${peak ? '2-3' : '8-9'}`, 'caption', years[n - 1], {
        layer: 10,
        typography: typo('caption', { fontSize: 18, align: 'center', fontWeight: 800 }),
        max_lines: 1,
      }),
      slot(`milestone_${n}_detail`, `cols ${col}, rows ${peak ? '7-10' : '3-6'}`, 'body', TLRH_BODY, {
        layer: 10,
        typography: typo('body', { fontSize: 11, align: 'center' }),
        max_lines: 5,
      }),
    ]
  }),
], { mode: 'timeline_roadmap', timelineVariant: 'horizontal' })

CATALOG.timeline_roadmap_v1 = layoutBase('timeline_roadmap_v1', 'timeline', [
  slot('SUBHEADING', 'cols 1-4, rows 1-2', 'caption', 'TIMELINE', {
    layer: 10,
    typography: typo('caption', { fontSize: 11, align: 'left', fontWeight: 700 }),
    max_lines: 1,
  }),
  heading('HEADING', 'cols 1-8, rows 1-2', 'Timeline roadmap with milestones', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4, 5].flatMap((n) => {
    const titles = ['Kickoff', 'Scope', 'Build', 'Launch', 'Scale']
    return [
      slot(`milestone_${n}_label`, `cols 1-4, rows ${n + 1}-${n + 2}`, 'caption', titles[n - 1], { layer: 10, typography: typo('caption', { fontSize: 13, align: 'left', fontWeight: 800 }), max_lines: 1 }),
      slot(`milestone_${n}_detail`, `cols 1-4, rows ${n + 2}-${n + 3}`, 'body', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.', { layer: 10, typography: typo('body', { fontSize: 10, align: 'left' }), max_lines: 3 }),
    ]
  }),
], { mode: 'timeline_roadmap', timelineVariant: 'default' })

export default CATALOG
