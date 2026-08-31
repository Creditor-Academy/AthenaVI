/**
 * Diagram DECK_LAYOUT v2 catalog — SWOT, funnel, matrix, process, etc.
 */
import {
  slot,
  typo,
  centeredTypo,
  layoutBase,
  heading,
  body,
} from './deckLayoutV2Helpers.js'

const P = {
  cell: 'Two to three lines explaining this section.',
}

function quadrantSlots(prefix, colStart, colEnd, rowStart, rowEnd, title, placeholder) {
  const titleRowEnd = rowStart + 1
  const bodyRowStart = rowStart + 1
  return [
    slot(`${prefix}_TITLE`, `cols ${colStart}-${colEnd}, rows ${rowStart}-${titleRowEnd}`, 'heading', title, {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
      max_lines: 1,
    }),
    slot(`${prefix}_BODY`, `cols ${colStart}-${colEnd}, rows ${bodyRowStart}-${rowEnd}`, 'body', placeholder, {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 4,
    }),
  ]
}

function funnelTier(n, rowTitle, rowBody) {
  return [
    slot(`FUNNEL_NUM_${n}`, `cols 5-6, rows ${rowTitle}-${rowTitle}`, 'caption', String(n).padStart(2, '0'), {
      layer: 12,
      typography: centeredTypo('caption', { fontSize: 22, fontWeight: 800, colorRole: 'textOnImage' }),
      max_lines: 1,
    }),
    slot(`funnel_${n}_title`, `cols 7-12, rows ${rowTitle}-${rowTitle}`, 'heading', `Stage ${n}`, {
      layer: 10,
      typography: typo('heading', { fontSize: 22 }),
      max_lines: 1,
    }),
    slot(`funnel_${n}_body`, `cols 7-12, rows ${rowBody}-${rowBody + 1}`, 'body', P.cell, {
      layer: 10,
      typography: typo('body', { fontSize: 15 }),
      max_lines: 3,
    }),
  ]
}

function pyramidTier(n, cols) {
  const [c1, c2, r1, r2] = cols
  const titleRowEnd = r1
  const bodyRowStart = r1 + 1
  return [
    slot(`funnel_${n}_title`, `cols ${c1}-${c2}, rows ${r1}-${titleRowEnd}`, 'heading', `Title ${String(n).padStart(2, '0')}`, {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 16 }),
      max_lines: 1,
    }),
    slot(`funnel_${n}_body`, `cols ${c1}-${c2}, rows ${bodyRowStart}-${r2}`, 'body', P.cell, {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 13 }),
      max_lines: 2,
    }),
  ]
}

function processStep(n, colStart, colEnd) {
  return [
    slot(`step_${n}_title`, `cols ${colStart}-${colEnd}, rows 6-7`, 'heading', `${n}. Step ${n}`, {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center' }),
      max_lines: 1,
    }),
    slot(`step_${n}_body`, `cols ${colStart}-${colEnd}, rows 8-10`, 'body', P.cell, {
      layer: 10,
      typography: typo('body', { fontSize: 14, align: 'center' }),
      max_lines: 4,
    }),
  ]
}

const CATALOG = {
  diagram_swot_v1: layoutBase('diagram_swot_v1', 'diagram', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'SWOT analysis', { max_lines: 2 }),
    ...quadrantSlots('Q1', 1, 6, 3, 6, 'Strengths', 'Key strengths'),
    ...quadrantSlots('Q2', 7, 12, 3, 6, 'Weaknesses', 'Areas to improve'),
    ...quadrantSlots('Q3', 1, 6, 7, 10, 'Opportunities', 'Market opportunities'),
    ...quadrantSlots('Q4', 7, 12, 7, 10, 'Threats', 'External risks'),
  ], { mode: 'diagram_swot' }),

  diagram_funnel_v1: layoutBase('diagram_funnel_v1', 'diagram', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Conversion funnel', {
      max_lines: 2,
      typography: centeredTypo('heading', { fontSize: 36 }),
    }),
    ...funnelTier(1, 3, 4),
    ...funnelTier(2, 5, 6),
    ...funnelTier(3, 7, 8),
    ...funnelTier(4, 9, 10),
  ], { mode: 'diagram_funnel' }),

  diagram_matrix_v1: layoutBase('diagram_matrix_v1', 'diagram', [
    heading('HEADING', 'cols 2-11, rows 1-2', '2×2 matrix', { max_lines: 2 }),
    ...quadrantSlots('Q1', 1, 6, 3, 6, 'High impact · Easy', P.cell),
    ...quadrantSlots('Q2', 7, 12, 3, 6, 'High impact · Hard', P.cell),
    ...quadrantSlots('Q3', 1, 6, 7, 10, 'Low impact · Easy', P.cell),
    ...quadrantSlots('Q4', 7, 12, 7, 10, 'Low impact · Hard', P.cell),
    slot('MATRIX_CENTER', 'cols 5-8, rows 5-7', 'heading', 'Insert your desired text here.', {
      layer: 14,
      typography: centeredTypo('heading', { fontSize: 16 }),
      max_lines: 3,
    }),
    slot('MATRIX_Y_LABEL', 'cols 1-1, rows 3-9', 'caption', 'Placeholder', {
      layer: 12,
      typography: centeredTypo('caption', { fontSize: 16, fontWeight: 700, colorRole: 'textOnImage' }),
      max_lines: 1,
    }),
    slot('MATRIX_X_LABEL', 'cols 3-11, rows 11-12', 'caption', 'Placeholder', {
      layer: 12,
      typography: centeredTypo('caption', { fontSize: 16, fontWeight: 700, colorRole: 'textOnImage' }),
      max_lines: 1,
    }),
  ], { mode: 'diagram_matrix' }),

  diagram_process_steps_v1: layoutBase('diagram_process_steps_v1', 'diagram', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Process steps', {
      max_lines: 2,
      typography: centeredTypo('heading', { fontSize: 36 }),
    }),
    ...processStep(1, 1, 3),
    ...processStep(2, 4, 6),
    ...processStep(3, 7, 9),
    ...processStep(4, 10, 12),
  ], { mode: 'diagram_process_steps' }),

  diagram_cycle_v1: layoutBase('diagram_cycle_v1', 'diagram', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Continuous cycle', {
      max_lines: 2,
      typography: centeredTypo('heading', { fontSize: 36 }),
    }),
    ...quadrantSlots('Q1', 8, 12, 3, 6, 'Plan', P.cell),
    ...quadrantSlots('Q2', 8, 12, 7, 10, 'Do', P.cell),
    ...quadrantSlots('Q3', 1, 5, 7, 10, 'Check', P.cell),
    ...quadrantSlots('Q4', 1, 5, 3, 6, 'Act', P.cell),
    slot('CYCLE_CENTER', 'cols 5-8, rows 5-7', 'heading', 'CYCLE', {
      layer: 12,
      typography: centeredTypo('heading', { fontSize: 22 }),
      max_lines: 2,
    }),
    slot('CYCLE_NUM_1', 'cols 7-8, rows 3-4', 'caption', '1', {
      layer: 12,
      typography: centeredTypo('caption', { fontSize: 36, fontWeight: 800, colorRole: 'textOnImage' }),
      max_lines: 1,
    }),
    slot('CYCLE_NUM_2', 'cols 8-9, rows 6-7', 'caption', '2', {
      layer: 12,
      typography: centeredTypo('caption', { fontSize: 36, fontWeight: 800, colorRole: 'textOnImage' }),
      max_lines: 1,
    }),
    slot('CYCLE_NUM_3', 'cols 4-5, rows 8-9', 'caption', '3', {
      layer: 12,
      typography: centeredTypo('caption', { fontSize: 36, fontWeight: 800, colorRole: 'textOnImage' }),
      max_lines: 1,
    }),
    slot('CYCLE_NUM_4', 'cols 3-4, rows 4-5', 'caption', '4', {
      layer: 12,
      typography: centeredTypo('caption', { fontSize: 36, fontWeight: 800, colorRole: 'textOnImage' }),
      max_lines: 1,
    }),
  ], { mode: 'diagram_cycle' }),

  diagram_venn_v1: layoutBase('diagram_venn_v1', 'diagram', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Overlap model', { max_lines: 2 }),
    slot('Q1_TITLE', 'cols 1-4, rows 3-4', 'heading', 'Set A', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 18 }),
    }),
    slot('Q1_BODY', 'cols 1-4, rows 5-8', 'body', P.cell, {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 14 }),
      max_lines: 3,
    }),
    slot('Q2_TITLE', 'cols 5-8, rows 3-4', 'heading', 'Set B', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 18 }),
    }),
    slot('Q2_BODY', 'cols 5-8, rows 5-8', 'body', P.cell, {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 14 }),
      max_lines: 3,
    }),
    slot('Q3_TITLE', 'cols 9-12, rows 3-4', 'heading', 'Set C', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 18 }),
    }),
    slot('Q3_BODY', 'cols 9-12, rows 5-8', 'body', P.cell, {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 14 }),
      max_lines: 3,
    }),
    slot('CENTER_BODY', 'cols 5-8, rows 6-7', 'body', 'Shared overlap', {
      layer: 11,
      typography: centeredTypo('body', { fontSize: 14, fontWeight: 600 }),
      max_lines: 2,
    }),
  ], { mode: 'diagram_venn' }),

  diagram_pyramid_v1: layoutBase('diagram_pyramid_v1', 'diagram', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Priority pyramid', { max_lines: 2 }),
    ...pyramidTier(1, [7, 12, 3, 4]),
    ...pyramidTier(2, [7, 12, 5, 6]),
    ...pyramidTier(3, [7, 12, 7, 8]),
    ...pyramidTier(4, [7, 12, 9, 10]),
    ...pyramidTier(5, [7, 12, 11, 12]),
  ], { mode: 'diagram_pyramid' }),
}

export default CATALOG
