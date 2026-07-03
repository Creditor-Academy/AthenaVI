import { useMemo } from 'react';
import { normalizeVoiceGender } from '../../../utils/voiceGender';
import './VoiceCuteAvatar.css';

function hashSeed(value = '') {
  let hash = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickVariant(seed, gender) {
  const kind = normalizeVoiceGender(gender);
  const offset = kind === 'male' ? 2 : kind === 'female' ? 0 : 1;
  return (hashSeed(seed) + offset) % 9;
}

const SKIN = '#FCD9B6';
const BLUSH = '#FCA5A5';
const OUTLINE = '#111827';

function Face({ cx = 50, cy = 52, wink = false }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx="18" ry="20" fill={SKIN} stroke={OUTLINE} strokeWidth="1.6" />
      {wink ? (
        <>
          <path d={`M${cx - 9} ${cy - 1}h4`} stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx={cx + 7} cy={cy - 2} r="2" fill={OUTLINE} />
        </>
      ) : (
        <>
          <circle cx={cx - 7} cy={cy - 2} r="2" fill={OUTLINE} />
          <circle cx={cx + 7} cy={cy - 2} r="2" fill={OUTLINE} />
        </>
      )}
      <path
        d={`M${cx - 8} ${cy + 8}c2.5 2.5 11.5 2.5 16 0`}
        stroke={OUTLINE}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={cx - 12} cy={cy + 6} r="3.5" fill={BLUSH} opacity="0.55" />
      <circle cx={cx + 12} cy={cy + 6} r="3.5" fill={BLUSH} opacity="0.55" />
    </>
  );
}

const VARIANTS = [
  // 0 — yellow, cap + long hair
  () => (
    <>
      <rect width="100" height="100" fill="#FDE047" />
      <path d="M18 36c0-12 10-18 32-18s32 6 32 18v22H18V36Z" fill="#111827" />
      <path d="M22 28h56v10c0 8-12 12-28 12S22 46 22 38V28Z" fill="#111827" stroke={OUTLINE} strokeWidth="1.4" />
      <rect x="24" y="24" width="52" height="14" rx="4" fill="#111827" stroke={OUTLINE} strokeWidth="1.4" />
      <text x="50" y="34" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">
        NY
      </text>
      <Face />
      <path d="M28 72h44l-5 18H33L28 72Z" fill="#60A5FA" stroke={OUTLINE} strokeWidth="1.4" />
    </>
  ),
  // 1 — pink, short bob + hoops
  () => (
    <>
      <rect width="100" height="100" fill="#F9A8D4" />
      <path d="M20 34c0-10 8-16 30-16s30 6 30 16v24H20V34Z" fill="#111827" stroke={OUTLINE} strokeWidth="1.4" />
      <Face />
      <circle cx="28" cy="54" r="4" fill="none" stroke="#EAB308" strokeWidth="1.8" />
      <circle cx="72" cy="54" r="4" fill="none" stroke="#EAB308" strokeWidth="1.8" />
      <path d="M30 74h40l-4 16H34L30 74Z" fill="#FB7185" stroke={OUTLINE} strokeWidth="1.4" />
    </>
  ),
  // 2 — green, orange cap
  () => (
    <>
      <rect width="100" height="100" fill="#86EFAC" />
      <path d="M22 30c0-8 8-14 28-14s28 6 28 14v12H22V30Z" fill="#F97316" stroke={OUTLINE} strokeWidth="1.4" />
      <path d="M24 24h52v8H24V24Z" fill="#F97316" stroke={OUTLINE} strokeWidth="1.4" />
      <path d="M58 28c8 0 14 2 18 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <Face />
      <path d="M26 72h48l-4 16H30L26 72Z" fill="#2563EB" stroke={OUTLINE} strokeWidth="1.4" />
    </>
  ),
  // 3 — blue, curly hair + gold hoops
  () => (
    <>
      <rect width="100" height="100" fill="#93C5FD" />
      <path
        d="M18 40c2-12 12-18 32-18s30 6 32 18c-4 10-14 16-32 16S22 50 18 40Z"
        fill="#92400E"
        stroke={OUTLINE}
        strokeWidth="1.4"
      />
      <Face />
      <circle cx="27" cy="54" r="4" fill="none" stroke="#EAB308" strokeWidth="1.8" />
      <circle cx="73" cy="54" r="4" fill="none" stroke="#EAB308" strokeWidth="1.8" />
      <path d="M28 74h44l-4 14H32L28 74Z" fill="#A78BFA" stroke={OUTLINE} strokeWidth="1.4" />
    </>
  ),
  // 4 — slate, beanie + jacket
  () => (
    <>
      <rect width="100" height="100" fill="#CBD5E1" />
      <path d="M22 34c0-10 10-16 28-16s28 6 28 16v8H22V34Z" fill="#1D4ED8" stroke={OUTLINE} strokeWidth="1.4" />
      <rect x="24" y="22" width="52" height="12" rx="6" fill="#1D4ED8" stroke={OUTLINE} strokeWidth="1.4" />
      <Face />
      <path d="M24 72h52l-6 18H30L24 72Z" fill="#15803D" stroke={OUTLINE} strokeWidth="1.4" />
      <path d="M24 72h52v8H24v-8Z" fill="#166534" stroke={OUTLINE} strokeWidth="1.2" />
    </>
  ),
  // 5 — teal, bun + stripes
  () => (
    <>
      <rect width="100" height="100" fill="#5EEAD4" />
      <circle cx="50" cy="24" r="10" fill="#111827" stroke={OUTLINE} strokeWidth="1.4" />
      <path d="M22 36c0-8 10-14 28-14s28 6 28 14v22H22V36Z" fill="#111827" stroke={OUTLINE} strokeWidth="1.4" />
      <Face />
      <path d="M28 74h44v14H28V74Z" fill="#FACC15" stroke={OUTLINE} strokeWidth="1.4" />
      <path d="M28 78h44M28 82h44M28 86h44" stroke="#CA8A04" strokeWidth="1.2" />
    </>
  ),
  // 6 — orange, wink + short hair
  () => (
    <>
      <rect width="100" height="100" fill="#FDBA74" />
      <path d="M24 32c0-8 8-14 26-14s26 6 26 14v18H24V32Z" fill="#111827" stroke={OUTLINE} strokeWidth="1.4" />
      <Face wink />
      <path d="M30 72h40l-4 16H34L30 72Z" fill="#EF4444" stroke={OUTLINE} strokeWidth="1.4" />
    </>
  ),
  // 7 — amber, glasses
  () => (
    <>
      <rect width="100" height="100" fill="#FCD34D" />
      <path d="M22 32c0-8 10-14 28-14s28 6 28 14v20H22V32Z" fill="#78350F" stroke={OUTLINE} strokeWidth="1.4" />
      <Face />
      <circle cx="43" cy="50" r="8" fill="none" stroke={OUTLINE} strokeWidth="1.8" />
      <circle cx="57" cy="50" r="8" fill="none" stroke={OUTLINE} strokeWidth="1.8" />
      <path d="M51 50h2" stroke={OUTLINE} strokeWidth="1.8" />
      <path d="M28 74h44l-4 14H32L28 74Z" fill="#0EA5E9" stroke={OUTLINE} strokeWidth="1.4" />
    </>
  ),
  // 8 — rose, bangs + white hoops
  () => (
    <>
      <rect width="100" height="100" fill="#FDA4AF" />
      <path d="M20 38c0-12 12-18 30-18s30 6 30 18v8c-8 6-18 8-30 8s-22-2-30-8v-8Z" fill="#111827" stroke={OUTLINE} strokeWidth="1.4" />
      <path d="M24 36h52v8H24V36Z" fill="#111827" />
      <Face />
      <circle cx="28" cy="54" r="4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="72" cy="54" r="4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <path d="M30 74h40l-4 14H34L30 74Z" fill="#EC4899" stroke={OUTLINE} strokeWidth="1.4" />
    </>
  ),
];

function VoiceCuteAvatar({ seed = 'voice', gender, className = '', title }) {
  const variant = useMemo(() => pickVariant(seed, gender), [seed, gender]);
  const Render = VARIANTS[variant];

  return (
    <svg
      className={`voice-cute-avatar ${className}`.trim()}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <Render />
    </svg>
  );
}

export default VoiceCuteAvatar;
