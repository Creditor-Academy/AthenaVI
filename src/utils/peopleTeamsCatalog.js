/**
 * People & Team DECK_LAYOUT v2 catalog — 9 team layouts.
 */

import {
  slot,
  typo,
  centeredTypo,
  layoutBase,
  SAMPLE_PARA,
  body,
  heading,
  memberFields,
} from './deckLayoutV2Helpers.js'

const CATALOG = {
  team_three_horizontal_v1: layoutBase('team_three_horizontal_v1', 'team', [
    heading('HEADING', 'cols 1-12, rows 1-1', 'Meet the team', {
      typography: typo('heading', { fontSize: 28, align: 'center' }),
    }),
    ...memberFields(1, {
      image: 'cols 1-4, rows 2-6',
      name: 'cols 1-4, rows 7-7',
      role: 'cols 1-4, rows 8-8',
      email: 'cols 1-4, rows 9-9',
    }),
    body('MEMBER_1_BIO', 'cols 1-4, rows 10-10', SAMPLE_PARA.short, 4, {
      typography: centeredTypo('body', { fontSize: 14 }),
    }),
    ...memberFields(2, {
      image: 'cols 5-8, rows 2-6',
      name: 'cols 5-8, rows 7-7',
      role: 'cols 5-8, rows 8-8',
      email: 'cols 5-8, rows 9-9',
    }),
    body('MEMBER_2_BIO', 'cols 5-8, rows 10-10', SAMPLE_PARA.short, 4, {
      typography: centeredTypo('body', { fontSize: 14 }),
    }),
    ...memberFields(3, {
      image: 'cols 9-12, rows 2-6',
      name: 'cols 9-12, rows 7-7',
      role: 'cols 9-12, rows 8-8',
      email: 'cols 9-12, rows 9-9',
    }),
    body('MEMBER_3_BIO', 'cols 9-12, rows 10-10', SAMPLE_PARA.short, 4, {
      typography: centeredTypo('body', { fontSize: 14 }),
    }),
  ], { mode: 'team_three_horizontal' }),

  team_three_vertical_v1: layoutBase('team_three_vertical_v1', 'team', [
    heading('HEADING', 'cols 1-6, rows 1-1', 'Meet the team', {
      typography: typo('heading', { fontSize: 28, align: 'left' }),
    }),
    ...memberFields(1, {
      image: 'cols 7-8, rows 2-4',
      name: 'cols 1-6, rows 2-2',
      role: 'cols 1-6, rows 3-3',
      email: 'cols 1-6, rows 3-4',
    }),
    body('MEMBER_1_BIO', 'cols 1-6, rows 4-4', SAMPLE_PARA.short, 3, {
      typography: typo('body', { fontSize: 14, align: 'right' }),
    }),
    ...memberFields(2, {
      image: 'cols 7-8, rows 5-7',
      name: 'cols 1-6, rows 5-5',
      role: 'cols 1-6, rows 6-6',
      email: 'cols 1-6, rows 6-7',
    }),
    body('MEMBER_2_BIO', 'cols 1-6, rows 7-7', SAMPLE_PARA.short, 3, {
      typography: typo('body', { fontSize: 14, align: 'right' }),
    }),
    ...memberFields(3, {
      image: 'cols 7-8, rows 8-10',
      name: 'cols 1-6, rows 8-8',
      role: 'cols 1-6, rows 9-9',
      email: 'cols 1-6, rows 9-10',
    }),
    body('MEMBER_3_BIO', 'cols 1-6, rows 10-10', SAMPLE_PARA.short, 3, {
      typography: typo('body', { fontSize: 14, align: 'right' }),
    }),
  ], { mode: 'team_vertical_list' }),

  team_four_v1: layoutBase('team_four_v1', 'team', [
    heading('HEADING', 'cols 1-12, rows 1-1', 'Meet the team', {
      typography: typo('heading', { fontSize: 28, align: 'left' }),
    }),
    slot('SUBHEADING', 'cols 1-8, rows 2-2', 'subheading', 'Enter your sub headline here.', {
      layer: 10,
      typography: typo('subheading', { fontSize: 16, align: 'left' }),
      max_lines: 1,
    }),
    ...memberFields(1, {
      image: 'cols 1-3, rows 2-5',
      name: 'cols 1-3, rows 6-6',
      role: 'cols 1-3, rows 7-7',
      email: 'cols 1-3, rows 8-8',
    }),
    body('MEMBER_1_BIO', 'cols 1-3, rows 9-10', SAMPLE_PARA.short, 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
    ...memberFields(2, {
      image: 'cols 4-6, rows 6-9',
      name: 'cols 4-6, rows 2-2',
      role: 'cols 4-6, rows 3-3',
      email: 'cols 4-6, rows 4-4',
    }),
    body('MEMBER_2_BIO', 'cols 4-6, rows 5-5', SAMPLE_PARA.short, 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
    ...memberFields(3, {
      image: 'cols 7-9, rows 2-5',
      name: 'cols 7-9, rows 6-6',
      role: 'cols 7-9, rows 7-7',
      email: 'cols 7-9, rows 8-8',
    }),
    body('MEMBER_3_BIO', 'cols 7-9, rows 9-10', SAMPLE_PARA.short, 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
    ...memberFields(4, {
      image: 'cols 10-12, rows 6-9',
      name: 'cols 10-12, rows 2-2',
      role: 'cols 10-12, rows 3-3',
      email: 'cols 10-12, rows 4-4',
    }),
    body('MEMBER_4_BIO', 'cols 10-12, rows 5-5', SAMPLE_PARA.short, 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
  ], { mode: 'team_grid_four' }),

  team_five_v1: layoutBase('team_five_v1', 'team', [
    heading('HEADING', 'cols 2-11, rows 1-1', 'Meet the team', {
      typography: typo('heading', { fontSize: 28, align: 'center' }),
    }),
    ...memberFields(1, {
      image: 'cols 3-5, rows 2-4',
      name: 'cols 3-5, rows 5-5',
      role: 'cols 3-5, rows 6-6',
      email: 'cols 3-5, rows 7-7',
    }),
    body('MEMBER_1_BIO', 'cols 3-5, rows 8-8', 'Leads product vision and keeps the team focused on what matters.', 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
    ...memberFields(2, {
      image: 'cols 8-10, rows 2-4',
      name: 'cols 8-10, rows 5-5',
      role: 'cols 8-10, rows 6-6',
      email: 'cols 8-10, rows 7-7',
    }),
    body('MEMBER_2_BIO', 'cols 8-10, rows 8-8', 'Builds the platform and sets the technical bar for the work we ship.', 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
    ...memberFields(3, {
      image: 'cols 1-3, rows 6-8',
      name: 'cols 1-3, rows 9-9',
      role: 'cols 1-3, rows 9-9',
      email: 'cols 1-3, rows 10-10',
    }),
    body('MEMBER_3_BIO', 'cols 1-3, rows 10-10', 'Runs day-to-day operations so the team can move with clarity.', 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
    ...memberFields(4, {
      image: 'cols 5-7, rows 6-8',
      name: 'cols 5-7, rows 9-9',
      role: 'cols 5-7, rows 9-9',
      email: 'cols 5-7, rows 10-10',
    }),
    body('MEMBER_4_BIO', 'cols 5-7, rows 10-10', 'Guides partnerships and growth with a steady, practical point of view.', 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
    ...memberFields(5, {
      image: 'cols 9-11, rows 6-8',
      name: 'cols 9-11, rows 9-9',
      role: 'cols 9-11, rows 9-9',
      email: 'cols 9-11, rows 10-10',
    }),
    body('MEMBER_5_BIO', 'cols 9-11, rows 10-10', 'Shapes the visual language and makes every slide feel considered.', 4, {
      typography: centeredTypo('body', { fontSize: 13 }),
    }),
  ], { mode: 'team_grid_five' }),

  team_six_v1: layoutBase('team_six_v1', 'team', [
    heading('HEADING', 'cols 1-12, rows 1-1', 'TEAM MEMBERS', {
      typography: typo('heading', { fontSize: 28, align: 'left' }),
    }),
    slot('SUBHEADING', 'cols 1-8, rows 2-2', 'subheading', 'Enter your sub headline here', {
      layer: 10,
      typography: typo('subheading', { fontSize: 16, align: 'left' }),
      max_lines: 1,
    }),
    ...[1, 2, 3, 4, 5, 6].flatMap((n) => {
      const col = ((n - 1) % 3) * 4 + 1
      const row = n <= 3 ? 3 : 7
      return [
        ...memberFields(n, {
          image: `cols ${col}-${col + 2}, rows ${row}-${row + 1}`,
          name: `cols ${col}-${col + 2}, rows ${row + 2}-${row + 2}`,
          role: `cols ${col}-${col + 2}, rows ${row + 3}-${row + 3}`,
          email: `cols ${col}-${col + 2}, rows ${row + 4}-${row + 4}`,
        }),
        body(`MEMBER_${n}_BIO`, `cols ${col}-${col + 2}, rows ${row + 3}-${row + 4}`, SAMPLE_PARA.short, 4, {
          typography: typo('body', { fontSize: 13 }),
        }),
      ]
    }),
  ], { mode: 'team_grid_six' }),

  team_three_full_cards_v1: layoutBase('team_three_full_cards_v1', 'team', [
    heading('HEADING', 'cols 2-11, rows 1-1', 'Meet the team', {
      typography: typo('heading', { fontSize: 32, align: 'center' }),
    }),
    ...memberFields(1, {
      image: 'cols 1-4, rows 2-7',
      name: 'cols 1-4, rows 8-8',
      role: 'cols 1-4, rows 9-9',
      email: 'cols 1-4, rows 10-10',
    }),
    ...memberFields(2, {
      image: 'cols 5-8, rows 2-7',
      name: 'cols 5-8, rows 8-8',
      role: 'cols 5-8, rows 9-9',
      email: 'cols 5-8, rows 10-10',
    }),
    ...memberFields(3, {
      image: 'cols 9-12, rows 2-7',
      name: 'cols 9-12, rows 8-8',
      role: 'cols 9-12, rows 9-9',
      email: 'cols 9-12, rows 10-10',
    }),
  ], { mode: 'team_full_image_cards' }),

  team_by_department_v1: layoutBase('team_by_department_v1', 'team', [
    heading('HEADING', 'cols 1-8, rows 1-1', 'Team by department', {
      typography: typo('heading', { fontSize: 32, align: 'left' }),
    }),
    heading('DEPT_1_HEADING', 'cols 1-4, rows 2-3', 'Leadership', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    ...memberFields(1, {
      image: 'cols 1-2, rows 3-5',
      name: 'cols 3-4, rows 3-4',
      role: 'cols 3-4, rows 4-5',
      email: 'cols 3-4, rows 5-6',
    }),
    ...memberFields(2, {
      image: 'cols 1-2, rows 6-8',
      name: 'cols 3-4, rows 6-7',
      role: 'cols 3-4, rows 7-8',
      email: 'cols 3-4, rows 8-9',
    }),
    heading('DEPT_2_HEADING', 'cols 5-8, rows 2-3', 'Engineering', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    ...memberFields(3, {
      image: 'cols 5-6, rows 3-5',
      name: 'cols 7-8, rows 3-4',
      role: 'cols 7-8, rows 4-5',
      email: 'cols 7-8, rows 5-6',
    }),
    ...memberFields(4, {
      image: 'cols 5-6, rows 6-8',
      name: 'cols 7-8, rows 6-7',
      role: 'cols 7-8, rows 7-8',
      email: 'cols 7-8, rows 8-9',
    }),
    heading('DEPT_3_HEADING', 'cols 9-12, rows 2-3', 'Design', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    ...memberFields(5, {
      image: 'cols 9-10, rows 3-5',
      name: 'cols 11-12, rows 3-4',
      role: 'cols 11-12, rows 4-5',
      email: 'cols 11-12, rows 5-6',
    }),
    ...memberFields(6, {
      image: 'cols 9-10, rows 6-8',
      name: 'cols 11-12, rows 6-7',
      role: 'cols 11-12, rows 7-8',
      email: 'cols 11-12, rows 8-9',
    }),
  ], { mode: 'team_by_department' }),

  team_featured_lead_v1: layoutBase('team_featured_lead_v1', 'team', [
    heading('HEADING', 'cols 7-12, rows 2-2', 'Leadership', {
      typography: typo('heading', { fontSize: 16, align: 'left' }),
    }),
    slot('MEMBER_1_IMAGE', 'cols 1-5, rows 3-9', 'image', null, { layer: 2, fit: 'cover' }),
    slot('MEMBER_1_NAME', 'cols 7-12, rows 3-4', 'heading', 'Johanna Doe', {
      layer: 10,
      typography: typo('heading', { fontSize: 36, align: 'left' }),
    }),
    slot('MEMBER_1_ROLE', 'cols 7-12, rows 5-5', 'subheading', 'Co-founder & CEO', {
      layer: 10,
      typography: typo('subheading', { align: 'left' }),
    }),
    body('MEMBER_1_BIO', 'cols 7-12, rows 6-9', 'Leads the company with a clear point of view. She sets the product direction and keeps the team focused on work that matters.', 5, {
      typography: typo('body', { fontSize: 16, align: 'left' }),
    }),
  ], { mode: 'team_featured_lead' }),

  team_org_simple_v1: layoutBase('team_org_simple_v1', 'team', [
    heading('HEADING', 'cols 1-3, rows 4-6', 'Team Structure', {
      typography: typo('heading', { fontSize: 32, align: 'left' }),
      max_lines: 2,
    }),
    ...[
      { n: 1, image: 'cols 4-5, rows 4-6', name: 'cols 4-5, rows 7-7', role: 'cols 4-5, rows 8-8', person: { name: 'Jonas', role: 'Designation' } },
      { n: 2, image: 'cols 6-7, rows 2-4', name: 'cols 6-7, rows 4-4', role: 'cols 6-7, rows 5-5', person: { name: 'Maria', role: 'Designation' } },
      { n: 3, image: 'cols 8-9, rows 2-4', name: 'cols 8-9, rows 4-4', role: 'cols 8-9, rows 5-5', person: { name: 'Harry', role: 'Designation' } },
      { n: 4, image: 'cols 6-7, rows 5-7', name: 'cols 6-7, rows 7-7', role: 'cols 6-7, rows 8-8', person: { name: 'Warner', role: 'Designation' } },
      { n: 5, image: 'cols 8-9, rows 5-7', name: 'cols 8-9, rows 7-7', role: 'cols 8-9, rows 8-8', person: { name: 'Zenda', role: 'Designation' } },
      { n: 6, image: 'cols 6-7, rows 8-10', name: 'cols 6-7, rows 10-10', role: 'cols 6-7, rows 10-10', person: { name: 'Tony', role: 'Designation' } },
      { n: 7, image: 'cols 8-9, rows 8-10', name: 'cols 8-9, rows 10-10', role: 'cols 8-9, rows 10-10', person: { name: 'Peter', role: 'Designation' } },
    ].flatMap(({ n, image, name, role, person }) => [
      slot(`MEMBER_${n}_IMAGE`, image, 'image', null, { layer: 2, fit: 'cover' }),
      slot(`MEMBER_${n}_NAME`, name, 'heading', person.name, {
        layer: 10,
        typography: centeredTypo('heading', { fontSize: 16 }),
        max_lines: 1,
      }),
      slot(`MEMBER_${n}_ROLE`, role, 'caption', person.role, {
        layer: 10,
        typography: centeredTypo('caption', { fontSize: 12 }),
        max_lines: 1,
      }),
    ]),
  ], { mode: 'team_org_simple' }),
}

export default CATALOG
