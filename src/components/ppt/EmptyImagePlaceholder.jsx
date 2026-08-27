import { useId } from 'react'

/** Clear media fields on a layout image slot so the empty placeholder remains. */
export function clearImageMediaPatch() {
  return {
    url: null,
    src: null,
    thumbnailUrl: null,
    previewUrl: null,
    assetId: undefined,
    s3Key: undefined,
    provider: undefined,
    useAsBackground: false,
  }
}

export function isLayoutBoundImageSlot(el) {
  return el?.type === 'image' && Boolean(el.slotId)
}

/** Soft landscape graphic used for empty PPT image slots. */
export default function EmptyImagePlaceholder({ className = '', style, borderRadius }) {
  const uid = useId().replace(/:/g, '')
  const skyId = `pptEmptySky-${uid}`
  const hillBackId = `pptEmptyHillBack-${uid}`
  const hillFrontId = `pptEmptyHillFront-${uid}`

  return (
    <div
      className={['ppt-empty-image-placeholder', className].filter(Boolean).join(' ')}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: borderRadius != null ? borderRadius : undefined,
        ...style,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B7D4E8" />
            <stop offset="55%" stopColor="#C5DCEB" />
            <stop offset="100%" stopColor="#D0E3EF" />
          </linearGradient>
          <linearGradient id={hillBackId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8FBF8E" />
            <stop offset="100%" stopColor="#79AD78" />
          </linearGradient>
          <linearGradient id={hillFrontId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6FA56E" />
            <stop offset="100%" stopColor="#5E945D" />
          </linearGradient>
        </defs>

        <rect width="320" height="200" fill={`url(#${skyId})`} />

        <g fill="#FFFFFF" opacity="0.92">
          <ellipse cx="78" cy="48" rx="28" ry="14" />
          <ellipse cx="98" cy="48" rx="22" ry="12" />
          <ellipse cx="58" cy="50" rx="16" ry="10" />

          <ellipse cx="210" cy="36" rx="34" ry="16" />
          <ellipse cx="236" cy="36" rx="24" ry="13" />
          <ellipse cx="186" cy="38" rx="18" ry="11" />

          <ellipse cx="280" cy="62" rx="18" ry="9" />
          <ellipse cx="294" cy="62" rx="12" ry="7" />
        </g>

        <path
          d="M0 128 C40 108 78 118 112 126 C148 116 178 102 220 112 C252 120 280 128 320 118 L320 200 L0 200 Z"
          fill={`url(#${hillBackId})`}
        />
        <path
          d="M0 152 C36 136 70 148 108 156 C150 144 190 130 236 142 C268 150 296 158 320 150 L320 200 L0 200 Z"
          fill={`url(#${hillFrontId})`}
        />

        <g fill="#FFFFFF">
          <ellipse cx="52" cy="138" rx="5.5" ry="4" />
          <circle cx="47.5" cy="136.5" r="2.2" />
          <rect x="46.2" y="138.2" width="1.2" height="3.2" rx="0.5" />
          <rect x="49.6" y="138.6" width="1.2" height="3" rx="0.5" />
          <rect x="53" y="138.6" width="1.2" height="3" rx="0.5" />
          <rect x="55.8" y="138.2" width="1.2" height="3.2" rx="0.5" />
        </g>
      </svg>
    </div>
  )
}
