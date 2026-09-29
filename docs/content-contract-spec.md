# Content Contract Specification

Shared rules for mapping AI slide JSON into layout slot text on **both** the presentation backend and the PPT canvas frontend. Implementation is **`@athena/contracts`**:

- **Backend (canonical):** `AthenaVI_backend/packages/athena-contracts`
- **Frontend (deploy copy):** [`packages/athena-contracts`](../packages/athena-contracts)

After backend changes, run `npm run sync:athena-contracts` in the backend repo and commit both copies.

Related: [ppt-canvas-backend-data-contract.md](./ppt-canvas-backend-data-contract.md)

---

## 1. Purpose

- One **deriveContentContract(schema)** output per layout.
- One **textForSlot** resolver for slot ID → plain text.
- Identical **normalizeContentForLayout** before compile.
- **validateContentForLayout** throws `ContentContractValidationError` on the frontend before paint when content cannot fit the layout contract.

---

## 2. Contract shape (`deriveContentContract`)

```json
{
  "layoutId": "title_hero_right_fade_v1",
  "contentType": "title",
  "groups": {
    "columns": 0,
    "stats": 0,
    "members": 0,
    "timeline": 0,
    "steps": 0,
    "quadrants": 0,
    "funnel": 0,
    "bullets": 0,
    "quotes": 0,
    "items": 0,
    "images": 1
  },
  "slots": {
    "MAIN_TITLE": {
      "role": "heading",
      "maxLines": 2,
      "maxWords": null,
      "maxChars": 144,
      "maxItems": null,
      "envelope": { "x": 160, "y": 216, "width": 800, "height": 216 }
    }
  },
  "capacity": {
    "maxTitleCharacters": 144,
    "maxSubtitleCharacters": 140,
    "maxColumns": 1,
    "maxBullets": 0,
    "maxImages": 1
  },
  "grid": { "COLS": 12, "ROWS": 10 }
}
```

### 2.1 Group counts

Indexed slot IDs (`STAT_2_LABEL`, `CARD_3_BODY`, `MILESTONE_1_LABEL`, …) drive **groups.*** maxima. Arrays in slide content are sliced to these counts during normalization.

### 2.2 Per-slot limits

From each `schema.slots[]` entry:

| Source | Maps to |
|--------|---------|
| `max_words` | `maxWords`, and `maxChars ≈ maxWords × 6` |
| `max_lines` | `maxLines`, and `maxChars ≈ maxLines × 12 × 6` |
| `role` | Default fallbacks (heading 80 chars, subheading 140, body 4×72) |
| `region` | Pixel **envelope** on 1920×1080 grid |

Constants: `CHARS_PER_WORD = 6`, `WORDS_PER_LINE = 12`.

---

## 3. Normalization (`normalizeContentForLayout`)

Applied on backend (`layoutSlotsToElements`) and frontend (`buildContentBySlotIdFromSlideContent`) **before** slot resolution.

1. Deep-clone content; run **stripUnicodeControls** (NFC, drop bidi/control/zero-width) and **sanitizeLineBreaks** on all strings.
2. Truncate title/subtitle/body using contract-derived word budgets (with legacy-safe defaults).
3. Slice arrays (columns, stats, members, timeline, bullets, items, quotes, diagram cells) to **groups.*** counts.
4. Per-field word/char caps on nested objects (column titles, stat values, etc.).

**repairContentForLayout** runs normalize → **clampRepeatingGroups** (pad/slice to exact slot counts) → per-slot clamp; returns `{ content, warnings, repairs }` via `repairContentForLayoutDetailed`. **validateContentForLayoutSoft** returns errors without throwing (generation pipeline).

### Backend pre-compile pipeline

Before `layoutSlotsToElements`, deck generation uses:

1. **contentPreShape** — layout-specific shaping (gallery, device mockups, charts, timelines, diagrams).
2. **contentRepair.service** — `prepareContentForCompile`: contract repair loop + **layoutQa** + Joi (`contentContract.schema.js`).
3. **slideCompiler.service** — `compileSlide`: repair → compile → `finalizeElementsDoc` (optional blueprint seed fallback).

Disable with `PPT_CONTENT_REPAIR_PIPELINE=false`. LLM repair (`repairSlideContentFromQa`) still runs after heuristics when QA issues remain.

**Audit (no extra Prisma table):** `PPT_CONTENT_REPAIR_AUDIT` controls where repair diffs go:

| Value | Behavior |
|--------|----------|
| `log` (default) | Structured `presentation_content_repair_audit` entries in `combined.log` when status is REPAIRED/WARN |
| `job` | Same payload in existing `slide_generation_jobs` rows (`jobType`: `CONTENT_REPAIR`, JSON in `usage`) |
| `both` | Log + job |
| `off` | No persistence (audit still returned from `compileSlide`) |

Set `PPT_CONTENT_REPAIR_LOG=verbose` to log OK passes too.

---

## 4. Slot text resolution (`textForSlot`)

Single implementation in `@athena/contracts/slotText.js`. Maps slot IDs to paths in slide JSON (title, columns[], stats[], milestones, funnel/quadrant cells, gallery labels with dedupe, agenda columns, contact fields, etc.).

After resolution, **clampSlotText** applies per-slot `maxLines` / `maxWords` / `maxChars` in order.

---

## 5. Validation (`validateContentForLayout`)

Strict mode (throws `ContentContractValidationError`):

| Code | Meaning |
|------|---------|
| `INVALID_SCHEMA` | Missing `slots[]` |
| `ARRAY_OVERFLOW` | Content array longer than layout group count |
| `SLOT_CHAR_OVERFLOW` | Resolved slot text exceeds derived max chars after normalize |
| `MISSING_TITLE` | Layout has heading slot but `content.title` is empty |

### Frontend gate

- [`compileDeckLayoutToElements`](../src/utils/compileDeckLayoutToElements.js) when `options.content` is set.
- [`applyCompiledLayoutToSlide`](../src/utils/layoutCanvasService.js) unless `skipContentValidation: true`.

---

## 6. Fallback rules

- Empty slot text → compile may use placeholder or empty string; validation only requires **title** when a heading slot exists.
- Gallery / column titles duplicate slide title → **uniqueColumnTitle** rewrites (see backend gallery tests).
- Chart/image slots are excluded from text validation; charts use FE `mapChartToSlots`.

---

## 7. Tests

From repo root:

```bash
cd AthenaVI_backend && npm run test:content-contract-parity
cd AthenaVI_backend && npm run test:content-repair-benchmarks
```

25 content fixtures × 25 catalog layouts; compares canonical resolver output to frontend `buildContentBySlotIdFromSlideContent` per schema slot ID.

Repair benchmarks run bad LLM fixtures through `prepareContentForCompile` + compile for 10 high-risk layouts (gallery, device grids, 3-card metrics, etc.).

---

## 8. Package exports

| Module | Exports |
|--------|---------|
| `contentContract.js` | `deriveContentContract`, `normalizeContentForLayout`, `validateContentForLayout`, `validateContentForLayoutSoft`, `repairContentForLayout`, `repairContentForLayoutDetailed`, `clampRepeatingGroups` |
| `contentRepair.js` | Low-level pad/clamp repair helpers |
| `slotText.js` | `textForSlot`, `coerceSlotText`, chart helpers |
| `textNormalize.js` | `clampSlotText`, truncation helpers |
| `errors.js` | `ContentContractValidationError` |

Frontend re-exports: [`src/utils/contentContract.js`](../src/utils/contentContract.js).
