/**
 * Hand-tuned DeckLayout metadata keyed by existing layout_id.
 * Merged over heuristic output. Never replace schema.slots geometry.
 */

export const TITLE_HERO_RIGHT_FADE_OVERRIDE = {
  id: 'title_hero_right_fade_v1',
  name: 'Split Hero',
  description:
    'Dominant image on the left with right-edge fade, and large headline and supporting text on the right.',
  version: 1,
  category: 'hero',
  slidePurposes: ['cover', 'introduction', 'product'],
  contentTypes: ['title', 'subtitle', 'image'],
  tags: ['hero', 'premium', 'minimal', 'image-led'],
  contentCapacity: {
    maxTitleCharacters: 80,
    maxSubtitleCharacters: 140,
    maxBodyCharacters: 0,
    maxBullets: 0,
    maxCards: 0,
    maxImages: 1,
    maxMetrics: 0,
    maxColumns: 2,
    density: 'low',
  },
  composition: {
    structure: 'split',
    imagePosition: 'left',
    textPosition: 'right',
    alignment: 'left',
    visualWeight: 'image-heavy',
  },
  style: {
    designStyles: ['modern', 'minimal', 'premium'],
    moods: ['professional', 'premium', 'confident'],
    industries: ['technology', 'business', 'startup'],
  },
  supportedElements: {
    title: true,
    subtitle: true,
    body: false,
    bullets: false,
    image: true,
    icons: false,
    metrics: false,
    chart: false,
    table: false,
    cards: false,
    quote: false,
  },
}

export const SECTION_DIVIDER_CENTERED_OVERRIDE = {
  id: 'section_divider_centered_v1',
  name: 'Section Divider — Centered',
  description:
    'Elegant full-slide centered section break with a large accent section number, bold heading, and muted subtitle. Decorated with a soft radial aura, side accent bars flanking the number, and a subtle dot grid for depth.',
  version: 1,
  category: 'section_divider',
  slidePurposes: ['section', 'transition', 'chapter'],
  contentTypes: ['title', 'subtitle', 'stat'],
  tags: ['section', 'divider', 'centered', 'premium', 'minimal'],
  contentCapacity: {
    maxTitleCharacters: 60,
    maxSubtitleCharacters: 100,
    maxBodyCharacters: 0,
    maxBullets: 0,
    maxCards: 0,
    maxImages: 0,
    maxMetrics: 0,
    maxColumns: 1,
    density: 'low',
  },
  composition: {
    structure: 'centered',
    alignment: 'center',
    visualWeight: 'text-only',
  },
  style: {
    designStyles: ['modern', 'minimal', 'premium'],
    moods: ['professional', 'clean', 'confident'],
    industries: ['technology', 'business', 'education', 'startup'],
  },
  supportedElements: {
    title: true,
    subtitle: true,
    body: false,
    bullets: false,
    image: false,
    icons: false,
    metrics: false,
    chart: false,
    table: false,
    cards: false,
    quote: false,
  },
}

export const SECTION_DIVIDER_NUMBERED_CIRCLE_OVERRIDE = {
  id: 'section_divider_numbered_circle_v1',
  name: 'Section Divider — Numbered Circle',
  description:
    'Elegant full-slide centered section break featuring a large filled accent circle badge containing the section number (white text on accent background), flanked by short horizontal accent rules. Beneath the badge: bold heading, muted subtitle, and a short accent pill underline. Decorated with a soft radial aura bloom and a dashed concentric outer ring with cardinal accent dots.',
  version: 1,
  category: 'section_divider',
  slidePurposes: ['section', 'transition', 'chapter'],
  contentTypes: ['title', 'subtitle', 'stat'],
  tags: ['section', 'divider', 'circle', 'badge', 'numbered', 'premium', 'minimal'],
  contentCapacity: {
    maxTitleCharacters: 55,
    maxSubtitleCharacters: 90,
    maxBodyCharacters: 0,
    maxBullets: 0,
    maxCards: 0,
    maxImages: 0,
    maxMetrics: 0,
    maxColumns: 1,
    density: 'low',
  },
  composition: {
    structure: 'centered',
    alignment: 'center',
    visualWeight: 'accent-badge',
  },
  style: {
    designStyles: ['modern', 'premium', 'bold'],
    moods: ['professional', 'confident', 'dynamic'],
    industries: ['technology', 'business', 'education', 'startup'],
  },
  supportedElements: {
    title: true,
    subtitle: true,
    body: false,
    bullets: false,
    image: false,
    icons: false,
    metrics: false,
    chart: false,
    table: false,
    cards: false,
    quote: false,
  },
}

export const SECTION_WITH_IMAGE_OVERRIDE = {
  id: 'section_with_image_v1',
  name: 'Section With Image',
  description:
    'Modern executive section overview featuring an organic wave hero image, eyebrow tracker with accent line, bold title, body narrative, and 3 circular feature badges (Clarity, Alignment, Momentum).',
  version: 1,
  category: 'image+text',
  slidePurposes: ['section', 'overview', 'transition'],
  contentTypes: ['title', 'body', 'image'],
  tags: ['section', 'image', 'organic', 'wave', 'modern', 'badges'],
  contentCapacity: {
    maxTitleCharacters: 50,
    maxSubtitleCharacters: 160,
    maxBodyCharacters: 200,
    maxBullets: 0,
    maxCards: 3,
    maxImages: 1,
    maxMetrics: 0,
    maxColumns: 2,
    density: 'medium',
  },
  composition: {
    structure: 'split',
    alignment: 'left',
    visualWeight: 'balanced',
  },
  style: {
    designStyles: ['modern', 'premium', 'dynamic'],
    moods: ['professional', 'confident', 'inspiring'],
    industries: ['technology', 'business', 'creative', 'consulting'],
  },
  supportedElements: {
    title: true,
    subtitle: true,
    body: true,
    bullets: false,
    image: true,
    icons: true,
    metrics: false,
    chart: false,
    table: false,
    cards: false,
    quote: false,
  },
}

export const LAYOUT_METADATA_OVERRIDES = {
  title_hero_right_fade_v1: TITLE_HERO_RIGHT_FADE_OVERRIDE,
  section_divider_centered_v1: SECTION_DIVIDER_CENTERED_OVERRIDE,
  section_divider_numbered_v1: SECTION_DIVIDER_CENTERED_OVERRIDE,
  section_divider_numbered_circle_v1: SECTION_DIVIDER_NUMBERED_CIRCLE_OVERRIDE,
  section_with_image_v1: SECTION_WITH_IMAGE_OVERRIDE,
}

export function applyLayoutMetadataOverride(layout) {
  const id = String(layout?.id || '').trim()
  const overlay = LAYOUT_METADATA_OVERRIDES[id]
  if (!overlay) return layout

  return {
    ...layout,
    ...overlay,
    id: layout.id,
    contentType: layout.contentType,
    schema: layout.schema,
    elements: layout.elements,
    contentCapacity: { ...layout.contentCapacity, ...overlay.contentCapacity },
    composition: { ...layout.composition, ...overlay.composition },
    style: {
      ...layout.style,
      ...overlay.style,
      designStyles: overlay.style?.designStyles || layout.style?.designStyles,
      moods: overlay.style?.moods || layout.style?.moods,
      industries: overlay.style?.industries || layout.style?.industries,
    },
    supportedElements: { ...layout.supportedElements, ...overlay.supportedElements },
    extensions: overlay.extensions || layout.extensions,
  }
}
