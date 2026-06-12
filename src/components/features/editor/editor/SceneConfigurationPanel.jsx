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
import './TextSidebarPanel.css';
import './SceneSettingsPanel.css';
import './PropertiesAccordion.css';

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

const ImageBorderFrameContent = ({ activeLayer, updateStyle }) => (
  <>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {[0, 8, 16, 24, 48].map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => updateStyle({ borderRadius: `${r}px` })}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: `1px solid ${parseInt(activeLayer.style?.borderRadius || 0) === r ? 'var(--primary)' : 'var(--border-subtle, rgba(0,0,0,0.1))'}`,
            background: parseInt(activeLayer.style?.borderRadius || 0) === r ? 'rgba(124,58,237,0.08)' : 'white',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {r}px
        </button>
      ))}
    </div>
    <Row label="Border" column>
      <div style={{ display: 'flex', gap: 6, width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="number" min={0} max={20}
          value={parseInt(activeLayer.style?.borderWidth || 0)}
          onChange={(e) => updateStyle({ borderWidth: `${e.target.value}px`, borderStyle: 'solid' })}
          style={{
            width: 48, textAlign: 'center', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
            borderRadius: 7, padding: '4px 6px', fontSize: 11, fontWeight: 600,
            background: 'white', color: 'var(--text-main)',
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>px</span>
        <input
          type="color"
          value={activeLayer.style?.borderColor || '#000000'}
          onChange={(e) => updateStyle({ borderColor: e.target.value, borderStyle: 'solid' })}
          style={{ width: 30, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flex: 1 }}
        />
      </div>
    </Row>
    <Row label="Shadow">
      <ToggleSwitch
        checked={!!(activeLayer.style?.boxShadow && activeLayer.style.boxShadow !== 'none')}
        onChange={(v) => updateStyle({ boxShadow: v ? '0 8px 32px rgba(0,0,0,0.25)' : 'none' })}
      />
    </Row>
  </>
);

const MediaBorderShadowContent = ({ activeLayer, updateStyle }) => (
  <>
    <Row label="Border">
      <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center' }}>
        <input
          type="number" min={0} max={20}
          value={parseInt(activeLayer.style?.borderWidth || 0)}
          onChange={(e) => updateStyle({ borderWidth: `${e.target.value}px`, borderStyle: 'solid' })}
          style={{
            width: 44, textAlign: 'center',
            border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
            borderRadius: 7, padding: '4px 4px', fontSize: 11, fontWeight: 600,
            background: 'white', color: 'var(--text-main)',
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>px</span>
        <input
          type="color"
          value={activeLayer.style?.borderColor || '#94a3b8'}
          onChange={(e) => updateStyle({ borderColor: e.target.value, borderStyle: 'solid' })}
          style={{ width: 30, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flex: 1 }}
        />
      </div>
    </Row>
    <Row label="Shadow">
      <ToggleSwitch
        checked={!!(activeLayer.style?.boxShadow && activeLayer.style.boxShadow !== 'none')}
        onChange={(v) => updateStyle({ boxShadow: v ? '0 8px 32px rgba(0,0,0,0.3)' : 'none' })}
      />
    </Row>
    {activeLayer.style?.boxShadow && activeLayer.style.boxShadow !== 'none' && (
      <SelectRow
        label="Shadow Preset"
        value={activeLayer.style.boxShadow}
        options={[
          { value: '0 8px 32px rgba(0,0,0,0.3)', label: 'Soft Dark' },
          { value: '0 4px 20px rgba(124,58,237,0.5)', label: 'Purple Glow' },
          { value: '0 0 0 4px rgba(124,58,237,0.3)', label: 'Ring' },
          { value: '0 20px 60px rgba(0,0,0,0.4)', label: 'Deep Drop' },
          { value: '0 0 30px rgba(255,255,255,0.6)', label: 'White Glow' },
        ]}
        onChange={(v) => updateStyle({ boxShadow: v })}
      />
    )}
  </>
);

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
  const shapePresets = [
    { label: 'Circle', value: '50%' },
    { label: 'Rounded', value: '24px' },
    { label: 'Square', value: '0px' },
    { label: 'Squircle', value: '30%' },
  ];
  const currentRadius = activeLayer.style?.borderRadius || (isAvatar ? '50%' : '0px');

  const positionSection = {
    id: 'position',
    title: 'Position',
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
    icon: <MdAnimation size={14} />,
    content: <LayerAnimatePanel activeLayer={activeLayer} updateLayer={updateLayer} hideHeader />,
  } : null;

  const layerOrderSection = {
    id: 'layer-order',
    title: 'Layer Order',
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
      animationSection,
      {
        id: 'fit-adjust',
        title: 'Fit & Adjust',
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
        icon: <MdBorderStyle size={14} />,
        content: <ImageBorderFrameContent activeLayer={activeLayer} updateStyle={updateStyle} />,
      },
      layerOrderSection,
    ].filter(Boolean);
  } else if (isMedia && isAvatar) {
    accordionSections = [
      positionSection,
      {
        id: 'avatar',
        title: 'Avatar',
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
        title: 'Shape',
        icon: <MdRoundedCorner size={14} />,
        content: (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {shapePresets.map(({ label, value }) => (
                <button key={value} type="button" onClick={() => updateStyle({ borderRadius: value })} style={{
                  padding: '7px 6px', borderRadius: 8, cursor: 'pointer',
                  background: currentRadius === value ? 'var(--primary)' : 'white',
                  color: currentRadius === value ? '#fff' : 'var(--text-muted)',
                  border: currentRadius === value ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                }}>
                  {label}
                </button>
              ))}
            </div>
            <SliderRow label="Custom" value={parseInt(currentRadius) || 0} min={0} max={500} unit="px" onChange={(v) => updateStyle({ borderRadius: `${v}px` })} />
          </>
        ),
      },
      animationSection,
      {
        id: 'fit-adjustment',
        title: 'Fit & Adjustment',
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
        id: 'border-shadow',
        title: 'Border & Shadow',
        icon: <MdBorderStyle size={14} />,
        content: <MediaBorderShadowContent activeLayer={activeLayer} updateStyle={updateStyle} />,
      },
      layerOrderSection,
    ].filter(Boolean);
  } else if (isMedia) {
    accordionSections = [
      positionSection,
      animationSection,
      {
        id: 'fit-adjust',
        title: 'Fit & Adjust',
        icon: <MdCropFree size={14} />,
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
                color: 'var(--text-main)', outline: 'none', wordBreak: 'break-all', marginBottom: 10,
              }}
            />
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
              extraEffects={(
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Grayscale</span>
                  <ToggleSwitch checked={cf.grayscale > 0} onChange={(v) => updateFilter('grayscale', v ? 1 : 0)} />
                </div>
              )}
            />
          </>
        ),
      },
      {
        id: 'border-frame',
        title: 'Border & Frame',
        icon: <MdBorderStyle size={14} />,
        content: <MediaBorderShadowContent activeLayer={activeLayer} updateStyle={updateStyle} />,
      },
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
        <PropertiesAccordion sections={accordionSections} />
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
