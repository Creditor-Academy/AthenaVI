# Canvas Fix Plan: PPT and image editor audit of 25 Nov 2026

**Source:**
- code audit of the PPT editor and the image (Canvas) editor on 25 Nov 2026;
- the testing team's report that images added to a deck one day were missing the next day;
- two more team reports on 26 Nov: adding an image removes the background colour, and images disappear while presenting from review links.

**Repos:** `AthenaVI` (frontend, FE), `AthenaVI_backend` (backend, BE).
**Scope:**
- data loss in decks;
- the reported editor problems: Media insert, background selection, "Use as background", and the background colour removed when an image is added;
- images disappearing on review links;
- Ctrl+S in the PPT editor;
- the bugs the audit confirmed in both editors.

The two editors share the element renderer and the insert/design panels (`src/pages/Slides/AIPptComponents/`), so a fix there covers both.
**Status (26 Nov):**
- **Phase 0:** committed and pushed 26 Nov. Left: deploy to staging, retest there, and D-0's questions to the testers.
- **Phase 1:** N-1, D-1, D-2, D-3, D-4, D-5, C-1, K-1, R-1 and H-1 to H-4 committed and pushed 26 Nov (FE `88c288f`, BE `0c7d7b0`). Left: staging retest. See "Phase 1 implementation (26 Nov)" and "Image-loss hunt (26 Nov)" below.
- **Phase 1b:** B-3 and E-4a coded and browser-tested on the dev setup, not committed. See "Phase 1b implementation (26 Nov)" below.
- **Findings re-checked in the running app:** 14 confirmed (including the team's two new bugs B-2 and R-1, and a new finding N-1), 2 not reproduced, 8 not tested in the browser. See "Browser verification (26 Nov)" below.
- **Tests:** frontend 507 / 507 and backend 1,314 / 1,314 pass with the Phase 1b code.

In the item headings, ✔ means the cause was checked line by line in the code, and · means it comes from the audit's reading and is to be confirmed while fixing.

Status key: ⬜ not started · 🟡 in progress · 🔵 code done, waiting for staging / QA · ✅ done (QA signed off).

## Phases at a glance

| Phase | Goal | Items | Effort | Gate to leave the phase |
|---|---|---|---|---|
| **0. Stop the image loss** | Remove the confirmed cause, stop Media inserts wiping the background, log every slide write | D-0, D-8, L-1, B-1, B-2 | 2.5 d | Layout smoke test green; repro steps pass on staging; logging live; Media insert keeps the background |
| **1. Safe saving** | No save can remove newer work; review links keep showing images | N-1, D-1, D-2, D-3, D-4, D-5, C-1, K-1, R-1, H-1 to H-4 | 11 d | Revision tests green and in `npm test`; two-tab, undo, stale-tab-close and rapid-edit retests pass; review link presents without blanking while the owner edits |
| **1b. Empty slides and background photos** | An emptied slide is really empty; a background photo can be edited | B-3, E-4a | 1.5 d | Emptied slide stays blank in the editor, after reload and in PDF / PowerPoint exports; a background photo can be cropped, replaced, turned back into an image and removed, and each survives reload |
| **2. Wrong results from edits** | Edits change what the user meant, nothing else | E-1, E-2, E-3 | 1.25 d | Each item's checkpoint passes |
| **3. Reported editor problems** | Backgrounds, "Use as background", colours, image links | E-4 (rest), E-5, E-6, D-6 | 3.5 d | QA retests the three reported problems on the testers' decks |
| **4. Image editor and safety net** | Image editor placement and recovery; slide version history | C-2 to C-5, D-7 | 3.1 d | Support can restore a slide; image editor checkpoints pass |
| **5. Editing feel** | Drag, resize and text boxes behave at any zoom / rotation | G-1 to G-5 | 2.75 d | Each item's checkpoint passes |

**Total:** about 26 developer-days (FE about 20, BE about 6), including the image-loss hunt fixes and Phase 1b.

**Staffing:**
- With one FE and one BE developer, this is about 5 weeks.
- Phase 2 is small and touches different code from Phase 1, so a second FE developer can do it in parallel.
- The BE work is mostly in Phases 0, 1 and 4:
  - L-1, B-2 and D-1 (BE) come first;
  - R-1 (BE) can go in any time;
  - B-3 has a small BE part (PowerPoint export);
  - D-7 can start as soon as D-1 (BE) is merged.

**Order inside the phases:**
- **Phase 0:** D-8 and B-2 ship together as a hotfix, without waiting for Phase 1.
- **Phase 1:** N-1 → D-1 BE → D-2 → D-3 → D-1 FE → D-4 → D-5, C-1, K-1, R-1.
  - N-1 first: together with D-1, it caused the overwrite confirmed in the browser.
- **Phase 1b:** B-3 → E-4a. Committed as its own batch, after the Phase 1 batch (Phase 1 + H-1 to H-4).
  - D-2 and D-3 make the 409 handling in D-1 FE simple.
  - D-4 depends on D-3.

| # | Item | Sev. | Area | Owner | Estimate | Phase | Status |
|---|---|---|---|---|---|---|---|
| D-0 | Find out what removed the testers' images | High | Presentations | BE + QA | 0.5 d | 0 | 🟡 |
| D-8 | Layout repair rebuilds slides added this session and deletes user images | High | Presentations | FE | 1 d | 0 | 🔵 |
| L-1 | Log every slide write; warn when images drop | High | Presentations | BE | 0.5 d | 0 | 🔵 |
| B-1 | New blank slide shows text that can't be edited or deleted | High | Presentations | FE | 0.25 d (QA) | 0 | 🔵 |
| D-1 | Slide saves overwrite newer data (no version check) | High | Presentations | BE + FE | 2.5 d | 1 | 🔵 |
| D-2 | Two saves of one slide run at once and finish out of order | High | Presentations | FE | 1 d | 1 | 🔵 |
| D-3 | Server replies overwrite or drop newer local edits | High | Presentations | FE | 1 d | 1 | 🔵 |
| D-4 | Media click goes through the server; the image is lost or not shown | High | Presentations | FE | 1 d | 1 | 🔵 |
| D-5 | Undo/redo of slide add / delete / reorder never reaches the server | High | Presentations | FE | 1.5 d | 1 | 🔵 |
| C-1 | Image editor: text being typed is not saved on close / refresh | High | Canvas | FE | 1 d | 1 | 🔵 |
| K-1 | Ctrl+S in the PPT editor opens the browser's "Save page" box | Medium | Presentations | FE | 0.5 d | 1 | 🔵 |
| E-1 | Delete / arrows act on the previously selected element | High | Presentations | FE | 0.5 d | 2 | ⬜ |
| E-2 | Editing a chart value deletes every series but the first | High | Both editors | FE | 0.5 d | 2 | ⬜ |
| E-3 | "Connect Google Sheets / Analytics" inserts made-up numbers | High | Both editors | FE | 0.25 d | 2 | ⬜ |
| E-4 | Background colour can't be chosen reliably (white on dark themes, `design_bg` block); the background-photo part moved to E-4a | Medium | Presentations | FE | 0.75 d | 3 | ⬜ |
| E-5 | "Use as background" leaves the frame, cards and overlay behind | Medium | Presentations | FE | 1.5 d | 3 | ⬜ |
| E-6 | Hex colour field applies invalid colours, can't retype | Medium | Both editors | FE | 0.25 d | 3 | ⬜ |
| D-6 | Broken image links never recover | Medium | Both editors | FE + BE | 1 d | 3 | ⬜ |
| C-2 | Image editor: one tab deletes another tab's recovery copy | Medium | Canvas | FE | 0.5 d | 4 | ⬜ |
| C-3 | Image editor: new elements are sized for 1920×1080 and spill off the page | Medium | Canvas | FE | 0.5 d | 4 | ⬜ |
| C-4 | Image editor: changing the page size leaves elements off the page | Medium | Canvas | FE | 0.5 d | 4 | ⬜ |
| C-5 | Image editor: a new element can land behind existing ones | Low | Canvas | FE | 0.1 d | 4 | ⬜ |
| D-7 | Safety net: keep recent slide versions so lost work can be restored | Medium | Presentations | BE | 1.5 d | 4 | ⬜ |
| G-1 | Dragging a group / multi-selection sticks, then jumps | Medium | Both editors | FE | 0.5 d | 5 | ⬜ |
| G-2 | PPT text box height wrong at any zoom other than 100% | Medium | Presentations | FE | 0.25 d | 5 | ⬜ |
| G-3 | Text box shrinks on the first keystroke | Medium | Both editors | FE | 0.5 d | 5 | ⬜ |
| G-4 | Resizing a rotated element ignores the rotation | Medium | Both editors | FE | 1 d | 5 | ⬜ |
| G-5 | Resizing a cropped image from an edge stretches it | Medium | Both editors | FE | 0.5 d | 5 | ⬜ |
| N-1 | Undo re-saves every slide in the deck, not just the changed one | High | Presentations | FE | 0.5 d | 1 | 🔵 |
| B-2 | Adding an image from the Media panel deletes the slide's background colour | High | Presentations | BE | 0.25 d | 0 | 🔵 |
| R-1 | Review link: images blank out whenever the deck changes while someone presents | High | Review links | BE + FE | 1 d | 1 | 🔵 |
| H-1 | Undo after a Media insert removed the image together with the previous edit | High | Presentations | FE | 0.1 d | 1 | 🔵 |
| H-2 | A closing tab with an older copy overwrote the slide (page-close save had no revision) | High | Presentations | BE + FE | 0.4 d | 1 | 🔵 |
| H-3 | Undo / re-created slides / merges / pre-export saves wiped the slide background | High | Presentations | FE | 0.2 d | 1 | 🔵 |
| H-4 | Switching layout deleted images the user added (editor and server) | High | Presentations | BE + FE | 0.3 d | 1 | 🔵 |
| B-3 | After deleting every element, a ghost title and picture appear that can't be selected or deleted (also in exports) | High | Presentations | BE + FE | 0.5 d | 1b | 🔵 |
| E-4a | A photo used as the slide background can't be selected, edited, resized or removed | High | Presentations | FE | 1 d | 1b | 🔵 |

### Browser verification (26 Nov)

The findings were re-checked in the running app: local frontend and backend on `.env.development`, a test account, and a headless Chrome. Server writes were read from the L-1 log and the dev database.

| # | Result | What happened in the browser |
|---|---|---|
| D-1 | ✔ Confirmed | Tab B added a text box to slide 3. Tab A, holding the older copy, pressed Ctrl+Z, and its undo saved every slide. Slide 3 went from 2 elements to 1 on the server, deleting B's text box. A plain text edit in tab A did **not** lose it, because text edits are sent as a single-element update. |
| N-1 | ✔ New | One Ctrl+Z sent a full canvas save for all 5–6 slides, not just the changed one. It turns any older copy into deck-wide loss (see D-1). Fix: undo saves only the slides whose content changed. |
| D-4 | ✔ Confirmed | With an image selected, clicking a Media image replaced it (`PATCH`, images 1 → 1). With nothing selected, an upload filled the layout's phone frame instead of adding an image. A library click with nothing selected added the image, which showed straight away. The reported "doesn't show until dragged" did not reproduce in normal conditions. |
| D-5 | ✔ Confirmed | Add slide → Ctrl+Z: 6 → 5 on screen, but no delete was sent. After reload there were 6 slides again. |
| E-1 | ✔ Confirmed | Clicked the title, picked "95%" in Layers (highlighted there, but the title stayed selected on the slide), pressed Delete: the **title** was deleted (`DELETE …/slot-FEATURE_TITLE`). |
| E-2 | ✔ Confirmed | Grouped column chart, 2 series. After editing one value in the panel: 1 series ("Series B" deleted). The panel only lists the first series. |
| E-3 | ✔ Confirmed | A made-up Sheets link showed "Connected — pick a chart type", and the chart was inserted with 120 / 190 / 150 / 220. |
| E-4 | ✔ Confirmed | Clicking the background photo selects nothing and opens nothing. The Design panel shows "Add image" and "Reset" but no "Remove image" and no sign that a background photo is set. "Reset" does remove it, putting the photo back in its frame. |
| E-5 | ✔ Confirmed | "Use as background" on the Grid Metrics Mobile phone photo: the photo fills the slide, and the **empty phone frame stays** where it was. This matches the reported "something is still there". |
| C-1 | ✔ Confirmed | Image editor: typed into a text box and stayed in it for 8 s. The badge showed "Saved" throughout, refresh gave no warning, and the text was lost. |
| C-3 | ✔ Confirmed | 940 × 788 page: the inserted paragraph box sticks out past both page edges, and the title is cut off at the left. Both land on top of each other in the middle. |
| K-1 | ✔ Confirmed | In the PPT editor, a Ctrl+S keydown is not cancelled, so the browser's "Save page as" opens. |
| G-2 | ✖ Not reproduced | At 80% zoom, a 4-line text box fit its text. Other zoom levels were not tried. |
| E-6, C-2, C-4, C-5, G-1, G-3, G-4, G-5 | Not tested in the browser | Still based on the code reading. |

**Team-reported bugs, checked 26 Nov:**

| # | Result | What happened in the browser, and the cause |
|---|---|---|
| B-2 | ✔ Confirmed | Slide 5 background set to `#C9DAF8` (stored in the slide doc). A Media-panel click added an image, and the slide turned white: the DB showed `backgroundColor: null` straight after `POST …/attach-asset`. Drag-and-drop on the same slide kept the colour (it goes through `POST …/elements`). **Cause:** `slideMedia.service.js:24` `getElementsDoc` rebuilds the doc from `version`, `canvas` and `elements` only, so every Media click, upload or stock insert also drops `backgroundColor`, the gradient keys and `backgroundImage`. **Fix (BE):** spread the stored doc, as `slideEditor.service.js:52` does, plus a test that background keys survive an attach. |
| R-1 | ✔ Confirmed | A reviewer presented slide 5 from the view link while the owner made 3 small edits. Each edit made the review page re-fetch the deck (`GET /api/p/:token`). Every image came back with a new signature, so the browser downloaded each image again, and the presented images were fully blank for about 1 s per edit (0 of 2 visible). **Cause:** links are re-signed on every fetch, and the viewer swaps them in at once. **Fix:** (BE) return the plain bucket address, since the bucket is public, or sign with a fixed time window so the same key keeps the same link; (FE) when an image's `s3Key` hasn't changed, keep the loaded image, and otherwise preload the new link before swapping. |
| R-1 (expiry) | ✖ Not reproduced | With links signed for 60 s, images already shown kept showing after expiry, even when scrolling and presenting, because the browser reuses images it already downloaded. Expiry still matters for a reviewer who opens a slide whose image was never downloaded, and for the 304 path: `GET /api/p/:token` answers 304 by content ETag, so a client can keep links older than 1 h. The R-1 BE fix covers both. |

### Phase 1 implementation (26 Nov)

Code done and browser-tested on the dev setup (local frontend and backend, dev DB), not committed. Frontend 505 / 505 and backend 1,309 / 1,309 tests pass, plus the presentation script checks; `vite build` passes.

| # | What was built | Browser result |
|---|---|---|
| N-1 | Undo / redo saves only slides whose canvas changed, plus slides whose pending save it cancelled (`pptHistoryRestore.js`, 7 tests). | ✔ Across three two-tab runs every canvas save went to the changed slide only (before: all 6 slides per undo). |
| D-1 (BE) | Every elements write bumps `elements.revision` in `presentationDao.updateSlide`, writes only if the row is unchanged since it was read (`updatedAt` guard), and refuses a stale `baseRevision` with 409. `PUT …/canvas?baseRevision=N`; without it, last write wins as before. Element add / patch / delete / reorder and Media attach pass the revision they read and re-run on a lost race. `slideRevision.js`; `test/slideRevision.test.js` (6 tests, 4 fail on the old code). The old smoke test is removed (superseded). | ✔ See D-1 (FE). |
| D-1 (FE) | `slideRevisionStore.js` records server copies from every API reply, plus the revision the local copy is built on (set on load, applied replies, own saves and merges, never by PATCH echoes the editor doesn't apply). Canvas saves send `baseRevision`; on 409 the editor fetches the slide, 3-way merges (`mergeSlideDocs.js`, 10 tests) and saves again (up to 2 tries). Saves while the page closes send no revision, so the user's last edit is never refused. | ✔ Two tabs: B adds a text box; A (older copy) edits the title and undoes. A's save got 409, fetched, merged, saved (`baseRevision=13`, 200): slide 3 kept both (2 elements). Before: B's box deleted. The first try exposed a gap (PATCH echoes moved the base; the revision was lost in normalising); both fixed and retested. |
| D-2 | One canvas save per slide at a time; an edit during a save sends one follow-up with the latest content. | ✔ Part of the two-tab runs (no out-of-order writes). |
| D-3 | A server reply arriving while the slide has unsaved local work (element / placement patches waiting or in flight, canvas save waiting, in flight or asked again) is merged instead of replacing or dropping. Element patches count as pending until their request settles. | ✔ Covered by the D-1 runs; merges kept both sides. |
| D-4 | Media click / upload fills only a selected **device frame** (the panel says so). With a plain image selected it adds a new image. A multi-file upload fills the frame with the first file only. | ✔ Plain image selected → Media click → `attach-asset` without a target, images 4 → 5 (added). Not done: `s3Key` in the editor-side payloads (the backend derives it from the bucket address on load). |
| D-5 | Undo / redo of slide add, delete and reorder is sent to the server: delete, re-create (with content, id remapped) and reorder (`slideListChanges`, 5 tests). | ✔ Add → undo → reload: 6 → 7 → 6 → **6** (before: 7). Delete slide 6 → undo → reload: 6 → 5 → 6 → **6**, back in place with both charts. |
| C-1 | Image editor: the text being typed counts as unsaved, goes with saves and the tab-close save, and autosaves 1 s after typing stops (`canvasTextDraft.js`, 3 tests). | ✔ Typed, stayed in the box 3 s, refreshed → text kept. Immediate refresh → leave warning shown, and the text survived even after leaving. Before: "Saved", no warning, text lost. |
| K-1 | Ctrl/Cmd+S in the PPT editor saves now (also while typing) and never opens the browser's "Save page as"; File menu "Save now · Ctrl+S"; badge tooltip. | ✔ The editor cancels Ctrl+S. |
| R-1 | Image links signed as of the start of a fixed window (half the TTL), valid for the full TTL from any moment in it: one image keeps one link across fetches. The window is part of the review-link and deck-render ETags, so a 304 never keeps expired links (`test/stableImageLinks.test.js`, 3 tests). Not done: the FE "keep loaded image if `s3Key` unchanged" part; with stable links the same URL comes back, so it isn't needed within a window. | ✔ Reviewer presents while the owner makes 3 edits (2 re-fetches): 0 blank samples out of 272 and 0 link changes (before: blank ~1 s per edit). |

### Image-loss hunt (26 Nov)

After Phase 1, every path that writes a slide was exercised in the browser, with a DB snapshot of every image before and after each scenario and the L-1 log watched. Four more loss paths were found and fixed (code done, not committed). Frontend 506 / 506 and backend 1,312 / 1,312 tests pass.

| # | Scenario | Found | Fix | Retest |
|---|---|---|---|---|
| H-1 | Edit text → Media insert → one Ctrl+Z | ✖ **Loss.** The Media insert was not an undo step: one undo went back to before the text edit and removed the image **and** the edit (L-1 caught `PUT …/canvas removed [img_…]`). | `handleMediaAttached` saves an undo snapshot before applying the insert. | ✔ One undo removes only the image; the text edit stays. |
| H-2 | Tab A (older copy) edits and closes at once, after tab B added an image | ✖ **Loss.** The page-close save carried no revision and overwrote the slide, deleting B's image. | Page-close saves send `baseRevision` + `clientMerge.knownElementIds`; on a mismatch the server keeps the client's copy **plus** elements added elsewhere since (`mergeAddedElsewhere`); elements the client knew and removed stay removed. 2 backend tests. | ✔ B's image kept (images 1 → 1) and A's closing edit kept. |
| H-3 | Delete a slide with a background colour → undo | ✖ **Background lost.** Save docs were the editor's normalised `slide.elements`, which has no background keys (they live on the slide), so undo / re-created slides / conflict merges / pre-export saves replaced the stored doc without them. | `canvasDocForSave` always builds the doc from the whole slide (`buildCanvasDoc`), so every save path carries the background. | ✔ Re-created slide kept `#C9DAF8`; edit → undo kept it. |
| H-4 | Switch a slide's layout (code review; no alternative layouts offered to the test account) | ✖ **Loss in code.** The editor and the server both rebuilt the slide from the new layout's slots only, deleting images the user added; drag-and-dropped images (server `el_…` ids) were not even covered by the D-8 carry-over rule. | Both sides carry over user content: slot-less image / video / chart / table elements, `el-` / `img_` ids, and the background image. Server `applyLayout` writes with the revision it read and retries. Tests on both sides. | Unit tests only (not reachable from the test account's UI). |
| — | Media insert → edit → undo → reload | ✔ No loss | — | — |
| — | Duplicate a slide with 5 images; delete the copy → undo → reload | ✔ No loss (re-created copy has all 5) | — | — |
| — | Copy / paste an image to another slide; delete → undo → reload | ✔ No loss | — | — |
| — | Two tabs, stale undo (regression) | ✔ No loss: both tabs' changes kept | — | — |
| — | "Use as background" on / off; group / ungroup | Not completed in the browser (script couldn't drive the controls); covered by yesterday's manual check and backend tests. | — | — |

### Phase 1b implementation (26 Nov)

Code done and browser-tested on the dev setup, not committed. Frontend 507 / 507 and backend 1,314 / 1,314 tests pass; `vite build` passes.

| # | What was built | Browser result |
|---|---|---|
| B-3 | One rule, `showsSlideFallback(slide)` (`presentationHelpers.js`): the title / text / main-image placeholder only for slides never edited (`manuallyEdited` false). Used in **five** places that each had their own copy: the editor stage, slide thumbnails (`MinimapSlidePreview`), Present (`PresentMode`), the image / PDF export page (`ExportSlide`) and My Work deck previews (`DeckLiveSlideStage`). The editor flags a slide `manuallyEdited` locally on its first edit (as the server does on save), so an emptied slide is blank at once. **BE:** `isUserEmptiedSlide` (`slideHtml.js`): the PowerPoint export and the HTML export draw an edited, emptied slide blank with its background instead of the legacy title-and-image fallback (`test/emptiedSlideExport.test.js`, 2 tests). | ✔ Slide 1 emptied (select all → Delete): blank in the editor, its thumbnail and Present, also after reload (before: ghost "Untitled Presentation" + faded picture, in the thumbnail too). PDF / PowerPoint export not run locally (export worker off); covered by the backend test. |
| E-4a | Slide design → Background shows a **Background photo** block (thumbnail) when a photo is the background: **Edit photo** (selects it; the Image panel opens with Replace, Filters, Fit and the "Use as background" switch), **Detach from background**, **Remove photo** (full-width buttons, 16:9 thumbnail) (photo and background image in one undo step). The background photo is **drawn from the photo element itself** as a full-slide, non-clickable bottom layer (`resolveStageElements`; editor, Present and exports), so filters, effects, fit, flips and a replaced picture show; before, the slide painted a stored copy of the link and every adjustment was invisible. The stored copy now follows the element on save (exports, thumbnails). Clicking the background photo on the slide **selects it** and opens its Image panel (a second click goes to Slide design). While a photo is the background, **Crop is disabled** with the hint "Turn off Use as background to crop, move or resize it": a background photo fills the slide and isn't drawn as a movable picture. A background set from Design → Add image (no element) gets **Remove** only. Changed from the plan: the existing **Reset** keeps its name and meaning (it resets the colour and the photo); the new block has the clearer "Stop using as background". | ✔ Click on the background photo → selected, Image panel (Crop disabled + hint); switch off → normal photo with resize / rotate handles, kept after reload. Design block: Edit photo → Image panel (Crop / Replace / switch on). Stop using as background → saved (DB: photo element kept, `useAsBackground` false, no background image). Set again → Remove → after reload the photo element is gone and the background cleared. |

Environment notes: the hosted dev Redis dropped its connection several times. Each time, logins, signup and design creation failed for a few seconds ("Session and OTP services are temporarily unavailable"), then it reconnected. It is not caused by the editor code.

---

## 1. Working rules for every fix

- **Deploy order:** BE before FE when a fix touches both. D-1's backend part accepts saves without a version, so older frontends keep working and it can ship first on its own.
- **One phase at a time on staging.** Don't start QA on a phase until the previous phase's gate has passed. Phase 2 can be built in parallel but is QA'd after Phase 1.
- **Unit test.** Every fix comes with a test that fails before the fix and passes after it.
- **Retest on the testers' decks.** Keep the decks where images went missing. Don't repair them by hand until D-0 is closed.
- **Checkpoints.** Each item ends with a checklist. The last box, **Close-out**, is the same for every item:
  - tests merged and green;
  - the retest passing on staging;
  - the commit SHA on the ticket;
  - QA's sign-off.

---

## 2. Phase 0: stop the image loss (2.25 d)

**Goal:** remove the cause that matches the testers' report, and make any future loss visible in the logs. Ship as a hotfix, without waiting for Phase 1.

### D-0. Find out what removed the testers' images (High, BE + QA) 🟡

**Report:** the testing team worked on decks one day. The next day, images were missing from some slides.

**Testers' facts (25 Nov):**
- Each tester worked on their own deck, in different folders of the same workspace.
- The images were visible at the end of the day. The browser was then closed, and reopened the next morning with the tab restored.
- Images were missing from some slides, however they had been added: Media click, upload, or drag and drop.
- They saw no empty image box where the images had been, though they aren't certain.

**What the code rules out:**
- **Expired links.** Uploads are saved with the bucket address (`asset.service.js:109-128`, `s3.service.js:22-24`). On every load, the backend works out the key from that address and re-signs it (`presignSlideMedia.js:84-100`, `120-170`), slide background images included. The bucket is also public.
- **Browser storage.** The restored tab only reloads the deck from the server: `presentationEditorSession.js` stores ids, not slides. So the server copy had already lost the images.

**Smoke test 1, saves (backend):** `AthenaVI_backend/src/modules/presentation/test/slideSaveDataLoss.smoke.js`. Run it with `node --test src/modules/presentation/test/slideSaveDataLoss.smoke.js`.

| Test | Result | Meaning |
|---|---|---|
| Two tabs: tab B adds an image, then tab A autosaves its older copy | ✖ image removed | **Data loss confirmed.** Server writes: `[txt_title, el_…]`, then `[txt_title]`. |
| One tab: the server adds an image, then the editor's older copy autosaves | ✖ image removed | **Data loss confirmed** for the Media-click path. |
| Control: saves in order from an up-to-date copy | ✔ image kept | Normal saving works. |
| Control: an uploaded image saved with an expired link and no `s3Key` | ✔ fresh link on load | **Links are not the cause.** Background images too. |

**Smoke test 2, layout repair (frontend):** see D-8. It reproduces the loss for one person on their own deck, which matches the report best.

**Remaining steps:**
1. Ask the testers which layouts the affected slides used: metric, chart, process or cycle slides point to D-8.
2. Ask whether those slides were added that day, or existed before.
3. Ask whether anyone had the deck open in two tabs.
4. Once L-1 is live, read the logs on the next occurrence.

**Checkpoint**
- [x] Missing images classified: most likely removed elements, not broken links.
- [x] Loss paths reproduced: stale save (smoke test 1) and layout repair (smoke test 2).
- [ ] Testers' answers on layouts, slide age and tabs written on the ticket.

### D-8. Layout repair deletes user images on slides added this session (High, FE) ✔

**What happens.**
- The editor runs a layout-repair pass (`AIPptEditor.jsx:1973-2021`) every time the number of slides changes, and it goes over **every** slide.
- For each layout slide that `needsLayoutCanvasRepair` flags (`layoutCanvasService.js:375-388`), it recompiles the slide from its layout and **saves that over the server copy** (`:639-644`). It then replaces all local slides with the server's (`AIPptEditor.jsx:1999-2002`).
- The check skips slides marked `manuallyEdited`, which the server sets on every save. A slide added in the current session, though, is built in the browser without that flag (`AIPptEditor.jsx:3436-3450`), and stays without it until the deck is reloaded.
- So: add a layout slide, add images to it, then add another slide. The pass rebuilds the earlier slide from its layout. The user's images aren't part of the layout, so they are deleted on the server.

**Smoke test:** `src/utils/layoutRepairDataLoss.smoke.mjs`. Run it with `node --import ./scripts/test-resolve-hook.mjs --test src/utils/layoutRepairDataLoss.smoke.mjs`.
- It builds every shipped layout (245), adds a user image, and runs the real repair with saving stubbed.
- Slides loaded from the server (`manuallyEdited: true`) are never repaired ✔.
- Slides added this session: repair runs on **14 layouts** and saves all 14 **without the user's image** ✖. The 14 layouts:
  - `grid_metrics_mobile_v1`, `grid_metrics_masonry_v1`, `grid_metrics_asymmetric_v1`
  - `chart_donut_context_v1`, `chart_donut_context_right_v1`
  - `process_linner_horti_v1`, `process_linner_horti_four_v1`
  - `metric_two_v1`, `metric_two_split_v1`, `metric_three_v1`, `metric_three_vertical_v1`, `metric_three_cards_v1`, `metric_three_vertical_cards_v1`
  - `diagram_cycle_horizontal_v1`
- Caveat: the test compiles layouts without the deck's theme, so the exact list may differ in the app.

**Fix (code done 25 Nov, not committed).**
1. **Skip the user's slides.** `repairPresentationLayoutSlides` takes `skipSlideIds`. The editor passes every slide that was edited since load, has a canvas save pending, in flight or failed, or received a Media-panel image (`handleMediaAttached` now marks the slide edited). The deck-load repair passes the slides edited while loading.
2. **Carry over user content.** A rebuilt slide keeps:
   - elements only a user action creates: `el-…`, inserted in the editor, and `img_…`, attached from the Media panel;
   - a user-set background image.

   They go on top of the layout, in their original order (`carryOverUserContent`). Server-generated `el_…` elements are not carried, so they aren't duplicated.
3. **Merge, don't replace.** After a repair, only untouched slides are taken from the server (`mergeLoadedSlides`); edited slides keep their local copy.

**Changed from the first plan, to keep existing behaviour:**
- Slides added in the editor are not flagged `manuallyEdited: true`. That flag also makes "Regenerate slide" ask for an overwrite confirmation, which would change that flow. Point 1 covers the same case.
- The pass still runs when the slide count changes, not only on load. It still repairs genuinely broken slides, for example AI-added ones. Points 1–3 make each run safe.

**Tests:** `src/utils/layoutRepairUserContent.test.mjs` (in `npm test`, 8 tests) fails on the old code (5 of 8) and passes on the new code. Full frontend suite: 473 / 473. `vite build` passes.

**Checkpoint**
- [x] The test passes, with no layout dropping the user image, and runs in `npm test`.
- [x] Browser, dev setup (26 Nov): added a Grid Metrics Mobile slide (one of the 14 layouts), uploaded an image into its frame, added a second image, added another slide, reloaded. Both images were still there, on screen and in the DB, and the repair made no write to that slide.
- [ ] Same retest on staging.
- [ ] Close-out.

### L-1. Log every slide write (High, BE)

**Why.** Today a lost image leaves no trace. With this log, the next occurrence tells us which path caused it.

**Fix (code done 25 Nov, not committed).**
1. `presentationDao.updateSlide`, which every slide write goes through, wraps writes that change `elements` in `withSlideWriteLog` (`src/modules/presentation/slideWriteLog.js`). Before the write it reads the stored elements; after it, it logs one `slide_write` line with:
   - deck, slide, route and user (from a request-context middleware in `app.js`);
   - element and image counts before and after;
   - revision, once D-1 is in.
2. When a write removes images, including images in groups, or the background image, it logs a **warning** (`slide_write removed images`) with the removed ids. The warning also fires when a user deletes an image and the editor saves the whole canvas, so read it together with the route and user.
3. Safety: a failed read or failed log never affects the save, and a failed save still throws as before. `SLIDE_WRITE_LOG=off` turns it off. The cost is one primary-key read per elements write.
4. Ops: keep the logs for at least 14 days (the host captures stdout).

**Tests:** `slideWriteLog.test.js` (6 tests, added to `npm test`). Backend suite: 308 / 308.

**Checkpoint**
- [x] Unit tests: removed images produce the warning with route and user; a failed log never fails a save.
- [x] Browser, dev setup (26 Nov): deleting an image logged `slide_write removed images` with route, user and the removed id.
- [x] Noise reduced (26 Nov): `shouldWarn` warns only when the image count drops or the background image is removed, and not on the element `DELETE` route (3 tests). Browser: 0 warnings during Media click, upload and 3 reloads; the real image drop is still covered by the tests. Background: the warning had also fired when a layout's placeholder image only got a new id (image count unchanged), and on a user's own delete. Change it to warn only when the image count drops or the background image is removed, and to log at info level for the element `DELETE` route. Small change, about 0.1 d, inside L-1.
- [ ] Removing an image through a canvas save produces the warning on staging.
- [ ] Close-out.

### B-1. New blank slide shows text that can't be edited (High, FE) 🔵

**What happened.**
- **+ → Blank slide** created a slide with no elements and the description "Double click to add content.".
- The editor then drew its display-only placeholder (`SlideMockFallback`), which can't be selected, edited or deleted.
- The first slide of a new blank deck was not affected.

**Fix (coded, uncommitted).** `handleAddSlide` in `AIPptEditor.jsx` now gives a new blank slide two empty text boxes, a title and a body (`buildBlankSlideElements`), and no description.
- In the editor, the boxes show "Double-click to edit".
- In Present and in exports, they show nothing.

**Checkpoint**
- [x] Browser, dev setup (26 Nov): + → Blank slide shows two editable boxes; typing, deleting a box and reloading all keep the result.
- [x] The server keeps empty text boxes after a reload (checked in the DB).
- [ ] Close-out.

### B-2. Adding an image from the Media panel deletes the slide's background (High, BE) ✔

**Report (team, 26 Nov):** when an image is added, the slide's background colour disappears.

**Confirmed in the browser (26 Nov):**
- Slide background set to `#C9DAF8`, stored in the slide doc.
- A Media-panel click added an image; the slide turned white, and the DB showed `backgroundColor: null` right after `POST …/attach-asset`.
- Drag-and-drop on the same slide kept the colour, because it goes through `POST …/elements`.

**Cause:** `slideMedia.service.js:24` `getElementsDoc` rebuilds the doc from `version`, `canvas` and `elements` only. Every Media-panel click, upload and stock insert (`persistSlideImage`) therefore also drops the slide's `backgroundColor`, gradient keys, `backgroundFill` and `backgroundImage`. The editor's own endpoints use `slideEditor.service.js:52`, which keeps them.

**Fix (BE):**
1. Build the doc as `{ ...slide.elements, elements: [...slide.elements.elements] }`, the same as `slideEditor.service.js:52`. Better: export one `getElementsDoc` and use it in both files.
2. Test: attaching an image to a slide with a background colour, gradient or background image keeps all of them.

**Checkpoint**
- [x] Test passes (fails on the old code): `test/slideMediaBackground.test.js`, 4 tests. It also found a second place with the same bug, `applyImageToElements`, which rebuilt the doc the same way; both are fixed.
- [x] Browser, dev setup (26 Nov): slide with `#C9DAF8` → Media click and Media upload → colour stays on screen and in the DB, and after reload. Stock insert uses the same server code (`persistSlideImage`); not clicked separately.
- [ ] Close-out.

**Phase 0 gate:**
- D-8 smoke test green and the D-8 browser retest passing on staging.
- L-1 logging live, with the noise change.
- B-1 signed off.
- B-2: a Media insert keeps the background.
- Hotfix deployed.

---

## 3. Phase 1: safe saving (10 d)

**Goal:**
- No save, from any path, one tab or two, can remove work that is newer than what it carries.
- Ctrl+S saves right away.
- Review links keep showing images while the deck changes.

**Order:** N-1 → D-1 BE → D-2 → D-3 → D-1 FE → D-4 → D-5, C-1, K-1, R-1.

### N-1. Undo re-saves every slide in the deck (High, FE) ✔

**Confirmed in the browser (26 Nov):**
- One Ctrl+Z sent `PUT …/canvas` for every slide (5–6 writes), not just the slide that changed.
- In the two-tab test, tab A's undo saved its older copy of slide 3 and deleted the text box tab B had added (2 → 1 elements in the DB).

**Cause:** `restoreHistorySnapshot` queues a canvas save for every slide in the snapshot.

**Fix:** compare each slide's elements doc in the snapshot with the current one, and queue saves only for slides that differ. The slide add / delete / reorder part is D-5.

**Checkpoint**
- [ ] Test: an undo that changes one slide queues exactly one save.
- [ ] Browser: two tabs, B adds an element on slide 3, A undoes an edit on slide 1 → slide 3 keeps B's element.
- [ ] Close-out.

### D-1. Slide saves overwrite newer data (High, BE + FE) ✔

**What happens.**
- `putCanvas` replaces `slide.elements` with the request body (`slideEditor.service.js:276-281`).
- The element endpoints (`addElement` at `:303`, plus patch, delete, reorder and batch) read `slide.elements`, change it and write it back.
- No request carries a version, so whichever write lands last wins. A save built from an older copy removes anything added since (smoke test 1).
- The image editor already has this protection (`canvas.service.js:84-116`: `baseRevision`, 409 on conflict, `updateProjectIfUnchanged`). PPT slides don't.

**Fix (BE).**
1. Keep a `revision` number inside the slide's `elements` document, the same way the Canvas document does (`readRevision` / `normalizeCanvasData` in the canvas module). This needs no database migration. Return the revision with every slide.
2. Every write to `slide.elements` takes an optional `baseRevision`. If it is given and doesn't match, answer **409**. On success, increase the revision. The writes are:
   - `putCanvas`;
   - the element add / patch / delete / reorder / batch endpoints;
   - `patchSlide` when it changes background or canvas fields (`deckGeneration.service.js:5708-5736`);
   - the media attach and insert-stock endpoints.
3. Write with a guard on `updatedAt`, as `updateProjectIfUnchanged` does, so two requests arriving together can't both win.
4. A request without `baseRevision` keeps today's behaviour, so old frontends keep working during the rollout.

**Fix (FE).**
1. Store each slide's `revision` from every server response: load, save and element calls.
2. Send `baseRevision` with `saveCanvas`, the element calls and `patchSlide` (`presentationService.js`).
3. On 409:
   - fetch that slide again;
   - reapply the edits still pending locally;
   - save once more;
   - show "This slide was changed in another tab. Your changes were merged."

   If the same element was changed on both sides, keep the server version and tell the user, instead of silently overwriting.

**Checkpoint**
- [ ] BE: a save with an old `baseRevision` gets 409; a save without one still works (tests).
- [ ] BE: two saves sent at the same moment with the same base: one wins, one gets 409 (test).
- [ ] Smoke test 1 passes; move it into `npm test`.
- [ ] FE: two tabs on the same slide each add an image; after both save and reload, both images are there.
- [ ] Close-out.

### D-2. Two saves of one slide run at once (High, FE) ✔

**What happens.**
- `saveSlideCanvasNow` (`AIPptEditor.jsx:2085-2120`) has no per-slide queue. A new save can start while another is in flight, from:
  - the debounce timer (`:2131`);
  - the text-draft timer;
  - adding or duplicating a slide;
  - undo.
- If the older save lands last, the server keeps the older content.
- `canvasInflightRef` is a Set, so the first save to finish clears the slide while the second is still running. The "Saved" badge is then wrong.

**Fix.**
- Use one save chain per slide.
- While a save is in flight, mark the slide dirty instead of starting another.
- When the save returns and the slide is still dirty, send one follow-up save with the latest content.
- Count in-flight saves per slide instead of using a Set.

**Checkpoint**
- [ ] Test: a save started while another is in flight waits, then sends the latest content once.
- [ ] Rapid edits plus reload: the last edit is on the server.
- [ ] Close-out.

### D-3. Server replies overwrite or drop newer local edits (High, FE) ✔

**What happens.** `applySlideUpdate` (`AIPptEditor.jsx:1770-1782`) keeps local elements only when an element patch is pending.
- It ignores slides with a pending or in-flight canvas save, and slides edited since load.
- The patch queue is cleared before the request is sent (`usePptElementMutations.js:174-176`).
- So a reply that arrives within about 0.6 s of an edit replaces the local elements, and the next save sends the reverted state. Such replies include an assignee change, a refresh or a media attach.
- When it does keep the local elements, it throws away elements that only the server has, such as a newly attached image.

**Fix.**
- Keep the local elements when the slide has pending patches, a pending or in-flight canvas save, or edits since load.
- Even then, add incoming elements whose ids aren't in the local list.
- Track patches until their request settles, not until it is sent.

**Checkpoint**
- [ ] Test: a reply arriving during a pending save keeps the local edit and adds the server's new element.
- [ ] Move an element, change the assignee within half a second, then reload: the move is kept.
- [ ] Close-out.

### D-4. Media click goes through the server (High, FE) ✔

**What happens.**
- Clicking a library or stock image in the Media panel calls the server's attach endpoint, and relies on the reply to draw the image (`handleMediaAttached`, `AIPptEditor.jsx:4347`). The click paths are `MediaPanel.jsx:395-405` and `457-477`; the upload path is `:305-325`.
- Because of D-3, the reply is often dropped. The image doesn't show, and the next autosave removes it from the server (D-1).
- Clicking while an image is selected replaces that image instead of adding one.
- Uploading 3 files fills the same frame 3 times.

**Fix.**
1. A click, or a finished upload, adds the image locally through `onInsert` → `handleInsertElement`, as drag and drop does, and it is saved like any other insert. For stock images, import first (`stockService.importStock`), then insert with the workspace asset.
2. Every image payload carries `url`, `src`, `assetId` **and `s3Key`** (from `asset.key`). This covers MediaPanel's insert paths (`:324`, `:409-438`, `:541-564`, `:830-839`) and the device-frame upload (`AIPptEditor.jsx:4372-4379`).
3. Replace the selected image only when the panel was opened through **Replace**. Skip locked elements. A multi-file upload inserts each file as a new image.
4. Keep the server attach endpoint only for the Replace case, or retire it.

**Checkpoint**
- [ ] Click a Media image while another element is being moved: it appears straight away and is still there after reload.
- [ ] Clicking with an image selected adds a new image; Replace swaps it.
- [ ] Uploading 3 files adds 3 images.
- [ ] Close-out.

### D-5. Undo/redo of slide add / delete / reorder is local only (High, FE) ✔

**What happens.** `restoreHistorySnapshot` (`AIPptEditor.jsx:2336-2378`) only sets local state and queues canvas saves. It never sends a delete, add or reorder to the server:
- An undone "add slide" comes back on reload.
- An undone "delete slide" exists only locally, and its saves fail.
- Add, then Ctrl+Z before the server answers, then Ctrl+Y: the slide keeps a temporary id, and nothing on it is ever saved (`:2096` returns early).

**Fix.**
- Compare the slide ids and their order before and after the snapshot.
- Queue `deleteSlide`, `addSlide` (with its content) and `reorderSlides` through `enqueueSlidePersist`.
- Map ids again after re-creating a slide.

**Checkpoint**
- [ ] Add → undo → reload: the slide is gone.
- [ ] Delete → undo → reload: the slide is back with its content.
- [ ] Add → undo → redo → edit → reload: the edit is there.
- [ ] Close-out.

### C-1. Image editor: text being typed is not saved (High, FE) ✔

**What happens.** `isDirty` (`CanvasEditor.jsx:339-347`) doesn't include the text box being edited. The image editor never reads `activeTextEditDraft()`, which the PPT editor does (`AIPptEditor.jsx:2412`, `2442`).
- Closing or refreshing while typing gives no warning, and "Saved" is shown. The text is lost.
- Ctrl+S inside the text box opens the browser's own save dialog.

**Fix.**
- Subscribe to the text draft as AIPptEditor does.
- Include it in `isDirty`, in the save body, and in the save made when the page closes.
- Handle Ctrl+S inside the editable text.

**Checkpoint**
- [ ] Type in a text box, refresh straight away: the browser warns, and the text is there after reload.
- [ ] Close-out.

### K-1. Ctrl+S in the PPT editor (Medium, FE)

**What happens.**
- The PPT editor saves automatically, but Ctrl+S isn't handled, so the browser's "Save page as…" box opens. Users may think the deck was saved to their computer.
- The image editor already handles it (`CanvasEditor.jsx:1711`, listed in `canvasShortcuts.js`). Canva, Google Slides and Figma all save straight away on Ctrl+S.

**Fix.**
1. In the PPT key handler (`AIPptEditor.jsx:4626`), always block the browser's default on Ctrl/Cmd+S, including while typing in a text box or table cell.
2. Call `flushAllSavesNow()` (`:2159`), which already saves every pending slide, element patch, failed save and the text being typed. The existing badge then shows "Saving…" and "Saved".
3. View-only: block the browser box and do nothing else.
4. Add "Ctrl/Cmd + S — Save now" to the PPT shortcut list and to the save badge's tooltip.

Note: Ctrl+S only makes a save happen sooner. Data safety comes from D-8 and D-1 to D-3, which is why K-1 ships with them.

**Checkpoint**
- [ ] Ctrl+S while typing: no browser box; "Saving…" then "Saved"; the text is there after reload.
- [ ] Ctrl+S in view-only: no browser box, nothing saved.
- [ ] Close-out.

### R-1. Review link: images blank out while someone presents (High, BE + FE) ✔

**Report (team, 26 Nov):** images keep disappearing while presenting on review links.

**Confirmed in the browser (26 Nov):**
- A reviewer presented slide 5 from the view link while the owner made 3 small edits.
- Each edit made the review page re-fetch the deck (`GET /api/p/:token`, 4 fetches in the log).
- Every image came back with a new signature. The browser downloaded each image again, and the presented images were fully blank (0 of 2 visible) for about 1 s per edit. With production latency and larger images, the gap is longer.

**Not the cause in this test:** link expiry. With links signed for 60 s, images already shown kept showing after expiry, because the browser reuses images it already downloaded. Expiry still matters in two cases:
- a slide whose image was never downloaded;
- the 304 path: `GET /api/p/:token` answers 304 by a content-only ETag (`presentationShare.controller.js:108-112`), so a client can keep links older than the 1 h signing time.

**Fix:**
1. **BE:** links that stay the same between fetches. The bucket is public, so return the plain bucket address for own-bucket images (`presignSlideMedia.js`, review and editor payloads alike). If signed links must stay, sign with a fixed time window, so the same key gives the same link within the window, and fold the window into the ETag.
2. **FE:** when a deck update arrives, keep an image element's current link if its `s3Key` didn't change. If it did change, preload the new link and swap it in only once it has loaded (`PptCanvasElement` / Present).
3. This covers most of D-6 (links that never recover) too.

**Checkpoint**
- [ ] Browser: reviewer presents, owner edits 3 times → no blank frame (sample every 100 ms, as in the 26 Nov test).
- [ ] With signing kept: open the review link, wait past the link life, open a slide not seen yet → its image loads.
- [ ] Close-out.

**Phase 1 gate:**
- `test/slideRevision.test.js` (backend) and the layout-repair test (frontend) are green and in `npm test` (the backend smoke test was replaced by `test/slideRevision.test.js`).
- The two-tab retest passes, including undo in the older tab (N-1), and so does the rapid-edit retest (edits, then reload).
- The Media-click retest passes, and so does undo of add / delete.
- A review link presents without blanking while the owner edits (R-1).
- The image-loss hunt retests pass on staging: Media insert → undo (H-1), closing a stale tab (H-2), delete slide → undo keeps the background (H-3).
- No image-drop warnings from L-1 on staging for 2 days of QA use.

---

## 3b. Phase 1b: empty slides and background photos (1.5 d)

**Goal:** two problems the team hit while testing on 26 Nov. A slide you emptied is really empty, everywhere, and a photo used as the slide background can still be edited. Pulled forward because testers hit them now, both are small, and both touch code Phase 1 just changed.

**Order:** B-3 → E-4a. Committed as its own batch after the Phase 1 batch.

### B-3. Emptied slide shows a ghost title and picture (High, FE + BE) ✔

**Report (team, 26 Nov):** after deleting every element on a slide, a faded title ("Untitled Presentation") and picture appeared, inside a dashed box, and they couldn't be clicked or deleted.

**What happens.**
- A slide with no elements is drawn with a display-only placeholder (`SlideMockFallback`, `AIPptEditor.jsx` stage, `hasElements`): the slide's title, text and "main image".
- The main image comes from `slide.imageRef`, which the server sets on every Media insert (`persistSlideImage`) and keeps after the image is deleted. The title is the slide title (the deck name on a first slide).
- They aren't elements, so they can't be selected or deleted. Same family as B-1.
- The same placeholder is used by the image / PDF export page (`src/export-render/ExportSlide.jsx`), and the PowerPoint export falls back to `addLegacyToPptxSlide` (`export.service.js:1164-1177`), which draws the title, text and `imageRef` image. So an emptied slide also exports with the ghost content.

**Fix.**
1. **FE (editor and export page):** draw the placeholder only for slides that never had a canvas, i.e. not `manuallyEdited` and no elements. A slide the user edited and emptied is drawn blank (with its background), and new content can be added.
2. **BE (PowerPoint export):** an edited slide with an empty canvas exports blank with its background, instead of the legacy title-and-image fallback. Old or generated slides without a canvas keep today's fallback.
3. Tests on both sides for the rule.

**Checkpoint**
- [ ] Delete every element on a slide: the slide is blank; reload: still blank.
- [ ] Export that deck to PDF / image and PowerPoint: the slide is blank (background only).
- [ ] A generated slide that never had a canvas still shows its content.
- [ ] Close-out.

### E-4a. Background photo can't be selected or edited (High, FE) ✔

**Report (team, 26 Nov):** after "Use as background", the photo can't be clicked, enlarged or edited. Reset removed it from the background as expected.

**What happens.**
- A background photo is left out of the clickable layer on purpose (`isSlideBackgroundElement`), so clicks reach the slide, not the photo.
- Nothing else reaches it: clicking it selects nothing; Slide design → Background shows only "Add image" and "Reset", with no sign that a photo is the background. So it can't be cropped, filtered, replaced or turned back into a normal image (except through "Reset", whose name doesn't say that).
- Confirmed in the browser on 26 Nov (see E-4 in "Browser verification").

**Fix.**
1. Slide design → Background shows a **Background photo** block (thumbnail) whenever a photo is the background:
   - **Edit photo:** selects the photo and opens its Image panel (Crop, Filters, Replace, the "Use as background" switch);
   - **Stop using as background:** today's Reset, renamed; the photo goes back to a normal image that can be moved and resized;
   - **Remove:** deletes the photo.
2. Clicking an empty part of the slide opens Slide design → Background (from E-4).

**Checkpoint**
- [ ] Photo as background → Edit photo → crop, filter, replace: each applies and survives reload.
- [ ] Stop using as background → the photo is a normal image again (movable, resizable); reload keeps it.
- [ ] Remove → the background photo is gone; reload keeps it gone; no image-drop warning other than that removal.
- [ ] Clicking empty slide space opens Background.
- [ ] Close-out.

**Phase 1b gate:** every checkpoint above passes on staging.

---

## 4. Phase 2: wrong results from edits (1.25 d)

**Goal:** an edit changes what the user meant and nothing else. A second FE developer can build this in parallel with Phase 1; it is QA'd after Phase 1.

### E-1. Delete / arrows act on the previously selected element (High, FE) ✔

**What happens.**
- The keyboard handler uses `multiSelectIds` before `selectedElementId` (`AIPptEditor.jsx:4674`).
- Several actions set only `selectedElementId`:
  - inserting an element (`:3892`);
  - picking in the Layers panel (`:5644`);
  - undo (`:2367`);
  - image fill.
- So: click A, pick B in Layers, press Delete, and A is deleted.

**Fix.**
- Add one `selectElement(id)` helper that sets both values, and use it everywhere.
- Map temporary ids inside `multiSelectIds` when the server id arrives.

**Checkpoint**
- [ ] Click A, pick B in Layers, press Delete: B is deleted. Same after inserting a text box.
- [ ] Close-out.

### E-2. Editing a chart value deletes every series but the first (High, FE) ✔

**What happens.**
- `DesignContextPanel.jsx:391` rebuilds the data as `series: [{ name: …, values: nextValues }]`, which keeps only one series.
- The chart-type select (~`:400`) lists only 5 types. For other types it shows "Bar", and using it overwrites the real type.

**Fix.**
- Change only the edited series or cell and keep the rest.
- Build the select's options from `PPT_CHART_TYPES`.

**Checkpoint**
- [ ] Insert a two-series chart, edit one value: both series remain.
- [ ] Close-out.

### E-3. "Connect Google Sheets / Analytics" inserts made-up numbers (High, FE) ✔

**What happens.**
- For any pasted link, `ChartPanel.jsx:135-147` sets fixed values (`120, 190, 150, 220`), shows "Connected", and inserts them as the user's data.
- `csvData` is also kept when the source changes.

**Fix.**
- Hide or disable these sources ("Coming soon") until they really fetch data.
- Reset `csvData` when the source changes.

**Checkpoint**
- [ ] The sources can't insert sample numbers as real data.
- [ ] Close-out.

**Phase 2 gate:** every checkpoint above passes.

---

## 5. Phase 3: reported editor problems (3.5 d)

**Goal:** the problems the team reported, apart from data loss, are fixed: background selection, "Use as background" leftovers, the colour field and blank images in long sessions.

### E-4. Background colour / image can't be selected or removed (Medium, FE) ✔

**What happens.**
- Backgrounds are left out of the clickable elements on purpose (`presentationHelpers.js:59-93`), and clicking the empty slide only clears the selection.
- The Background controls appear only if the Design panel is already open (`EditorRightRail.jsx:445-450`).
- A layout's background block can't be clicked when it covers 90% or more of the slide, but can when it is smaller (`:76-90`).
- There is no "Remove background image" button.
- On a dark theme, white can't be chosen, because white counts as "no colour" (`:95-99`).
- On slides with a `design_bg` block, a picked colour may not show, because that block is drawn on top of it.

**Fix.** Points 1 and 2 moved to E-4a (Phase 1b); what stays here is the colour part.
1. ~~Clicking an empty part of the slide opens Design → Background.~~ → E-4a.
2. ~~In the Background section, add "Remove image" and "Select background image".~~ → E-4a.
3. The colour picker always wins:
   - update or remove the `design_bg` block;
   - store an explicit choice, so white works on dark themes.
4. One rule for what is clickable: background blocks stay out of the clickable layer, but are always reachable from the Background section.

**Checkpoint**
- [ ] Changing the colour works on slides with a `design_bg` block, and white works on a dark theme; both survive reload.
- [ ] Close-out.

### E-5. "Use as background" leaves things behind (Medium, FE) ✔

**What happens.**
- `handleToggleImageAsBackground` (`AIPptEditor.jsx:2846-2930`) only marks the image and hides it. A device frame, backing card or nearby decoration from the layout stays on the slide.
- A marked image counts as a full-slide photo (`canvasRenderDebug.js:35`), so hidden darkening overlays start to show, sometimes as a grey slab.
- The background keeps the image's fit, so "contain" leaves empty bands. Its crop and filters are dropped.

**Fix.** When an image becomes the background:
- remove or hide the decoration tied to its slot (same group, or the device frame found by `findDeviceFrameScreenImage`), as one undo step;
- count it as a full-slide photo only if `slide.backgroundImageElementId === el.id`;
- always use `cover`;
- clear the selection.

**Checkpoint**
- [ ] On a layout with a framed photo, "Use as background" leaves no frame, gap or grey slab; undo restores the layout.
- [ ] Close-out.

### E-6. Hex colour field (Medium, FE) ✔

**What happens.** `ColorFillPicker.jsx:202` applies any 3–8 digit hex while typing, so a half-typed `#3B82F` is applied. Anything else is dropped, so the field snaps back.

**Fix.** Keep a local draft string. Apply only a valid 3, 4, 6 or 8 digit hex, on blur or Enter.

**Checkpoint**
- [ ] Typing a hex value letter by letter applies only the final valid colour.
- [ ] Close-out.

### D-6. Broken image links never recover (Medium, FE + BE) ✔

**What happens.**
- When an image fails to load, `handleImageAuthError` does nothing (`AIPptEditor.jsx:4341-4345`). Present, thumbnails and the image editor pass no handler at all.
- A signed link lasts one hour (`PPT_IMAGE_PRESIGN_TTL_SEC`, default 3600, `presignSlideMedia.js:3-6`), so an editor left open longer shows blank images until reload.
- The bucket is public, so plain upload addresses always load. Only the signed links returned on load can expire. That makes this a long-session problem, not a cause of the missing images.

**Fix, preferred (BE only):** return the plain bucket address on load instead of a signed one. Nothing expires, and most of this item goes away.
**Fix, if signed links must stay:**
- FE: on an image error, ask for a fresh link for that one element and swap it in without reloading the slide. Do this at most once per element per minute.
- BE: add `POST /presentations/:id/media/sign`, taking `{ s3Key | url }[]` and returning signed links under the same rules as `presignSlideMedia.js` (own bucket only).

**Checkpoint**
- [ ] With the TTL set to 60 s on staging, an image stays visible past 60 s, or recovers by itself after an error.
- [ ] Close-out.

**Phase 3 gate:** QA retests the three reported problems on the testers' decks: background selection, "Use as background" and Media insert (fixed in D-4). All of them pass.

---

## 6. Phase 4: image editor and safety net (3.1 d)

**Goal:** the image editor places and keeps elements correctly, and support can restore a slide if something new ever goes wrong. D-7 is BE work and can start as soon as D-1 (BE) is merged.

### C-2 to C-5. Image editor (FE) ✔

- **C-2, recovery copy per tab:**
  - The draft key is per design (`canvasLocalDraft.js:21-23`), so a clean save in one tab clears another tab's draft.
  - A draft older than the server copy is deleted silently (`:67-70`).
  - **Fix:** add a tab id to the key. When the server copy is newer, offer the draft as "conflicting changes" instead of deleting it.
- **C-3, placement:**
  - `createElement` centres sizes made for 1920×1080 (`canvasDocument.js:158-168`), so items come out wider than small pages.
  - **Fix:** scale by `min(page.w/1920, page.h/1080)`, clamp to the page, and use `imagePlacementForPage` for Media images.
- **C-4, page resize:**
  - `resizeDocument` changes only the width and height (`canvasDocument.js:139-141`).
  - **Fix:** scale or centre the placements proportionally, and clamp them to the page.
- **C-5, layer:**
  - `layer: index + 1` (`canvasDocument.js:181`) can place a new element behind existing ones.
  - **Fix:** use `nextPptLayer(page.elements)`, as PPT does.

**Checkpoint**
- [ ] On a 1080×1080 page, inserted text and images fit the page; resizing the page keeps every element on it; a new element lands on top.
- [ ] Two tabs: a save in one doesn't delete the other's recovery copy.
- [ ] Close-out.

### D-7. Safety net: recent slide versions (Medium, BE)

**Why.** Phases 0 and 1 remove the known causes. Keeping recent versions still lets support restore work if something new goes wrong.

**Fix.**
- When a slide's `elements` is written, keep the previous document in a `slide_revisions` table (slide id, revision, document, user, time).
- Keep at least the last 20 versions per slide, and everything from the last 7 days.
- Add an admin or support route to list and restore versions. No editor UI is needed for now.

**Checkpoint**
- [ ] A support user can restore a slide to an earlier version on staging.
- [ ] Old revisions are pruned.
- [ ] Close-out.

**Phase 4 gate:** every checkpoint above passes.

---

## 7. Phase 5: editing feel (2.75 d, FE, both editors)

- **G-1, group drag ✔:**
  - Smart guides exclude only the grabbed element (`pptSmartGuides.js:83-84`), so a group snaps to its own members.
  - **Fix:** exclude every moving id.
- **G-2, text height at zoom ✔:**
  - `cssPxToCanvas` uses the zoomed rect height (`AIPptEditor.jsx:391-395`) against the unzoomed `scrollHeight`.
  - **Fix:** use `stageEl.offsetHeight`, as the table path does.
- **G-3, text box shrinks ·:**
  - Every input runs `syncHeight({ allowShrink: true })` (`PptCanvasElement.jsx:760-762`, `717`).
  - **Fix:** never shrink the box below the height it had when editing started.
- **G-4, rotated resize ·:**
  - `applyResizeFromHandle` uses deltas along the page axes.
  - **Fix:** rotate the delta into the element's frame (`unrotateDelta` exists), and keep the opposite corner fixed.
- **G-5, cropped image stretch ·:**
  - `croppedImageStyle` uses `objectFit: 'fill'` (`imageCrop.js:30-42`).
  - **Fix:** lock the aspect ratio on edge handles for cropped images, or fit the crop to the new aspect.

**Phase 5 gate:**
- A group drags smoothly.
- Text boxes keep the right height at 50% and 150% zoom and while typing.
- A rotated element resizes from its own corners.
- A cropped image doesn't stretch.

---

## 8. Backend changes: summary

| Change | Item | Phase | Notes |
|---|---|---|---|
| Log every slide write; warn when images drop | L-1 | 0 | Done (pushed). Warns only when the image count drops or the background image is removed. |
| Media attach keeps the slide's background keys (`slideMedia.service.js`) | B-2 | 0 | Done (pushed). |
| `revision` in `slide.elements`, `baseRevision` and 409 on every slide write, write guarded by `updatedAt` | D-1 | 1 | Code done. No migration. A request without `baseRevision` keeps today's behaviour. Mirror `canvas.service.js:84-116`. |
| Links that don't change between fetches: signing with a fixed time window, folded into the review and deck-render ETags | R-1 (+ D-6) | 1 | Code done. Stops review-link images blanking on every deck update. |
| Page-close saves: `clientMerge` (known element ids) → server keeps elements added elsewhere instead of overwriting | H-2 | 1 | Code done. |
| `applyLayout` keeps user-added elements and the background image; written with the revision it read, retried | H-4 | 1 | Code done. |
| PowerPoint and HTML export: an edited, emptied slide exports blank instead of the legacy title-and-image fallback | B-3 | 1b | Code done. |
| `POST /presentations/:id/media/sign` | D-6 | 3 | Only if signed links stay. Same own-bucket rules as `presignSlideMedia.js`. |
| `slide_revisions` table with restore route | D-7 | 4 | At least 20 per slide, and everything from the last 7 days. |

Nothing else in the backend needs to change for this plan.

---

## 9. Later (from the audit, not scheduled)

- **PPT:**
  - Status, transition or fit changes on a slide still being created are lost (`:4884`, `:4856`, `:2945`).
  - Shortcuts act behind open popups (`:4625-4818`).
  - Ctrl+B / Ctrl+I while typing is lost (`:2560`).
  - Dropping a file on a hero-photo slide replaces the photo.
  - Replace resets fit to cover, rejects HEIC and flattens GIFs.
  - Device-frame fill may keep the old `s3Key` (`DeviceFrameVisual.jsx:476-488`).
- **Both editors:**
  - Formatting lands one character off after Enter (`pptTextContent.js:816-827`).
  - The rotation field shows stale values (`ElementTransformControls.jsx:104-110`).
  - Media tabs show old results under the wrong tab (`MediaPanel.jsx:154-200`).
  - Library videos insert as broken images in the image editor.
- **Parity:**
  - Thumbnails are laid out at 1920 instead of 900 (`MinimapSlidePreview.jsx:154-158`).
  - Present draws empty slides differently (`PresentMode.jsx:392-396`).
- **Image editor:**
  - The tab-close save skips the conflict check (`CanvasEditor.jsx:718`).
  - A title error shows as "Not saved" (`:438-443`).
  - PDF export is always 1× (`CanvasExportModal.jsx:167`).
  - Brand photos are empty and the Embed tab does nothing (`CanvasLeftDrawer.jsx:61-75`).
