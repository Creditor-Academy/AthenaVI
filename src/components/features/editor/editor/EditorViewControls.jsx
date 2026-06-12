import './EditorViewControls.css'

const EditorViewControls = ({
  editorView,
  onChange,
  onRestoreVersion,
  versionCount = 0,
}) => (
  <div className="editor-view-controls">
    <label className="editor-view-controls__label">
      <input
        type="checkbox"
        checked={editorView.snapToGrid}
        onChange={(e) => onChange({ snapToGrid: e.target.checked })}
      />
      Snap to grid
    </label>
    <label className="editor-view-controls__label">
      <input
        type="checkbox"
        checked={editorView.showGuides}
        onChange={(e) => onChange({ showGuides: e.target.checked })}
      />
      Grid & guides
    </label>
    <label className="editor-view-controls__label">
      <input
        type="checkbox"
        checked={editorView.showSafeZone}
        onChange={(e) => onChange({ showSafeZone: e.target.checked })}
      />
      Safe zone
    </label>
    {versionCount > 0 && (
      <button
        type="button"
        className="editor-view-controls__restore"
        onClick={onRestoreVersion}
      >
        Restore version ({versionCount})
      </button>
    )}
  </div>
)

export default EditorViewControls
