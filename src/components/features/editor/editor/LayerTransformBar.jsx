import './LayerTransformBar.css';

/**
 * Width / height controls for the selected layer (right sidebar Position section).
 */
const LayerTransformBar = ({ clip, onSizeChange }) => {
  const w = Math.round(clip?.size?.width ?? 200);
  const h = Math.round(clip?.size?.height ?? 120);

  const numInput = (label, value, onChange) => (
    <label className="layer-transform-bar__field">
      <span className="layer-transform-bar__label">{label}</span>
      <input
        type="number"
        min={1}
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
      {numInput('Width', w, (v) => onSizeChange(v, h))}
      {numInput('Height', h, (v) => onSizeChange(w, v))}
    </div>
  );
};

export default LayerTransformBar;
