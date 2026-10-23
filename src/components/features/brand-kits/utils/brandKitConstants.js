/** Shared Brand Kit constants */

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
