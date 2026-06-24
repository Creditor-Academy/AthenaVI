import {
  normalizeClipStack,
  canSetAsSceneBackground,
  buildSceneBackgroundPatch,
  buildUnsetSceneBackgroundPatch,
  getClipStackIndex,
  getLayerDisplayLabel,
  isBackgroundClip,
  minMovableStackIndex,
  sortClipsByPaintOrder,
} from '../../../../utils/editorLayerUtils';
import {
  MdTextFields,
  MdColorLens,
  MdTune,
  MdVisibility,
  MdVisibilityOff,
  MdImage,
  MdWallpaper,
  MdCropFree,
  MdRoundedCorner,
  MdInvertColors,
  MdPalette,
  MdBorderStyle,
  MdOpenInFull,
  MdPerson,
  MdLock,
  MdLockOpen,
  MdLayers,
  MdAnimation,
  MdLink,
} from 'react-icons/md';
import { isTextLayer } from '../../../../utils/textClip';
import TextSidebarPanel from './TextSidebarPanel';
import LayerAnimatePanel from './LayerAnimatePanel';
import LayerFitFlipAdjustments from './LayerFitFlipAdjustments';
import LayerAdjustmentsCompact from './LayerAdjustmentsCompact';
import LayerTransformBar from './LayerTransformBar';
import { resolveClipMediaSrc, isAvatarClip, isVideoMedia } from '../../../../utils/heygenVideo';
import SceneSettingsPanel from './SceneSettingsPanel';
import PropertiesAccordion from './PropertiesAccordion';
import AvatarVoiceoverSection from './AvatarVoiceoverSection';
import {
  buildRegularPolygonClipPath,
  getPolygonSideLabel,
  isPolygonMaskStyle,
} from '../../../../utils/shapeClipPath';
import {
  colorToHex,
  getShadowGeometry,
  replaceBoxShadowColor,
  splitBoxShadow,
} from '../../../../utils/boxShadowUtils';
import {
  buildLayerBorderPatch,
  parseLayerBorder,
} from '../../../../utils/layerBorderUtils';
import './TextSidebarPanel.css';
import './SceneSettingsPanel.css';
import './PropertiesAccordion.css';

const PANEL_GROUP = {
  LAYOUT: 'Layout',
  CONTENT: 'Content',
  APPEARANCE: 'Appearance',
  MOTION: 'Motion',
  ARRANGE: 'Arrange',
};

/* ── Tiny helpers ─────────────────────────────────────────────────────────── */

const PanelHeader = ({ icon, title, subtitle }) => (
  <div className="scp-panel-header">
    <div className="scp-panel-header__icon">{icon}</div>
    <div>
      <div className="scp-panel-header__title">{title}</div>
      {subtitle ? <div className="scp-panel-header__subtitle">{subtitle}</div> : null}
    </div>
  </div>
);

const Row = ({ label, children, column = true }) => (
  <div className="scp-row" style={{
    display: 'flex',
    flexDirection: column ? 'column' : 'row',
    alignItems: column ? 'stretch' : 'center',
    justifyContent: column ? 'flex-start' : 'space-between',
    gap: column ? 6 : 8,
    padding: '6px 0',
    width: '100%',
    minWidth: 0,
  }}>
    {label ? (
      <span className="scp-row__label" style={{
        fontSize: 11,
        color: 'var(--text-muted, #64748b)',
        fontWeight: 600,
        flexShrink: 0,
      }}>
        {label}
      </span>
    ) : null}
    <div className="scp-row__control" style={{ minWidth: 0, width: '100%' }}>
      {children}
    </div>
  </div>
);

const SliderRow = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <div className="scp-slider-row" style={{ padding: '6px 0', width: '100%', minWidth: 0 }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 6,
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
        {label}
      </span>
      <span className="scp-value-badge">
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', height: 4, cursor: 'pointer', display: 'block' }}
    />
  </div>
);

const SelectRow = ({ label, value, options, onChange }) => (
  <Row label={label} column>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: 'var(--bg-surface, #f8fafc)',
        border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-main, #1a1b1c)',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'auto',
      }}
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  </Row>
);

/* ── Toggle switch helper ─────────────────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, accent = 'var(--primary)' }) => (
  <label style={{ position: 'relative', display: 'inline-block', width: 36, height: 20, flexShrink: 0 }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      style={{ opacity: 0, width: 0, height: 0 }} />
    <span style={{
      position: 'absolute', inset: 0, borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s',
      background: checked ? accent : '#cbd5e1',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
        background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </span>
  </label>
);

const SHADOW_PRESETS = [
  { value: '0 8px 32px rgba(0,0,0,0.25)', label: 'Soft' },
  { value: '0 4px 20px rgba(124,58,237,0.5)', label: 'Glow' },
  { value: '0 0 0 4px rgba(124,58,237,0.3)', label: 'Ring' },
  { value: '0 20px 60px rgba(0,0,0,0.4)', label: 'Deep' },
  { value: '0 0 30px rgba(255,255,255,0.6)', label: 'Light' },
];

const DEFAULT_IMAGE_SHADOW = SHADOW_PRESETS[0].value;
const DEFAULT_MEDIA_SHADOW = '0 8px 32px rgba(0,0,0,0.3)';
const OPACITY_PRESETS = [0, 25, 50, 75, 100];

const AVATAR_MASK_SHAPES = [
  { label: 'Square', square: true },
  { label: 'Triangle', sides: 3 },
  { label: 'Diamond', sides: 4 },
  { label: 'Pentagon', sides: 5 },
  { label: 'Hexagon', sides: 6 },
  { label: 'Heptagon', sides: 7 },
  { label: 'Octagon', sides: 8 },
  { label: 'Circle', circle: true },
];

const MaskShapeGraphic = ({ sides, circle, square }) => {
  const size = 28;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 11;

  if (square) {
    return (
      <svg className="scp-mask-shape-graphic" viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <rect
          x={cx - radius}
          y={cy - radius}
          width={radius * 2}
          height={radius * 2}
          className="scp-mask-shape-graphic__fill"
        />
      </svg>
    );
  }

  if (circle) {
    return (
      <svg className="scp-mask-shape-graphic" viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={radius} className="scp-mask-shape-graphic__fill" />
      </svg>
    );
  }

  const points = [];
  for (let i = 0; i < sides; i += 1) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }

  return (
    <svg className="scp-mask-shape-graphic" viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <polygon points={points.join(' ')} className="scp-mask-shape-graphic__fill" />
    </svg>
  );
};

const PropertyBar = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  variant = 'default',
  fillColor,
  ariaLabel,
  disabled = false,
}) => {
  const pct = max === min ? 0 : ((Number(value) - min) / (max - min)) * 100;

  return (
    <div className={`scp-property-bar scp-property-bar--${variant}${disabled ? ' scp-property-bar--disabled' : ''}`}>
      <div className="scp-property-bar__track" aria-hidden />
      <div
        className="scp-property-bar__fill"
        style={{
          width: `${pct}%`,
          ...(variant === 'border' && fillColor ? { background: fillColor } : {}),
        }}
        aria-hidden
      />
      <input
        type="range"
        className="scp-property-bar__input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
      />
    </div>
  );
};

const TransparencyControls = ({ activeLayer, updateLayer, bare = false }) => {
  const opacityPct = Math.round((activeLayer.opacity ?? 1) * 100);

  const content = (
    <>
      <div className={bare ? 'scp-shape-style__head' : 'scp-effect-block__head'}>
        <span className={bare ? 'scp-shape-style__label' : 'scp-effect-block__label'}>Transparency</span>
        <span className="scp-value-badge">{opacityPct}%</span>
      </div>
      <PropertyBar
        variant="transparency"
        value={opacityPct}
        min={0}
        max={100}
        step={1}
        onChange={(v) => updateLayer({ opacity: v / 100 })}
        ariaLabel="Layer transparency"
      />
      <div className="scene-settings__chips scp-shape-style__chips">
        {OPACITY_PRESETS.map((pct) => (
          <button
            key={pct}
            type="button"
            className={`scene-settings__chip${
              opacityPct === pct ? ' scene-settings__chip--active' : ''
            }`}
            onClick={() => updateLayer({ opacity: pct / 100 })}
          >
            {pct === 0 ? 'Transparent' : `${pct}%`}
          </button>
        ))}
      </div>
    </>
  );

  if (bare) return content;
  return <div className="scp-effect-block">{content}</div>;
};

const RadiusChips = ({ activeLayer, updateStyle, options = [0, 8, 16, 24, 48] }) => {
  const current = parseInt(activeLayer.style?.borderRadius || 0, 10) || 0;
  return (
    <div className="scp-effect-block">
      <div className="scp-effect-block__label">Corner radius</div>
      <div className="scene-settings__chips">
        {options.map((r) => (
          <button
            key={r}
            type="button"
            className={`scene-settings__chip${current === r ? ' scene-settings__chip--active' : ''}`}
            onClick={() => updateStyle({ borderRadius: `${r}px` })}
          >
            {r}px
          </button>
        ))}
      </div>
    </div>
  );
};

const BorderControls = ({
  activeLayer,
  onBorderChange,
  defaultColor = '#94a3b8',
  bare = false,
}) => {
  const parsed = parseLayerBorder(activeLayer.style || {}, defaultColor);
  const { width: borderWidth, color: borderColor } = parsed;

  const setWidth = (next) => {
    onBorderChange({ width: next, color: borderColor });
  };

  const setColor = (color) => {
    onBorderChange({
      width: borderWidth > 0 ? borderWidth : 2,
      color,
    });
  };

  const content = (
    <>
      <div className={bare ? 'scp-shape-style__head' : 'scp-effect-block__head'}>
        <span className={bare ? 'scp-shape-style__label' : 'scp-effect-block__label'}>Border</span>
        <div className="scp-property-bar__meta">
          <label className="scp-property-bar__color-swatch" title="Border color">
            <span
              className="scp-property-bar__color-preview"
              style={{
                background: 'var(--bg-card, #fff)',
                border: `${Math.max(2, borderWidth || 2)}px solid ${borderColor}`,
              }}
              aria-hidden
            />
            <input
              type="color"
              value={borderColor}
              onChange={(e) => setColor(e.target.value)}
              className="scp-property-bar__color-input"
              aria-label="Border color"
            />
          </label>
          <span className="scp-value-badge">{borderWidth}px</span>
        </div>
      </div>
      <PropertyBar
        variant="border"
        value={borderWidth}
        min={0}
        max={20}
        step={1}
        fillColor={borderColor}
        onChange={setWidth}
        ariaLabel="Border width"
      />
    </>
  );

  if (bare) return content;
  return <div className="scp-effect-block">{content}</div>;
};

const ShadowControls = ({ activeLayer, updateStyle, defaultShadow = DEFAULT_IMAGE_SHADOW, bare = false }) => {
  const current = activeLayer.style?.boxShadow || 'none';
  const enabled = !!(current && current !== 'none');
  const currentGeometry = getShadowGeometry(current);
  const shadowColor = colorToHex(
    activeLayer.style?.shadowColor || splitBoxShadow(current)?.color,
    '#000000'
  );

  const applyShadow = (boxShadow) => {
    const split = splitBoxShadow(boxShadow);
    updateStyle({
      boxShadow,
      ...(split ? { shadowColor: colorToHex(split.color, shadowColor) } : {}),
    });
  };

  const applyPreset = (presetValue) => {
    applyShadow(presetValue);
  };

  const applyShadowColor = (hexColor) => {
    if (!enabled) return;
    applyShadow(replaceBoxShadowColor(current, hexColor));
  };

  const previewShadow = (presetValue) => {
    if (!enabled) return presetValue;
    const geometry = getShadowGeometry(presetValue);
    if (geometry !== currentGeometry) return presetValue;
    return replaceBoxShadowColor(presetValue, shadowColor);
  };

  const content = (
    <>
      <div className={bare ? 'scp-shape-style__head' : 'scp-effect-block__head'}>
        <span className={bare ? 'scp-shape-style__label' : 'scp-effect-block__label'}>Shadow</span>
        <ToggleSwitch
          checked={enabled}
          onChange={(on) => applyShadow(on ? current !== 'none' ? current : defaultShadow : 'none')}
        />
      </div>
      {enabled ? (
        <>
          <div className={`scp-shadow-presets${bare ? ' scp-shadow-presets--compact' : ''}`}>
            {SHADOW_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`scp-shadow-preset${
                  currentGeometry === getShadowGeometry(preset.value) ? ' scp-shadow-preset--active' : ''
                }`}
                onClick={() => applyPreset(preset.value)}
                title={preset.label}
              >
                <span className="scp-shadow-preset__thumb">
                  <span
                    className="scp-shadow-preset__box"
                    style={{ boxShadow: previewShadow(preset.value) }}
                  />
                </span>
                <span className="scp-shadow-preset__label">{preset.label}</span>
              </button>
            ))}
          </div>
          <div className={bare ? 'scp-shape-style__inline-row' : 'scp-shadow-color-row'}>
            <span className={bare ? 'scp-shape-style__label' : 'scp-effect-block__label'}>Color</span>
            <label className="scp-border-control__color scp-shadow-color-picker" title="Shadow color">
              <span
                className="scp-shadow-color-swatch"
                style={{ boxShadow: current }}
                aria-hidden
              />
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => applyShadowColor(e.target.value)}
                className="scp-border-control__color-input"
                aria-label="Shadow color"
              />
            </label>
          </div>
        </>
      ) : (
        <p className={bare ? 'scp-shape-style__hint' : 'scp-effect-block__hint'}>
          Turn on shadow to choose a preset and color.
        </p>
      )}
    </>
  );

  if (bare) return content;
  return <div className="scp-effect-block">{content}</div>;
};

/* ══════════════════════════════════════════════════════════════════════════
   LAYER PROPERTIES PANEL
══════════════════════════════════════════════════════════════════════════ */
const LayerVisibilityRow = ({ activeLayer, updateLayer }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 0', marginTop: 8, borderTop: '1px solid var(--border-color)' }}>
    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
      {activeLayer.visible !== false ? <MdVisibility size={14} /> : <MdVisibilityOff size={14} />}
      Visible
    </span>
    <ToggleSwitch checked={activeLayer.visible !== false} onChange={(v) => updateLayer({ visible: v })} />
  </div>
);

const LayerOrderContent = ({ activeLayer, clips, onMoveLayerOrder, onToggleLayerLock, hint, updateLayer }) => {
  const paintOrder = sortClipsByPaintOrder(clips);
  const layerIndex = getClipStackIndex(clips, activeLayer.id);
  const maxIndex = Math.max(0, paintOrder.length - 1);
  const minIndex = minMovableStackIndex(paintOrder);
  const isBg = isBackgroundClip(activeLayer);

  return (
    <>
      {hint ? (
        <p style={{ margin: '0 0 8px', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {hint}
        </p>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button
          type="button"
          className="scp-btn scp-btn--ghost"
          disabled={isBg || layerIndex >= maxIndex}
          onClick={() => onMoveLayerOrder?.(activeLayer.id, 'toFront')}
        >
          Bring to front
        </button>
        <button
          type="button"
          className="scp-btn scp-btn--ghost"
          disabled={isBg || layerIndex >= maxIndex}
          onClick={() => onMoveLayerOrder?.(activeLayer.id, 'forward')}
        >
          Bring forward
        </button>
        <button
          type="button"
          className="scp-btn scp-btn--ghost"
          disabled={isBg || layerIndex <= minIndex}
          onClick={() => onMoveLayerOrder?.(activeLayer.id, 'backward')}
        >
          Send backward
        </button>
        <button
          type="button"
          className="scp-btn scp-btn--ghost"
          disabled={isBg || layerIndex <= minIndex}
          onClick={() => onMoveLayerOrder?.(activeLayer.id, 'toBack')}
        >
          Send to back
        </button>
        <button
          type="button"
          className="scp-btn scp-btn--ghost"
          onClick={() => onToggleLayerLock?.(activeLayer.id, !activeLayer.locked)}
        >
          {activeLayer.locked ? <MdLockOpen size={14} /> : <MdLock size={14} />}
          {activeLayer.locked ? 'Unlock layer' : 'Lock layer'}
        </button>
      </div>
      {updateLayer ? <LayerVisibilityRow activeLayer={activeLayer} updateLayer={updateLayer} /> : null}
    </>
  );
};

const SceneBackgroundBanner = ({ isBackground, canBeSceneBackground, hasBackgroundSource, setAsBackground, unsetAsBackground }) => {
  if (!canBeSceneBackground) return null;
  if (isBackground) {
    return (
      <div className="scp-banner scp-banner--active" style={{ marginBottom: 8, justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <MdWallpaper size={16} />
          Scene Background
        </span>
        <button type="button" className="scp-btn scp-btn--ghost" onClick={unsetAsBackground}>
          Unset
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="scp-banner"
      onClick={setAsBackground}
      disabled={!hasBackgroundSource}
      style={{ marginBottom: 8, width: '100%' }}
    >
      <MdWallpaper size={16} />
      {hasBackgroundSource ? 'Set as Scene Background' : 'Add media from the sidebar first'}
    </button>
  );
};

const ImageBorderFrameContent = ({ activeLayer, updateStyle, updateLayer }) => (
  <>
    <RadiusChips activeLayer={activeLayer} updateStyle={updateStyle} />
    <TransparencyControls activeLayer={activeLayer} updateLayer={updateLayer} />
    <BorderControls
      activeLayer={activeLayer}
      defaultColor="#000000"
      onBorderChange={(patch) =>
        updateLayer({ style: buildLayerBorderPatch(activeLayer.style || {}, patch, '#000000') })
      }
    />
    <ShadowControls activeLayer={activeLayer} updateStyle={updateStyle} defaultShadow={DEFAULT_IMAGE_SHADOW} />
  </>
);

const MediaBorderShadowContent = ({ activeLayer, updateStyle, updateLayer }) => (
  <>
    <TransparencyControls activeLayer={activeLayer} updateLayer={updateLayer} />
    <BorderControls
      activeLayer={activeLayer}
      onBorderChange={(patch) =>
        updateLayer({ style: buildLayerBorderPatch(activeLayer.style || {}, patch) })
      }
    />
    <ShadowControls activeLayer={activeLayer} updateStyle={updateStyle} defaultShadow={DEFAULT_MEDIA_SHADOW} />
  </>
);

const ShapeAndEffectsContent = ({
  activeLayer,
  updateLayer,
}) => {
  const style = activeLayer.style || {};
  const polygonSides = Number(style.polygonSides) || 0;
  const polygonMode = isPolygonMaskStyle(style);
  const currentRadius = style.borderRadius ?? '50%';
  const isCircle = !polygonMode && String(currentRadius).replace(/\s/g, '') === '50%';
  const cornerRadiusPx = Math.max(0, parseInt(currentRadius, 10) || 0);
  const isSquare =
    !polygonMode &&
    !isCircle &&
    !style.clipPath &&
    !style.WebkitClipPath &&
    cornerRadiusPx === 0;
  const cornerRadiusLocked = polygonMode || isCircle;

  const applyPolygonShape = (sides) => {
    const count = Math.max(3, Math.min(10, Math.round(sides)));
    const clipPath = buildRegularPolygonClipPath(count);
    updateLayer({
      style: {
        ...style,
        borderRadius: '0px',
        clipPath,
        WebkitClipPath: clipPath,
        polygonSides: count,
      },
    });
  };

  const applyCircle = () => {
    const { clipPath, WebkitClipPath, polygonSides: _sides, ...rest } = style;
    updateLayer({ style: { ...rest, borderRadius: '50%' } });
  };

  const applySquare = () => {
    const { clipPath, WebkitClipPath, polygonSides: _sides, ...rest } = style;
    updateLayer({ style: { ...rest, borderRadius: '0px' } });
  };

  const applyCornerRadius = (px) => {
    const { clipPath, WebkitClipPath, polygonSides: _sides, ...rest } = style;
    updateLayer({ style: { ...rest, borderRadius: `${px}px` } });
  };

  const updateStyle = (updates) => updateLayer({ style: { ...style, ...updates } });

  const isShapeActive = (shape) => {
    if (shape.square) return isSquare;
    if (shape.circle) return isCircle;
    return polygonMode && polygonSides === shape.sides;
  };

  return (
    <div className="scp-shape-style">
      <section className="scp-shape-style__section">
        <div className="scp-shape-style__label">Mask shape</div>
        <div className="scp-mask-shape-chips">
          {AVATAR_MASK_SHAPES.map((shape) => (
            <button
              key={shape.square ? 'square' : shape.circle ? 'circle' : shape.sides}
              type="button"
              className={`scp-mask-shape-chip${
                isShapeActive(shape) ? ' scp-mask-shape-chip--active' : ''
              }`}
              title={shape.label}
              aria-label={shape.label}
              onClick={() => {
                if (shape.square) applySquare();
                else if (shape.circle) applyCircle();
                else applyPolygonShape(shape.sides);
              }}
            >
              <MaskShapeGraphic sides={shape.sides} circle={shape.circle} square={shape.square} />
            </button>
          ))}
        </div>
        <div className="scp-shape-style__head">
          <span className="scp-shape-style__label">Corner radius</span>
          <span className="scp-value-badge">
            {cornerRadiusLocked ? 'Off' : `${cornerRadiusPx}px`}
          </span>
        </div>
        <PropertyBar
          variant="radius"
          value={cornerRadiusLocked ? 0 : cornerRadiusPx}
          min={0}
          max={48}
          step={1}
          onChange={applyCornerRadius}
          ariaLabel="Corner radius"
        />
      </section>

      <section className="scp-shape-style__section">
        <TransparencyControls activeLayer={activeLayer} updateLayer={updateLayer} bare />
      </section>

      <section className="scp-shape-style__section">
        <BorderControls
          activeLayer={activeLayer}
          bare
          onBorderChange={(patch) =>
            updateLayer({ style: buildLayerBorderPatch(style, patch) })
          }
        />
      </section>

      <section className="scp-shape-style__section scp-shape-style__section--last">
        <ShadowControls
          activeLayer={activeLayer}
          updateStyle={updateStyle}
          defaultShadow={DEFAULT_MEDIA_SHADOW}
          bare
        />
      </section>
    </div>
  );
};

const LayerPanel = ({
  activeLayer,
  clips,
  activeSceneId,
  updateScene,
  activeScene,
  onMoveLayerOrder,
  onToggleLayerLock,
  generateSceneVideo,
  applyGlobalSetting,
  onOpenQuickCreate,
  setActiveTab,
}) => {
  const updateLayer = (updates) => {
    const marksPlaced =
      'position' in updates ||
      'size' in updates ||
      ('style' in updates && updates.style != null)
    let newClips = clips.map((l) =>
      l.id === activeLayer.id
        ? { ...l, ...updates, ...(marksPlaced ? { _userPlaced: true } : {}) }
        : l
    );
    if ('isBackground' in updates) {
      newClips = normalizeClipStack(newClips);
    }
    updateScene(activeSceneId, { clips: newClips });
  };
  const updateStyle  = (updates) => updateLayer({ style:   { ...activeLayer.style,   ...updates } });
  const updateEffect = (updates) => updateLayer({ effects: { ...activeLayer.effects, ...updates } });
  const updateFilter = (key, val) => updateLayer({
    cssFilters: { ...(activeLayer.cssFilters || {}), [key]: val },
  });

  const isImage  = activeLayer.type === 'image';
  const isText   = isTextLayer(activeLayer);
  const isHeading = isText && (activeLayer.role === 'main-text' || activeLayer.label?.toLowerCase().includes('head'));
  const isAvatarLayer = isAvatarClip(activeLayer);
  const isMedia  =
    !isImage &&
    (activeLayer.type === 'video' ||
      activeLayer.type === 'avatar' ||
      isAvatarLayer ||
      activeLayer.role === 'avatar' ||
      activeLayer.role === 'media');
  const isShape  = activeLayer.type === 'shape';
  const isFrame  = isShape && activeLayer.role === 'frame';

  const roleLabel = isHeading ? 'Heading' : getLayerDisplayLabel(activeLayer);

  if (isText) {
    return (
      <div className="scene-config-panel text-layer-panel text-layer-panel--sidebar">
        <TextSidebarPanel
          variant="right"
          activeLayer={activeLayer}
          updateLayer={updateLayer}
          updateStyle={updateStyle}
          layerSubtitle={roleLabel}
          clips={clips}
          onMoveLayerOrder={onMoveLayerOrder}
          onToggleLayerLock={onToggleLayerLock}
          useAccordion
        />
      </div>
    );
  }

  // Broad image detection — covers type='image' regardless of role/label

  const isBackground = !!activeLayer.isBackground;
  const canBeSceneBackground = canSetAsSceneBackground(activeLayer);
  const hasBackgroundSource = !!(resolveClipMediaSrc(activeLayer, activeScene) || activeLayer.src);

  const setAsBackground = () => {
    if (!hasBackgroundSource) return;
    updateLayer(buildSceneBackgroundPatch(activeLayer));
  };

  const unsetAsBackground = () => {
    updateLayer(buildUnsetSceneBackgroundPatch(activeLayer));
  };

  const cf = activeLayer.cssFilters || {};
  const isAvatar = isAvatarLayer;
  const mediaSrc = isMedia ? (resolveClipMediaSrc(activeLayer, activeScene) || activeLayer.src) : null;
  const isVideoSrc = isMedia && isVideoMedia(activeLayer, mediaSrc);

  const positionSection = {
    id: 'position',
    title: 'Position',
    group: PANEL_GROUP.LAYOUT,
    icon: <MdOpenInFull size={14} />,
    content: (
      <>
        <LayerTransformBar
          clip={activeLayer}
          onPositionChange={(x, y) =>
            updateLayer({ position: { ...(activeLayer.position || {}), x, y } })
          }
          onSizeChange={(w, h) =>
            updateLayer({ size: { ...(activeLayer.size || {}), width: w, height: h } })
          }
        />
        <SceneBackgroundBanner
          isBackground={isBackground}
          canBeSceneBackground={canBeSceneBackground}
          hasBackgroundSource={hasBackgroundSource}
          setAsBackground={setAsBackground}
          unsetAsBackground={unsetAsBackground}
        />
      </>
    ),
  };

  const animationSection = (isImage || isMedia || isShape) ? {
    id: 'animation',
    title: 'Animation',
    group: PANEL_GROUP.MOTION,
    icon: <MdAnimation size={14} />,
    content: <LayerAnimatePanel activeLayer={activeLayer} updateLayer={updateLayer} hideHeader />,
  } : null;

  const layerOrderSection = {
    id: 'layer-order',
    title: 'Layer Order',
    group: PANEL_GROUP.ARRANGE,
    icon: <MdLayers size={14} />,
    content: (
      <LayerOrderContent
        activeLayer={activeLayer}
        clips={clips}
        onMoveLayerOrder={onMoveLayerOrder}
        onToggleLayerLock={onToggleLayerLock}
        updateLayer={updateLayer}
        hint={isShape ? 'Place shapes above the scene background and behind text or avatars. Use Send to back or Send backward.' : undefined}
      />
    ),
  };

  let accordionSections = [];

  if (isImage) {
    accordionSections = [
      positionSection,
      {
        id: 'fit-adjust',
        title: 'Fit & Adjust',
        group: PANEL_GROUP.APPEARANCE,
        icon: <MdCropFree size={14} />,
        content: (
          <LayerFitFlipAdjustments
            clip={activeLayer}
            src={activeLayer.src}
            isVideo={false}
            style={activeLayer.style || {}}
            cssFilters={cf}
            opacity={activeLayer.opacity ?? 1}
            variant="rect"
            caption={`${(activeLayer.style?.objectFit || 'cover')} · ${Math.round((activeLayer.opacity ?? 1) * 100)}% opacity`}
            onUpdateStyle={updateStyle}
            onUpdateFilter={updateFilter}
            onOpacityChange={(v) => updateLayer({ opacity: v })}
            hideOpacity
            extraEffects={(
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MdInvertColors size={13} /> Invert
                  </span>
                  <ToggleSwitch checked={cf.invert > 0} onChange={(v) => updateFilter('invert', v ? 1 : 0)} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Grayscale</span>
                  <ToggleSwitch checked={cf.grayscale > 0} onChange={(v) => updateFilter('grayscale', v ? 1 : 0)} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Sepia</span>
                  <ToggleSwitch checked={(cf.sepia ?? 0) > 0} onChange={(v) => updateFilter('sepia', v ? 0.8 : 0)} />
                </div>
              </>
            )}
          />
        ),
      },
      {
        id: 'border-frame',
        title: 'Border & Frame',
        group: PANEL_GROUP.APPEARANCE,
        icon: <MdBorderStyle size={14} />,
        content: <ImageBorderFrameContent activeLayer={activeLayer} updateStyle={updateStyle} updateLayer={updateLayer} />,
      },
      animationSection,
      layerOrderSection,
    ].filter(Boolean);
  } else if (isMedia && isAvatar) {
    accordionSections = [
      positionSection,
      {
        id: 'avatar',
        title: 'Avatar',
        group: PANEL_GROUP.CONTENT,
        icon: <MdPerson size={14} />,
        content: (
          <AvatarVoiceoverSection
            activeScene={activeScene}
            activeSceneId={activeSceneId}
            generateSceneVideo={generateSceneVideo}
            applyGlobalSetting={applyGlobalSetting}
            onOpenQuickCreate={onOpenQuickCreate}
            setActiveTab={setActiveTab}
          />
        ),
      },
      {
        id: 'shape',
        title: 'Shape & Style',
        group: PANEL_GROUP.APPEARANCE,
        icon: <MdRoundedCorner size={14} />,
        content: (
          <ShapeAndEffectsContent
            activeLayer={activeLayer}
            updateLayer={updateLayer}
          />
        ),
      },
      {
        id: 'fit-adjust',
        title: 'Fit & Adjust',
        group: PANEL_GROUP.APPEARANCE,
        icon: <MdCropFree size={14} />,
        content: (
          <LayerFitFlipAdjustments
            clip={activeLayer}
            src={mediaSrc}
            isVideo={isVideoSrc}
            style={activeLayer.style || {}}
            cssFilters={cf}
            opacity={activeLayer.opacity ?? 1}
            variant="circle"
            caption={`Avatar · ${activeLayer.style?.objectFit || 'contain'} · ${Math.round((activeLayer.opacity ?? 1) * 100)}%`}
            onUpdateStyle={updateStyle}
            onUpdateFilter={updateFilter}
            onOpacityChange={(v) => updateLayer({ opacity: v })}
            hideOpacity
            extraEffects={(
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Grayscale</span>
                <ToggleSwitch checked={cf.grayscale > 0} onChange={(v) => updateFilter('grayscale', v ? 1 : 0)} />
              </div>
            )}
          />
        ),
      },
      animationSection,
      layerOrderSection,
    ].filter(Boolean);
  } else if (isMedia) {
    accordionSections = [
      positionSection,
      {
        id: 'source',
        title: 'Source',
        group: PANEL_GROUP.CONTENT,
        icon: <MdLink size={14} />,
        content: (
          <>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>URL / Blob</span>
            <input
              type="text"
              value={mediaSrc || ''}
              onChange={(e) => updateLayer({ src: e.target.value })}
              placeholder="https://... or blob:..."
              style={{
                width: '100%', boxSizing: 'border-box', fontFamily: 'monospace',
                background: 'white', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                borderRadius: 8, padding: '7px 10px', fontSize: 10,
                color: 'var(--text-main)', outline: 'none', wordBreak: 'break-all',
              }}
            />
          </>
        ),
      },
      {
        id: 'fit-adjust',
        title: 'Fit & Adjust',
        group: PANEL_GROUP.APPEARANCE,
        icon: <MdCropFree size={14} />,
        content: (
          <LayerFitFlipAdjustments
            clip={activeLayer}
            src={mediaSrc}
            isVideo={isVideoSrc}
            style={activeLayer.style || {}}
            cssFilters={cf}
            opacity={activeLayer.opacity ?? 1}
            variant="rect"
            caption={`Media · ${activeLayer.style?.objectFit || 'cover'} · ${Math.round((activeLayer.opacity ?? 1) * 100)}%`}
            onUpdateStyle={updateStyle}
            onUpdateFilter={updateFilter}
            onOpacityChange={(v) => updateLayer({ opacity: v })}
            hideOpacity
            extraEffects={(
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Grayscale</span>
                <ToggleSwitch checked={cf.grayscale > 0} onChange={(v) => updateFilter('grayscale', v ? 1 : 0)} />
              </div>
            )}
          />
        ),
      },
      {
        id: 'border-frame',
        title: 'Border & Style',
        group: PANEL_GROUP.APPEARANCE,
        icon: <MdBorderStyle size={14} />,
        content: <MediaBorderShadowContent activeLayer={activeLayer} updateStyle={updateStyle} updateLayer={updateLayer} />,
      },
      animationSection,
      layerOrderSection,
    ].filter(Boolean);
  } else if (isShape) {
    const shapeExtraSections = [];
    if (isFrame) {
      shapeExtraSections.push({
        id: 'image-fill',
        title: 'Image Fill',
        icon: <MdImage size={14} />,
        content: (
          <>
            {activeLayer.fillSrc ? (
              <>
                <img src={activeLayer.fillSrc} alt="" style={{ width: '100%', height: 88, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                <SelectRow
                  label="Image fit"
                  value={activeLayer.fillObjectFit || 'cover'}
                  options={[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }]}
                  onChange={(v) => updateLayer({ fillObjectFit: v })}
                />
                <button type="button" className="scp-btn scp-btn--ghost" style={{ width: '100%', marginTop: 6 }} onClick={() => updateLayer({ fillSrc: null, fillAssetId: undefined, fillObjectFit: undefined })}>
                  Remove image fill
                </button>
              </>
            ) : (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45, margin: '0 0 8px' }}>
                Drag an image from Images or Uploads onto this frame on the canvas, or choose a file below.
              </p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                updateLayer({ fillSrc: URL.createObjectURL(file), fillObjectFit: activeLayer.fillObjectFit || 'cover' });
                e.target.value = '';
              }}
              style={{ width: '100%', fontSize: 11 }}
            />
          </>
        ),
      });
    }
    accordionSections = [
      positionSection,
      animationSection,
      {
        id: 'fill-style',
        title: 'Fill & Style',
        icon: <MdPalette size={14} />,
        content: (
          <>
            <Row label="Fill Color" column>
              <input
                type="color"
                value={activeLayer.style?.backgroundColor || activeLayer.style?.background || (isFrame ? '#000000' : '#6366f1')}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value, background: e.target.value })}
                style={{ width: 36, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none' }}
              />
            </Row>
            <LayerAdjustmentsCompact
              opacity={activeLayer.opacity ?? 1}
              cssFilters={{}}
              onOpacityChange={(v) => updateLayer({ opacity: v })}
              onFilterChange={() => {}}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {[0, 8, 16, 32, 64].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => updateStyle({ borderRadius: `${r}px` })}
                  style={{
                    padding: '6px 10px', borderRadius: 8,
                    border: `1px solid ${parseInt(activeLayer.style?.borderRadius || 0) === r ? 'var(--primary)' : 'var(--border-subtle, rgba(0,0,0,0.1))'}`,
                    background: parseInt(activeLayer.style?.borderRadius || 0) === r ? 'rgba(124,58,237,0.08)' : 'white',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {r}px
                </button>
              ))}
            </div>
          </>
        ),
      },
      ...shapeExtraSections,
      layerOrderSection,
    ].filter(Boolean);
  } else {
    accordionSections = [
      positionSection,
      {
        id: 'visual',
        title: 'Visual',
        icon: <MdColorLens size={14} />,
        content: (
          <LayerAdjustmentsCompact
            opacity={activeLayer.opacity ?? 1}
            cssFilters={{
              brightness: activeLayer.effects?.brightness ?? 1,
              contrast: 1,
              saturate: 1,
              blur: 0,
            }}
            onOpacityChange={(v) => updateLayer({ opacity: v })}
            onFilterChange={(key, val) => {
              if (key === 'brightness') updateEffect({ brightness: val });
            }}
          />
        ),
      },
      layerOrderSection,
    ];
  }

  const panelTitle = isImage
    ? 'Image Properties'
    : isAvatar
      ? 'Avatar Properties'
      : isMedia
        ? 'Video Properties'
        : isShape
          ? 'Shape Properties'
          : 'Layer Properties';

  return (
    <div className="scene-config-panel" style={{ padding: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ padding: '0 14px' }}>
        <PanelHeader
          icon={isImage ? <MdImage size={17} /> : isAvatar ? <MdPerson size={17} /> : <MdTune size={17} />}
          title={panelTitle}
          subtitle={roleLabel}
        />
      </div>
      <div style={{ padding: '0 14px' }}>
        <PropertiesAccordion
          sections={accordionSections}
          defaultExpandedIds={isAvatar ? ['position', 'avatar'] : ['position']}
        />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   SCENE SETTINGS PANEL
══════════════════════════════════════════════════════════════════════════ */
const SceneConfigurationPanel = ({
  activeScene,
  activeSceneId,
  updateScene,
  selectedLayerId,
  generateSceneVideo,
  setActiveTab,
  applyGlobalSetting,
  onOpenQuickCreate,
  onMoveLayerOrder,
  onToggleLayerLock,
  onDuplicateScene,
}) => {
  if (!activeScene) return null;

  const clips = activeScene.clips || [];
  const activeLayer = clips.find(l => l.id === selectedLayerId);

  if (activeLayer) {
    return (
      <LayerPanel
        activeLayer={activeLayer}
        clips={clips}
        activeSceneId={activeSceneId}
        updateScene={updateScene}
        activeScene={activeScene}
        onMoveLayerOrder={onMoveLayerOrder}
        onToggleLayerLock={onToggleLayerLock}
        generateSceneVideo={generateSceneVideo}
        applyGlobalSetting={applyGlobalSetting}
        onOpenQuickCreate={onOpenQuickCreate}
        setActiveTab={setActiveTab}
      />
    );
  }

  return (
    <SceneSettingsPanel
      activeScene={activeScene}
      activeSceneId={activeSceneId}
      updateScene={updateScene}
      clips={clips}
      generateSceneVideo={generateSceneVideo}
      applyGlobalSetting={applyGlobalSetting}
      onOpenQuickCreate={onOpenQuickCreate}
      onDuplicateScene={onDuplicateScene}
    />
  );
};

export default SceneConfigurationPanel;
