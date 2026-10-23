Brand Kit — Frontend Handoff (Part 1 of 2)
Scope: workspace Brand Kit CRUD, media, AI suggest, health score, studio flows.
Refs: `docs/FRONTEND_PPT_IMAGE_BRAND_KIT_A_TO_Z.md`, `docs/api/BRAND_KIT_API.md`, Postman Brand Kits (17 requests).
What shipped
Canva-style workspace Brand Kits with:


- CRUD + multi-role logos, photos, graphics

- Extended `data`: light/dark colors, typography scale, voice, usage rules, tagline, chart colors, image style

- AI suggestions (proposals only — user confirms via PATCH/media)

- Health completeness score (Overview gauge)

- Brand guideline deck (6 slides, PDF/PPTX export)

- PPT integration: create, generate, apply-brand-kit; default kit auto-resolve


Core pattern: suggest endpoints return proposals. Nothing is auto-saved. User confirms → `PATCH` kit or `POST .../media`.
Base path & auth
/api/workspaces/\:workspaceId/brand-kits
Authorization: Bearer \<accessToken>

Action

Roles

List, get, health, stream, guidelines (read)

OWNER, ADMIN, MEMBER

Create, update, delete, media, set-default, AI, guideline generate

OWNER, ADMIN
Envelope: `{ success, message, data }`
Errors: 400 validation · 402 insufficient credits · 404 not found
`data` shape (POST/PATCH)
{
  "meta": {
    "tagline": "Empowering Executive Decks",
    "industry": null,
    "guidelineProjectId": "clxx…"
  },
  "colors": [
    { "id": "c1", "name": "Primary (Light)", "hex": "#D51C0B" },
    { "id": "c2", "name": "Background (Light)", "hex": "#F7F3F3" },
    { "id": "c3", "name": "Text (Light)", "hex": "#1B1110" },
    { "id": "c4", "name": "Background (Dark)", "hex": "#1B1110" },
    { "id": "c5", "name": "Primary (Dark)", "hex": "#FB6456" },
    { "id": "c6", "name": "Text (Dark)", "hex": "#F7F3F3" }
  ],
  "colorRoles": {
    "bg": "c2", "text": "c3", "primary": "c1",
    "secondary": "c1", "muted": "c3",
    "bgDark": "c4", "textDark": "c6", "primaryDark": "c5"
  },
  "fonts": {
    "heading":    { "fontPairingId": "outfit\_source", "family": "Outfit",        "weight": 700, "sizePx": 40, "lineHeight": 1.2 },
    "subheading": { "fontPairingId": "outfit\_source", "family": "Space Grotesk", "weight": 600, "sizePx": 20, "lineHeight": 1.4 },
    "body":       { "fontPairingId": "outfit\_source", "family": "Inter",         "weight": 400, "sizePx": 14, "lineHeight": 1.6 }
  },
  "voice": {
    "tone": "Professional, confident",
    "audience": "Enterprise buyers",
    "dos": ["Use short sentences"],
    "donts": ["No slang"],
    "vocabulary": ["Athena VI"]
  },
  "usage": {
    "logoClearSpace": "1.5x cap height",
    "logoMinSizePx": 24,
    "doNot": ["Recolor logo", "Stretch lockup"]
  },
  "chartStyles": { "colorIds": ["c1", "c5"] },
  "imageStyle": "clean product photography, studio lighting, brand-safe"
}
Validation (mirror in forms):


- `colors`: 2–32 entries, unique `id`, hex `#RGB` or `#RRGGBB`

- `colorRoles.bg`, `.text`, `.primary`: required, must reference color ids

- Dark roles optional but recommended for health score

- Server checks WCAG AA contrast on create/update — show friendly 400 errors

- PATCH: when sending `data`, send the full object (partial nested `data` fails Joi)


All routes

Method

Path

Purpose

GET

`/brand-kits`

List (`mediaCount`, `isDefault`)

POST

`/brand-kits`

Create `{ name, data, isDefault? }`

GET

`/brand-kits/:id`

Full kit + presigned media URLs

PATCH

`/brand-kits/:id`

Update name / data / isDefault

DELETE

`/brand-kits/:id`

Delete kit + S3 media

POST

`/brand-kits/:id/set-default`

Set workspace default

GET

`/brand-kits/:id/health`

Completeness score

POST

`/brand-kits/:id/media`

Multipart upload

DELETE

`/brand-kits/:id/media/:mediaId`

Delete media

GET

`/brand-kits/:id/media/:mediaId/stream`

Stream bytes

POST

`/brand-kits/suggest/colors`

AI palette from logo

POST

`/brand-kits/suggest/fonts`

AI font pairing

POST

`/brand-kits/suggest/voice`

AI voice

POST

`/brand-kits/suggest/image-style`

AI image brief

POST

`/brand-kits/:id/suggest/logo-variants`

Logo variants

POST

`/brand-kits/:id/guidelines/generate`

6-slide guideline deck

GET

`/brand-kits/:id/guidelines`

Linked presentation info
Wizard flow (create)

Step

UI

API

1

Name + tagline

`data.meta.tagline` on create

2

Primary logo

`POST .../media` `{ kind:"logo", role:"primary" }`

3

Generate colors

`POST .../suggest/colors` (file or `{ mediaId, brandKitId }`)

4

Review palette

User confirms → include in create/PATCH

5

Fonts

`POST .../suggest/fonts` → confirm

6

Voice

`POST .../suggest/voice` `{ name, tagline?, tone? }`

7

Image style

`POST .../suggest/image-style`

8

Save

`POST .../brand-kits` + optional `isDefault: true`
Before kit exists: suggest works without `brandKitId` (colors needs file upload).
After kit exists: pass `brandKitId`; colors can use `{ mediaId, brandKitId }`.
Studio tabs (edit)

Tab

Load

Save

AI

Overview

GET + GET `/health`

PATCH name/tagline

Health gauge

Colors

`data.colors`, `colorRoles`

PATCH full data

suggest/colors

Logos

`media` where `kind=logo`

POST media per role

logo-variants

Typography

`data.fonts`

PATCH

suggest/fonts

Voice

`data.voice`

PATCH

suggest/voice

Imagery

`imageStyle`, photos

PATCH + media

suggest/image-style

Guidelines

GET `/guidelines`

—

POST `/guidelines/generate`
Logo roles: `primary`, `secondary`, `icon`, `light`, `dark`, `light-mode`, `dark-mode`, `with-name-below`, `with-name-adjacent`, `black`, `white`
Same role re-upload replaces previous asset (no duplicate rows).
Logo variants (two-step)
1\. Preview (FREE):
   POST .../suggest/logo-variants  { }
   → url = "data\:image/png;base64,..."  preview: true  applied: false
2\. Apply (PAID):
   POST .../suggest/logo-variants  { applyRoles: ["light","dark","black","white"] }
   → applied: true, mediaId set, presigned url
SVG logos are rasterized server-side. Per-role errors return `{ role, error }` without failing the batch.
Health score
GET .../brand-kits/\:id/health
{
  "health": {
    "score": 72,
    "label": "Good Consistency",
    "checks": [{ "id": "logo\_variants", "label": "Logo variants", "pass": false }],
    "missing": ["logo\_variants", "photos"],
    "guidelineProjectId": "clxx…"
  }
}
Labels: Excellent (≥90) · Good (≥75) · Fair (≥50) · Needs work (<50).
Use `missing[]` for "Complete your kit" CTAs.
Media upload
POST .../brand-kits/\:id/media   (multipart/form-data)

Field

Required

Notes

file

yes

jpeg/png/webp/svg, max 50MB

kind

yes

`logo` | `photo` | `graphic`

role

logos

see logo roles above

name

no

display label
Response includes presigned `url` for preview. Fallback: `GET .../media/:mediaId/stream`.
Suggest contracts (Part 1)
Colors
POST .../suggest/colors
multipart file  OR  { tone?, tagline?, brandKitId?, mediaId? }
→ { suggestion: { colors, colorRoles, rationale } }
Fonts
POST .../suggest/fonts  { tone?, primaryHex?, brandKitId? }
→ { suggestion: { fonts: { heading, subheading, body }, rationale } }
Voice
POST .../suggest/voice  { name, tagline?, tone?, brandKitId? }
→ { suggestion: { voice, rationale } }
Image style
POST .../suggest/image-style  { tone?, colors?, colorRoles?, brandKitId? }
→ { suggestion: { imageStyle, chartStyles: { colorIds }, rationale } }
→ Continue in Part 2: guideline deck, PPT integration, themeTokens, credits, checklist, build order.


Brand Kit — Frontend Handoff (Part 2 of 2)
Part 1 covered: data model, routes, wizard/studio, health, media, suggest contracts.
Part 2 covers: guidelines, PPT integration, themeTokens, credits, permissions, checklist.
Brand guideline deck
Generate:
POST /api/workspaces/\:workspaceId/brand-kits/\:brandKitId/guidelines/generate
{ "folderId": "\<uuid>" }   // required — pick folder in UI
Response:
{
  "guideline": {
    "presentationId": "clxx…",
    "deckId": "clxx…",
    "name": "Acme — Brand Guidelines",
    "slideCount": 6,
    "status": "DRAFT",
    "themeTokens": { },
    "warnings": ["primary\_logo\_missing"],
    "regenerated": false
  }
}
6 slides (fixed): Cover → Colors → Logos → Typography → Imagery → Governance
Regenerate: if `data.meta.guidelineProjectId` points to an existing presentation, backend replaces slides in place (`regenerated: true`, same `presentationId`). No orphan decks.
Check link:
GET .../brand-kits/\:id/guidelines
→ { linked: true, presentationId, name, status, slideCount }
Download — reuse PPT export (no new endpoint):
POST /api/workspaces/\:workspaceId/presentations/\:presentationId/export
{ "format": "pdf" | "pptx" }
Open in editor via standard presentation load using `presentationId`.
PPT integrationDefault kit auto-resolve
If workspace has `isDefault: true` kit, omit `brandKitId` on:


- `POST .../presentations` (blank / template / pack)

- AI generate: `generationFlow.selections.brandKitId`


Backend resolves default automatically.
Create with explicit kit
POST /api/workspaces/\:workspaceId/presentations
{
  "createMode": "blank",
  "folderId": "...",
  "name": "My Deck",
  "brandKitId": "optional-kit-id"
}
Blank create injects brand logo on slide 1 when kit has a logo.
Apply to existing deck
POST .../presentations/\:presentationId/apply-brand-kit
{ "brandKitId": "..." }
Updates `deck.themeTokens`; re-injects logo on title/closing slides.
AI generate
{
  "generationFlow": {
    "selections": {
      "brandKitId": "optional",
      "packId": "optional"
    }
  }
}
Kit effects: theme colors/fonts, voice in AI prompts, brand photos for slide images, logo on title/closing.
Precedence: Brand Kit → pack theme → wizard colorTheme → catalog default
`themeTokens` on deck
After create/apply, `deck.themeTokens`:
{
  "palette": { "bg", "text", "primary", "secondary", "muted", "surface" },
  "paletteDark": { "bg", "text", "primary", ... },
  "fonts": {
    "heading", "subheading", "body",
    "headingWeight", "subheadingWeight", "bodyWeight",
    "headingLineHeight", "subheadingLineHeight", "bodyLineHeight"
  },
  "typeScale": { "display", "title", "subtitle", "body", "caption", "stat" },
  "imageStyle": "...",
  "brand": {
    "brandKitId": "...",
    "name": "Acme Brand",
    "tagline": "...",
    "voice": { },
    "usage": { },
    "chartColors": ["#D51C0B", "#FB6456"],
    "logos": {
      "primary": { "url": "https\://…", "s3Key": "…", "role": "primary" },
      "light": { }, "dark": { }
    },
    "photos": [{ "url": "…", "name": "…" }],
    "graphics": [],
    "namedColors": [ ]
  }
}
Canvas notes:


- Resolve `colorRole: "primary"` from `themeTokens.palette`

- Logos use presigned `url` from `brand.logos.*`

- Charts without colors → fall back to `brand.chartColors`

- Support `paletteDark` where dark mode exists


Credits & billing
Flat workspace-scoped AC (personal pool on PRIVATE, workspace pool on TEAM).

Action

Default AC

Charged when

Suggest colors

2

Valid palette returned

Suggest fonts

1

Valid fonts returned

Suggest voice

1

Valid voice returned

Suggest image style

1

Valid brief returned

Logo variants

2

Only when `applyRoles` commits

Guideline generate

3

Each successful generate/regenerate

UX

Billing

Logo preview (no `applyRoles`)

Free — no credit check

Logo apply (`applyRoles`)

Charged

Failed AI / validation

Not charged
402: show credits modal before billable POSTs; refresh balance after success.
Ledger labels: `Brand kit color suggestion`, `Brand guideline deck`, etc.
Details: `docs/CREDITS_FRONTEND_INTEGRATION.md`
Role permissions

User

Can do

MEMBER

View kits, health, guidelines, stream; use kit on presentations

OWNER/ADMIN

Full CRUD, media, AI suggest, guideline generate
Hide edit/AI/generate for MEMBER — read-only studio.
Not in v1 (don't block on these)


- Image Gen does not auto-load brand kit (UI can bridge manually)

- No live sync into existing decks (use `apply-brand-kit`)

- `graphics` media stored but barely used in PPT pipeline


Frontend checklist
Brand Kit


- List with default badge

- CRUD + set-default

- Media zones (logo roles, photos, graphics)

- Full data form: light/dark colors, subheading, usage.doNot, tagline

- Health gauge (`GET .../health`)

- AI suggest → confirm → PATCH

- Logo preview (free) vs apply (paid)

- Guideline generate + editor + PDF/PPTX export

- 402 handling + balance refresh


Presentations


- Optional `brandKitId` on create (or default kit)

- Kit picker in wizard/generate

- `apply-brand-kit` on existing decks

- `paletteDark`, logo from `brand.logos`, chart colors from `brand.chartColors`


Docs & Postman

Resource

Path

All-in-one guide

`docs/FRONTEND_PPT_IMAGE_BRAND_KIT_A_TO_Z.md`

Brand Kit API

`docs/api/BRAND_KIT_API.md`

Route table

`docs/api/QUICK_REFERENCE.md`

Credits

`docs/CREDITS_FRONTEND_INTEGRATION.md`

PPT API

`docs/api/PRESENTATION_API.md`

Postman

`postman/collections/AthenaVI Backend/Brand Kits/`
Variables: `workspaceId`, `brandKitId`, `brandKitMediaId`, `brandKitLogoFile`, `accessToken`
Recommended build order


- CRUD + media + default kit

- Health + Overview tab

- PPT wiring (create, logo inject, apply-brand-kit)

- AI suggest tabs (colors → fonts → voice → image style)

- Logo variants (preview → apply)

- Guideline deck (generate → editor → export)


Questions → backend team. Contract source of truth: `docs/api/BRAND_KIT_API.md`.