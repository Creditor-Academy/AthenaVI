/**
 * Polished layout previews for Agenda catalog — matrix-style SVG + text overlays.
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'
import { agendaPreviewSvg, resolveAgendaMeta } from '../../utils/agendaInfographicSvg'
import { DEFAULT_COLUMN_PALETTE } from '../../utils/agendaThreeColumn.js'
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
  return ['Opening and goals', 'Market context', 'Product demo', 'Q&A', 'Workshop breakout', 'Closing remarks']
}

function defaultMilestones() {
  return ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']
}

function AgendaSvgChrome({ previewHints, itemCount = 4 }) {
  const { family, variant } = resolveAgendaMeta({
    layout_id: previewHints?.layout_id,
    preview: previewHints,
  })
  const svg = agendaPreviewSvg(family, variant, {
    accent: theme.accent,
    muted: theme.muted,
    soft: theme.accentSoft,
  }, { itemCount })
  return (
    <div
      aria-hidden
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg style="width:100%;height:100%;" ') }}
    />
  )
}

function AgendaTextLayer({ children, style }) {
  return (
    <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', ...style }}>
      {children}
    </div>
  )
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
    <div {...fp}>
      <AgendaSvgChrome previewHints={previewHints} itemCount={items.length} />
      <AgendaTextLayer style={{ padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 16 : 6, alignItems: 'start' }}>
        <div style={{ fontSize: large ? '1.6rem' : '0.58rem', fontWeight: 800, color: theme.text, lineHeight: 1.1 }}>{heading}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
          {items.slice(0, 5).map((item, i) => (
            <div key={i} style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted }}>{item}</div>
          ))}
        </div>
      </AgendaTextLayer>
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
    const stops = items.slice(0, 4)
    const pals = ['#7CB342', '#2F6FED', '#E53935', '#FF6E40']
    const notes = [
      ['Kickoff notes', 'Desired outcome'],
      ['Market snapshot', 'Key constraints'],
      ['Live walkthrough', 'Proof points'],
      ['Open questions', 'Next steps'],
    ]
    return (
      <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: large ? '6% 4% 3%' : '7% 3% 3%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, marginBottom: large ? 8 : 4 }}>{heading}</div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <div aria-hidden style={{ position: 'absolute', left: '2%', right: '2%', top: '32%', height: large ? 3 : 1.5, background: '#C5CAD3' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between' }}>
            {stops.map((item, i) => {
              const pal = pals[i]
              const low = i % 2 === 0
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '32%', width: 0, height: low ? '42%' : '22%', borderLeft: `${large ? 2 : 1}px solid ${pal}` }} />
                  <div style={{ marginTop: '12%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ fontSize: large ? '0.48rem' : '0.16rem', fontWeight: 800, color: pal, marginBottom: large ? 6 : 2 }}>{String(i + 1).padStart(2, '0')}</div>
                    <div style={{
                      width: large ? 42 : 16,
                      height: large ? 42 : 16,
                      borderRadius: 999,
                      background: pal,
                      boxShadow: `0 0 0 ${large ? 7 : 3}px color-mix(in srgb, ${pal} 30%, transparent), 0 0 0 ${large ? 13 : 5}px color-mix(in srgb, ${pal} 18%, transparent), 0 0 0 ${large ? 19 : 7}px color-mix(in srgb, ${pal} 10%, transparent)`,
                    }} />
                  </div>
                  <div style={{
                    marginTop: low ? (large ? 36 : 12) : (large ? 18 : 6),
                    textAlign: 'center',
                    padding: '0 4px',
                    width: '100%',
                  }}>
                    <div style={{ fontSize: large ? '0.52rem' : '0.15rem', fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>{item.replace(/^\s*\d+\s*[·.:\-)]\s*/, '')}</div>
                    {(notes[i] || []).map((note) => (
                      <div key={note} style={{ fontSize: large ? '0.36rem' : '0.11rem', color: theme.muted, textAlign: 'left', marginTop: large ? 2 : 1, lineHeight: 1.25 }}>• {note}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: large ? '6% 4% 5%' : '7% 4% 5%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0, lineHeight: 1.15, marginBottom: large ? 10 : 4 }}>{heading}</div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: large ? 10 : 4 }}>
        {Array.from({ length: 6 }, (_, i) => {
          const pal = [
            { main: '#2F9E6B', fill: '#E5F6EC' },
            { main: '#E94B8C', fill: '#FCE8F1' },
            { main: '#7A5C9E', fill: '#EDE6F6' },
            { main: '#5C4E9A', fill: '#E8E4F6' },
            { main: '#3B8FD9', fill: '#E2F0FB' },
            { main: '#D94A8A', fill: '#F9E4EE' },
          ][i]
          const item = items[i] || ''
          return (
            <div key={i} style={{ position: 'relative', minWidth: 0 }}>
              <div style={{
                position: 'absolute',
                left: large ? 10 : 4,
                right: 0,
                top: large ? 4 : 2,
                bottom: large ? 4 : 2,
                background: pal.fill,
                border: `${large ? 1.5 : 1}px dashed ${pal.main}`,
                clipPath: 'polygon(18% 0, 100% 0, 82% 100%, 0 100%)',
              }} />
              <div style={{
                position: 'relative',
                zIndex: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                padding: large ? '4px 10px 2px 6px' : '2px 4px 1px 2px',
              }}>
                <div style={{
                  fontSize: large ? '1.35rem' : '0.42rem',
                  fontWeight: 800,
                  color: pal.main,
                  lineHeight: 0.85,
                  flexShrink: 0,
                  textShadow: `1px 2px 0 color-mix(in srgb, ${pal.main} 28%, transparent)`,
                  marginRight: large ? 6 : 2,
                }}>{i + 1}</div>
                <div style={{ minWidth: 0, alignSelf: 'flex-start', paddingTop: large ? 4 : 1 }}>
                  <div style={{ fontSize: large ? '0.52rem' : '0.16rem', fontWeight: 800, color: pal.main, lineHeight: 1.2 }}>Agenda {String(i + 1).padStart(2, '0')}</div>
                  {item ? (
                    <div style={{ fontSize: large ? '0.38rem' : '0.12rem', color: theme.muted, lineHeight: 1.3, marginTop: large ? 2 : 1 }}>{item.replace(/^\s*\d+\s*[·.:\-)]\s*/, '')}</div>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
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
    const pals = [
      { main: '#1E4B8C', light: '#3A6CB0' },
      { main: '#6B7280', light: '#9CA3AF' },
      { main: '#2A9B8F', light: '#4DB8AC' },
    ]
    return (
      <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%', background: '#f4f5f7', padding: large ? '7% 2% 4%' : '8% 2% 5%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, marginBottom: large ? 10 : 4, flexShrink: 0, lineHeight: 1.15 }}>{heading}</div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: large ? 6 : 3, padding: 0 }}>
          {columns.slice(0, 3).map((col, i) => {
            const pal = pals[i]
            return (
              <div key={i} style={{
                flex: 1,
                background: '#fff',
                borderRadius: large ? 10 : 4,
                boxShadow: '0 8px 18px rgba(31,41,55,0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: large ? '10px 0 12px' : '4px 0 5px',
              }}>
                <div style={{
                  width: large ? 36 : 14,
                  height: large ? 36 : 14,
                  borderRadius: 999,
                  border: `${large ? 2 : 1}px solid ${pal.main}`,
                  boxShadow: `inset 0 0 0 ${large ? 3 : 1}px #fff, inset 0 0 0 ${large ? 5 : 2}px ${pal.main}`,
                  marginBottom: large ? 8 : 3,
                }} />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '86%',
                  background: `linear-gradient(${pal.light}, ${pal.main})`,
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: large ? '0.58rem' : '0.18rem',
                  padding: 0,
                  height: large ? 28 : 12,
                  lineHeight: 1,
                }}>{col.heading}</div>
                <div style={{ width: '86%', marginTop: large ? 10 : 4 }}>
                  {(col.items || []).slice(0, 3).map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: large ? 6 : 2, marginTop: j ? (large ? 6 : 2) : 0 }}>
                      <div style={{ width: large ? 7 : 3, height: large ? 7 : 3, background: pal.main, transform: 'rotate(45deg)', marginTop: large ? 4 : 2, flexShrink: 0 }} />
                      <div style={{ fontSize: large ? '0.48rem' : '0.14rem', color: theme.muted, lineHeight: 1.3 }}>{item}</div>
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

  if (variant === 'coloured') {
    const columnColors = DEFAULT_COLUMN_PALETTE
    return (
      <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ textAlign: 'center', padding: large ? '6px 12px 2px' : '2px 4px 1px', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>
          {heading}
        </div>
        <div style={{ height: large ? 2 : 1, margin: large ? '0 10px 6px' : '0 4px 3px', background: 'color-mix(in srgb, var(--text-muted) 30%, transparent)' }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 8 : 3, padding: large ? '4px 8px 8px' : '2px 3px 3px', minHeight: 0 }}>
          {columns.slice(0, 3).map((col, i) => {
            const pal = columnColors[i % columnColors.length]
            return (
              <div key={i} style={{ position: 'relative', background: pal.main, overflow: 'visible', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: large ? '36px 8px 10px' : '12px 3px 4px', gap: large ? 4 : 2 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: large ? 16 : 6, background: pal.band }} />
                <div style={{ position: 'absolute', top: large ? -14 : -5, left: '50%', transform: 'translateX(-50%)', width: large ? 34 : 12, height: large ? 34 : 12, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 2 }} />
                <div style={{ fontSize: large ? '0.9rem' : '0.3rem', fontWeight: 800, color: '#fff' }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontSize: large ? '0.7rem' : '0.24rem', fontWeight: 800, color: '#fff' }}>{col.heading}</div>
                {(col.items || []).slice(0, 2).map((item, j) => (
                  <div key={j} style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: 'rgba(255,255,255,0.92)', fontStyle: 'italic', lineHeight: 1.3 }}>{item}</div>
                ))}
              </div>
            )
          })}
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
    <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', padding: large ? '5% 5% 4%' : '6% 4% 5%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, marginBottom: large ? 10 : 4, flexShrink: 0 }}>
        {heading}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: large ? 16 : 6, padding: large ? '2% 9% 3%' : '4% 8% 4%' }}>
        {columns.slice(0, 3).map((col, i) => {
          const pal = DEFAULT_COLUMN_PALETTE[i % DEFAULT_COLUMN_PALETTE.length]
          const rings = ['solid', 'dashed', 'dotted']
          return (
            <div key={i} style={{ position: 'relative', width: '28%', maxWidth: large ? 180 : 72, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: large ? 18 : 8, paddingBottom: large ? 12 : 5 }}>
              <div style={{
                position: 'absolute',
                top: large ? 18 : 8,
                left: 0,
                right: 0,
                bottom: large ? 2 : 1,
                border: `${large ? 2 : 1}px solid ${pal.main}`,
                borderRadius: large ? 12 : 6,
                background: '#fff',
              }} />
              <div style={{
                position: 'relative',
                zIndex: 2,
                width: large ? 44 : 16,
                height: large ? 44 : 16,
                borderRadius: 999,
                background: pal.main,
                boxShadow: `0 0 0 ${large ? 5 : 2}px #fff, 0 0 0 ${large ? 8 : 3.5}px ${pal.main}`,
                border: rings[i] === 'solid' ? 'none' : `${large ? 2 : 1}px ${rings[i]} ${pal.main}`,
                flexShrink: 0,
              }} />
              <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                marginTop: large ? 16 : 6,
                background: pal.main,
                color: '#fff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: large ? '0.82rem' : '0.24rem',
                padding: large ? '8px 0' : '3px 0',
              }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: large ? '10px 8px 12px' : '4px 3px 6px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: large ? '0.78rem' : '0.24rem', fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>{col.heading}</div>
                <div style={{ fontSize: large ? '0.52rem' : '0.16rem', color: theme.muted, lineHeight: 1.35, marginTop: large ? 8 : 3 }}>
                  {(col.items || []).slice(0, 3).map((item, j) => (
                    <div key={j} style={{ marginTop: j ? (large ? 6 : 2) : 0 }}>{item}</div>
                  ))}
                </div>
                <div style={{ width: large ? 28 : 12, height: large ? 4 : 2, borderRadius: 99, background: pal.main, margin: 'auto auto 0' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function heroImageStrip({ large, heroSrc }) {
  return (
    <div style={{ height: large ? '38%' : '34%', minHeight: large ? 80 : 28, flexShrink: 0, width: '100%' }}>
      <PreviewImage large={large} fullBleed src={heroSrc} />
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
  const heroStrip = heroImageStrip({ large, heroSrc })
  const titleStyle = { fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }

  if (variant === 'panel') {
    return (
      <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {heroStrip}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', minHeight: 0 }}>
          {columns.slice(0, 3).map((col, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: large ? 6 : 2,
                padding: pad(large),
                background: i === 1 ? theme.accentSoft : theme.card,
                borderRight: i < 2 ? `1px solid color-mix(in srgb, ${theme.text} 8%, transparent)` : 'none',
              }}
            >
              <div style={{ fontSize: large ? '0.62rem' : '0.22rem', fontWeight: 800, color: theme.accent }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: large ? '0.82rem' : '0.28rem', fontWeight: 800, color: theme.text }}>{col.heading}</div>
              {(col.items || []).slice(0, 2).map((item, j) => (
                <div key={j} style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, lineHeight: 1.35 }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'cards') {
    const pals = [
      { main: '#1E4B8C', light: '#3A6CB0' },
      { main: '#6B7280', light: '#9CA3AF' },
      { main: '#2A9B8F', light: '#4DB8AC' },
    ]
    return (
      <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%', background: '#f4f5f7' }}>
        {heroStrip}
        <div style={{ flex: 1, minHeight: 0, padding: large ? '6px 10px 8px' : '3px 4px 4px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...titleStyle, textAlign: 'center', marginBottom: large ? 6 : 2 }}>{heading}</div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: large ? 8 : 3 }}>
            {columns.slice(0, 3).map((col, i) => {
              const pal = pals[i]
              return (
                <div key={i} style={{
                  flex: 1,
                  background: '#fff',
                  borderRadius: large ? 8 : 3,
                  boxShadow: '0 8px 18px rgba(31,41,55,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: large ? '6px 0 8px' : '3px 0 4px',
                }}>
                  <div style={{
                    width: large ? 22 : 10,
                    height: large ? 22 : 10,
                    borderRadius: 999,
                    border: `${large ? 2 : 1}px solid ${pal.main}`,
                    boxShadow: `inset 0 0 0 ${large ? 2 : 1}px #fff, inset 0 0 0 ${large ? 4 : 2}px ${pal.main}`,
                    marginBottom: large ? 5 : 2,
                  }} />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '86%',
                    background: `linear-gradient(${pal.light}, ${pal.main})`,
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: large ? '0.48rem' : '0.16rem',
                    height: large ? 20 : 9,
                    lineHeight: 1,
                  }}>{col.heading}</div>
                  <div style={{ width: '86%', marginTop: large ? 6 : 2 }}>
                    {(col.items || []).slice(0, 3).map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: large ? 5 : 2, marginTop: j ? (large ? 4 : 1) : 0 }}>
                        <div style={{ width: large ? 6 : 3, height: large ? 6 : 3, background: pal.main, transform: 'rotate(45deg)', marginTop: large ? 3 : 1, flexShrink: 0 }} />
                        <div style={{ fontSize: large ? '0.4rem' : '0.12rem', color: theme.muted, lineHeight: 1.25 }}>{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {heroStrip}
      <div style={{ flex: 1, padding: large ? '8px 16px 12px' : '4px 6px 5px', display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff' }}>
        <div style={{ ...titleStyle, textAlign: 'center', marginBottom: large ? 8 : 3 }}>{heading}</div>
        <div style={{ flex: 1, display: 'flex', gap: large ? 12 : 4, minHeight: 0 }}>
          {columns.slice(0, 3).map((col, i) => {
            const pal = ['#1E4B8C', '#6B7280', '#2A9B8F'][i]
            return (
              <div key={i} style={{
                flex: 1,
                background: '#fff',
                borderRadius: large ? 10 : 4,
                boxShadow: '0 8px 18px rgba(31,41,55,0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: large ? '10px 8px' : '4px 3px',
              }}>
                <div style={{
                  width: large ? 28 : 12,
                  height: large ? 28 : 12,
                  borderRadius: 999,
                  border: `${large ? 2 : 1}px solid ${pal}`,
                  marginBottom: large ? 6 : 2,
                }} />
                <div style={{ fontSize: large ? '0.72rem' : '0.24rem', fontWeight: 800, color: theme.text, textAlign: 'center' }}>{col.heading}</div>
                {(col.items || []).slice(0, 3).map((item, j) => (
                  <div key={j} style={{ fontSize: large ? '0.48rem' : '0.14rem', color: theme.muted, textAlign: 'center', marginTop: large ? 4 : 1 }}>{item}</div>
                ))}
              </div>
            )
          })}
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
    <div {...fp}>
      <AgendaSvgChrome previewHints={previewHints} itemCount={count} />
      <AgendaTextLayer style={{ padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: large ? 8 : 3, alignItems: 'end', paddingTop: large ? 50 : 16 }}>
          {milestones.slice(0, count).map((label, i) => (
            <div key={i} style={{ fontSize: large ? '0.62rem' : '0.22rem', fontWeight: 700, color: theme.text, textAlign: 'center' }}>{label}</div>
          ))}
        </div>
      </AgendaTextLayer>
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
