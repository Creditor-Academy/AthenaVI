const EditorViewControls = ({
  editorView,
  onChange,
  onRestoreVersion,
  versionCount = 0,
}) => (
  <div
    className="editor-view-controls"
    style={{
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 25,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      background: 'rgba(255,255,255,0.92)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: 10,
      padding: '8px 10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--text-muted, #64748b)',
    }}
  >
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={editorView.snapToGrid}
        onChange={(e) => onChange({ snapToGrid: e.target.checked })}
      />
      Snap to grid
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={editorView.showGuides}
        onChange={(e) => onChange({ showGuides: e.target.checked })}
      />
      Grid & guides
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
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
        className="scp-btn scp-btn--ghost"
        style={{ fontSize: 10, padding: '4px 6px', marginTop: 4 }}
        onClick={onRestoreVersion}
      >
        Restore version ({versionCount})
      </button>
    )}
  </div>
);

export default EditorViewControls;
