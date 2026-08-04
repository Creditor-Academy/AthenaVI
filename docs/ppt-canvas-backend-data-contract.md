# PPT Canvas — Backend Data Contract (A → Z)

**Owner:** Frontend (AthenaVI PPT editor)  
**Consumer:** Presentation / canvas backend  
**Related:** [ppt-generation-flow-payload.md](./ppt-generation-flow-payload.md) (AI wizard generate payload)  
**Canvas coordinate system:** virtual **1920 × 1080** (origin top-left). Aspect ratios `16:9` | `4:3` | `9:16` should still map element placements into this virtual frame (or return `elements.canvas.width/height` and keep placements in that space).

This document is the **full list of data the canvas needs** — create, load, edit, brand, export — so backend can implement and validate end-to-end.

---

## 0. Caps & enums (hard limits)

| Cap | Value |
|-----|-------|
| AI outline slides | 5–20 |
| Deck max slides | 40 |
| Elements per slide | 50 |
| Title max length | 255 |
| Export formats | `PPTX`, `PDF`, `PNG`, `JPEG` |
| Density | `concise` \| `balanced` \| `detailed` |
| Deck status | `GENERATING` \| `READY` \| `FAILED` |
| Aspect ratio | `16:9` \| `4:3` \| `9:16` |
| Create mode | `blank` \| `template` \| `pack` |

While `status === GENERATING`, structure edits (add/delete/reorder slides, canvas writes) must return **409**.

---

## 1. API surface (all presentation endpoints)

Base: `/api/workspaces/{workspaceId}/…`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/presentation-templates` | Layout / slide templates gallery |
| GET | `/presentation-deck-packs` | Multi-slide pack skeletons |
| GET | `/presentation-themes` | Theme catalog |
| GET | `/presentation-elements` | Element presets (`text_title`, `image`, `chart`, …) |
| GET | `/presentations` | List decks in workspace |
| POST | `/presentations` | Create deck |
| GET | `/presentations/{id}` | **Full deck + slides + canvas** (editor load) |
| GET | `/presentations/{id}/status` | Poll generation |
| GET | `/presentations/{id}/credit-estimate?slideCount=N` | Credits |
| POST | `/presentations/{id}/outline` | Create outline (prompt / document) |
| PATCH | `/presentations/{id}/outline` | Save reviewed outline |
| POST | `/presentations/{id}/theme` | `{ themeId }` |
| POST | `/presentations/{id}/apply-brand-kit` | `{ brandKitId }` |
| POST | `/presentations/{id}/generate` | Start AI generation (+ `generationFlow`) |
| POST | `/presentations/{id}/slides` | Add slide |
| GET/PATCH/DELETE | `/presentations/{id}/slides/{slideId}` | Read / patch / delete slide |
| POST | `/presentations/{id}/slides/{slideId}/duplicate` | Duplicate |
| PATCH | `/presentations/{id}/slides/reorder` | `{ slideIds: string[] }` |
| POST | `/presentations/{id}/slides/{slideId}/apply-layout` | `{ templateId }` |
| PUT | `/presentations/{id}/slides/{slideId}/canvas` | **Replace full canvas doc** |
| POST | `/presentations/{id}/slides/{slideId}/elements` | Insert one element |
| PATCH | `/presentations/{id}/slides/{slideId}/elements/{elementId}` | Update element |
| DELETE | `/presentations/{id}/slides/{slideId}/elements/{elementId}` | Delete element |
| PATCH | `/presentations/{id}/slides/{slideId}/elements/reorder` | `{ elementIds }` |
| POST | `/presentations/{id}/slides/{slideId}/regenerate` | AI regenerate slide |
| POST | `/presentations/{id}/export` | Start export |
| GET | `/presentations/{id}/export/{exportId}` | Export status + download URL |

Related (not under presentations, but canvas media depends on them):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/stock/search?q=&type=photo&provider=` | Unsplash / Pexels / Pixabay |
| POST | `/api/stock/workspaces/{workspaceId}/import` | Import stock → asset |
| GET | `/api/assets/{workspaceId}` | Workspace library images/videos |
| POST | `/api/assets/{workspaceId}/upload` | Upload media |
| GET/POST | `/api/workspaces/{workspaceId}/brand-kits…` | Brand kits + media |

---

## 2. Create presentation — request

`POST /presentations`

```json
{
  "title": "Untitled Presentation",
  "folderId": "<cuid>",
  "locale": "en",
  "aspectRatio": "16:9",
  "createMode": "blank",
  "templateId": null,
  "packId": null,
  "themeId": "modern_professional",
  "brandKitId": null
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | ≤ 255 |
| `folderId` | yes | Workspace folder |
| `locale` | no | default `en` |
| `aspectRatio` | no | default `16:9` |
| `createMode` | yes | `blank` \| `template` \| `pack` |
| `templateId` | if template | Catalog row id |
| `packId` | if pack | Deck-pack list `id` (not schema `pack_id` string) |
| `themeId` | no | Backend catalog id (underscores) |
| `brandKitId` | no | Apply kit on create |

**Response must include:** `{ id | presentationId }` (or nested `presentation.id`).

For `blank`, ensure **at least one slide** exists (frontend may call `POST …/slides` as fallback).

---

## 3. GET presentation — response shape (critical for canvas)

Frontend accepts any of:

- `data.slides`
- `data.deck.slides`
- `data.presentation.slides`

### 3.1 Deck / presentation root

```json
{
  "id": "pres_…",
  "title": "Investor Pitch",
  "locale": "en",
  "aspectRatio": "16:9",
  "status": "READY",
  "folderId": "…",
  "themeId": "modern_professional",
  "brandKitId": null,
  "themeTokens": {
    "brand": { "name": "Acme" },
    "palette": {
      "bg": "#FFFFFF",
      "surface": "#F8FAFC",
      "primary": "#1E3A8A",
      "secondary": "#2563EB",
      "accent": "#F59E0B",
      "text": "#0F172A",
      "muted": "#64748B"
    }
  },
  "deck": {
    "status": "READY",
    "themeTokens": { }
  },
  "slides": [ ]
}
```

| Field | Needed by canvas |
|-------|------------------|
| `id` | Session / URL restore |
| `title` | Nav title |
| `status` / `deck.status` | Lock UI while `GENERATING` |
| `themeTokens.palette` | Slide background + text colors |
| `slides[]` | All slides with **elements** |

### 3.2 Slide object

```json
{
  "id": "slide_…",
  "title": "Problem",
  "description": ["Bullet one", "Bullet two"],
  "content": {
    "title": "Problem",
    "body": "…",
    "bullets": ["…"]
  },
  "layoutId": "title-bullets",
  "manuallyEdited": false,
  "status": "READY",
  "imageRef": {
    "url": "https://…",
    "presignedUrl": "https://…",
    "source": "ai",
    "error": null
  },
  "elements": {
    "version": 1,
    "canvas": { "width": 1920, "height": 1080 },
    "elements": [ ]
  }
}
```

| Field | Role |
|-------|------|
| `id` | Select / edit / delete / regenerate |
| `title` / `content.title` | Minimap label + mock fallback |
| `description` / `content.bullets` | Mock fallback when **no elements** |
| `manuallyEdited` | Regenerate overwrite confirm |
| `layoutId` | Optional layout tracking |
| `imageRef` | Fallback visual if no image element |
| `elements` | **Render truth** for canvas |

`imageRef.source === "none"` means intentionally no hero image.

---

## 4. Canvas document (PUT …/canvas)

```json
{
  "version": 1,
  "canvas": { "width": 1920, "height": 1080 },
  "elements": [ /* Element[] */ ]
}
```

- PUT **replaces** the whole canvas for that slide.
- Persist `version`; bump or accept client version for optimistic concurrency (optional; today frontend sends `1` or last known).
- Must round-trip: after PUT, GET presentation must return the same elements with URLs/content intact.

---

## 5. Element model (shared)

Every element:

```ts
{
  id: string              // stable cuid
  type: ElementType
  role?: string           // e.g. "title" | "body" | "hero"
  layer?: number          // z-order; lower = back
  presetId?: string       // optional catalog preset used to create
  placement: Placement
  content: object         // type-specific
}
```

### Placement

```ts
{
  x: number        // px on virtual canvas
  y: number
  width: number
  height: number
  rotation?: number  // degrees
  opacity?: number   // 0–1
}
```

### ElementType (required support)

| `type` | Insert UI | Export |
|--------|-----------|--------|
| `text` | Text presets | Yes |
| `image` | Media / upload / stock | Yes |
| `icon` | Icons / stickers | Yes (as image) |
| `shape` | Shape panel | Yes |
| `chart` | Chart panel | Yes (as chart or rasterized) |
| `table` | Table picker | Yes |
| `embed` | YouTube / Vimeo / Loom / link | Link card or thumbnail in export |

---

## 6. Element content schemas (A → Z by type)

### 6.1 `text`

```json
{
  "type": "text",
  "content": {
    "text": "Slide title",
    "fontSize": 64,
    "bold": true,
    "italic": false,
    "align": "left",
    "color": "#0F172A",
    "fontFamily": "Inter"
  }
}
```

Preset ids frontend may send:  
`text_title`, `text_subtitle`, `text_section`, `text_paragraph`, `text_bullets`, `text_numbered`, `text_quote`, `text_caption`, `text_label`, `text_big_number`, `text_stat`

### 6.2 `image`

```json
{
  "type": "image",
  "content": {
    "url": "https://cdn…/photo.jpg",
    "src": "https://cdn…/photo.jpg",
    "alt": "Office",
    "fit": "cover",
    "assetId": "asset_…",
    "provider": "unsplash"
  }
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `url` or `src` | **yes** | Canvas will not show image without a resolvable URL |
| `fit` | no | `cover` \| `contain` \| `fill` |
| `assetId` | no | Workspace asset after upload/import |
| `provider` | no | `unsplash` \| `pexels` \| `pixabay` \| `upload` \| `brand` |

### 6.3 `icon`

Same as image; prefer `fit: "contain"`. Often Icons8 / sticker CDN URLs.

### 6.4 `shape`

```json
{
  "type": "shape",
  "content": {
    "shape": "rounded-rect",
    "fill": "#3B82F6",
    "stroke": "#1E3A8A",
    "strokeWidth": 2,
    "line": "#94A3B8"
  }
}
```

`shape` values used today:  
`rect`, `rounded-rect`, `circle`, `ellipse`, `pill`, `triangle`, `diamond`, `star`, `line`, plus flowchart/arrow ids from shape library (`arrow-right`, `flow-process`, …).

### 6.5 `chart`

```json
{
  "type": "chart",
  "content": {
    "chartType": "column-grouped",
    "colors": ["#7C3AED", "#A78BFA", "#FDBA74"],
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "series": [
        { "name": "Series A", "values": [12, 19, 14, 22] },
        { "name": "Series B", "values": [8, 11, 16, 18] }
      ]
    }
  }
}
```

`chartType` catalog:  
`column`, `column-grouped`, `column-stacked`, `bar`, `bar-grouped`, `bar-stacked`, `line`, `line-points`, `line-multi`, `area`, `area-stacked`, `pie`, `donut`, `kpi`

### 6.6 `table`

```json
{
  "type": "table",
  "content": {
    "rows": 3,
    "cols": 4,
    "hasHeader": true,
    "cells": [
      ["Header 1", "Header 2", "Header 3", "Header 4"],
      ["", "", "", ""],
      ["", "", "", ""]
    ]
  }
}
```

Limits: max **8×8** from UI.

### 6.7 `embed` (or `link`)

```json
{
  "type": "embed",
  "content": {
    "provider": "youtube",
    "url": "https://www.youtube.com/watch?v=…",
    "title": "YouTube"
  }
}
```

`provider`: `youtube` \| `vimeo` \| `loom` \| `any-link`  
Export may store as clickable link card if iframes are not supported in PPTX/PDF.

---

## 7. Insert element — request

`POST …/slides/{slideId}/elements`

```json
{
  "type": "image",
  "presetId": "image",
  "placement": { "x": 560, "y": 240, "width": 800, "height": 500 },
  "content": {
    "url": "https://…",
    "src": "https://…",
    "fit": "cover"
  }
}
```

Backend must:

1. Accept **rich `content`** (not only `presetId`).
2. Persist URLs for images/icons.
3. Enforce max 50 elements → **400** with clear message.
4. Return created element with `id`.

If only `presetId` is sent, expand from `GET …/presentation-elements` catalog.

---

## 8. Catalog endpoints the canvas/gallery needs

### 8.1 Templates — `GET …/presentation-templates`

Each item:

```json
{
  "id": "tpl_…",
  "templateId": "tpl_…",
  "name": "Title + bullets",
  "contentType": "Layout",
  "variant": "Basic",
  "previewUrl": "https://…",
  "thumbnailUrl": "https://…",
  "swatches": ["#0f172a", "#3b82f6", "#94a3b8"]
}
```

Used by: Add-slide **Templates** tab + `apply-layout`.

### 8.2 Deck packs — `GET …/presentation-deck-packs`

```json
{
  "id": "<row cuid>",
  "name": "Investor Deck",
  "pack_id": "investor_deck_violet",
  "themeId": "…",
  "schema": {
    "pack_id": "investor_deck_violet",
    "themeId": "…",
    "slides": [ ],
    "preview": { "label": "…", "imageUrl": "…" }
  }
}
```

Create uses list item **`id`** as `packId`.

### 8.3 Themes — `GET …/presentation-themes`

```json
{
  "id": "modern_professional",
  "name": "Modern Professional",
  "palette": { "bg": "#fff", "primary": "#1E3A8A", "…" : "…" }
}
```

`themeId` on create/set-theme uses **underscores**.

### 8.4 Element presets — `GET …/presentation-elements`

```json
{
  "presets": [
    {
      "id": "text_title",
      "presetId": "text_title",
      "type": "text",
      "label": "Title",
      "content": { "text": "Title", "fontSize": 64, "bold": true }
    }
  ]
}
```

---

## 9. Slides lifecycle payloads

### Add slide

`POST …/slides`

```json
{
  "afterSlideId": "slide_…",
  "title": "Blank Slide",
  "layoutId": "title-bullets"
}
```

**Response:** `{ id }` of new slide.

### Apply layout

`POST …/slides/{slideId}/apply-layout`  
`{ "templateId": "tpl_…" }`  
Should populate `elements` for that slide.

### Duplicate / delete / reorder

- Duplicate: `POST …/duplicate` → new slide id  
- Delete: `DELETE` (refuse if last slide, or allow and keep ≥1)  
- Reorder: `{ "slideIds": ["s1","s2","s3"] }`

### Patch slide

`PATCH …/slides/{slideId}`

```json
{
  "title": "…",
  "content": { "title": "…", "bullets": [] },
  "manuallyEdited": true,
  "background": { "color": "#0F172A", "imageUrl": null }
}
```

(Background fields are for Design panel — recommended.)

### Regenerate slide

```json
{
  "target": "full",
  "overwriteManualEdits": true
}
```

Then poll deck `status` until `READY`.

---

## 10. Brand kit apply

`POST …/apply-brand-kit`  
`{ "brandKitId": "…" }`

Expected side effects on GET presentation:

- `themeTokens.palette` updated  
- Optional brand photos available for Media rail  
- Chart colors may follow kit `chartStyles.colorIds`

Errors: **403** not allowed, **409** while generating.

---

## 11. Generation status

`GET …/status`

```json
{
  "status": "READY",
  "deckStatus": "READY",
  "message": null,
  "progress": 100
}
```

Frontend treats `status` / `deckStatus` / `deck.status` (uppercase) as `READY` | `FAILED` | else keep polling (timeout 10 min).

---

## 12. Export

`POST …/export`

```json
{ "format": "PPTX", "slideId": null }
```

`slideId: null` = full deck; set for single-slide PNG/JPEG.

Status:

```json
{
  "exportId": "exp_…",
  "status": "READY",
  "presignedUrl": "https://…",
  "url": "https://…",
  "downloadUrl": "https://…"
}
```

At least one of `presignedUrl` | `url` | `downloadUrl` required when READY.

---

## 13. Stock + assets (media insert)

### Search

`GET /api/stock/search?q=business&type=photo&provider=unsplash&page=1&perPage=24`

Return items with:

```json
{
  "id": "…",
  "externalId": "…",
  "provider": "unsplash",
  "url": "https://…",
  "thumbnailUrl": "https://…",
  "previewUrl": "https://…",
  "description": "…"
}
```

### Import

`POST /api/stock/workspaces/{workspaceId}/import`

```json
{
  "provider": "unsplash",
  "externalId": "…",
  "mediaType": "photo",
  "name": "…"
}
```

Return asset with stable `url` / `cdnUrl`.

### Assets list / upload

List items need `id`, `url`|`cdnUrl`, `mediaType`|`mimeType`, `name`.

---

## 14. Default placements (frontend reference)

| Type | x | y | w | h |
|------|---|---|---|---|
| text | 160 | 200 | 1000 | 120 |
| image | 560 | 240 | 800 | 500 |
| icon | 860 | 400 | 120 | 120 |
| shape | 760 | 340 | 400 | 280 |
| chart | 360 | 200 | 1200 | 640 |
| table | 280 | 220 | 1360 | 520 |
| embed | 480 | 240 | 960 | 540 |

Backend may override after layout apply.

---

## 15. Error contract

| Status | When |
|--------|------|
| 400 | Validation (caps, missing fields) — include `message` + `errors` |
| 402 | Insufficient credits |
| 403 | Brand kit / permission |
| 409 | Generating / overwrite blocked / conflict |
| 429 | Rate limit |
| 503 | Stock unavailable |

---

## 16. Priority checklist for backend (canvas-critical)

1. **GET presentation** returns every slide with full `elements.elements[]` including image URLs.  
2. **PUT canvas** persists rich content and returns it on next GET (no stripping `content.url`).  
3. **POST elements** accepts `{ type, content, placement }`, not only `presetId`.  
4. Support element types: `text`, `image`, `icon`, `shape`, `chart`, `table`, `embed`.  
5. Enforce caps: 40 slides, 50 elements/slide.  
6. Lock writes with **409** while `GENERATING`.  
7. Export returns downloadable URL for PPTX/PDF/PNG/JPEG.  
8. Templates + apply-layout populate canvas elements for Add-slide gallery.  
9. Brand kit apply updates `themeTokens`.  
10. Stock import yields durable HTTPS URLs usable in `image` elements.

---

## 17. Out of scope / later (frontend ready, backend optional)

- Live Google Sheets / Analytics chart sync  
- Giphy  
- True undo/redo history API  
- Present / Share / comments  
- Slide background image dedicated field (Design panel)  
- Record tool  

---

*Source of truth in repo: `src/services/presentationService.js`, `src/utils/presentationHelpers.js`, `src/constants/pptInsertCatalog.js`, `src/pages/Slides/AIPptComponents/AIPptEditor.jsx`, `docs/ppt-generation-flow-payload.md`.*
