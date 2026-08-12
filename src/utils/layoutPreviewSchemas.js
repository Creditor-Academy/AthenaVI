/** Built-in slot schemas for local layout picker cards (Add slide → Layouts). */
export const BUILTIN_LAYOUT_PREVIEW_SCHEMAS = {
  blank: { slots: [] },
  title: {
    slots: [
      { id: 'TITLE', region: 'cols 3-10, rows 3-5', role: 'heading', placeholder_text: 'Slide title' },
      {
        id: 'SUB',
        region: 'cols 4-9, rows 6-8',
        role: 'subheading',
        placeholder_text: 'Subtitle or supporting line',
      },
    ],
  },
  bullets: {
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Section title' },
      { id: 'B1', region: 'cols 2-11, rows 4-5', role: 'body', placeholder_text: 'Point one' },
      { id: 'B2', region: 'cols 2-11, rows 5-6', role: 'body', placeholder_text: 'Point two' },
      { id: 'B3', region: 'cols 2-11, rows 6-7', role: 'body', placeholder_text: 'Point three' },
    ],
  },
  'two-col': {
    slots: [
      { id: 'LEFT', region: 'cols 1-6, rows 2-9', role: 'body', placeholder_text: 'Left column' },
      { id: 'RIGHT', region: 'cols 7-12, rows 2-9', role: 'body', placeholder_text: 'Right column' },
    ],
  },
  'image-right': {
    slots: [
      { id: 'HEADING', region: 'cols 1-6, rows 2-3', role: 'heading', placeholder_text: 'Feature highlight' },
      {
        id: 'BODY',
        region: 'cols 1-6, rows 4-8',
        role: 'body',
        placeholder_text: 'Describe the feature or story.',
      },
      { id: 'IMAGE', region: 'cols 7-12, rows 1-10', role: 'image' },
    ],
  },
  'image-statement': {
    preview: {
      label: 'Wide image with statement',
      subheadline: 'Subheadline',
      body: "Real beauty is to be true to oneself. That's what makes me feel good.",
    },
    slots: [
      { id: 'IMAGE', region: 'cols 1-12, rows 1-6', role: 'image' },
      { id: 'SUB', region: 'cols 2-11, rows 7-8', role: 'subheading', placeholder_text: 'Subheadline' },
      {
        id: 'QUOTE',
        region: 'cols 2-11, rows 8-10',
        role: 'body',
        placeholder_text: "Real beauty is to be true to oneself. That's what makes me feel good.",
      },
    ],
  },
  quote: {
    slots: [
      {
        id: 'QUOTE',
        region: 'cols 2-11, rows 4-7',
        role: 'body',
        placeholder_text: '“A short quote that makes your point.”',
      },
    ],
  },
  stats: {
    slots: [
      { id: 'STAT', region: 'cols 4-9, rows 3-6', role: 'stat', placeholder_text: '42%' },
      { id: 'LABEL', region: 'cols 5-8, rows 7-8', role: 'stat_label', placeholder_text: 'Key metric' },
    ],
  },
  section: {
    slots: [
      { id: 'SECTION', region: 'cols 3-10, rows 4-7', role: 'heading', placeholder_text: 'New section' },
    ],
  },
}

/** Resolve slots + preview hints from a catalog template or built-in layout card. */
export function resolveLayoutPreviewSchema({ schema, previewKind, template } = {}) {
  const fromTemplate = template?.schema || template?.raw?.schema
  const base = schema || fromTemplate
  if (base?.slots?.length) return base
  if (previewKind && BUILTIN_LAYOUT_PREVIEW_SCHEMAS[previewKind]) {
    return BUILTIN_LAYOUT_PREVIEW_SCHEMAS[previewKind]
  }
  return { slots: [] }
}

export function getLayoutPreviewSlots(source) {
  return resolveLayoutPreviewSchema(source).slots ?? []
}
