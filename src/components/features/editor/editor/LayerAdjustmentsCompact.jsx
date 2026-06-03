import { MdOpacity, MdBrightness6, MdContrast, MdBlurOn, MdPalette, MdImage } from 'react-icons/md';
import { buildCssFilterString } from '../../../../utils/cssFilterUtils';
import './LayerAdjustmentsCompact.css';

const OPACITY_PRESETS = [25, 50, 75, 100];
const FILTER_PRESETS = [
  { id: 'normal', label: 'Normal', brightness: 1, contrast: 1, saturate: 1 },
  { id: 'bright', label: 'Bright', brightness: 1.2, contrast: 1, saturate: 1.05 },
  { id: 'vivid', label: 'Vivid', brightness: 1.05, contrast: 1.15, saturate: 1.25 },
  { id: 'muted', label: 'Muted', brightness: 0.95, contrast: 0.9, saturate: 0.75 },
  { id: 'dramatic', label: 'Drama', brightness: 0.9, contrast: 1.35, saturate: 0.9 },
];

const Stepper = ({ label, value, min, max, step, unit, onChange, icon }) => (
  <div className="adj-compact-row">
    <span className="adj-compact-row__label">
      {icon}
      {label}
    </span>
    <div className="adj-compact-stepper">
      <button
        type="button"
        className="adj-compact-stepper__btn"
        onClick={() => onChange(Math.max(min, value - step))}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <span className="adj-compact-stepper__value">
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
        {unit}
      </span>
      <button
        type="button"
        className="adj-compact-stepper__btn"
        onClick={() => onChange(Math.min(max, value + step))}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  </div>
);

/**
 * Compact adjustment controls (no range sliders) for image / media layers.
 */
const LayerAdjustmentsCompact = ({
  opacity = 1,
  cssFilters = {},
  onOpacityChange,
  onFilterChange,
  showInlinePreview = true,
  previewSrc = null,
  previewObjectFit = 'cover',
}) => {
  const cf = cssFilters;
  const opacityPct = Math.round((opacity ?? 1) * 100);
  const activePreset =
    FILTER_PRESETS.find(
      (p) =>
        Math.abs((cf.brightness ?? 1) - p.brightness) < 0.02 &&
        Math.abs((cf.contrast ?? 1) - p.contrast) < 0.02 &&
        Math.abs((cf.saturate ?? 1) - p.saturate) < 0.02
    )?.id || '';

  return (
    <div className="adj-compact">
      {showInlinePreview ? (
        <p className="adj-compact-hint">Changes apply to the preview above and the canvas.</p>
      ) : null}
      <div className="adj-compact-block">
        <span className="adj-compact-block__title">
          <MdOpacity size={14} />
          Opacity
        </span>
        <div className="adj-compact-chips">
          {OPACITY_PRESETS.map((pct) => (
            <button
              key={pct}
              type="button"
              className={`adj-compact-chip ${opacityPct === pct ? 'adj-compact-chip--active' : ''}`}
              onClick={() => onOpacityChange(pct / 100)}
            >
              {pct}%
            </button>
          ))}
        </div>
        <Stepper
          label="Fine"
          icon={null}
          value={opacityPct}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => onOpacityChange(v / 100)}
        />
      </div>

      <div className="adj-compact-block">
        <span className="adj-compact-block__title">
          <MdPalette size={14} />
          Look
        </span>
        <div className="adj-compact-look-grid">
          {FILTER_PRESETS.map((p) => {
            const presetFilter = buildCssFilterString({
              brightness: p.brightness,
              contrast: p.contrast,
              saturate: p.saturate,
            });
            return (
              <button
                key={p.id}
                type="button"
                className={`adj-compact-look ${activePreset === p.id ? 'adj-compact-look--active' : ''}`}
                onClick={() => {
                  onFilterChange('brightness', p.brightness);
                  onFilterChange('contrast', p.contrast);
                  onFilterChange('saturate', p.saturate);
                }}
                title={p.label}
              >
                <span
                  className="adj-compact-look__thumb"
                  style={{ filter: presetFilter || undefined }}
                >
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt=""
                      style={{ objectFit: previewObjectFit }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <MdImage size={18} className="adj-compact-look__placeholder-icon" />
                  )}
                </span>
                <span className="adj-compact-look__label">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="adj-compact-block adj-compact-block--tight">
        <Stepper
          label="Brightness"
          icon={<MdBrightness6 size={13} />}
          value={Math.round((cf.brightness ?? 1) * 100)}
          min={0}
          max={200}
          step={10}
          unit="%"
          onChange={(v) => onFilterChange('brightness', v / 100)}
        />
        <Stepper
          label="Contrast"
          icon={<MdContrast size={13} />}
          value={Math.round((cf.contrast ?? 1) * 100)}
          min={0}
          max={200}
          step={10}
          unit="%"
          onChange={(v) => onFilterChange('contrast', v / 100)}
        />
        <Stepper
          label="Blur"
          icon={<MdBlurOn size={13} />}
          value={cf.blur ?? 0}
          min={0}
          max={20}
          step={1}
          unit="px"
          onChange={(v) => onFilterChange('blur', v)}
        />
      </div>
    </div>
  );
};

export default LayerAdjustmentsCompact;
