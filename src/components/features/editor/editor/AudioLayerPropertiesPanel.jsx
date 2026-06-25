import { MdAudiotrack, MdDeleteOutline, MdGraphicEq, MdMusicNote, MdSchedule, MdTune } from 'react-icons/md';
import { resolveAudioClipSrc, getAudioClipDisplayName } from '../../../../utils/audioClipUtils';
import AudioWaveform from './AudioWaveform';
import PropertiesAccordion from './PropertiesAccordion';
import './PropertiesAccordion.css';
import './LayerAnimatePanel.css';

const PANEL_GROUP = {
  AUDIO: 'Audio',
};

const FADE_PRESETS = [
  { value: 0, label: 'None' },
  { value: 0.5, label: '0.5s' },
  { value: 1, label: '1s' },
  { value: 2, label: '2s' },
  { value: 3, label: '3s' },
];

const PanelHeader = ({ icon, title, subtitle }) => (
  <div className="scp-panel-header">
    <div className="scp-panel-header__icon">{icon}</div>
    <div>
      <div className="scp-panel-header__title">{title}</div>
      {subtitle ? <div className="scp-panel-header__subtitle">{subtitle}</div> : null}
    </div>
  </div>
);

const SliderRow = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <div className="scp-slider-row" style={{ padding: '6px 0', width: '100%', minWidth: 0 }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 6,
      }}
    >
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
      style={{ width: '100%', height: 4, cursor: 'pointer', display: 'block' }}
    />
  </div>
);

const FadePresetGrid = ({ title, direction, value, maxFade, onChange }) => {
  const options = FADE_PRESETS.filter((p) => p.value === 0 || p.value <= maxFade);
  const isActive = (presetValue) => Math.abs(value - presetValue) < 0.05;

  return (
    <div className="audio-fade-section">
      <div className="layer-animate-section__head">
        <span className="layer-animate-section__title">{title}</span>
        <span className="scp-value-badge">{value > 0 ? `${value.toFixed(1)}s` : 'Off'}</span>
      </div>
      <div className="layer-animate-grid audio-fade-grid">
        {options.map((preset) => (
          <button
            key={`${direction}-${preset.value}`}
            type="button"
            className={`layer-animate-card audio-fade-card${isActive(preset.value) ? ' layer-animate-card--active' : ''}`}
            onClick={() => onChange(preset.value)}
          >
            <span
              className={`audio-fade-card__preview audio-fade-card__preview--${direction}${preset.value === 0 ? ' audio-fade-card__preview--none' : ''}`}
              aria-hidden
            />
            <span className="layer-animate-card__label">
              {preset.value === 0 ? 'None' : preset.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const AudioLayerPropertiesPanel = ({
  activeLayer,
  activeScene,
  updateLayer,
  onRemove,
}) => {
  const sceneDuration = Number(activeScene?.duration) || 8;
  const audioSrc = resolveAudioClipSrc(activeLayer, activeScene);
  const volume = typeof activeLayer.volume === 'number' ? activeLayer.volume : 1;
  const fadeIn = Number(activeLayer.fadeIn) || 0;
  const fadeOut = Number(activeLayer.fadeOut) || 0;
  const startTime = Number(activeLayer.startTime) || 0;
  const endTime = Number(activeLayer.endTime ?? sceneDuration) || sceneDuration;
  const clipDuration = Math.max(0.1, endTime - startTime);
  const maxFade = Math.max(0.5, Math.min(8, clipDuration / 2));
  const displayName = getAudioClipDisplayName(activeLayer, audioSrc);

  const sections = [
    {
      id: 'playback',
      title: 'Playback',
      icon: <MdAudiotrack size={14} />,
      content: (
        <div className="scp-card audio-props-preview-card">
          <div className="audio-props-preview-card__wave" aria-hidden>
            <AudioWaveform seed={activeLayer?.id || displayName} density="sidebar" />
          </div>
          {audioSrc ? (
            <audio src={audioSrc} controls preload="metadata" className="audio-props-preview-card__player" />
          ) : (
            <p className="audio-props-preview-card__missing">
              Audio URL unavailable. Save the project or re-add from Library.
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'levels',
      title: 'Volume & fade',
      group: PANEL_GROUP.AUDIO,
      icon: <MdTune size={14} />,
      content: (
        <>
          <SliderRow
            label="Volume"
            value={Math.round(volume * 100)}
            min={0}
            max={100}
            unit="%"
            onChange={(pct) => updateLayer({ volume: pct / 100 })}
          />
          <FadePresetGrid
            title="Fade in"
            direction="in"
            value={fadeIn}
            maxFade={maxFade}
            onChange={(v) => updateLayer({ fadeIn: v })}
          />
          <FadePresetGrid
            title="Fade out"
            direction="out"
            value={fadeOut}
            maxFade={maxFade}
            onChange={(v) => updateLayer({ fadeOut: v })}
          />
        </>
      ),
    },
    {
      id: 'timing',
      title: 'Timing',
      group: PANEL_GROUP.AUDIO,
      icon: <MdSchedule size={14} />,
      content: (
        <>
          <SliderRow
            label="Start in scene"
            value={startTime}
            min={0}
            max={Math.max(0, endTime - 0.1)}
            step={0.1}
            unit="s"
            onChange={(next) => updateLayer({ startTime: next })}
          />
          <SliderRow
            label="End in scene"
            value={endTime}
            min={Math.min(sceneDuration, startTime + 0.1)}
            max={sceneDuration}
            step={0.1}
            unit="s"
            onChange={(next) => updateLayer({ endTime: next, duration: next - startTime })}
          />
        </>
      ),
    },
    {
      id: 'actions',
      title: 'Actions',
      group: PANEL_GROUP.AUDIO,
      icon: <MdGraphicEq size={14} />,
      content: (
        <button type="button" className="scp-btn scp-btn--ghost audio-props-sidebar-remove" onClick={onRemove}>
          <MdDeleteOutline size={16} />
          Remove audio
        </button>
      ),
    },
  ];

  return (
    <div
      className="scene-config-panel audio-layer-panel"
      style={{ padding: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <div style={{ padding: '0 14px' }}>
        <PanelHeader
          icon={<MdMusicNote size={17} />}
          title="Audio Properties"
          subtitle={displayName}
        />
      </div>
      <div style={{ padding: '0 14px' }}>
        <PropertiesAccordion sections={sections} defaultExpandedIds={['playback', 'levels']} />
      </div>
    </div>
  );
};

export default AudioLayerPropertiesPanel;
