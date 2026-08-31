# Simple Slides — AI layout mapping

Gallery category: `simple_slides` (filter only). AI selection uses `content_type` + `layoutSelector` scoring.

## Slide number conventions (freeform AI)

| Slide # | Role | Preferred layouts |
|--------|------|-------------------|
| 1 | Opening title | `title_centered_v1`, `title_image_logo_v1`, `title_with_logo_v1`, `full_bg_image_overlay_v1` |
| 2 | Agenda / hook | `intro_four_para_v1`, `headline_centered_v1`, `intro_three_para_icons_v1` |
| 3–N-1 | Body | Para splits, cards, multi-para, statements (`para_*`, `three_cards_*`, `statement_*`) |
| Section breaks | Transition | `section_divider_centered_v1`, `section_*_image_v1` |
| N | Close | `centered_text_cta_v1`, `para_image_cta_v1` |
| Any | Visual punch | `large_image_v1`, `full_bg_image_overlay_v1`, `statement_large_v1` |

**Hard rule:** Slide 1 → `content_type: title` (freeform generation).

## layoutSelector scoring hints

| content_type | High-score layouts |
|--------------|-------------------|
| title | `title_centered_v1`, `title_with_logo_v1`, `title_image_logo_v1` |
| section_divider | `section_divider_centered_v1` |
| image+text | `section_with_image_v1`, `para_title_left_image_boxed_v1`, `para_split_50_50_v1`, `two_para_right_image_v1` |
| bullet_list | `four_para_image_v1`, `intro_four_para_v1` |
| quote | `statement_left_v1`, `statement_large_v1` |
| closing | `centered_text_cta_v1`, `para_image_cta_v1` |
| grid | `grid_bento_three_v1`, `grid_insights_chart_v1`, `grid_six_images_v1`, `grid_metrics_mobile_v1`, `eight_short_texts_image_v1` |
| chart | `chart_with_description_v1`, `chart_single_v1`, `table_single_v1`, `process_linner_horti_v1`, `process_linner_numeric_v1` |
| stat | `metric_single_v1`, `metric_three_v1`, `metric_six_para_v1` |

## Grid layouts (10 new)

Bento/mosaic galleries use `content_type: grid`. Prefer when outline mentions galleries, feature grids, or multi-image compositions.

## Charts & data (21 new)

- **chart** content_type: bar/line/donut charts, tables, process diagrams
- **stat** content_type: 1–6 metric layouts, vertical stat stacks
- AI output: `content.chart` for charts, `content.table` for tables, `content.stats` for metrics
- Prompt bundle **v1.7** adds explicit `table` field

## Overlay layouts

These need `textOnImage` / darker image briefs:

- `full_bg_image_overlay_v1`
- `wide_image_statement_top_v1`
- `wide_image_statement_bottom_v1`

Compiler auto-applies light text; prompts receive `layoutContext.hasImageOverlay: true`.
