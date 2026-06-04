import { MdAnimation } from 'react-icons/md';
import {
  getAnimationOptionsForClip,
  getEntranceAnimation,
  setEntranceAnimation,
} from '../../../../utils/clipAnimations';

const SectionHeader = ({ icon, label }) => (
  <div className="scp-section-header">
    <div className="scp-section-header__icon">{icon}</div>
    <span className="scp-section-header__label">{label}</span>
  </div>
);

const SliderRow = ({ label, value, min, max, step = 0.1, unit = '', onChange }) => (
  <div className="scp-slider-row" style={{ padding: '6px 0', width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span className="scp-value-badge">
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', height: 4, cursor: 'pointer' }}
    />
  </div>
);

/**
 * Entrance animation controls for the selected layer (right panel).
 * Saved on clip.animations and persisted via project save / export mapper.
 */
const LayerAnimationPanel = ({ activeLayer, updateLayer }) => {
  const entrance = getEntranceAnimation(activeLayer);
  const currentType = entrance?.type || 'none';
  const options = getAnimationOptionsForClip(activeLayer);

  const applyEntrance = (patch) => {
    const next = setEntranceAnimation(activeLayer, patch);
    updateLayer({ animations: next.animations });
  };

  return (
    <>
      <SectionHeader icon={<MdAnimation size={14} />} label="Animation" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 6,
          marginBottom: 8,
        }}
      >
        {options.map((opt) => {
          const active = currentType === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                applyEntrance({
                  type: opt.value,
                  duration: entrance?.duration ?? 0.6,
                  delay: entrance?.delay ?? 0,
                })
              }
              style={{
                padding: '8px 6px',
                borderRadius: 8,
                border: `1px solid ${active ? 'var(--primary, #1a73e8)' : 'var(--border-subtle, rgba(0,0,0,0.1))'}`,
                background: active ? 'rgba(26, 115, 232, 0.08)' : 'white',
                color: active ? 'var(--primary, #1a73e8)' : 'var(--text-main, #1a1b1c)',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {currentType !== 'none' && (
        <div
          style={{
            background: 'var(--bg-surface, #f8fafc)',
            border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
            borderRadius: 10,
            padding: '8px 10px',
          }}
        >
          <SliderRow
            label="Duration"
            value={entrance?.duration ?? 0.6}
            min={0.2}
            max={3}
            step={0.1}
            unit="s"
            onChange={(v) => applyEntrance({ duration: v })}
          />
          <SliderRow
            label="Delay"
            value={entrance?.delay ?? 0}
            min={0}
            max={2}
            step={0.1}
            unit="s"
            onChange={(v) => applyEntrance({ delay: v })}
          />
          <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Plays when this layer appears in the scene. Press play on the canvas to preview.
          </p>
        </div>
      )}
    </>
  );
};

export default LayerAnimationPanel;
