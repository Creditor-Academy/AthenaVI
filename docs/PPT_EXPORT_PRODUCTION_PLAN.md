# Presentation Export — Production Plan

**Scope:** PPT editor export to PPTX, PDF, PNG and JPEG.
**Repos:** `AthenaVI` (frontend) and `AthenaVI_backend` (backend).
**Status:** Plan. Nothing in this document is implemented yet.

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

### Phase 0: Baseline and measurement (S)

The goal is to see the real production error and to have decks and a harness that measure fidelity before any change.

- [ ] **0.1** Pull the `error` column of recent FAILED rows from the exports table in production, plus the matching `processExport failed` log lines. Confirm F1 (Chrome not found) or record the real error.
- [ ] **0.2** Build a set of **golden decks** as JSON fixtures in `AthenaVI_backend/src/modules/presentation/test/fixtures/export/`:
  - 3 AI-generated decks covering the different layout families (title, cards, timeline, comparison, chart, gallery, quote);
  - 1 "kitchen sink" user deck: every element type, every shape kind, every text style (lists, uppercase, underline, runs, links), image masks, filters and crops, a table with a header, each chart type, gradients, element effects and text effects, a group, and an embed;
  - one 4:3 deck;
  - one deck with 40 slides.
- [ ] **0.3** Build a **fidelity harness** by extending `scripts/presentation-eval/export-fidelity.js`. For each golden deck:
  1. Render the editor reference PNGs (the export render page once it exists; until then, the editor through Puppeteer).
  2. Export PDF → rasterize → compare with the reference.
  3. Export PPTX → convert to PNG with LibreOffice (`soffice --headless --convert-to pdf`, then `pdftoppm`) → compare.
  4. Write an HTML report with the three images side by side and a similarity score per slide.
- [ ] **0.4** Record the baseline scores in this document (section 7).

**Checkpoint 0**
- [ ] The production failure cause is known and recorded.
- [ ] The golden decks and the harness run locally with one command, and the baseline report exists.

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
- [x] **1.4 Zip file name (F4).** The download name comes from the stored file's extension (`Deck.zip`). Files inside are named `<Deck>-slide-03.png`, numbered by position in the deck.
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

### Phase 2: Canva-style slide selection and image download (M)

**UX: the Export dialog**
- [ ] **2.1** Add a slide picker that applies to every format:
  - **All slides** · **Current slide** · **Select slides**.
  - "Select slides" opens a grid of slide thumbnails (reuse `MinimapSlidePreview`) with a checkbox on each, plus Select all, Clear and shift-click to select a range. A counter shows, for example, "5 of 12 slides".
- [ ] **2.2** Add image options:
  - format PNG / JPEG;
  - **size** 1× / 2× / 3×, showing the result in pixels, for example 1920×1080;
  - **JPEG quality** slider (default 90);
  - **PNG transparent background** (off by default; it hides the slide background).
- [ ] **2.3** Downloads:
  - one slide → a single image;
  - several slides → `<Deck name>.zip` with files named `<Deck>-01.png`, numbered in deck order.
- [ ] **2.4** Remember the last chosen format, size and selection for each deck (in localStorage, read and written inside try/catch).

**Client-side capture (D3)**
- [ ] **2.5** Pull the shared parts out of `src/pages/CanvasEditor/canvasExportCapture.js` and `canvasExport.js` (capture node, wait for images, probe for blocked images, zip) into `src/utils/export/`. The Canvas editor and the PPT editor both use that code.
- [ ] **2.6** Render the selected slides off-screen at the canvas size with `PptCanvasElement` (the same component as Present), capture each one, and report progress per slide ("Slide 3 of 8").
- [ ] **2.7** When an image is blocked (tainted canvas), send just those slides to the server job (`slideIds`) and merge the results into the zip.

**Backend**
- [ ] **2.8** Accept `slideIds: string[]` in `exportDeckSchema`, keeping `slideId` for older clients. `buildPptxBuffer`, `buildPdfBuffer` and `buildRasterExport` filter by the list and keep deck order.
- [ ] **2.9** Accept `scale` (1–3), `quality` (60–100) and `transparent` for PNG/JPEG; set `deviceScaleFactor` and `omitBackground` from them.
- [ ] **2.10** Credits: decide whether client-side image downloads cost credits (see the open questions). If they do, add a lightweight "charge" endpoint with an idempotency key.

**Tests**
- [ ] Unit tests: selection helpers (all / current / chosen, deck order kept, range select) and file names.
- [ ] Backend tests: `slideIds` validation (unknown id → 404, empty list → 400) and filtering for each format.
- [ ] Browser test (Puppeteer, port 5199): select slides 2, 4 and 5 → PNG 2× → the zip has 3 files of 3840×2160 that match the editor screenshots.

**Checkpoint 2**
- [ ] Any set of slides downloads as PNG or JPEG at 1×, 2× or 3× from both the editor and My Work.
- [ ] The downloaded images match the editor (harness score ≥ 0.98 per slide).
- [ ] PDF and PPTX respect the same slide selection.

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
- [ ] **3.1** Add a Vite entry for `export-render.html` → `src/export-render/main.jsx`. It:
  - exposes `window.__athenaExport.render(deck, { slideIds, scale })`;
  - draws every slide at its canvas size with `PptCanvasElement` (no editing UI, no API calls);
  - sets the theme font CSS variables and loads the theme's Google Fonts;
  - waits for `document.fonts.ready`, image decodes, and fit-to-box to settle (two quiet animation frames), then sets `window.__athenaExport.ready = true`.
- [ ] **3.2** Add `window.__athenaExport.measure()`, which returns, for every element on every slide:
  - its drawn box;
  - **the fitted font size**;
  - the line count;
  - whether the text overflows.

  PPTX uses this in Phase 4.
- [ ] **3.3** Add `window.__athenaExport.snapshot(elementId, scale)`, which returns a transparent PNG of a single element, for PPTX's picture fallback.
- [ ] **3.4** The page has a strict CSP: scripts only from its own origin; images only from the S3/CDN and data:; fonts only from Google Fonts.

**Backend**
- [ ] **3.5** Add `exportRenderer.service.js`. It opens `EXPORT_RENDER_URL`, injects the deck with presigned media, and waits for `ready` (with a timeout). It also uses request interception to allow only the frontend origin, S3/CDN media and Google Fonts.
- [ ] **3.6** PDF = `page.pdf()` from the render page. PNG/JPEG = a screenshot per slide (`clip` set to the slide, `deviceScaleFactor` = scale).
- [ ] **3.7** Keep `slideHtml.js` only for legacy slides that have no elements, and as an emergency fallback behind an env flag (`PPT_EXPORT_RENDERER=legacy`). Remove its element renderer once Phase 3 is stable.
- [ ] **3.8** Versioning: the render page reports `rendererVersion`. The backend logs it with each export and refuses to run against a version below the minimum it supports.

**Tests**
- [ ] Every golden deck → PDF → rasterize → compared with the editor reference: score ≥ 0.98 per slide.
- [ ] The PDF has selectable text (`pdftotext` returns the slide text) and clickable links.
- [ ] Tables, every chart type, all shapes, masks, filters, text effects and element effects appear in the PDF (by visual diff).
- [ ] A 40-slide PDF finishes in under 3 minutes on staging.

**Checkpoint 3**
- [ ] PDF and server-side images are drawn by the editor's renderer.
- [ ] Every golden deck passes the visual diff threshold.
- [ ] `PPT_EXPORT_RENDERER=legacy` still works as a rollback.

---

### Phase 4: PPTX fidelity for PowerPoint and Google Slides (L) — 4A, 4G and part of 4B/4C done 2026-11-05

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

**Not done yet:** native gradients (4.10; they are pictures for now), the full preset-shape map (4.9; clip-path shapes are pictures), table styling (4.16), chart styling (4.17), fonts (Phase 5).

**4A. Layout and text (fixes P1, P2, P3)**
- [ ] **4.1** Set explicit insets from `padding`/`paddingX` (default 0) on every text box: `margin: [t, r, b, l]` in pptxgenjs, written to `bodyPr` as `lIns`/`tIns`/`rIns`/`bIns`.
- [ ] **4.2** Font size = the **fitted size from the render page measurement** (Phase 3.2). When there is no measurement, fall back to the backend's `textFit.util` estimate. Set `autoFit` off (`<a:noAutofit/>`) so PowerPoint doesn't resize the text again.
- [ ] **4.3** Line height: use `lineSpacingMultiple` (a percentage) instead of exact points, so the spacing holds when PowerPoint uses a different font.
- [ ] **4.4** Lists: each line in a `listType` text box becomes its own paragraph, with `bullet: true` or `bullet: { type: 'number' }`, and an indent matching the editor's marker.
- [ ] **4.5** `textTransform: uppercase/lowercase/capitalize`: uppercase uses the native `cap="all"` (it stays editable); the others are applied to the text itself.
- [ ] **4.6** Underline, strikethrough, italic, `fontWeight` and size **for each run**, plus `letterSpacing` and `align: justify`.
- [ ] **4.7** Vertical alignment and the `nowrap` setting are kept. The text box height comes from the measured box, not the stored placement, when they differ.
- [ ] **4.8** Text gradient fill: native `gradFill` on the run (XML patch). Google Slides shows the first colour; that is acceptable.

**4B. Shapes (fixes P4, P5)**
- [ ] **4.9** Map every `SHAPE_LIBRARY` id (`src/constants/shapeLibrary.js`) in one table: PowerPoint preset where it matches (triangle, rtTriangle, hexagon, octagon, pentagon, parallelogram, trapezoid, star4/5/6/8, chevron, rightArrow, leftRightArrow, wedgeRectCallout, cloudCallout, plus, donut, arc, blockArc…). Everything else → **custom geometry** from the `clipPath` polygon (pptxgenjs custGeom `points`; check this on 4.0.1).
- [ ] **4.10** Gradients: write a JSZip post-processing step (`pptxXmlPatches.js`) that swaps the `solidFill` for `gradFill` (stops, angle, linear or radial) on elements tagged during the build. It also covers gradient slide backgrounds and text gradients.
- [ ] **4.11** Stroke dash styles (`borderStyle`: dashed, dotted), stroke transparency, and line shapes with arrowheads (`line-arrow`).
- [ ] **4.12** Element opacity → `transparency` on shapes **and** images.

**4C. Images (fixes P6)**
- [ ] **4.13** Circle and rounded masks → native picture geometry (`ellipse` / `roundRect`) where possible. Any other mask, filters, edge fade or device frame → bake into the PNG with sharp (or use the render page's element snapshot) and place it at the exact box.
- [ ] **4.14** Keep native cropping for plain crops (`srcRect`) so the user can re-crop in PowerPoint.
- [ ] **4.15** `useAsBackground` images → the slide background image.

**4D. Tables (fixes P7)**
- [ ] **4.16** Column widths, row heights, header fill and text colour, cell fills, borders on every side in the editor's colours, the theme fonts, the editor's font size, padding and alignment.

**4E. Charts (fixes P8)**
- [ ] **4.17** For each chart type, match the editor: legend on or off and its position, data labels, axis label colour and font, gridlines, donut hole size, the series colours, and the number format.
- [ ] **4.18** A chart that can't be built natively → a picture from the render page, never an empty "Chart" box.

**4F. Effects, embeds and groups (fixes P9, P11)**
- [ ] **4.19** Text effects: shadow → `<a:outerShdw>` on the text, outline → `<a:ln>` on the run, glow → `<a:glow>` (XML patch). Curved, glitch and other complex text effects → a picture, with the plain text added to the speaker notes so it isn't lost. (See open question Q3.)
- [ ] **4.20** Element effects: add `<a:glow>` (PowerPoint has a real glow) and `<a:softEdge>` for blur. Keep the shadow mapping from the effects work. Outline and glitch → picture.
- [ ] **4.21** Embeds and video → the thumbnail image plus a hyperlink to the URL, with a small play badge for video.
- [ ] **4.22** Groups → native PowerPoint groups (`grpSp`, XML patch), so they move together in PowerPoint. Optional; do it only if time allows.

**4G. Fallback layer**
- [ ] **4.23** In `pptxCapability.js`, decide for each element whether it is `native`, `native+patch` or `raster`, based on its features. Raster elements are cut from the render page (Phase 3.3) at 2× and placed at their exact box and layer.
- [ ] **4.24** Add an export report (logged, and optionally shown in the dialog): "3 elements were exported as pictures because PowerPoint can't draw them."

**Tests**
- [ ] For each mapping: a unit test on the XML (`lIns="0"`, `gradFill`, `prstGeom prst="hexagon"`, `custGeom`, `buChar`, `cap="all"`, table `tcPr` fills, chart legend…).
- [ ] Harness: the LibreOffice rendering of the PPTX scores ≥ 0.95 against the editor for every golden slide. LibreOffice is a stand-in for PowerPoint.
- [ ] Manual check: the golden decks opened in **PowerPoint for Windows, PowerPoint for Mac, PowerPoint on the web and Google Slides** (import) → fill in the matrix in section 6.

**Checkpoint 4**
- [ ] No text overflows its box in PowerPoint or Google Slides on any golden slide.
- [ ] Every shape kind keeps its outline; gradients show in PowerPoint.
- [ ] No element disappears or turns into a grey placeholder.
- [ ] Section 6 matrix: every row is ✅ or a documented ⚠️.

---

### Phase 5: Fonts (M; investigation first)

The same font must be used in the editor, the PDF, PowerPoint and Google Slides, or the line widths will never match.

- [ ] **5.1** List the fonts every theme uses (`fontPairing.service.js`, the themes). For each one, record whether it is a Google Font (works in Google Slides by name), comes with Office, or is neither.
- [ ] **5.2 PDF and images:** Phase 3 loads Google Fonts in the render page; the fonts from 1.2 cover the fallback. Nothing more to do here.
- [ ] **5.3 PowerPoint, investigation:** embed the fonts the deck uses in the PPTX (`p:embeddedFontLst` plus obfuscated `.fntdata` parts, ECMA-376). Check that PowerPoint for Windows and Mac display them, and check licensing: Google Fonts are OFL, which allows embedding.
- [ ] **5.4** If embedding works, do it by default and download the font files once into a server cache. If it doesn't, add a "**PowerPoint-safe fonts**" option to the export dialog that swaps each theme font for the nearest Office font with similar widths, and re-measure the text (Phase 3.2) with the swapped fonts so the boxes still fit.
- [ ] **5.5** Google Slides: write the exact Google Fonts family name in `latin` / `ea` / `cs` so Slides picks the font up.

**Checkpoint 5**
- [ ] The kitchen-sink deck opened on a clean Windows PC with Office and no extra fonts shows the theme fonts (or the safe-font option keeps every box intact).
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

## 5. PPTX feature table (target)

`native` = editable PowerPoint object · `patch` = native, added by editing the XML after pptxgenjs writes it · `raster` = picture cut from the editor renderer.

| Feature | Today | Target | Google Slides note |
|---|---|---|---|
| Text box insets | PowerPoint defaults (wrong) | native, exact | ✓ |
| Fit-to-box font size | stored size (overflows) | native, measured size | ✓ |
| Bullets / numbered lists | lost | native | ✓ |
| Uppercase | lost | native `cap="all"` | ✓ |
| Underline / strikethrough / italic runs | partly | native | ✓ |
| Hyperlinks | native | native | ✓ |
| Text gradient | first colour | patch `gradFill` | shows the first colour |
| Text shadow / outline / glow | lost | patch | shadow ✓, glow ✗ (ignored) |
| Curved text, glitch text | lost | raster, with the text in the notes | ✓ (as a picture) |
| Preset shapes (~30) | ~10 mapped, others rect | native preset | ✓ |
| Other library shapes | rect | native custGeom | ✓ |
| Shape gradient | solid | patch `gradFill` | **solid in Slides**: decide in Q2 |
| Dashed / dotted stroke | solid | native | ✓ |
| Element opacity | shapes only | native, shapes and images | ✓ |
| Element shadow / lift / neon / echo | native shadow | native shadow | ✓ |
| Element glow | shadow look-alike | patch `<a:glow>` | ✗ ignored |
| Element blur / outline / glitch | lost | raster | ✓ (as a picture) |
| Image crop | baked | native `srcRect` | ✓ |
| Image circle / rounded mask | lost | native picture geometry | ✓ |
| Image other masks / filters / edge fade / device frame | lost | raster | ✓ |
| Background image | as an element | slide background | ✓ |
| Gradient background | solid | patch | solid in Slides: Q2 |
| Table styling | plain | native, styled | ✓ |
| Charts | basic | native, styled | Slides converts charts to pictures on import (known limitation) |
| Embed / video | grey card | thumbnail + link | ✓ |
| Groups | separate elements | patch `grpSp` (optional) | ✓ |
| Speaker notes | native | native | ✓ |
| Theme fonts | named only | embedded or safe swap (Phase 5) | Google Fonts by name ✓ |

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

## 7. Baseline and progress scores (fill in)

| Date | Phase | Deck | PDF score | PPTX (LibreOffice) score | Notes |
|---|---|---|---|---|---|
| | 0 (baseline) | | | | |

---

## 8. Open questions

| # | Question | Recommendation |
|---|---|---|
| Q1 | Should client-side image downloads cost credits like server exports? | Charge the same flat export fee once per download, so the client path isn't a way around it. Free is also reasonable for images, since they cost us nothing to make. This is a product decision. |
| Q2 | Shape and background gradients show solid in Google Slides. Should they be pictures instead? | Keep them native (editable in PowerPoint). Add a dialog option, "Optimised for Google Slides", that turns gradients into pictures. |
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
