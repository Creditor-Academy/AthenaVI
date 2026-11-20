# QA Bug Fix Plan: course creator report of 18 Nov 2026

**Source:** `Virtual_Studio_QA_Bug_Report_18Nov2026.pdf` (virtualstudio.lmsathena.com, account test@gmail.com).
**Repos:** `AthenaVI` (frontend, FE), `AthenaVI_backend` (backend, BE), plus infra (S3 / nginx).
**Scope:** every presentation, Brand Kit, Canvas and general bug in the report.
**Out of scope for now:** the video bugs V-1 to V-5 (avatar generation, the crash after narration, credits charged for a failed video, the lost video title, the static preview) and the truncated video error toast. They get their own plan.
**Status:** C-1 committed 2026-11-20 (`931b09b`, not deployed). P-1 code done 2026-11-20 (🔵, not committed or deployed). The other bugs are not started. Root causes come from reading the code. P-1 and C-1 still need to be confirmed against production (see each item).
**Tracking:** every bug has a **Checkpoint** (its definition of done) below. Tick the boxes as the work lands, and update the Status column. A bug is ✅ only when every box in its checkpoint is ticked.

Status key: ⬜ not started · 🟡 in progress · 🔵 code done, waiting for staging / QA · ✅ done (QA signed off).

| # | Bug | Sev. | Area | Owner | Estimate | Sprint | Status |
|---|---|---|---|---|---|---|---|
| P-1 | Slide text lost after reload despite "SAVED"; Present shows the slide blank | High | Presentations | FE + BE | 3 d | 1 | 🔵 |
| C-1 | Canvas PNG/PDF export fails when an AI image is on the page | High | Canvas | FE + BE | 2 d | 1 | 🔵 |
| C-2 | Inspector number fields: 1600 becomes 10600, can't clear, no maximum | High | Canvas | FE | 1 d | 1 | ⬜ |
| P-3 | Media panel stuck on "Loading…" | Medium | Presentations | FE + BE | 0.5 d | 1 | ⬜ |
| P-4 / C-3 | New items land on top of existing content; Title and Subtitle overlap | Medium / Low | Both editors | FE | 1.5 d | 2 | ⬜ |
| P-2 | AI deck charged 393 credits against an estimate of 319 | Medium | Credits | BE + FE | 2 d | 2 | ⬜ |
| B-1 | Brand kit applies only partly to AI decks | Medium | Brand Kit | BE + FE | 2.5 d | 2 | ⬜ |
| B-2 | No Brand Kit in the Canvas editor | Medium | Brand Kit | FE | 3 d | 3 | ⬜ |
| L-1 | Folder picker: no default folder, Continue disabled | Low | Workspaces | BE + FE | 1 d | 3 | ⬜ |
| L-2 | Canvas design card shows a broken thumbnail | Low | Workspaces | BE + FE | 0.5 d | 2 | ⬜ |
| L-3 | "Danger zone" button in the deck tool rail is easy to hit | Low | Presentations | FE | 0.25 d | 2 | ⬜ |
| L-4 | No per-action credit feedback | Low | Credits | FE | 1 d | 3 | ⬜ |
| L-5 | Failed operations give no retry or support guidance | Low | All | FE | 1.5 d | 3 | ⬜ |

Fixed outside this plan (section 7): `/templates/` answering 403, and table text cut off in cells, both 🔵.

Total: about 20 developer-days. Sprint 1 holds the three High bugs plus the quick P-3 fix, so the data-loss and export problems ship first.

---

## 1. Working rules for every fix

- **Retest on the QA data.** Keep the QA account's data in place (section 10 of the report): the "Intro to Personal Finance" manual deck, the "Budgeting Basics for Students" AI deck, the brand kit, the two AI images and the canvas design "QA Course Thumbnail – Budgeting 101".
- **Screen recording.** QA asked for one per fix, showing the same steps from the report passing. Attach it to the ticket together with the commit SHA.
- **Unit test.** Every fix comes with one that fails before the fix and passes after it.
- **Deploy order:** BE before FE when a fix touches both, so a new frontend never calls an endpoint that isn't there yet.
- **Out of scope:** no video-editor code is changed in this plan. The shared helpers in L-5 (error actions) are built so the video flow can use them later.
- **Checkpoints.** Each bug ends with a checklist. Its last box, **Close-out**, is the same for every bug: unit tests merged and green, the retest passing on staging, the screen recording and commit SHA on the ticket, and QA's sign-off on production.

---

## 2. Sprint 1: High bugs

### P-1. Manual deck: slide 3 text lost after reload (High)

**QA steps:** new presentation from template → edit text on slide 3 → wait for SAVED → reload → Present. Slide 1 kept its edits. Slide 3 was blank in the editor and in Present.

**What happens.** Several faults add up. The first two are certain from the code. Which of 2 and 3 fired in the QA run can't be told without reproducing it, and both give exactly this symptom.

1. **The "Saved" badge is not a save status.** `AIPptEditor.jsx:4747` shows `Saved` whenever the deck has an id. It ignores pending timers, writes in flight, the slide-persist queue and errors. So "waited for SAVED" proved nothing.
2. **A slide added from a layout is stored empty on the server.**
   - Slide 3 shows "Minimal title slide / Optional tagline", the placeholders of `title_minimal_v1` (`simpleSlidesCatalog.js:648-658`). A template deck is created with one slide, so slide 3 came from Add slide → layout.
   - `handlePickAddSlide` has the `templateId` (`AIPptEditor.jsx:3275-3281`), but `handleAddSlide` POSTs only `{afterSlideId, beforeSlideId, title, layoutId}` (`:3209-3214`).
   - Without `templateId` the backend stores a blank canvas with one empty text box (`slideEditor.service.js:103-135`, `layoutToElements.js:2369-2394`).
   - The layout's elements exist only in the browser, under a temporary id `new-slide-…` (`:3155-3179`). They reach the server only through a later `saveCanvas` in the serial persist queue (`:3223-3231`, `:2010-2014`). A reload before that queue drains, or a failed PUT, leaves the server copy blank.
   - The failure handler filters by the temporary id, which has already been replaced, so it does nothing (`:3233-3238`).
3. **Edits made while the slide still had its temporary id are dropped.**
   - `patchElement` remembers the temporary slide id. When its 320 ms timer fires after the id was replaced, it finds no slide and returns without saving (`usePptElementMutations.js:154-156`).
   - `queueCanvasSave` does the same (`AIPptEditor.jsx:1974-1976`), or PUTs to `/slides/new-slide-…/canvas` and gets a 404.
   - The slide list is keyed by `slide.id` (`:5029`), so replacing the id remounts the slide. Text being typed at that moment is committed through the old id and lost.
4. **Nothing is flushed on reload or when leaving.**
   - The load effect's cleanup *clears* the save timers instead of running them (`:2924-2929`).
   - There is no `beforeunload` / `pagehide` save.
   - `flushPendingCanvasSaves` (`:2026-2062`) runs only for export, publish and regenerate, and skips slides that still have a temporary id.
5. **Smaller ways to lose edits, fixed in the same change:**
   - Undo/redo snapshots keep temporary ids (`:2147-2182`).
   - Duplicate doesn't save the source's unsaved canvas, and skips the server entirely for a slide that still has a temporary id (`:3326-3354`).
   - `reloadPresentation` overwrites slides with a snapshot taken before hydration (`:1825`).

The backend stores what it receives correctly. This is a frontend save-pipeline bug plus the missing `templateId`.

**Fix**
1. **A real save status.** Add a `useSaveStatus` store that counts pending canvas timers, element-patch timers, the slide-persist queue and in-flight requests, and keeps the last error. The badge shows:
   - **Saving…** while anything is pending;
   - **Saved** only when everything is written;
   - **Not saved – Retry** on an error.
2. **New slides are never blank on the server.** Send `templateId` (or the compiled `elements`) in the add-slide POST, so the server creates the slide with its content. The later `saveCanvas` then only carries edits.
3. **Resolve the slide id when the save runs, not when it is queued.**
   - `patchElement` and `queueCanvasSave` call `resolvePersistedSlideId` when their timer fires, and look the slide up by both ids.
   - While the slide is still being created they wait for it (re-queue behind the persist chain) instead of dropping the save or getting a 404.
   - `remapSlideId` also renames pending timer keys and history snapshots.
4. **Flush, don't clear.**
   - On unmount, run every pending save.
   - On `pagehide`, send them with `fetch(…, {keepalive: true})`.
   - On `beforeunload`, warn when anything is still pending.
   - `flushPendingCanvasSaves` waits for slides still being created instead of skipping them.
5. **Stable React key per slide.** A client key that doesn't change when the server id arrives, so an element being edited isn't remounted.
6. **Duplicate** first flushes the source slide. Duplicating a slide that is still being created waits for it.
7. **Hydration:** `reloadPresentation` merges into the current slides instead of replacing them with the old snapshot.

**Files:**
- FE: `AIPptEditor.jsx`, `usePptElementMutations.js`, a new `useSaveStatus.js`, the badge in the editor header.
- BE: `slideEditor.service.js` (accept `elements` on add slide, if that route is chosen).

**Tests**
- FE unit:
  - an edit queued under a temporary id is saved under the real id;
  - the badge stays "Saving…" until the queue is empty;
  - an unmount flush sends the pending PATCH;
  - add-slide sends `templateId`.
- BE: add slide with `templateId` stores the layout's elements.
- Manual, beyond the QA steps:
  - add a slide and type at once, then reload within 1 s;
  - throttle the network to Slow 3G and repeat;
  - duplicate a slide that was just edited, then reload.

**Retest:** the report's steps, plus a reload at once after typing. The text must be there in the editor and in Present.

**Before closing:** open the QA deck in the database and check whether slide 3's `elements` hold an empty text box (cause 2) or old text (cause 3). Write the answer in the ticket.

**Done 2026-11-20 (code, not committed or deployed)**
- **Reproduced** in the real slide editor against a stand-in API (old code, same steps):
  - add slide from the "Minimal title slide" layout, reload while the request is on its way (server answering in 1 s): the server's slide is **blank** (one empty text box);
  - type on that slide, reload without clicking away: the typed text is **lost**, and the badge said **Saved** the whole time.
  - Both match QA's slide 3 exactly. A third cause, found while fixing: text being typed is only committed when the box loses focus, so it was never saved before a reload.
- **Fix (frontend, `AIPptEditor.jsx`, `usePptElementMutations.js`, `PptCanvasElement.jsx`, new `utils/textEditDraft.js`, `utils/pptSlideMerge.js`):**
  - **Real save status:** the badge shows **Saving…** while any save is waiting, on its way, or text is being typed; **Saved** only when all of it is on the server; **Not saved · Retry** (red, clickable) after a failed save.
  - **Text being typed is saved** about 1 s after typing stops, without leaving the box, and counted as unsaved until then.
  - **New slides carry their content** in the add request (`elements`), so the server never holds them blank.
  - **Temporary ids are resolved when a save is sent:** saves made while a slide is being created wait for it and use its real id (no more dropped saves or 404s); undo/redo restores slides under their real ids; slides keep a stable React key, so the box being typed in isn't remounted when the real id arrives.
  - **Nothing dropped when leaving:** leaving the editor or switching decks sends pending saves instead of clearing them; reload / closing the tab sends them with `keepalive` requests (`pagehide`) and asks first ("Leave site?") while anything is unsaved; hiding the tab saves at once.
  - **Duplicate** saves the copy as shown (with edits not yet saved on the source); a copy of a slide that couldn't be created is removed with a message instead of staying on screen only.
  - **Loading a deck** no longer overwrites a slide edited (or added) while it was still loading.
- **Backend:** add-slide accepts optional `elements` (the same canvas format as the canvas save) and stores them (`slideEditor.service.js`, `presentation.validations.js`, `presentation.service.js`).
- **Tests:** `pptSlideMerge.test.mjs` (4), `addSlideElements.test.js` (3); frontend 458 / 458, backend 1174 / 1174. Browser test in the real editor, 12 / 12: add from a layout + reload at once (also with a 1 s server), typing + reload within 0.5 s, the badge's states, a failed save + Retry, duplicate right after an edit, undo/redo with no 404 or temporary-id requests, a throttled network (2 s latency, 50 KB/s), and Present.
- **Note for QA:** the text already lost on slide 3 of the QA deck was never saved, so it can't be recovered. Retype it after the deploy (that is also the retest).

**Checkpoint P-1 (done when)**
- [ ] Root cause confirmed on the QA deck (empty text box or old text) and written in the ticket. *(Reproduced locally with the old code: blank slide, and typed text lost. Still to look at slide 3 in the production database.)*
- [x] The badge shows **Saving…** while anything is pending, **Saved** only when every write has finished, and **Not saved · Retry** after a failed write. *(browser test, with the server failing saves; Retry then saves)*
- [x] Add slide from a layout: the server copy has the layout's content straight away (reload at once after adding). *(browser test, also with a slow server)*
- [x] Typing on a just-added slide is kept after a reload, including on a slow network. *(browser test: reload 0.5 s after typing; 2 s latency at 50 KB/s)*
- [x] Reload or closing the tab with pending edits keeps them (`pagehide` flush) or warns first (`beforeunload`). *(browser test)*
- [x] Duplicate right after an edit: the copy has the edit after reload. *(browser test)*
- [x] Undo/redo on a just-added slide still saves (no 404 on a `new-slide-…` id). *(browser test, request log checked)*
- [ ] Slide 3 of "Intro to Personal Finance" shows its text in the editor and in Present after a reload. *(Present checked in the browser test; on the QA deck after the deploy, with the text retyped)*
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

### C-1. Canvas export fails when an AI image is on the page (High)

**QA steps:** Canvas → add an AI image from Library → Export → PNG or PDF. The error reads: "Couldn't draw `<id>.png`. The image host blocked it, so nothing was saved."

**What happens**
- The message comes from `canvasExport.js:77-88`. Before drawing, `assertPageIsExportable` → `blockedImagesOnPage` → `probeImage` (`src/utils/export/capture.js:30-49`) loads each image with `crossOrigin="anonymous"`. If that load fails, the export stops. There is no fallback.
- AI images and uploads are both public S3 URLs (`asset.service.js`, `s3.service.js buildPublicUrl`). There is no CDN or image proxy.
- Two causes are likely, and they can happen together:
  1. **The bucket's CORS rules don't allow `https://virtualstudio.lmsathena.com`.** The browser then refuses to let the canvas read the image.
  2. **Browser cache.** The same URL was first shown by a plain `<img>` (no CORS). Chrome then reuses that cached copy, which has no `Access-Control-Allow-Origin`, for the CORS request, and it fails even when the bucket is set up correctly.

**Fix**
1. **Infra (first, smallest):**
   - Check the bucket's CORS: `curl -I -H "Origin: https://virtualstudio.lmsathena.com" <AI image URL>` must return `Access-Control-Allow-Origin`.
   - Add a rule for the production, staging and local origins: `GET` and `HEAD`, header `*`, with `Vary: Origin`.
2. **FE, make export independent of the browser cache:**
   - `probeImage` and the capture step fetch each image with `fetch(url, {mode: 'cors', cache: 'no-store'})` and draw it from a blob URL. This avoids the cached no-CORS copy.
   - When that fetch fails, retry through the backend proxy (step 3) before reporting the image as blocked.
3. **BE, same-origin fallback:**
   - Add `GET /api/assets/:workspaceId/:assetId/raw`. It streams the asset with the correct `Content-Type` (fix the `video/mp4` default for images) and checks the user can read the workspace.
   - The exporter uses it for any asset the workspace owns.
4. **Error message:** when an image still can't be drawn, name it and offer "Export without this image" instead of failing the whole export.

**Files:**
- Infra: S3 bucket CORS.
- FE: `src/utils/export/capture.js`, `canvasExport.js`.
- BE: `asset.routes.js` / `asset.controller.js` / `asset.service.js` (raw route), `s3.service.js` (content type).

**Tests**
- FE unit: the probe uses a blob fetch, and falls back to the proxy on a CORS failure.
- BE: the raw route returns 403 for another workspace and the right content type.
- Manual: export PNG, JPG, WebP and PDF with an AI image, an uploaded image, an Unsplash image and a brand kit logo on the page, in Chrome and in Safari.

**Retest:** the report's steps, in a normal window right after placing the image (the cache case) and in a private window.

**Done 2026-11-20 (code, not committed or deployed)**
- **Cause confirmed: the browser cache, not the bucket.** The production bucket (`virtual-instructor`) does allow `https://virtualstudio.lmsathena.com` (a CORS preflight returns `Access-Control-Allow-Origin`), so no infra change is needed. The editor first shows the picture with a plain `<img>`; S3 answers that without CORS headers and the browser caches it; the export's check then got that cached copy and was refused. Reproduced in a browser against a stand-in server that behaves like S3: the old check failed exactly this way.
- **Fix (FE):** before drawing, every picture on the page is downloaded again with `cache: 'no-store'` (the address unchanged, so presigned links still work) and the page is drawn from those copies (`src/utils/export/inlineImages.js`, `canvasExportCapture.preparePagesForExport`). The old pre-check (`probeImage`) is gone, and html-to-image no longer adds a cache-busting query (it broke presigned links).
- **Fallback (BE):** when a host refuses the browser (an origin not on the bucket's list, e.g. dev or staging), the picture comes through `GET /api/media/image?url=…`. It is signed-in only, fetches only https URLs on our bucket (plus `MEDIA_PROXY_HOSTS`), adds no credentials and follows no redirects (so it returns only what the URL already serves), images only, 25 MB, 15 s. This replaces the planned per-asset raw route: it also covers brand-kit logos and presigned links.
- **Message:** a picture that still can't be loaded is named ("Couldn't load “…”, so nothing was saved. Export without it, or replace the image.") with an **Export without this image** button.
- **Tests:** `inlineImages.test.mjs` (8), `mediaProxy.service.test.js` (3); frontend 454 / 454, backend 1171 / 1171. Browser test with the real export dialog: PNG (the picture's pixels checked in the file), JPEG, WebP and PDF all download with the image on the page after it was shown first; with a refusing host, the message and "Export without this image" work.

**Checkpoint C-1 (done when)**
- [x] The production bucket sends `Access-Control-Allow-Origin` for `https://virtualstudio.lmsathena.com` *(checked 20 Nov; no infra change needed)*. Staging bucket: check once the staging site address is known.
- [x] PNG, JPG, WebP and PDF export work with an image that was already shown in the editor (the cached-copy case). *(browser test against an S3 stand-in)*
- [ ] The same on staging with real pictures: an AI image, an upload, an Unsplash photo and a brand logo, in Chrome and Safari.
- [x] The image route only serves our bucket's images, as public / presigned URLs already allow; anything else is refused. *(unit tests)*
- [x] A picture that still can't be loaded is named, with "Export without this image" offered instead of a failed export. *(browser test)*
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

### C-2. Inspector number fields corrupt input (High)

**QA steps:** select a shape → Inspector → Width → select the value and type 1600. The width becomes 10600. The field can't be cleared, has a minimum of 10 and no maximum (a shape reached 101600 px).

**What happens**
- `CanvasRightInspector.jsx:289-334` applies `Math.max(10, Number(value))` on every keystroke. Selecting "1000" and typing "1" gives 1, which is clamped to 10 at once. The field shows "10", and the next keys append to it: "1"+"0"+"6"… → 10600.
- An empty field becomes 10 straight away, so it can't be cleared.
- There is no upper limit.
- Each keystroke is also a separate undo step (`updateElementPlacement`, `CanvasEditor.jsx:1042-1065`).

**Fix**
- A shared `NumberField` that keeps a *draft string* while typing. It commits on Enter, on blur, or on arrow up/down (±1, ±10 with Shift). Escape restores the old value. This is the pattern already in the slide editor's `ElementTransformControls.jsx:47-63,195-224`; move it into `src/components/ui/NumberField`.
- Limits come from the page:
  - width and height between 1 and 4 × the page size (10 000 px at most);
  - X and Y between −page size and 2 × the page size;
  - rotation wraps to 0–359.
- An empty or invalid value on commit restores the previous value.
- One commit is one undo step.
- Use the same field for the other Inspector numbers (font size, letter spacing, border width, opacity), and in the slide editor so both editors behave the same.

**Files:**
- FE: new `src/components/ui/NumberField/NumberField.jsx`;
- `CanvasRightInspector.jsx`, `CanvasEditor.jsx` (clamp in `updateElementPlacement`);
- `ElementTransformControls.jsx` (switch to the shared field).

**Tests:**
- Unit: select-all, type 1600, Enter → 1600; clear and blur → previous value; 999999 → clamped to the maximum; typing doesn't add undo steps, a commit adds one.

**Retest:** the report's steps, plus clearing the field and typing a huge value.

**Checkpoint C-2 (done when)**
- [ ] Select the width, type 1600, press Enter: the width is 1600.
- [ ] The field can be cleared while typing; leaving it empty restores the previous value.
- [ ] 999999 is limited to the page-based maximum; nothing reaches 101600 px.
- [ ] Arrow up/down change the value by 1 (Shift: 10); Escape restores it.
- [ ] Typing a number is one undo step, not one per key.
- [ ] The same field is used for every Inspector number, and in the slide editor.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

### P-3. Media panel stuck on "Loading…" (Medium, fixed in Sprint 1 because it is small)

**QA steps:** deck editor → Media. The panel stays on "Loading…".

**What happens**
- In `MediaPanel.jsx`, inserting a stock photo into a slide calls `setLoading(true)` (`:458`). On success it returns from inside a `try` that has no `finally` (`:460-479`), so `loading` is never reset.
- The panel stays open (only the Insert path closes it), and the grid stays hidden behind "Loading…" (`:729-734`, `:782`) until the user switches tab or reopens the panel.
- It only happens in the slide editor, after an Unsplash/Pexels/Pixabay insert. That is why QA saw it "sometimes".
- **Contributing:**
  - no timeout on the stock requests, neither in the browser (`stockService.js:18,45`) nor on the server's Unsplash call (`unsplash.client.js:37`), so a hung request also leaves it loading;
  - one shared `loading` flag for overlapping requests, so an older response can overwrite a newer one.

**Fix**
- `try/finally { setLoading(false) }` around the slide-media insert.
- A request counter (or `AbortController`), so only the latest request sets the results and clears loading.
- Timeouts: 15 s in `stockService` (with a "Couldn't load photos – Retry" state), and 10 s on the server's provider calls.

**Files:**
- FE: `MediaPanel.jsx`, `stockService.js`.
- BE: `stock/providers/unsplash.client.js` (and the Pexels/Pixabay clients).

**Tests:**
- Unit: after `onMediaAttached` resolves, loading is false; a slow first search doesn't overwrite a later one; a timeout shows Retry.

**Retest:** open Media, insert an Unsplash photo, insert a second one without closing the panel, then switch to Pexels and back.

**Checkpoint P-3 (done when)**
- [ ] After inserting a stock photo into a slide, the panel shows the photos again (no "Loading…").
- [ ] Quick searches in a row show the last search's results, never an older one.
- [ ] A provider that doesn't answer shows "Couldn't load photos – Retry" after 15 s (tested by blocking the request).
- [ ] The server's Unsplash, Pexels and Pixabay calls stop after 10 s.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

## 3. Sprint 2

### P-4 / C-3. New items drop onto existing content; Title and Subtitle overlap

**QA steps:**
- add a text box, shape or image to a slide or canvas that already has content;
- Canvas → Text → add Title, then Subtitle.

Both land on top of what is there.

**What happens**
- **Slide editor:** `handleInsertElement` (`AIPptEditor.jsx:3521-3636`) uses a fixed default per type (`PPT_DEFAULT_PLACEMENTS`, `pptInsertCatalog.js:612-621`, e.g. every text box at x 160, y 200). It ignores the elements already on the slide.
- **Canvas:** `createElement` (`canvasDocument.js:158-184`) always centres the new box, overwriting any `placement` it was given (`:164-168`).
- **Canvas text presets:** the Canvas Text panel gets no `elementPresets` (`CanvasLeftDrawer.jsx:61`), so Title and Subtitle are the same 1000 × 120 box, centred: exactly on top of each other.
- **Canvas layering:** the new layer is `elements.length + 1`, which can sit below existing higher layers. The slide editor uses `nextPptLayer`.
- No free-space helper exists in the code.

**Fix**
- A shared `findFreePlacement(existing, preferred, page)` in `src/utils/placement.js`:
  1. start from the preferred box (the type default, or centred);
  2. if it overlaps a visible element by more than 30 % (or matches one exactly), cascade:
     - **text:** place it below the lowest overlapping text box, plus a gap;
     - **other types:** step +32 px right and down;
  3. keep it inside the page, and stop after a few steps (then use the last cascade position, like Canva).
- Use it in `handleInsertElement` and in the Canvas `addElement`.
- `createElement` keeps a given `placement` and centres only when none is given.
- Pass `elementPresets` to the Canvas Text panel, so Title, Subtitle and Body get their own sizes and positions.
- Canvas uses the same next-layer rule as the slide editor.

**Files:**
- FE: new `src/utils/placement.js` (+ test), `AIPptEditor.jsx`, `canvasDocument.js`, `CanvasEditor.jsx`, `CanvasLeftDrawer.jsx`.

**Tests:**
- Unit: two text boxes don't overlap; Subtitle goes below Title; the result stays inside the page; a full page still gives a position.
- Update `canvasDocument.test.mjs:323-334`, which asserts today's always-centre behaviour.

**Retest:** the report's steps in both editors, adding three text boxes, two shapes and two images.

**Checkpoint P-4 / C-3 (done when)**
- [ ] Slide editor: three text boxes, two shapes and two images in a row land without covering each other or existing content.
- [ ] Canvas: Title then Subtitle puts the subtitle below the title.
- [ ] A new item never lands outside the page; on a full page it still gets a position.
- [ ] A new Canvas item goes on top of the existing ones.
- [ ] `canvasDocument.test.mjs` updated for the new placement rule.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

### P-2. AI deck: 393 credits charged against an estimate of 319

**QA steps:** AI presentation, 5 slides → note the estimate (319) → generate → 393 charged (+23 %).

**What happens.** The estimate and the charge are worked out differently:
- **Outline:** the estimate assumes fixed 800 / 1200 tokens (286 credits). The real charge counts the real tokens, and the real prompt is much longer.
- **Images:** the estimate prices every image on path A, 5 × (2 + 4) = 30. When path A's image is rejected, path B is used at 9 credits instead of 4, *and path A is still charged* (`deckGeneration.service.js:2629-2659`).
- **Export:** the estimate includes an export charge of 3, which isn't taken during generation. This makes the estimate wrong in both directions.

**Fix**
1. **Don't charge a rejected image.** Path A is charged only when its image is used. When it is rejected, charge path B only. This is the "no charge for output you didn't get" rule.
2. **A realistic outline estimate.** Count the real prompt (system prompt, template, user prompt) and use a measured average for the output. The average output size is set in config and checked against the last 200 generations.
3. **The image part as a range:** "35–60 credits for images, depending on the pictures found". The screen shows the total as a range, not one number.
4. **Remove the export line** from the generation estimate. Export is charged when the user exports, and shows its own price then.
5. **Re-estimate after the outline step:** the screen updates "Credits used / expected" from real numbers.
6. **Cap (product decision, recommended):** never charge more than the top of the range shown. Anything above it is absorbed and logged as `credit_estimate_exceeded`, so the estimate can be tuned.

**Files:**
- BE: `deckGeneration.service.js`, the credit estimate service / route, config.
- FE: the AI deck estimate and progress screen.

**Tests:**
- BE unit: a rejected path-A image charges only path B; the final charge is never above the cap; the estimate for a 5-slide prompt lands within ±10 % of a recorded real run.
- Script: generate 10 decks on staging and compare estimate vs charge (target within ±10 %, never above the cap).

**Retest:** the report's steps. The charge must be within the range shown and not above it.

**Checkpoint P-2 (done when)**
- [ ] **Decision recorded:** cap the charge at the top of the estimate (recommended) or not.
- [ ] A rejected path-A image is not charged; only path B is.
- [ ] The estimate is a range and no longer includes the export charge.
- [ ] The progress screen shows credits used against the expected range, updated after the outline.
- [ ] 10 test generations on staging: each charge within ±10 % of the estimate and never above the cap; results in the ticket.
- [ ] `credit_estimate_exceeded` is logged when the cap absorbs a charge.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

### B-1. Brand kit applies only partly to AI decks

**QA steps:** brand kit → open the AI deck → Brand Kit → Apply. Manual decks change fully. On the AI deck the title accent and heading font stay the same.

**What happens**
- `applyBrandKit` (`presentation.service.js:498-547`) writes only the deck's `themeTokens` and the logo.
- Manual decks take colours and fonts from the theme, so they change.
- AI generation writes fixed `fontFamily` and hex colours into each element (`layoutToElements.js` 2259-2275, 2902-2917, 3002-3015, 1225-1238, 2152-2167, 1824-1834, 3480-3486).
- The renderer prefers an element's own value over the theme (`PptCanvasElement.jsx:636-639`, `pptTextContent.js:154-161`, `presentationHelpers.js:1437-1442, 1501-1506`).
- `rethemeGraphicElements.js` doesn't change shape fills or text.

**Fix**
1. **Apply rewrites the elements too.** In `applyBrandKit`, for every slide:
   - **text:** heading-role text gets the brand heading font, body text the body font; title accent runs get the brand accent;
   - **shapes and graphics:** colours that equal the old theme's primary, secondary or accent are mapped to the brand's (by `colorRole` where the element has one, else by matching the old theme hex);
   - **skip anything the user picked by hand:** mark user edits with `styleSource: 'user'` from now on; for older decks, skip colours that aren't one of the old theme colours.
   - All in one transaction, with one undo step in the editor (reload the deck after Apply).
2. **Stop writing fixed values at generation:** AI elements store `colorRole` / `fontRole` and leave colour and font empty unless the layout needs a specific one. New AI decks then follow the theme like manual ones.
3. Keep the old theme in `brandKitApplied.previousTheme`, so "Undo brand kit" can restore it.

**Files:**
- BE: `presentation.service.js` (`applyBrandKit`), a new `applyBrandToElements.js` (+ test), `layoutToElements.js`.
- FE: `rethemeGraphicElements.js`, mark `styleSource: 'user'` in the colour and font pickers.

**Tests:**
- BE unit: on a stored AI deck, Apply changes the heading font and title accent; a colour the user picked is kept; a manual deck gives the same result as today.
- Fidelity: export `ai-light` before and after Apply (the harness from the export plan) to check nothing else moved.

**Retest:** the report's steps on "Budgeting Basics for Students"; check every slide and Present.

**Checkpoint B-1 (done when)**
- [ ] On "Budgeting Basics for Students", Apply changes the heading font and the title accent on every slide, in the editor and in Present.
- [ ] A colour or font the user chose by hand is kept.
- [ ] A manual deck gives the same result as before.
- [ ] One undo step reverses the whole Apply; "Undo brand kit" restores the previous theme.
- [ ] New AI decks follow the theme (no fixed colours or fonts unless the layout needs one).
- [ ] Export fidelity of `ai-light` is unchanged apart from the brand changes.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

### L-2. Canvas design card shows a broken thumbnail

**What happens**
- The Canvas cover is an SVG `data:` URL.
- `toCoverUrls` passes it through `extractS3KeyFromUrl` (`project.service.js:527-530`, `coverThumbnail.js:123`, `s3.service.js:31-48`). That mangles it into a bad S3 link.
- The cards then show the alt text.

**Fix**
- **BE:** pass `data:` URLs (and URLs that aren't ours) through unchanged.
- **FE:** an `onError` fallback on the card images (`ViewCards.jsx:362-366`, `ProjectSceneThumbnail.jsx:90-97`) shows the type icon instead of alt text.
- **Better:** render the Canvas cover to a PNG on save and store it in S3, like the presentation covers.

**Tests:**
- BE unit: a `data:` cover comes back unchanged.

**Retest:** Workspaces → the "QA Course Thumbnail" card shows the design.

**Checkpoint L-2 (done when)**
- [ ] The "QA Course Thumbnail" card shows the design in Workspaces, My Work and Recents.
- [ ] A card whose picture fails to load shows the type icon, never alt text.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

### L-3. "Danger zone" button in the deck tool rail

**What happens**
- The button (`EditorRightRail.jsx:823-853`) toggles the safe-area overlay: the hatched red border in the QA screenshots.
- It is on by default (`AIPptEditor.jsx:960-968`), sits between Notes and Layers, and its name sounds destructive.

**Fix**
- Rename it to **Safe area**, with the tooltip "Show the margins that may be cut off when presenting".
- Move it to the bottom of the rail, next to zoom.
- Make it off by default, and remember the choice per user.

**Retest:** open a deck: no hatched border; the toggle shows and hides it.

**Checkpoint L-3 (done when)**
- [ ] The button is called **Safe area**, with a tooltip, and sits next to zoom, away from Notes and Layers.
- [ ] It is off by default, and the choice is remembered per user.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

## 4. Sprint 3

### B-2. Brand Kit in the Canvas editor

**What happens**
- The slide editor's brand kit (`AIPptEditor.jsx` 1259-1263, 2908-2913, 3027-3088, 4828-4886) has no Canvas equivalent.
- Canvas hardcodes `DEFAULT_PALETTE` in 5 files and has a fixed `DOCK_TABS` (`CanvasLeftDock.jsx:14-23`).
- `CanvasLeftDrawer` doesn't pass `brandKits` to `MediaPanel`.

**Fix**
- Add a **Brand** tab to the Canvas dock, with a `BrandKitPanel` (reuse the slide editor's parts) showing:
  - the workspace's kits and a kit picker;
  - **Colours:** click to apply to the selected element; the kit's colours are also added at the top of every colour picker (replacing the hardcoded `DEFAULT_PALETTE` with "brand colours first");
  - **Fonts:** heading and body; click to apply to the selected text;
  - **Logos:** click to insert. The logo is inserted as a copy in the workspace's assets, because presigned URLs expire;
  - **"Apply to whole design":** maps colours and fonts on every page in one undo step, with the same rules as B-1.
- Pass `brandKits` to the Canvas `MediaPanel`, so "Brand kit photos" works there too.

**Files:**
- FE: `CanvasLeftDock.jsx`, `CanvasLeftDrawer.jsx`, a new `canvas/panels/BrandKitPanel.jsx`, the colour picker (palette source), `CanvasEditor.jsx`.
- Shared mapping code with B-1 (FE copy of `applyBrandToElements`).

**Tests:**
- Unit: "apply to whole design" changes colours and fonts and is one undo step; logo insert creates an asset copy.

**Retest:** open the QA canvas design → Brand → apply the QA kit → export a PNG (this also checks C-1 with a logo).

**Checkpoint B-2 (done when)**
- [ ] The Canvas dock has a **Brand** tab with the workspace's kits.
- [ ] Brand colours appear first in every Canvas colour picker; fonts apply to the selected text.
- [ ] A logo inserted from the kit still shows a week later (asset copy, not a presigned link).
- [ ] "Apply to whole design" changes every page in one undo step.
- [ ] "Brand kit photos" works in the Canvas Media panel.
- [ ] The QA design exports as PNG with the logo on it.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

### L-1. Folder picker has no default folder

**What happens**
- `CreateLocationModal.jsx:105-157` shows "No folders in this workspace" and keeps Continue disabled.
- The backend requires `folderId` (`presentation.validations.js:152`).

**Fix**
- **BE:** every workspace gets a **My Projects** folder: create it with the workspace, backfill existing workspaces with a migration, and create it on demand if it is missing.
- **FE:** pre-select it, so Continue is enabled at once. Keep "New folder" in the picker.

**Tests:**
- BE: a new workspace has My Projects; the backfill is idempotent.
- FE: Continue is enabled with the default selected.

**Retest:** a workspace with no folders → Create → presentation: Continue works at once.

**Checkpoint L-1 (done when)**
- [ ] Every existing workspace has a **My Projects** folder after the migration; running it twice changes nothing.
- [ ] A new workspace gets one on creation.
- [ ] The picker pre-selects it and Continue is enabled at once.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

### L-4. No per-action credit feedback

**What happens**
- An `editor-credits-refresh` event exists, but the presentation and image flows never send it, so the balance changes silently.

**Fix**
- Add a `notifyCreditsCharged({amount, action})` helper. It refreshes the balance and shows a short toast, e.g. "−12 credits · AI image · View history", linking to the credit history.
- Call it after:
  - AI deck generation (final amount);
  - AI image;
  - AI text actions;
  - regenerate slide;
  - paid image export;
  - brand-kit AI actions.
- The video flow can adopt it later.

**Tests:**
- Unit: the helper sends the event once per charge.

**Retest:** generate an AI image; the toast shows −12 and the balance updates without a reload.

**Checkpoint L-4 (done when)**
- [ ] Each paid action (AI deck, AI image, AI text, regenerate slide, paid export, brand-kit AI) shows "−N credits · action · View history" once.
- [ ] The balance in the header updates without a reload.
- [ ] "View history" opens the credit history at that entry.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

### L-5. Failed operations give no retry or support guidance

**What happens**
- `notify` (`appDialog.js:32-37`), `Toast.jsx` and `AppDialogHost.jsx` can't carry actions.
- Errors disappear after a few seconds, and raw server text sometimes reaches the user.

**Fix**
- **`notify`:** accepts `actions` (e.g. `{label: 'Retry', onClick}`) and `sticky: true` for errors.
- **Every error toast:** includes "Contact support" (`support@lmsathena.com`) and "Help" (`/help`), and a short reference id (the request id), so support can find the log line.
- **A `friendlyError(err, context)` helper:** maps known error codes to plain sentences (no JSON). The full text goes behind a "Details" link.
- **Use it in:** export (PPT and Canvas), AI deck generation, AI image, uploads, stock search and saving (with P-1's "Not saved – Retry").

**Tests:**
- Unit: `friendlyError` never returns JSON; Retry calls the action again.

**Retest:** force a failure (offline) during export and AI image; a plain message, Retry and support links appear and stay until closed.

**Checkpoint L-5 (done when)**
- [ ] Error messages stay until closed and offer Retry where the action can be repeated.
- [ ] Every error has "Contact support" and "Help" links, and a reference id support can search for.
- [ ] No message shows raw JSON; the full text is behind "Details".
- [ ] Used in export (slides and Canvas), AI deck, AI image, uploads, stock search and saving.
- [ ] **Close-out:** unit tests merged and green; retest passes on staging; screen recording + commit SHA on the ticket; QA signs off on production.

---

## 5. Release and retest

| Release | Contents | QA retest |
|---|---|---|
| R1 (end of Sprint 1) | P-1, C-1 (S3 CORS can go live on day 1), C-2, P-3 | P-1, C-1, C-2, P-3 with recordings |
| R2 (end of Sprint 2) | P-4/C-3, P-2, B-1, L-2, L-3 | those items + a quick P-1 regression |
| R3 (end of Sprint 3) | B-2, L-1, L-4, L-5 | those items + a full pass of the presentation and canvas sections of the report |

**Regression list for every release:**
- AI deck generation;
- manual deck edit + reload;
- PPTX, PDF and PNG export (`npm run test:export-fidelity` on the backend);
- canvas undo, layers and reload (listed as working in the report);
- image crop in both editors.

### Release checkpoints

**Checkpoint R1 (end of Sprint 1)**
- [ ] P-1, C-1, C-2 and P-3 checkpoints all ticked.
- [ ] S3 CORS live on production and staging.
- [ ] Regression list passed on staging.
- [ ] QA recordings for the four bugs attached; QA signs off R1.

**Checkpoint R2 (end of Sprint 2)**
- [ ] P-4 / C-3, P-2, B-1, L-2 and L-3 checkpoints all ticked.
- [ ] P-1 regression: add slide, type, reload at once — text kept.
- [ ] Regression list passed on staging; QA signs off R2.

**Checkpoint R3 (end of Sprint 3: plan done)**
- [ ] B-2, L-1, L-4 and L-5 checkpoints all ticked.
- [ ] Full pass of the report's presentation, Brand Kit and Canvas sections on production with the QA account: no open item.
- [ ] The QA report's sections 3, 4, 6 and 8 (non-video items) marked fixed by QA.

## 6. Video bugs (not in this plan)

Not started, by request: V-1 (plan-locked avatars and the HeyGen dependency), V-2 (crash after narration), V-3 (91 credits for a failed video), V-4 (title saved as "Untitled Project"), V-5 (static preview), and the truncated video error toast.

L-4 and L-5 are built so the video flow can use them. V-3 should also follow the P-2 rule: no charge for output that wasn't delivered.

## 7. Fixed outside this plan

Raised separately on 20 Nov 2026 and fixed in code. T-1 is committed (frontend `7311886`, backend `08562cf`); T-2 is not committed yet. Neither is deployed.

### T-1. Table text cut off in cells (slide and Canvas editors) — 🔵

Cell text now wraps onto new lines, rows grow to fit it, and the column and row borders of a selected table can be dragged (as in PowerPoint and Canva). Export (PDF and PPTX) uses the same column widths and row heights.
- Code: `PptEditableTable.jsx`, `utils/pptTableLayout.js` (+ tests), both editors; table styles moved to `pptEditorExtras.css` so the export page has them too; backend `pptxTable.js`.

**Checkpoint T-1 (done when)**
- [x] Long text wraps inside its cell; no text is cut. *(browser test, 20 Nov)*
- [x] Typing grows only the edited row; deleting the text shrinks it back. *(browser test)*
- [x] Column and row borders can be dragged; each drag is one undo step. *(browser test)*
- [x] Present draws the same row heights as the editor. *(browser test)*
- [x] Export: tables keep their card, header shading and wrapped text; `kitchen-sink` PDF 0.984, PPTX 0.912 (baseline 0.984 / 0.906).
- [x] Unit tests: frontend 446 / 446, backend table tests pass.
- [x] Committed: frontend `7311886`, backend `08562cf`.
- [ ] Deployed.
- [ ] Checked in the real slide editor and Canvas editor on staging with the QA deck (e.g. the AI deck's tables).
- [ ] QA signs off.

### T-2. `/templates/` answered "403 Forbidden" — 🔵

`/templates/` is the folder of template data files the editors load, not a page; nginx refused to list it. `public/templates/index.html` now sends visitors to `/dashboard/templates` (sign-in first when needed).

**Checkpoint T-2 (done when)**
- [x] `/templates` and `/templates/` open the Templates page; the JSON files in the folder still load. *(tested on the production build, 20 Nov)*
- [ ] Committed and deployed.
- [ ] `https://virtualstudio.lmsathena.com/templates/` checked on production.
- [ ] *(Optional, server access)* production nginx gets `error_page 403 =404 /404.html;` so other folders (`/assets/`, `/mockups/`, `/oauth/`) show the Not found page instead of 403.
