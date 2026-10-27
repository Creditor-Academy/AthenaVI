# Canvas Editor PPT imports

Canvas reuses the presentation editor by import. Files under `src/pages/Slides/` stay frozen: do not edit them for canvas work. Change canvas-owned files, or wrap the shared component.

## Frozen modules (`src/pages/Slides/`)

| Module | Imported by |
| --- | --- |
| `AIPptComponents/PptCanvasElement.jsx` | `components/CanvasStage.jsx`, `CanvasExportFrame.jsx` |
| `AIPptComponents/PptCanvasGuidesOverlay.jsx` | `components/CanvasStage.jsx` |
| `AIPptComponents/PptElementContextMenu.jsx` | `CanvasEditor.jsx` |
| `AIPptComponents/PptQuickMenu.jsx` | `CanvasEditor.jsx` |
| `AIPptComponents/ImageCropModal.jsx` | `CanvasEditor.jsx` (wrapped by `components/CanvasCropDialog.jsx`) |
| `AIPptComponents/ElementTransformControls.jsx` | `components/CanvasContextBar.jsx` |
| `AIPptComponents/insert/TextPanel.jsx` | `components/CanvasLeftDrawer.jsx` |
| `AIPptComponents/insert/MediaPanel.jsx` | `components/CanvasLeftDrawer.jsx` |
| `AIPptComponents/insert/ShapePanel.jsx` | `components/CanvasLeftDrawer.jsx` |
| `AIPptComponents/insert/GraphicsPanel.jsx` | `components/CanvasLeftDrawer.jsx` |
| `AIPptComponents/insert/ChartPanel.jsx` | `components/CanvasLeftDrawer.jsx` |
| `AIPptComponents/insert/TablePopover.jsx` | `components/CanvasLeftDrawer.jsx` |
| `AIPptComponents/insert/EmbedPanel.jsx` | `components/CanvasLeftDrawer.jsx` |
| `AIPptComponents/insert/ColorFillPicker.jsx` | `CanvasLeftDrawer.jsx`, `CanvasRightInspector.jsx`, `CanvasContextBar.jsx` |
| `AIPptComponents/insert/DesignContextPanel.jsx` | `components/CanvasRightInspector.jsx` |
| `AIPptComponents/insert/TextEffectsPanel.jsx` | `components/CanvasRightInspector.jsx` |
| `AIPptComponents/insert/ElementToolbar.jsx` | `components/CanvasContextBar.jsx` |
| `AIPptComponents/pptEditorExtras.css` | `CanvasEditor.jsx` |
| `AIPptGenerator.css` | `CanvasEditor.jsx` |
| `AIPptComponents/insert/insertPanels.css` | `components/CanvasLeftDrawer.jsx` |

## Shared helpers

These are not the frozen slide editor. They are listed so a canvas change can see every PPT-named import.

| Module | Imported by |
| --- | --- |
| `components/ppt/DeviceFrameVisual.jsx` | `CanvasEditor.jsx`, `components/CanvasStage.jsx` |
| `utils/pptGroupUtils.js` | `CanvasEditor.jsx`, `components/CanvasStage.jsx` |
| `utils/pptAlignUtils.js` | `CanvasEditor.jsx` |
| `utils/pptSmartFormat.js` | `CanvasEditor.jsx` |
| `utils/pptTextContent.js` | `CanvasEditor.jsx`, `CanvasLeftDrawer.jsx`, `CanvasRightInspector.jsx`, `CanvasContextBar.jsx` |
| `utils/pptSmartGuides.js` | `components/CanvasStage.jsx` |
| `constants/pptInsertCatalog.js` | `canvasDocument.js` |
