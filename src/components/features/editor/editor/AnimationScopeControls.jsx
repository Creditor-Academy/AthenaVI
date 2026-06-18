import './AnimationScopeControls.css';

const SliderRow = ({ label, value, min, max, step = 0.1, unit = '', onChange }) => (
  <div className="anim-scope-slider">
    <div className="anim-scope-slider__head">
      <span className="anim-scope-slider__label">{label}</span>
      <span className="anim-scope-slider__value">
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      className="anim-scope-slider__input"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
    />
  </div>
);

export const ANIMATION_APPLY_SCOPE = {
  ENTRANCE: 'entrance',
  EXIT: 'exit',
  BOTH: 'both',
};

/**
 * Entrance / Exit / Both chips + timing sliders shown below a selected animation preset.
 */
const AnimationScopeControls = ({
  presetLabel,
  activeScope,
  onScopeChange,
  entrance,
  exit,
  onPatchEntrance,
  onPatchExit,
  onClear,
  showTypewriterSpeed = false,
  inline = false,
}) => {
  const showEntranceTiming =
    activeScope === ANIMATION_APPLY_SCOPE.ENTRANCE || activeScope === ANIMATION_APPLY_SCOPE.BOTH;
  const showExitTiming =
    activeScope === ANIMATION_APPLY_SCOPE.EXIT || activeScope === ANIMATION_APPLY_SCOPE.BOTH;

  return (
    <div className={`anim-scope-controls ${inline ? 'anim-scope-controls--inline' : ''}`}>
      <div className="anim-scope-controls__label">
        Apply <strong>{presetLabel}</strong> to
      </div>
      <div className="anim-scope-controls__chips">
        {[
          { id: ANIMATION_APPLY_SCOPE.ENTRANCE, label: 'Entrance' },
          { id: ANIMATION_APPLY_SCOPE.EXIT, label: 'Exit' },
          { id: ANIMATION_APPLY_SCOPE.BOTH, label: 'Both' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`anim-scope-controls__chip ${activeScope === id ? 'anim-scope-controls__chip--active' : ''}`}
            onClick={() => onScopeChange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {showEntranceTiming && (
        <div className="anim-scope-controls__timing">
          <SliderRow
            label="Entrance duration"
            value={entrance?.duration ?? 0.75}
            min={0.2}
            max={3}
            step={0.1}
            unit="s"
            onChange={(v) => onPatchEntrance({ duration: v })}
          />
          <SliderRow
            label="Entrance delay"
            value={entrance?.delay ?? 0}
            min={0}
            max={2}
            step={0.1}
            unit="s"
            onChange={(v) => onPatchEntrance({ delay: v })}
          />
          {showTypewriterSpeed && (
            <SliderRow
              label="Speed"
              value={entrance?.speed ?? 1}
              min={0.25}
              max={3}
              step={0.25}
              unit="×"
              onChange={(v) => onPatchEntrance({ speed: v, previewSeed: Date.now() })}
            />
          )}
        </div>
      )}

      {showExitTiming && (
        <div className="anim-scope-controls__timing">
          <SliderRow
            label="Exit duration"
            value={exit?.duration ?? 0.75}
            min={0.2}
            max={3}
            step={0.1}
            unit="s"
            onChange={(v) => onPatchExit({ duration: v })}
          />
          <SliderRow
            label="Exit delay (from end)"
            value={exit?.delay ?? 0}
            min={0}
            max={2}
            step={0.1}
            unit="s"
            onChange={(v) => onPatchExit({ delay: v })}
          />
        </div>
      )}

      {onClear ? (
        <button type="button" className="anim-scope-controls__clear" onClick={onClear}>
          Remove animation
        </button>
      ) : null}
    </div>
  );
};

export default AnimationScopeControls;
