import { useState } from 'react';
import { MdAnimation, MdClose, MdArrowBack, MdArrowForward } from 'react-icons/md';
import {
  getEntranceAnimation,
  setEntranceAnimation,
} from '../../../../utils/clipAnimations';
import {
  PRIMARY_LAYER_ANIMATIONS,
  ADDON_LAYER_ANIMATIONS,
  ANIMATION_DIRECTION,
  findLayerAnimationPreset,
  getLayerAnimationPresetId,
  durationForEntrance,
} from '../../../../utils/layerAnimatePresets';
import './LayerAnimatePanel.css';

const PRIMARY_PREVIEW = 6;

const AnimatePreview = ({ presetId }) => (
  <span className={`layer-animate-preview layer-animate-preview--${presetId}`} aria-hidden />
);

const CollapsibleGrid = ({
  title,
  options,
  activeId,
  onSelect,
  previewCount = PRIMARY_PREVIEW,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasMore = options.length > previewCount;
  const visible = expanded || !hasMore ? options : options.slice(0, previewCount);
  const hiddenCount = options.length - previewCount;

  return (
    <div className="layer-animate-section">
      <div className="layer-animate-section__head">
        <span className="layer-animate-section__title">{title}</span>
        {hasMore ? (
          <button
            type="button"
            className="layer-animate-expand"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Show less' : `Show all (${hiddenCount})`}
          </button>
        ) : null}
      </div>
      <div className="layer-animate-grid">
        {visible.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`layer-animate-card ${activeId === opt.id ? 'layer-animate-card--active' : ''}`}
            onClick={() => onSelect(opt.id)}
            title={opt.label}
          >
            <AnimatePreview presetId={opt.id} />
            <span className="layer-animate-card__label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Canva-style Animate panel for image / video / shape layers (right sidebar).
 */
const LayerAnimatePanel = ({ activeLayer, updateLayer, onClose, hideHeader = false }) => {
  const entrance = getEntranceAnimation(activeLayer);
  const activePresetId = getLayerAnimationPresetId(entrance?.type || '');
  const direction = entrance?.direction || ANIMATION_DIRECTION.LEFT;

  const applyPreset = (presetId) => {
    const preset = findLayerAnimationPreset(presetId);
    if (!preset) return;
    const next = setEntranceAnimation(activeLayer, {
      type: preset.entrance,
      duration: durationForEntrance(preset.entrance),
      delay: entrance?.delay ?? 0,
      direction,
      previewSeed: Date.now(),
    });
    updateLayer({ animations: next.animations });
  };

  const clearAnimation = () => {
    const next = setEntranceAnimation(activeLayer, { type: 'none' });
    updateLayer({ animations: next.animations });
  };

  const setDirection = (dir) => {
    if (!entrance || entrance.type === 'none') return;
    const next = setEntranceAnimation(activeLayer, { direction: dir, previewSeed: Date.now() });
    updateLayer({ animations: next.animations });
  };

  return (
    <div className={`layer-animate-panel ${hideHeader ? 'layer-animate-panel--embedded' : ''}`}>
      {!hideHeader ? (
        <div className="layer-animate-panel__header">
          <span className="layer-animate-panel__title">
            <MdAnimation size={16} />
            Animate
          </span>
          {onClose ? (
            <button type="button" className="layer-animate-panel__close" onClick={onClose} aria-label="Close">
              <MdClose size={18} />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="layer-animate-direction">
        <span className="layer-animate-direction__label">Direction</span>
        <div className="layer-animate-direction__btns">
          <button
            type="button"
            className={`layer-animate-dir-btn ${direction === ANIMATION_DIRECTION.LEFT ? 'layer-animate-dir-btn--active' : ''}`}
            onClick={() => setDirection(ANIMATION_DIRECTION.LEFT)}
            title="From left"
          >
            <MdArrowBack size={18} />
          </button>
          <button
            type="button"
            className={`layer-animate-dir-btn ${direction === ANIMATION_DIRECTION.RIGHT ? 'layer-animate-dir-btn--active' : ''}`}
            onClick={() => setDirection(ANIMATION_DIRECTION.RIGHT)}
            title="From right"
          >
            <MdArrowForward size={18} />
          </button>
        </div>
      </div>

      <CollapsibleGrid
        title="Entrance"
        options={PRIMARY_LAYER_ANIMATIONS}
        activeId={activePresetId}
        onSelect={applyPreset}
        previewCount={6}
      />

      <CollapsibleGrid
        title="Add-on effects"
        options={ADDON_LAYER_ANIMATIONS}
        activeId={activePresetId}
        onSelect={applyPreset}
        previewCount={3}
      />

      {activePresetId ? (
        <button type="button" className="layer-animate-clear" onClick={clearAnimation}>
          Remove animation
        </button>
      ) : null}
    </div>
  );
};

export default LayerAnimatePanel;
