# Presentation export: manual QA checklist (Phase 7.2)

For whoever fills in the PowerPoint and Google Slides columns of the compatibility matrix (section 6 of [PPT_EXPORT_PRODUCTION_PLAN.md](PPT_EXPORT_PRODUCTION_PLAN.md)). The LibreOffice column and the PDF scores are measured automatically. These apps can only be checked by a person.

Time needed: about 15 minutes per deck per app.

## 1. Get the test files

On a machine with the backend checked out, LibreOffice installed, and the frontend running (or a deployed frontend):

```
cd AthenaVI_backend
node scripts/presentation-eval/export-fidelity.js --label qa --qa-pack \
  --render-url https://<frontend>/export-render.html
```

This writes `.eval/export-fidelity/qa/qa-pack/`:

| File | Open it in |
|---|---|
| `<deck>-powerpoint.pptx` | PowerPoint for Windows, Mac and web |
| `<deck>-google-slides.pptx` | Google Slides (Drive → New → File upload, then "Open with Google Slides") |
| `<deck>.pdf` | Any PDF viewer: this is how the slide should look |
| `report.html` | The editor's rendering of every slide, next to the PDF and PPTX |

Decks: `ai-light`, `ai-dark`, `ai-editorial` (AI-generated), `kitchen-sink` (every element type, built by hand), `four-three` (4:3), `forty-slides` (large deck).

## 2. For each deck, in each app

Open the file and compare every slide with the same slide in `<deck>.pdf`.

**Opening**
- [ ] It opens without a "repair" or "some content couldn't be read" message.
- [ ] The slide count and order match the PDF.
- [ ] The slide size is right (16:9, or 4:3 for `four-three`).

**Text**
- [ ] The fonts look the same (PowerPoint: embedded; Google Slides: the same Google Font by name).
- [ ] Each text box breaks its lines in the same places as the PDF, with nothing cut off or overflowing.
- [ ] Bullets and numbering, bold, italic, underline, strikethrough and uppercase are kept.
- [ ] Links open the right address.
- [ ] Text can be clicked and edited.

**Shapes, lines and backgrounds**
- [ ] Shapes have the right outline, fill, border (including dashed) and transparency.
- [ ] Gradients show in PowerPoint. In the Google Slides file they are pictures, and look right.
- [ ] Shadows show. Glow shows in PowerPoint (Google Slides ignores glow on elements: expected).
- [ ] Slide backgrounds (colour, gradient, picture) are right.

**Pictures**
- [ ] Cropped photos show the same part as the editor, undistorted.
- [ ] Circle, rounded, arch, hexagon and blob photos keep their shape.
- [ ] Photos with filters, faded edges, device frames or other masks look right (they are pictures).

**Tables and charts**
- [ ] Tables: cells, colours, borders and text match, and the cells can be edited.
- [ ] Charts: bars, lines and colours match. In PowerPoint, right-click → Edit Data opens the data. (Google Slides turns charts into pictures on import: expected.)

**Other**
- [ ] Curved and glitch text look right (pictures), and their words are in the speaker notes.
- [ ] Embedded videos and web content show a picture with a working link.
- [ ] Speaker notes are there.
- [ ] Grouped elements move together (PowerPoint).

## 3. Record the result

In section 6 of the plan, one cell per deck and app:

- ✅ matches the PDF on every slide;
- ⚠️ a known, documented difference only (see [PPT_EXPORT_SUPPORT_NOTE.md](PPT_EXPORT_SUPPORT_NOTE.md)); write which one;
- ❌ anything else. Open a ticket with: the deck, slide number, the app and version, a screenshot of the app next to the PDF, and the file.

Also note the app version (PowerPoint: File → Account → About; Google Slides: date checked).

## 4. Ten real customer decks

1. **Permission first.** Ask the owner, or use an anonymised copy (duplicate the deck and replace the text). Never share a customer's file outside the team.
2. In the editor, export each deck twice: **PowerPoint** ("Made for: PowerPoint") and **Google Slides** ("Made for: Google Slides"), all slides. Also export the **PDF**.
3. Run sections 2 and 3 on them in PowerPoint (at least one platform) and Google Slides.
4. Write the results in a new table under section 6 of the plan: deck (anonymised name), slide count, PowerPoint, Google Slides, notes.
5. Delete the downloaded files when finished.

Pick a mix: at least 4 AI-generated decks, 4 decks built or heavily edited by hand, 1 with many photos and 1 with charts or tables.

## 5. When the matrix is done

Checkpoint 7 also needs, from production:
- the PDF export success rate over 7 days (≥ 99.5%): `presentation_export_finished` log lines, or `GET /health/export` → `metrics`;
- no `export_renderer_unavailable` warnings in that week. Each one means an export fell back to the older server renderer.
