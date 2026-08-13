/**
 * People & Team DECK_LAYOUT v2 catalog — 9 contact / team layouts.
 */

import {
  slot,
  typo,
  layoutBase,
  heading,
  memberFields,
  contactInfoFields,
} from './deckLayoutV2Helpers.js'

function teamGridLayout(id, memberCount, previewMode, memberRegions) {
  const slots = [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Meet the team', {
      typography: typo('heading', { fontSize: 32, align: 'center' }),
    }),
  ]
  for (let i = 1; i <= memberCount; i += 1) {
    slots.push(...memberFields(i, memberRegions[i - 1] || {}))
  }
  return layoutBase(id, 'team', slots, { mode: previewMode })
}

const CATALOG = {
  contact_left_image_v1: layoutBase('contact_left_image_v1', 'team', [
    slot('CONTACT_IMAGE', 'cols 1-6, rows 1-10', 'image', null, { layer: 2, fit: 'cover' }),
    ...contactInfoFields(7, 11),
  ], { mode: 'contact_split_left' }),

  contact_right_image_v1: layoutBase('contact_right_image_v1', 'team', [
    ...contactInfoFields(2, 6),
    slot('CONTACT_IMAGE', 'cols 7-12, rows 1-10', 'image', null, { layer: 2, fit: 'cover' }),
  ], { mode: 'contact_split_right' }),

  team_three_horizontal_v1: layoutBase('team_three_horizontal_v1', 'team', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Meet the team', {
      typography: typo('heading', { fontSize: 32, align: 'center' }),
    }),
    ...memberFields(1, {
      image: 'cols 2-4, rows 4-6',
      name: 'cols 2-4, rows 6-7',
      role: 'cols 2-4, rows 7-8',
      email: 'cols 2-4, rows 8-9',
    }),
    ...memberFields(2, {
      image: 'cols 5-7, rows 4-6',
      name: 'cols 5-7, rows 6-7',
      role: 'cols 5-7, rows 7-8',
      email: 'cols 5-7, rows 8-9',
    }),
    ...memberFields(3, {
      image: 'cols 8-10, rows 4-6',
      name: 'cols 8-10, rows 6-7',
      role: 'cols 8-10, rows 7-8',
      email: 'cols 8-10, rows 8-9',
    }),
  ], { mode: 'team_three_horizontal' }),

  team_three_vertical_v1: layoutBase('team_three_vertical_v1', 'team', [
    heading('HEADING', 'cols 1-5, rows 3-6', 'Management and leadership', {
      typography: typo('heading', { fontSize: 36 }),
    }),
    ...memberFields(1, {
      image: 'cols 7-8, rows 2-4',
      name: 'cols 9-12, rows 2-3',
      role: 'cols 9-12, rows 3-4',
      email: 'cols 9-12, rows 4-5',
    }),
    ...memberFields(2, {
      image: 'cols 7-8, rows 5-7',
      name: 'cols 9-12, rows 5-6',
      role: 'cols 9-12, rows 6-7',
      email: 'cols 9-12, rows 7-8',
    }),
    ...memberFields(3, {
      image: 'cols 7-8, rows 8-10',
      name: 'cols 9-12, rows 8-9',
      role: 'cols 9-12, rows 9-10',
      email: 'cols 9-12, rows 10-11',
    }),
  ], { mode: 'team_vertical_list' }),

  team_four_v1: teamGridLayout('team_four_v1', 4, 'team_grid_four', [
    {
      image: 'cols 2-4, rows 3-5',
      name: 'cols 2-4, rows 5-6',
      role: 'cols 2-4, rows 6-7',
      email: 'cols 2-4, rows 7-8',
    },
    {
      image: 'cols 7-9, rows 3-5',
      name: 'cols 7-9, rows 5-6',
      role: 'cols 7-9, rows 6-7',
      email: 'cols 7-9, rows 7-8',
    },
    {
      image: 'cols 2-4, rows 8-9',
      name: 'cols 2-4, rows 9-10',
      role: 'cols 2-4, rows 10-10',
      email: 'cols 2-4, rows 10-10',
    },
    {
      image: 'cols 7-9, rows 8-9',
      name: 'cols 7-9, rows 9-10',
      role: 'cols 7-9, rows 10-10',
      email: 'cols 7-9, rows 10-10',
    },
  ]),

  team_five_v1: teamGridLayout('team_five_v1', 5, 'team_grid_five', [
    {
      image: 'cols 1-3, rows 3-5',
      name: 'cols 1-3, rows 5-6',
      role: 'cols 1-3, rows 6-7',
      email: 'cols 1-3, rows 7-8',
    },
    {
      image: 'cols 5-7, rows 3-5',
      name: 'cols 5-7, rows 5-6',
      role: 'cols 5-7, rows 6-7',
      email: 'cols 5-7, rows 7-8',
    },
    {
      image: 'cols 9-11, rows 3-5',
      name: 'cols 9-11, rows 5-6',
      role: 'cols 9-11, rows 6-7',
      email: 'cols 9-11, rows 7-8',
    },
    {
      image: 'cols 3-5, rows 8-9',
      name: 'cols 3-5, rows 9-10',
      role: 'cols 3-5, rows 10-10',
      email: 'cols 3-5, rows 10-10',
    },
    {
      image: 'cols 7-9, rows 8-9',
      name: 'cols 7-9, rows 9-10',
      role: 'cols 7-9, rows 10-10',
      email: 'cols 7-9, rows 10-10',
    },
  ]),

  team_six_v1: teamGridLayout('team_six_v1', 6, 'team_grid_six', [
    {
      image: 'cols 1-3, rows 3-5',
      name: 'cols 1-3, rows 5-6',
      role: 'cols 1-3, rows 6-7',
      email: 'cols 1-3, rows 7-8',
    },
    {
      image: 'cols 5-7, rows 3-5',
      name: 'cols 5-7, rows 5-6',
      role: 'cols 5-7, rows 6-7',
      email: 'cols 5-7, rows 7-8',
    },
    {
      image: 'cols 9-11, rows 3-5',
      name: 'cols 9-11, rows 5-6',
      role: 'cols 9-11, rows 6-7',
      email: 'cols 9-11, rows 7-8',
    },
    {
      image: 'cols 1-3, rows 8-9',
      name: 'cols 1-3, rows 9-10',
      role: 'cols 1-3, rows 10-10',
      email: 'cols 1-3, rows 10-10',
    },
    {
      image: 'cols 5-7, rows 8-9',
      name: 'cols 5-7, rows 9-10',
      role: 'cols 5-7, rows 10-10',
      email: 'cols 5-7, rows 10-10',
    },
    {
      image: 'cols 9-11, rows 8-9',
      name: 'cols 9-11, rows 9-10',
      role: 'cols 9-11, rows 10-10',
      email: 'cols 9-11, rows 10-10',
    },
  ]),

  team_three_full_cards_v1: layoutBase('team_three_full_cards_v1', 'team', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Meet the team', {
      typography: typo('heading', { fontSize: 32, align: 'center' }),
    }),
    slot('MEMBER_1_IMAGE', 'cols 1-4, rows 2-8', 'image', null, { layer: 2, fit: 'cover' }),
    slot('MEMBER_1_NAME', 'cols 1-4, rows 8-9', 'heading', 'Johanna Doe', {
      layer: 10,
      typography: typo('heading', { fontSize: 16, align: 'center' }),
    }),
    slot('MEMBER_1_ROLE', 'cols 1-4, rows 9-10', 'caption', 'Co-founder & CEO', {
      layer: 10,
      typography: typo('caption', { align: 'center' }),
    }),
    slot('MEMBER_2_IMAGE', 'cols 5-8, rows 2-8', 'image', null, { layer: 2, fit: 'cover' }),
    slot('MEMBER_2_NAME', 'cols 5-8, rows 8-9', 'heading', 'Jane Doe', {
      layer: 10,
      typography: typo('heading', { fontSize: 16, align: 'center' }),
    }),
    slot('MEMBER_2_ROLE', 'cols 5-8, rows 9-10', 'caption', 'Co-founder & CTO', {
      layer: 10,
      typography: typo('caption', { align: 'center' }),
    }),
    slot('MEMBER_3_IMAGE', 'cols 9-12, rows 2-8', 'image', null, { layer: 2, fit: 'cover' }),
    slot('MEMBER_3_NAME', 'cols 9-12, rows 8-9', 'heading', 'Joe Doe', {
      layer: 10,
      typography: typo('heading', { fontSize: 16, align: 'center' }),
    }),
    slot('MEMBER_3_ROLE', 'cols 9-12, rows 9-10', 'caption', 'Co-founder & COO', {
      layer: 10,
      typography: typo('caption', { align: 'center' }),
    }),
  ], { mode: 'team_full_image_cards' }),

  team_by_department_v1: layoutBase('team_by_department_v1', 'team', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Team by department', {
      typography: typo('heading', { fontSize: 32, align: 'center' }),
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
}

export default CATALOG
