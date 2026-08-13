/** Shared image placeholder styling for layout catalog previews. */

export const PREVIEW_IMAGE_GRADIENT =
  'linear-gradient(145deg, color-mix(in srgb, var(--preview-accent, #6366f1) 10%, #f8fafc) 0%, #e2e8f0 52%, color-mix(in srgb, var(--preview-accent, #6366f1) 6%, #cbd5e1) 100%)'

export function previewImageFrameStyle({ large = false, hero = false, circle = false } = {}) {
  const radius = circle ? '50%' : hero ? (large ? 18 : 8) : (large ? 14 : 6)
  return {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    background: PREVIEW_IMAGE_GRADIENT,
    borderRadius: radius,
    border: `1px solid color-mix(in srgb, var(--preview-accent, #6366f1) 20%, #94a3b8)`,
    boxShadow: hero
      ? (large
        ? '0 14px 36px rgba(15, 23, 42, 0.12), 0 4px 14px color-mix(in srgb, var(--preview-accent, #6366f1) 14%, transparent)'
        : '0 4px 12px rgba(15, 23, 42, 0.1)')
      : (large
        ? '0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 8px color-mix(in srgb, var(--preview-accent, #6366f1) 8%, transparent)'
        : '0 2px 8px rgba(15, 23, 42, 0.06)'),
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}

/** Image block for layout previews — shows acquired photo or gradient placeholder. */
export function PreviewImage({ large = false, hero = false, fullBleed = false, src = '' }) {
  const frameStyle = previewImageFrameStyle({ large, hero: hero && !fullBleed })
  if (src) {
    return (
      <div
        style={{
          ...frameStyle,
          borderRadius: fullBleed ? 0 : frameStyle.borderRadius,
          padding: 0,
        }}
      >
        <img
          src={src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>
    )
  }
  return (
    <div style={frameStyle}>
      <PreviewImageIcon large={large} />
    </div>
  )
}

export function PreviewImageIcon({ large = false, stroke = '#64748b' }) {
  const size = large ? 28 : 10
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ opacity: 0.45 }} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={stroke} strokeWidth="1.5" />
      <path d="M7 15l3.5-3.5 2.5 2.5L17 10l4 5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
