import { useState, useEffect, Fragment } from 'react';
import { MdAnimation, MdClose } from 'react-icons/md';
import {
  getEntranceAnimation,
  setEntranceAnimation,
  getExitAnimation,
  setExitAnimation,
} from '../../../../utils/clipAnimations';
import {
  ALL_MEDIA_ANIMATION_PRESETS,
  findMediaAnimationPreset,
  getActiveMediaPresetId,
  inferAnimationScope,
  entranceTypeToExitType,
  durationForEntrance,
  durationForExit,
} from '../../../../utils/layerAnimatePresets';
import AnimationScopeControls, { ANIMATION_APPLY_SCOPE } from './AnimationScopeControls';
import './LayerAnimatePanel.css';

const GRID_COLS = 3;

function shouldShowApplyPanelAfterIndex(index, expandedIndex, visibleLength, cols = GRID_COLS) {
  if (expandedIndex < 0) return false;
  const expandedRow = Math.floor(expandedIndex / cols);
  const currentRow = Math.floor(index / cols);
  if (currentRow !== expandedRow) return false;
  return (index + 1) % cols === 0 || index === visibleLength - 1;
}

const AnimatePreview = ({ presetId }) => (
  <span className={`layer-animate-preview layer-animate-preview--${presetId}`} aria-hidden />
);

const CollapsibleGrid = ({
  title,
  options,
  activeId,
  expandedId,
  onSelect,
  applyPanel = null,
}) => {
  const expandedIndex = expandedId ? options.findIndex((o) => o.id === expandedId) : -1;

  return (
    <div className="layer-animate-section">
      <div className="layer-animate-section__head">
        <span className="layer-animate-section__title">{title}</span>
      </div>
      <div className="layer-animate-grid">
        {options.map((opt, index) => (
          <Fragment key={opt.id}>
            <button
              type="button"
              className={`layer-animate-card ${activeId === opt.id ? 'layer-animate-card--active' : ''} ${expandedId === opt.id ? 'layer-animate-card--expanded' : ''}`}
              onClick={() => onSelect(opt.id)}
              title={opt.label}
            >
              <AnimatePreview presetId={opt.id} />
              <span className="layer-animate-card__label">{opt.label}</span>
            </button>
            {applyPanel && shouldShowApplyPanelAfterIndex(index, expandedIndex, options.length) ? (
              <div className="layer-animate-apply-inline">{applyPanel}</div>
            ) : null}
          </Fragment>
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
  const exit = getExitAnimation(activeLayer);
  const activePresetId = getActiveMediaPresetId(entrance, exit);

  const [expandedPresetId, setExpandedPresetId] = useState(null);
  const [applyScope, setApplyScope] = useState(ANIMATION_APPLY_SCOPE.ENTRANCE);

  const expandedPreset = expandedPresetId ? findMediaAnimationPreset(expandedPresetId) : null;

  useEffect(() => {
    setExpandedPresetId(null);
  }, [activeLayer?.id]);

  const applyScopeToLayer = (preset, scope, layer = activeLayer) => {
    if (!preset) return layer;
    const exitType = entranceTypeToExitType(preset.entrance);
    let next = layer;

    if (scope === ANIMATION_APPLY_SCOPE.ENTRANCE || scope === ANIMATION_APPLY_SCOPE.BOTH) {
      next = setEntranceAnimation(next, {
        type: preset.entrance,
        duration: entrance?.duration ?? durationForEntrance(preset.entrance),
        delay: entrance?.delay ?? 0,
        previewSeed: Date.now(),
      });
    }

    if (scope === ANIMATION_APPLY_SCOPE.EXIT || scope === ANIMATION_APPLY_SCOPE.BOTH) {
      next = setExitAnimation(next, {
        type: exitType,
        duration: exit?.duration ?? durationForExit(exitType),
        delay: exit?.delay ?? 0,
        previewSeed: Date.now(),
      });
    }

    if (scope === ANIMATION_APPLY_SCOPE.ENTRANCE) {
      next = setExitAnimation(next, { type: 'none' });
    } else if (scope === ANIMATION_APPLY_SCOPE.EXIT) {
      next = setEntranceAnimation(next, { type: 'none' });
    }

    return next;
  };

  const handlePresetClick = (presetId) => {
    if (expandedPresetId === presetId) {
      setExpandedPresetId(null);
      return;
    }
    const preset = findMediaAnimationPreset(presetId);
    setExpandedPresetId(presetId);
    const scope = inferAnimationScope(preset, entrance, exit);
    setApplyScope(scope);
    const next = applyScopeToLayer(preset, scope);
    updateLayer({ animations: next.animations });
  };

  const handleScopeChange = (scope) => {
    setApplyScope(scope);
    if (!expandedPreset) return;
    const next = applyScopeToLayer(expandedPreset, scope);
    updateLayer({ animations: next.animations });
  };

  const patchEntrance = (patch) => {
    const next = setEntranceAnimation(activeLayer, { ...patch, previewSeed: Date.now() });
    updateLayer({ animations: next.animations });
  };

  const patchExit = (patch) => {
    const next = setExitAnimation(activeLayer, { ...patch, previewSeed: Date.now() });
    updateLayer({ animations: next.animations });
  };

  const clearAnimations = () => {
    let next = setEntranceAnimation(activeLayer, { type: 'none' });
    next = setExitAnimation(next, { type: 'none' });
    updateLayer({ animations: next.animations });
    setExpandedPresetId(null);
  };

  const applyPanel = expandedPreset ? (
    <AnimationScopeControls
      presetLabel={expandedPreset.label}
      activeScope={applyScope}
      onScopeChange={handleScopeChange}
      entrance={entrance}
      exit={exit}
      onPatchEntrance={patchEntrance}
      onPatchExit={patchExit}
      onClear={clearAnimations}
      inline
    />
  ) : null;

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

      <CollapsibleGrid
        title="Animations"
        options={ALL_MEDIA_ANIMATION_PRESETS}
        activeId={activePresetId}
        expandedId={expandedPresetId}
        onSelect={handlePresetClick}
        applyPanel={applyPanel}
      />
    </div>
  );
};

export default LayerAnimatePanel;
