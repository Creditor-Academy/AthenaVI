/**
 * Polished layout previews for Agenda catalog (6 families × variants).
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'
import { PreviewImage } from './layoutPreviewImageShared.jsx'

const PREVIEW_TITLE_FS = { large: '1.75rem', small: '0.42rem' }
const PREVIEW_BODY_FS = { large: '0.88rem', small: '0.26rem' }
const PREVIEW_CAPTION_FS = { large: '0.72rem', small: '0.22rem' }

const theme = {
  bg: 'var(--preview-bg, var(--bg-card, #ffffff))',
  card: 'var(--preview-card, color-mix(in srgb, var(--border-color) 50%, var(--bg-card)))',
  text: 'var(--preview-text, var(--text-main, #1f1f1f))',
  muted: 'var(--preview-muted, var(--text-muted, #6f6f6f))',
  accent: 'var(--preview-accent, #6366f1)',
  accentSoft: 'var(--preview-accent-soft, rgba(99, 102, 241, 0.1))',
  accentBorder: 'var(--preview-accent-border, rgba(99, 102, 241, 0.35))',
}

function frameProps({ large, fill, aspectRatio, className, style }) {
  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset' }
    : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }
  return {
    className,
    style: {
      position: 'relative',
      ...frameStyle,
      background: theme.bg,
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: large ? 12 : 6,
      boxSizing: 'border-box',
      ...style,
    },
  }
}

function pad(large) {
  return large ? '6% 5%' : '8% 5%'
}

function slotText(previewHints, slotId, fallback = '') {
  return previewHints?.slots?.[slotId]?.text || fallback
}

function defaultAgendaColumns() {
  return [
    { heading: 'Morning', items: ['1.1 Opening remarks', '1.2 Key topic', '1.3 Discussion'] },
    { heading: 'Afternoon', items: ['2.1 Workshop', '2.2 Breakout', '2.3 Summary'] },
    { heading: 'Evening', items: ['3.1 Networking', '3.2 Q&A', '3.3 Closing'] },
  ]
}

function defaultAgendaItems() {
  return ['Topic one', 'Topic two', 'Topic three', 'Topic four']
}

function defaultNumberedItems() {
  return ['01 · Opening and goals', '02 · Market context', '03 · Product demo', '04 · Q&A']
}

function defaultMilestones() {
  return ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']
}

function AgendaCard({ title, body, large, index, elevated = false }) {
  return (
    <div
      style={{
        borderRadius: large ? 10 : 4,
        border: `1px solid ${theme.accentBorder}`,
        background: elevated ? theme.accentSoft : theme.card,
        padding: large ? '10px 12px' : '4px 5px',
        boxShadow: elevated ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 4 : 2,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: large ? '0.58rem' : '0.2rem', fontWeight: 800, color: theme.accent }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{ fontSize: large ? '0.72rem' : '0.26rem', fontWeight: 700, color: theme.text, lineHeight: 1.2 }}>
        {title}
      </div>
      {body && (
        <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, lineHeight: 1.35 }}>
          {body}
        </div>
      )}
    </div>
  )
}

export function PolishedAgendaMinimalPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Agenda')
  const items = previewHints.agendaItems?.length ? previewHints.agendaItems : defaultAgendaItems()
  const variant = previewHints.agendaVariant

  if (variant === 'editorial') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 12 : 4 }}>
        <div style={{ fontSize: large ? '2rem' : '0.72rem', fontWeight: 800, color: theme.text, lineHeight: 1.05, maxWidth: '70%' }}>
          {heading}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
          {items.slice(0, 4).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: large ? 12 : 4, alignItems: 'baseline', borderTop: `1px solid color-mix(in srgb, ${theme.text} 12%, transparent)`, paddingTop: large ? 8 : 3 }}>
              <div style={{ fontSize: large ? '1.4rem' : '0.48rem', fontWeight: 800, color: theme.accent, lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: large ? '0.82rem' : '0.28rem', fontWeight: 600, color: theme.text }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: large ? 10 : 3, alignItems: 'stretch' }}>
          {items.slice(0, 4).map((item, i) => (
            <AgendaCard key={i} title={item} large={large} index={i} elevated />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 16 : 6, alignItems: 'start' }}>
      <div style={{ fontSize: large ? '1.6rem' : '0.58rem', fontWeight: 800, color: theme.text, lineHeight: 1.1 }}>{heading}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
        {items.slice(0, 5).map((item, i) => (
          <div key={i} style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted, borderBottom: `1px solid color-mix(in srgb, ${theme.text} 10%, transparent)`, paddingBottom: large ? 6 : 2 }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedAgendaNumberedPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', "Today's agenda")
  const items = previewHints.agendaItems?.length ? previewHints.agendaItems : defaultNumberedItems()
  const variant = previewHints.agendaVariant

  if (variant === 'bold') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, textAlign: 'center' }}>{heading}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
          {items.slice(0, 4).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: large ? 8 : 3, minWidth: 0 }}>
              <div style={{ fontSize: large ? '1.8rem' : '0.62rem', fontWeight: 900, color: theme.accent, opacity: 0.35, lineHeight: 1, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: large ? '0.78rem' : '0.28rem', fontWeight: 700, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'timeline') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, textAlign: 'center' }}>{heading}</div>
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: large ? 12 : 4, paddingLeft: large ? 24 : 10 }}>
          <div aria-hidden style={{ position: 'absolute', left: large ? 10 : 4, top: '8%', bottom: '8%', width: large ? 3 : 1, background: theme.accent, opacity: 0.5, borderRadius: 2 }} />
          {items.slice(0, 4).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: large ? 10 : 4 }}>
              <div style={{ width: large ? 14 : 6, height: large ? 14 : 6, borderRadius: '50%', background: theme.accent, flexShrink: 0, zIndex: 1 }} />
              <div style={{ fontSize: large ? '0.72rem' : '0.26rem', fontWeight: 600, color: theme.text }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, textAlign: 'center' }}>{heading}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
        {items.slice(0, 4).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: large ? 10 : 4, alignItems: 'baseline' }}>
            <div style={{ fontSize: large ? '0.9rem' : '0.32rem', fontWeight: 800, color: theme.accent, minWidth: large ? 28 : 12 }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ fontSize: large ? '0.72rem' : '0.26rem', fontWeight: 600, color: theme.text }}>{item}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedAgendaThreeColumnsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const columns = previewHints.agendaColumns?.length ? previewHints.agendaColumns : defaultAgendaColumns()
  const heading = slotText(previewHints, 'HEADING', 'Agenda')
  const variant = previewHints.agendaVariant

  if (variant === 'cards') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 12 : 4 }}>
          {columns.slice(0, 3).map((col, i) => (
            <div key={i} style={{ borderRadius: large ? 12 : 4, border: `1px solid ${theme.accentBorder}`, background: theme.card, padding: large ? '12px 10px' : '4px 3px', boxShadow: '0 6px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
              <div style={{ fontSize: large ? '0.82rem' : '0.28rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
              {(col.items || []).slice(0, 3).map((item, j) => (
                <div key={j} style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'tiles') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 8 : 3 }}>
          {columns.slice(0, 3).map((col, i) => (
            <div key={i} style={{ background: i === 1 ? theme.accentSoft : theme.card, borderRadius: large ? 4 : 2, padding: large ? '10px 8px' : '4px 3px', display: 'flex', flexDirection: 'column', gap: large ? 4 : 2 }}>
              <div style={{ width: large ? 20 : 8, height: large ? 4 : 2, background: theme.accent, borderRadius: 2 }} />
              <div style={{ fontSize: large ? '0.78rem' : '0.26rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
              {(col.items || []).slice(0, 2).map((item, j) => (
                <div key={j} style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 12 : 4 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 16 : 4 }}>
        {columns.slice(0, 3).map((col, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
            <div style={{ fontSize: large ? '0.95rem' : '0.32rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
            {(col.items || []).slice(0, 4).map((item, j) => (
              <div key={j} style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted, lineHeight: 1.35 }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedAgendaThreeColumnsHeroPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const columns = previewHints.agendaColumns?.length ? previewHints.agendaColumns : defaultAgendaColumns()
  const heroSrc = previewHints.slots?.HERO_IMAGE?.imageUrl || previewHints.imageUrl || ''
  const heading = slotText(previewHints, 'HEADING', "What You'll Find")
  const variant = previewHints.agendaVariant

  if (variant === 'panel') {
    return (
      <div {...fp} style={{ ...fp.style, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', height: '100%' }}>
        {columns.slice(0, 3).map((col, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: pad(large), background: i === 1 ? theme.accentSoft : theme.card, borderRight: i < 2 ? `1px solid color-mix(in srgb, ${theme.text} 8%, transparent)` : 'none' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}><PreviewImage large={large} fullBleed src={heroSrc} /></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: large ? '0.62rem' : '0.22rem', fontWeight: 800, color: theme.accent }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: large ? '0.82rem' : '0.28rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 12 : 4 }}>
          {columns.slice(0, 3).map((col, i) => (
            <div key={i} style={{ borderRadius: large ? 10 : 4, overflow: 'hidden', border: `1px solid ${theme.accentBorder}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: large ? 48 : 18 }}><PreviewImage large={large} fullBleed src={heroSrc} /></div>
              <div style={{ padding: large ? '8px 10px' : '3px 4px', display: 'flex', flexDirection: 'column', gap: large ? 4 : 2 }}>
                <div style={{ fontSize: large ? '0.72rem' : '0.26rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
                {(col.items || []).slice(0, 2).map((item, j) => (
                  <div key={j} style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted }}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: large ? '38%' : '34%', minHeight: large ? 80 : 28, flexShrink: 0, width: '100%' }}>
        <PreviewImage large={large} fullBleed src={heroSrc} />
      </div>
      <div style={{ flex: 1, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 14 : 4 }}>
          {columns.slice(0, 3).map((col, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
              <div style={{ fontSize: large ? '0.72rem' : '0.22rem', fontWeight: 800, letterSpacing: '0.08em', color: theme.muted }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: large ? '0.82rem' : '0.28rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
              {(col.items || []).slice(0, 3).map((item, j) => (
                <div key={j} style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, lineHeight: 1.4 }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PolishedAgendaTwoColumnsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const columns = previewHints.agendaColumns?.length ? previewHints.agendaColumns.slice(0, 2) : defaultAgendaColumns().slice(0, 2)
  const heading = slotText(previewHints, 'HEADING', 'Session overview')
  const variant = previewHints.agendaVariant

  if (variant === 'split_panel') {
    return (
      <div {...fp} style={{ ...fp.style, display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
        <div style={{ background: theme.accentSoft, padding: pad(large), display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: large ? '1.2rem' : '0.42rem', fontWeight: 800, color: theme.text, lineHeight: 1.15 }}>{heading}</div>
        </div>
        <div style={{ padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4, justifyContent: 'center' }}>
          {columns.map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: large ? '0.78rem' : '0.28rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
              {(col.items || []).slice(0, 3).map((item, j) => (
                <div key={j} style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'asymmetric') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: 'auto 1fr', gap: large ? 12 : 4 }}>
        <div style={{ gridColumn: '1 / -1', fontSize: large ? '1.4rem' : '0.48rem', fontWeight: 900, color: theme.text }}>{heading}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3, paddingTop: large ? 20 : 8 }}>
          {(columns[0]?.items || []).slice(0, 3).map((item, j) => (
            <div key={j} style={{ fontSize: large ? '0.72rem' : '0.26rem', color: theme.muted }}>{item}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3, alignSelf: 'end' }}>
          <div style={{ fontSize: large ? '0.78rem' : '0.28rem', fontWeight: 800, color: theme.accent }}>{columns[1]?.heading}</div>
          {(columns[1]?.items || []).slice(0, 3).map((item, j) => (
            <div key={j} style={{ fontSize: large ? '0.72rem' : '0.26rem', color: theme.text }}>{item}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 16 : 6 }}>
        {columns.map((col, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
            <div style={{ fontSize: large ? '0.82rem' : '0.28rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
            {(col.items || []).slice(0, 4).map((item, j) => (
              <div key={j} style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedAgendaTimelinePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Roadmap preview')
  const milestones = previewHints.milestones?.length ? previewHints.milestones : defaultMilestones()
  const variant = previewHints.agendaVariant
  const count = Math.min(milestones.length, 4)

  if (variant === 'vertical') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: 'auto 1fr', gap: large ? 16 : 6 }}>
        <div style={{ position: 'relative', width: large ? 4 : 2, background: theme.accent, opacity: 0.4, borderRadius: 2, margin: `${large ? 12 : 4}px 0` }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 14 : 5 }}>
          <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
          {milestones.slice(0, count).map((label, i) => (
            <div key={i} style={{ display: 'flex', gap: large ? 10 : 4, alignItems: 'center' }}>
              <div style={{ width: large ? 12 : 5, height: large ? 12 : 5, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />
              <div style={{ fontSize: large ? '0.72rem' : '0.26rem', fontWeight: 600, color: theme.text }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'path') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: large ? 8 : 3, alignItems: 'end' }}>
          <div aria-hidden style={{ position: 'absolute', left: '8%', right: '8%', bottom: large ? 28 : 10, height: large ? 3 : 1, background: theme.accent, opacity: 0.45, borderRadius: 2, transform: 'rotate(-4deg)' }} />
          {milestones.slice(0, count).map((label, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 6 : 2, zIndex: 1, marginBottom: i % 2 === 0 ? 0 : large ? 16 : 6 }}>
              <div style={{ width: large ? 16 : 6, height: large ? 16 : 6, borderRadius: '50%', background: theme.accent }} />
              <div style={{ fontSize: large ? '0.62rem' : '0.22rem', fontWeight: 700, color: theme.text, textAlign: 'center' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
        <div aria-hidden style={{ position: 'absolute', left: '8%', right: '8%', top: '42%', height: large ? 3 : 1, background: theme.text, opacity: 0.25, borderRadius: 2 }} />
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: large ? 8 : 3 }}>
          {milestones.slice(0, count).map((label, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 6 : 2, zIndex: 1 }}>
              <div style={{ width: large ? 14 : 5, height: large ? 14 : 5, borderRadius: '50%', background: theme.accent }} />
              <div style={{ fontSize: large ? '0.62rem' : '0.22rem', fontWeight: 700, color: theme.text, textAlign: 'center' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const AGENDA_PREVIEW_MODES = {
  agenda_minimal: PolishedAgendaMinimalPreview,
  agenda_numbered: PolishedAgendaNumberedPreview,
  agenda_three_columns: PolishedAgendaThreeColumnsPreview,
  agenda_three_columns_hero: PolishedAgendaThreeColumnsHeroPreview,
  agenda_two_columns: PolishedAgendaTwoColumnsPreview,
  process_flow: PolishedAgendaTimelinePreview,
}
