# AI PPT Generation Flow — Backend Payload Spec

This document describes the payload the frontend now sends when a user completes
the AI PPT wizard and triggers deck generation. It captures every option the user
can pick, plus the full catalog of available options for each category, so the
backend can persist the complete generation flow.

- **Owner:** Frontend (AI PPT wizard)
- **Consumer:** Backend presentation-generation service
- **Version:** `generationFlow.version = 1`

---

## 1. Where it is sent

The complete flow object is attached to the existing **start generation** call.
No new endpoint is required.

```
POST /api/workspaces/{workspaceId}/presentations/{presentationId}/generate
Content-Type: application/json
```

This is the final step of the flow:

```
POST   .../presentations                → create deck (returns presentationId)
GET    .../presentations/{id}/credit-estimate?slideCount=N
POST   .../presentations/{id}/outline   → AI outline (source: "prompt")
PATCH  .../presentations/{id}/outline   → user-reviewed outline
POST   .../presentations/{id}/theme     → { themeId }   (only if backend supports the id)
POST   .../presentations/{id}/generate  → THIS payload  ← full generation flow
GET    .../presentations/{id}/status    → poll until READY | FAILED
```

---

## 2. Request body

```json
{
  "density": "concise",
  "overwriteManualEdits": false,
  "generationFlow": {
    "version": 1,
    "source": "ai_ppt_wizard",
    "selections": {
      "prompt": "Create an investor pitch for our new health app",
      "title": "Investor Pitch — Health App",
      "outlineNotes": "Focus on traction and market size",
      "voiceAndTone": "Professional",
      "audience": "Investors",
      "purpose": "Persuade",
      "style": "Modern",
      "color": "Blue",
      "industries": ["Healthcare", "Technology"],
      "baseTemplate": "corp-pitch",
      "colorTheme": "modern-professional",
      "canvasSize": "16:9",
      "imageType": "ai",
      "imageStyle": "photo",
      "imageStyleFilter": "Suggested",
      "textContent": "Concise",
      "density": "concise",
      "slideCount": 10,
      "locale": "en",
      "packId": "<deck pack template row id from GET .../presentation-deck-packs>",
      "brandKitId": "<brand kit id from GET .../brand-kits>"
    },
    "availableOptions": {
      "voiceAndTone": ["Professional", "Creative", "Academic", "Persuasive", "Casual"],
      "audiences": ["Investors", "Customers", "Internal Team", "Students", "General Public"],
      "purposes": ["Persuade", "Inform", "Educate", "Inspire", "Report"],
      "styles": ["Abstract", "Aesthetic", "..."],
      "colors": ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Monochrome"],
      "industries": ["Technology", "Healthcare", "Education", "Finance", "Real Estate", "Marketing", "E-commerce", "Creative Agency"],
      "colorThemes": [
        {
          "id": "modern-professional",
          "name": "Modern Professional",
          "vibe": "corporate / clean",
          "background": "#FFFFFF",
          "backgroundSecondary": "#F5F6F8",
          "textPrimary": "#1A1A1A",
          "textSecondary": "#5C5F66",
          "primary": "#1E3A8A",
          "secondary": "#2563EB",
          "accent": "#F59E0B",
          "border": "#E2E4E9"
        }
      ],
      "canvasSizes": [{ "id": "16:9", "name": "Default", "ratio": "16/9" }],
      "baseTemplates": [{ "id": "corp-pitch", "name": "Corporate Pitch" }],
      "deckPacks": [{ "id": "<template row cuid>", "name": "Investor Deck — Violet Noir", "packId": "investor_deck_violet" }],
      "brandKits": [{ "id": "<brand kit id>", "name": "Acme Brand", "isDefault": true }],
      "imageTypes": [{ "id": "ai", "name": "AI images" }],
      "imageStyles": [{ "id": "photo", "name": "Photo", "tags": ["Realistic"] }],
      "imageStyleFilters": ["Suggested", "Photo", "Illustration", "Abstract"],
      "textContent": [{ "id": "Concise", "name": "Concise" }],
      "slideCounts": [5, 8, 10, 12, 15, 20]
    }
  }
}
```

> `availableOptions` is included so the backend can validate a selection and/or
> store the catalog snapshot that was active at generation time. It is fully
> derived from the frontend and can be ignored by the backend if not needed.

---

## 3. Field reference — `generationFlow.selections`

| Field | Type | Allowed values | Notes |
|-------|------|----------------|-------|
| `prompt` | string | free text | Raw user prompt (before title derivation). |
| `title` | string | free text, ≤ 255 | Derived deck title. |
| `outlineNotes` | string | free text | Optional brief/notes. |
| `voiceAndTone` | string | `Professional`, `Creative`, `Academic`, `Persuasive`, `Casual` | |
| `audience` | string | `Investors`, `Customers`, `Internal Team`, `Students`, `General Public` | |
| `purpose` | string | `Persuade`, `Inform`, `Educate`, `Inspire`, `Report` | |
| `style` | string | one of `availableOptions.styles` | May be empty if not chosen. |
| `color` | string | `Red`, `Blue`, `Green`, `Yellow`, `Purple`, `Orange`, `Pink`, `Monochrome` | May be empty. |
| `industries` | string[] | subset of `availableOptions.industries` | Multi-select, may be empty. |
| `baseTemplate` | string | `corp-pitch`, `marketing`, `social`, `portfolio` | |
| `colorTheme` | string | a `colorThemes[].id` | Local theme id (kebab-case). |
| `canvasSize` | string | `16:9`, `4:3`, `9:16` | Aspect ratio. |
| `imageType` | string | `ai`, `web`, `stock`, `placeholders`, `none` | |
| `imageStyle` | string | an `imageStyles[].id` (e.g. `photo`) | |
| `imageStyleFilter` | string | `Suggested`, `Photo`, `Illustration`, `Abstract` | UI filter used. |
| `textContent` | string | `Minimal`, `Concise`, `Detailed`, `Extensive` | |
| `density` | string | `concise`, `balanced`, `detailed` | Mapped from `textContent`. |
| `slideCount` | number | `5`–`20` | Clamped; reflects final reviewed outline length. |
| `locale` | string | e.g. `en` | |
| `packId` | string \| null | template row id from `GET .../presentation-deck-packs` | Not the schema `pack_id` string — use the list endpoint `id`. Drives layout whitelist + pack defaults. |
| `brandKitId` | string \| null | brand kit id from `GET .../brand-kits` | Applies theme/voice/brand photos; also sent on create when selected. |

Also on **create** (`POST .../presentations`): when a pack is selected the wizard uses `createMode: "pack"` + `packId`; `brandKitId` is optional on any create mode.

### Density mapping (`textContent` → `density`)

| textContent | density |
|-------------|---------|
| Minimal | concise |
| Concise | concise |
| Detailed | detailed |
| Extensive | detailed |

---

## 4. Full option catalogs

### Voice & Tone
`Professional`, `Creative`, `Academic`, `Persuasive`, `Casual`

### Audience
`Investors`, `Customers`, `Internal Team`, `Students`, `General Public`

### Purpose
`Persuade`, `Inform`, `Educate`, `Inspire`, `Report`

### Style
`Abstract`, `Aesthetic`, `Black & White`, `Colorful`, `Craft & Notebook`,
`Creative`, `Cute`, `Dark`, `Deluxe`, `Doodle`, `Duotone`, `Floral & Plants`,
`Illustration`, `Interactive & Animated`, `Minimalist`, `Modern`, `Pattern`,
`Professional`, `Simple`, `Vintage`, `Watercolor`

### Color
`Red`, `Blue`, `Green`, `Yellow`, `Purple`, `Orange`, `Pink`, `Monochrome`

### Industry
`Technology`, `Healthcare`, `Education`, `Finance`, `Real Estate`, `Marketing`,
`E-commerce`, `Creative Agency`

### Canvas Size
| id | name | ratio |
|------|-------------|------|
| `16:9` | Default | 16/9 |
| `4:3` | Traditional | 4/3 |
| `9:16` | Tall | 9/16 |

### Base Template
| id | name |
|------|------|
| `corp-pitch` | Corporate Pitch |
| `marketing` | Marketing Campaign |
| `social` | Social Media |
| `portfolio` | Personal Portfolio |

### Image Type
| id | name |
|------|------|
| `ai` | AI images |
| `web` | Web images |
| `stock` | Stock images |
| `placeholders` | Image placeholders |
| `none` | Don't add images |

### Image Style
`scene`, `photo`, `still-life`, `spot-color`, `illustration`, `flat-line`,
`modern-art`, `isometric`, `gouache`, `bold-poster`, `watercolor`, `bauhaus`,
`3d`, `neon-glow`, `cinematic`, `mesh`
(each item also carries `tags`, e.g. `Realistic`, `Minimal`, `Playful`)

### Image Style Filters
`Suggested`, `Photo`, `Illustration`, `Abstract`

### Text Content
`Minimal`, `Concise`, `Detailed`, `Extensive`

### Slide Count
`5`, `8`, `10`, `12`, `15`, `20`

### Color Themes (20)

| id | name | vibe | background | primary | secondary | accent |
|------|------|------|-----------|---------|-----------|--------|
| `modern-professional` | Modern Professional | corporate / clean | `#FFFFFF` | `#1E3A8A` | `#2563EB` | `#F59E0B` |
| `midnight-dark` | Midnight Dark Mode | dark / tech | `#0F1115` | `#6366F1` | `#8B5CF6` | `#22D3EE` |
| `humana-mint` | Humana Mint | healthcare / wellness | `#FFFFFF` | `#00A651` | `#7FD8A6` | `#FFB800` |
| `luxury-gold` | Luxury Gold & Black | premium / finance | `#0B0B0B` | `#D4AF37` | `#8A6E2F` | `#FFFFFF` |
| `soft-blush` | Soft Blush | feminine / soft / wellness | `#FFFBF8` | `#E8A798` | `#D98C9E` | `#F2C14E` |
| `playful-pop` | Playful Pop | fun / gamified | `#FFFFFF` | `#FF6B6B` | `#4ECDC4` | `#FFD93D` |
| `pastel-dream` | Pastel Dream | pastel / soft UI | `#FDFBFF` | `#B8A6E8` | `#A6D8E8` | `#F7B6C2` |
| `cyberpunk-neon` | Cyberpunk Neon | futuristic / neon | `#0A0A12` | `#FF00FF` | `#00FFF0` | `#FFEE00` |
| `earthy-sage` | Earthy Sage | nature / organic / calm | `#FAF8F3` | `#6B8E63` | `#A9BA9D` | `#C97B4A` |
| `ocean-breeze` | Ocean Breeze | cool / trust / SaaS | `#F7FCFF` | `#0EA5E9` | `#0369A1` | `#F97316` |
| `sunset-warmth` | Sunset Warmth | energetic / marketing | `#FFF9F5` | `#FF5E5B` | `#FF9F1C` | `#FFD166` |
| `minimal-monochrome` | Minimal Monochrome | minimal / editorial | `#FFFFFF` | `#000000` | `#4D4D4D` | `#999999` |
| `edtech-vibrant` | EdTech Vibrant | education / friendly professional | `#FFFFFF` | `#3B5BFF` | `#7C93FF` | `#FFB020` |
| `finance-trust` | Finance Trust | banking / fintech / serious | `#FFFFFF` | `#0B3D91` | `#1A5CA8` | `#00B37E` |
| `startup-gradient` | Startup Gradient | modern SaaS / pitch deck | `#FFFFFF` | `#7C3AED` | `#EC4899` | `#22C55E` |
| `vintage-paper` | Vintage Paper | retro / editorial / old-school | `#F7F1E3` | `#A9432B` | `#B58C3D` | `#4C6E4E` |
| `autumn-harvest` | Autumn Harvest | warm / seasonal | `#FFF8F0` | `#C1440E` | `#E09F3E` | `#9E2A2B` |
| `command-center` | Command Center | futuristic / AI dashboard | `#0D0D12` | `#4D4DFF` | `#7A7AFF` | `#00FFC2` |
| `corporate-teal` | Soft Corporate Teal | calm professional / consulting | `#FFFFFF` | `#0F766E` | `#14B8A6` | `#F59E0B` |
| `editorial-red` | Bold Editorial Red | high-contrast / statement deck | `#D7263D` | `#D7263D` | `#1B1B1B` | `#F4A259` |

> Each theme object in `availableOptions.colorThemes` also includes
> `backgroundSecondary`, `textPrimary`, `textSecondary`, and `border`.

---

## 4b. Recent art styles (user preferences)

The Details step shows **4 art styles** from the user's recently used styles, not a fixed catalog slice.

Persist recents on the user so they follow them across devices:

```
GET    /api/user/settings/ppt
PATCH  /api/user/settings/ppt
```

```json
{
  "recentArtStyles": ["watercolor", "cinematic", "photo", "illustration"]
}
```

Rules:

- Array of `imageStyles[].id` values, most recent first, max 4, unique.
- PATCH replaces the stored list (frontend sends the full updated array).
- If this endpoint is missing, the client falls back to local storage and to `generationFlow.selections.imageStyle` on the user's recent presentations (`GET /api/workspaces/{workspaceId}/presentations`).

`imageStyle` is already saved on outline + generate; keep storing it so recents can be rebuilt from history.

---

## 5. Constraints (already enforced client-side)

| Constraint | Value |
|------------|-------|
| AI slide count | 5–20 (clamped) |
| Deck max slides | 40 |
| Elements per slide | 50 |
| Title max length | 255 chars |
| `themeId` (theme endpoint) | underscores, must exist in backend catalog or is omitted |
| `density` enum | `concise`, `balanced`, `detailed` |
| Generation status | `READY` / `FAILED`, poll timeout 10 min |

---

## 6. Backwards compatibility

- The `generate` request still contains the original top-level `density` and
  `overwriteManualEdits` fields, so existing backend handling continues to work.
- `generationFlow` is additive. A backend that ignores it will behave exactly as
  before.
