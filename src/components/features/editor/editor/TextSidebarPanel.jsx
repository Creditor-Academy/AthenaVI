import { useMemo, useState, useEffect, Fragment } from 'react';
import {
  MdSchedule,
  MdOpenInFull,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdStrikethroughS,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatLineSpacing,
  MdLayers,
  MdLock,
  MdLockOpen,
  MdVisibility,
  MdVisibilityOff,
  MdTextFields,
  MdAutoAwesome,
  MdAnimation,
  MdInterests,
} from 'react-icons/md';
import {
  FONT_FAMILIES,
  getClipTextContent,
  parseFontSize,
  resolveFontFamilyValue,
} from '../../../../utils/textClip';
import {
  TEXT_EFFECT_OPTIONS,
  TEXT_SHAPE_OPTIONS,
  SUGGESTED_TEXT_ANIMATIONS,
  TEXT_MOTION_PRESETS,
  GENERAL_MOTION_PRESETS,
  getTextEffectId,
  getTextShapeId,
  getSuggestedAnimationId,
} from '../../../../utils/textEffects';
import {
  getEntranceAnimation,
  setEntranceAnimation,
  getExitAnimation,
  setExitAnimation,
} from '../../../../utils/clipAnimations';
import { durationForExit, entranceTypeToExitType, inferAnimationScope } from '../../../../utils/layerAnimatePresets';
import AnimationScopeControls, { ANIMATION_APPLY_SCOPE } from './AnimationScopeControls';
import {
  getClipStackIndex,
  isBackgroundClip,
  minMovableStackIndex,
  sortClipsByPaintOrder,
} from '../../../../utils/editorLayerUtils';
import LayerTransformBar from './LayerTransformBar';
import PropertiesAccordion from './PropertiesAccordion';
import './TextSidebarPanel.css';
import './PropertiesAccordion.css';

const EffectPreview = ({ effectId }) => {
  if (effectId === 'none') {
    return <span className="text-fx-preview text-fx-preview--none">—</span>;
  }
  return <span className={`text-fx-preview text-fx-preview--${effectId}`}>Ag</span>;
};

const SuggestedPreview = ({ presetId }) => {
  switch (presetId) {
    case 'suggested-typewriter':
      return (
        <span className="text-suggested-preview text-suggested-preview--typewriter">
          <span className="tw-a">A</span>
          <span className="tw-b">B</span>
          <span className="tw-c">C</span>
          <span className="tw-cursor" />
        </span>
      );
    case 'suggested-ascend':
      return (
        <span className="text-suggested-preview text-suggested-preview--ascend">
          <span className="asc-a">A</span>
          <span className="asc-b">B</span>
          <span className="asc-c">C</span>
        </span>
      );
    case 'suggested-shift':
      return (
        <span className="text-suggested-preview text-suggested-preview--shift">
          <span className="sh-a">A</span>
          <span className="sh-b">B</span>
          <span className="sh-c">C</span>
        </span>
      );
    case 'suggested-merge':
      return (
        <span className="text-suggested-preview text-suggested-preview--merge">
          <span className="mg-arrow mg-l" />
          <span className="mg-letters">ABC</span>
          <span className="mg-arrow mg-r" />
        </span>
      );
    case 'suggested-block':
      return (
        <span className="text-suggested-preview text-suggested-preview--block">
          <span className="blk-bg" />
          <span className="blk-text">ABC</span>
        </span>
      );
    case 'suggested-burst':
      return (
        <span className="text-suggested-preview text-suggested-preview--burst">
          <span className="burst-spark burst-s1" />
          <span className="burst-spark burst-s2" />
          <span className="burst-spark burst-s3" />
          <span className="burst-text">ABC</span>
        </span>
      );
    default:
      return <span className="text-fx-preview text-fx-preview--none">—</span>;
  }
};

const MotionPreview = ({ presetId }) => {
  const barStyle = { width: 14, height: 22, left: 11, top: 7 };
  switch (presetId) {
    case 'bounce':
      return (
        <div className="text-motion-icon">
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ts-preview)' }}>ABC</span>
        </div>
      );
    case 'rise':
      return (
        <div className="text-motion-icon">
          <div className="text-motion-icon__bar" style={{ ...barStyle, height: 18 }} />
          <span style={{ position: 'absolute', top: 2, left: 18, fontSize: 10, color: 'var(--ts-muted)' }}>↑</span>
        </div>
      );
    case 'pan':
      return (
        <div className="text-motion-icon">
          <div className="text-motion-icon__bar" style={{ width: 28, height: 10, left: 4, top: 13 }} />
          <span style={{ position: 'absolute', top: 10, right: 4, fontSize: 10, color: 'var(--ts-muted)' }}>→</span>
        </div>
      );
    case 'fade':
      return (
        <div className="text-motion-icon">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: 'linear-gradient(90deg, transparent, var(--ts-preview))',
            }}
          />
        </div>
      );
    case 'pop':
      return (
        <div className="text-motion-icon">
          <div
            style={{
              width: 20,
              height: 20,
              border: '2px solid var(--ts-preview)',
              borderRadius: 4,
              margin: '8px auto',
            }}
          />
        </div>
      );
    default:
      return (
        <div className="text-motion-icon">
          <div
            className="text-motion-icon__bar"
            style={{ width: 22, height: 22, left: 7, top: 7, opacity: 0.85 }}
          />
        </div>
      );
  }
};

const TEXT_ANIM_GRID_COLS = 3;

function shouldShowApplyPanelAfterIndex(index, expandedIndex, visibleLength, cols = TEXT_ANIM_GRID_COLS) {
  if (expandedIndex < 0) return false;
  const expandedRow = Math.floor(expandedIndex / cols);
  const currentRow = Math.floor(index / cols);
  if (currentRow !== expandedRow) return false;
  return (index + 1) % cols === 0 || index === visibleLength - 1;
}

const CollapsibleEffectGrid = ({
  title,
  options,
  activeId,
  expandedId,
  onSelect,
  renderPreview,
  applyPanel = null,
}) => {
  const expandedIndex = expandedId ? options.findIndex((o) => o.id === expandedId) : -1;

  return (
    <div className="text-sidebar-section">
      <div className="text-sidebar-section__head">
        <span className="text-sidebar-section__title">{title}</span>
      </div>
      <div className="text-sidebar-grid">
        {options.map((opt, index) => (
          <Fragment key={opt.id}>
            <button
              type="button"
              className={`text-sidebar-card ${activeId === opt.id ? 'text-sidebar-card--active' : ''} ${expandedId === opt.id ? 'text-sidebar-card--expanded' : ''}`}
              onClick={() => onSelect(opt.id)}
              title={opt.label}
            >
              <div className="text-sidebar-card__preview">
                {renderPreview(opt.id)}
              </div>
              <span className="text-sidebar-card__label">{opt.label}</span>
            </button>
            {applyPanel && shouldShowApplyPanelAfterIndex(index, expandedIndex, options.length) ? (
              <div className="text-sidebar-apply-inline">{applyPanel}</div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const EffectGrid = ({ title, options, activeId, onSelect, renderPreview }) => (
  <CollapsibleEffectGrid
    title={title}
    options={options}
    activeId={activeId}
    onSelect={onSelect}
    renderPreview={renderPreview}
  />
);

const TextLayerFooter = ({ activeLayer, clips, onMoveLayerOrder, onToggleLayerLock, updateLayer, embedded = false }) => {
  const paintOrder = sortClipsByPaintOrder(clips);
  const layerIndex = getClipStackIndex(clips, activeLayer.id);
  const maxIndex = Math.max(0, paintOrder.length - 1);
  const minIndex = minMovableStackIndex(paintOrder);
  const isBg = isBackgroundClip(activeLayer);

  return (
    <div className={`text-sidebar-footer ${embedded ? 'text-sidebar-footer--embedded' : ''}`}>
      {!embedded ? (
        <div className="text-sidebar-section__head">
          <span className="text-sidebar-section__title">
            <MdLayers size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            Layer order
          </span>
        </div>
      ) : null}
      <div className="text-sidebar-footer__actions">
        <button
          type="button"
          className="text-sidebar-footer__btn"
          disabled={isBg || layerIndex >= maxIndex}
          onClick={() => onMoveLayerOrder?.(activeLayer.id, 'toFront')}
        >
          To front
        </button>
        <button
          type="button"
          className="text-sidebar-footer__btn"
          disabled={isBg || layerIndex >= maxIndex}
          onClick={() => onMoveLayerOrder?.(activeLayer.id, 'forward')}
        >
          Forward
        </button>
        <button
          type="button"
          className="text-sidebar-footer__btn"
          disabled={isBg || layerIndex <= minIndex}
          onClick={() => onMoveLayerOrder?.(activeLayer.id, 'backward')}
        >
          Backward
        </button>
        <button
          type="button"
          className="text-sidebar-footer__btn"
          disabled={isBg || layerIndex <= minIndex}
          onClick={() => onMoveLayerOrder?.(activeLayer.id, 'toBack')}
        >
          To back
        </button>
        <button
          type="button"
          className="text-sidebar-footer__btn"
          onClick={() => onToggleLayerLock?.(activeLayer.id, !activeLayer.locked)}
        >
          {activeLayer.locked ? <MdLockOpen size={14} /> : <MdLock size={14} />}
          {activeLayer.locked ? 'Unlock' : 'Lock layer'}
        </button>
      </div>
      <div className="text-sidebar-footer__visible">
        <span>
          {activeLayer.visible !== false ? <MdVisibility size={14} /> : <MdVisibilityOff size={14} />}
          Visible
        </span>
        <label className="text-sidebar-toggle">
          <input
            type="checkbox"
            checked={activeLayer.visible !== false}
            onChange={(e) => updateLayer({ visible: e.target.checked })}
          />
          <span className="text-sidebar-toggle__track" />
        </label>
      </div>
    </div>
  );
};

const TextSidebarPanel = ({
  activeLayer,
  updateLayer,
  updateStyle,
  variant = 'dropdown',
  layerSubtitle,
  clips = [],
  onMoveLayerOrder,
  onToggleLayerLock,
  useAccordion = false,
}) => {
  const isRight = variant === 'right';
  const bodyClass = isRight ? 'text-sidebar-panel__body' : 'text-sidebar-panel__scroll';
  const textContent = getClipTextContent(activeLayer);
  const style = activeLayer.style || {};
  const fontSize = parseFontSize(style.fontSize, 32);
  const resolvedFontFamily = useMemo(
    () => resolveFontFamilyValue(style.fontFamily),
    [style.fontFamily]
  );
  const fontWeight = String(style.fontWeight || '700');
  const fontStyle = style.fontStyle || 'normal';
  const textDecoration = style.textDecoration || 'none';
  const entrance = getEntranceAnimation(activeLayer);
  const activeEntrance = entrance?.type || 'none';
  const exit = getExitAnimation(activeLayer);
  const activeExit = exit?.type || 'none';

  const [selectedMotionPreset, setSelectedMotionPreset] = useState(null);
  const [applyScope, setApplyScope] = useState(ANIMATION_APPLY_SCOPE.ENTRANCE);

  useEffect(() => {
    setSelectedMotionPreset(null);
  }, [activeLayer?.id]);

  const activeSuggestedId = useMemo(
    () => getSuggestedAnimationId(activeEntrance),
    [activeEntrance]
  );

  const activeMotionId = useMemo(() => {
    if (activeSuggestedId) return null;
    const textPreset = TEXT_MOTION_PRESETS.find((p) => p.entrance === activeEntrance);
    if (textPreset) return textPreset.id;
    const general = GENERAL_MOTION_PRESETS.find((p) => p.entrance === activeEntrance);
    return general?.id || (activeEntrance === 'none' ? 'none' : null);
  }, [activeEntrance, activeSuggestedId]);

  const clipDuration =
    activeLayer.endTime != null && activeLayer.startTime != null
      ? Math.max(0.1, activeLayer.endTime - activeLayer.startTime).toFixed(1)
      : (activeLayer.duration || 5).toFixed?.(1) || '5.0';

  const updateTextContent = (text) => {
    const existing =
      typeof activeLayer.content === 'object' && activeLayer.content !== null
        ? activeLayer.content
        : {};
    updateLayer({ content: { ...existing, text } });
  };

  const applyEffect = (effectId) => {
    updateStyle({
      textEffect: effectId === 'none' ? undefined : effectId,
    });
  };

  const applyShape = (shapeId) => {
    updateStyle({
      textShape: shapeId === 'none' ? undefined : shapeId,
    });
  };

  const applyMotionWithScope = (preset, scope, layer = activeLayer) => {
    if (!preset || preset.entrance === 'none') {
      let next = setEntranceAnimation(layer, { type: 'none' });
      next = setExitAnimation(next, { type: 'none' });
      updateLayer({ animations: next.animations });
      setSelectedMotionPreset(null);
      return;
    }

    const durationByType = {
      typewriter: 1.4,
      ascend: 0.85,
      shift: 0.75,
      merge: 0.8,
      block: 0.7,
      burst: 0.65,
      none: 0.6,
    };
    const exitType = entranceTypeToExitType(preset.entrance);
    let next = layer;

    if (scope === ANIMATION_APPLY_SCOPE.ENTRANCE || scope === ANIMATION_APPLY_SCOPE.BOTH) {
      next = setEntranceAnimation(next, {
        type: preset.entrance,
        duration: entrance?.duration ?? durationByType[preset.entrance] ?? 0.75,
        delay: entrance?.delay ?? 0,
        speed: preset.entrance === 'typewriter' || preset.entrance === 'wordFade' ? (entrance?.speed ?? 1) : undefined,
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

    updateLayer({ animations: next.animations });
  };

  const handleMotionPresetClick = (preset) => {
    if (!preset) return;
    if (preset.entrance === 'none') {
      applyMotionWithScope(preset, ANIMATION_APPLY_SCOPE.ENTRANCE);
      return;
    }
    if (selectedMotionPreset?.id === preset.id) {
      setSelectedMotionPreset(null);
      return;
    }
    setSelectedMotionPreset(preset);
    const scope = inferAnimationScope(preset, entrance, exit);
    setApplyScope(scope);
    applyMotionWithScope(preset, scope);
  };

  const handleScopeChange = (scope) => {
    setApplyScope(scope);
    if (!selectedMotionPreset) return;
    applyMotionWithScope(selectedMotionPreset, scope);
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
    setSelectedMotionPreset(null);
  };

  const selectedMotionId = selectedMotionPreset?.id || activeSuggestedId || activeMotionId || '';

  const toggleBold = () => {
    updateStyle({
      fontWeight: ['700', '800', '900', 'bold'].includes(fontWeight) ? '400' : '700',
    });
  };

  const toggleItalic = () => {
    updateStyle({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' });
  };

  const toggleDecoration = (tag) => {
    const has = textDecoration.includes(tag);
    updateStyle({ textDecoration: has ? 'none' : tag });
  };

  const animationContent = (() => {
    const applyPanel = selectedMotionPreset ? (
      <AnimationScopeControls
        presetLabel={selectedMotionPreset.label}
        activeScope={applyScope}
        onScopeChange={handleScopeChange}
        entrance={entrance}
        exit={exit}
        onPatchEntrance={patchEntrance}
        onPatchExit={patchExit}
        onClear={clearAnimations}
        showTypewriterSpeed={
          selectedMotionPreset.entrance === 'typewriter' ||
          selectedMotionPreset.entrance === 'wordFade'
        }
        inline
      />
    ) : null;

    const applyPanelFor = (options) =>
      selectedMotionPreset && options.some((o) => o.id === selectedMotionPreset.id) ? applyPanel : null;

    return (
      <>
        <CollapsibleEffectGrid
          title="Suggested"
          options={SUGGESTED_TEXT_ANIMATIONS}
          activeId={selectedMotionId || activeSuggestedId}
          expandedId={selectedMotionPreset?.id}
          applyPanel={applyPanelFor(SUGGESTED_TEXT_ANIMATIONS)}
          onSelect={(id) => {
            const preset = SUGGESTED_TEXT_ANIMATIONS.find((p) => p.id === id);
            handleMotionPresetClick(preset);
          }}
          renderPreview={(id) => <SuggestedPreview presetId={id} />}
        />

        <CollapsibleEffectGrid
          title="Text animation"
          options={TEXT_MOTION_PRESETS}
          activeId={selectedMotionId || activeMotionId || 'none'}
          expandedId={selectedMotionPreset?.id}
          applyPanel={applyPanelFor(TEXT_MOTION_PRESETS)}
          onSelect={(id) => {
            const preset = TEXT_MOTION_PRESETS.find((p) => p.id === id);
            if (preset) handleMotionPresetClick(preset);
          }}
          renderPreview={(id) => <MotionPreview presetId={id} />}
        />

        <CollapsibleEffectGrid
          title="General"
          options={GENERAL_MOTION_PRESETS}
          activeId={selectedMotionId || GENERAL_MOTION_PRESETS.find((p) => p.entrance === activeEntrance)?.id || ''}
          expandedId={selectedMotionPreset?.id}
          applyPanel={applyPanelFor(GENERAL_MOTION_PRESETS)}
          onSelect={(id) => {
            const preset = GENERAL_MOTION_PRESETS.find((p) => p.id === id);
            if (preset) handleMotionPresetClick(preset);
          }}
          renderPreview={(id) => <MotionPreview presetId={id} />}
        />
      </>
    );
  })();

  const effectContent = (
    <CollapsibleEffectGrid
      title="Presets"
      options={TEXT_EFFECT_OPTIONS}
      activeId={getTextEffectId(style)}
      onSelect={applyEffect}
      renderPreview={(id) => <EffectPreview effectId={id} />}
    />
  );

  const shapeContent = (
    <EffectGrid
      title="Presets"
      options={TEXT_SHAPE_OPTIONS}
      activeId={getTextShapeId(style)}
      onSelect={applyShape}
      renderPreview={(id) =>
        id === 'curve' ? (
          <span className="text-fx-preview" style={{ fontSize: 14, transform: 'rotate(-8deg)' }}>
            ABCD
          </span>
        ) : (
          <span className="text-fx-preview text-fx-preview--none" style={{ fontSize: 10 }}>
            —
          </span>
        )
      }
    />
  );

  const textToolbar = (
      <div className="text-sidebar-toolbar text-sidebar-toolbar--compact">
        <div className="text-sidebar-toolbar__row text-sidebar-toolbar__row--font">
          <label className="text-sidebar-toolbar__font-label" htmlFor="text-font-family-select">
            Font family
          </label>
          <select
            id="text-font-family-select"
            className="text-sidebar-toolbar__font"
            value={resolvedFontFamily}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            title="Font family"
            style={{ fontFamily: resolvedFontFamily }}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sidebar-toolbar__row">
          <div className="size-stepper">
            <button type="button" onClick={() => updateStyle({ fontSize: Math.max(8, fontSize - 2) })} aria-label="Smaller">−</button>
            <input
              type="number"
              min={8}
              max={300}
              value={fontSize}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) updateStyle({ fontSize: n });
              }}
              aria-label="Font size"
            />
            <button type="button" onClick={() => updateStyle({ fontSize: Math.min(300, fontSize + 2) })} aria-label="Larger">+</button>
          </div>
          <label className="text-sidebar-toolbar__color" title="Text color">
            <input
              type="color"
              value={style.color || '#1a1b1c'}
              onChange={(e) => updateStyle({ color: e.target.value })}
            />
          </label>
          <span className="text-sidebar-toolbar__duration" title="Clip duration">
            <MdSchedule size={13} />
            {clipDuration}s
          </span>
        </div>
        <div className="text-sidebar-toolbar__row text-sidebar-toolbar__row--icons">
          {[
            { key: 'bold', icon: <MdFormatBold size={15} />, active: ['700', '800', '900', 'bold'].includes(fontWeight), onClick: toggleBold, title: 'Bold' },
            { key: 'italic', icon: <MdFormatItalic size={15} />, active: fontStyle === 'italic', onClick: toggleItalic, title: 'Italic' },
            { key: 'underline', icon: <MdFormatUnderlined size={15} />, active: textDecoration.includes('underline'), onClick: () => toggleDecoration('underline'), title: 'Underline' },
            { key: 'strike', icon: <MdStrikethroughS size={15} />, active: textDecoration.includes('line-through'), onClick: () => toggleDecoration('line-through'), title: 'Strikethrough' },
          ].map(({ key, icon, active, onClick, title }) => (
            <button
              key={key}
              type="button"
              className={`text-sidebar-toolbar__icon-btn ${active ? 'text-sidebar-toolbar__icon-btn--active' : ''}`}
              onClick={onClick}
              title={title}
            >
              {icon}
            </button>
          ))}
          <span className="text-sidebar-toolbar__icon-divider" />
          {[
            { icon: <MdFormatAlignLeft size={15} />, val: 'left' },
            { icon: <MdFormatAlignCenter size={15} />, val: 'center' },
            { icon: <MdFormatAlignRight size={15} />, val: 'right' },
          ].map(({ icon, val }) => (
            <button
              key={val}
              type="button"
              className={`text-sidebar-toolbar__icon-btn ${(style.textAlign || 'left') === val ? 'text-sidebar-toolbar__icon-btn--active' : ''}`}
              onClick={() => updateStyle({ textAlign: val })}
              title={`Align ${val}`}
            >
              {icon}
            </button>
          ))}
          <button
            type="button"
            className="text-sidebar-toolbar__icon-btn"
            title="Line height"
            onClick={() =>
              updateStyle({
                lineHeight: (parseFloat(style.lineHeight) || 1.2) >= 1.6 ? 1.2 : 1.6,
              })
            }
          >
            <MdFormatLineSpacing size={15} />
          </button>
        </div>
      </div>
  );

  const textInput = (
    <input
      type="text"
      value={textContent}
      onChange={(e) => updateTextContent(e.target.value)}
      placeholder="Edit text on canvas…"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: 'var(--ts-surface)',
        border: '1px solid var(--ts-border)',
        borderRadius: 8,
        padding: '8px 10px',
        fontSize: 12,
        color: 'var(--ts-text)',
        outline: 'none',
      }}
    />
  );

  return (
    <div className={`text-sidebar-panel ${isRight ? 'text-sidebar-panel--right' : ''}`}>
      {isRight ? (
        <div className="text-sidebar-panel__titlebar">
          <span className="text-sidebar-panel__title">
            <MdTextFields size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
            {layerSubtitle || 'Text'}
          </span>
        </div>
      ) : null}

      {isRight && useAccordion ? (
        <div style={{ padding: '0 14px 8px' }}>
          <PropertiesAccordion
            sections={[
              {
                id: 'position',
                title: 'Position',
                icon: <MdOpenInFull size={14} />,
                content: (
                  <LayerTransformBar
                    clip={activeLayer}
                    onPositionChange={(x, y) =>
                      updateLayer({ position: { ...(activeLayer.position || {}), x, y } })
                    }
                    onSizeChange={(w, h) =>
                      updateLayer({ size: { ...(activeLayer.size || {}), width: w, height: h } })
                    }
                  />
                ),
              },
              {
                id: 'text',
                title: 'Text',
                icon: <MdTextFields size={14} />,
                content: (
                  <>
                    {textToolbar}
                    <div style={{ paddingTop: 8 }}>{textInput}</div>
                  </>
                ),
              },
              {
                id: 'animation',
                title: 'Animation',
                icon: <MdAnimation size={14} />,
                content: animationContent,
              },
              {
                id: 'effect',
                title: 'Effect',
                icon: <MdAutoAwesome size={14} />,
                content: effectContent,
              },
              {
                id: 'shape',
                title: 'Shape',
                icon: <MdInterests size={14} />,
                content: shapeContent,
              },
              {
                id: 'layer-order',
                title: 'Layer Order',
                icon: <MdLayers size={14} />,
                content: (
                  <TextLayerFooter
                    activeLayer={activeLayer}
                    clips={clips}
                    onMoveLayerOrder={onMoveLayerOrder}
                    onToggleLayerLock={onToggleLayerLock}
                    updateLayer={updateLayer}
                    embedded
                  />
                ),
              },
            ]}
          />
        </div>
      ) : (
        <>
          {isRight ? (
            <LayerTransformBar
              clip={activeLayer}
              onPositionChange={(x, y) =>
                updateLayer({ position: { ...(activeLayer.position || {}), x, y } })
              }
              onSizeChange={(w, h) =>
                updateLayer({ size: { ...(activeLayer.size || {}), width: w, height: h } })
              }
            />
          ) : null}
          {textToolbar}
          <div className={bodyClass}>
            <div className="text-sidebar-section" style={{ paddingTop: 8 }}>
              {textInput}
            </div>
            <div className="text-sidebar-effects-groups">
              <div className="text-sidebar-effects-groups__block">
                <h4 className="text-sidebar-effects-groups__heading">Animation</h4>
                {animationContent}
              </div>
              <div className="text-sidebar-effects-groups__block">
                <h4 className="text-sidebar-effects-groups__heading">Effect</h4>
                {effectContent}
              </div>
              <div className="text-sidebar-effects-groups__block">
                <h4 className="text-sidebar-effects-groups__heading">Shape</h4>
                {shapeContent}
              </div>
            </div>
            {isRight ? (
              <TextLayerFooter
                activeLayer={activeLayer}
                clips={clips}
                onMoveLayerOrder={onMoveLayerOrder}
                onToggleLayerLock={onToggleLayerLock}
                updateLayer={updateLayer}
              />
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default TextSidebarPanel;
