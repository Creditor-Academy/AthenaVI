/**
 * Registry of deck layout schemas for pack slide previews.
 * Keyed by layout_id — add entries when new DECK_LAYOUT templates are published.
 */

function layoutSchemaHasPreviewCanvas(schema) {
  const doc = schema?.preview?.canvasElements || schema?.elements
  return Boolean(Array.isArray(doc?.elements) && doc.elements.length)
}

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
    content_type: 'pricing',
    grid: '12-col',
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
    content_type: 'pricing',
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
    grid: '12-col',
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

  title_centered_v1: {
    layout_id: 'title_centered_v1',
    content_type: 'title',
    preview: {
      slots: {
        MAIN_TITLE: { text: 'Presentation Title', variant: 'title', bold: true, uppercase: false },
        SUBTITLE: { text: 'Tagline or company name', variant: 'subheading', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'MAIN_TITLE', region: 'cols 2-11, rows 4-6', role: 'heading', placeholder_text: 'Presentation Title' },
      { id: 'SUBTITLE', region: 'cols 3-10, rows 6-7', role: 'subheading', placeholder_text: 'Tagline or company name' },
    ],
  },

  bullet_list_classic_v1: {
    layout_id: 'bullet_list_classic_v1',
    content_type: 'bullet_list',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'Key Points', variant: 'title', bold: true, uppercase: false },
        BULLET_1: { text: 'First point — concise and actionable', variant: 'body', bold: false, uppercase: false },
        BULLET_2: { text: 'Second point — build on the narrative', variant: 'body', bold: false, uppercase: false },
        BULLET_3: { text: 'Third point — reinforce the message', variant: 'body', bold: false, uppercase: false },
        BULLET_4: { text: 'Fourth point — optional supporting detail', variant: 'body', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Key Points' },
      { id: 'BULLET_1', region: 'cols 2-10, rows 4-5', role: 'body', placeholder_text: 'First point' },
      { id: 'BULLET_2', region: 'cols 2-10, rows 5-6', role: 'body', placeholder_text: 'Second point' },
      { id: 'BULLET_3', region: 'cols 2-10, rows 6-7', role: 'body', placeholder_text: 'Third point' },
      { id: 'BULLET_4', region: 'cols 2-10, rows 7-8', role: 'body', placeholder_text: 'Fourth point' },
    ],
  },

  section_divider_centered_v1: {
    layout_id: 'section_divider_centered_v1',
    content_type: 'section_divider',
    grid: '12-col',
    preview: {
      slots: {
        SECTION_NUMBER: { text: '01', variant: 'stat', bold: true, uppercase: false },
        HEADING: { text: 'Section Title', variant: 'title', bold: true, uppercase: true },
        SUBTITLE: { text: 'A short line that sets up what comes next', variant: 'subheading', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'SECTION_NUMBER', region: 'cols 5-8, rows 3-4', role: 'stat', placeholder_text: '01' },
      { id: 'HEADING', region: 'cols 2-11, rows 4-6', role: 'heading', placeholder_text: 'Section Title' },
      { id: 'SUBTITLE', region: 'cols 3-10, rows 6-7', role: 'subheading', placeholder_text: 'A short line that sets up what comes next' },
    ],
  },

  agenda_four_items_v1: {
    layout_id: 'agenda_four_items_v1',
    content_type: 'agenda',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'Agenda', variant: 'title', bold: true, uppercase: false },
        ITEM_1: { text: '01 · Introduction', variant: 'body', bold: true, uppercase: false },
        ITEM_2: { text: '02 · Problem & opportunity', variant: 'body', bold: true, uppercase: false },
        ITEM_3: { text: '03 · Solution & proof', variant: 'body', bold: true, uppercase: false },
        ITEM_4: { text: '04 · Next steps', variant: 'body', bold: true, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Agenda' },
      { id: 'ITEM_1', region: 'cols 2-10, rows 4-5', role: 'body', placeholder_text: '01 · Introduction' },
      { id: 'ITEM_2', region: 'cols 2-10, rows 5-6', role: 'body', placeholder_text: '02 · Problem & opportunity' },
      { id: 'ITEM_3', region: 'cols 2-10, rows 6-7', role: 'body', placeholder_text: '03 · Solution & proof' },
      { id: 'ITEM_4', region: 'cols 2-10, rows 7-8', role: 'body', placeholder_text: '04 · Next steps' },
    ],
  },

  pros_cons_two_column_v1: {
    layout_id: 'pros_cons_two_column_v1',
    content_type: 'comparison',
    grid: '12-col',
    preview: {
      mode: 'comparison_columns',
      slots: {
        HEADING: { text: 'Pros & Cons', variant: 'title', bold: true, uppercase: false },
      },
      columns: [
        { label: 'Pros', items: ['Clear benefit one', 'Strong advantage two', 'Compelling reason three'] },
        { label: 'Cons', items: ['Honest limitation one', 'Trade-off to acknowledge', 'Risk to mitigate'] },
      ],
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Pros & Cons' },
      { id: 'PROS_LABEL', region: 'cols 2-6, rows 4-5', role: 'heading', placeholder_text: 'Pros' },
      { id: 'PROS_LIST', region: 'cols 2-6, rows 5-9', role: 'body', placeholder_text: 'Benefit one\nBenefit two\nBenefit three' },
      { id: 'CONS_LABEL', region: 'cols 7-11, rows 4-5', role: 'heading', placeholder_text: 'Cons' },
      { id: 'CONS_LIST', region: 'cols 7-11, rows 5-9', role: 'body', placeholder_text: 'Limitation one\nLimitation two\nLimitation three' },
    ],
  },

  timeline_four_steps_v1: {
    layout_id: 'timeline_four_steps_v1',
    content_type: 'timeline',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'Roadmap', variant: 'title', bold: true, uppercase: false },
        STEP_1_LABEL: { text: 'Q1', variant: 'caption', bold: true, uppercase: true },
        STEP_1_TITLE: { text: 'Launch MVP', variant: 'body', bold: true, uppercase: false },
        STEP_2_LABEL: { text: 'Q2', variant: 'caption', bold: true, uppercase: true },
        STEP_2_TITLE: { text: 'Scale sales', variant: 'body', bold: true, uppercase: false },
        STEP_3_LABEL: { text: 'Q3', variant: 'caption', bold: true, uppercase: true },
        STEP_3_TITLE: { text: 'Expand markets', variant: 'body', bold: true, uppercase: false },
        STEP_4_LABEL: { text: 'Q4', variant: 'caption', bold: true, uppercase: true },
        STEP_4_TITLE: { text: 'Series B', variant: 'body', bold: true, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Roadmap' },
      { id: 'STEP_1_LABEL', region: 'cols 2-4, rows 5-6', role: 'caption', placeholder_text: 'Q1' },
      { id: 'STEP_1_TITLE', region: 'cols 2-4, rows 6-8', role: 'body', placeholder_text: 'Launch MVP' },
      { id: 'STEP_2_LABEL', region: 'cols 4-6, rows 5-6', role: 'caption', placeholder_text: 'Q2' },
      { id: 'STEP_2_TITLE', region: 'cols 4-6, rows 6-8', role: 'body', placeholder_text: 'Scale sales' },
      { id: 'STEP_3_LABEL', region: 'cols 7-9, rows 5-6', role: 'caption', placeholder_text: 'Q3' },
      { id: 'STEP_3_TITLE', region: 'cols 7-9, rows 6-8', role: 'body', placeholder_text: 'Expand markets' },
      { id: 'STEP_4_LABEL', region: 'cols 9-11, rows 5-6', role: 'caption', placeholder_text: 'Q4' },
      { id: 'STEP_4_TITLE', region: 'cols 9-11, rows 6-8', role: 'body', placeholder_text: 'Series B' },
    ],
  },

  team_grid_four_v1: {
    layout_id: 'team_grid_four_v1',
    content_type: 'team',
    grid: '12-col',
    preview: {
      mode: 'team_staggered',
      slots: {
        HEADING: { text: 'Leadership team', variant: 'title', bold: true, uppercase: false },
      },
      members: [
        { name: 'Alex Morgan', role: 'CEO', email: 'alex@example.com' },
        { name: 'Sam Rivera', role: 'CTO', email: 'sam@example.com' },
        { name: 'Jordan Lee', role: 'COO', email: 'jordan@example.com' },
        { name: 'Taylor Kim', role: 'CFO', email: 'taylor@example.com' },
      ],
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Leadership team' },
      { id: 'MEMBER_1_AVATAR', region: 'cols 2-4, rows 4-6', role: 'image' },
      { id: 'MEMBER_1_NAME', region: 'cols 2-4, rows 6-7', role: 'heading', placeholder_text: 'Alex Morgan' },
      { id: 'MEMBER_1_ROLE', region: 'cols 2-4, rows 7-8', role: 'caption', placeholder_text: 'CEO' },
      { id: 'MEMBER_2_AVATAR', region: 'cols 4-6, rows 4-6', role: 'image' },
      { id: 'MEMBER_2_NAME', region: 'cols 4-6, rows 6-7', role: 'heading', placeholder_text: 'Sam Rivera' },
      { id: 'MEMBER_2_ROLE', region: 'cols 4-6, rows 7-8', role: 'caption', placeholder_text: 'CTO' },
      { id: 'MEMBER_3_AVATAR', region: 'cols 7-9, rows 4-6', role: 'image' },
      { id: 'MEMBER_3_NAME', region: 'cols 7-9, rows 6-7', role: 'heading', placeholder_text: 'Jordan Lee' },
      { id: 'MEMBER_3_ROLE', region: 'cols 7-9, rows 7-8', role: 'caption', placeholder_text: 'COO' },
      { id: 'MEMBER_4_AVATAR', region: 'cols 9-11, rows 4-6', role: 'image' },
      { id: 'MEMBER_4_NAME', region: 'cols 9-11, rows 6-7', role: 'heading', placeholder_text: 'Taylor Kim' },
      { id: 'MEMBER_4_ROLE', region: 'cols 9-11, rows 7-8', role: 'caption', placeholder_text: 'CFO' },
    ],
  },

  // --- Agenda variants ---
  agenda_numbered_v1: {
    layout_id: 'agenda_numbered_v1',
    content_type: 'agenda',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: "Today's agenda", variant: 'title', bold: true, uppercase: false },
        NUM_1: { text: '01', variant: 'stat', bold: true, uppercase: false },
        ITEM_1: { text: 'Context & goals', variant: 'body', bold: true, uppercase: false },
        NUM_2: { text: '02', variant: 'stat', bold: true, uppercase: false },
        ITEM_2: { text: 'Product walkthrough', variant: 'body', bold: true, uppercase: false },
        NUM_3: { text: '03', variant: 'stat', bold: true, uppercase: false },
        ITEM_3: { text: 'Proof & results', variant: 'body', bold: true, uppercase: false },
        NUM_4: { text: '04', variant: 'stat', bold: true, uppercase: false },
        ITEM_4: { text: 'Discussion & next steps', variant: 'body', bold: true, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: "Today's agenda" },
      { id: 'NUM_1', region: 'cols 2-3, rows 4-5', role: 'stat', placeholder_text: '01' },
      { id: 'ITEM_1', region: 'cols 4-11, rows 4-5', role: 'body', placeholder_text: 'Context & goals' },
      { id: 'NUM_2', region: 'cols 2-3, rows 5-6', role: 'stat', placeholder_text: '02' },
      { id: 'ITEM_2', region: 'cols 4-11, rows 5-6', role: 'body', placeholder_text: 'Product walkthrough' },
      { id: 'NUM_3', region: 'cols 2-3, rows 6-7', role: 'stat', placeholder_text: '03' },
      { id: 'ITEM_3', region: 'cols 4-11, rows 6-7', role: 'body', placeholder_text: 'Proof & results' },
      { id: 'NUM_4', region: 'cols 2-3, rows 7-8', role: 'stat', placeholder_text: '04' },
      { id: 'ITEM_4', region: 'cols 4-11, rows 7-8', role: 'body', placeholder_text: 'Discussion & next steps' },
    ],
  },

  agenda_two_column_v2: {
    layout_id: 'agenda_two_column_v2',
    content_type: 'agenda',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'Agenda', variant: 'title', bold: true, uppercase: false },
        COL_1_ITEM_1: { text: '01 · Welcome', variant: 'body', bold: true, uppercase: false },
        COL_1_ITEM_2: { text: '02 · Market snapshot', variant: 'body', bold: true, uppercase: false },
        COL_1_ITEM_3: { text: '03 · Solution', variant: 'body', bold: true, uppercase: false },
        COL_2_ITEM_1: { text: '04 · Traction', variant: 'body', bold: true, uppercase: false },
        COL_2_ITEM_2: { text: '05 · Roadmap', variant: 'body', bold: true, uppercase: false },
        COL_2_ITEM_3: { text: '06 · Ask', variant: 'body', bold: true, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Agenda' },
      { id: 'COL_1_ITEM_1', region: 'cols 2-6, rows 4-5', role: 'body', placeholder_text: '01 · Welcome' },
      { id: 'COL_1_ITEM_2', region: 'cols 2-6, rows 5-6', role: 'body', placeholder_text: '02 · Market snapshot' },
      { id: 'COL_1_ITEM_3', region: 'cols 2-6, rows 6-7', role: 'body', placeholder_text: '03 · Solution' },
      { id: 'COL_2_ITEM_1', region: 'cols 7-11, rows 4-5', role: 'body', placeholder_text: '04 · Traction' },
      { id: 'COL_2_ITEM_2', region: 'cols 7-11, rows 5-6', role: 'body', placeholder_text: '05 · Roadmap' },
      { id: 'COL_2_ITEM_3', region: 'cols 7-11, rows 6-7', role: 'body', placeholder_text: '06 · Ask' },
    ],
  },

  agenda_side_image_v3: {
    layout_id: 'agenda_side_image_v3',
    content_type: 'agenda',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: "What we'll cover", variant: 'title', bold: true, uppercase: false },
        ITEM_1: { text: '01 · The opportunity', variant: 'body', bold: true, uppercase: false },
        ITEM_2: { text: '02 · How it works', variant: 'body', bold: true, uppercase: false },
        ITEM_3: { text: '03 · Customer proof', variant: 'body', bold: true, uppercase: false },
        ITEM_4: { text: '04 · Next steps', variant: 'body', bold: true, uppercase: false },
        SIDE_IMAGE: { variant: 'image' },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 1-7, rows 2-3', role: 'heading', placeholder_text: "What we'll cover" },
      { id: 'ITEM_1', region: 'cols 1-7, rows 4-5', role: 'body', placeholder_text: '01 · The opportunity' },
      { id: 'ITEM_2', region: 'cols 1-7, rows 5-6', role: 'body', placeholder_text: '02 · How it works' },
      { id: 'ITEM_3', region: 'cols 1-7, rows 6-7', role: 'body', placeholder_text: '03 · Customer proof' },
      { id: 'ITEM_4', region: 'cols 1-7, rows 7-8', role: 'body', placeholder_text: '04 · Next steps' },
      { id: 'SIDE_IMAGE', region: 'cols 8-12, rows 1-10', role: 'image' },
    ],
  },

  // --- Quote variants ---
  quote_centered_v1: {
    layout_id: 'quote_centered_v1',
    content_type: 'quote',
    grid: '12-col',
    preview: {
      mode: 'quote_attribution',
      quoteText: 'This product changed how our team ships work every week.',
      authorName: 'Alex Chen',
      authorTitle: 'Head of Product, Northwind',
    },
    slots: [
      { id: 'QUOTE', region: 'cols 2-11, rows 3-7', role: 'quote', placeholder_text: 'A short quote that makes your point.' },
      { id: 'AUTHOR_NAME', region: 'cols 3-10, rows 8-9', role: 'attribution', placeholder_text: 'Author name' },
      { id: 'AUTHOR_TITLE', region: 'cols 3-10, rows 9-10', role: 'caption', placeholder_text: 'Author title · Company' },
    ],
  },

  quote_portrait_v2: {
    layout_id: 'quote_portrait_v2',
    content_type: 'quote',
    grid: '12-col',
    preview: {
      mode: 'quote_attribution',
      quoteText: 'We finally have a presentation workflow that matches how we sell.',
      authorName: 'Morgan Blake',
      authorTitle: 'VP Sales, Contoso',
    },
    slots: [
      { id: 'AUTHOR_PORTRAIT', region: 'cols 2-5, rows 2-9', role: 'image' },
      { id: 'QUOTE', region: 'cols 6-11, rows 3-7', role: 'quote', placeholder_text: 'Customer quote goes here.' },
      { id: 'AUTHOR_NAME', region: 'cols 6-11, rows 7-8', role: 'heading', placeholder_text: 'Author name' },
      { id: 'AUTHOR_TITLE', region: 'cols 6-11, rows 8-9', role: 'caption', placeholder_text: 'Title · Company' },
    ],
  },

  quote_banner_v3: {
    layout_id: 'quote_banner_v3',
    content_type: 'quote',
    grid: '12-col',
    preview: {
      mode: 'quote_attribution',
      quoteText: 'Outstanding results — clear, fast, and on-brand every time.',
      authorName: 'Riley Quinn',
      authorTitle: 'Creative Director',
    },
    slots: [
      { id: 'BANNER_BG', region: 'cols 1-12, rows 3-8', role: 'background' },
      { id: 'QUOTE', region: 'cols 2-11, rows 3-6', role: 'quote', placeholder_text: 'Banner quote goes here.' },
      { id: 'AUTHOR_NAME', region: 'cols 2-8, rows 6-7', role: 'attribution', placeholder_text: 'Author name' },
      { id: 'AUTHOR_TITLE', region: 'cols 2-8, rows 7-8', role: 'caption', placeholder_text: 'Title · Company' },
      { id: 'LOGO', region: 'cols 9-11, rows 6-8', role: 'decoration', placeholder_text: 'logo' },
    ],
  },

  // --- Device frames ---
  device_iphone_screenshot_v1: {
    layout_id: 'device_iphone_screenshot_v1',
    content_type: 'device_frames',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'Built for mobile-first teams', variant: 'title', bold: true, uppercase: false },
        BODY: { text: 'Show your product UI inside a phone frame.', variant: 'body', bold: false, uppercase: false },
        DEVICE_SCREEN: { variant: 'image' },
        CAPTION: { text: 'iPhone · Product screenshot', variant: 'caption', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 1-6, rows 2-4', role: 'heading', placeholder_text: 'Built for mobile-first teams' },
      { id: 'BODY', region: 'cols 1-6, rows 4-7', role: 'body', placeholder_text: 'Show your product UI inside a phone frame.' },
      { id: 'DEVICE_FRAME', region: 'cols 7-11, rows 1-10', role: 'decoration' },
      { id: 'DEVICE_SCREEN', region: 'cols 7-11, rows 2-9', role: 'image' },
      { id: 'CAPTION', region: 'cols 7-11, rows 9-10', role: 'caption', placeholder_text: 'iPhone · Product screenshot' },
    ],
  },

  device_laptop_browser_v1: {
    layout_id: 'device_laptop_browser_v1',
    content_type: 'device_frames',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'Your product, full screen', variant: 'title', bold: true, uppercase: false },
        SUBTITLE: { text: 'Browser / laptop mockup for desktop UI', variant: 'subheading', bold: false, uppercase: false },
        DEVICE_SCREEN: { variant: 'image' },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 1-2', role: 'heading', placeholder_text: 'Your product, full screen' },
      { id: 'SUBTITLE', region: 'cols 2-11, rows 2-3', role: 'subheading', placeholder_text: 'Browser / laptop mockup for desktop UI' },
      { id: 'DEVICE_FRAME', region: 'cols 2-11, rows 3-9', role: 'decoration' },
      { id: 'DEVICE_SCREEN', region: 'cols 2-11, rows 4-8', role: 'image' },
      { id: 'CAPTION', region: 'cols 2-11, rows 9-10', role: 'caption', placeholder_text: 'Desktop app screenshot' },
    ],
  },

  device_multi_hero_v1: {
    layout_id: 'device_multi_hero_v1',
    content_type: 'device_frames',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'One experience, every screen', variant: 'title', bold: true, uppercase: false },
        PHONE_SCREEN: { variant: 'image' },
        LAPTOP_SCREEN: { variant: 'image' },
        CAPTION: { text: 'Phone + laptop product hero', variant: 'caption', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 1-2', role: 'heading', placeholder_text: 'One experience, every screen' },
      { id: 'PHONE_FRAME', region: 'cols 2-5, rows 3-9', role: 'decoration' },
      { id: 'PHONE_SCREEN', region: 'cols 2-5, rows 3-9', role: 'image' },
      { id: 'LAPTOP_FRAME', region: 'cols 6-11, rows 3-9', role: 'decoration' },
      { id: 'LAPTOP_SCREEN', region: 'cols 6-11, rows 4-8', role: 'image' },
      { id: 'CAPTION', region: 'cols 2-11, rows 9-10', role: 'caption', placeholder_text: 'Phone + laptop product hero' },
    ],
  },

  // --- Timeline variants ---
  timeline_horizontal_v1: {
    layout_id: 'timeline_horizontal_v1',
    content_type: 'timeline',
    grid: '12-col',
    preview: {
      mode: 'process_flow',
      steps: [
        { title: 'Discover', body: 'Research & validate' },
        { title: 'Build', body: 'Ship the MVP' },
        { title: 'Grow', body: 'Scale adoption' },
      ],
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Project timeline' },
      { id: 'STEP_1_CIRCLE', region: 'cols 2-4, rows 4-5', role: 'decoration' },
      { id: 'STEP_1_TITLE', region: 'cols 2-4, rows 5-6', role: 'heading', placeholder_text: 'Discover' },
      { id: 'STEP_1_BODY', region: 'cols 2-4, rows 6-8', role: 'body', placeholder_text: 'Research & validate' },
      { id: 'STEP_2_CIRCLE', region: 'cols 5-8, rows 4-5', role: 'decoration' },
      { id: 'STEP_2_TITLE', region: 'cols 5-8, rows 5-6', role: 'heading', placeholder_text: 'Build' },
      { id: 'STEP_2_BODY', region: 'cols 5-8, rows 6-8', role: 'body', placeholder_text: 'Ship the MVP' },
      { id: 'STEP_3_CIRCLE', region: 'cols 9-11, rows 4-5', role: 'decoration' },
      { id: 'STEP_3_TITLE', region: 'cols 9-11, rows 5-6', role: 'heading', placeholder_text: 'Grow' },
      { id: 'STEP_3_BODY', region: 'cols 9-11, rows 6-8', role: 'body', placeholder_text: 'Scale adoption' },
    ],
  },

  timeline_vertical_v2: {
    layout_id: 'timeline_vertical_v2',
    content_type: 'timeline',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'Milestones', variant: 'title', bold: true, uppercase: false },
        STEP_1_LABEL: { text: 'Week 1–2', variant: 'caption', bold: true, uppercase: false },
        STEP_1_TITLE: { text: 'Kickoff & research', variant: 'body', bold: true, uppercase: false },
        STEP_2_LABEL: { text: 'Week 3–5', variant: 'caption', bold: true, uppercase: false },
        STEP_2_TITLE: { text: 'Prototype & test', variant: 'body', bold: true, uppercase: false },
        STEP_3_LABEL: { text: 'Week 6–8', variant: 'caption', bold: true, uppercase: false },
        STEP_3_TITLE: { text: 'Launch & learn', variant: 'body', bold: true, uppercase: false },
        STEP_4_LABEL: { text: 'Week 9+', variant: 'caption', bold: true, uppercase: false },
        STEP_4_TITLE: { text: 'Iterate & scale', variant: 'body', bold: true, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 1-2', role: 'heading', placeholder_text: 'Milestones' },
      { id: 'STEP_1_LABEL', region: 'cols 2-4, rows 3-4', role: 'caption', placeholder_text: 'Week 1–2' },
      { id: 'STEP_1_TITLE', region: 'cols 5-11, rows 3-4', role: 'body', placeholder_text: 'Kickoff & research' },
      { id: 'STEP_2_LABEL', region: 'cols 2-4, rows 5-6', role: 'caption', placeholder_text: 'Week 3–5' },
      { id: 'STEP_2_TITLE', region: 'cols 5-11, rows 5-6', role: 'body', placeholder_text: 'Prototype & test' },
      { id: 'STEP_3_LABEL', region: 'cols 2-4, rows 7-8', role: 'caption', placeholder_text: 'Week 6–8' },
      { id: 'STEP_3_TITLE', region: 'cols 5-11, rows 7-8', role: 'body', placeholder_text: 'Launch & learn' },
      { id: 'STEP_4_LABEL', region: 'cols 2-4, rows 9-10', role: 'caption', placeholder_text: 'Week 9+' },
      { id: 'STEP_4_TITLE', region: 'cols 5-11, rows 9-10', role: 'body', placeholder_text: 'Iterate & scale' },
    ],
  },

  timeline_alternating_v3: {
    layout_id: 'timeline_alternating_v3',
    content_type: 'timeline',
    grid: '12-col',
    preview: {
      slots: {
        HEADING: { text: 'Our journey', variant: 'title', bold: true, uppercase: false },
        STEP_1_TITLE: { text: 'Founded', variant: 'body', bold: true, uppercase: false },
        STEP_1_BODY: { text: 'Started with a simple idea', variant: 'caption', bold: false, uppercase: false },
        STEP_2_TITLE: { text: 'First customers', variant: 'body', bold: true, uppercase: false },
        STEP_2_BODY: { text: 'Validated product-market fit', variant: 'caption', bold: false, uppercase: false },
        STEP_3_TITLE: { text: 'Series A', variant: 'body', bold: true, uppercase: false },
        STEP_3_BODY: { text: 'Scaled the team and roadmap', variant: 'caption', bold: false, uppercase: false },
      },
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 1-2', role: 'heading', placeholder_text: 'Our journey' },
      { id: 'STEP_1_TITLE', region: 'cols 2-5, rows 3-4', role: 'heading', placeholder_text: 'Founded' },
      { id: 'STEP_1_BODY', region: 'cols 2-5, rows 4-5', role: 'body', placeholder_text: 'Started with a simple idea' },
      { id: 'STEP_2_TITLE', region: 'cols 8-11, rows 5-6', role: 'heading', placeholder_text: 'First customers' },
      { id: 'STEP_2_BODY', region: 'cols 8-11, rows 6-7', role: 'body', placeholder_text: 'Validated product-market fit' },
      { id: 'STEP_3_TITLE', region: 'cols 2-5, rows 7-8', role: 'heading', placeholder_text: 'Series A' },
      { id: 'STEP_3_BODY', region: 'cols 2-5, rows 8-9', role: 'body', placeholder_text: 'Scaled the team and roadmap' },
      { id: 'TIMELINE_LINE', region: 'cols 6-7, rows 3-9', role: 'divider' },
    ],
  },

  // --- Chart / data schemas (preview modes already exist) ---
  chart_full_width_v1: {
    layout_id: 'chart_full_width_v1',
    content_type: 'chart',
    grid: '12-col',
    preview: {
      mode: 'chart_full_width',
      slots: {
        HEADING: { text: 'Growth that compounds', variant: 'title', bold: true, uppercase: false },
      },
      chartValues: [40, 55, 70, 95],
      chartLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
      chartCaption: 'Revenue by quarter',
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 1-2', role: 'heading', placeholder_text: 'Growth that compounds' },
      { id: 'CHART_PANEL_BG', region: 'cols 2-11, rows 3-9', role: 'background' },
      { id: 'MAIN_CHART', region: 'cols 2-11, rows 3-8', role: 'chart' },
      { id: 'CHART_CAPTION', region: 'cols 2-11, rows 8-9', role: 'caption', placeholder_text: 'Revenue by quarter' },
    ],
  },

  chart_image_split_v1: {
    layout_id: 'chart_image_split_v1',
    content_type: 'chart',
    grid: '12-col',
    preview: {
      mode: 'chart_image_split',
      slots: {
        HEADING: { text: 'Data with context', variant: 'title', bold: true, uppercase: false },
      },
      bodyText: 'Pair a chart with a supporting visual so the story is clear at a glance.',
      chartValues: [20, 35, 50, 80],
      chartLabels: ['Jan', 'Feb', 'Mar', 'Apr'],
    },
    slots: [
      { id: 'HEADING', region: 'cols 1-6, rows 2-3', role: 'heading', placeholder_text: 'Data with context' },
      { id: 'BODY', region: 'cols 1-6, rows 3-5', role: 'body', placeholder_text: 'Explain what the chart shows.' },
      { id: 'CHART', region: 'cols 1-6, rows 5-9', role: 'chart' },
      { id: 'HERO_IMAGE', region: 'cols 7-12, rows 1-10', role: 'image' },
    ],
  },

  process_flow_three_v1: {
    layout_id: 'process_flow_three_v1',
    content_type: 'timeline',
    grid: '12-col',
    preview: {
      mode: 'process_flow',
      steps: [
        { title: 'Discover', body: 'Understand the problem' },
        { title: 'Build', body: 'Ship a focused solution' },
        { title: 'Launch', body: 'Measure and iterate' },
      ],
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'How it works' },
      { id: 'STEP_1_CIRCLE', region: 'cols 2-4, rows 4-5', role: 'decoration' },
      { id: 'STEP_1_TITLE', region: 'cols 2-4, rows 5-6', role: 'heading', placeholder_text: 'Discover' },
      { id: 'STEP_1_BODY', region: 'cols 2-4, rows 6-8', role: 'body', placeholder_text: 'Understand the problem' },
      { id: 'STEP_2_CIRCLE', region: 'cols 5-8, rows 4-5', role: 'decoration' },
      { id: 'STEP_2_TITLE', region: 'cols 5-8, rows 5-6', role: 'heading', placeholder_text: 'Build' },
      { id: 'STEP_2_BODY', region: 'cols 5-8, rows 6-8', role: 'body', placeholder_text: 'Ship a focused solution' },
      { id: 'STEP_3_CIRCLE', region: 'cols 9-11, rows 4-5', role: 'decoration' },
      { id: 'STEP_3_TITLE', region: 'cols 9-11, rows 5-6', role: 'heading', placeholder_text: 'Launch' },
      { id: 'STEP_3_BODY', region: 'cols 9-11, rows 6-8', role: 'body', placeholder_text: 'Measure and iterate' },
    ],
  },

  stat_cards_image_v1: {
    layout_id: 'stat_cards_image_v1',
    content_type: 'stat',
    grid: '12-col',
    preview: {
      mode: 'stat_cards_image',
      stats: [
        { value: '2.4x', label: 'Faster delivery' },
        { value: '60%', label: 'Less rework' },
        { value: '120+', label: 'Teams onboarded' },
      ],
    },
    slots: [
      { id: 'HEADING', region: 'cols 1-6, rows 2-3', role: 'heading', placeholder_text: 'Results that matter' },
      { id: 'STAT_1_CARD', region: 'cols 1-6, rows 4-5', role: 'background' },
      { id: 'STAT_1_VALUE', region: 'cols 1-3, rows 4-5', role: 'stat', placeholder_text: '2.4x' },
      { id: 'STAT_1_LABEL', region: 'cols 3-6, rows 4-5', role: 'stat_label', placeholder_text: 'Faster delivery' },
      { id: 'STAT_2_CARD', region: 'cols 1-6, rows 6-7', role: 'background' },
      { id: 'STAT_2_VALUE', region: 'cols 1-3, rows 6-7', role: 'stat', placeholder_text: '60%' },
      { id: 'STAT_2_LABEL', region: 'cols 3-6, rows 6-7', role: 'stat_label', placeholder_text: 'Less rework' },
      { id: 'STAT_3_CARD', region: 'cols 1-6, rows 8-9', role: 'background' },
      { id: 'STAT_3_VALUE', region: 'cols 1-3, rows 8-9', role: 'stat', placeholder_text: '120+' },
      { id: 'STAT_3_LABEL', region: 'cols 3-6, rows 8-9', role: 'stat_label', placeholder_text: 'Teams onboarded' },
      { id: 'HERO_IMAGE', region: 'cols 7-12, rows 1-10', role: 'image' },
    ],
  },

  eight_short_texts_split_v1: {
    layout_id: 'eight_short_texts_split_v1',
    content_type: 'grid',
    grid: '12-col',
    preview: {
      mode: 'eight_short_texts',
    },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 1-2', role: 'heading', placeholder_text: 'Eight key points' },
      { id: 'POINT_1_LABEL', region: 'cols 1-3, rows 3-4', role: 'heading', placeholder_text: 'First point' },
      { id: 'POINT_1_DESC', region: 'cols 1-3, rows 4-5', role: 'caption', placeholder_text: 'A short description' },
      { id: 'POINT_2_LABEL', region: 'cols 4-6, rows 3-4', role: 'heading', placeholder_text: 'Second point' },
      { id: 'POINT_2_DESC', region: 'cols 4-6, rows 4-5', role: 'caption', placeholder_text: 'A short description' },
      { id: 'POINT_3_LABEL', region: 'cols 7-9, rows 3-4', role: 'heading', placeholder_text: 'Third point' },
      { id: 'POINT_3_DESC', region: 'cols 7-9, rows 4-5', role: 'caption', placeholder_text: 'A short description' },
      { id: 'POINT_4_LABEL', region: 'cols 10-12, rows 3-4', role: 'heading', placeholder_text: 'Fourth point' },
      { id: 'POINT_4_DESC', region: 'cols 10-12, rows 4-5', role: 'caption', placeholder_text: 'A short description' },
      { id: 'POINT_5_LABEL', region: 'cols 1-3, rows 6-7', role: 'heading', placeholder_text: 'Fifth point' },
      { id: 'POINT_5_DESC', region: 'cols 1-3, rows 7-8', role: 'caption', placeholder_text: 'A short description' },
      { id: 'POINT_6_LABEL', region: 'cols 4-6, rows 6-7', role: 'heading', placeholder_text: 'Sixth point' },
      { id: 'POINT_6_DESC', region: 'cols 4-6, rows 7-8', role: 'caption', placeholder_text: 'A short description' },
      { id: 'POINT_7_LABEL', region: 'cols 7-9, rows 6-7', role: 'heading', placeholder_text: 'Seventh point' },
      { id: 'POINT_7_DESC', region: 'cols 7-9, rows 7-8', role: 'caption', placeholder_text: 'A short description' },
      { id: 'POINT_8_LABEL', region: 'cols 10-12, rows 6-7', role: 'heading', placeholder_text: 'Last point' },
      { id: 'POINT_8_DESC', region: 'cols 10-12, rows 7-8', role: 'caption', placeholder_text: 'A short description' },
    ],
  },

  grid_insights_chart_v1: {
    layout_id: 'grid_insights_chart_v1',
    content_type: 'grid',
    grid: '12-col',
    preview: { mode: 'grid_insights_chart' },
    slots: [
      { id: 'INSIGHT_CARD_1_BG', region: 'cols 1-3, rows 1-2', role: 'background' },
      { id: 'INSIGHT_ICON_1', region: 'cols 1-3, rows 1-2', role: 'decoration' },
      { id: 'INSIGHT_LABEL_1', region: 'cols 1-3, rows 3-4', role: 'caption', placeholder_text: 'Insight one' },
      { id: 'INSIGHT_CARD_2_BG', region: 'cols 4-6, rows 1-2', role: 'background' },
      { id: 'INSIGHT_ICON_2', region: 'cols 4-6, rows 1-2', role: 'decoration' },
      { id: 'INSIGHT_LABEL_2', region: 'cols 4-6, rows 3-4', role: 'caption', placeholder_text: 'Insight two' },
      { id: 'INSIGHT_CARD_3_BG', region: 'cols 7-9, rows 1-2', role: 'background' },
      { id: 'INSIGHT_ICON_3', region: 'cols 7-9, rows 1-2', role: 'decoration' },
      { id: 'INSIGHT_LABEL_3', region: 'cols 7-9, rows 3-4', role: 'caption', placeholder_text: 'Insight three' },
      { id: 'CHART_CARD_BG', region: 'cols 1-9, rows 5-10', role: 'background' },
      { id: 'CHART_HEADING', region: 'cols 1-9, rows 5-6', role: 'heading', placeholder_text: 'Revenue growth' },
      { id: 'BAR_CHART', region: 'cols 1-9, rows 7-10', role: 'chart' },
      { id: 'CHART_CAPTION', region: 'cols 1-9, rows 10-11', role: 'caption', placeholder_text: 'Monthly performance' },
      { id: 'POINT_CARD_BG', region: 'cols 10-12, rows 1-10', role: 'background' },
      { id: 'POINT_HEADING', region: 'cols 10-12, rows 1-2', role: 'heading', placeholder_text: 'Key takeaway' },
      { id: 'POINT_BODY', region: 'cols 10-12, rows 3-5', role: 'body', placeholder_text: 'Summarize what the chart means.' },
      { id: 'POINT_IMAGE', region: 'cols 10-12, rows 6-10', role: 'image' },
    ],
  },

  image_three_gallery_v1: {
    layout_id: 'image_three_gallery_v1',
    content_type: 'image+text',
    grid: '12-col',
    preview: { mode: 'image_gallery_three' },
    slots: [
      { id: 'HEADING', region: 'cols 2-11, rows 2-3', role: 'heading', placeholder_text: 'Product highlights' },
      { id: 'SUBTITLE', region: 'cols 2-11, rows 3-4', role: 'subheading', placeholder_text: 'Show three visuals with short labels.' },
      { id: 'IMAGE_1', region: 'cols 2-4, rows 5-8', role: 'image' },
      { id: 'IMAGE_1_LABEL', region: 'cols 2-4, rows 8-9', role: 'caption', placeholder_text: 'Feature A' },
      { id: 'IMAGE_2', region: 'cols 5-8, rows 5-8', role: 'image' },
      { id: 'IMAGE_2_LABEL', region: 'cols 5-8, rows 8-9', role: 'caption', placeholder_text: 'Feature B' },
      { id: 'IMAGE_3', region: 'cols 9-11, rows 5-8', role: 'image' },
      { id: 'IMAGE_3_LABEL', region: 'cols 9-11, rows 8-9', role: 'caption', placeholder_text: 'Feature C' },
      { id: 'DOT_ACCENT', region: 'cols 2-11, rows 9-10', role: 'decoration' },
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

function slotPlaceholderText(slots, id) {
  const slot = (slots || []).find((s) => s.id === id)
  return slot?.placeholder_text ? String(slot.placeholder_text) : ''
}

function roleToPreviewVariant(role, slotId) {
  const id = String(slotId || '').toUpperCase()
  if (id.includes('LOGO') || role === 'decoration') return 'logo'
  if (role === 'heading' || role === 'quote') return 'title'
  if (role === 'subheading') return 'subheading'
  if (role === 'caption' || role === 'eyebrow') return 'caption'
  if (role === 'stat') return 'stat'
  return 'body'
}

function buildPreviewSlotsFromLayoutSlots(slots, existing = {}) {
  const out = { ...existing }
  for (const slot of slots || []) {
    if (!slot?.id) continue
    const current = out[slot.id] || {}
    if (current.text != null && String(current.text).trim()) {
      out[slot.id] = current
      continue
    }
    const text = slot.placeholder_text
    if (!text) continue
    out[slot.id] = {
      ...current,
      text: String(text),
      variant: current.variant || roleToPreviewVariant(slot.role, slot.id),
      bold: current.bold ?? (slot.role === 'heading' || slot.role === 'quote'),
      uppercase: current.uppercase ?? false,
    }
  }
  return out
}

function buildStatsFromLayoutSlots(slots) {
  const stats = []
  for (let i = 1; i <= 6; i += 1) {
    const value = slotPlaceholderText(slots, `STAT_${i}_VALUE`) || slotPlaceholderText(slots, `STAT_${i}`)
    const label = slotPlaceholderText(slots, `STAT_${i}_LABEL`)
    if (value || label) {
      stats.push({ value: value || '—', label: label || 'Metric label' })
    }
  }
  return stats.length ? stats : null
}

function buildComparisonColumnsFromSlots(slots, preview) {
  if (Array.isArray(preview?.columns) && preview.columns.length) return preview.columns
  const pros = slotPlaceholderText(slots, 'PROS_LIST')
  const cons = slotPlaceholderText(slots, 'CONS_LIST')
  if (pros || cons) {
    return [
      {
        label: slotPlaceholderText(slots, 'PROS_LABEL') || 'Pros',
        items: pros ? pros.split('\n').filter(Boolean) : ['Benefit one', 'Benefit two'],
      },
      {
        label: slotPlaceholderText(slots, 'CONS_LABEL') || 'Cons',
        items: cons ? cons.split('\n').filter(Boolean) : ['Limitation one', 'Limitation two'],
      },
    ]
  }
  const labels = ['COL_1_LABEL', 'COL_2_LABEL', 'COL_3_LABEL']
    .map((id) => slotPlaceholderText(slots, id))
    .filter(Boolean)
  if (labels.length) {
    return labels.slice(0, 3).map((label, index) => ({
      label,
      items: [`Column ${index + 1} point`],
    }))
  }
  return null
}

/** Known layout_id → polished preview mode (overrides stale preview.mode in saved schemas). */
const LAYOUT_PREVIEW_MODES = {
  grid_insights_chart_v1: 'grid_insights_chart',
  chart_full_width_v1: 'chart_full_width',
  chart_image_split_v1: 'chart_image_split',
  image_three_gallery_v1: 'image_gallery_three',
  process_flow_three_v1: 'process_flow',
  timeline_horizontal_v1: 'process_flow',
  stat_cards_image_v1: 'stat_cards_image',
  eight_short_texts_split_v1: 'eight_short_texts',
  quote_centered_v1: 'quote_attribution',
  quote_portrait_v2: 'quote_attribution',
  quote_banner_v3: 'quote_attribution',
}

export function resolvePreviewMode(schema) {
  const layoutId = schema?.layout_id
  if (layoutId && LAYOUT_PREVIEW_MODES[layoutId]) return LAYOUT_PREVIEW_MODES[layoutId]
  if (schema?.preview?.mode) return schema.preview.mode
  return inferPreviewMode(schema)
}

/** Infer polished preview mode from content_type + slot roles when preview.mode is absent. */
export function inferPreviewMode(schema) {
  const ct = schema?.content_type
  const slots = schema?.slots || []
  const ids = slots.map((s) => String(s.id || ''))
  const roles = new Set(slots.map((s) => s.role))
  const layoutId = schema?.layout_id

  if (layoutId && LAYOUT_PREVIEW_MODES[layoutId]) return LAYOUT_PREVIEW_MODES[layoutId]

  if (ids.includes('BAR_CHART') && ids.includes('INSIGHT_ICON_1') && ids.includes('POINT_IMAGE')) {
    return 'grid_insights_chart'
  }
  if (ids.filter((id) => /^IMAGE_\d+$/.test(id)).length >= 3) return 'image_gallery_three'
  if (ids.some((id) => /^STEP_\d+_CIRCLE$/.test(id))) return 'process_flow'
  if (roles.has('stat') && ids.includes('HERO_IMAGE') && ids.some((id) => /^STAT_\d+_CARD$/.test(id))) {
    return 'stat_cards_image'
  }
  if (roles.has('chart') && ids.includes('HERO_IMAGE') && roles.has('body')) return 'chart_image_split'
  if (roles.has('chart') && (ids.includes('MAIN_CHART') || ids.includes('CHART_PANEL_BG'))) return 'chart_full_width'

  if (schema?.highlightedPlanIndex != null || ids.some((id) => id.includes('PLAN_')) || ct === 'pricing') {
    return ids.some((id) => id.includes('PRICE')) || ct === 'pricing' || ct === 'comparison'
      ? 'pricing_plans'
      : 'comparison_columns'
  }
  if (ct === 'stat' || (roles.has('stat') && roles.has('stat_label'))) return 'stat_row'
  if (ct === 'chart' || roles.has('chart')) return 'chart_split'
  if (ct === 'quote' || roles.has('quote')) return 'quote_attribution'
  if (ct === 'team' || ids.some((id) => id.startsWith('MEMBER'))) return 'team_staggered'
  if (ct === 'closing' || roles.has('cta')) return 'closing_cta'
  if (ids.includes('COL_1_IMAGE') && ids.includes('COL_2_IMAGE')) return 'two_image_columns'
  if (
    ids.includes('POINT_8_LABEL') ||
    ids.filter((id) => /^POINT_\d+_LABEL$/.test(id)).length >= 6
  ) {
    return 'eight_short_texts'
  }
  if (ct === 'comparison') return 'comparison_columns'
  return null
}

function fillPreviewDataFromSlots(schema) {
  const slots = schema.slots || []
  const preview = schema.preview || {}
  const mode = resolvePreviewMode(schema)

  if (mode === 'stat_row' && !Array.isArray(preview.stats)) {
    preview.stats = buildStatsFromLayoutSlots(slots)
  }
  if (mode === 'chart_split' || mode === 'chart_full_width' || mode === 'chart_image_split' || mode === 'grid_insights_chart') {
    preview.bodyText = preview.bodyText ?? slotPlaceholderText(slots, 'BODY') ?? slotPlaceholderText(slots, 'POINT_BODY') ?? undefined
    preview.chartCaption = preview.chartCaption ?? slotPlaceholderText(slots, 'CHART_CAPTION') ?? undefined
    if (!preview.slots?.HEADING?.text) {
      preview.slots = {
        ...(preview.slots || {}),
        HEADING: {
          ...(preview.slots?.HEADING || {}),
          text:
            preview.slots?.HEADING?.text ||
            slotPlaceholderText(slots, 'HEADING') ||
            slotPlaceholderText(slots, 'CHART_HEADING') ||
            'Chart title',
          variant: 'title',
          bold: true,
        },
      }
    }
  }
  if (mode === 'grid_insights_chart' && !Array.isArray(preview.insights)) {
    preview.insights = [1, 2, 3].map((n) => ({
      label:
        preview.slots?.[`INSIGHT_LABEL_${n}`]?.text ||
        slotPlaceholderText(slots, `INSIGHT_LABEL_${n}`) ||
        `Insight ${n}`,
    }))
    preview.sideHeading =
      preview.sideHeading ?? preview.slots?.POINT_HEADING?.text ?? slotPlaceholderText(slots, 'POINT_HEADING')
    preview.sideBody =
      preview.sideBody ?? preview.slots?.POINT_BODY?.text ?? slotPlaceholderText(slots, 'POINT_BODY')
  }
  if (mode === 'image_gallery_three' && !Array.isArray(preview.gallery)) {
    preview.gallery = [1, 2, 3].map((n) => ({
      label:
        preview.slots?.[`IMAGE_${n}_LABEL`]?.text ||
        slotPlaceholderText(slots, `IMAGE_${n}_LABEL`) ||
        (n === 1 ? 'Feature A' : n === 2 ? 'Feature B' : 'Feature C'),
    }))
  }
  if (mode === 'process_flow' && !Array.isArray(preview.steps)) {
    preview.steps = [1, 2, 3].map((n) => ({
      title:
        preview.slots?.[`STEP_${n}_TITLE`]?.text ||
        slotPlaceholderText(slots, `STEP_${n}_TITLE`) ||
        (n === 1 ? 'Discover' : n === 2 ? 'Build' : 'Launch'),
      body:
        preview.slots?.[`STEP_${n}_BODY`]?.text ||
        slotPlaceholderText(slots, `STEP_${n}_BODY`) ||
        'Short step description',
    }))
  }
  if (mode === 'stat_cards_image') {
    if (!Array.isArray(preview.stats)) preview.stats = buildStatsFromLayoutSlots(slots)
  }
  if (mode === 'quote_attribution') {
    preview.quoteText = preview.quoteText ?? slotPlaceholderText(slots, 'QUOTE') ?? undefined
    preview.authorName = preview.authorName ?? slotPlaceholderText(slots, 'AUTHOR_NAME') ?? undefined
    preview.authorTitle = preview.authorTitle ?? slotPlaceholderText(slots, 'AUTHOR_TITLE') ?? undefined
  }
  if (mode === 'comparison_columns' || mode === 'pricing_plans') {
    const columns = buildComparisonColumnsFromSlots(slots, preview)
    if (columns) preview.columns = columns
  }
  if (mode === 'two_image_columns' && !Array.isArray(preview.columns)) {
    preview.columns = [
      {
        title: slotPlaceholderText(slots, 'COL_1_TITLE') || 'Make your point',
        body: slotPlaceholderText(slots, 'COL_1_BODY') || 'Expand on it here.',
      },
      {
        title: slotPlaceholderText(slots, 'COL_2_TITLE') || 'Make another point',
        body: slotPlaceholderText(slots, 'COL_2_BODY') || 'You already know that it matters.',
      },
    ]
  }
  if (mode === 'eight_short_texts' && !Array.isArray(preview.points)) {
    preview.points = Array.from({ length: 8 }, (_, index) => {
      const n = index + 1
      const labelId = `POINT_${n}_LABEL`
      const descId = `POINT_${n}_DESC`
      return {
        label:
          preview.slots?.[labelId]?.text ||
          slotPlaceholderText(slots, labelId) ||
          (n === 8 ? 'Last point' : `${['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'][index] || 'Another'} point`),
        desc:
          preview.slots?.[descId]?.text ||
          slotPlaceholderText(slots, descId) ||
          'A short description',
      }
    })
  }
  if (mode === 'closing_cta') {
    preview.slots = {
      ...(preview.slots || {}),
      HEADING: {
        ...(preview.slots?.HEADING || {}),
        text: preview.slots?.HEADING?.text || slotPlaceholderText(slots, 'HEADING') || 'Thank you',
        variant: 'title',
        bold: true,
      },
      SUBTITLE: {
        ...(preview.slots?.SUBTITLE || {}),
        text: preview.slots?.SUBTITLE?.text || slotPlaceholderText(slots, 'SUBTITLE') || '',
        variant: 'subheading',
      },
      CTA: {
        ...(preview.slots?.CTA || {}),
        text: preview.slots?.CTA?.text || slotPlaceholderText(slots, 'CTA') || '',
        variant: 'body',
        bold: true,
      },
      CONTACT: {
        ...(preview.slots?.CONTACT || {}),
        text: preview.slots?.CONTACT?.text || slotPlaceholderText(slots, 'CONTACT') || '',
        variant: 'caption',
      },
    }
  }

  if (mode) preview.mode = mode
  schema.preview = preview
  return schema
}

function mergeRegistryPreviewFallback(schema) {
  const registered = getDeckLayoutSchema(schema?.layout_id)
  if (!registered) return schema

  const merged = schema
  const rp = registered.preview || {}
  const mp = merged.preview || {}

  merged.preview = {
    ...mp,
    mode: mp.mode || rp.mode || null,
    slots: { ...(rp.slots || {}), ...(mp.slots || {}) },
    columns: mp.columns ?? rp.columns,
    members: mp.members ?? rp.members,
    stats: mp.stats ?? rp.stats,
    quoteText: mp.quoteText ?? rp.quoteText,
    authorName: mp.authorName ?? rp.authorName,
    authorTitle: mp.authorTitle ?? rp.authorTitle,
    bodyText: mp.bodyText ?? rp.bodyText,
    chartValues: mp.chartValues ?? rp.chartValues,
    chartLabels: mp.chartLabels ?? rp.chartLabels,
    chartCaption: mp.chartCaption ?? rp.chartCaption,
    highlightedColumnIndex:
      mp.highlightedColumnIndex ??
      merged.highlightedPlanIndex ??
      rp.highlightedColumnIndex ??
      registered.highlightedPlanIndex,
  }

  if (!Array.isArray(merged.slots) || merged.slots.length === 0) {
    merged.slots = registered.slots
  }

  return merged
}

/** Normalize any saved layout schema for polished preview (backend-first, registry fallback). */
export function normalizeLayoutSchemaForPreview(schema) {
  if (!schema || typeof schema !== 'object') return schema ?? {}
  const merged = JSON.parse(JSON.stringify(schema))
  if (!Array.isArray(merged.slots)) merged.slots = []
  merged.preview = merged.preview || {}
  merged.preview.slots = buildPreviewSlotsFromLayoutSlots(merged.slots, merged.preview.slots || {})
  fillPreviewDataFromSlots(merged)
  return mergeRegistryPreviewFallback(merged)
}

/** Build layout_id → schema map from DECK_LAYOUT template rows. */
export function buildLayoutSchemaMap(templates = []) {
  const map = {}
  for (const template of templates) {
    const layoutId = template?.schema?.layout_id
    if (layoutId && template.schema) {
      map[String(layoutId)] = template.schema
    }
  }
  return map
}

/** Resolve a layout schema: saved map → legacy registry fallback. */
export function resolveLayoutSchemaById(layoutId, layoutSchemaMap = {}) {
  const key = String(layoutId || '').trim()
  if (!key) return null
  if (layoutSchemaMap[key]) {
    return normalizeLayoutSchemaForPreview(layoutSchemaMap[key])
  }
  const registered = getDeckLayoutSchema(key)
  return registered ? normalizeLayoutSchemaForPreview(registered) : null
}

/** @returns {object|null} layout schema clone for preview */
export function getDeckLayoutSchema(layoutId) {
  const key = String(layoutId || '').trim()
  if (!key || !REGISTRY[key]) return null
  return JSON.parse(JSON.stringify(REGISTRY[key]))
}

/** Merge pack slide placeholder copy into layout preview hints. */
export function buildPackSlidePreviewSchema(layoutSchema, slide, { imageUrl } = {}) {
  if (!layoutSchema) return null
  const schema = normalizeLayoutSchemaForPreview(layoutSchema)
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

  if (Array.isArray(pl.members) && pl.members.length) {
    schema.preview.mode = schema.preview.mode || 'team_staggered'
  }
  if (Array.isArray(pl.plans) && pl.plans.length) {
    schema.preview.mode = 'pricing_plans'
  }
  if (pl.quote != null && String(pl.quote).trim()) {
    schema.preview.mode = schema.preview.mode || 'quote_attribution'
  }
  if (Array.isArray(pl.chartValues) && pl.chartValues.length) {
    schema.preview.mode = schema.preview.mode || 'chart_split'
  }

  const resolvedImage =
    (typeof imageUrl === 'string' && imageUrl.trim())
    || (typeof pl.imageUrl === 'string' && pl.imageUrl.trim())
    || (typeof pl.image === 'string' && pl.image.trim())
    || ''

  if (resolvedImage) {
    schema.preview.imageUrl = resolvedImage
    for (const slot of schema.slots || []) {
      const role = String(slot.role || '').toLowerCase()
      const id = String(slot.id || '').toLowerCase()
      if (
        role === 'image'
        || role === 'background'
        || id.includes('image')
        || id.includes('hero')
        || id.includes('photo')
        || id.includes('avatar')
        || id.includes('member')
      ) {
        schema.preview.slots[slot.id] = {
          ...(schema.preview.slots[slot.id] || {}),
          variant: 'image',
          imageUrl: resolvedImage,
        }
      }
    }
  }

  fillPreviewDataFromSlots(schema)
  return schema
}

export function canPreviewDeckLayout({ layoutId, layoutSchema, layoutSchemaMap } = {}) {
  if (layoutSchemaHasPreviewCanvas(layoutSchema)) return true
  if (layoutSchema?.preview?.mode === 'canvas_elements') return true
  if (layoutSchema && (Array.isArray(layoutSchema.slots) ? layoutSchema.slots.length : layoutSchema.preview?.mode)) {
    return true
  }
  const resolved = resolveLayoutSchemaById(layoutId, layoutSchemaMap)
  if (layoutSchemaHasPreviewCanvas(resolved)) return true
  if (resolved?.preview?.mode === 'canvas_elements') return true
  return Boolean(resolved && (resolved.slots?.length || resolved.preview?.mode))
}

/** @deprecated Use canPreviewDeckLayout — kept for existing imports. */
export function hasDeckLayoutSchema(layoutId, layoutSchemaMap = {}) {
  return canPreviewDeckLayout({ layoutId, layoutSchemaMap })
}

/** Prepare a saved DECK_LAYOUT schema for polished admin preview. */
export function enrichLayoutSchemaForPreview(schema) {
  return normalizeLayoutSchemaForPreview(schema)
}

export default REGISTRY
