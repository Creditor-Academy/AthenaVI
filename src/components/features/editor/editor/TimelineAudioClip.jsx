import { useEffect, useRef, useState } from 'react';
import { MdDeleteOutline, MdMoreHoriz, MdMusicNote } from 'react-icons/md';
import AudioWaveform from './AudioWaveform';
import { getAudioClipDisplayName, getAudioClipDurationSec } from '../../../../utils/audioClipUtils';
import './TimelineAudioClip.css';

const MiniSlider = ({ label, value, min, max, step, unit, onChange }) => (
  <label className="timeline-audio-menu__field">
    <span className="timeline-audio-menu__field-head">
      <span>{label}</span>
      <span>{typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}{unit}</span>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  </label>
);

const TimelineAudioClip = ({
  clip,
  audioSrc,
  zoom,
  left,
  width,
  selected = false,
  onSelect,
  onUpdate,
  onRemove,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = getAudioClipDisplayName(clip, audioSrc);
  const durationSec = getAudioClipDurationSec(clip);
  const volume = typeof clip?.volume === 'number' ? clip.volume : 1;
  const fadeIn = Number(clip?.fadeIn) || 0;
  const fadeOut = Number(clip?.fadeOut) || 0;
  const maxFade = Math.max(0.5, Math.min(8, durationSec / 2));

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  return (
    <div
      className={`timeline-audio-clip${selected ? ' timeline-audio-clip--selected' : ''}`}
      style={{ left, width: Math.max(width, 120) }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div className="timeline-audio-clip__wave" aria-hidden>
        <AudioWaveform seed={clip?.id || displayName} density="timeline" />
      </div>

      <div className="timeline-audio-clip__thumb" aria-hidden>
        <MdMusicNote size={14} />
      </div>

      <div className="timeline-audio-clip__meta">
        <span className="timeline-audio-clip__title" title={displayName}>
          {displayName}
        </span>
        <span className="timeline-audio-clip__dot" aria-hidden>•</span>
        <span className="timeline-audio-clip__duration">{durationSec.toFixed(1)}s</span>
      </div>

      <div className="timeline-audio-clip__actions" ref={menuRef}>
        <button
          type="button"
          className="timeline-audio-clip__menu-btn"
          aria-label="Audio options"
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((open) => !open);
          }}
        >
          <MdMoreHoriz size={16} />
        </button>

        {menuOpen ? (
          <div className="timeline-audio-menu" onClick={(e) => e.stopPropagation()}>
            <p className="timeline-audio-menu__title">Audio</p>
            <MiniSlider
              label="Volume"
              value={Math.round(volume * 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(pct) => onUpdate?.({ volume: pct / 100 })}
            />
            <MiniSlider
              label="Fade in"
              value={fadeIn}
              min={0}
              max={maxFade}
              step={0.1}
              unit="s"
              onChange={(v) => onUpdate?.({ fadeIn: v })}
            />
            <MiniSlider
              label="Fade out"
              value={fadeOut}
              min={0}
              max={maxFade}
              step={0.1}
              unit="s"
              onChange={(v) => onUpdate?.({ fadeOut: v })}
            />
            <button
              type="button"
              className="timeline-audio-menu__remove"
              onClick={() => {
                setMenuOpen(false);
                onRemove?.();
              }}
            >
              <MdDeleteOutline size={16} />
              Remove audio
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="timeline-audio-clip__trim"
        onMouseDown={(e) => e.stopPropagation()}
        aria-hidden
      />
    </div>
  );
};

export default TimelineAudioClip;
