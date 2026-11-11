# Presentation Export — Production Plan

**Scope:** PPT editor export to PPTX, PDF, PNG and JPEG.
**Repos:** `AthenaVI` (frontend) and `AthenaVI_backend` (backend).
**Status:** In progress. ✅ = done, 🟡 = partly done. Nothing has been checked on staging yet.

| Phase | What | Status |
|---|---|---|
| 0 | Baseline and measurement (test decks, fidelity harness) | ✅ Done · production failure data still to pull (0.1) |
| 1 | Hotfixes: Chrome and fonts in Docker, heartbeat, zip name, limit on exports running at once, save before export | ✅ Code done · staging check pending |
| 2 | Canva-style slide picker and image download options | ✅ Code done 2026-11-11: slide picker for every format, image size / quality / transparency, remembered choices, images made in the browser with server fallback, credits per download, F26–F29 · staging check pending |
| 3 | One renderer: PDF and images drawn by the editor's own page | ✅ Code done (except 3.4 and part of 3.8) · staging check pending |
| 4 | PPTX that matches the editor in PowerPoint and Google Slides | ✅ Code done (22 of 24; groups and the dialog report are optional), plus fixes F13–F21 from real decks · F22–F23 open · check in real PowerPoint / Google Slides pending |
| 5 | Fonts in PowerPoint | ✅ Code done 2026-11-06: fonts embedded in the PPTX, the font the editor drew, the editor's font rule, theme fonts · check in real PowerPoint (Windows / Mac) pending |
| 6 | Job queue, progress, cancel | Not started |
| 7 | QA, rollout, docs | Not started |

---

## 1. Goals

1. **PDF works in production**, every time, for decks of up to 40 slides.
2. **Canva-style download.** Pick any set of slides (all, the current one, or a custom selection) and download them as PNG or JPEG, at a chosen size. Several slides come as a .zip.
3. **What you export is what you see.** PDF and images look the same as the editor, pixel for pixel. The PPTX keeps the same layout, so text stays inside its boxes and nothing moves.
4. **PPTX opens properly in PowerPoint and in Google Slides.** Text stays editable. Anything PowerPoint or Google Slides cannot draw becomes a picture instead of disappearing or turning into a plain rectangle.
5. **Reliable jobs.** Exports run in a queue, show real progress, recover after a server restart, and always include the latest edits.

---

## 2. What is wrong today (findings)

The export code was read and checked by building a test PPTX and inspecting its XML. These are the causes behind "PDF doesn't work" and "the exported deck doesn't look like the editor".

### 2.1 PDF / PNG / JPEG fail in production

| # | Finding | Where |
|---|---------|-------|
| F1 | **Chrome is missing from the production image.** Puppeteer downloads Chrome into `/root/.cache/puppeteer` during `npm ci` in the **builder** stage. The runtime stage copies only `/app`, so Chrome isn't there. `resolveChromeExecutable()` then finds nothing and falls back to `channel: 'chrome'`, which isn't installed either. The Remotion headless shell installed by `ensure-remotion-browser.js` is not one of the paths it checks. | `AthenaVI_backend/Dockerfile`, `src/shared/utils/chromeExecutable.js` |
| F2 | **No fonts in the container.** Only `fontconfig` is installed: no Liberation, Noto or emoji fonts. Text falls back to whatever font exists, and emoji or non-Latin text shows as boxes. | `Dockerfile` |
| F3 | **PDF exports of large decks are reported as failed while still running.** The PDF path sends one heartbeat before rendering and none during it. `getExport` marks a job FAILED when it has had no heartbeat for 5 minutes. | `export.service.js` → `processExport`, `exportJobIsStale` |
| F4 | **Multi-slide PNG/JPEG downloads get the wrong file name.** The file is a .zip, but `getExport` names it from the format, so it downloads as `Deck.png` and won't open. | `export.service.js` → `getExport` |
| F5 | **Jobs run inside the web process** (`setImmediate`), with no limit on how many run at once. Each one starts its own Chrome, so several exports together can run out of memory. A restart or deploy loses every running job. | `export.service.js` → `queueExport` |

### 2.2 The PDF and images are not drawn by the editor's renderer

PDF, PNG and JPEG are drawn by a **separate HTML renderer**, `slideHtml.js`, not by the editor's `PptCanvasElement`. It is a much simpler copy, so it differs from the editor:

| Element | Editor | PDF / PNG today |
|---|---|---|
| Table | Styled table | Grey box with the word "table" |
| Chart | Bar, line, pie, donut, area… | Basic bars only, whatever the chart type |
| Shapes (about 65 kinds, drawn with `clipPath` polygons) | Triangles, stars, arrows, callouts… | All drawn as rectangles; `clipPath` is ignored |
| Text | Italic, underline, uppercase, lists, padding, vertical align, the theme font per role, text effects, curved text | None of these |
| Images | Masks, filters, edge fade, rounded corners, device frames | None of these |
| Fit-to-box text | Font shrinks until the text fits (see 2.4) | Full stored size, so text overflows |

### 2.3 PPTX: what PowerPoint and Google Slides receive

These were checked in the generated XML. The builder is `addElementsToPptxSlide` in `export.service.js`.

| # | Finding | Effect in PowerPoint / Google Slides |
|---|---------|------|
| P1 | Text boxes have no insets (`<a:bodyPr>` has no `lIns`/`tIns`…), so PowerPoint adds its default 0.1″ left/right and 0.05″ top/bottom margins. The editor uses 0. | Every text box is pushed in and wraps earlier, so headings break onto extra lines and overflow. |
| P2 | Fit-to-box font sizes are lost (see 2.4). | Generated slides overflow their boxes. |
| P3 | `listType` (bullets and numbers), `textTransform`, `underline`, `strikethrough`, `padding`/`paddingX`, run-level italic and size are not exported. | Lists become plain lines, uppercase headings show in mixed case, and spacing is off. |
| P4 | Gradient fills come out solid, because pptxgenjs has no gradient fill. This applies to shapes and to slide backgrounds. | Gradient backgrounds and cards are a flat colour. |
| P5 | Only about 10 shape kinds are mapped; the other ~55, including hexagon, octagon, callouts and banners, become `rect`. `clipPath` is ignored. | Shapes turn into rectangles. |
| P6 | Images ignore `imageMask`, `filter`/`cssFilter`, `edgeFade`, `borderRadius`, `opacity`, `clipPath` and `deviceFrame`. | Circular avatars become squares, and filtered or faded photos show unedited. |
| P7 | Tables have no header or cell fills, no column widths, a fixed 12pt font, and borders only on top. | Tables look unstyled and don't match the editor. |
| P8 | Charts have no legend, data labels, axis or label styling, or donut hole size. | Charts look different from the editor. |
| P9 | Text effects (shadow, outline, glow, curved text) are not exported. Element effects export only as a PowerPoint shadow. | Styled headings come out plain. |
| P10 | Theme fonts (Google Fonts) are named but not embedded. PowerPoint on a machine without the font swaps in another one. | Different line widths, so text wraps differently and overflows. |
| P11 | Embeds export as a grey card with the link as text. | Looks broken. |

### 2.4 Fit-to-box text (the biggest single cause of "not well structured")

On generated slides (elements with a `slotId`), `PptCanvasElement` shrinks the font while the slide is on screen, down to 45% of the stored size, until the text fits its box. The shrunken size is **never saved**: `content.fontSize` keeps the original. Every export reads `content.fontSize`, so **PPTX, PDF and images all draw text bigger than the editor**, and it spills over neighbouring elements.

Code: `PptCanvasElement.jsx`, the `fitToBox` layout effect. The backend has an estimate (`textFit.util.js` → `fitFontSize`), but it guesses character widths and doesn't match the browser.

### 2.5 Export flow gaps (frontend)

| # | Finding | Where |
|---|---------|-------|
| U1 | Export doesn't save pending edits first. `flushPendingCanvasSaves` exists and is used before Publish, but not before Export, so the last few seconds of edits can be missing from the file. | `AIPptEditor.jsx` (export opens at about lines 2366, 4676, 4845) |
| U2 | You can export one slide or the whole deck, nothing in between. The API accepts a single `slideId`, and the modal always sends `null`. | `ExportPresentationModal.jsx`, `presentation.validations.js` → `exportDeckSchema` |
| U3 | There are no size or quality options for images. They always come out at 1× canvas size, and JPEG at quality 82. | `renderSlideScreenshots` |
| U4 | The progress bar is a spinner with text; there is no percentage and no cancel. | `ExportPresentationModal.jsx` |

---

## 3. Approach (decisions)

### D1. One renderer for PDF and images: the editor's own

Stop maintaining `slideHtml.js` as a second renderer. Add an **export render page** to the frontend, built by Vite as a static page (for example `/export-render.html`), that draws slides with the **same `PptCanvasElement`** the editor uses.

- The backend's Puppeteer opens that page and **injects the deck JSON**, with media URLs presigned by the backend, through `page.evaluate`. The page makes **no API calls and needs no login**.
- The page reports when it is ready: fonts loaded, images decoded, and fit-to-box finished.
- **PDF:** `page.pdf()` on the real renderer. The output keeps vector text that you can select and search, and links stay clickable.
- **PNG/JPEG:** `page.screenshot()` per slide, with `deviceScaleFactor` set from the chosen size (1×, 2× or 3×).
- **PPTX measurement:** the same page returns the size and position of every element as drawn (see D2).

The page could be served by the backend instead, as a frontend bundle copied there at build time. Loading it from the frontend URL keeps one source of truth. The backend reads the address from `EXPORT_RENDER_URL` and checks a `renderer version` value so a version mismatch is caught.

### D2. PPTX = native where PowerPoint and Google Slides both draw it correctly, picture otherwise

- **Text is always native and editable.** Its font size comes from the renderer's measurement (the fitted size), not from `content.fontSize`.
- **Shapes:** a PowerPoint preset where one exists; otherwise custom geometry built from the `clipPath` polygon.
- **Gradients:** native `gradFill`, added to the XML after pptxgenjs writes it (P4).
- **Anything that can't be native in both apps becomes a PNG** cut from the renderer at 2×, at the exact position and size, behind or in front of text as it is in the editor. This covers curved text, image filters and masks, edge fade, device frames, glitch, blur and outline effects, and embeds (the thumbnail plus a hyperlink).
- The rule is written once, as a table in code: element feature → `native` | `native+xml-patch` | `raster`. That way it can be tested.

### D3. Image download is instant on the client, with the server as fallback

The Canvas editor already exports pages in the browser: `canvasExportCapture.js` (html-to-image) with page range, scale and zip. Reuse that for PPT image export. It is instant, costs no server time, and is drawn by the editor itself. When an image is blocked by CORS (a tainted canvas), fall back to the server job from D1 for those slides.

### D4. Exports run as queued jobs

Move exports to a **BullMQ queue on the existing Redis**, run by a worker that keeps one browser open and limits how many exports run at once. Jobs survive restarts and report progress as a percentage.

---

## 4. Phases and checkpoints

Each phase ends with a **checkpoint**: what must be true before moving on. Sizes are relative: S = up to 2 days, M = 3–5 days, L = 1–2 weeks.

---

### Phase 0: Baseline and measurement (S) — done 2026-11-05 (0.1 still needs a production run)

The goal is to see the real production error and to have decks and a harness that measure fidelity before any change.

- [ ] **0.1** Pull the `error` column of recent FAILED rows from the exports table in production, plus the matching `processExport failed` log lines. Confirm F1 (Chrome not found) or record the real error. *(script ready: `npm run eval:export-failures -- --days 30`, run it inside the production container. On the **development** database it shows **5 of 5 PDF exports failed with `Navigation timeout of 60000 ms exceeded`** and 2 of 2 PPTX succeeded: see F8 below.)*
- [x] **0.2** Build a set of **golden decks** as JSON fixtures in `AthenaVI_backend/src/modules/presentation/test/fixtures/export/`: *(done: `npm run eval:golden-decks` builds them; 6 decks, 83 slides, about 1,200 elements. The AI decks are 30 real seed layouts compiled the way generation does, with three themes. The kitchen sink covers all 70 library shapes (filled and outlined), every mask, filter, element effect, text effect and chart type, a table, a group, an embed, a background photo and a gradient background. Pictures are S3 keys served from `fixtures/export/assets`, plus one external URL. `goldenDecks.test.js` keeps them valid.)*
  - 3 AI-generated decks covering the different layout families (title, cards, timeline, comparison, chart, gallery, quote);
  - 1 "kitchen sink" user deck: every element type, every shape kind, every text style (lists, uppercase, underline, runs, links), image masks, filters and crops, a table with a header, each chart type, gradients, element effects and text effects, a group, and an embed;
  - one 4:3 deck;
  - one deck with 40 slides.
- [x] **0.3** Build a **fidelity harness** by extending `scripts/presentation-eval/export-fidelity.js`. For each golden deck: *(done: `npm run eval:presentation-export`. The reference is the render page. The score is SSIM (structural similarity, 0–1) at 480px, in grayscale, blurred by σ 1. The PDF rasterizer is `pdftoppm`, or Python `pypdfium2`. `--backend <checkout>` measures older code, `--legacy` measures the fallback renderer, and `--compare <scores.json>` shows the change against an earlier run. Output goes to `.eval/export-fidelity/<label>/report.html`. The old smoke script is now `export-smoke.js`.)*
  1. Render the editor reference PNGs (the export render page once it exists; until then, the editor through Puppeteer).
  2. Export PDF → rasterize → compare with the reference.
  3. Export PPTX → convert to PNG with LibreOffice (`soffice --headless --convert-to pdf`, then `pdftoppm`) → compare.
  4. Write an HTML report with the three images side by side and a similarity score per slide.
- [x] **0.4** Record the baseline scores in this document (section 7). *(done: before Phase 1, commit `362af52`, compared with the current code. Both score files are kept in `scripts/presentation-eval/baselines/`.)*

**Found while doing Phase 0 (all fixed):**
- **F8, the real reason PDF export failed:** the old renderer waited for `networkidle0`, which can hang with nothing left loading. Every golden deck's PDF timed out on the old code; so did every PDF export in the dev database. The render page doesn't wait that way, and the fallback renderer now waits for the page's `load` event, fonts and images instead (`setContentAndSettle`). The fallback produces a PDF in about 6 s, at fidelity 0.84–0.90.
- **F9:** outlined shapes (a transparent fill with a stroke) were exported to PPTX as **solid black** shapes. They now have no fill.
- **F10:** inline SVG graphics shared ids across slides (for example two slides with the same layout). A card background disappeared from a PPTX picture when the other copy's slide was hidden. Ids are now unique per element (`scopeSvgIds`); this also protects the editor.
- **F11:** PPTX rasterized full-slide graphics at 3840 × 2160, about 25 s each. They are capped at 2048 px, which makes PPTX builds about 6× faster (40 slides: about 90 s → 13 s).
- `imageMask` is stored as `{ type }`; the PPTX picture rule now reads it that way.

**Checkpoint 0**
- [ ] The production failure cause is known and recorded. *(in dev: F8, the networkidle0 timeout; in the Docker image, F1 by reading the code. Confirm with the 0.1 script in production.)*
- [x] The golden decks and the harness run locally with one command, and the baseline report exists.

---

### Phase 1: Hotfixes that make export work in production (S–M) — code done 2026-11-05, staging check pending

Small, safe fixes that ship immediately, before the larger rework.

**Found while doing this phase (all fixed in Phase 1):**
- **F1 had two more causes.** Puppeteer 25's `executablePath()` returns a *Promise*, so the old `resolveChromeExecutable()` never found Puppeteer's Chrome anywhere. It only worked locally because desktop Chrome was installed. Puppeteer 25 also requires **Node ≥ 22.12**, but the image was Node 20.
- **F6: multi-slide PNG/JPEG export never worked.** With Puppeteer 25, a second `page.setContent(…, networkidle0)` on the same page never settles. Every slide after the first timed out (180s each) and was **silently left out** of the zip. If all slides failed, an empty zip was marked READY.
- **F7: stock / external images were broken in exports.** `enrichDeckMediaKeysForExport` read *any* image URL's path as an S3 key. PPTX then drew a grey "image" box for every Pexels/Unsplash/external photo, and PDF/PNG showed a broken image.

**Backend**
- [x] **1.1 Chrome in the image (F1).**
  - New `src/shared/utils/exportBrowser.js` (replaces `chromeExecutable.js`): awaits Puppeteer's path and prefers **chrome-headless-shell** (fewest system libraries, never opens a window). It never falls back to `channel: 'chrome'`.
  - **Dockerfile:** `node:22-bookworm-slim`, `PUPPETEER_CACHE_DIR=/app/.cache/puppeteer` (so the browser is copied to the runtime stage), only the headless shell is downloaded, and **the build fails** if the browser can't start (`scripts/check-export-browser.js`).
  - On boot the server launches the browser once and logs `export_browser_ready` or `export_browser_unavailable`. **`GET /health/export`** reports the result and the export queue; it never launches a browser per request.
- [x] **1.2 Fonts (F2).** Added `fonts-liberation fonts-noto-core fonts-noto-cjk fonts-noto-color-emoji` and ran `fc-cache -f`.
- [x] **1.3 Heartbeat (F3).** Every export (all formats) beats every 20s while it renders (`PPT_EXPORT_HEARTBEAT_INTERVAL_MS`), and also while it waits for a browser slot. A waiting job is judged stale by its last beat. The whole-deck PDF timeout grows with the deck size (8s per slide, capped at 15 minutes).
- [x] **1.4 Zip file name (F4).** The download name comes from the stored file's extension (`Deck.zip`). Files inside are named by page number in the deck, as Canva does: `1.png`, `3.png` (changed from `<Deck>-slide-03.png` on 2026-11-11).
- [x] **F6 fix.** A fresh page per slide. A slide that fails now **fails the export** (it stops at the first failure) instead of producing a partial or empty zip.
- [x] **F7 fix.** `s3UrlKey()` gives a key only for S3 URLs; external images keep their own URL, and the hero image is used only for elements with no picture. Image fetches fall back to the URL when the S3 read fails.
- [x] **1.5 Limit concurrent exports (F5).** At most 2 PDF/PNG/JPEG exports per instance (`PPT_EXPORT_MAX_CONCURRENT_BROWSER`); the rest wait as QUEUED. PPTX isn't limited because it doesn't use the browser.
- [x] **1.6 Clearer failure messages.** `normalizeExportError()` maps errors to plain messages: browser missing, timeout, crash, memory, storage, or generic. Our own 4xx messages pass through. The full error and stack go to the log as `presentation_export_failed`.

**Frontend**
- [x] **1.7 Save before export (U1).** The dialog shows "Saving your latest changes…" and only then starts the export:
  - element edits still waiting on their debounce are cancelled, and those slides get a full canvas save instead;
  - writes already in flight are awaited (`presentationService.waitForPendingWrites()`);
  - queued slide changes are awaited;
  - slides edited in this session are saved (not every slide).

  If the save fails, the export doesn't start and the dialog says why.

**Tests**
- [x] Unit/integration (`test/exportJobs.test.js`, 13 tests; `presignSlideMedia.test.js` +3), real headless browser with the DB/S3 stubbed. They cover:
  - the semaphore and the heartbeat;
  - file names;
  - error messages;
  - stale detection;
  - a 3-slide PNG zip (names, order, `Deck.zip`);
  - a single-slide PNG;
  - a 3-page PDF with heartbeats during the render;
  - the 2-at-once cap with the others waiting;
  - the stock photo in PPTX (this test fails on the old code);
  - a hanging slide failing the export;
  - a failure freeing its slot.
- [x] Browser test of the editor (10 checks):
  - an edit is saved before the export request, and the export waits for the save;
  - the nudged position is the one saved;
  - only the edited slide is saved;
  - a failed save blocks the export with a message;
  - an in-flight element save is awaited.
- [ ] Docker: build the image, run a PDF export of a golden deck inside the container, and open the PDF. *(Docker isn't available on the dev machine; do this in CI/staging.)*

**Checkpoint 1**
- [ ] PDF, PNG and JPEG exports succeed on staging, for one slide and for the 40-slide deck. *(Check `GET /health/export` → `"status":"UP"` first.)*
- [ ] A multi-slide image export downloads as a working `.zip`. *(Passes locally; confirm on staging.)*
- [ ] An edit made one second before clicking Export appears in the exported file. *(Passes in the browser test; confirm on staging.)*

---

### Phase 2: Canva-style slide selection and image download (M) — code done 2026-11-11, staging check pending

**What changed for users:** the Export dialog has a **Slides** choice for every format: **All slides**, **Current slide**, or **Select slides**. Select slides shows a grid of thumbnails with a checkbox on each, Select all, Clear, shift-click for a range, and a "3 of 12 slides" count. PNG and JPEG also get a **size** (1×, 2× or 3×, shown in pixels), a **JPEG quality** slider (60–100, default 90) and a **transparent background** option for PNG. The dialog remembers the last choices for each deck. Slide images are made **in the browser** when it can, with a "Drawing slide 3 of 8" progress bar. Otherwise the server makes them, with the same result.

**UX: the Export dialog**
- [x] **2.1** Slide picker for every format: All slides · Current slide · Select slides. *(done: `ExportSlidePicker.jsx`. Thumbnails are drawn by the export renderer itself (`ExportSlide`), so they show what the file will contain; each is drawn when it scrolls into view. "Current slide" appears only where there is one: the selected slide in the editor, the slide on screen in My Work. Opening "Select slides" with nothing ticked starts from the current slide. With nothing ticked, Export is disabled.)*
- [x] **2.2** Image options: format, size 1× / 2× / 3× with the pixel size, JPEG quality, PNG transparent background. *(done; transparent leaves the slide background out, elements keep their own fills)*
- [x] **2.3** Downloads: one slide → a single image; several → `<Deck name>.zip`. *(done, with Canva's names (2026-11-11): one page downloads as `<Deck>.png`; several come as `<Deck>.zip` holding `1.png`, `3.png`…, named by page number in the deck. The server and the browser name them the same way.)*
- [x] **2.4** Remember the last format, size, quality, transparency, scope and selection per deck. *(done: `localStorage` key `athena.pptExport.<deckId>`, read and written inside try/catch, cleaned up on load; slides no longer in the deck are dropped)*

**Client-side capture (D3)**
- [x] **2.5** Shared export helpers in `src/utils/export/`. *(done: `zip.js` (zip writer, plus a reader), `capture.js` (image probe, wait for images, data URL to Blob), `slideSelection.js` (selection, range select, file names, pixel size, saved choices). The Canvas editor now imports them from there.)*
- [x] **2.6** Draw the chosen slides off-screen and capture each one, with progress per slide. *(done: `src/export-render/browserSlideCapture.jsx`. Each slide is drawn by `ExportSlide`, the component the server's render page uses (moved out of `ExportRenderApp` into `ExportSlide.jsx` + `exportDeck.js`). The page waits with the render page's own `settleExportPage`, then html-to-image draws it. The deck is fetched fresh after the save, so it is the same deck the server would export.)*
- [x] **2.7** Blocked pictures fall back to the server. *(done differently: if any picture on any chosen slide can't be read (CORS) or didn't load, the **whole selection** is exported on the server, not just those slides. This gives one file and one charge, and doesn't depend on reading the server's file from S3 in the browser to merge it. Very large image exports also go to the server: slide count × scale² above 40 (a 40-slide deck at 1×, 10 slides at 2×, 4 at 3×) to keep browser memory bounded. Any other browser error falls back to the server too; only "no credits", 401, 403 and 404 stop the export.)*

**Backend**
- [x] **2.8** `slideIds: string[]` in `exportDeckSchema` (1 to 40, no repeats); `slideId` still works. PPTX, PDF (render page and fallback renderer) and PNG/JPEG keep deck order. *(done: `selectExportSlides` in `export.service.js`; an id not in the deck is a 404 before anything is queued)*
- [x] **2.9** `scale` (1–3), `quality` (60–100) and `transparent` for PNG/JPEG. *(done: render page `deviceScaleFactor` and `omitBackground`; the page leaves slide backgrounds out (renderer version 2). The fallback renderer honours scale and quality; it ignores transparent.)*
- [x] **2.10** Credits (Q1). *(decided: the same flat export fee as a server export, charged once per download. `POST /presentations/:id/export/browser` with `{ format, slideIds, downloadId }`; the idempotency key is `ppt:export:browser:<deckId>:<downloadId>`. It checks the slides exist and that the workspace can afford it. When the export falls back to the server, only the server job charges.)*

**Tests**
- [x] Unit tests: selection (all / current / chosen, deck order, every slide = whole deck), shift-click ranges, file names, pixel sizes, the memory budget, saved choices (bad values, blocked storage, broken JSON), zip round trip. *(`src/utils/export/slideSelection.test.mjs`, 13 tests)*
- [x] Backend tests: `slideIds` / `scale` / `quality` / `transparent` validation, the browser charge schema, selection order, option clamping, a 404 for an unknown slide, the browser charge (idempotency key, refused when it can't be afforded, PNG/JPEG only), and real renders: slides 2, 4 and 5 at 2× (3 files, 1920 × 1080 from a 960 × 540 canvas, named by position), JPEG quality, PDF and PPTX with a subset. *(`test/exportSelection.test.js` 6 tests, `test/exportValidation.test.js` +3)*
- [x] Browser test of the dialog (Puppeteer, port 5199, a real deck, API stubbed): 15 checks. They cover the pixel size label; Current slide; the picker starting from it; shift-click range; toggle; Clear disabling Export; save before export; one charge for the right slides; no server job; the downloaded `.zip` and its file names; 1920 × 1080 PNGs; and the remembered choices.
- [x] Options on a real deck, server and browser: 2× → 3840 × 2160, transparent PNG (corner alpha 0, content kept), JPEG quality, PDF and PPTX subsets.

**Dialog redesign (2026-11-11):** the Export dialog keeps **one size (600 × 680) in every state**: choosing, picking pages (list or grid), working and done. Before, it widened when pages were picked and its height followed the content. The layout follows Canva's download panel:
- **File type:** four cards (PowerPoint, PDF, PNG, JPG), each with a coloured file icon.
- **Options:** only the chosen format's own, such as image sizes with their pixels, a quality slider, or a transparent-background switch.
- **Pages:** All pages / Current page / Choose pages. Choose pages opens the picker in place (list with thumbnails, or grid; a page box like "1-3, 5"; shift-click ranges) and scrolls it into view.
- **Footer:** says what the download will be ("2 .png images in a .zip · 1920 × 1080").
- **Phones:** the dialog fills the screen with two file types per row.
- **Titles:** long slide titles end at a word with "…".

The browser test of the dialog has 27 checks, including the size in every state, Canva file names on real downloads, and phone width.

**Found while doing Phase 2 (all fixed):**
- **F26: fit-to-box text could be sized for the fallback font, in the editor and in exports.** `PptCanvasElement` refits once on `document.fonts.ready`. When a font's stylesheet arrives after the slide first draws, that promise has nothing to wait for, so the text keeps the size computed with the fallback font. It now also refits on the `loadingdone` font event. On a fresh page (every server export) a heading drew at 9.9px where the loaded font gives 11.9px.
- **F27: html-to-image rounds every font size down and subtracts 0.1px** when it copies styles (40.32px → 39.9px), which undoes fit-to-box and re-wraps text. The browser capture records each element's exact size and puts it back in the SVG before drawing (`drawNode`).
- **F28: html-to-image's own font embedding** left out families named in a font stack (a Nunito heading drew in a fallback) and embedded every weight and language subset of others (about 4 MB per slide). `fontEmbed.js` embeds only the families, weights and character subsets a slide draws, and downloads each font file once per export.
- **F29:** the browser capture lost the deck's font stylesheet (`fontCssUrl`, weights up to 800), so headings drew in the 700 face. It now uses the same stylesheet as the editor.
- **S3 CORS (deploy note):** the browser can only read pictures from origins listed in the bucket's CORS rules. The dev bucket lists the production and render sites plus `http://localhost:9000`, but not `localhost:5173`, so in local development image exports always fall back to the server. **Keep every app origin in the production bucket's CORS (GET)**, or every image export will run on the server.

**Measured (2026-11-11, dev build, 3 real decks, 22 slides):** browser images against the server's render page: SSIM **0.985–1.000** on every slide. Speed in the dev build: 2–7 s per slide (waiting for pictures and fonts, then drawing), about the same as the server job, but with no queue, no server load and a real progress bar. All formats on the 3 decks still pass (PPTX for both targets, PDF, PNG/JPEG zips, single slides).

**Checkpoint 2**
- [ ] Any set of slides downloads as PNG or JPEG at 1×, 2× or 3× from both the editor and My Work. *(done in code and in the browser test with a stubbed API; confirm signed in on staging)*
- [x] The downloaded images match the editor (harness score ≥ 0.98 per slide). *(0.985–1.000 against the render page on 22 real slides)*
- [x] PDF and PPTX respect the same slide selection.
- [ ] On staging: a browser image export from the production origin doesn't fall back (S3 CORS allows it), and a fallback export charges once.

---

### Phase 3: One renderer for PDF and server-side images (M–L) — code done 2026-11-05, staging check pending

**Done:**
- **The page.** `export-render.html` → `src/export-render/` draws slides like Present does:
  - on the 900px editor stage, with `resolveStageElements` and `PptCanvasElement`;
  - with the editor's palette (`resolveThemeVisual`, moved to `utils/pptThemeVisual.js`), theme fonts and slide normalisation.

  It waits for stylesheets, fonts, images (`<img>`, SVG `<image>`, CSS backgrounds) and for fit-to-box sizes to stop changing. It exposes `render`, `measure` (fitted size and drawn colour), and `isolate` / `release` (for PPTX pictures). Vite builds it as a second page.
- **Backend** (`exportRenderer.service.js`):
  - the page URL is `EXPORT_RENDER_URL`, else `${FRONTEND_URL}/export-render.html`;
  - requests are filtered (scripts and API calls only from the page's own origin, no frames, no cloud metadata);
  - the page's version is checked.

  PDF is `page.pdf()`: vector text, one 13.333 × 7.5in page per slide. PNG/JPEG are exact 1920 × 1080 clips.
- **Fallback:** if the page can't be reached, export logs `export_renderer_unavailable` and uses the old `slideHtml.js` renderer. `PPT_EXPORT_RENDERER=legacy` forces that.
- **Also fixed:** the image zip had every CRC32 set to 0. Strict unzip tools reject that.

**Deploy order:** frontend first (it ships `export-render.html`), then backend. The backend uses `FRONTEND_URL`, so no new env var is needed unless the page lives elsewhere.

**Frontend**
- [x] **3.1** Add a Vite entry for `export-render.html` → `src/export-render/main.jsx`. It: *(done: `export-render.html` + `src/export-render/`)*
  - exposes `window.__athenaExport.render(deck, { slideIds, scale })`;
  - draws every slide at its canvas size with `PptCanvasElement` (no editing UI, no API calls);
  - sets the theme font CSS variables and loads the theme's Google Fonts;
  - waits for `document.fonts.ready`, image decodes, and fit-to-box to settle (two quiet animation frames), then sets `window.__athenaExport.ready = true`.
- [x] **3.2** Add `window.__athenaExport.measure()`, which returns, for every element on every slide: *(done: fitted size, overflow and the drawn colour; drawn box and line count are not needed yet)*
  - its drawn box;
  - **the fitted font size**;
  - the line count;
  - whether the text overflows.

  PPTX uses this in Phase 4.
- [x] **3.3** Add `window.__athenaExport.snapshot(elementId, scale)`, which returns a transparent PNG of a single element, for PPTX's picture fallback. *(done as `isolate()` / `release()` on the page + a screenshot from the backend)*
- [ ] **3.4** The page has a strict CSP: scripts only from its own origin; images only from the S3/CDN and data:; fonts only from Google Fonts. *(to do: requests are already filtered by the backend (3.5); a CSP on the page itself is not added yet)*

**Backend**
- [x] **3.5** Add `exportRenderer.service.js`. It opens `EXPORT_RENDER_URL`, injects the deck with presigned media, and waits for `ready` (with a timeout). It also uses request interception to allow only the frontend origin, S3/CDN media and Google Fonts. *(done: `exportRenderer.service.js`; URL from `EXPORT_RENDER_URL`, else `FRONTEND_URL`)*
- [x] **3.6** PDF = `page.pdf()` from the render page. PNG/JPEG = a screenshot per slide (`clip` set to the slide, `deviceScaleFactor` = scale). *(done: PDF is vector, one 13.333 × 7.5in page per slide; images are exactly 1920 × 1080)*
- [x] **3.7** Keep `slideHtml.js` only for legacy slides that have no elements, and as an emergency fallback behind an env flag (`PPT_EXPORT_RENDERER=legacy`). Remove its element renderer once Phase 3 is stable. *(done: automatic fallback when the page can't be reached, and `PPT_EXPORT_RENDERER=legacy`; removing the old element renderer comes later)*
- [ ] **3.8** Versioning: the render page reports `rendererVersion`. The backend logs it with each export and refuses to run against a version below the minimum it supports. *(partly: an older page is refused; the version isn't logged with each export yet)*

**Tests**
- [ ] Every golden deck → PDF → rasterize → compared with the editor reference: score ≥ 0.98 per slide. *(partly: every deck's average is ≥ 0.984, but 11 of 83 slides score 0.962–0.979, mostly thin outlines and photo edges; see section 7)*
- [ ] The PDF has selectable text (`pdftotext` returns the slide text) and clickable links. *(selectable text checked by hand; links not checked yet)*
- [ ] Tables, every chart type, all shapes, masks, filters, text effects and element effects appear in the PDF (by visual diff). *(checked by hand on a test deck and 4 real layouts: tables, bar and donut charts, hexagon, star, gradient, shadow; not every chart type yet)*
- [ ] A 40-slide PDF finishes in under 3 minutes on staging. *(staging)*

**Checkpoint 3**
- [ ] PDF and server-side images are drawn by the editor's renderer. *(done in code; confirm on staging)*
- [ ] Every golden deck passes the visual diff threshold. *(averages pass; 11 of 83 slides are between 0.962 and 0.979)*
- [x] `PPT_EXPORT_RENDERER=legacy` still works as a rollback. *(covered by `exportRenderer.test.js`)*

---

### Phase 4: PPTX fidelity for PowerPoint and Google Slides (L) — done 2026-11-06 (except optional 4.22; real PowerPoint / Google Slides check pending)

Work through the table in section 5 one row at a time. Each row gets a unit test that checks the XML, and a slide in the kitchen-sink golden deck.

**Done (`pptxText.js`, `pptxCapability.js`, `exportRenderer.capturePptxAssets`):**
- **4A text:**
  - zero insets (or the element's padding);
  - the **fitted font size and drawn colour measured on the render page**;
  - exact CSS line height;
  - bullet / numbered / check / dash lists;
  - uppercase / lowercase / capitalise;
  - underline, strike and italic, also per run;
  - letter spacing (px or em);
  - links;
  - no autofit.
- **4G pictures:** anything PowerPoint can't draw natively is captured from the render page as a transparent PNG (1.5× resolution), at its exact box and layer, including shadows. This covers:
  - clip-path shapes and gradient fills;
  - device frames and dashed borders;
  - image masks, filters, rounded corners and edge fade;
  - empty image slots (the editor's placeholder artwork);
  - curved / effect / gradient text;
  - icons, graphics and embeds;
  - non-native effects.

  Image and gradient slide backgrounds are captured as JPEG. Text, plain shapes, photos, charts and tables stay native.
- **Fixed:** pptxgenjs ignores `addSlide({ background })`, so **every slide's background colour was dropped** (all slides came out white). It is now set with `slide.background`.
- Native chart labels and gridlines are readable on dark slides.
- If the capture fails, PPTX still builds with stored sizes and native shapes only.

**Done 2026-11-06 (`pptxChart.js`, `pptxTable.js`, `pptxShapes.js`, `pptxXmlPatches.js`):**
- **Charts** are native and drawn the editor's way: first series, the editor's colour choice (vivid theme colours, else its palette), value labels, no value axis, dashed gridlines, a smooth line, a legend and slice percentages on donuts, and KPI as text. If a chart can't be built, the picture captured from the render page is used, never a grey box.
- **Tables** are native, rebuilt from the render page's measurement of the drawn table: the card, column widths, row heights, fills, ink, fonts, padding and borders.
- **Shapes:** library shapes cut with a `polygon()` clip-path (46 of 70) are native **custom geometry**, so they stay editable shapes. Dashed and dotted borders are native, and stroke widths are converted from stage px to points.
- **Gradients** on shapes, text and slide backgrounds are native `<a:gradFill>`, added to the XML after pptxgenjs writes it. Element glow and neon are native `<a:glow>`. Text shadow, lift, outline, hollow, neon and highlight are native too. Every patched file passes the OOXML schema validator.
- **The export dialog** asks what a PPTX is made for, **PowerPoint or Google Slides** (Q2). For Google Slides, gradients, glow text and hollow text are pictures, because Slides can't show them.
- **Also:** element opacity applies to text, shapes and images. Photo crops are native `srcRect`, so they can be re-cropped. Embeds are a picture that links to the video or page. Text drawn as a picture is copied into the speaker notes. A `pptx_export_report` log line counts native objects and pictures by reason.

**4A. Layout and text (fixes P1, P2, P3)**
- [x] **4.1** Set explicit insets from `padding`/`paddingX` (default 0) on every text box: `margin: [t, r, b, l]` in pptxgenjs, written to `bodyPr` as `lIns`/`tIns`/`rIns`/`bIns`.
- [x] **4.2** Font size = the **fitted size from the render page measurement** (Phase 3.2). When there is no measurement, fall back to the backend's `textFit.util` estimate. Set `autoFit` off (`<a:noAutofit/>`) so PowerPoint doesn't resize the text again. *(done; without a measurement the stored size is used, not the `textFit.util` estimate)*
- [x] **4.3** Line height: use `lineSpacingMultiple` (a percentage) instead of exact points, so the spacing holds when PowerPoint uses a different font. *(done differently: exact spacing (`lineSpacing` in points), which matches CSS line-height exactly)*
- [x] **4.4** Lists: each line in a `listType` text box becomes its own paragraph, with `bullet: true` or `bullet: { type: 'number' }`, and an indent matching the editor's marker. *(done: bullet, numbered, check, dash and star lists)*
- [x] **4.5** `textTransform: uppercase/lowercase/capitalize`: uppercase uses the native `cap="all"` (it stays editable); the others are applied to the text itself. *(done differently: applied to the text itself; pptxgenjs has no `cap="all"` option)*
- [x] **4.6** Underline, strikethrough, italic, `fontWeight` and size **for each run**, plus `letterSpacing` and `align: justify`. *(done, except a separate font size per run)*
- [x] **4.7** Vertical alignment and the `nowrap` setting are kept. The text box height comes from the measured box, not the stored placement, when they differ. *(done: vertical alignment and nowrap are kept; the stored box height is right because PowerPoint, like the editor, doesn't clip text that runs past its box, so no measured height is needed)*
- [x] **4.8** Text gradient fill: native `gradFill` on the run (XML patch). Google Slides shows the first colour; that is acceptable. *(done: native gradient text (patch); a picture for Google Slides)*

**4B. Shapes (fixes P4, P5)**
- [x] **4.9** Map every `SHAPE_LIBRARY` id (`src/constants/shapeLibrary.js`) in one table: PowerPoint preset where it matches (triangle, rtTriangle, hexagon, octagon, pentagon, parallelogram, trapezoid, star4/5/6/8, chevron, rightArrow, leftRightArrow, wedgeRectCallout, cloudCallout, plus, donut, arc, blockArc…). Everything else → **custom geometry** from the `clipPath` polygon (pptxgenjs custGeom `points`; check this on 4.0.1). *(done: polygon clip-paths become custom geometry (46 of 70 library shapes); the rest of the library (curved outlines such as semicircle, leaf, banner-wavy) stays pictures)*
- [x] **4.10** Gradients: write a JSZip post-processing step (`pptxXmlPatches.js`) that swaps the `solidFill` for `gradFill` (stops, angle, linear or radial) on elements tagged during the build. It also covers gradient slide backgrounds and text gradients. *(done: `pptxXmlPatches.js` for shape, text and background gradients, linear and radial, with the CSS angle converted)*
- [x] **4.11** Stroke dash styles (`borderStyle`: dashed, dotted), stroke transparency, and line shapes with arrowheads (`line-arrow`). *(done: dashed and dotted borders, stroke transparency, stroke widths in points; arrowhead line shapes stay pictures)*
- [x] **4.12** Element opacity → `transparency` on shapes **and** images. *(done for text, shapes and images)*

**4C. Images (fixes P6)**
- [x] **4.13** Circle and rounded masks → native picture geometry (`ellipse` / `roundRect`) where possible. Any other mask, filters, edge fade or device frame → bake into the PNG with sharp (or use the render page's element snapshot) and place it at the exact box. *(done as pictures from the render page (masks, filters, rounded corners, edge fade, device frames); native picture geometry not used)*
- [x] **4.14** Keep native cropping for plain crops (`srcRect`) so the user can re-crop in PowerPoint. *(done: the whole photo is embedded with a native srcRect crop)*
- [x] **4.15** `useAsBackground` images → the slide background image. *(done: slide background images and gradients are captured as the slide background)*

**4D. Tables (fixes P7)**
- [x] **4.16** Column widths, row heights, header fill and text colour, cell fills, borders on every side in the editor's colours, the theme fonts, the editor's font size, padding and alignment. *(done: built from the render page measurement (`measureTables`), falling back to the editor's CSS defaults)*

**4E. Charts (fixes P8)**
- [x] **4.17** For each chart type, match the editor: legend on or off and its position, data labels, axis label colour and font, gridlines, donut hole size, the series colours, and the number format. *(done: `pptxChart.js` follows the editor's PptChartRenderer. Note the editor bug F12 below)*
- [x] **4.18** A chart that can't be built natively → a picture from the render page, never an empty "Chart" box. *(done: charts are always captured, and the picture is used only if the native chart fails)*

**4F. Effects, embeds and groups (fixes P9, P11)**
- [x] **4.19** Text effects: shadow → `<a:outerShdw>` on the text, outline → `<a:ln>` on the run, glow → `<a:glow>` (XML patch). Curved, glitch and other complex text effects → a picture, with the plain text added to the speaker notes so it isn't lost. (See open question Q3.) *(done: shadow, lift, outline, hollow, neon and highlight are native; splice, echo, glitch and curved text are pictures, with their text kept in the notes)*
- [x] **4.20** Element effects: add `<a:glow>` (PowerPoint has a real glow) and `<a:softEdge>` for blur. Keep the shadow mapping from the effects work. Outline and glitch → picture. *(done: native glow for glow and neon; outline, glitch and blur are pictures)*
- [x] **4.21** Embeds and video → the thumbnail image plus a hyperlink to the URL, with a small play badge for video. *(done: the embed card is a picture that links to the URL)*
- [ ] **4.22** Groups → native PowerPoint groups (`grpSp`, XML patch), so they move together in PowerPoint. Optional; do it only if time allows. *(optional, not done: groups export as separate objects, which looks the same)*

**4G. Fallback layer**
- [x] **4.23** In `pptxCapability.js`, decide for each element whether it is `native`, `native+patch` or `raster`, based on its features. Raster elements are cut from the render page (Phase 3.3) at 2× and placed at their exact box and layer. *(done: `pptxCapability.js`, captured at 1.5×; empty image slots and icons are included too)*
- [ ] **4.24** Add an export report (logged, and optionally shown in the dialog): "3 elements were exported as pictures because PowerPoint can't draw them." *(partly: a `pptx_export_report` log line counts native objects and pictures by reason; not shown in the dialog)*

**Tests**
- [x] For each mapping: a unit test on the XML (`lIns="0"`, `gradFill`, `prstGeom prst="hexagon"`, `custGeom`, `buChar`, `cap="all"`, table `tcPr` fills, chart legend…). *(`pptxNative.test.js`, `pptxText.test.js`, `pptxCapability.test.js`, `exportRenderer.test.js`; a patched deck passes the OOXML schema validator)*
- [ ] Harness: the LibreOffice rendering of the PPTX scores ≥ 0.95 against the editor for every golden slide. LibreOffice is a stand-in for PowerPoint. *(measured: deck averages 0.875–0.927. LibreOffice understates native output: it doesn't draw run outlines, hollow text or gradient text, and it substitutes the theme fonts. See section 7)*
- [ ] Manual check: the golden decks opened in **PowerPoint for Windows, PowerPoint for Mac, PowerPoint on the web and Google Slides** (import) → fill in the matrix in section 6. *(needs PowerPoint and Google Slides; not available on the dev machine)*

**Found in Phase 4:**
- **F12, an editor bug:** the editor's bar chart draws **every bar the same height**, whatever its value. In `pptEditorExtras.css`, `.ppt-chart-bar { flex: 1 }` makes each bar fill its column and overrides the inline `height: <value>%`. The PPTX chart shows the real values, so it scores lower against the editor on chart slides. The fix is `flex: 0 0 auto` on the bars; it changes how charts look in the editor, so it's left for a product decision.
- The kitchen-sink deck used two text-effect names the editor doesn't have (`drop`, `glow`); it now uses the editor's own names.

**Found after Phase 4: reported on real decks (2026-11-06).** Reports: "in AI decks some text changes colour after export" and "in manual decks the structure is messy and unaligned". Reproduced by exporting real dev decks through the production path and comparing each slide with the editor (AI: `cmvm1kt7`, `cmv6c4iq`; manual: `cmsn4gr6`, 25 slides). None of these were in the plan.

- [x] **F13: run colours were not the drawn ones** (the text colour reported in AI decks). The editor contrast-adjusts each run's colour against the slide (`runDisplayStyle`); the export used the stored colour, so some title runs came out white or nearly invisible. The render page now measures each drawn run (`measureTextElements` → `runs`), and `pptxText` uses those colours by character position (`drawnRunColors`).
- [x] **F14: colours that weren't 6-digit hex turned black.** pptxgenjs paints anything else black: `#RRGGBBAA`, `#RGB`, `rgb()` / `rgba()` (including the space syntax), `hsl()`, and names like `white`. New `pptxColor.parseColor` handles all of them; alpha is blended onto the slide background where PowerPoint has no alpha.
- [x] **F15: the export drew the saved elements, not the ones the editor draws** (the main cause of "messy"). The editor normalises slides, re-themes graphics, finishes custom layouts (`finalizeChartShapes` adds chart cards, eyebrows, stat blocks and headers) and skips elements it doesn't paint. The PPTX is now built from the render page's stage elements (`__athenaExport.stageSlides()` → `withStageElements`). Before this, chart cards, eyebrows and stats were missing or misplaced.
- [x] **F16: stage element ids changed on every computation.** Layout finishing mints new ids each run, so measurements and pictures were keyed to ids that didn't match the elements handed to PPTX. Generated elements lost their drawn colour (a pink "PERFORMANCE METRICS" and "16.6x" where the editor draws them dark). The render page now resolves each slide's stage once per job and uses it for drawing, measuring and `stageSlides()`.
- [x] **F17: a plain `fill` was used as the text colour.** The editor only uses a text element's `fill` when it is a gradient; plain fills are ignored. Eyebrows and stats came out in the fill colour.
- [x] **F18: duplicated or partial runs.** Some saved runs repeat the text, or cover only part of it. The export now applies the editor's rules (`collapseDuplicatedRuns`, `contentUsesFullRuns` → `pptxText.editorRuns`), so titles are no longer doubled or cut short.
- [x] **F19: pictures that can't be loaded became grey "image" boxes** over the content. The editor shows nothing there, so the export now skips them (logged as `pptx_image_unavailable`, counted as `missing` in the report).
- [x] **F20: rounded rectangles came out square.** AI layouts store `shape: 'rect'` plus `borderRadius`. The editor rounds them, but PowerPoint ignores `rectRadius` on a plain rect. They are now `roundRect`.
- [x] **F21: area charts were a flat fill.** The editor draws a smooth line with dots over a soft fill. They are now a native combo chart: an area series under a line series with markers.
- [ ] **F22: text that overflows its box.** The editor clips it (some list slides show 5 of 7 bullets); PowerPoint shows every line past the box. Re-checked after Phase 5: the fonts now match, so the hidden lines are the same lines in both, and dropping them (measured on the render page) is now safe. Still a product decision: the PPTX would lose text the deck contains but the editor hides.
- [ ] **F23: a slide with no elements.** The render page and the PPTX each draw a fallback title from `content.title`, in slightly different styles. Rare, but the two should match.
- ~~Still open from these decks: **fonts (Phase 5).**~~ Done in Phase 5: Outfit, Roboto, Inter, Playfair Display and Merriweather were substituted when they weren't installed, so headings wrapped onto extra lines (`Agend/a`) and italic text got uneven spacing. They are now embedded in the file.
- Tests: `test/pptxEditorMatch.test.js` (colour forms, run rules and drawn colours, stage elements, fill vs ink, measured colour, rounded rect, area combo, missing image).

**Checkpoint 4**
- [ ] No text overflows its box in PowerPoint or Google Slides on any golden slide. *(fixed in LibreOffice for the test decks; fonts (Phase 5) still change wrapping)*
- [ ] Every shape kind keeps its outline; gradients show in PowerPoint. *(outlines are kept (as pictures); gradients are pictures, not native)*
- [ ] No element disappears or turns into a grey placeholder. *(done in code for every element type we know of; confirm in PowerPoint / Google Slides)*
- [ ] Section 6 matrix: every row is ✅ or a documented ⚠️.

---

### Phase 5: Fonts (M; investigation first) — code done 2026-11-06, real PowerPoint check pending

The same font must be used in the editor, the PDF, PowerPoint and Google Slides, or the line widths will never match.

**What was wrong (found while doing this phase):**
- **F24: the PPTX named a different font than the editor drew.** The backend gave `subtitle` the subheading font and `stat_value` the heading font; the editor draws both in the body font. It ignored `HEADING` / `TITLE` slots, which the editor draws in the heading font. With no theme fonts it named none (PowerPoint used Calibri), while the editor uses Inter. Run fonts were passed as CSS stacks (`"Inter, sans-serif"`), which PowerPoint can't resolve.
- **F25: no fonts in the file.** Every theme font is a Google Font, which Office doesn't ship, so PowerPoint always substituted it.

- [x] **5.1** List the fonts every theme uses (`fontPairing.service.js`, the themes). For each one, record whether it is a Google Font (works in Google Slides by name), comes with Office, or is neither. *(done: of the 83 catalog families (`FEATURED_FAMILIES`), 82 are Google Fonts served as TrueType. The exception is **Clash Display**, which is not on Google Fonts: the editor can't load it either and draws a fallback. Arial, Georgia, Times New Roman, Courier New and Helvetica are system fonts and are never embedded.)*
- [x] **5.2 PDF and images:** Phase 3 loads Google Fonts in the render page; the fonts from 1.2 cover the fallback. Nothing more to do here.
- [x] **5.3 PowerPoint, investigation:** embed the fonts the deck uses in the PPTX (`p:embeddedFontLst` plus `.fntdata` parts, ECMA-376). Check that PowerPoint for Windows and Mac display them, and check licensing: Google Fonts are OFL, which allows embedding. *(done: `pptxFonts.js`. A `.fntdata` part is an EOT file (version 0x00020001, no compression or XOR: a header built from the font's OS/2, head and name tables, then the TrueType data). The Google fonts checked are RIBBI-named ("Outfit" / "Bold") with fsType 0 (installable). Fonts with a restricted fsType, and CFF fonts, are never embedded. Verified in **LibreOffice**, which reads the embedded fonts: on a machine without them, Pacifico, Playfair italic and Outfit bold draw correctly. **PowerPoint for Windows and Mac: not yet checked.**)*
- [x] **5.4** If embedding works, do it by default and download the font files once into a server cache. *(done: on for "Made for: PowerPoint" exports. The faces the editor loads are embedded: regular 400, bold 700 and italic 400, each only when a run uses it. Bold italic is left to PowerPoint's synthetic bold, as the editor does. Files are cached in memory and on disk (`PPTX_FONT_CACHE_DIR`, default `<tmp>/athena-pptx-fonts`); a failed download is retried after 10 minutes. Limits: 4 MB per face, 20 MB per file. A font that can't be fetched is left out and listed as `fonts.unavailable` in `pptx_export_report`; the export never fails over a font. `PPTX_EMBED_FONTS=0` turns embedding off. The "PowerPoint-safe fonts" fallback was not needed.)*
- [x] **5.5** Google Slides: write the exact Google Fonts family name in `latin` / `ea` / `cs` so Slides picks the font up. *(done: pptxgenjs writes all three for every run, and the name is now the single family the editor drew. "Made for: Google Slides" exports skip embedding, since Slides ignores embedded fonts.)*
- [x] **5.6 (F24)** The font is the one the editor drew: the render page measures each text element's and each run's computed family (`measure()` → `fontFamily`). Without a measurement, the export uses the editor's own rule: the element's font, else heading for `title` / `heading` roles and `HEADING` / `TITLE` slots, else body, with Inter as the default. The PPTX theme's major and minor fonts are the deck's heading and body fonts, so text added in PowerPoint matches.
- Tests: `test/pptxFonts.test.js` (family names, the editor's font rule, run fonts, the EOT header, font usage, embedding parts and relationships). The fidelity harness embeds fonts by default (`--no-fonts` to compare without).
- Real decks (LibreOffice, fonts not installed): manual deck `cmsn4gr6` embeds Roboto, Outfit and Inter (1.4 MB). "History as a Record of the Past" now fits on one line, and "Sources of Historical Knowledge" takes two lines (not three over the bullets), as in the editor. AI decks `cmvm1kt7` (Playfair Display, Lato, Merriweather; 2.2 MB) and `cmv6c4iq` (Outfit, Inter, Space Grotesk; 0.8 MB) now wrap their titles and card text like the editor.
- Note: PowerPoint's bold is the 700 face; text the editor draws at 600 is slightly wider in PowerPoint.

**Checkpoint 5**
- [ ] The kitchen-sink deck opened on a clean Windows PC with Office and no extra fonts shows the theme fonts. *(LibreOffice on a PC without the fonts: ✅. PowerPoint: to check.)*
- [ ] Google Slides shows the theme fonts.

---

### Phase 6: Job infrastructure (M)

- [ ] **6.1** A BullMQ `presentation-export` queue on the existing Redis. The API adds a job; a worker (in the same service at first, separable later) runs it with **concurrency 2 per instance** (configurable).
- [ ] **6.2** One browser per worker, reused across jobs, with a new page per job. Restart the browser after N jobs or on a crash.
- [ ] **6.3** Progress: the worker reports `progress` (slides done / total). `getExport` returns it, and the dialog shows a real percentage bar.
- [ ] **6.4** Cancel: a `DELETE /export/:id` endpoint removes a queued job or cancels a running one. The dialog gets a Cancel button. No credits are charged.
- [ ] **6.5** Retry once automatically on browser crashes; never retry a validation error. The idempotent credit charge (already keyed on `exportId`) stays.
- [ ] **6.6** Timeouts per job scale with the slide count. Remove the "stale heartbeat" guess once the queue tracks job state.
- [ ] **6.7** An S3 lifecycle rule deletes `presentations/*/exports/*` after 7 days. Presigned links last 1 hour, and asking again issues a fresh link.
- [ ] **6.8** Logging and metrics: duration, slide count, format, renderer version and failure reason for each export. Alert if the failure rate passes 5% in an hour.
- [ ] **6.9** Notify in the inbox when an export finishes after the dialog was closed (this exists; keep it).

**Checkpoint 6**
- [ ] 10 exports started at once on staging all finish; memory stays within the container limit.
- [ ] Restarting the server during an export: the job resumes or fails cleanly with a retry; it is never stuck.
- [ ] Progress and Cancel work in the dialog.

---

### Phase 7: QA, rollout and documentation (S–M)

- [ ] **7.1** Feature flag `PPT_EXPORT_V2`, controlling the render page, the PPTX fidelity work and the queue. Turn it on for internal workspaces first.
- [ ] **7.2** Run the full matrix (section 6) on the golden decks plus 10 real customer decks (with permission, or anonymised copies).
- [ ] **7.3** Add the harness to CI on the backend: golden decks → PDF and PPTX → scores must stay above the thresholds. A drop fails the build.
- [ ] **7.4** Update `docs/api/PRESENTATION_API.md` (`slideIds`, `scale`, `quality`, `transparent`, `progress`, cancel) and the frontend data contract doc.
- [ ] **7.5** Write a support note on what PowerPoint and Google Slides can't do, and which elements become pictures.
- [ ] **7.6** Turn the flag on for everyone; remove the legacy renderer one release later.

**Checkpoint 7 (definition of done)**
- [ ] PDF export success rate ≥ 99.5% over 7 days in production.
- [ ] Every golden deck: PDF and images ≥ 0.98, PPTX (LibreOffice) ≥ 0.95, and the manual matrix all ✅ or a documented ⚠️.
- [ ] Slide selection and image size options are live in the editor and in My Work.

---

## 5. PPTX feature table

✅ = matches the target (or looks right as a picture where that is the target) · 🟡 = looks right now, but as a picture instead of the editable target.

`native` = editable PowerPoint object · `patch` = native, added by editing the XML after pptxgenjs writes it · `raster` = picture cut from the editor renderer.

| Feature | Before | Now (2026-11-06) | Target | Google Slides note |
|---|---|---|---|---|
| Text box insets | PowerPoint defaults (wrong) | ✅ native, exact | native, exact | ✓ |
| Fit-to-box font size | stored size (overflows) | ✅ native, measured size | native, measured size | ✓ |
| Bullets / numbered lists | lost | ✅ native | native | ✓ |
| Uppercase | lost | ✅ native (applied to the text) | native `cap="all"` | ✓ |
| Underline / strikethrough / italic runs | partly | ✅ native | native | ✓ |
| Hyperlinks | native | ✅ native | native | ✓ |
| Text gradient | first colour | ✅ patch (a picture for Google Slides) | patch `gradFill` | shows the first colour |
| Text shadow / outline / glow | lost | ✅ patch | patch | shadow ✓, glow ✗ (ignored) |
| Curved text, glitch text | lost | ✅ raster, with the text in the notes | raster, with the text in the notes | ✓ (as a picture) |
| Preset shapes (~30) | ~10 mapped, others rect | ✅ native (polygons as custom geometry) | native preset | ✓ |
| Other library shapes | rect | 🟡 polygons native, curved outlines raster | native custGeom | ✓ |
| Shape gradient | solid | ✅ patch (a picture for Google Slides) | patch `gradFill` | **solid in Slides**: decide in Q2 |
| Dashed / dotted stroke | solid | ✅ native | native | ✓ |
| Element opacity | shapes only | ✅ native, shapes, images and text | native, shapes and images | ✓ |
| Element shadow / lift / neon / echo | native shadow | ✅ native shadow | native shadow | ✓ |
| Element glow | shadow look-alike | ✅ patch `<a:glow>` | patch `<a:glow>` | ✗ ignored |
| Element blur / outline / glitch | lost | ✅ raster | raster | ✓ (as a picture) |
| Image crop | baked | ✅ native `srcRect` | native `srcRect` | ✓ |
| Image circle / rounded mask | lost | 🟡 raster | native picture geometry | ✓ |
| Image other masks / filters / edge fade / device frame | lost | ✅ raster | raster | ✓ |
| Background image | as an element | ✅ slide background (picture) | slide background | ✓ |
| Gradient background | solid | ✅ patch (a picture for Google Slides) | patch | solid in Slides: Q2 |
| Table styling | plain | ✅ native, measured | native, styled | ✓ |
| Charts | basic | ✅ native, editor-styled | native, styled | Slides converts charts to pictures on import (known limitation) |
| Embed / video | grey card | ✅ picture + link | thumbnail + link | ✓ |
| Groups | separate elements | separate elements | patch `grpSp` (optional) | ✓ |
| Speaker notes | native | ✅ native | native | ✓ |
| Theme fonts | named only | ✅ embedded (EOT), the font the editor drew | embedded or safe swap (Phase 5) | Google Fonts by name ✓ |

---

## 6. Compatibility matrix (fill in during Phases 4 and 7)

| Golden deck | PowerPoint Win | PowerPoint Mac | PowerPoint Web | Google Slides | Keynote (optional) | LibreOffice |
|---|---|---|---|---|---|---|
| AI deck A | | | | | | |
| AI deck B | | | | | | |
| AI deck C | | | | | | |
| Kitchen sink | | | | | | |
| 4:3 deck | | | | | | |
| 40-slide deck | | | | | | |

Use ✅ (matches the editor) · ⚠️ (known, documented difference) · ❌ (bug: open a ticket).

---

## 7. Baseline and progress scores

SSIM against the editor's own rendering (1 = identical), measured by `export-fidelity.js` on 2026-11-05. "Before" is commit `362af52`, before Phase 1; "Now" is after Phases 1, 3, 4A and the Phase 0 fixes. PPTX is drawn by LibreOffice with the fonts on the dev machine, so missing theme fonts lower the PPTX scores. Targets: PDF ≥ 0.98, PPTX ≥ 0.95. Score files are in `AthenaVI_backend/scripts/presentation-eval/baselines/`.

| Deck | Slides | PDF before | PDF now (lowest slide) | PPTX before (lowest) | PPTX after 4A (lowest) | PPTX after Phase 4 (lowest) |
|---|---|---|---|---|---|---|
| ai-light | 10 | ❌ times out | **0.992** (0.981) | 0.850 (0.728) | 0.903 (0.834) | **0.903** (0.834) |
| ai-dark | 10 | ❌ times out | **0.988** (0.978) | 0.622 (0.231) | 0.885 (0.692) | **0.877** (0.611) |
| ai-editorial | 10 | ❌ times out | **0.990** (0.970) | 0.882 (0.808) | 0.927 (0.869) | **0.927** (0.869) |
| kitchen-sink | 8 | 0.761 | **0.984** (0.963) | 0.602 (0.430) | 0.889 (0.657) | **0.875** (0.713) |
| four-three (4:3) | 5 | ❌ times out | **0.997** (0.993) | 0.801 (0.617) | 0.887 (0.718) | **0.891** (0.739) |
| forty-slides | 40 | ❌ times out | **0.988** (0.962) | 0.577 (0.116) | 0.914 (0.688) | **0.912** (0.607) |

**Reading the Phase 4 column:** Phase 4 made more of the PPTX native and editable (charts, tables, gradients, text effects, shapes), and the averages held steady. Photos (native crop, 0.947 → 0.985) and charts (0.657 → 0.713 on the kitchen-sink chart slide) went up. The drops come from three things:
1. **`chart_two_v1` (0.61):** the editor bug F12. The editor's bars are all the same height; the PPTX shows the real values.
2. **The effects slide (0.97 → 0.82):** text effects are now native text instead of pictures. LibreOffice doesn't draw run outlines or hollow text, and it substitutes the fonts, so the text wraps differently. PowerPoint draws these effects.
3. **The gradient slide (0.93 → 0.88):** gradients are now native and editable. LibreOffice draws gradient *text* as a flat colour.

Scores for after Phase 4 are in `baselines/2026-11-06-after-phase-4.json`.

**Where PPTX is still furthest from the editor** (the next work):
1. **Fonts (Phase 5):** the biggest remaining gap. Without the theme fonts, every text box wraps differently (the kitchen-sink text slide scores 0.73).
2. **Charts:** fix the editor's bar heights (F12), then compare again.
3. **Checking in real PowerPoint and Google Slides** (section 6): LibreOffice understates native text effects and gradients.

---

## 8. Open questions

| # | Question | Recommendation |
|---|---|---|
| Q1 | Should client-side image downloads cost credits like server exports? | ✅ **Decided (Phase 2):** the same flat export fee, once per download, so billing is unchanged from server image exports. Easy to change: `chargeBrowserExport` in `export.service.js`. |
| Q2 | Shape and background gradients show solid in Google Slides. Should they be pictures instead? | ✅ **Decided (Phase 4):** native for PowerPoint; the export dialog's "Made for: Google Slides" makes gradients, glow text and hollow text pictures. |
| Q3 | Complex text effects (curved, glitch): a picture (looks right, not editable) or plain native text (editable, looks different)? | Picture, with the text kept in the speaker notes, and listed in the export report. |
| Q4 | Should the export render page be served by the frontend (`EXPORT_RENDER_URL`) or bundled into the backend? | Frontend URL plus a version check: one renderer and one deploy. |
| Q5 | Should groups export as native PowerPoint groups? | Yes, but last (4.22); it doesn't affect how the slide looks. |

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| The export page drifts from the editor | It uses the same `PptCanvasElement`; the CI harness catches visual drift. |
| Images on S3 blocked by CORS in the browser (client image export) | Probe first, then fall back to the server render per slide (2.7). Check the S3 CORS settings for the app origins. |
| PowerPoint rejects a hand-patched XML file ("repair" prompt) | Validate every patched file with the OOXML validator in CI, and open the golden decks in PowerPoint before each release. |
| Font embedding doesn't work reliably | The safe-font option (5.4) with re-measured text. |
| The browser uses too much memory on large decks | Queue concurrency, one shared browser, and rendering the PDF in chunks of 10 slides that are then merged (pdf-lib), if needed. |
| Old frontend + new backend (or the reverse) during a deploy | The renderer version check (3.8); the backend keeps accepting `slideId` (2.8). |

---

## 10. Order of work at a glance

```
Phase 0  Baseline + harness ───────────────┐
Phase 1  Production hotfixes (ship) ───────┤  week 1
Phase 2  Slide selection + image download ─┘  week 2
Phase 3  One renderer (PDF/images) ───────────  weeks 3–4
Phase 4  PPTX fidelity ───────────────────────  weeks 4–6   (4A text first: biggest visible win)
Phase 5  Fonts (spike early, during Phase 3) ─  weeks 4–5
Phase 6  Queue + progress + cancel ───────────  can run alongside 3–4
Phase 7  QA, flag rollout, docs ──────────────  week 7
```

Phases 1 and 2 ship on their own and fix the immediate complaints (PDF broken, no slide selection for images). Phases 3 and 4 fix "doesn't look like the editor" for PDF and PPTX.
