import { useMemo } from 'react';

function hashSeed(value = '') {
  let hash = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pseudoRandom(seed, index) {
  const x = Math.sin((seed + index) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildBarHeights(seed, count) {
  return Array.from({ length: count }, (_, i) => {
    const a = pseudoRandom(seed, i * 3);
    const b = pseudoRandom(seed, i * 3 + 1);
    const c = pseudoRandom(seed, i * 3 + 2);
    return 0.08 + (a * 0.5 + b * 0.28 + c * 0.22);
  });
}

const DENSITY_PRESETS = {
  timeline: { count: 200, barRatio: 0.18, maxBarW: 1, showCenterLine: true, showFill: false, maxAmp: 13 },
  sidebar: { count: 110, barRatio: 0.26, maxBarW: 1.4, showCenterLine: true, showFill: false, maxAmp: 12 },
};

const AudioWaveform = ({ seed = 'audio', className = '', density = 'timeline' }) => {
  const numericSeed = useMemo(() => hashSeed(seed), [seed]);
  const preset = DENSITY_PRESETS[density] || DENSITY_PRESETS.timeline;
  const bars = useMemo(() => buildBarHeights(numericSeed, preset.count), [numericSeed, preset.count]);

  const barSlot = 200 / bars.length;
  const mid = 16;

  return (
    <svg
      className={`audio-waveform audio-waveform--${density} ${className}`.trim()}
      viewBox="0 0 200 32"
      preserveAspectRatio="none"
      aria-hidden
    >
      {preset.showCenterLine ? (
        <line
          x1="0"
          y1={mid}
          x2="200"
          y2={mid}
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.28"
        />
      ) : null}
      {bars.map((h, i) => {
        const slotCenter = i * barSlot + barSlot / 2;
        const w = Math.min(preset.maxBarW, Math.max(0.55, barSlot * preset.barRatio));
        const barH = h * preset.maxAmp;
        const x = slotCenter - w / 2;
        return (
          <rect
            key={i}
            x={x}
            y={mid - barH}
            width={w}
            height={barH * 2}
            rx={0.35}
            fill="currentColor"
            opacity={0.42 + h * 0.5}
          />
        );
      })}
    </svg>
  );
};

export default AudioWaveform;
