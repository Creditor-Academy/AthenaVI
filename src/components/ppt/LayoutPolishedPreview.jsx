import {
  filterPreviewSlots,
  getGridDims,
} from '../../utils/layoutPreviewUtils'
import { aspectRatioToCss } from '../../utils/deckPackTheme'
import { previewImageFrameStyle, PreviewImageIcon } from './layoutPreviewImageShared.jsx'
import { layoutSchemaHasCanvasElements, resolveLayoutCanvasElementsDoc } from '../../utils/videoTemplateToCanvasElements'
import CanvasElementsPreview from './CanvasElementsPreview'
import { EXTENDED_PREVIEW_MODES } from './layoutPolishedPreviewsExtended.jsx'
import { PEOPLE_PRICING_PREVIEW_MODES, PlanCards } from './layoutPolishedPreviewsPeoplePricing.jsx'
import { DEVICE_FRAMES_PREVIEW_MODES } from './layoutPolishedPreviewsDeviceFrames.jsx'
import { DIAGRAM_PREVIEW_MODES } from './layoutPolishedPreviewsDiagrams.jsx'
import { AGENDA_PREVIEW_MODES } from './layoutPolishedPreviewsAgenda.jsx'
import { TIMELINE_PROCESS_PREVIEW_MODES } from './layoutPolishedPreviewsTimelineProcess.jsx'
import { resolvePreviewMode } from '../../utils/deckLayoutRegistry'
import LayoutSvgPreview from './LayoutSvgPreview'

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

function PolishedImagePlaceholder({ large, fullBleed = false, src = '', hero = false }) {
  const iconSize = large ? 36 : 20
  if (src) {
    return (
      <div
        style={{
          ...previewImageFrameStyle({ large, hero: hero && !fullBleed }),
          borderRadius: fullBleed ? 0 : previewImageFrameStyle({ large, hero }).borderRadius,
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
    <div style={previewImageFrameStyle({ large, hero: hero && !fullBleed, circle: false })}>
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
    ? previewHints.stats
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
  const variant = previewHints.pricingVariant || 'horizontal'
  const planVariant = variant === 'featured' ? 'featured' : 'default'
  const planLayout = variant === 'split' ? 'split' : variant === 'stack' ? 'stack' : 'row'
  const columns = Array.isArray(previewHints.columns)?.length ? previewHints.columns : null
  const count = columns?.length || 3
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
      <PlanCards
        previewHints={previewHints}
        large={large}
        count={count}
        variant={planVariant}
        layout={planLayout}
      />
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

function PolishedQuoteGridPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const quote = previewHints.quoteText || 'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.'
  const author = previewHints.authorName || 'Gemine Macberry'
  const authorTitle = previewHints.authorTitle || 'VP of Engineering at Acme Inc.'
  const headingText = previewHints.slots?.HEADING?.text || 'Voices from our users'
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }

  return (
    <div className={className} style={{
      position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif', borderRadius: large ? 12 : 6, boxSizing: 'border-box',
      padding: large ? '6% 4%' : '8% 5%', display: 'flex', flexDirection: 'column', gap: large ? 14 : 5, ...style,
    }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: t.text }}>
        {headingText}
      </div>
      <div style={{ display: 'flex', gap: large ? 12 : 4, flex: 1, minHeight: 0 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            flex: 1, minWidth: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: large ? 12 : 5,
            padding: large ? '10px 12px 12px' : '4px 5px 5px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: large ? '1.4rem' : '0.42rem', color: '#1E3A5F', fontWeight: 700, lineHeight: 1, marginBottom: large ? 6 : 2 }}>&ldquo;</div>
            <div style={{ fontSize: large ? '0.72rem' : '0.22rem', color: t.text, lineHeight: 1.4, fontWeight: 700, flex: 1 }}>
              {quote}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: large ? 8 : 3, marginTop: large ? 10 : 3 }}>
              <div style={{
                width: large ? 28 : 10, height: large ? 28 : 10, borderRadius: '50%', background: '#E5E7EB', flexShrink: 0,
              }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: large ? '0.62rem' : '0.2rem', fontWeight: 700, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{author}</div>
                <div style={{ fontSize: large ? '0.5rem' : '0.16rem', color: t.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{authorTitle}</div>
              </div>
            </div>
          </div>
        ))}
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

function PolishedIntroThreeParaIconsPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const t = LAYOUT_POLISHED_THEME
  const introMeta = previewHints.slots?.INTRO || {}
  const { display: introText } = formatPreviewText(introMeta.text || 'Three pillars', {
    bold: introMeta.bold ?? true,
    uppercase: introMeta.uppercase ?? false,
  })
  const columns =
    Array.isArray(previewHints.columns) && previewHints.columns.length
      ? previewHints.columns.slice(0, 3)
      : [1, 2, 3].map((n) => ({
          title: previewHints.slots?.[`ROW_${n}_TITLE`]?.text || `Pillar ${n}`,
          body:
            previewHints.slots?.[`ROW_${n}_BODY`]?.text ||
            'Short supporting copy for this pillar.',
        }))
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
        fontFamily: 'system-ui, sans-serif',
        borderRadius: large ? 12 : 6,
        boxSizing: 'border-box',
        padding: large ? '8% 7%' : '10% 6%',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 18 : 6,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_SUBTITLE_FS.large : PREVIEW_SUBTITLE_FS.small,
          fontWeight: 700,
          color: t.muted,
        }}
      >
        {introText}
      </div>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: large ? 18 : 6,
          minHeight: 0,
          alignContent: 'start',
        }}
      >
        {columns.map((col, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: large ? 8 : 3,
              minWidth: 0,
            }}
          >
            <PolishedIconCircle size={large ? 28 : 10} />
            <div
              style={{
                fontSize: large ? '0.95rem' : '0.34rem',
                fontWeight: 800,
                color: t.text,
                lineHeight: 1.2,
              }}
            >
              {col.title}
            </div>
            <div
              style={{
                fontSize: large ? PREVIEW_BODY_FS.large : '0.28rem',
                color: t.muted,
                lineHeight: 1.4,
              }}
            >
              {col.body}
            </div>
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

function PolishedClosingImageSplitPreview({ previewHints, large, className, style, fill, aspectRatio, imageSide = 'right' }) {
  const t = LAYOUT_POLISHED_THEME
  const bodyMeta = previewHints.slots?.BODY || {}
  const ctaMeta = previewHints.slots?.CTA || {}
  const { display: bodyText } = formatPreviewText(bodyMeta.text || 'Closing message with a clear call to action.', { bold: false, uppercase: false })
  const { display: ctaText } = formatPreviewText(ctaMeta.text || 'Book a demo', { bold: true, uppercase: false })
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }
  const textCol = (
    <div style={{ padding: large ? '10% 8%' : '12% 8%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: large ? 10 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.28rem', color: t.muted, lineHeight: 1.45 }}>{bodyText}</div>
      {ctaText && <div style={{ fontSize: large ? '0.9rem' : '0.32rem', fontWeight: 700, color: t.accent }}>{ctaText}</div>}
    </div>
  )
  const imageCol = (
    <div style={{ minHeight: 0, background: t.surface }}>
      <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
    </div>
  )
  return (
    <div className={className} style={{ position: 'relative', ...frameStyle, background: t.bg, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', ...style }}>
      {imageSide === 'left' ? (<>{imageCol}{textCol}</>) : (<>{textCol}{imageCol}</>)}
    </div>
  )
}

function PolishedClosingOverlayPreview({ previewHints, large, className, style, fill, aspectRatio }) {
  const headingMeta = previewHints.slots?.HEADING || {}
  const bodyMeta = previewHints.slots?.BODY || {}
  const ctaMeta = previewHints.slots?.CTA || {}
  const { display: headingText } = formatPreviewText(headingMeta.text || 'Thank you', { bold: true, uppercase: false })
  const { display: bodyText } = formatPreviewText(bodyMeta.text || '', { bold: false, uppercase: false })
  const { display: ctaText } = formatPreviewText(ctaMeta.text || 'Get in touch', { bold: true, uppercase: false })
  const frameStyle = fill ? { width: '100%', height: '100%', aspectRatio: 'unset' } : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }
  return (
    <div className={className} style={{ position: 'relative', ...frameStyle, overflow: 'hidden', borderRadius: large ? 12 : 6, ...style }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <PolishedImagePlaceholder large={large} src={resolvePreviewImageSrc(previewHints)} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: large ? '10% 8%' : '12% 8%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 10 : 4, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: large ? '1.8rem' : '0.62rem', fontWeight: 800, lineHeight: 1.1 }}>{headingText}</div>
        {bodyText && <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.26rem', opacity: 0.9, maxWidth: '85%', lineHeight: 1.4 }}>{bodyText}</div>}
        {ctaText && <div style={{ fontSize: large ? '0.95rem' : '0.32rem', fontWeight: 700 }}>{ctaText}</div>}
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
  const resolvedSlots = filterPreviewSlots(slots.length ? slots : schema?.slots ?? [])
  const hasSlots = resolvedSlots.length > 0
  const previewHints = {
    ...(schema?.preview ?? {}),
    layout_id: schema?.layout_id || schema?.layoutId,
  }
  const previewMode = resolvePreviewMode(schema) || previewHints.mode
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
  if (previewMode === 'quote_grid') {
    return <PolishedQuoteGridPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
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
  const TimelineProcessPreview = TIMELINE_PROCESS_PREVIEW_MODES[previewMode]
  if (TimelineProcessPreview) {
    return (
      <TimelineProcessPreview
        previewHints={previewHints}
        large={large}
        fill={fill}
        className={className}
        style={style}
        aspectRatio={aspectRatio}
      />
    )
  }
  const DiagramPreview = DIAGRAM_PREVIEW_MODES[previewMode]
  if (DiagramPreview) {
    return (
      <DiagramPreview
        previewHints={previewHints}
        large={large}
        fill={fill}
        className={className}
        style={style}
        aspectRatio={aspectRatio}
      />
    )
  }
  const AgendaPreview = AGENDA_PREVIEW_MODES[previewMode]
  if (AgendaPreview) {
    return (
      <AgendaPreview
        previewHints={previewHints}
        large={large}
        fill={fill}
        className={className}
        style={style}
        aspectRatio={aspectRatio}
      />
    )
  }
  if (previewMode === 'stat_cards_image') {
    return <PolishedStatCardsImagePreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'two_image_columns') {
    return <PolishedTwoImageColumnsPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'intro_three_para_icons') {
    return <PolishedIntroThreeParaIconsPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'eight_short_texts') {
    return <PolishedEightShortTextsPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'closing_cta') {
    return <PolishedClosingCtaPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }
  if (previewMode === 'closing_image_right') {
    return <PolishedClosingImageSplitPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} imageSide="right" />
  }
  if (previewMode === 'closing_image_left') {
    return <PolishedClosingImageSplitPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} imageSide="left" />
  }
  if (previewMode === 'closing_overlay') {
    return <PolishedClosingOverlayPreview previewHints={previewHints} large={large} fill={fill} className={className} style={style} aspectRatio={aspectRatio} />
  }

  const ExtendedPreview = EXTENDED_PREVIEW_MODES[previewMode]
    || PEOPLE_PRICING_PREVIEW_MODES[previewMode]
    || DEVICE_FRAMES_PREVIEW_MODES[previewMode]
  if (ExtendedPreview) {
    return (
      <ExtendedPreview
        previewHints={previewHints}
        large={large}
        fill={fill}
        className={className}
        style={style}
        aspectRatio={aspectRatio}
      />
    )
  }

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
    <LayoutSvgPreview
      slots={resolvedSlots}
      schema={schema}
      large={large}
      fill={fill}
      className={className}
      style={style}
      aspectRatio={aspectRatio}
    />
  )
}

export { getGridDims }
