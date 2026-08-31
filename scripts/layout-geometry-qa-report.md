# Layout Geometry QA Report

Generated after Layout Geometry Fidelity Fix implementation.

## Root Cause

Geometry drifted from layout JSON at compile time due to:
1. **`insetForRole()`** — role-based grid insets (0.35–2.4 units) shrinking every slot
2. **`adjustSlotRegion()`** — ±0.75 row nudges on shared boundaries
3. **`packColumnTextStacks()`** — reallocating y/height based on content length
4. **`boxToPlacement()`** — min 40×24 dimension inflation
5. **Backend `directionalImageInsetsPx()`** — soft pixel insets on all images
6. **Runtime `onHeightChange`** — unbounded text height growth

## Fix Summary

- New authoritative compiler: `src/utils/compileLayoutGeometry.js`
- Frontend `compileDeckLayoutToElements.js` uses geometry map; no default insets/packing
- Backend `layoutToElements.js` synced via `compileLayoutGeometry.js`
- Text fits inside slots via `fitTextToSlot()`; height capped at `slotMaxHeight`
- Debug logging via `debugGeometry` option (dev mode in `layoutCanvasService`)

## QA Results (137 layouts)

| Metric | Result |
|--------|--------|
| **Renderer pass rate** | **100%** (137/137) |
| Renderer failures | 0 |
| Layout data issues (text overlap in source) | 94 layouts flagged |

Run QA: `npx vite-node scripts/layout-geometry-qa.mjs`  
Run unit tests: `npx vite-node src/utils/compileLayoutGeometry.test.mjs`

## Expected Geometry Transforms (not drift)

These slots intentionally differ from raw grid geometry:
- Device frame image slots (screen inset within device chrome)
- Icon/avatar decoration slots (`centerIconPlacement`)
- Metric image squares (`METRIC_IMAGE_*`)
- Step circles (`STEP_*_CIRCLE`)
- Process/timeline layouts (`finalizeTimelineShapes` post-processing)

## LAYOUT DATA ISSUE (source JSON)

94 layouts show text/text overlap in validation. These are adjacent slots whose grid regions share boundaries (e.g. title + subtitle rows). This is expected grid adjacency, not renderer drift. No layout JSON files were modified.

## Canonical Coordinate System

- **1920 × 1080** for 16:9
- Grid regions → direct pixel conversion, no implicit insets
- Canvas viewport scales via `%` placement + `--ppt-canvas-zoom`

## Files Changed

| File | Change |
|------|--------|
| `src/utils/compileLayoutGeometry.js` | NEW — geometry compiler |
| `src/utils/compileDeckLayoutToElements.js` | Uses geometry compiler |
| `src/utils/canvasTypography.js` | `fitTextToSlot()` |
| `src/utils/layoutCanvasService.js` | Dev debug logging |
| `src/pages/Slides/AIPptComponents/AIPptEditor.jsx` | Cap text height to slot |
| `src/pages/Slides/AIPptComponents/PptCanvasElement.jsx` | Clip text to slot |
| `AthenaVI_backend/.../compileLayoutGeometry.js` | NEW — backend mirror |
| `AthenaVI_backend/.../layoutToElements.js` | Synced geometry rules |
| `scripts/layout-geometry-qa.mjs` | NEW — QA runner |
| `src/utils/compileLayoutGeometry.test.mjs` | NEW — unit tests |
