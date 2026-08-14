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
    slot('PROS_TITLE', 'cols 1-6, rows 2-3', 'heading', 'Pros', {
      layer: 10,
      typography: typo('heading', { fontSize: 22, colorRole: 'primary' }),
    }),
    slot('CONS_TITLE', 'cols 7-12, rows 2-3', 'heading', 'Cons', {
      layer: 10,
      typography: typo('heading', { fontSize: 22 }),
    }),
    slot('PROS', 'cols 1-6, rows 3-9', 'body', '• Advantage one\n• Advantage two', {
      layer: 10,
      typography: typo('body'),
      max_lines: 6,
    }),
    slot('CONS', 'cols 7-12, rows 3-9', 'body', '• Risk one\n• Risk two', {
      layer: 10,
      typography: typo('body'),
      max_lines: 6,
    }),
  ], { mode: 'comparison_columns' }),

  timeline_horizontal_v1: layoutBase('timeline_horizontal_v1', 'timeline', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Timeline', { max_lines: 2 }),
    ...milestoneSlots(4),
  ], { mode: 'process_flow' }),

  timeline_milestones_v1: layoutBase('timeline_milestones_v1', 'timeline', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key milestones', { max_lines: 2 }),
    ...milestoneDetailSlots(4),
  ], { mode: 'process_flow' }),

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
  ], { mode: 'process_flow' }),

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
  ], { mode: 'process_flow' }),

  timeline_process_steps_v1: layoutBase('timeline_process_steps_v1', 'timeline', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'How it works', { max_lines: 2 }),
    slot('step_1_title', 'cols 1-3, rows 3-4', 'heading', '1. Discover', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center' }),
    }),
    slot('step_1_body', 'cols 1-3, rows 4-6', 'body', 'Understand the problem', {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 3,
    }),
    slot('step_2_title', 'cols 4-6, rows 3-4', 'heading', '2. Design', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center' }),
    }),
    slot('step_2_body', 'cols 4-6, rows 4-6', 'body', 'Shape the solution', {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 3,
    }),
    slot('step_3_title', 'cols 7-9, rows 3-4', 'heading', '3. Build', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center' }),
    }),
    slot('step_3_body', 'cols 7-9, rows 4-6', 'body', 'Ship the MVP', {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 3,
    }),
    slot('step_4_title', 'cols 10-12, rows 3-4', 'heading', '4. Launch', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center' }),
    }),
    slot('step_4_body', 'cols 10-12, rows 4-6', 'body', 'Go to market', {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 3,
    }),
  ], { mode: 'process_flow' }),

  comparison_table_v1: layoutBase('comparison_table_v1', 'comparison', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Feature comparison', { max_lines: 2 }),
    slot('TABLE', 'cols 1-12, rows 2-9', 'table', null, { layer: 10 }),
  ], { mode: 'comparison_columns' }),

  comparison_before_after_v1: layoutBase('comparison_before_after_v1', 'comparison', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Before and after', { max_lines: 2 }),
    slot('LEFT_TITLE', 'cols 1-6, rows 2-3', 'heading', 'Before', {
      layer: 10,
      typography: typo('heading', { fontSize: 24 }),
    }),
    slot('RIGHT_TITLE', 'cols 7-12, rows 2-3', 'heading', 'After', {
      layer: 10,
      typography: typo('heading', { fontSize: 24, colorRole: 'primary' }),
    }),
    body('LEFT_BODY', 'cols 1-6, rows 3-9', P.one, 5),
    body('RIGHT_BODY', 'cols 7-12, rows 3-9', P.one, 5),
  ], { mode: 'comparison_columns' }),

  bullet_list_cards_v1: layoutBase('bullet_list_cards_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key points', { max_lines: 2 }),
    cardShapeHint('cols 1-4, rows 2-6', 'CARD_1_BG', 10, 'CARD_1_TITLE'),
    slot('CARD_1_TITLE', 'cols 1-4, rows 2-3', 'heading', 'Point one', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('CARD_1_BODY', 'cols 1-4, rows 3-6', P.short, 3),
    cardShapeHint('cols 5-8, rows 2-6', 'CARD_2_BG', 10, 'CARD_2_TITLE'),
    slot('CARD_2_TITLE', 'cols 5-8, rows 2-3', 'heading', 'Point two', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('CARD_2_BODY', 'cols 5-8, rows 3-6', P.short, 3),
    cardShapeHint('cols 9-12, rows 2-6', 'CARD_3_BG', 10, 'CARD_3_TITLE'),
    slot('CARD_3_TITLE', 'cols 9-12, rows 2-3', 'heading', 'Point three', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('CARD_3_BODY', 'cols 9-12, rows 3-6', P.short, 3),
  ], { mode: 'two_image_columns' }),

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

export default CATALOG
