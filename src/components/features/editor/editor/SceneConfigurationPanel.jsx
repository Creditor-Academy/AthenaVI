import { useState } from 'react';
import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdTextFields,
  MdColorLens,
  MdMonitor,
  MdTune,
  MdGridView,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdWarning,
  MdRefresh,
  MdImage,
  MdWallpaper,
  MdCropFree,
  MdRoundedCorner,
  MdFlip,
  MdContrast,
  MdFilterVintage,
  MdInvertColors,
  MdPalette,
  MdLink,
  MdBorderStyle,
  MdOpenInFull,
  MdFitScreen,
  MdCenterFocusStrong,
  MdSettings,
  MdPerson,
  MdRecordVoiceOver,
  MdPersonAdd,
  MdSmartDisplay,
  MdSchedule,
  MdSpeed,
} from 'react-icons/md';
import projectTemplate from '../../../../constants/projectTemplate.json';

/* ── Tiny helpers ─────────────────────────────────────────────────────────── */

const Divider = () => (
  <div style={{ height: 1, background: 'var(--border-subtle, rgba(0,0,0,0.07))', margin: '4px 0' }} />
);

const PanelHeader = ({ icon, title, subtitle }) => (
  <div className="scp-panel-header">
    <div className="scp-panel-header__icon">{icon}</div>
    <div>
      <div className="scp-panel-header__title">{title}</div>
      {subtitle ? <div className="scp-panel-header__subtitle">{subtitle}</div> : null}
    </div>
  </div>
);

const SectionHeader = ({ icon, label }) => (
  <div className="scp-section-header">
    <div className="scp-section-header__icon">{icon}</div>
    <span className="scp-section-header__label">{label}</span>
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

const AlignButtons = ({ value, onChange }) => {
  const btns = [
    { icon: <MdFormatAlignLeft size={14} />, val: 'left' },
    { icon: <MdFormatAlignCenter size={14} />, val: 'center' },
    { icon: <MdFormatAlignRight size={14} />, val: 'right' },
  ];
  const active = value || 'center';
  return (
    <div className="scp-align-group">
      {btns.map(({ icon, val }) => (
        <button
          key={val}
          type="button"
          className={`scp-align-btn ${active === val ? 'active' : ''}`}
          onClick={() => onChange(val)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

const Card = ({ children, className = '', style = {} }) => (
  <div className={`scp-card ${className}`.trim()} style={style}>
    {children}
  </div>
);

const PillButton = ({ children, onClick, variant = 'outline', className = '', ...props }) => (
  <button
    type="button"
    className={`scp-btn ${variant === 'primary' ? 'scp-btn--primary' : ''} ${className}`.trim()}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const StatusDot = ({ active }) => (
  <span className={`scp-status-dot ${active ? 'scp-status-dot--on' : 'scp-status-dot--off'}`} />
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

/* ── Fit-mode button group ───────────────────────────────────────────────── */
const FitButtons = ({ value, onChange }) => {
  const opts = [
    { val: 'cover',   icon: <MdCenterFocusStrong size={13} />, label: 'Cover'   },
    { val: 'contain', icon: <MdFitScreen size={13} />,         label: 'Contain' },
    { val: 'fill',    icon: <MdOpenInFull size={13} />,        label: 'Fill'    },
  ];
  const active = value || 'cover';
  return (
    <div style={{ display: 'flex', gap: 4, flex: 1 }}>
      {opts.map(({ val, icon, label }) => (
        <button key={val} onClick={() => onChange(val)} style={{
          flex: 1, padding: '5px 4px', borderRadius: 7, border: 'none', cursor: 'pointer',
          background: active === val ? 'var(--primary)' : 'white',
          color: active === val ? '#fff' : 'var(--text-muted)',
          border: active === val ? '1px solid var(--primary)' : '1px solid var(--border-color)',
          fontSize: 10, fontWeight: 700, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 2, transition: 'all 0.15s',
        }}>
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   LAYER PROPERTIES PANEL
══════════════════════════════════════════════════════════════════════════ */
const LayerPanel = ({ activeLayer, clips, activeSceneId, updateScene, activeScene }) => {
  const updateLayer = (updates) => {
    const newClips = clips.map(l => l.id === activeLayer.id ? { ...l, ...updates } : l);
    updateScene(activeSceneId, { clips: newClips });
  };
  const updateStyle  = (updates) => updateLayer({ style:   { ...activeLayer.style,   ...updates } });
  const updateEffect = (updates) => updateLayer({ effects: { ...activeLayer.effects, ...updates } });
  const updateFilter = (key, val) => updateLayer({
    cssFilters: { ...(activeLayer.cssFilters || {}), [key]: val },
  });

  // Broad image detection — covers type='image' regardless of role/label
  const isImage  = activeLayer.type === 'image';
  const isText   = activeLayer.type === 'text'  || activeLayer.role === 'main-text';
  const isHeading = isText && (activeLayer.role === 'main-text' || activeLayer.label?.toLowerCase().includes('head'));
  const isMedia  = !isImage && (activeLayer.type === 'video' || activeLayer.role === 'avatar' || activeLayer.role === 'media');
  const isShape  = activeLayer.type === 'shape';

  const roleLabel = isHeading
    ? 'Heading'
    : activeLayer.role?.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
    || activeLayer.type?.[0].toUpperCase() + activeLayer.type?.slice(1) || 'General';

  const isBackground = !!activeLayer.isBackground;

  // "Set as Background" – keeps the clip but stretches it to fill the full canvas.
  // The clip stays in the timeline and is fully editable.
  const setAsBackground = () => {
    if (!activeLayer.src) return;
    // Save original dimensions so we can restore them if user unsets
    const origPos  = activeLayer._origPosition  || activeLayer.position;
    const origSize = activeLayer._origSize       || activeLayer.size;
    updateLayer({
      isBackground: true,
      _origPosition: origPos,
      _origSize: origSize,
      position: { x: 0, y: 0 },
      size: { width: 1920, height: 1080 },
      style: { ...(activeLayer.style || {}), objectFit: activeLayer.style?.objectFit || 'cover', zIndex: 0 },
    });
  };

  // Restore the clip to its previous position/size and clear the background flag
  const unsetAsBackground = () => {
    updateLayer({
      isBackground: false,
      position: activeLayer._origPosition || { x: 200, y: 200 },
      size: activeLayer._origSize || { width: 600, height: 400 },
      _origPosition: undefined,
      _origSize: undefined,
    });
  };

  // CSS filter helpers
  const cf = activeLayer.cssFilters || {};

  return (
    <div className="scene-config-panel" style={{ padding: '0 14px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PanelHeader
        icon={isImage ? <MdImage size={17} /> : isText ? <MdTextFields size={17} /> : <MdTune size={17} />}
        title={isImage ? 'Image Properties' : isHeading ? 'Heading Settings' : 'Layer Properties'}
        subtitle={roleLabel}
      />

      <Divider />

      {isImage && (
        <>
          {/* Background toggle hero button */}
          {isBackground ? (
            <div className="scp-banner scp-banner--active" style={{ marginBottom: 4, justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <MdWallpaper size={16} />
                Scene Background
              </span>
              <button type="button" className="scp-btn scp-btn--ghost" onClick={unsetAsBackground}>
                Unset
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="scp-banner"
              onClick={setAsBackground}
              disabled={!activeLayer.src}
              style={{ marginBottom: 4 }}
            >
              <MdWallpaper size={16} />
              {activeLayer.src ? 'Set as Scene Background' : 'Add image URL first'}
            </button>
          )}

          {/* Image source URL */}
          <SectionHeader icon={<MdLink size={14} />} label="Image Source" />
          <Card>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>URL</span>
            <input
              type="text"
              value={activeLayer.src || ''}
              onChange={(e) => updateLayer({ src: e.target.value })}
              placeholder="https://..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'white', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                borderRadius: 8, padding: '7px 10px', fontSize: 11,
                color: 'var(--text-main, #1a1b1c)', outline: 'none',
              }}
            />
            {activeLayer.src && (
              <div style={{
                width: '100%', height: 80, borderRadius: 8, overflow: 'hidden',
                background: '#f1f5f9', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
                marginTop: 4,
              }}>
                <img src={activeLayer.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none' }} />
              </div>
            )}
          </Card>

          {/* Fit & Flip */}
          <SectionHeader icon={<MdCropFree size={14} />} label="Fit & Flip" />
          <Card>
            <Row label="Object Fit" column>
              <FitButtons
                value={activeLayer.style?.objectFit || 'cover'}
                onChange={(v) => updateStyle({ objectFit: v })}
              />
            </Row>
            <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
              <button
                onClick={() => updateStyle({ scaleX: activeLayer.style?.scaleX === -1 ? 1 : -1 })}
                style={{
                  flex: 1, padding: '6px', borderRadius: 7, border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                  background: activeLayer.style?.scaleX === -1 ? 'rgba(var(--primary-rgb), 0.1)' : 'white',
                  color: activeLayer.style?.scaleX === -1 ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <MdFlip size={13} /> Flip H
              </button>
              <button
                onClick={() => updateStyle({ scaleY: activeLayer.style?.scaleY === -1 ? 1 : -1 })}
                style={{
                  flex: 1, padding: '6px', borderRadius: 7, border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                  background: activeLayer.style?.scaleY === -1 ? 'rgba(var(--primary-rgb), 0.1)' : 'white',
                  color: activeLayer.style?.scaleY === -1 ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  transform: 'rotate(90deg)',
                }}
              >
                <MdFlip size={13} /> Flip V
              </button>
            </div>
          </Card>

          {/* Adjustments */}
          <SectionHeader icon={<MdContrast size={14} />} label="Adjustments" />
          <Card>
            <SliderRow label="Opacity"    value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0}   max={100} unit="%" onChange={(v) => updateLayer({ opacity: v / 100 })} />
            <SliderRow label="Brightness" value={Math.round((cf.brightness ?? 1) * 100)} min={0}   max={200} unit="%" onChange={(v) => updateFilter('brightness', v / 100)} />
            <SliderRow label="Contrast"   value={Math.round((cf.contrast   ?? 1) * 100)} min={0}   max={200} unit="%" onChange={(v) => updateFilter('contrast',   v / 100)} />
            <SliderRow label="Saturation" value={Math.round((cf.saturate   ?? 1) * 100)} min={0}   max={200} unit="%" onChange={(v) => updateFilter('saturate',   v / 100)} />
            <SliderRow label="Blur"       value={cf.blur ?? 0}                             min={0}   max={20}  unit="px" onChange={(v) => updateFilter('blur',       v)} />
            <SliderRow label="Hue Shift"  value={cf.hueRotate ?? 0}                        min={0}   max={360} unit="°"  onChange={(v) => updateFilter('hueRotate',  v)} />
          </Card>

          {/* Effects */}
          <SectionHeader icon={<MdFilterVintage size={14} />} label="Effects" />
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MdInvertColors size={13} /> Invert Colors
                </span>
                <ToggleSwitch checked={cf.invert > 0}                  onChange={(v) => updateFilter('invert', v ? 1 : 0)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Grayscale</span>
                <ToggleSwitch checked={cf.grayscale > 0}                  onChange={(v) => updateFilter('grayscale', v ? 1 : 0)} />
              </div>
              <SliderRow label="Sepia" value={Math.round((cf.sepia ?? 0) * 100)} min={0} max={100} unit="%"                onChange={(v) => updateFilter('sepia', v / 100)} />
            </div>
          </Card>

          {/* Border & Frame */}
          <SectionHeader icon={<MdBorderStyle size={14} />} label="Border & Frame" />
          <Card>
            <SliderRow label="Radius" value={parseInt(activeLayer.style?.borderRadius || 0)} min={0} max={200} unit="px"              onChange={(v) => updateStyle({ borderRadius: `${v}px` })} />
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
          </Card>
        </>
      )}

      {/* ── TEXT ───────────────────────────────────────────────────────── */}
      {isText && (
        <>
          <SectionHeader icon={<MdTextFields size={14} />} label={isHeading ? 'Headline Text' : 'Content'} />
          <Card>
            {isHeading ? (
              <input
                type="text"
                value={activeLayer.content || ''}
                onChange={(e) => updateLayer({ content: e.target.value })}
                placeholder="Main title..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'white', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                  borderRadius: 8, padding: '7px 10px', fontSize: 12,
                  color: 'var(--text-main, #1a1b1c)', outline: 'none',
                }}
              />
            ) : (
              <textarea
                value={activeLayer.content || ''}
                onChange={(e) => updateLayer({ content: e.target.value })}
                rows={3}
                style={{
                  width: '100%', resize: 'vertical', boxSizing: 'border-box',
                  background: 'white', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                  borderRadius: 8, padding: '8px 10px', fontSize: 12,
                  color: 'var(--text-main, #1a1b1c)', outline: 'none', fontFamily: 'inherit',
                }}
              />
            )}
          </Card>
          <SectionHeader icon={<MdColorLens size={14} />} label="Typography & Style" />
          <Card>
            <SliderRow label="Font size" value={activeLayer.style?.fontSize || (isHeading ? 48 : 32)} min={12} max={200} unit="px" onChange={(v) => updateStyle({ fontSize: v })} />
            <Row label="Text Color" column>
              <input type="color" value={activeLayer.style?.color || '#000000'}
                onChange={(e) => updateStyle({ color: e.target.value })}
                style={{ width: 36, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none' }} />
            </Row>
            <Row label="Alignment" column>
              <AlignButtons
                value={activeLayer.style?.textAlign}
                onChange={(v) => updateStyle({ textAlign: v })}
              />
            </Row>
            <SliderRow label="Opacity" value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0} max={100} unit="%" onChange={(v) => updateLayer({ opacity: v / 100 })} />
            {!isHeading && (
              <SliderRow label="Brightness" value={Math.round((activeLayer.effects?.brightness ?? 1) * 100)} min={0} max={200} unit="%" onChange={(v) => updateEffect({ brightness: v / 100 })} />
            )}
          </Card>
        </>
      )}

      {/* ── MEDIA / AVATAR ─────────────────────────────────────────────── */}
      {isMedia && (() => {
        const isAvatar = activeLayer.type === 'avatar' || activeLayer.role === 'avatar';
        const src = activeLayer.src;
        const isVideoSrc = src && (src.includes('blob:') || src.match(/\.(mp4|webm|mov|avi)(\?|$)/i));
        const shapePresets = [
          { label: 'Circle',    value: '50%'    },
          { label: 'Rounded',  value: '24px'   },
          { label: 'Square',   value: '0px'    },
          { label: 'Squircle', value: '30%'    },
        ];
        const currentRadius = activeLayer.style?.borderRadius || '50%';

        const avCf = activeLayer.cssFilters || {};
        const avBuildFilter = (cf) => {
          const parts = [];
          if (cf.brightness != null && cf.brightness !== 1) parts.push(`brightness(${cf.brightness})`);
          if (cf.contrast   != null && cf.contrast   !== 1) parts.push(`contrast(${cf.contrast})`);
          if (cf.saturate   != null && cf.saturate   !== 1) parts.push(`saturate(${cf.saturate})`);
          if (cf.blur       != null && cf.blur       !== 0) parts.push(`blur(${cf.blur}px)`);
          if (cf.grayscale  != null && cf.grayscale  !== 0) parts.push(`grayscale(${cf.grayscale})`);
          return parts.length ? parts.join(' ') : undefined;
        };
        const previewFilter = avBuildFilter(avCf);

        return (
          <>
            {/* ─ Live preview ─ */}
            <SectionHeader icon={<MdImage size={14} />} label={isAvatar ? 'Avatar Preview' : 'Media Preview'} />
            <Card style={{ alignItems: 'center', padding: '12px' }}>
              {src ? (
                <div style={{
                  width: 110, height: 110,
                  borderRadius: currentRadius,
                  overflow: 'hidden',
                  border: activeLayer.style?.borderWidth
                    ? `${activeLayer.style.borderWidth} solid ${activeLayer.style.borderColor || 'var(--border-color)'}`
                    : '1px solid var(--border-color)',
                  boxShadow: activeLayer.style?.boxShadow || 'none',
                  background: '#f1f5f9',
                  flexShrink: 0,
                  filter: previewFilter,
                  opacity: activeLayer.opacity ?? 1,
                  transform: [
                    activeLayer.style?.scaleX === -1 ? 'scaleX(-1)' : '',
                    activeLayer.style?.scaleY === -1 ? 'scaleY(-1)' : '',
                  ].filter(Boolean).join(' ') || undefined,
                }}>
                  {isVideoSrc ? (
                    <video src={src} style={{ width: '100%', height: '100%', objectFit: activeLayer.style?.objectFit || 'cover' }}
                      muted autoPlay loop playsInline />
                  ) : (
                    <img src={src} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: activeLayer.style?.objectFit || 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }} />
                  )}
                </div>
              ) : (
                <div style={{
                  width: 110, height: 110, borderRadius: currentRadius,
                  background: 'var(--bg-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px dashed var(--border-color)',
                }}>
                  <MdPerson size={40} color="var(--text-muted)" />
                </div>
              )}
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>
                {isAvatar ? 'Avatar' : 'Media'} · {activeLayer.style?.objectFit || 'cover'} fit
              </span>
            </Card>

            {/* ─ Source URL ─ */}
            <SectionHeader icon={<MdLink size={14} />} label="Source" />
            <Card>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>URL / Blob</span>
              <input
                type="text"
                value={src || ''}
                onChange={(e) => updateLayer({ src: e.target.value })}
                placeholder="https://... or blob:..."
                style={{
                  width: '100%', boxSizing: 'border-box', fontFamily: 'monospace',
                  background: 'white', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                  borderRadius: 8, padding: '7px 10px', fontSize: 10,
                  color: 'var(--text-main)', outline: 'none',
                  wordBreak: 'break-all',
                }}
              />
            </Card>

            {/* ─ Shape ─ */}
            <SectionHeader icon={<MdRoundedCorner size={14} />} label="Shape" />
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                {shapePresets.map(({ label, value }) => (
                  <button key={value} onClick={() => updateStyle({ borderRadius: value })} style={{
                    padding: '7px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: currentRadius === value ? 'var(--primary)' : 'white',
                    color: currentRadius === value ? '#fff' : 'var(--text-muted)',
                    border: currentRadius === value ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
              <SliderRow label="Custom" value={parseInt(currentRadius) || 0} min={0} max={500} unit="px"                onChange={(v) => updateStyle({ borderRadius: `${v}px` })} />
            </Card>

            {/* ─ Fit & Flip ─ */}
            <SectionHeader icon={<MdCropFree size={14} />} label="Fit & Flip" />
            <Card>
              <Row label="Object Fit" column>
                <FitButtons
                  value={activeLayer.style?.objectFit || 'cover'}
                  onChange={(v) => updateStyle({ objectFit: v })}
                />
              </Row>
              <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
                <button
                  onClick={() => updateStyle({ scaleX: activeLayer.style?.scaleX === -1 ? 1 : -1 })}
                  style={{
                    flex: 1, padding: '7px', borderRadius: 7,
                    background: activeLayer.style?.scaleX === -1 ? 'rgba(var(--primary-rgb), 0.1)' : 'white',
                    color: activeLayer.style?.scaleX === -1 ? 'var(--primary)' : 'var(--text-muted)',
                    border: `1px solid ${activeLayer.style?.scaleX === -1 ? 'var(--primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  <MdFlip size={13} /> Flip H
                </button>
                <button
                  onClick={() => updateStyle({ scaleY: activeLayer.style?.scaleY === -1 ? 1 : -1 })}
                  style={{
                    flex: 1, padding: '7px', borderRadius: 7,
                    background: activeLayer.style?.scaleY === -1 ? 'rgba(var(--primary-rgb), 0.1)' : 'white',
                    color: activeLayer.style?.scaleY === -1 ? 'var(--primary)' : 'var(--text-muted)',
                    border: `1px solid ${activeLayer.style?.scaleY === -1 ? 'var(--primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    transform: 'rotate(90deg)',
                  }}
                >
                  <MdFlip size={13} /> Flip V
                </button>
              </div>
            </Card>

            {/* ─ Adjustments ─ */}
            <SectionHeader icon={<MdContrast size={14} />} label="Adjustments" />
            <Card>
              <SliderRow label="Opacity"    value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0} max={100} unit="%" onChange={(v) => updateLayer({ opacity: v / 100 })} />
              <SliderRow label="Brightness" value={Math.round((avCf.brightness ?? 1) * 100)} min={0} max={200} unit="%" onChange={(v) => updateFilter('brightness', v / 100)} />
              <SliderRow label="Contrast"   value={Math.round((avCf.contrast   ?? 1) * 100)} min={0} max={200} unit="%" onChange={(v) => updateFilter('contrast',   v / 100)} />
              <SliderRow label="Saturation" value={Math.round((avCf.saturate   ?? 1) * 100)} min={0} max={200} unit="%" onChange={(v) => updateFilter('saturate',   v / 100)} />
              <SliderRow label="Blur"       value={avCf.blur ?? 0}                             min={0} max={20}  unit="px" onChange={(v) => updateFilter('blur',       v)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Grayscale</span>
                <ToggleSwitch checked={avCf.grayscale > 0}                  onChange={(v) => updateFilter('grayscale', v ? 1 : 0)} />
              </div>
            </Card>

            {/* ─ Border & Shadow ─ */}
            <SectionHeader icon={<MdBorderStyle size={14} />} label="Border & Shadow" />
            <Card>
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
                    { value: '0 8px 32px rgba(0,0,0,0.3)',        label: 'Soft Dark' },
                    { value: '0 4px 20px rgba(124,58,237,0.5)',   label: 'Purple Glow' },
                    { value: '0 0 0 4px rgba(124,58,237,0.3)',    label: 'Ring' },
                    { value: '0 20px 60px rgba(0,0,0,0.4)',       label: 'Deep Drop' },
                    { value: '0 0 30px rgba(255,255,255,0.6)',     label: 'White Glow' },
                  ]}
                  onChange={(v) => updateStyle({ boxShadow: v })}
                />
              )}
            </Card>
          </>
        );
      })()}

      {/* ── SHAPE ──────────────────────────────────────────────────────── */}
      {isShape && (
        <>
          <SectionHeader icon={<MdPalette size={14} />} label="Fill & Style" />
          <Card>
            <Row label="Fill Color" column>
              <input type="color"
                value={activeLayer.style?.backgroundColor || '#000000'}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                style={{ width: 36, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none' }} />
            </Row>
            <SliderRow label="Opacity"    value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0} max={100} unit="%" onChange={(v) => updateLayer({ opacity: v / 100 })} />
            <SliderRow label="Radius" value={parseInt(activeLayer.style?.borderRadius || 0)} min={0} max={500} unit="px"              onChange={(v) => updateStyle({ borderRadius: `${v}px` })} />
          </Card>
        </>
      )}

      {/* ── GENERAL (fallback) ─────────────────────────────────────────── */}
      {!isImage && !isText && !isMedia && !isShape && (
        <>
          <SectionHeader icon={<MdColorLens size={14} />} label="Visual" />
          <Card>
            <SliderRow label="Opacity"    value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0} max={100} unit="%" onChange={(v) => updateLayer({ opacity: v / 100 })} />
            <SliderRow label="Brightness" value={Math.round((activeLayer.effects?.brightness ?? 1) * 100)} min={0} max={200} unit="%" onChange={(v) => updateEffect({ brightness: v / 100 })} />
          </Card>
        </>
      )}

      {/* ── Visibility (universal) ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 2px' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
          {activeLayer.visible !== false ? <MdVisibility size={14} /> : <MdVisibilityOff size={14} />}
          Visible
        </span>
        <ToggleSwitch checked={activeLayer.visible !== false} onChange={(v) => updateLayer({ visible: v })} />
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
      />
    );
  }

  /* ── Scene-level panel ─────────────────────────────────────────────── */
  const isGenerating = activeScene.heygenStatus === 'processing';
  const isGenerated  = activeScene.heygenStatus === 'completed';
  const isFailed     = activeScene.heygenStatus === 'failed';
  const canGenerate  = activeScene.avatarType && activeScene.voiceId && activeScene.script;

  return (
    <div className="scene-config-panel" style={{ padding: '0 14px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PanelHeader
        icon={<MdSettings size={17} />}
        title="Scene Settings"
        subtitle="Configuration"
      />

      <Divider />

      {/* ── AI Voiceover & Script (priority) ─────────────────────────── */}
      <SectionHeader icon={<MdRecordVoiceOver size={14} />} label="AI Voiceover & Script" />

      <button
        type="button"
        className="scp-btn scp-btn--primary scp-btn--block"
        onClick={onOpenQuickCreate}
        style={{ marginBottom: 4 }}
      >
        <MdPersonAdd size={16} />
        Add Avatar & Script
      </button>

      <Card style={{ gap: 8 }}>
        <div className="scp-voiceover-stack" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="scp-voiceover-row">
            <StatusDot active={!!activeScene.avatarType} />
            <div className="scp-voiceover-row__meta">
              <div className="scp-voiceover-row__label">Avatar</div>
              <div className="scp-voiceover-row__value">
                {activeScene.avatarName || activeScene.avatarType || '—'}
              </div>
            </div>
            <PillButton onClick={() => setActiveTab && setActiveTab('avatar')}>Change</PillButton>
          </div>
          <div className="scp-voiceover-row">
            <StatusDot active={!!activeScene.voiceId} />
            <div className="scp-voiceover-row__meta">
              <div className="scp-voiceover-row__label">Voice</div>
              <div className="scp-voiceover-row__value">
                {activeScene.voiceName || activeScene.voiceId || '—'}
              </div>
            </div>
            <PillButton onClick={() => setActiveTab && setActiveTab('mic')}>Change</PillButton>
          </div>
          {(activeScene.avatarType || activeScene.voiceId) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeScene.avatarType && (
                <PillButton variant="primary" onClick={() => applyGlobalSetting && applyGlobalSetting('avatar')}>
                  Apply Avatar to All
                </PillButton>
              )}
              {activeScene.voiceId && (
                <PillButton variant="primary" onClick={() => applyGlobalSetting && applyGlobalSetting('voice')}>
                  Apply Voice to All
                </PillButton>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Script</span>
        <textarea
          placeholder="Speak your words here..."
          value={activeScene.script || ''}
          onChange={(e) => updateScene(activeSceneId, { script: e.target.value })}
          rows={4}
          style={{
            width: '100%', resize: 'vertical', boxSizing: 'border-box',
            background: 'white', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
            borderRadius: 8, padding: '8px 10px', fontSize: 12,
            color: 'var(--text-main, #1a1b1c)', outline: 'none', fontFamily: 'inherit',
            lineHeight: 1.55,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted, #64748b)' }}>{(activeScene.script || '').length} characters</span>
          <SliderRow
            label="Speed"
            value={activeScene.voiceSettings?.speed || 1}
            min={0.5}
            max={2}
            step={0.1}
            unit="×"
            onChange={(v) => updateScene(activeSceneId, { voiceSettings: { ...(activeScene.voiceSettings || {}), speed: v } })}
          />
        </div>
      </Card>

      {/* Generate button */}
      <div style={{ marginTop: 4 }}>
        <button
          type="button"
          className="scp-btn scp-btn--primary scp-btn--block"
          disabled={isGenerating || (!canGenerate && !isGenerating)}
          onClick={() => generateSceneVideo(activeSceneId)}
          style={{ padding: '10px 14px', fontSize: 12 }}
        >
          {isGenerating ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Generating…
            </>
          ) : isGenerated ? (
            <><MdRefresh size={16} /> Regenerate Scene</>
          ) : (
            <><MdSmartDisplay size={16} /> Generate Scene Video</>
          )}
        </button>

        {/* Status messages */}
        {isGenerating && (
          <p style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', textAlign: 'center', marginTop: 8 }}>
            HeyGen is crafting your video. This may take a minute…
          </p>
        )}
        {isGenerated && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <MdCheckCircle size={14} color="#10b981" />
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Video generated successfully</span>
            </div>
            <button
              type="button"
              className="scp-btn scp-btn--block"
              onClick={() => {
                const url = activeScene.generatedVideoUrl || activeScene.clips?.find(c => c.role === 'avatar' || c.type === 'video')?.src;
                if (url) window.dispatchEvent(new CustomEvent('open-generated-video', { detail: { url } }));
                else alert('Video URL not found. It might still be processing.');
              }}
            >
              <MdMonitor size={14} /> View Generated Video
            </button>
          </div>
        )}
        {isFailed && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <MdWarning size={14} color="#ef4444" />
            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Generation failed. Please try again.</span>
          </div>
        )}
      </div>

      <Divider />

      {/* ── Visual Composition ─────────────────────────────────────── */}
      <SectionHeader icon={<MdGridView size={14} />} label="Visual Composition" />
      <Card>
        <Row label="Scene Layout" column>
          <select
            value={activeScene.layout || 'split-right'}
            onChange={(e) => {
              const newLayout = e.target.value;
              const template = projectTemplate.project.scenes.find(t => t.id === newLayout);
              let newClips = clips;
              if (template) {
                let tc = JSON.parse(JSON.stringify(template.clips));
                const existingAvatar = clips.find(c => c.role === 'avatar' || c.type === 'video');
                if (existingAvatar) {
                  const ai = tc.findIndex(c =>
                    c.label?.toLowerCase().includes('avatar') ||
                    c.label?.toLowerCase().includes('media') ||
                    c.label?.toLowerCase().includes('center image') ||
                    (c.type === 'image' && !c.label?.toLowerCase().includes('logo'))
                  );
                  if (ai !== -1) tc[ai] = { ...tc[ai], src: existingAvatar.src, type: existingAvatar.type, role: 'avatar' };
                }
                const existingText = clips.find(c => c.type === 'text' || c.role === 'main-text');
                if (existingText) {
                  const ti = tc.findIndex(c => c.type === 'text');
                  if (ti !== -1) tc[ti].content = existingText.content;
                }
                newClips = tc;
              }
              updateScene(activeSceneId, { layout: newLayout, clips: newClips });
            }}
            style={{
              width: '100%', background: 'white', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
              borderRadius: 8, padding: '7px 10px', fontSize: 11, fontWeight: 600,
              color: 'var(--text-main, #1a1b1c)', cursor: 'pointer', outline: 'none',
            }}
          >
            {projectTemplate.project.scenes.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </Row>
        <SliderRow label="Background Blur" value={activeScene.bgBlur || 0} min={0} max={20} unit="px" onChange={(v) => updateScene(activeSceneId, { bgBlur: v })} />
      </Card>

      {/* ── Timing & Playback ──────────────────────────────────────── */}
      <SectionHeader icon={<MdSchedule size={14} />} label="Timing & Playback" />
      <Card>
        <SliderRow label="Duration" value={activeScene.duration || 8} min={1} max={60} step={0.5} unit="s" onChange={(v) => updateScene(activeSceneId, { duration: v })} />
        <SelectRow
          label="Entrance Speed"
          value={activeScene.entranceSpeed || 'normal'}
          options={[
            { value: 'slow', label: 'Slow (0.5×)' },
            { value: 'normal', label: 'Normal (1×)' },
            { value: 'fast', label: 'Fast (1.5×)' },
          ]}
          onChange={(v) => updateScene(activeSceneId, { entranceSpeed: v })}
        />
      </Card>
    </div>
  );
};

export default SceneConfigurationPanel;
