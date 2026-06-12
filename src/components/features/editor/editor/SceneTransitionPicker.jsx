import React from 'react';
import {
  SCENE_TRANSITION_CATALOG,
  getSceneTransitionGroupId,
} from '../../../../utils/sceneTransitionUtils';
import './SceneTransitionPicker.css';

function DirectionArrow({ direction = 'left' }) {
  const rotation = {
    left: 0,
    right: 180,
    up: -90,
    down: 90,
    in: 0,
    out: 180,
  }[direction] ?? 0;

  return (
    <g transform={`translate(24 38) rotate(${rotation}) translate(-24 -38)`}>
      <path d="M14 38h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M14 38l4-3.5M14 38l4 3.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function TransitionIcon({ catalogValue }) {
  const groupId = getSceneTransitionGroupId(catalogValue);
  const direction = catalogValue.includes('-')
    ? catalogValue.split('-').pop()
    : 'left';

  const icons = {
    none: (
      <svg viewBox="0 0 48 48" aria-hidden>
        <line x1="14" y1="34" x2="34" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    dissolve: (
      <svg viewBox="0 0 48 48" aria-hidden>
        <rect x="10" y="12" width="6" height="24" rx="1" className="transition-icon__bar transition-icon__bar--1" />
        <rect x="18" y="12" width="6" height="24" rx="1" className="transition-icon__bar transition-icon__bar--2" />
        <rect x="26" y="12" width="6" height="24" rx="1" className="transition-icon__bar transition-icon__bar--3" />
        <rect x="34" y="12" width="4" height="24" rx="1" className="transition-icon__bar transition-icon__bar--4" />
      </svg>
    ),
    slide: (
      <svg viewBox="0 0 48 48" aria-hidden>
        <rect x="8" y="14" width="22" height="16" rx="2" className="transition-icon__shape transition-icon__shape--muted" />
        <rect x="18" y="18" width="22" height="16" rx="2" className="transition-icon__shape" />
        <DirectionArrow direction={direction} />
      </svg>
    ),
    'circle-wipe': (
      <svg viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="16" className="transition-icon__ring transition-icon__ring--outer" />
        <circle cx="24" cy="24" r="10" className="transition-icon__ring transition-icon__ring--mid" />
        <circle
          cx="24"
          cy="24"
          r={direction === 'out' ? 4 : 7}
          className="transition-icon__dot"
        />
      </svg>
    ),
    'color-wipe': (
      <svg viewBox="0 0 48 48" aria-hidden>
        <rect x="10" y="14" width="7" height="20" rx="1" className="transition-icon__bar transition-icon__bar--1" />
        <rect x="19" y="14" width="7" height="20" rx="1" className="transition-icon__bar transition-icon__bar--2" />
        <rect x="28" y="14" width="7" height="20" rx="1" className="transition-icon__bar transition-icon__bar--3" />
        <DirectionArrow direction={direction} />
      </svg>
    ),
    'line-wipe': (
      <svg viewBox="0 0 48 48" aria-hidden>
        <rect x="10" y="14" width="28" height="20" rx="2" className="transition-icon__shape transition-icon__shape--muted" />
        <rect x="10" y="14" width="14" height="20" rx="2" className="transition-icon__shape" />
        <DirectionArrow direction={direction} />
      </svg>
    ),
    'match-move': (
      <svg viewBox="0 0 48 48" aria-hidden>
        <path
          d="M8 26 L16 20 L24 28 L32 18 L40 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 32 L16 26 L24 34 L32 24 L40 30"
          fill="none"
          className="transition-icon__zigzag"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    flow: (
      <svg viewBox="0 0 48 48" aria-hidden>
        <rect x="18" y="16" width="22" height="16" rx="2" className="transition-icon__shape" />
        <path d="M8 20h6M8 24h8M8 28h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <DirectionArrow direction={direction} />
      </svg>
    ),
    stack: (
      <svg viewBox="0 0 48 48" aria-hidden>
        <rect x="12" y="12" width="24" height="16" rx="2" className="transition-icon__shape" />
        <rect x="16" y="30" width="24" height="6" rx="1" className="transition-icon__shape transition-icon__shape--muted" />
        <DirectionArrow direction={direction} />
      </svg>
    ),
    chop: (
      <svg viewBox="0 0 48 48" aria-hidden>
        <rect x="12" y="22" width="24" height="14" rx="2" className="transition-icon__shape" />
        <path
          d="M20 12c6 2 10 8 10 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M30 12l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return <span className="transition-icon">{icons[groupId] || icons.dissolve}</span>;
}

function SceneTransitionPicker({ activeValue, onSelect }) {
  return (
    <div className="scene-transition-picker">
      <div className="scene-transition-picker__grid premium-scrollbar">
        {SCENE_TRANSITION_CATALOG.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`scene-transition-picker__card ${
              activeValue === opt.value ? 'scene-transition-picker__card--active' : ''
            }`}
            onClick={() => onSelect(opt.value)}
            title={opt.label}
          >
            <TransitionIcon catalogValue={opt.value} />
            <span className="scene-transition-picker__card-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SceneTransitionPicker;
