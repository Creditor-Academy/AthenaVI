/**
 * Registry of deck layout schemas for pack slide previews.
 * Keyed by layout_id — add entries when new DECK_LAYOUT templates are published.
 */

const REGISTRY = {
  title_centered_meta_date_v1: {
    layout_id: 'title_centered_meta_date_v1',
    content_type: 'title',
    preview: {
      slots: {
        TITLE_META: { text: 'Your name · Company name', variant: 'caption', bold: false, uppercase: false },
        MAIN_TITLE: { text: 'Presentation title', variant: 'title', bold: true, uppercase: true },
        DATE_LINE: { text: 'Date', variant: 'caption', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'TITLE_META', region: 'cols 3-10, rows 2-3', role: 'eyebrow', placeholder_text: 'Your name · Company name' },
      { id: 'MAIN_TITLE', region: 'cols 2-11, rows 4-6', role: 'heading', placeholder_text: 'Presentation title' },
      { id: 'DATE_LINE', region: 'cols 4-9, rows 8-9', role: 'caption', placeholder_text: 'Date' },
    ],
  },

  title_with_logo_v1: {
    layout_id: 'title_with_logo_v1',
    content_type: 'title',
    preview: {
      slots: {
        LOGO: { text: 'logo', variant: 'logo', bold: false, uppercase: false },
        MAIN_TITLE: { text: 'Add your presentation title or company tagline', variant: 'title', bold: true, uppercase: true },
        FOOTNOTE: { text: 'A small footnote or subheadline', variant: 'caption', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'LOGO', region: 'cols 1-3, rows 1-2', role: 'decoration', placeholder_text: 'logo' },
      { id: 'MAIN_TITLE', region: 'cols 1-11, rows 3-6', role: 'heading', placeholder_text: 'Add your presentation title or company tagline' },
      { id: 'FOOTNOTE', region: 'cols 1-8, rows 8-9', role: 'caption', placeholder_text: 'A small footnote or subheadline' },
    ],
  },

  title_with_image_v1: {
    layout_id: 'title_with_image_v1',
    content_type: 'image+text',
    preview: {
      slots: {
        LOGO: { text: 'logo', variant: 'logo', bold: false, uppercase: false },
        MAIN_TITLE: { text: 'Your tagline or title', variant: 'title', bold: true, uppercase: true },
        FOOTNOTE: { text: 'A small footnote or subheadline', variant: 'caption', bold: false, uppercase: false },
        HERO_IMAGE: { variant: 'image' },
      },
    },
    slots: [
      { id: 'LOGO', region: 'cols 1-3, rows 1-2', role: 'decoration', placeholder_text: 'logo' },
      { id: 'MAIN_TITLE', region: 'cols 1-7, rows 3-6', role: 'heading', placeholder_text: 'Your tagline or title' },
      { id: 'FOOTNOTE', region: 'cols 1-6, rows 8-9', role: 'caption', placeholder_text: 'A small footnote or subheadline' },
      { id: 'HERO_IMAGE', region: 'cols 8-12, rows 1-10', role: 'image' },
    ],
  },

  section_with_image_v1: {
    layout_id: 'section_with_image_v1',
    content_type: 'image+text',
    preview: {
      slots: {
        HEADING: { text: 'Section title', variant: 'title', bold: true, uppercase: true },
        BODY: { text: 'Explain what this section is about', variant: 'body', bold: false, uppercase: false },
        HERO_IMAGE: { variant: 'image' },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 1-7, rows 2-4', role: 'heading', placeholder_text: 'Section title' },
      { id: 'BODY', region: 'cols 1-7, rows 4-7', role: 'body', placeholder_text: 'Explain what this section is about' },
      { id: 'HERO_IMAGE', region: 'cols 8-12, rows 1-10', role: 'image' },
    ],
  },

  section_right_image_v1: {
    layout_id: 'section_right_image_v1',
    content_type: 'image+text',
    preview: {
      slots: {
        HEADING: { text: 'Section title', variant: 'title', bold: true, uppercase: true },
        HERO_IMAGE: { variant: 'image' },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 1-7, rows 3-7', role: 'heading', placeholder_text: 'Section title' },
      { id: 'HERO_IMAGE', region: 'cols 8-12, rows 1-10', role: 'image' },
    ],
  },

  section_left_image_v1: {
    layout_id: 'section_left_image_v1',
    content_type: 'image+text',
    preview: {
      slots: {
        HERO_IMAGE: { variant: 'image' },
        HEADING: { text: 'Section title', variant: 'title', bold: true, uppercase: true },
      },
    },
    slots: [
      { id: 'HERO_IMAGE', region: 'cols 1-5, rows 1-10', role: 'image' },
      { id: 'HEADING', region: 'cols 6-12, rows 3-7', role: 'heading', placeholder_text: 'Section title' },
    ],
  },

  wide_image_statement_v1: {
    layout_id: 'wide_image_statement_v1',
    content_type: 'image+text',
    preview: {
      slots: {
        HERO_IMAGE: { variant: 'image' },
        SUBHEADLINE: { text: 'Subheadline', variant: 'subheading', bold: true, uppercase: false },
        STATEMENT: {
          text: "Real beauty is to be true to oneself. That's what makes me feel good.",
          variant: 'title',
          bold: true,
          uppercase: true,
        },
      },
    },
    slots: [
      { id: 'HERO_IMAGE', region: 'cols 1-12, rows 1-5', role: 'image' },
      { id: 'SUBHEADLINE', region: 'cols 2-11, rows 6-7', role: 'subheading', placeholder_text: 'Subheadline' },
      { id: 'STATEMENT', region: 'cols 2-11, rows 7-10', role: 'quote', placeholder_text: "Real beauty is to be true to oneself. That's what makes me feel good." },
    ],
  },

  full_bg_image_text_v1: {
    layout_id: 'full_bg_image_text_v1',
    content_type: 'image+text',
    preview: {
      slots: {
        BACKGROUND_IMAGE: { variant: 'image' },
        MAIN_TITLE: { text: 'Presentation title', variant: 'title', bold: true, uppercase: true },
        SUBTITLE: { text: 'Supporting line or tagline', variant: 'subheading', bold: false, uppercase: false },
        BODY: { text: 'Add a short supporting paragraph that explains the slide topic.', variant: 'body', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'BACKGROUND_IMAGE', region: 'cols 1-12, rows 1-10', role: 'background' },
      { id: 'MAIN_TITLE', region: 'cols 2-11, rows 2-4', role: 'heading', placeholder_text: 'Presentation title' },
      { id: 'SUBTITLE', region: 'cols 2-10, rows 4-5', role: 'subheading', placeholder_text: 'Supporting line or tagline' },
      { id: 'BODY', region: 'cols 2-10, rows 5-7', role: 'body', placeholder_text: 'Add a short supporting paragraph that explains the slide topic.' },
    ],
  },

  stat_three_up_v2: {
    layout_id: 'stat_three_up_v2',
    content_type: 'stat',
    preview: {
      mode: 'stat_row',
      slots: {
        HEADING: { text: 'Why customers choose us', variant: 'title', bold: true, uppercase: false },
      },
      stats: [
        { value: '98%', label: 'Customer satisfaction' },
        { value: '3.2x', label: 'Average ROI' },
        { value: '500+', label: 'Active teams' },
      ],
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Section title' },
      { id: 'STAT_1_VALUE', region: 'cols 2-4, rows 5-7', role: 'stat', placeholder_text: '98%' },
      { id: 'STAT_1_LABEL', region: 'cols 2-4, rows 7-8', role: 'stat_label', placeholder_text: 'Customer satisfaction' },
      { id: 'STAT_2_VALUE', region: 'cols 5-8, rows 5-7', role: 'stat', placeholder_text: '3.2x' },
      { id: 'STAT_2_LABEL', region: 'cols 5-8, rows 7-8', role: 'stat_label', placeholder_text: 'Average ROI' },
      { id: 'STAT_3_VALUE', region: 'cols 9-11, rows 5-7', role: 'stat', placeholder_text: '500+' },
      { id: 'STAT_3_LABEL', region: 'cols 9-11, rows 7-8', role: 'stat_label', placeholder_text: 'Active teams' },
    ],
  },

  comparison_side_by_side_v1: {
    layout_id: 'comparison_side_by_side_v1',
    content_type: 'comparison',
    preview: {
      mode: 'comparison_columns',
      slots: {
        HEADING: { text: 'Pricing', variant: 'title', bold: true, uppercase: false },
        SUBTITLE: { text: 'Simple plans that scale with your team', variant: 'subheading', bold: false, uppercase: false },
      },
      columns: [
        {
          label: 'Starter',
          items: ['$29 / month', 'Up to 5 users', 'Core features', 'Email support'],
        },
        {
          label: 'Pro',
          items: ['$79 / month', 'Up to 25 users', 'Advanced features', 'Priority support'],
        },
        {
          label: 'Enterprise',
          items: ['Custom pricing', 'Unlimited users', 'SSO & security', 'Dedicated success manager'],
        },
      ],
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Pricing' },
      { id: 'SUBTITLE', region: 'cols 2-11, rows 3-4', role: 'subheading', placeholder_text: 'Simple plans that scale with your team' },
      { id: 'COL_1_LABEL', region: 'cols 2-4, rows 5-6', role: 'heading', placeholder_text: 'Starter' },
      { id: 'COL_2_LABEL', region: 'cols 5-8, rows 5-6', role: 'heading', placeholder_text: 'Pro' },
      { id: 'COL_3_LABEL', region: 'cols 9-11, rows 5-6', role: 'heading', placeholder_text: 'Enterprise' },
    ],
  },

  two_image_columns_v1: {
    layout_id: 'two_image_columns_v1',
    content_type: 'image+text',
    preview: {
      mode: 'two_image_columns',
      slots: {
        EYEBROW: { text: 'Describe this slide', variant: 'subheading', bold: true, uppercase: false },
      },
      columns: [
        { title: 'Make your point', body: 'Expand on it here. Why is it important? Why does it matter?' },
        { title: 'Make another point', body: "You already know that it's important. But what about your listeners?" },
      ],
    },
    slots: [
      { id: 'EYEBROW', region: 'cols 2-11, rows 2-3', role: 'eyebrow', placeholder_text: 'Describe this slide' },
      { id: 'COL_1_IMAGE', region: 'cols 2-6, rows 3-6', role: 'image' },
      { id: 'COL_1_TITLE', region: 'cols 2-6, rows 6-7', role: 'heading', placeholder_text: 'Make your point' },
      { id: 'COL_1_BODY', region: 'cols 2-6, rows 7-9', role: 'body', placeholder_text: 'Expand on it here.' },
      { id: 'COL_2_IMAGE', region: 'cols 7-11, rows 3-6', role: 'image' },
      { id: 'COL_2_TITLE', region: 'cols 7-11, rows 6-7', role: 'heading', placeholder_text: 'Make another point' },
      { id: 'COL_2_BODY', region: 'cols 7-11, rows 7-9', role: 'body', placeholder_text: 'You already know that it matters.' },
    ],
  },

  chart_exponential_split_v1: {
    layout_id: 'chart_exponential_split_v1',
    content_type: 'chart',
    preview: {
      mode: 'chart_split',
      slots: {
        HEADING: { text: 'A chart is easier to understand with a meaningful title', variant: 'title', bold: true, uppercase: false },
      },
      bodyText: 'Sometimes a chart needs more explanation. Add some text here to give your data additional context.',
      chartValues: [300, 800, 2500, 5000],
      chartLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
      chartCaption: 'This chart has a subtitle',
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-6, rows 3-5', role: 'heading', placeholder_text: 'Chart title' },
      { id: 'BODY', region: 'cols 2-6, rows 5-8', role: 'body', placeholder_text: 'Supporting explanation' },
      { id: 'CHART', region: 'cols 7-11, rows 2-9', role: 'chart' },
      { id: 'CHART_CAPTION', region: 'cols 7-11, rows 9-10', role: 'caption', placeholder_text: 'Chart subtitle' },
    ],
  },

  quote_with_attribution_v1: {
    layout_id: 'quote_with_attribution_v1',
    content_type: 'quote',
    preview: {
      mode: 'quote_attribution',
      quoteText: 'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.',
      authorName: 'Gemine Macberry',
      authorTitle: 'VP of Engineering at Acme Inc.',
    },
    slots: [
      { id: 'QUOTE', region: 'cols 2-11, rows 3-7', role: 'quote', placeholder_text: 'Client quote goes here.' },
      { id: 'AUTHOR_NAME', region: 'cols 2-8, rows 8-9', role: 'heading', placeholder_text: 'Author name' },
      { id: 'AUTHOR_TITLE', region: 'cols 2-8, rows 9-10', role: 'caption', placeholder_text: 'Author title' },
      { id: 'AUTHOR_AVATAR', region: 'cols 2-3, rows 8-10', role: 'image' },
    ],
  },

  team_five_staggered_v1: {
    layout_id: 'team_five_staggered_v1',
    content_type: 'team',
    preview: {
      mode: 'team_staggered',
      slots: {
        HEADING: { text: 'Meet the team', variant: 'title', bold: true, uppercase: false },
      },
      members: [
        { name: 'Johanna Doe', role: 'Co-founder & CEO', email: 'johanna@example.com', phone: '+123456789' },
        { name: 'Jane Doe', role: 'Co-founder & CTO', email: 'jane@example.com', phone: '+123456789' },
        { name: 'Joe Doe', role: 'Co-founder & COO', email: 'joe@example.com', phone: '+123456789' },
        { name: 'Jenny Doe', role: 'President', email: 'jenny@example.com', phone: '+123456789' },
        { name: 'John Doe', role: 'Head of Design', email: 'john@example.com', phone: '+123456789' },
      ],
    },
    slots: [
      { id: 'HEADING', region: 'cols 3-10, rows 2-3', role: 'heading', placeholder_text: 'Meet the team' },
      { id: 'MEMBER_1', region: 'cols 2-4, rows 4-9', role: 'contact' },
      { id: 'MEMBER_2', region: 'cols 5-7, rows 4-9', role: 'contact' },
      { id: 'MEMBER_3', region: 'cols 8-10, rows 4-9', role: 'contact' },
      { id: 'MEMBER_4', region: 'cols 3-5, rows 9-10', role: 'contact' },
      { id: 'MEMBER_5', region: 'cols 7-9, rows 9-10', role: 'contact' },
    ],
  },

  pricing_three_plans_v1: {
    layout_id: 'pricing_three_plans_v1',
    content_type: 'comparison',
    preview: {
      mode: 'pricing_plans',
      slots: {
        EYEBROW: { text: 'Describe this slide', variant: 'eyebrow', bold: false, uppercase: true },
      },
      columns: [
        { label: 'Basic', price: '$99', items: ['The first point', 'The second point', 'The third point'] },
        { label: 'Standard', price: '$299', items: ['The first point', 'The second point', 'The third point', 'The fourth point'] },
        { label: 'Pro', price: '$999', items: ['The first point', 'The second point', 'The third point', 'The fourth point', 'The final point'] },
      ],
    },
    slots: [
      { id: 'EYEBROW', region: 'cols 4-9, rows 2-3', role: 'eyebrow', placeholder_text: 'Describe this slide' },
      { id: 'PLAN_1', region: 'cols 2-4, rows 4-10', role: 'body' },
      { id: 'PLAN_2', region: 'cols 5-8, rows 4-10', role: 'body' },
      { id: 'PLAN_3', region: 'cols 9-11, rows 4-10', role: 'body' },
    ],
  },

  pricing_three_plans_highlight_v1: {
    layout_id: 'pricing_three_plans_highlight_v1',
    content_type: 'comparison',
    grid: '12-col',
    highlightedPlanIndex: 1,
    preview: {
      mode: 'pricing_plans',
      highlightedColumnIndex: 1,
      slots: {
        EYEBROW: { text: 'Describe this slide', variant: 'eyebrow', bold: false, uppercase: true },
      },
      columns: [
        { label: 'Basic', price: '$99', items: ['The first point', 'The second point', 'The third point'] },
        {
          label: 'Standard',
          price: '$299',
          highlighted: true,
          items: ['The first point', 'The second point', 'The third point', 'The fourth point'],
        },
        { label: 'Pro', price: '$999', items: ['The first point', 'The second point', 'The third point', 'The fourth point', 'The final point'] },
      ],
    },
    generationHints: {
      planCount: 3,
      highlightedPlanIndex: 1,
      highlightedPlanLabel: 'Standard',
    },
    slots: [
      { id: 'EYEBROW', region: 'cols 4-9, rows 2-3', role: 'eyebrow', placeholder_text: 'Describe this slide' },
      { id: 'PLAN_1_BG', region: 'cols 2-4, rows 4-10', role: 'background' },
      { id: 'PLAN_1_LABEL', region: 'cols 2-4, rows 4-5', role: 'heading', placeholder_text: 'Basic' },
      { id: 'PLAN_1_PRICE', region: 'cols 2-4, rows 5-6', role: 'stat', placeholder_text: '$99' },
      { id: 'PLAN_1_FEATURES', region: 'cols 2-4, rows 6-10', role: 'body', placeholder_text: 'The first point\nThe second point\nThe third point' },
      {
        id: 'PLAN_2_BG',
        region: 'cols 5-8, rows 4-10',
        role: 'background',
        highlight: true,
        style: { border: '2px solid accent', background: 'accentSoft' },
      },
      { id: 'PLAN_2_LABEL', region: 'cols 5-8, rows 4-5', role: 'heading', placeholder_text: 'Standard' },
      { id: 'PLAN_2_PRICE', region: 'cols 5-8, rows 5-6', role: 'stat', placeholder_text: '$299' },
      {
        id: 'PLAN_2_FEATURES',
        region: 'cols 5-8, rows 6-10',
        role: 'body',
        placeholder_text: 'The first point\nThe second point\nThe third point\nThe fourth point',
      },
      { id: 'PLAN_3_BG', region: 'cols 9-11, rows 4-10', role: 'background' },
      { id: 'PLAN_3_LABEL', region: 'cols 9-11, rows 4-5', role: 'heading', placeholder_text: 'Pro' },
      { id: 'PLAN_3_PRICE', region: 'cols 9-11, rows 5-6', role: 'stat', placeholder_text: '$999' },
      {
        id: 'PLAN_3_FEATURES',
        region: 'cols 9-11, rows 6-10',
        role: 'body',
        placeholder_text: 'The first point\nThe second point\nThe third point\nThe fourth point\nThe final point',
      },
    ],
  },

  closing_centered_cta_v1: {
    layout_id: 'closing_centered_cta_v1',
    content_type: 'closing',
    preview: {
      mode: 'closing_cta',
      slots: {
        HEADING: { text: 'Thank you', variant: 'title', bold: true, uppercase: false },
        SUBTITLE: { text: "Let's build something great together", variant: 'subheading', bold: false, uppercase: false },
        CTA: { text: 'Book a demo', variant: 'body', bold: true, uppercase: false },
        CONTACT: { text: 'hello@company.com · company.com', variant: 'caption', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 3-10, rows 3-5', role: 'heading', placeholder_text: 'Thank you' },
      { id: 'SUBTITLE', region: 'cols 3-10, rows 5-6', role: 'subheading', placeholder_text: "Let's build something great together" },
      { id: 'CTA', region: 'cols 4-9, rows 6-7', role: 'cta', placeholder_text: 'Book a demo' },
      { id: 'CONTACT', region: 'cols 4-9, rows 8-9', role: 'contact', placeholder_text: 'hello@company.com' },
    ],
  },
}

const PLACEHOLDER_SLOT_MAP = {
  MAIN_TITLE: ['title'],
  HEADING: ['title'],
  TITLE_META: ['meta'],
  DATE_LINE: ['date'],
  SUBTITLE: ['subtitle'],
  SUBHEADLINE: ['subheadline'],
  FOOTNOTE: ['footnote'],
  CTA: ['cta'],
  CONTACT: ['contact'],
  BODY: ['body'],
  STATEMENT: ['statement', 'quote'],
  LOGO: ['logo'],
}

/** @returns {object|null} layout schema clone for preview */
export function getDeckLayoutSchema(layoutId) {
  const key = String(layoutId || '').trim()
  if (!key || !REGISTRY[key]) return null
  return JSON.parse(JSON.stringify(REGISTRY[key]))
}

/** Merge pack slide placeholder copy into layout preview hints. */
export function buildPackSlidePreviewSchema(layoutSchema, slide) {
  if (!layoutSchema) return null
  const schema = JSON.parse(JSON.stringify(layoutSchema))
  const pl = slide?.placeholder && typeof slide.placeholder === 'object' ? slide.placeholder : {}
  schema.preview = schema.preview || {}
  schema.preview.slots = { ...(schema.preview.slots || {}) }

  for (const slot of schema.slots || []) {
    const keys = PLACEHOLDER_SLOT_MAP[slot.id] || [slot.id.toLowerCase()]
    const text = keys.map((k) => pl[k]).find((v) => v != null && String(v).trim())
    if (!text) continue
    schema.preview.slots[slot.id] = {
      ...(schema.preview.slots[slot.id] || {}),
      text: String(text),
    }
  }

  if (Array.isArray(pl.stats) && pl.stats.length) {
    schema.preview.stats = pl.stats.slice(0, 3).map((stat) => ({
      value: String(stat?.value ?? stat?.stat ?? '—'),
      label: String(stat?.label ?? ''),
    }))
  }

  if (pl.subtitle != null && String(pl.subtitle).trim()) {
    schema.preview.slots.SUBTITLE = {
      ...(schema.preview.slots.SUBTITLE || {}),
      text: String(pl.subtitle),
      variant: 'subheading',
    }
  }

  const sideSources = Array.isArray(pl.sides)
    ? pl.sides
    : Array.isArray(pl.options)
      ? pl.options
      : null

  if (sideSources?.length) {
    schema.preview.columns = sideSources.slice(0, 3).map((side) => {
      const items = Array.isArray(side?.items)
        ? side.items
        : Array.isArray(side?.bullets)
          ? side.bullets
          : []
      return {
        label: String(side?.label || side?.title || side?.name || 'Plan'),
        price: side?.price != null ? String(side.price) : '',
        items: items.slice(0, 5).map((item) =>
          typeof item === 'string' ? item : String(item?.label ?? item?.text ?? item ?? '')
        ),
      }
    })
    if (schema.preview.mode === 'pricing_plans' || sideSources.some((s) => s?.price != null)) {
      schema.preview.mode = 'pricing_plans'
    }
  }

  if (Array.isArray(pl.plans) && pl.plans.length) {
    const highlightIdx =
      typeof slide?.generationHints?.highlightedPlanIndex === 'number'
        ? slide.generationHints.highlightedPlanIndex
        : typeof schema.highlightedPlanIndex === 'number'
          ? schema.highlightedPlanIndex
          : typeof schema.preview?.highlightedColumnIndex === 'number'
            ? schema.preview.highlightedColumnIndex
            : 1
    schema.preview.columns = pl.plans.slice(0, 3).map((plan, index) => ({
      label: String(plan?.label || plan?.name || 'Plan'),
      price: plan?.price != null ? String(plan.price) : '',
      highlighted: plan?.highlighted === true || index === highlightIdx,
      items: (Array.isArray(plan?.items) ? plan.items : Array.isArray(plan?.bullets) ? plan.bullets : [])
        .slice(0, 5)
        .map((item) => (typeof item === 'string' ? item : String(item?.label ?? item?.text ?? item ?? ''))),
    }))
    schema.preview.mode = 'pricing_plans'
    schema.preview.highlightedColumnIndex = highlightIdx
  }

  if (Array.isArray(pl.columns) && pl.columns.length) {
    schema.preview.columns = pl.columns.slice(0, 2).map((col) => ({
      title: String(col?.title || col?.heading || col?.label || 'Point'),
      body: String(col?.body || col?.text || ''),
    }))
    if (schema.preview.mode === 'two_image_columns' || pl.columns[0]?.body != null) {
      schema.preview.mode = 'two_image_columns'
    }
  }

  if (Array.isArray(pl.members) && pl.members.length) {
    schema.preview.members = pl.members.slice(0, 5).map((m) => ({
      name: String(m?.name ?? ''),
      role: String(m?.role ?? m?.title ?? ''),
      email: String(m?.email ?? ''),
      phone: String(m?.phone ?? ''),
    }))
  }

  if (pl.quote != null && String(pl.quote).trim()) {
    schema.preview.quoteText = String(pl.quote)
  }
  if (pl.author != null && String(pl.author).trim()) {
    schema.preview.authorName = String(pl.author)
  }
  if (pl.authorTitle != null && String(pl.authorTitle).trim()) {
    schema.preview.authorTitle = String(pl.authorTitle)
  } else if (pl.title != null && slide?.contentType === 'quote') {
    schema.preview.authorTitle = String(pl.title)
  }

  if (pl.body != null && String(pl.body).trim()) {
    schema.preview.bodyText = String(pl.body)
  }
  if (Array.isArray(pl.series?.[0]?.data)) {
    schema.preview.chartValues = pl.series[0].data.map((v) => Number(v) || 0)
  } else if (Array.isArray(pl.chartValues)) {
    schema.preview.chartValues = pl.chartValues.map((v) => Number(v) || 0)
  }
  if (Array.isArray(pl.labels)) {
    schema.preview.chartLabels = pl.labels.map(String)
  }
  if (pl.chartCaption != null) {
    schema.preview.chartCaption = String(pl.chartCaption)
  }

  if (pl.cta != null && String(pl.cta).trim()) {
    schema.preview.slots.CTA = { ...(schema.preview.slots.CTA || {}), text: String(pl.cta), variant: 'body', bold: true }
  }
  if (pl.contact != null && String(pl.contact).trim()) {
    schema.preview.slots.CONTACT = { ...(schema.preview.slots.CONTACT || {}), text: String(pl.contact), variant: 'caption' }
  }

  return schema
}

export function hasDeckLayoutSchema(layoutId) {
  return Boolean(REGISTRY[String(layoutId || '').trim()])
}

/** Merge registry preview hints into a saved DECK_LAYOUT schema for admin preview. */
export function enrichLayoutSchemaForPreview(schema) {
  if (!schema || typeof schema !== 'object') return schema ?? {}
  const registered = getDeckLayoutSchema(schema.layout_id)
  if (!registered) return schema

  const merged = JSON.parse(JSON.stringify(schema))
  merged.preview = {
    ...(registered.preview || {}),
    ...(merged.preview || {}),
    slots: {
      ...(registered.preview?.slots || {}),
      ...(merged.preview?.slots || {}),
    },
    columns: merged.preview?.columns ?? registered.preview?.columns,
    members: merged.preview?.members ?? registered.preview?.members,
    stats: merged.preview?.stats ?? registered.preview?.stats,
    quoteText: merged.preview?.quoteText ?? registered.preview?.quoteText,
    authorName: merged.preview?.authorName ?? registered.preview?.authorName,
    authorTitle: merged.preview?.authorTitle ?? registered.preview?.authorTitle,
    bodyText: merged.preview?.bodyText ?? registered.preview?.bodyText,
    chartValues: merged.preview?.chartValues ?? registered.preview?.chartValues,
    chartLabels: merged.preview?.chartLabels ?? registered.preview?.chartLabels,
    chartCaption: merged.preview?.chartCaption ?? registered.preview?.chartCaption,
    mode: merged.preview?.mode ?? registered.preview?.mode,
    highlightedColumnIndex:
      merged.preview?.highlightedColumnIndex ??
      merged.highlightedPlanIndex ??
      registered.preview?.highlightedColumnIndex ??
      registered.highlightedPlanIndex,
  }
  if (!Array.isArray(merged.slots) || merged.slots.length === 0) {
    merged.slots = registered.slots
  }
  return merged
}

export default REGISTRY
