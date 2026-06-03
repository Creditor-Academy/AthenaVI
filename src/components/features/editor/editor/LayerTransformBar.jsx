import './LayerTransformBar.css';

/**
 * X / Y / W / H controls for the selected layer (right sidebar only).
 */
const LayerTransformBar = ({ clip, onPositionChange, onSizeChange }) => {
  const x = Math.round(clip?.position?.x ?? 0);
  const y = Math.round(clip?.position?.y ?? 0);
  const w = Math.round(clip?.size?.width ?? 200);
  const h = Math.round(clip?.size?.height ?? 120);

  const numInput = (label, value, onChange) => (
    <label className="layer-transform-bar__field">
      <span className="layer-transform-bar__label">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
    </label>
  );

  return (
    <div className="layer-transform-bar" onClick={(e) => e.stopPropagation()}>
      {numInput('X', x, (v) => onPositionChange(v, y))}
      {numInput('Y', y, (v) => onPositionChange(x, v))}
      <div className="layer-transform-bar__divider" aria-hidden />
      {numInput('W', w, (v) => onSizeChange(w, h))}
      {numInput('H', h, (v) => onSizeChange(w, v))}
    </div>
  );
};

export default LayerTransformBar;
