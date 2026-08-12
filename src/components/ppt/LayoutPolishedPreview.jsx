import {
  buildPolishedGroups,
  getGridDims,
  groupPrimaryText,
  groupSlotPreview,
  isShapePreviewGroup,
  isTextPreviewGroup,
  previewVerticalAlign,
  regionToBox,
} from '../../utils/layoutPreviewUtils'
import { aspectRatioToCss } from '../../utils/deckPackTheme'
import { layoutSchemaHasCanvasElements, resolveLayoutCanvasElementsDoc } from '../../utils/videoTemplateToCanvasElements'
import CanvasElementsPreview from './CanvasElementsPreview'

const LAYOUT_POLISHED_THEME = {
  bg: 'var(--preview-bg, var(--bg-card, #ffffff))',
  card: 'var(--preview-card, color-mix(in srgb, var(--border-color) 50%, var(--bg-card)))',
  text: 'var(--preview-text, var(--text-main, #1f1f1f))',
  muted: 'var(--preview-muted, var(--text-muted, #6f6f6f))',
  icon: 'var(--preview-icon, color-mix(in srgb, var(--text-muted) 60%, transparent))',
  bar: 'var(--preview-bar, color-mix(in srgb, var(--text-main) 55%, transparent))',
  imageBg: 'var(--preview-image-bg, #e2e8f0)',
  accent: 'var(--preview-accent, #6366f1)',
  accentSoft: 'var(--preview-accent-soft, rgba(99, 102, 241, 0.1))',
  accentBorder: 'var(--preview-accent-border, rgba(99, 102, 241, 0.35))',
}

const PREVIEW_TITLE_FS = { large: '1.75rem', small: '0.92rem' }
const PREVIEW_SUBTITLE_FS = { large: '1rem', small: '0.48rem' }
const PREVIEW_BODY_FS = { large: '0.88rem', small: '0.4rem' }
const PREVIEW_CAPTION_FS = { large: '0.72rem', small: '0.34rem' }

function PolishedIconCircle({ size }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: LAYOUT_POLISHED_THEME.icon,
        opacity: 0.55,
        flexShrink: 0,
      }}
    />
  )
}

function PolishedImagePlaceholder({ large, fullBleed = false, src = '' }) {
  const iconSize = large ? 36 : 20
  if (src) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          background: LAYOUT_POLISHED_THEME.imageBg,
          borderRadius: fullBleed ? 0 : large ? 12 : 6,
          overflow: 'hidden',
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
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: LAYOUT_POLISHED_THEME.imageBg,
        borderRadius: fullBleed ? 0 : large ? 12 : 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        style={{ opacity: 0.45 }}
      >
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#64748b" strokeWidth="1.5" />
        <path
          d="M7 15l3.5-3.5 2.5 2.5L17 10l4 5"
          stroke="#64748b"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="9" r="1.5" fill="#64748b" />
      </svg>
    </div>
  )
}

function resolvePreviewImageSrc(previewHints = {}, slotId) {
  if (slotId && previewHints?.slots?.[slotId]?.imageUrl) return previewHints.slots[slotId].imageUrl
  if (previewHints?.imageUrl) return previewHints.imageUrl
  const slots = previewHints?.slots || {}
  for (const key of ['HERO_IMAGE', 'SIDE_IMAGE', 'POINT_IMAGE', 'BACKGROUND_IMAGE', 'COL_1_IMAGE', 'COL_2_IMAGE', 'IMAGE_1']) {
    if (slots[key]?.imageUrl) return slots[key].imageUrl
  }
  for (const slot of Object.values(slots)) {
    if (slot?.imageUrl) return slot.imageUrl
  }
  return ''
}

function PolishedBarChart({ large, values = [4, 8, 6, 7, 3] }) {
  const max = Math.max(...values, 1)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        gap: large ? 14 : 6,
        width: '100%',
        height: '100%',
        padding: large ? '4% 6% 2%' : '3% 5% 1%',
        boxSizing: 'border-box',
      }}
    >
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            maxWidth: large ? 48 : 18,
            height: `${Math.max(12, (v / max) * 100)}%`,
            background: LAYOUT_POLISHED_THEME.bar,
            borderRadius: large ? '6px 6px 2px 2px' : '3px 3px 1px 1px',
          }}
        />
      ))}
    </div>
  )
}

function PolishedLogoChip({ text, large }) {
  const label = String(text || 'logo').toLowerCase()
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: large ? 5 : 3,
        padding: large ? '4px 8px' : '2px 5px',
        background: LAYOUT_POLISHED_THEME.imageBg,
        borderRadius: large ? 6 : 4,
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          width: large ? 7 : 4,
          height: large ? 7 : 4,
          borderRadius: '50%',
          background: '#64748b',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: large ? '0.62rem' : '0.26rem',
          fontWeight: 400,
          textTransform: 'lowercase',
          color: '#334155',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function formatPreviewText(text, { bold, uppercase }) {
  const raw = String(text || '')
  const display = uppercase ? raw.toUpperCase() : raw
  return { display, fontWeight: bold ? 700 : 400 }
}

function PolishedStatRowPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const { display: headingText, fontWeight: headingWeight } = formatPreviewText(
    headingMeta.text || 'Section title',
    { bold: headingMeta.bold ?? true, uppercase: headingMeta.uppercase ?? false }
  )
  const stats = Array.isArray(previewHints.stats) && previewHints.stats.length
    ? previewHints.stats.slice(0, 3)
    : [
        { value: '98%', label: 'Customer satisfaction' },
        { value: '3.2x', label: 'Average ROI' },
        { value: '500+', label: 'Active teams' },
      ]

  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset' }
    : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...frameStyle,
        background: t.bg,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        borderRadius: large ? 12 : 6,
        boxSizing: 'border-box',
        padding: large ? '8% 7% 10%' : '10% 6% 12%',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 16 : 6,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: headingWeight,
          color: t.text,
          lineHeight: 1.15,
          textAlign: 'left',
        }}
      >
        {headingText}
      </div>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
          gap: large ? 20 : 6,
          alignItems: 'center',
          minHeight: 0,
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: large ? 8 : 3,
              textAlign: 'center',
              padding: large ? '0 8px' : '0 2px',
            }}
          >
            <div
              style={{
                fontSize: large ? '2.4rem' : '0.72rem',
                fontWeight: 800,
                color: t.accent,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {stat.value || '—'}
            </div>
            <div
              style={{
                fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_CAPTION_FS.small,
                color: t.muted,
                lineHeight: 1.25,
                maxWidth: '100%',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {stat.label || 'Metric label'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PolishedComparisonColumnsPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const subtitleMeta = previewHints.slots?.SUBTITLE || {}
  const { display: headingText, fontWeight: headingWeight } = formatPreviewText(
    headingMeta.text || 'Comparison',
    { bold: headingMeta.bold ?? true, uppercase: headingMeta.uppercase ?? false }
  )
  const { display: subtitleText } = formatPreviewText(
    subtitleMeta.text || 'Add a short supporting line',
    { bold: subtitleMeta.bold ?? false, uppercase: subtitleMeta.uppercase ?? false }
  )
  const columns = Array.isArray(previewHints.columns) && previewHints.columns.length
    ? previewHints.columns.slice(0, 3)
    : [
        { label: 'Starter', items: ['$29 / month', 'Up to 5 users', 'Core features'] },
        { label: 'Pro', items: ['$79 / month', 'Up to 25 users', 'Advanced features'] },
        { label: 'Enterprise', items: ['Custom pricing', 'Unlimited users', 'SSO & security'] },
      ]
  const highlightIndex = columns.length >= 3 ? 1 : 0

  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset' }
    : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...frameStyle,
        background: t.bg,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        borderRadius: large ? 12 : 6,
        boxSizing: 'border-box',
        padding: large ? '8% 7% 9%' : '10% 6% 11%',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 14 : 5,
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
        <div
          style={{
            fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
            fontWeight: headingWeight,
            color: t.text,
            lineHeight: 1.15,
          }}
        >
          {headingText}
        </div>
        {subtitleText && (
          <div
            style={{
              fontSize: large ? PREVIEW_SUBTITLE_FS.large : PREVIEW_SUBTITLE_FS.small,
              color: t.muted,
              lineHeight: 1.3,
            }}
          >
            {subtitleText}
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          gap: large ? 12 : 4,
          alignItems: 'stretch',
          minHeight: 0,
        }}
      >
        {columns.map((column, index) => {
          const highlighted = index === highlightIndex
          return (
            <div
              key={index}
              style={{
                boxSizing: 'border-box',
                borderRadius: large ? 10 : 4,
                border: `${large ? 1.5 : 0.8}px solid ${highlighted ? t.accentBorder : 'color-mix(in srgb, var(--border-color) 70%, transparent)'}`,
                background: highlighted ? t.accentSoft : t.card,
                padding: large ? '12px 10px' : '4px 3px',
                display: 'flex',
                flexDirection: 'column',
                gap: large ? 8 : 3,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: large ? '0.95rem' : '0.34rem',
                  fontWeight: 700,
                  color: highlighted ? t.accent : t.text,
                  lineHeight: 1.2,
                }}
              >
                {column.label || `Plan ${index + 1}`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
                {(column.items?.length ? column.items : ['Feature one', 'Feature two']).slice(0, 4).map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: large ? 6 : 2,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: large ? 5 : 2,
                        height: large ? 5 : 2,
                        borderRadius: '50%',
                        background: highlighted ? t.accent : t.muted,
                        opacity: highlighted ? 1 : 0.55,
                        marginTop: large ? 5 : 2,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: large ? PREVIEW_BODY_FS.large : '0.3rem',
                        color: t.text,
                        opacity: 0.82,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PolishedPricingPlansPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const eyebrowMeta = previewHints.slots?.EYEBROW || {}
  const { display: eyebrowText } = formatPreviewText(eyebrowMeta.text || 'Describe this slide', {
    bold: false,
    uppercase: eyebrowMeta.uppercase ?? true,
  })
  const columns = Array.isArray(previewHints.columns)?.length
    ? previewHints.columns.slice(0, 3)
    : [
        { label: 'Basic', price: '$99', items: ['The first point', 'The second point', 'The third point'] },
        { label: 'Standard', price: '$299', items: ['The first point', 'The second point', 'The third point', 'The fourth point'] },
        { label: 'Pro', price: '$999', items: ['The first point', 'The second point', 'The third point', 'The fourth point', 'The final point'] },
      ]
  const columnHighlightIndex = columns.findIndex((col) => col.highlighted)
  const highlightIndex =
    typeof previewHints.highlightedColumnIndex === 'number'
      ? previewHints.highlightedColumnIndex
      : columnHighlightIndex >= 0
        ? columnHighlightIndex
        : columns.length >= 3
          ? 1
          : 0
  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset' }
    : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
      borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '7% 6% 8%' : '10% 5% 11%',
      display: 'flex', flexDirection: 'column', gap: large ? 12 : 4, ...style,
    }}>
      <div style={{ textAlign: 'center', fontSize: large ? '0.62rem' : '0.28rem', fontWeight: 700, letterSpacing: '0.14em', color: t.muted, textTransform: 'uppercase' }}>
        {eyebrowText}
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, gap: large ? 14 : 4, alignItems: 'stretch' }}>
        {columns.map((col, i) => {
          const highlighted = i === highlightIndex
          return (
          <div key={i} style={{
            border: `${large ? 2 : 1}px solid ${highlighted ? t.accentBorder : `color-mix(in srgb, ${t.text} 12%, transparent)`}`,
            background: highlighted ? t.accentSoft : 'transparent',
            borderRadius: large ? 12 : 4, padding: large ? '14px 12px' : '4px 3px',
            display: 'flex', flexDirection: 'column', gap: large ? 10 : 3, minWidth: 0,
          }}>
            <div style={{
              alignSelf: 'flex-start', padding: large ? '5px 12px' : '2px 5px', borderRadius: 99,
              background: t.accentSoft, fontSize: large ? '0.82rem' : '0.3rem', fontWeight: 700,
              color: highlighted ? t.accent : t.text,
            }}>
              {col.label}
            </div>
            {col.price && (
              <div style={{ fontSize: large ? '1.85rem' : '0.62rem', fontWeight: 800, color: t.text, lineHeight: 1 }}>
                {col.price}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 5 : 2 }}>
              {(col.items || []).slice(0, 5).map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: large ? 6 : 2, alignItems: 'flex-start' }}>
                  <span style={{ color: t.muted, fontSize: large ? '0.75rem' : '0.28rem', lineHeight: 1.4 }}>•</span>
                  <span style={{ fontSize: large ? '0.72rem' : '0.28rem', color: t.muted, lineHeight: 1.35 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

function PolishedTeamStaggeredPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const { display: headingText } = formatPreviewText(headingMeta.text || 'Meet the team', { bold: true, uppercase: false })
  const members = Array.isArray(previewHints.members)?.length
    ? previewHints.members.slice(0, 5)
    : [
        { name: 'Johanna Doe', role: 'Co-founder & CEO', email: 'johanna@example.com' },
        { name: 'Jane Doe', role: 'Co-founder & CTO', email: 'jane@example.com' },
        { name: 'Joe Doe', role: 'Co-founder & COO', email: 'joe@example.com' },
        { name: 'Jenny Doe', role: 'President', email: 'jenny@example.com' },
        { name: 'John Doe', role: 'Head of Design', email: 'john@example.com' },
      ]
  const row1 = members.slice(0, 3)
  const row2 = members.slice(3, 5)
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  function MemberCard({ member }) {
    const avatarSrc = member.imageUrl || resolvePreviewImageSrc(previewHints)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 5 : 2, flex: 1, minWidth: 0, textAlign: 'center' }}>
        <div style={{
          width: large ? 44 : 14, height: large ? 44 : 14, borderRadius: '50%',
          background: t.imageBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {avatarSrc
            ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <PolishedIconCircle size={large ? 18 : 6} />}
        </div>
        <div style={{ fontSize: large ? '0.58rem' : '0.22rem', fontWeight: 800, letterSpacing: '0.06em', color: t.text, textTransform: 'uppercase' }}>
          {member.name}
        </div>
        <div style={{ fontSize: large ? '0.52rem' : '0.2rem', fontWeight: 700, color: t.text, opacity: 0.85 }}>{member.role}</div>
        {large && member.email && <div style={{ fontSize: '0.48rem', color: t.muted }}>{member.email}</div>}
      </div>
    )
  }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '8% 7%' : '10% 6%', display: 'flex', flexDirection: 'column', gap: large ? 16 : 5, ...style,
    }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 700, color: t.text }}>
        {headingText}
      </div>
      <div style={{ display: 'flex', gap: large ? 16 : 4 }}>{row1.map((m, i) => <MemberCard key={i} member={m} />)}</div>
      {row2.length > 0 && (
        <div style={{ display: 'flex', gap: large ? 16 : 4, padding: `0 ${large ? '12%' : '10%'}` }}>
          {row2.map((m, i) => <MemberCard key={i} member={m} />)}
        </div>
      )}
    </div>
  )
}

function PolishedQuoteAttributionPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const quote = previewHints.quoteText || 'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.'
  const author = previewHints.authorName || 'Gemine Macberry'
  const authorTitle = previewHints.authorTitle || 'VP of Engineering at Acme Inc.'
  const avatarSrc = resolvePreviewImageSrc(previewHints)
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '8% 9%' : '10% 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: large ? 18 : 6, ...style,
    }}>
      <div style={{ fontSize: large ? '2.5rem' : '0.8rem', color: t.muted, lineHeight: 0.8, fontWeight: 700 }}>"</div>
      <div style={{ fontSize: large ? '1.05rem' : '0.36rem', color: t.text, lineHeight: 1.45, fontWeight: 500, maxWidth: '92%' }}>{quote}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: large ? 10 : 4, marginTop: large ? 8 : 2 }}>
        <div style={{
          width: large ? 36 : 12, height: large ? 36 : 12, borderRadius: '50%', background: t.imageBg, flexShrink: 0, overflow: 'hidden',
        }}>
          {avatarSrc
            ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : null}
        </div>
        <div>
          <div style={{ fontSize: large ? '0.82rem' : '0.3rem', fontWeight: 700, color: t.text }}>{author}</div>
          <div style={{ fontSize: large ? '0.68rem' : '0.26rem', color: t.muted }}>{authorTitle}</div>
        </div>
      </div>
    </div>
  )
}

function PolishedLineChartMini({ large, values = [300, 800, 2500, 5000], labels = ['Q1', 'Q2', 'Q3', 'Q4'] }) {
  const t = LAYOUT_POLISHED_THEME
  const max = Math.max(...values, 1)
  const w = 100
  const h = 60
  const pts = values.map((v, i) => {
    const x = 8 + (i / Math.max(values.length - 1, 1)) * 84
    const y = h - 8 - (v / max) * (h - 16)
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
      <svg viewBox={`0 0 ${w} ${h + 12}`} style={{ width: '100%', flex: 1, minHeight: 0 }}>
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line key={i} x1="8" x2="92" y1={h - 8 - p * (h - 16)} y2={h - 8 - p * (h - 16)} stroke={t.muted} strokeWidth="0.4" strokeDasharray="2 2" opacity="0.35" />
        ))}
        <polyline fill="none" stroke={t.accent} strokeWidth={large ? 2.2 : 1.2} points={pts} />
        {values.map((v, i) => {
          const x = 8 + (i / Math.max(values.length - 1, 1)) * 84
          const y = h - 8 - (v / max) * (h - 16)
          return <circle key={i} cx={x} cy={y} r={large ? 2.2 : 1.4} fill={t.accent} />
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${large ? 4 : 1}%` }}>
        {labels.map((l) => (
          <span key={l} style={{ fontSize: large ? '0.58rem' : '0.22rem', color: t.muted }}>{l}</span>
        ))}
      </div>
    </div>
  )
}

function PolishedShapeAccentBar({ large, horizontal = false }) {
  const t = LAYOUT_POLISHED_THEME
  return (
    <div
      style={{
        width: horizontal ? '100%' : large ? 4 : 2,
        height: horizontal ? (large ? 3 : 1) : '70%',
        borderRadius: 99,
        background: t.accent,
        opacity: 0.85,
      }}
    />
  )
}

function PolishedShapeRing({ large }) {
  const t = LAYOUT_POLISHED_THEME
  const size = large ? 52 : 18
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${large ? 3 : 1.5}px solid ${t.accentBorder}`,
        background: t.accentSoft,
        boxSizing: 'border-box',
      }}
    />
  )
}

function PolishedShapeArrow({ large }) {
  const t = LAYOUT_POLISHED_THEME
  return (
    <svg width={large ? 28 : 10} height={large ? 16 : 6} viewBox="0 0 28 16" aria-hidden>
      <path d="M2 8h20m0 0-6-5m6 5-6 5" fill="none" stroke={t.accent} strokeWidth={large ? 2 : 1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PolishedGridInsightsChartPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.CHART_HEADING || previewHints.slots?.HEADING || {}
  const heading = headingMeta.text || 'Revenue growth'
  const insights = previewHints.insights || [{ label: 'Insight one' }, { label: 'Insight two' }, { label: 'Insight three' }]
  const sideHeading = previewHints.sideHeading || 'Key takeaway'
  const sideBody = previewHints.sideBody || 'Summarize what the chart means.'
  const values = previewHints.chartValues || [120, 240, 180, 320, 410]
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '6% 5%' : '8% 5%', display: 'grid',
      gridTemplateColumns: '1fr 0.34fr', gridTemplateRows: 'auto 1fr', gap: large ? 12 : 4, ...style,
    }}>
      <div style={{ gridColumn: '1 / 2', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 10 : 3 }}>
        {insights.slice(0, 3).map((item, i) => (
          <div key={i} style={{ background: t.card, borderRadius: large ? 8 : 4, padding: large ? '8px 10px' : '3px 4px', display: 'flex', flexDirection: 'column', gap: large ? 6 : 2, alignItems: 'center' }}>
            <PolishedShapeRing large={large} />
            <div style={{ fontSize: large ? '0.62rem' : '0.24rem', fontWeight: 700, color: t.text, textAlign: 'center' }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ gridColumn: '2 / 3', gridRow: '1 / 3', background: t.card, borderRadius: large ? 10 : 4, padding: large ? '10px 8px' : '4px 3px', display: 'flex', flexDirection: 'column', gap: large ? 8 : 3, minHeight: 0 }}>
        <div style={{ fontSize: large ? '0.72rem' : '0.28rem', fontWeight: 700, color: t.text }}>{sideHeading}</div>
        <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: t.muted, lineHeight: 1.35 }}>{sideBody}</div>
        <div style={{ flex: 1, minHeight: large ? 80 : 28, borderRadius: large ? 8 : 3, overflow: 'hidden' }}>
          <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints, 'POINT_IMAGE')} />
        </div>
      </div>
      <div style={{ gridColumn: '1 / 2', background: t.card, borderRadius: large ? 10 : 4, padding: large ? '10px 12px' : '4px 5px', display: 'flex', flexDirection: 'column', gap: large ? 8 : 3, minHeight: 0 }}>
        <div style={{ fontSize: large ? '0.95rem' : '0.34rem', fontWeight: 800, color: t.text }}>{heading}</div>
        <div style={{ flex: 1, minHeight: large ? 100 : 36 }}>
          <PolishedBarChart large={large} values={values} />
        </div>
        {previewHints.chartCaption && (
          <div style={{ fontSize: large ? '0.58rem' : '0.22rem', color: t.muted, textAlign: 'center' }}>{previewHints.chartCaption}</div>
        )}
      </div>
    </div>
  )
}

function PolishedChartFullWidthPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const heading = headingMeta.text || 'Quarterly performance overview'
  const body = previewHints.bodyText || 'Use this slide when the data is the hero of the story.'
  const values = previewHints.chartValues || [45, 62, 78, 91]
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '7% 6%' : '9% 5%', display: 'flex', gap: large ? 12 : 4, ...style,
    }}>
      <PolishedShapeAccentBar large={large} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: large ? 10 : 4, minWidth: 0 }}>
        <div style={{ fontSize: large ? '1.15rem' : '0.4rem', fontWeight: 800, color: t.text }}>{heading}</div>
        <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: t.muted, lineHeight: 1.4 }}>{body}</div>
        <div style={{ flex: 1, minHeight: large ? 120 : 40, background: t.card, borderRadius: large ? 10 : 4, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0 }}><PolishedBarChart large={large} values={values} /></div>
          {previewHints.chartCaption && (
            <div style={{ fontSize: large ? '0.58rem' : '0.22rem', color: t.muted, textAlign: 'center', paddingBottom: large ? 6 : 2 }}>{previewHints.chartCaption}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function PolishedChartImageSplitPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const heading = headingMeta.text || 'Growth at a glance'
  const body = previewHints.bodyText || 'Pair your chart with a supporting image.'
  const values = previewHints.chartValues || [300, 800, 2500, 5000]
  const labels = previewHints.chartLabels || ['Q1', 'Q2', 'Q3', 'Q4']
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '8% 7%' : '10% 6%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 16 : 5, ...style,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 10 : 3, minWidth: 0 }}>
        <div style={{ fontSize: large ? '1.05rem' : '0.38rem', fontWeight: 800, color: t.text, lineHeight: 1.2 }}>{heading}</div>
        <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: t.muted, lineHeight: 1.4 }}>{body}</div>
        <div style={{ flex: 1, minHeight: large ? 90 : 32 }}>
          <PolishedLineChartMini large={large} values={values} labels={labels} />
        </div>
        {previewHints.chartCaption && (
          <div style={{ fontSize: large ? '0.58rem' : '0.22rem', color: t.muted }}>{previewHints.chartCaption}</div>
        )}
      </div>
      <div style={{ position: 'relative', minHeight: 0, borderRadius: large ? 10 : 4, overflow: 'hidden' }}>
        <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
        <div style={{ position: 'absolute', top: large ? 10 : 4, right: large ? 10 : 4 }}>
          <div style={{ width: large ? 18 : 8, height: large ? 18 : 8, borderRadius: '50%', background: t.accent, opacity: 0.9 }} />
        </div>
      </div>
    </div>
  )
}

function PolishedImageGalleryThreePreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const subtitleMeta = previewHints.slots?.SUBTITLE || {}
  const heading = headingMeta.text || 'Product highlights'
  const subtitle = subtitleMeta.text || 'Show three visuals with short labels.'
  const gallery = previewHints.gallery || [{ label: 'Feature A' }, { label: 'Feature B' }, { label: 'Feature C' }]
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '7% 6%' : '10% 5%', display: 'flex', flexDirection: 'column', gap: large ? 12 : 4, ...style,
    }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: t.text }}>{heading}</div>
      <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.28rem', color: t.muted }}>{subtitle}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 14 : 4, minHeight: 0 }}>
        {gallery.slice(0, 3).map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3, minWidth: 0 }}>
            <div style={{ flex: 1, minHeight: large ? 90 : 28, borderRadius: large ? 8 : 3, overflow: 'hidden', background: t.card }}>
              <PolishedImagePlaceholder large={large} src={item.imageUrl || resolvePreviewImageSrc(previewHints)} />
            </div>
            <div style={{ fontSize: large ? '0.68rem' : '0.26rem', fontWeight: 700, color: t.text, textAlign: 'center' }}>{item.label}</div>
          </div>
        ))}
      </div>
      <PolishedShapeAccentBar large={large} horizontal />
    </div>
  )
}

function PolishedProcessFlowPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const heading = headingMeta.text || 'How it works'
  const steps = previewHints.steps || [
    { title: 'Discover', body: 'Identify the problem.' },
    { title: 'Build', body: 'Design the solution.' },
    { title: 'Launch', body: 'Ship and iterate.' },
  ]
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '8% 7%' : '10% 6%', display: 'flex', flexDirection: 'column', gap: large ? 14 : 5, ...style,
    }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: t.text }}>{heading}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: large ? 10 : 3, alignItems: 'start' }}>
        {steps.slice(0, 3).flatMap((step, i) => {
          const nodes = [
            <div key={step.title} style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3, alignItems: 'center', textAlign: 'center' }}>
              <PolishedShapeRing large={large} />
              <div style={{ fontSize: large ? '0.78rem' : '0.3rem', fontWeight: 700, color: t.text }}>{step.title}</div>
              <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: t.muted, lineHeight: 1.35 }}>{step.body}</div>
            </div>,
          ]
          if (i < 2) {
            nodes.push(
              <div key={`arrow-${i}`} style={{ display: 'flex', alignItems: 'center', paddingTop: large ? 18 : 6 }}>
                <PolishedShapeArrow large={large} />
              </div>
            )
          }
          return nodes
        })}
      </div>
      <PolishedShapeAccentBar large={large} horizontal />
    </div>
  )
}

function PolishedStatCardsImagePreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const heading = headingMeta.text || 'Results that matter'
  const stats = previewHints.stats || [
    { value: '98%', label: 'Retention' },
    { value: '3.2x', label: 'ROI' },
    { value: '500+', label: 'Customers' },
  ]
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '7% 6%' : '10% 5%', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: large ? 16 : 5, ...style,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 12 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: t.text }}>{heading}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 10 : 3 }}>
          {stats.slice(0, 3).map((stat, i) => (
            <div key={i} style={{ background: t.card, borderRadius: large ? 8 : 4, padding: large ? '10px 8px' : '4px 3px', display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
              <PolishedShapeRing large={large} />
              <div style={{ fontSize: large ? '1.2rem' : '0.42rem', fontWeight: 800, color: t.accent }}>{stat.value}</div>
              <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: t.muted }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', minHeight: 0, borderRadius: large ? 10 : 4, overflow: 'hidden' }}>
        <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
        <div style={{ position: 'absolute', left: large ? 12 : 4, bottom: large ? 12 : 4, width: large ? 36 : 14, height: large ? 36 : 14, borderRadius: '50%', background: t.accentSoft, border: `1px solid ${t.accentBorder}` }} />
      </div>
    </div>
  )
}

function PolishedChartSplitPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const { display: headingText } = formatPreviewText(
    headingMeta.text || 'A chart is easier to understand with a meaningful title',
    { bold: true, uppercase: false }
  )
  const body = previewHints.bodyText || 'Sometimes a chart needs more explanation. Add some text here to give your data additional context.'
  const values = previewHints.chartValues || [300, 800, 2500, 5000]
  const labels = previewHints.chartLabels || ['Q1', 'Q2', 'Q3', 'Q4']
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '8% 7%' : '10% 6%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 20 : 6, alignItems: 'center', ...style,
    }}>
      <div>
        <div style={{ fontSize: large ? '1.15rem' : '0.38rem', fontWeight: 800, color: t.text, lineHeight: 1.2, marginBottom: large ? 10 : 3 }}>{headingText}</div>
        <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: t.muted, lineHeight: 1.4 }}>{body}</div>
      </div>
      <div style={{ minHeight: 0, height: '100%' }}>
        <PolishedLineChartMini large={large} values={values} labels={labels} />
        <div style={{ textAlign: 'center', fontSize: large ? '0.58rem' : '0.22rem', color: t.muted, marginTop: large ? 4 : 1 }}>
          {previewHints.chartCaption || 'This chart has a subtitle'}
        </div>
      </div>
    </div>
  )
}

function PolishedTwoImageColumnsPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const eyebrowMeta = previewHints.slots?.EYEBROW || {}
  const { display: eyebrowText } = formatPreviewText(eyebrowMeta.text || 'Describe this slide', { bold: false, uppercase: false })
  const columns = Array.isArray(previewHints.columns) && previewHints.columns.length
    ? previewHints.columns.slice(0, 2)
    : [
        { title: 'Make your point', body: 'Expand on it here. Why is it important? Why does it matter?' },
        { title: 'Make another point', body: "You already know that it's important. But what about your listeners?" },
      ]
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '7% 6%' : '10% 5%', display: 'flex', flexDirection: 'column', gap: large ? 12 : 4, ...style,
    }}>
      <div style={{ fontSize: large ? PREVIEW_SUBTITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 700, color: t.text }}>{eyebrowText}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 16 : 5, minHeight: 0 }}>
        {columns.map((col, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3, minWidth: 0 }}>
            <div style={{ flex: large ? '0 0 42%' : '0 0 38%', minHeight: large ? 80 : 24, borderRadius: large ? 8 : 3, overflow: 'hidden' }}>
              <PolishedImagePlaceholder large={large} src={col.imageUrl || resolvePreviewImageSrc(previewHints)} />
            </div>
            <div style={{ fontSize: large ? '0.72rem' : '0.3rem', fontWeight: 800, letterSpacing: '0.08em', color: t.text, textTransform: 'uppercase' }}>{col.title}</div>
            <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.28rem', color: t.muted, lineHeight: 1.35 }}>{col.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PolishedEightShortTextsPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const { display: headingText } = formatPreviewText(
    headingMeta.text || 'Describe this slide',
    { bold: headingMeta.bold ?? true, uppercase: headingMeta.uppercase ?? false }
  )
  const points = Array.isArray(previewHints.points) && previewHints.points.length
    ? previewHints.points.slice(0, 8)
    : Array.from({ length: 8 }, (_, i) => ({
        label: i === 0 ? 'First point' : i === 7 ? 'Last point' : `Point ${i + 1}`,
        desc: 'A short description',
      }))
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...frameStyle,
        background: t.bg,
        overflow: 'hidden',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: large ? 12 : 6,
        boxSizing: 'border-box',
        padding: large ? '7% 6%' : '10% 5%',
        display: 'grid',
        gridTemplateColumns: '1.05fr 0.95fr',
        gap: large ? 16 : 5,
        alignItems: 'stretch',
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 12 : 4, minWidth: 0, minHeight: 0 }}>
        <div
          style={{
            fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small,
            fontWeight: 800,
            color: t.text,
            lineHeight: 1.15,
            textTransform: headingMeta.uppercase ? 'uppercase' : 'none',
          }}
        >
          {headingText}
        </div>
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: large ? '10px 14px' : '3px 5px',
            alignContent: 'start',
            minHeight: 0,
          }}
        >
          {points.map((point, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: large ? 8 : 3,
                minWidth: 0,
              }}
            >
              <PolishedIconCircle size={large ? 22 : 10} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: large ? '0.72rem' : '0.28rem',
                    fontWeight: 700,
                    color: t.text,
                    lineHeight: 1.2,
                    marginBottom: large ? 2 : 1,
                  }}
                >
                  {point.label}
                </div>
                <div
                  style={{
                    fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem',
                    color: t.muted,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {point.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ minHeight: 0, borderRadius: large ? 10 : 4, overflow: 'hidden' }}>
        <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
      </div>
    </div>
  )
}

function PolishedClosingCtaPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const headingMeta = previewHints.slots?.HEADING || {}
  const subtitleMeta = previewHints.slots?.SUBTITLE || {}
  const ctaMeta = previewHints.slots?.CTA || {}
  const contactMeta = previewHints.slots?.CONTACT || {}
  const { display: headingText } = formatPreviewText(headingMeta.text || 'Thank you', { bold: true, uppercase: false })
  const { display: subtitleText } = formatPreviewText(subtitleMeta.text || '', { bold: false, uppercase: false })
  const { display: ctaText } = formatPreviewText(ctaMeta.text || 'Book a demo', { bold: true, uppercase: false })
  const { display: contactText } = formatPreviewText(contactMeta.text || 'hello@company.com', { bold: false, uppercase: false })
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '10% 8%' : '12% 7%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: large ? 12 : 4, textAlign: 'center', ...style,
    }}>
      <div style={{ fontSize: large ? '2rem' : '0.72rem', fontWeight: 800, color: t.text, lineHeight: 1.1 }}>{headingText}</div>
      {subtitleText && (
        <div style={{ fontSize: large ? PREVIEW_SUBTITLE_FS.large : PREVIEW_SUBTITLE_FS.small, color: t.muted, lineHeight: 1.35, maxWidth: '85%' }}>
          {subtitleText}
        </div>
      )}
      <div style={{ width: large ? 48 : 16, height: large ? 3 : 1, background: t.accent, borderRadius: 99, opacity: 0.85 }} />
      {ctaText && (
        <div style={{ fontSize: large ? '1rem' : '0.34rem', fontWeight: 700, color: t.accent }}>{ctaText}</div>
      )}
      {contactText && (
        <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: t.muted }}>{contactText}</div>
      )}
    </div>
  )
}

function renderDecorationContent(group, large) {
  const id = String(group.slots[0]?.slot?.id || '').toLowerCase()
  const center = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  if (/arrow/.test(id)) {
    return <div style={center}><PolishedShapeArrow large={large} /></div>
  }
  if (/circle|ring|shape|icon/.test(id)) {
    return <div style={center}><PolishedShapeRing large={large} /></div>
  }
  if (/accent_bar/.test(id) && !/bottom|dot/.test(id)) {
    return <div style={{ ...center, justifyContent: 'flex-start', paddingLeft: large ? '12%' : '8%' }}><PolishedShapeAccentBar large={large} /></div>
  }
  if (/bottom_line|dot_accent|line/.test(id)) {
    return <div style={{ ...center, alignItems: 'flex-end', paddingBottom: large ? '18%' : '10%' }}><PolishedShapeAccentBar large={large} horizontal /></div>
  }
  if (/badge/.test(id)) {
    return <div style={{ ...center, alignItems: 'flex-start', justifyContent: 'flex-end', padding: large ? '12%' : '8%' }}>
      <div style={{ width: large ? 16 : 7, height: large ? 16 : 7, borderRadius: '50%', background: LAYOUT_POLISHED_THEME.accent, opacity: 0.9 }} />
    </div>
  }
  return <div style={center}><PolishedIconCircle size={large ? 28 : 12} /></div>
}

function renderSlotPreviewContent(group, large, previewHints) {
  const meta = groupSlotPreview(group, previewHints)
  const pad = large ? '5% 7%' : '3% 5%'
  const t = LAYOUT_POLISHED_THEME
  const vAlign = previewVerticalAlign(group)

  if (group.kinds.has('decoration') && group.kinds.size === 1) {
    return renderDecorationContent(group, large)
  }

  if (group.kinds.has('bg') && group.kinds.size === 1) {
    const src = meta.imageUrl || resolvePreviewImageSrc(previewHints)
    if (!src) return null
    return <PolishedImagePlaceholder large={large} fullBleed src={src} />
  }

  if (meta.variant === 'logo') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: pad,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <PolishedLogoChip text={meta.text} large={large} />
      </div>
    )
  }

  if (meta.variant === 'image' || (group.kinds.has('image') && group.kinds.size === 1)) {
    return <PolishedImagePlaceholder large={large} src={meta.imageUrl || previewHints?.imageUrl || ''} />
  }

  if (meta.variant === 'title' || group.kinds.has('heading') || group.kinds.has('quote')) {
    const { display, fontWeight } = formatPreviewText(
      meta.text || groupPrimaryText(group, ['heading'], 'Your tagline or title'),
      { bold: meta.bold, uppercase: meta.uppercase }
    )
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: pad,
          display: 'flex',
          alignItems: vAlign,
          justifyContent: 'flex-start',
        }}
      >
        <div
          style={{
            fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
            fontWeight,
            color: t.text,
            lineHeight: 1.12,
            textTransform: meta.uppercase ? 'uppercase' : 'none',
            display: '-webkit-box',
            WebkitLineClamp: large ? 4 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {display}
        </div>
      </div>
    )
  }

  if (meta.variant === 'subheading' || group.kinds.has('subheading')) {
    const { display, fontWeight } = formatPreviewText(
      meta.text || groupPrimaryText(group, ['subheading', 'body'], 'Supporting line or tagline'),
      { bold: meta.bold ?? false, uppercase: meta.uppercase ?? false }
    )
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: pad,
          display: 'flex',
          alignItems: vAlign,
          justifyContent: 'flex-start',
        }}
      >
        <div
          style={{
            fontSize: large ? PREVIEW_SUBTITLE_FS.large : PREVIEW_SUBTITLE_FS.small,
            fontWeight,
            color: t.muted,
            lineHeight: 1.3,
            textTransform: meta.uppercase ? 'uppercase' : 'none',
            display: '-webkit-box',
            WebkitLineClamp: large ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {display}
        </div>
      </div>
    )
  }

  if (meta.variant === 'body' || group.kinds.has('body')) {
    const { display, fontWeight } = formatPreviewText(
      meta.text || groupPrimaryText(group, ['body'], 'Explain what this section is about'),
      { bold: meta.bold ?? false, uppercase: meta.uppercase ?? false }
    )
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: pad,
          display: 'flex',
          alignItems: vAlign,
          justifyContent: 'flex-start',
        }}
      >
        <div
          style={{
            fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small,
            fontWeight,
            color: t.muted,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: large ? 4 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {display}
        </div>
      </div>
    )
  }

  if (meta.variant === 'caption' || group.kinds.has('caption') || group.kinds.has('eyebrow')) {
    const { display, fontWeight } = formatPreviewText(
      meta.text || groupPrimaryText(group, ['caption', 'eyebrow', 'body'], 'A small footnote or subheadline'),
      { bold: meta.bold ?? false, uppercase: meta.uppercase ?? false }
    )
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: pad,
          display: 'flex',
          alignItems: vAlign,
          justifyContent: 'flex-start',
        }}
      >
        <div
          style={{
            fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small,
            fontWeight,
            color: t.muted,
            lineHeight: 1.35,
            textTransform: meta.uppercase ? 'uppercase' : 'none',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {display}
        </div>
      </div>
    )
  }

  return null
}

function renderPolishedGroupContent(group, large, previewHints = {}) {
  const t = LAYOUT_POLISHED_THEME
  const pad = large ? '10% 8%' : '8% 7%'
  const titleFs = large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small
  const bodyFs = large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small
  const labelFs = large ? '0.72rem' : '0.32rem'

  const slotDriven = renderSlotPreviewContent(group, large, previewHints)
  if (slotDriven) return slotDriven

  const isImageOnly =
    group.kinds.has('image') &&
    !group.kinds.has('heading') &&
    !group.kinds.has('body') &&
    !group.kinds.has('chart')

  if (isImageOnly) {
    return <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
  }

  if (group.isInsight) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: large ? 14 : 6,
        }}
      >
        <PolishedIconCircle size={large ? 36 : 14} />
        <div
          style={{
            fontSize: bodyFs,
            color: t.text,
            textAlign: 'center',
            lineHeight: 1.35,
            fontWeight: 500,
            maxWidth: '90%',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {groupPrimaryText(group, ['label', 'body'], 'Add a key insight here.')}
        </div>
      </div>
    )
  }

  if (group.isChart) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: large ? '6% 5% 4%' : '5% 4% 3%',
          display: 'flex',
          flexDirection: 'column',
          gap: large ? 6 : 2,
        }}
      >
        <div style={{ fontSize: titleFs, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>
          {groupPrimaryText(group, ['heading'], previewHints.chartTitle || 'Describe this chart')}
        </div>
        <div
          style={{
            fontSize: bodyFs,
            color: t.muted,
            lineHeight: 1.3,
            marginBottom: large ? 4 : 1,
          }}
        >
          {groupPrimaryText(group, ['body'], 'Explain what this section is about')}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <PolishedBarChart large={large} />
        </div>
      </div>
    )
  }

  if (group.isPoint) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: titleFs,
            fontWeight: 700,
            color: t.text,
            lineHeight: 1.2,
            marginBottom: large ? 8 : 3,
          }}
        >
          {groupPrimaryText(group, ['heading'], 'Describe this point')}
        </div>
        <div
          style={{
            fontSize: bodyFs,
            color: t.muted,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {groupPrimaryText(group, ['body'], 'Explain what this section is about')}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
          }}
        >
          {group.kinds.has('image') ? (
            <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
          ) : (
            <PolishedIconCircle size={large ? 72 : 28} />
          )}
        </div>
      </div>
    )
  }

  const hasChart = group.kinds.has('chart')
  const hasImage = group.kinds.has('image')
  const hasIcon = group.kinds.has('icon')
  const hasHeading = group.kinds.has('heading') || group.kinds.has('label') || group.kinds.has('stat')
  const hasBody = group.kinds.has('body') || group.kinds.has('generic') || group.kinds.has('caption')

  const headingText = groupPrimaryText(
    group,
    ['heading', 'stat', 'label'],
    group.kinds.has('stat') ? '42%' : previewHints.subheadline || previewHints.title || 'Section title'
  )
  const bodyText = groupPrimaryText(
    group,
    ['body', 'generic', 'caption'],
    previewHints.body || 'Explain what this section is about'
  )

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: pad,
        display: 'flex',
        flexDirection: 'column',
        alignItems: hasImage && !hasHeading ? 'stretch' : 'flex-start',
        justifyContent: hasChart || hasImage ? 'flex-start' : 'center',
        gap: large ? 8 : 3,
      }}
    >
      {hasImage && !hasHeading && !hasBody && !hasChart && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
        </div>
      )}
      {hasHeading && (
        <div
          style={{
            fontSize: group.kinds.has('stat') ? (large ? '1.55rem' : '0.62rem') : titleFs,
            fontWeight: 700,
            color: t.text,
            lineHeight: 1.2,
          }}
        >
          {headingText}
        </div>
      )}
      {hasBody && (
        <div
          style={{
            fontSize: bodyFs,
            color: group.slots.some((s) => s.kind === 'body' && s.slot?.placeholder_text?.startsWith('“'))
              ? t.text
              : t.muted,
            lineHeight: 1.35,
            fontWeight: group.slots.some((s) => s.kind === 'body' && s.slot?.placeholder_text?.startsWith('“'))
              ? 600
              : 400,
            display: '-webkit-box',
            WebkitLineClamp: large ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {bodyText}
        </div>
      )}
      {hasChart && (
        <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
          <PolishedBarChart large={large} />
        </div>
      )}
      {hasImage && (hasHeading || hasBody) && (
        <div style={{ flex: 1, width: '100%', minHeight: 0, marginTop: large ? 4 : 1 }}>
          <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
        </div>
      )}
      {hasIcon && !hasChart && !hasImage && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <PolishedIconCircle size={large ? 48 : 18} />
        </div>
      )}
      {!hasHeading && !hasBody && !hasChart && !hasIcon && !hasImage && (
        <div style={{ fontSize: labelFs, color: t.muted }}>Content</div>
      )}
    </div>
  )
}

/**
 * Gamma-style layout thumbnail built from deck-layout slot schema.
 */
export default function LayoutPolishedPreview({
  slots = [],
  schema,
  large = false,
  fill = false,
  className,
  style,
  aspectRatio = '16:9',
}) {
  const resolvedSlots = slots.length ? slots : schema?.slots ?? []
  const hasSlots = resolvedSlots.length > 0
  const previewHints = schema?.preview ?? {}
  const previewMode = previewHints.mode
  const cssAspect = aspectRatioToCss(aspectRatio)

  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset', minHeight: 0 }
    : { width: '100%', aspectRatio: cssAspect }

  if (previewMode === 'canvas_elements' || layoutSchemaHasCanvasElements(schema)) {
    const elementsDoc = resolveLayoutCanvasElementsDoc(schema) || {}
    return (
      <CanvasElementsPreview
        slide={{
          elements: elementsDoc,
          backgroundColor: schema?.preview?.backgroundColor || elementsDoc.backgroundColor,
        }}
        aspectRatio={aspectRatio}
        fill={fill}
        className={className}
        style={{ ...frameStyle, ...style }}
      />
    )
  }

  if (previewMode === 'stat_row') {
    return (
      <PolishedStatRowPreview
        previewHints={previewHints}
        large={large}
        fill={fill}
        className={className}
        style={style}
        aspectRatio={aspectRatio}
      />
    )
  }

  if (previewMode === 'comparison_columns') {
    return (
      <PolishedComparisonColumnsPreview
        previewHints={previewHints}
        large={large}
        fill={fill}
        className={className}
        style={style}
        aspectRatio={aspectRatio}
      />
    )
  }

  if (previewMode === 'pricing_plans') {
    return <PolishedPricingPlansPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'team_staggered') {
    return <PolishedTeamStaggeredPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'quote_attribution') {
    return <PolishedQuoteAttributionPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'chart_split') {
    return <PolishedChartSplitPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'grid_insights_chart') {
    return <PolishedGridInsightsChartPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'chart_full_width') {
    return <PolishedChartFullWidthPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'chart_image_split') {
    return <PolishedChartImageSplitPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'image_gallery_three') {
    return <PolishedImageGalleryThreePreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'process_flow') {
    return <PolishedProcessFlowPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'stat_cards_image') {
    return <PolishedStatCardsImagePreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'two_image_columns') {
    return <PolishedTwoImageColumnsPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'eight_short_texts') {
    return <PolishedEightShortTextsPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'closing_cta') {
    return <PolishedClosingCtaPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }

  const { COLS, ROWS } = getGridDims(resolvedSlots)
  const groups = hasSlots ? buildPolishedGroups(resolvedSlots) : []
  const inset = large ? 0.9 : 0.7

  const frameStyleGrid = frameStyle

  if (!hasSlots) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          ...frameStyleGrid,
          background: `repeating-linear-gradient(
            -45deg,
            #f8fafc,
            #f8fafc 6px,
            #f1f5f9 6px,
            #f1f5f9 12px
          )`,
          borderRadius: large ? 12 : 6,
          ...style,
        }}
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...frameStyleGrid,
        background: LAYOUT_POLISHED_THEME.bg,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        borderRadius: large ? 12 : 6,
        ...style,
      }}
    >
      {[...groups]
        .sort((a, b) => (a.kinds.has('bg') ? 0 : 1) - (b.kinds.has('bg') ? 0 : 1))
        .map((group) => {
        const isBg = group.kinds.has('bg')
        const box = regionToBox(group.bounds, COLS, ROWS, isBg && group.kinds.size === 1 ? 0 : inset)
        const meta = groupSlotPreview(group, previewHints)
        const isImageOnly =
          meta.variant === 'image' || (group.kinds.has('image') && group.kinds.size === 1)
        const bgHasImage = isBg && group.kinds.size === 1 && Boolean(meta.imageUrl || previewHints?.imageUrl)
        const isShape = isShapePreviewGroup(group)
        const showPanel = ((isBg && group.kinds.size === 1) && !bgHasImage) || isShape
        const transparentBg = !showPanel && (isImageOnly || bgHasImage || isTextPreviewGroup(group) || meta.variant === 'logo')
        const isText = isTextPreviewGroup(group)
        return (
          <div
            key={group.family}
            style={{
              position: 'absolute',
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.w}%`,
              height: `${box.h}%`,
              background: showPanel ? LAYOUT_POLISHED_THEME.card : transparentBg ? 'transparent' : LAYOUT_POLISHED_THEME.card,
              borderRadius: isBg && group.kinds.size === 1 ? (large ? 8 : 4) : large ? 18 : 8,
              overflow: 'hidden',
              zIndex: isBg ? 0 : isText ? 2 : isShape ? 1 : 1,
            }}
          >
            {renderPolishedGroupContent(group, large, previewHints)}
          </div>
        )
      })}
    </div>
  )
}

export { getGridDims }
