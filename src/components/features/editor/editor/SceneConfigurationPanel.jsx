import { useState } from 'react';
import {
  MdMic,
  MdTimer,
  MdAutoAwesome,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdTextFields,
  MdGraphicEq,
  MdColorLens,
  MdAnimation,
  MdMonitor,
  MdPlayCircleFilled,
  MdTune,
  MdSpeed,
  MdBlurOn,
  MdGridView,
  MdLayers,
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
  MdOpacity,
  MdBlurCircular,
  MdPalette,
  MdLink,
  MdBorderStyle,
  MdOpenInFull,
  MdFitScreen,
  MdCenterFocusStrong,
} from 'react-icons/md';
import projectTemplate from '../../../../constants/projectTemplate.json';

/* ── Tiny helpers ─────────────────────────────────────────────────────────── */

const Divider = () => (
  <div style={{ height: 1, background: 'var(--border-subtle, rgba(0,0,0,0.07))', margin: '4px 0' }} />
);

const SectionHeader = ({ icon, label, accent = '#6366f1' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 0 6px',
  }}>
    <div style={{
      width: 28, height: 28,
      borderRadius: 8,
      background: `${accent}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main, #1a1b1c)', letterSpacing: '-0.2px' }}>
      {label}
    </span>
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

const SliderRow = ({ label, value, min, max, step = 1, unit = '', accentColor = '#6366f1', onChange }) => (
  <div className="scp-slider-row" style={{ padding: '6px 0', width: '100%', minWidth: 0 }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 6,
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
        {label}
      </span>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: accentColor,
        flexShrink: 0,
        background: `${accentColor}12`,
        padding: '2px 8px',
        borderRadius: 5,
      }}>
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
      style={{ width: '100%', accentColor, height: 4, cursor: 'pointer', display: 'block' }}
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
    <div style={{ display: 'flex', gap: 3, width: '100%', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-surface, #f8fafc)' }}>
      {btns.map(({ icon, val }) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          style={{
            flex: 1, padding: '6px 0', border: 'none', cursor: 'pointer',
            background: active === val ? '#6366f1' : 'transparent',
            color: active === val ? '#fff' : 'var(--text-muted, #64748b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

const Card = ({ children, style = {} }) => (
  <div className="scp-card" style={{
    background: 'var(--bg-surface, #f8fafc)',
    border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);

const PillButton = ({ children, onClick, variant = 'outline', style = {} }) => {
  const base = {
    padding: '5px 12px', fontSize: 11, fontWeight: 700, borderRadius: 7,
    cursor: 'pointer', border: 'none', transition: 'all 0.15s ease', ...style,
  };
  const styles = {
    outline: { background: 'white', color: '#7c3aed', border: '1px solid #c4b5fd', boxShadow: '0 1px 3px rgba(124,58,237,0.1)' },
    solid:   { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.35)' },
    danger:  { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' },
  };
  return <button style={{ ...base, ...styles[variant] }} onClick={onClick}>{children}</button>;
};

const StatusDot = ({ active }) => (
  <span style={{
    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
    background: active ? '#10b981' : '#ef4444',
    boxShadow: `0 0 6px ${active ? '#10b981' : '#ef4444'}88`,
    flexShrink: 0,
  }} />
);

/* ── Toggle switch helper ─────────────────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, accent = '#1a73e8' }) => (
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
          background: active === val ? '#1a73e8' : 'white',
          color: active === val ? 'white' : 'var(--text-muted, #64748b)',
          border: active === val ? 'none' : '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
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
  const isMedia  = !isImage && (activeLayer.type === 'video' || activeLayer.role === 'avatar' || activeLayer.role === 'media');
  const isShape  = activeLayer.type === 'shape';

  const roleLabel = activeLayer.role?.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
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

  const acBlue   = '#1a73e8';
  const acGreen  = '#059669';
  const acPurple = '#7c3aed';
  const acOrange = '#ea580c';
  const acPink   = '#db2777';
  const acCyan   = '#0891b2';

  // CSS filter helpers
  const cf = activeLayer.cssFilters || {};

  return (
    <div className="scene-config-panel" style={{ padding: '0 14px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <div style={{ padding: '14px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: isImage ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
            : isText  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
            : isMedia ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
            : 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isImage ? <MdImage size={18} color="white" /> : <MdTune size={18} color="white" />}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main, #1a1b1c)', letterSpacing: '-0.3px' }}>
            {isImage ? 'Image Properties' : 'Layer Properties'}
          </div>
          <div style={{ fontSize: 10, color: isImage ? acCyan : acBlue, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {roleLabel}
          </div>
        </div>
      </div>

      <Divider />

      {isImage && (
        <>
          {/* Background toggle hero button */}
          {isBackground ? (
            <div style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(8,145,178,0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <MdWallpaper size={16} color="white" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Scene Background</span>
              </div>
              <button
                onClick={unsetAsBackground}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none',
                  background: 'rgba(255,255,255,0.2)', color: 'white',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                Unset
              </button>
            </div>
          ) : (
            <button
              onClick={setAsBackground}
              disabled={!activeLayer.src}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none',
                background: activeLayer.src
                  ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
                  : 'var(--bg-surface, #e2e8f0)',
                color: activeLayer.src ? 'white' : 'var(--text-muted, #94a3b8)',
                cursor: activeLayer.src ? 'pointer' : 'not-allowed',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                boxShadow: activeLayer.src ? '0 4px 12px rgba(8,145,178,0.35)' : 'none',
                transition: 'all 0.2s ease', marginBottom: 4,
              }}
            >
              <MdWallpaper size={16} />
              {activeLayer.src ? 'Set as Scene Background' : 'Add image URL first'}
            </button>
          )}

          {/* Image source URL */}
          <SectionHeader icon={<MdLink size={14} color={acCyan} />} label="Image Source" accent={acCyan} />
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
          <SectionHeader icon={<MdCropFree size={14} color={acBlue} />} label="Fit & Flip" accent={acBlue} />
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
                  background: activeLayer.style?.scaleX === -1 ? '#dbeafe' : 'white',
                  color: activeLayer.style?.scaleX === -1 ? acBlue : 'var(--text-muted, #64748b)',
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
                  background: activeLayer.style?.scaleY === -1 ? '#dbeafe' : 'white',
                  color: activeLayer.style?.scaleY === -1 ? acBlue : 'var(--text-muted, #64748b)',
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
          <SectionHeader icon={<MdContrast size={14} color={acPurple} />} label="Adjustments" accent={acPurple} />
          <Card>
            <SliderRow label="Opacity"    value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0}   max={100} unit="%" accentColor={acPurple} onChange={(v) => updateLayer({ opacity: v / 100 })} />
            <SliderRow label="Brightness" value={Math.round((cf.brightness ?? 1) * 100)} min={0}   max={200} unit="%" accentColor={acPurple} onChange={(v) => updateFilter('brightness', v / 100)} />
            <SliderRow label="Contrast"   value={Math.round((cf.contrast   ?? 1) * 100)} min={0}   max={200} unit="%" accentColor={acPurple} onChange={(v) => updateFilter('contrast',   v / 100)} />
            <SliderRow label="Saturation" value={Math.round((cf.saturate   ?? 1) * 100)} min={0}   max={200} unit="%" accentColor={acPurple} onChange={(v) => updateFilter('saturate',   v / 100)} />
            <SliderRow label="Blur"       value={cf.blur ?? 0}                             min={0}   max={20}  unit="px" accentColor={acPurple} onChange={(v) => updateFilter('blur',       v)} />
            <SliderRow label="Hue Shift"  value={cf.hueRotate ?? 0}                        min={0}   max={360} unit="°"  accentColor={acPurple} onChange={(v) => updateFilter('hueRotate',  v)} />
          </Card>

          {/* Effects */}
          <SectionHeader icon={<MdFilterVintage size={14} color={acPink} />} label="Effects" accent={acPink} />
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MdInvertColors size={13} /> Invert Colors
                </span>
                <ToggleSwitch checked={cf.invert > 0} accent={acPink}
                  onChange={(v) => updateFilter('invert', v ? 1 : 0)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Grayscale</span>
                <ToggleSwitch checked={cf.grayscale > 0} accent={acPink}
                  onChange={(v) => updateFilter('grayscale', v ? 1 : 0)} />
              </div>
              <SliderRow label="Sepia" value={Math.round((cf.sepia ?? 0) * 100)} min={0} max={100} unit="%" accentColor={acPink}
                onChange={(v) => updateFilter('sepia', v / 100)} />
            </div>
          </Card>

          {/* Border & Frame */}
          <SectionHeader icon={<MdBorderStyle size={14} color={acOrange} />} label="Border & Frame" accent={acOrange} />
          <Card>
            <SliderRow label="Radius" value={parseInt(activeLayer.style?.borderRadius || 0)} min={0} max={200} unit="px" accentColor={acOrange}
              onChange={(v) => updateStyle({ borderRadius: `${v}px` })} />
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
                accent={acOrange}
                onChange={(v) => updateStyle({ boxShadow: v ? '0 8px 32px rgba(0,0,0,0.25)' : 'none' })}
              />
            </Row>
          </Card>
        </>
      )}

      {/* ── TEXT ───────────────────────────────────────────────────────── */}
      {isText && (
        <>
          <SectionHeader icon={<MdTextFields size={14} color={acBlue} />} label="Content" accent={acBlue} />
          <Card>
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
          </Card>
          <SectionHeader icon={<MdColorLens size={14} color={acBlue} />} label="Style" accent={acBlue} />
          <Card>
            <SliderRow label="Opacity"   value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0}   max={100} unit="%" accentColor={acBlue} onChange={(v) => updateLayer({ opacity: v / 100 })} />
            <SliderRow label="Font size" value={activeLayer.style?.fontSize || 32}             min={12}  max={200} unit="px" accentColor={acBlue} onChange={(v) => updateStyle({ fontSize: v })} />
            <Row label="Text Color" column>
              <input type="color" value={activeLayer.style?.color || '#000000'}
                onChange={(e) => updateStyle({ color: e.target.value })}
                style={{ width: 36, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none' }} />
            </Row>
            <SliderRow label="Brightness" value={Math.round((activeLayer.effects?.brightness ?? 1) * 100)} min={0} max={200} unit="%" accentColor={acBlue} onChange={(v) => updateEffect({ brightness: v / 100 })} />
          </Card>
        </>
      )}

      {/* ── MEDIA / AVATAR ─────────────────────────────────────────────── */}
      {isMedia && (() => {
        const isAvatar = activeLayer.type === 'avatar' || activeLayer.role === 'avatar';
        const src = activeLayer.src;
        const isVideoSrc = src && (src.includes('blob:') || src.match(/\.(mp4|webm|mov|avi)(\?|$)/i));
        const acA = '#7c3aed'; // avatar accent

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
            <SectionHeader icon={<MdImage size={14} color={acA} />} label={isAvatar ? 'Avatar Preview' : 'Media Preview'} accent={acA} />
            <Card style={{ alignItems: 'center', padding: '12px' }}>
              {src ? (
                <div style={{
                  width: 110, height: 110,
                  borderRadius: currentRadius,
                  overflow: 'hidden',
                  border: activeLayer.style?.borderWidth
                    ? `${activeLayer.style.borderWidth} solid ${activeLayer.style.borderColor || '#7c3aed'}`
                    : '3px solid rgba(124,58,237,0.2)',
                  boxShadow: activeLayer.style?.boxShadow || '0 4px 16px rgba(124,58,237,0.15)',
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
                  background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px dashed rgba(124,58,237,0.3)',
                }}>
                  <MdPerson size={48} color="rgba(255,255,255,0.7)" />
                </div>
              )}
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>
                {isAvatar ? 'Avatar' : 'Media'} · {activeLayer.style?.objectFit || 'cover'} fit
              </span>
            </Card>

            {/* ─ Source URL ─ */}
            <SectionHeader icon={<MdLink size={14} color={acA} />} label="Source" accent={acA} />
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
            <SectionHeader icon={<MdRoundedCorner size={14} color={acA} />} label="Shape" accent={acA} />
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                {shapePresets.map(({ label, value }) => (
                  <button key={value} onClick={() => updateStyle({ borderRadius: value })} style={{
                    padding: '7px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: currentRadius === value ? acA : 'white',
                    color: currentRadius === value ? 'white' : 'var(--text-muted)',
                    border: currentRadius === value ? 'none' : '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                    fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
              <SliderRow label="Custom" value={parseInt(currentRadius) || 0} min={0} max={500} unit="px" accentColor={acA}
                onChange={(v) => updateStyle({ borderRadius: `${v}px` })} />
            </Card>

            {/* ─ Fit & Flip ─ */}
            <SectionHeader icon={<MdCropFree size={14} color={acA} />} label="Fit & Flip" accent={acA} />
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
                    background: activeLayer.style?.scaleX === -1 ? '#ede9fe' : 'white',
                    color: activeLayer.style?.scaleX === -1 ? acA : 'var(--text-muted)',
                    border: `1px solid ${activeLayer.style?.scaleX === -1 ? '#c4b5fd' : 'var(--border-subtle, rgba(0,0,0,0.1))'}`,
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
                    background: activeLayer.style?.scaleY === -1 ? '#ede9fe' : 'white',
                    color: activeLayer.style?.scaleY === -1 ? acA : 'var(--text-muted)',
                    border: `1px solid ${activeLayer.style?.scaleY === -1 ? '#c4b5fd' : 'var(--border-subtle, rgba(0,0,0,0.1))'}`,
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
            <SectionHeader icon={<MdContrast size={14} color={acA} />} label="Adjustments" accent={acA} />
            <Card>
              <SliderRow label="Opacity"    value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0} max={100} unit="%" accentColor={acA} onChange={(v) => updateLayer({ opacity: v / 100 })} />
              <SliderRow label="Brightness" value={Math.round((avCf.brightness ?? 1) * 100)} min={0} max={200} unit="%" accentColor={acA} onChange={(v) => updateFilter('brightness', v / 100)} />
              <SliderRow label="Contrast"   value={Math.round((avCf.contrast   ?? 1) * 100)} min={0} max={200} unit="%" accentColor={acA} onChange={(v) => updateFilter('contrast',   v / 100)} />
              <SliderRow label="Saturation" value={Math.round((avCf.saturate   ?? 1) * 100)} min={0} max={200} unit="%" accentColor={acA} onChange={(v) => updateFilter('saturate',   v / 100)} />
              <SliderRow label="Blur"       value={avCf.blur ?? 0}                             min={0} max={20}  unit="px" accentColor={acA} onChange={(v) => updateFilter('blur',       v)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Grayscale</span>
                <ToggleSwitch checked={avCf.grayscale > 0} accent={acA}
                  onChange={(v) => updateFilter('grayscale', v ? 1 : 0)} />
              </div>
            </Card>

            {/* ─ Border & Shadow ─ */}
            <SectionHeader icon={<MdBorderStyle size={14} color={acA} />} label="Border & Shadow" accent={acA} />
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
                    value={activeLayer.style?.borderColor || '#7c3aed'}
                    onChange={(e) => updateStyle({ borderColor: e.target.value, borderStyle: 'solid' })}
                    style={{ width: 30, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flex: 1 }}
                  />
                </div>
              </Row>
              <Row label="Shadow">
                <ToggleSwitch
                  checked={!!(activeLayer.style?.boxShadow && activeLayer.style.boxShadow !== 'none')}
                  accent={acA}
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
          <SectionHeader icon={<MdPalette size={14} color={acGreen} />} label="Fill & Style" accent={acGreen} />
          <Card>
            <Row label="Fill Color" column>
              <input type="color"
                value={activeLayer.style?.backgroundColor || '#000000'}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                style={{ width: 36, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none' }} />
            </Row>
            <SliderRow label="Opacity"    value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0} max={100} unit="%" accentColor={acGreen} onChange={(v) => updateLayer({ opacity: v / 100 })} />
            <SliderRow label="Radius" value={parseInt(activeLayer.style?.borderRadius || 0)} min={0} max={500} unit="px" accentColor={acGreen}
              onChange={(v) => updateStyle({ borderRadius: `${v}px` })} />
          </Card>
        </>
      )}

      {/* ── GENERAL (fallback) ─────────────────────────────────────────── */}
      {!isImage && !isText && !isMedia && !isShape && (
        <>
          <SectionHeader icon={<MdColorLens size={14} color={acBlue} />} label="Visual" accent={acBlue} />
          <Card>
            <SliderRow label="Opacity"    value={Math.round((activeLayer.opacity ?? 1) * 100)} min={0} max={100} unit="%" accentColor={acBlue} onChange={(v) => updateLayer({ opacity: v / 100 })} />
            <SliderRow label="Brightness" value={Math.round((activeLayer.effects?.brightness ?? 1) * 100)} min={0} max={200} unit="%" accentColor={acBlue} onChange={(v) => updateEffect({ brightness: v / 100 })} />
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
  bgMusic,
  setBgMusic,
  bgMusicVolume,
  setBgMusicVolume,
  selectedLayerId,
  generateSceneVideo,
  setActiveTab,
  applyGlobalSetting,
  onOpenQuickCreate,
}) => {
  if (!activeScene) return null;

  const clips = activeScene.clips || [];
  const activeLayer = clips.find(l => l.id === selectedLayerId);
  const textClip = clips.find(c => c.type === 'text' || c.role === 'main-text');
  const headlineText = textClip ? textClip.content : (activeScene.titleText || '');
  const headlineFontSize = textClip?.style?.fontSize || activeScene.titleStyle?.fontSize || 48;

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
      {/* Panel title */}
      <div style={{ padding: '14px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MdAutoAwesome size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main, #1a1b1c)', letterSpacing: '-0.3px' }}>Scene Settings</div>
          <div style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Configuration</div>
        </div>
      </div>

      <Divider />

      {/* ── Visual Composition ─────────────────────────────────────── */}
      <SectionHeader icon={<MdGridView size={14} color="#0891b2" />} label="Visual Composition" accent="#0891b2" />
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
        <SliderRow label="Background Blur" value={activeScene.bgBlur || 0} min={0} max={20} unit="px" accentColor="#0891b2" onChange={(v) => updateScene(activeSceneId, { bgBlur: v })} />
      </Card>

      {/* ── Timing ─────────────────────────────────────────────────── */}
      <SectionHeader icon={<MdTimer size={14} color="#2563eb" />} label="Timing & Playback" accent="#2563eb" />
      <Card>
        <SliderRow label="Duration" value={activeScene.duration || 8} min={1} max={60} step={0.5} unit="s" accentColor="#2563eb" onChange={(v) => updateScene(activeSceneId, { duration: v })} />
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

      {/* ── Typography ─────────────────────────────────────────────── */}
      <SectionHeader icon={<MdTextFields size={14} color="#4f46e5" />} label="Typography & Style" accent="#4f46e5" />
      <Card>
        <Row label="Headline Text" column>
          <input
            type="text"
            value={headlineText}
            onChange={(e) => {
              const val = e.target.value;
              if (textClip) {
                const newClips = clips.map(c => c.id === textClip.id ? { ...c, content: val } : c);
                updateScene(activeSceneId, { titleText: val, clips: newClips });
              } else {
                updateScene(activeSceneId, { titleText: val });
              }
            }}
            placeholder="Main title..."
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'white', border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
              borderRadius: 8, padding: '7px 10px', fontSize: 12,
              color: 'var(--text-main, #1a1b1c)', outline: 'none',
            }}
          />
        </Row>
        <SliderRow
          label="Font size"
          value={headlineFontSize}
          min={20}
          max={120}
          unit="px"
          accentColor="#4f46e5"
          onChange={(newSize) => {
            if (textClip) {
              const newClips = clips.map(c => c.id === textClip.id ? { ...c, style: { ...c.style, fontSize: newSize } } : c);
              updateScene(activeSceneId, { clips: newClips, titleStyle: { ...activeScene.titleStyle, fontSize: newSize } });
            } else {
              updateScene(activeSceneId, { titleStyle: { ...activeScene.titleStyle, fontSize: newSize } });
            }
          }}
        />
        <Row label="Text Color" column>
          <input
            type="color"
            value={activeScene.titleStyle?.color || '#000000'}
            onChange={(e) => updateScene(activeSceneId, { titleStyle: { ...activeScene.titleStyle, color: e.target.value } })}
            style={{ width: 36, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none' }}
          />
        </Row>
        <Row label="Alignment" column>
          <AlignButtons
            value={activeScene.titleStyle?.textAlign}
            onChange={(v) => updateScene(activeSceneId, { titleStyle: { ...activeScene.titleStyle, textAlign: v } })}
          />
        </Row>
      </Card>

      {/* ── AI Voiceover ────────────────────────────────────────────── */}
      <SectionHeader icon={<MdMic size={14} color="#9333ea" />} label="AI Voiceover & Script" accent="#9333ea" />

      {/* Avatar + Voice status */}
      <Card style={{ gap: 0 }}>
        {/* Avatar row */}
        <div className="scp-status-block" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <StatusDot active={!!activeScene.avatarType} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main, #1a1b1c)' }}>Avatar</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted, #64748b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeScene.avatarName || activeScene.avatarType || '—'}
              </div>
            </div>
          </div>
          <div className="scp-action-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <PillButton onClick={onOpenQuickCreate} variant="solid" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: 'white', border: 'none', padding: '5px 10px' }}>Quick Add</PillButton>
            <PillButton onClick={() => setActiveTab && setActiveTab('avatar')}>Change</PillButton>
            {activeScene.avatarType && (
              <PillButton variant="solid" onClick={() => applyGlobalSetting && applyGlobalSetting('avatar')}>Apply All</PillButton>
            )}
          </div>
        </div>
        {/* Voice row */}
        <div className="scp-status-block" style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <StatusDot active={!!activeScene.voiceId} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main, #1a1b1c)' }}>Voice</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted, #64748b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeScene.voiceName || activeScene.voiceId || '—'}
              </div>
            </div>
          </div>
          <div className="scp-action-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <PillButton onClick={() => setActiveTab && setActiveTab('mic')}>Change</PillButton>
            {activeScene.voiceId && (
              <PillButton variant="solid" onClick={() => applyGlobalSetting && applyGlobalSetting('voice')}>Apply All</PillButton>
            )}
          </div>
        </div>
      </Card>

      {/* Script */}
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
            accentColor="#9333ea"
            onChange={(v) => updateScene(activeSceneId, { voiceSettings: { ...(activeScene.voiceSettings || {}), speed: v } })}
          />
        </div>
      </Card>

      {/* Generate button */}
      <div style={{ marginTop: 4 }}>
        <button
          disabled={isGenerating || (!canGenerate && !isGenerating)}
          onClick={() => generateSceneVideo(activeSceneId)}
          style={{
            width: '100%', padding: '11px 16px', borderRadius: 10, border: 'none',
            fontWeight: 700, fontSize: 13, cursor: isGenerating ? 'wait' : (canGenerate || isGenerated ? 'pointer' : 'not-allowed'),
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: isGenerating
              ? 'var(--bg-surface, #f1f5f9)'
              : (canGenerate || isGenerated)
                ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                : 'var(--bg-surface, #e2e8f0)',
            color: isGenerating ? 'var(--text-muted, #64748b)' : (canGenerate || isGenerated) ? 'white' : 'var(--text-muted, #94a3b8)',
            boxShadow: (canGenerate || isGenerated) && !isGenerating ? '0 4px 14px rgba(124,58,237,0.4)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {isGenerating ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Generating…
            </>
          ) : isGenerated ? (
            <><MdRefresh size={16} /> Regenerate Scene</>
          ) : (
            <><MdAutoAwesome size={16} /> Generate Scene Video</>
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
              style={{
                width: '100%', padding: '8px', borderRadius: 9, border: '1px solid #d1d5db',
                background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                color: 'var(--text-main, #1a1b1c)',
              }}
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

      {/* ── Motion & Transitions ────────────────────────────────────── */}
      <SectionHeader icon={<MdAnimation size={14} color="#db2777" />} label="Motion & Transitions" accent="#db2777" />
      <Card>
        <SelectRow
          label="Transition"
          value={activeScene.transition || 'fade'}
          options={[
            { value: 'fade',  label: 'Dissolve (Fade)' },
            { value: 'slide', label: 'Slide Push' },
            { value: 'zoom',  label: 'Warp Zoom' },
            { value: 'blur',  label: 'Motion Blur' },
            { value: 'none',  label: 'No Transition' },
          ]}
          onChange={(v) => updateScene(activeSceneId, { transition: v })}
        />
        <SliderRow label="Motion Blur" value={activeScene.motionBlur ?? 0} min={0} max={10} step={1} accentColor="#db2777" onChange={(v) => updateScene(activeSceneId, { motionBlur: v })} />
      </Card>

      {/* ── Audio ───────────────────────────────────────────────────── */}
      <SectionHeader icon={<MdGraphicEq size={14} color="#ea580c" />} label="Audio Levels" accent="#ea580c" />
      <Card>
        <SliderRow label="BG Music" value={Math.round(bgMusicVolume * 100)} min={0} max={100} unit="%" accentColor="#ea580c" onChange={(v) => setBgMusicVolume(v / 100)} />
      </Card>
    </div>
  );
};

export default SceneConfigurationPanel;
