/** Shared Brand Kit constants */

/** Guideline deck templates — ids must match backend brandKit.guidelineTemplates.js. */
export const GUIDELINE_TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean white pages, flat sections, and generous whitespace.',
    appearance: 'light',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Brand side rail, content cards, and a footer band.',
    appearance: 'light',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark, high-contrast deck on your dark-mode palette.',
    appearance: 'dark',
  },
]

export const DEFAULT_GUIDELINE_TEMPLATE_ID = 'minimal'

export const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: '300 Light' },
  { value: '400', label: '400 Regular' },
  { value: '500', label: '500 Medium' },
  { value: '600', label: '600 Semi-bold' },
  { value: '700', label: '700 Bold' },
  { value: '800', label: '800 Extra Bold' },
]

export const FONT_ROLE_DEFAULTS = {
  heading: {
    family: 'Outfit',
    weight: 700,
    sizePx: 40,
    size: '40px',
    lineHeight: 1.2,
    lightTextColorId: 'c3',
    darkTextColorId: 'c6',
  },
  subheading: {
    family: 'Space Grotesk',
    weight: 600,
    sizePx: 20,
    size: '20px',
    lineHeight: 1.4,
    lightTextColorId: 'c3',
    darkTextColorId: 'c6',
  },
  body: {
    family: 'Inter',
    weight: 400,
    sizePx: 14,
    size: '14px',
    lineHeight: 1.6,
    lightTextColorId: 'c3',
    darkTextColorId: 'c6',
  },
}
