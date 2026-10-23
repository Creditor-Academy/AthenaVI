# Seed presentation layouts (Simple slides catalog)

Seeds all **DECK_LAYOUT** templates from `src/utils/deckLayoutRegistry.js` via the Superadmin API.

## Prerequisites

1. Backend running (`VITE_API_BASE_URL` in `.env`, default `http://localhost:9000`)
2. Platform superadmin access token

### Auth

Add to `.env.local` (gitignored):

```env
VITE_API_BASE_URL=http://localhost:9000
SUPERADMIN_TOKEN=your_access_token_here
```

Or use `ACCESS_TOKEN` from browser DevTools while logged in as superadmin.

Optional login:

```env
SEED_LOGIN_EMAIL=you@example.com
SEED_LOGIN_PASSWORD=your_password
```

## Commands

Dry run (lists layouts that would be created):

```bash
npm run seed:layouts:dry-run
```

Seed all Simple slides layouts:

```bash
npm run seed:layouts
```

Update existing layouts (after catalog/preview changes):

```bash
npm run seed:layouts:update
```

Seed specific layouts:

```bash
node scripts/seed-presentation-templates.mjs --only title_centered_v1,statement_left_v1
```

## Files

| File | Purpose |
|------|---------|
| `src/utils/simpleSlidesCatalog.js` | 33 Simple slides v2 layout definitions |
| `src/utils/deckLayoutV2Helpers.js` | Shared slot/typography/shape builders |
| `src/utils/deckLayoutRegistry.js` | Registry re-export for previews + seed CLI |
| `scripts/seed-presentation-templates.mjs` | Idempotent Superadmin seed CLI |
| `scripts/export-seed-layouts.mjs` | Regenerate backend `seed-layouts.json` from catalog |
| `scripts/README-simple-slides-ai-mapping.md` | AI slide-number → layout conventions |

## UI verification

1. Superadmin → Templates → Deck Layouts: 33 active rows
2. PPT Builder → Add slide → Layouts → Simple slides gallery tab
3. Apply layout on a slide and confirm shapes + typography compile correctly
