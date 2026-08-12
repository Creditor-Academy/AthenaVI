# Seed presentation templates (deck packs pilot)

Convert bundles in `public/templates/` into backend **`DECK_LAYOUT`** + **`DECK_PACK`** records via the Superadmin API.

## Pilot scope

Women's Wellness — Harmony & Health (`womens_wellness_template`):

- 6 `DECK_LAYOUT` rows (only layouts used by this pack)
- 1 `DECK_PACK` with 6 slides + `slidePreviews`

## Prerequisites

1. Backend running and reachable (`VITE_API_BASE_URL` in `.env`, default `http://localhost:9000`)
2. Platform superadmin access token

### Auth options

Add to `.env.local` (gitignored):

```env
VITE_API_BASE_URL=http://localhost:9000
SUPERADMIN_TOKEN=your_access_token_here
```

Or paste the same value as `ACCESS_TOKEN` (from browser DevTools → Application → localStorage while logged in as superadmin).

Optional login instead of a raw token:

```env
SEED_LOGIN_EMAIL=you@example.com
SEED_LOGIN_PASSWORD=your_password
```

## Commands

Dry run (no token required):

```bash
node scripts/seed-presentation-templates.mjs --dry-run --only womens_wellness_template
```

Export converted schema JSON (no API):

```bash
node scripts/seed-presentation-templates.mjs --export-only --only womens_wellness_template
```

Seed layouts, then pack:

```bash
node scripts/seed-presentation-templates.mjs --only womens_wellness_template
```

Layouts only / packs only:

```bash
node scripts/seed-presentation-templates.mjs --layouts-only --only womens_wellness_template
node scripts/seed-presentation-templates.mjs --packs-only --only womens_wellness_template
```

Upload Pexels preview images to template media (optional):

```bash
node scripts/seed-presentation-templates.mjs --only womens_wellness_template --upload-media
```

Verify local conversion (+ API if token set):

```bash
node scripts/verify-deck-pack-pilot.mjs
```

## Files

| File | Purpose |
|------|---------|
| `scripts/deck-pack-seed-manifest.json` | Pack registry (pilot: Women's Wellness only) |
| `scripts/lib/layoutTypeMap.mjs` | Video `layoutType` → `layout_id` |
| `scripts/lib/publicTemplateToPresentation.mjs` | Converts `*_template.json` → `DECK_PACK` schema |
| `scripts/seed-presentation-templates.mjs` | Idempotent Superadmin seed CLI |

## After pilot

Extend `deck-pack-seed-manifest.json` with the remaining 12 packs from `src/constants/templateRegistry.js`, then run `--packs-only` for each batch.

## UI verification

1. Superadmin → Templates: 6 `DECK_LAYOUT` + 1 `DECK_PACK` (`womens_wellness`)
2. PPT Builder → Deck Packs: Women's Wellness card + 6-slide detail carousel
3. Create deck with `createMode: "pack"` using the pack row **cuid** (not `pack_id` slug)
