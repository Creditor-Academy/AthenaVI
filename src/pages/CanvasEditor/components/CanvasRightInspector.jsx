import ElementPropertiesPanel from '../../Slides/AIPptComponents/ElementPropertiesPanel'
import ElementTransformControls from '../../Slides/AIPptComponents/ElementTransformControls'
import ColorFillPicker from '../../Slides/AIPptComponents/insert/ColorFillPicker'

const SIZE_PRESETS_SHORT = [
  { id: 'instagram-post', label: 'Instagram Post', width: 1080, height: 1080 },
  { id: 'instagram-reel', label: 'Story / Reel', width: 1080, height: 1920 },
  { id: 'youtube-banner', label: 'YouTube Banner', width: 2560, height: 1440 },
  { id: 'linkedin-post', label: 'LinkedIn Post', width: 1200, height: 627 },
  { id: 'flyer', label: 'Flyer', width: 1275, height: 1650 },
  { id: 'a4', label: 'A4 Document', width: 794, height: 1123 },
]

export default function CanvasRightInspector({
  selectedElement,
  activeCanvas,
  onUpdatePlacement,
  onUpdateContent,
  onUpdateBackground,
  onApplyPresetSize,
  onToggleLock,
}) {
  return (
    <aside className="canva-inspector">
      <header className="canva-inspector-header">
        <h3>{selectedElement ? 'Element Properties' : 'Canvas Settings'}</h3>
      </header>

      <div className="canva-inspector-body">
        {selectedElement ? (
          <div className="canva-inspector-stack">
            <ElementTransformControls
              placement={selectedElement.placement}
              onChangePlacement={(patch) => onUpdatePlacement(selectedElement.id, patch)}
            />
            <ElementPropertiesPanel
              element={selectedElement}
              palette={{ bg: '#FFF', surface: '#FFF', text: '#000', title: '#000', accent: '#2563EB' }}
              onChangeContent={(patch) => onUpdateContent(selectedElement.id, patch)}
              onChangePlacement={(patch) => onUpdatePlacement(selectedElement.id, patch)}
              onToggleLock={() => onToggleLock(selectedElement.id)}
            />
          </div>
        ) : (
          <div className="canva-inspector-stack">
            <div className="canva-inspector-group">
              <h4 className="canva-inspector-group-title">Background Sheet</h4>
              <div className="canva-inspector-field">
                <span>Color Fill</span>
                <ColorFillPicker
                  value={{ type: 'solid', color: activeCanvas?.background || '#FFFFFF' }}
                  palette={{ bg: '#FFF', surface: '#FFF', text: '#000', title: '#000', accent: '#2563EB' }}
                  onChange={(fill) => onUpdateBackground(fill?.color || fill)}
                />
              </div>
            </div>

            <div className="canva-inspector-group">
              <h4 className="canva-inspector-group-title">Quick Dimensions</h4>
              <div className="canva-inspector-presets-grid">
                {SIZE_PRESETS_SHORT.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    className="canva-inspector-preset-card"
                    onClick={() => onApplyPresetSize(preset)}
                  >
                    <strong>{preset.label}</strong>
                    <small>{preset.width} × {preset.height}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
