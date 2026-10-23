/**
 * Polished layout previews for Pricing, Agenda, and People & Team catalogs.
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'
import { previewImageFrameStyle, PreviewImageIcon, PreviewImage } from './layoutPreviewImageShared.jsx'

const PREVIEW_TITLE_FS = { large: '1.75rem', small: '0.92rem' }
const PREVIEW_BODY_FS = { large: '0.88rem', small: '0.4rem' }
const PREVIEW_CAPTION_FS = { large: '0.72rem', small: '0.34rem' }

const theme = {
  bg: 'var(--preview-bg, var(--bg-card, #ffffff))',
  card: 'var(--preview-card, color-mix(in srgb, var(--border-color) 50%, var(--bg-card)))',
  text: 'var(--preview-text, var(--text-main, #1f1f1f))',
  muted: 'var(--preview-muted, var(--text-muted, #6f6f6f))',
  accent: 'var(--preview-accent, #6366f1)',
  accentSoft: 'var(--preview-accent-soft, rgba(99, 102, 241, 0.1))',
  accentBorder: 'var(--preview-accent-border, rgba(99, 102, 241, 0.35))',
  imageBg: 'var(--preview-image-bg, #e2e8f0)',
  icon: 'var(--preview-icon, color-mix(in srgb, var(--text-muted) 60%, transparent))',
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

function ImagePh({ large, circle, hero = false, fillIcon = false }) {
  return (
    <div style={previewImageFrameStyle({ large, circle, hero })}>
      <PreviewImageIcon large={large} fill={fillIcon} />
    </div>
  )
}

function TableMini({ large, headers = ['A', 'B', 'C'], rows = [] }) {
  const rowData = rows.length ? rows : Array.from({ length: 3 }, (_, i) => headers.map((_, ci) => (ci === 0 ? `Row ${i + 1}` : '—')))
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: large ? 4 : 1, fontSize: large ? '0.62rem' : '0.22rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`, gap: large ? 4 : 1, fontWeight: 700, color: theme.text }}>
        {headers.map((h) => <div key={h} style={{ padding: large ? '4px 6px' : '1px 2px', background: theme.card, borderRadius: 2 }}>{h}</div>)}
      </div>
      {rowData.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`, gap: large ? 4 : 1, color: theme.muted }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{ padding: large ? '4px 6px' : '1px 2px', background: theme.card, borderRadius: 2 }}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function PlanCards({ previewHints, large, count = 3, variant = 'default', layout = 'row' }) {
  const columns = Array.isArray(previewHints.columns)?.length
    ? previewHints.columns.slice(0, count)
    : [
        { label: 'Basic', price: '$99', items: ['The first point', 'The second point', 'The third point'] },
        { label: 'Standard', price: '$299', items: ['The first point', 'The second point', 'The third point', 'The fourth point'] },
        { label: 'Pro', price: '$999', items: ['The first point', 'The second point', 'The third point', 'The fourth point', 'The final point'] },
        { label: 'Enterprise', price: 'Custom', items: ['Everything in Pro', 'Dedicated support', 'Custom SLA'] },
      ].slice(0, count)
  const highlightIndex =
    typeof previewHints.highlightedColumnIndex === 'number'
      ? previewHints.highlightedColumnIndex
      : columns.findIndex((col) => col.highlighted) >= 0
        ? columns.findIndex((col) => col.highlighted)
        : count >= 3 ? 1 : 0

  const cardChrome = (highlighted) => {
    const isCards = variant === 'cards'
    return {
      border: `${large ? 2 : 1}px solid ${highlighted ? theme.accentBorder : isCards ? `color-mix(in srgb, ${theme.text} 22%, transparent)` : `color-mix(in srgb, ${theme.text} 12%, transparent)`}`,
      background: highlighted ? theme.accentSoft : 'transparent',
      borderRadius: large ? 12 : 4,
      padding: large ? '14px 12px' : '4px 3px',
      boxShadow: isCards ? (large ? '0 6px 18px color-mix(in srgb, var(--text-main, #000) 10%, transparent)' : '0 2px 6px color-mix(in srgb, var(--text-main, #000) 8%, transparent)') : undefined,
      transform: variant === 'featured' && highlighted ? (large ? 'scale(1.04)' : 'scale(1.03)') : undefined,
      zIndex: variant === 'featured' && highlighted ? 1 : undefined,
    }
  }

  const renderCard = (col, i) => {
    const highlighted = i === highlightIndex
    return (
      <div key={i} style={{
        ...cardChrome(highlighted),
        display: 'flex', flexDirection: 'column', gap: large ? 10 : 3, minWidth: 0,
      }}>
        <div style={{
          alignSelf: 'flex-start', padding: large ? '5px 12px' : '2px 5px', borderRadius: 99,
          background: theme.accentSoft, fontSize: large ? '0.82rem' : '0.3rem', fontWeight: 700,
          color: highlighted ? theme.accent : theme.text,
        }}>
          {col.label}
        </div>
        {col.price && (
          <div style={{ fontSize: large ? '1.85rem' : '0.62rem', fontWeight: 800, color: theme.text, lineHeight: 1 }}>
            {col.price}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 5 : 2 }}>
          {(col.items || []).slice(0, 5).map((item, j) => (
            <div key={j} style={{ display: 'flex', gap: large ? 6 : 2, alignItems: 'flex-start' }}>
              <span style={{ color: theme.muted, fontSize: large ? '0.75rem' : '0.28rem' }}>•</span>
              <span style={{ fontSize: large ? '0.72rem' : '0.28rem', color: theme.muted, lineHeight: 1.35 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (layout === 'split') {
    const side = columns.filter((_, i) => i !== highlightIndex)
    const hero = columns[highlightIndex] || columns[0]
    return (
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: large ? 14 : 4, alignItems: 'stretch', minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(side.length, 1)}, minmax(0, 1fr))`, gap: large ? 10 : 3 }}>
          {side.map((col) => renderCard(col, columns.indexOf(col)))}
        </div>
        <div style={{
          borderRadius: large ? 12 : 4,
          background: `linear-gradient(160deg, ${theme.accentSoft}, color-mix(in srgb, ${theme.accent} 18%, transparent))`,
          border: `1px solid ${theme.accentBorder}`,
          padding: large ? '14px 12px' : '4px 3px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: large ? 8 : 2,
        }}>
          <div style={{ fontSize: large ? '0.82rem' : '0.3rem', fontWeight: 800, color: theme.accent }}>{hero?.label || 'Featured'}</div>
          <div style={{ fontSize: large ? '1.4rem' : '0.55rem', fontWeight: 800, color: theme.text }}>{hero?.price || '$299'}</div>
          <div style={{ fontSize: large ? '0.62rem' : '0.24rem', color: theme.muted }}>Most popular choice</div>
        </div>
      </div>
    )
  }

  if (layout === 'stack') {
    const hero = columns[highlightIndex] || columns[0]
    const rest = columns.filter((_, i) => i !== highlightIndex)
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: large ? 10 : 3, minHeight: 0 }}>
        {renderCard(hero, highlightIndex)}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rest.length}, minmax(0, 1fr))`, gap: large ? 10 : 3 }}>
          {rest.map((col) => renderCard(col, columns.indexOf(col)))}
        </div>
      </div>
    )
  }

  const gridStyle = layout === 'grid'
    ? { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }
    : { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }

  return (
    <div style={{ flex: 1, display: 'grid', ...gridStyle, gap: large ? 14 : 4, alignItems: 'stretch' }}>
      {columns.map((col, i) => renderCard(col, i))}
    </div>
  )
}

function MemberAvatar({ large, size }) {
  const s = size || (large ? 44 : 14)
  return (
    <div style={{ width: s, height: s, borderRadius: '50%', background: theme.imageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: s * 0.45, height: s * 0.45, borderRadius: '50%', background: theme.icon, opacity: 0.5 }} />
    </div>
  )
}

function defaultMembers(count) {
  const pool = [
    { name: 'Johanna Doe', role: 'Co-founder & CEO', email: 'johanna@example.com' },
    { name: 'Jane Doe', role: 'Co-founder & CTO', email: 'jane@example.com' },
    { name: 'Joe Doe', role: 'Co-founder & COO', email: 'joe@example.com' },
    { name: 'Jenny Doe', role: 'President', email: 'jenny@example.com' },
    { name: 'John Doe', role: 'Head of Design', email: 'john@example.com' },
    { name: 'James Doe', role: 'Head of Sales', email: 'james@example.com' },
  ]
  return pool.slice(0, count)
}

function ContactPanel({ previewHints, large }) {
  const heading = previewHints.slots?.HEADING?.text || 'Contact me'
  const address = previewHints.slots?.CONTACT_ADDRESS?.text || '123 Main Street\nCity, State 12345'
  const phone = previewHints.slots?.CONTACT_PHONE?.text || '+1 (555) 123-4567'
  const email = previewHints.slots?.CONTACT_EMAIL?.text || 'hello@example.com'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 12 : 4, padding: large ? '8% 6%' : '10% 8%', justifyContent: 'center', height: '100%' }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.42rem', fontWeight: 800, color: theme.text }}>{heading}</div>
      {[
        { label: 'Address', value: address },
        { label: 'Phone', value: phone },
        { label: 'Email', value: email },
      ].map(({ label, value }) => (
        <div key={label}>
          <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted, marginBottom: large ? 4 : 1 }}>{label}</div>
          <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.28rem', color: theme.text, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

export function PolishedPricingFourParaPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const variant = previewHints.pricingVariant || 'default'
  const planVariant = variant === 'cards' ? 'cards' : 'default'
  const planLayout = variant === 'grid' ? 'grid' : 'row'
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Choose your plan'}
      </div>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_BODY_FS.large : '0.28rem', color: theme.muted }}>
        {previewHints.bodyText || 'Pick the plan that fits your team.'}
      </div>
      <PlanCards previewHints={previewHints} large={large} count={4} variant={planVariant} layout={planLayout} />
    </div>
  )
}

function comparisonCardsFromTable(headers, rows) {
  const planHeaders = headers.slice(1)
  const priceRow = rows.find((row) => /price/i.test(String(row[0] || ''))) || rows[rows.length - 1]
  return planHeaders.slice(0, 3).map((label, i) => ({
    label,
    price: priceRow?.[i + 1] || '$99',
    items: rows
      .filter((row) => row !== priceRow)
      .slice(0, 4)
      .map((row) => `${row[0]}: ${row[i + 1] || '—'}`),
  }))
}

function ComparisonMatrix({ large, headers, rows }) {
  const featureRows = rows.length ? rows : [
    ['Users', '1', '5', 'Unlimited'],
    ['Storage', '5 GB', '50 GB', '500 GB'],
    ['Support', 'Email', 'Priority', 'Dedicated'],
  ]
  const cols = headers.length ? headers : ['Feature', 'Basic', 'Standard', 'Pro']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 5 : 2, fontSize: large ? '0.58rem' : '0.22rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `1.2fr repeat(${cols.length - 1}, 1fr)`, gap: large ? 4 : 1, fontWeight: 700, color: theme.text }}>
        {cols.map((h) => <div key={h} style={{ padding: large ? '4px 6px' : '1px 2px', background: theme.card, borderRadius: 2, textAlign: h === cols[0] ? 'left' : 'center' }}>{h}</div>)}
      </div>
      {featureRows.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `1.2fr repeat(${cols.length - 1}, 1fr)`, gap: large ? 4 : 1, color: theme.muted }}>
          <div style={{ padding: large ? '4px 6px' : '1px 2px', background: theme.card, borderRadius: 2 }}>{row[0]}</div>
          {row.slice(1, cols.length).map((cell, ci) => {
            const val = String(cell || '').trim()
            const mark = /^(yes|✓|true|included|unlimited|\d)/i.test(val) && !/^no|—|-$/i.test(val) ? '✓' : '—'
            return (
              <div key={ci} style={{ padding: large ? '4px 6px' : '1px 2px', background: theme.card, borderRadius: 2, textAlign: 'center', color: mark === '✓' ? theme.accent : theme.muted, fontWeight: mark === '✓' ? 700 : 400 }}>
                {mark}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function PolishedPricingComparisonTablePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const variant = previewHints.pricingVariant || 'table'
  const headers = previewHints.tableHeaders || ['Feature', 'Basic', 'Standard', 'Pro']
  const rows = previewHints.tableRows || []
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Plan comparison'}
      </div>
      {variant === 'cards' ? (
        <PlanCards
          previewHints={{ ...previewHints, columns: comparisonCardsFromTable(headers, rows) }}
          large={large}
          count={3}
          variant="cards"
        />
      ) : variant === 'matrix' ? (
        <div style={{ flex: 1, background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 10 : 4 }}>
          <ComparisonMatrix large={large} headers={headers} rows={rows} />
        </div>
      ) : (
        <div style={{ flex: 1, background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 10 : 4 }}>
          <TableMini large={large} headers={headers} rows={rows} />
        </div>
      )}
    </div>
  )
}

export {
  PolishedAgendaThreeColumnsPreview,
  PolishedAgendaThreeColumnsHeroPreview,
} from './layoutPolishedPreviewsAgenda.jsx'

export function PolishedContactSplitLeftPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
      <div style={{ minHeight: 0 }}><ImagePh large={large} /></div>
      <ContactPanel previewHints={previewHints} large={large} />
    </div>
  )
}

export function PolishedContactSplitRightPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
      <ContactPanel previewHints={previewHints} large={large} />
      <div style={{ minHeight: 0 }}><ImagePh large={large} /></div>
    </div>
  )
}

export function PolishedContactSplitBottomPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: '0 0 42%', padding: pad(large), display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <ContactPanel previewHints={previewHints} large={large} />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}><ImagePh large={large} /></div>
    </div>
  )
}

function SpeakerBioPanel({ previewHints, large, align = 'left' }) {
  const members = previewHints.members?.length ? previewHints.members : defaultMembers(1)
  const m = members[0] || defaultMembers(1)[0]
  const isCenter = align === 'center'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3, textAlign: isCenter ? 'center' : 'left', alignItems: isCenter ? 'center' : 'flex-start' }}>
      <div style={{ fontSize: large ? '0.82rem' : '0.3rem', fontWeight: 800, color: theme.text }}>{m.name}</div>
      <div style={{ fontSize: large ? '0.62rem' : '0.24rem', color: theme.muted }}>{m.role}</div>
      <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.24rem', color: theme.muted, lineHeight: 1.4 }}>
        {previewHints.slots?.MEMBER_1_BIO?.text || 'Speaker bio with credentials and talk focus.'}
      </div>
    </div>
  )
}

export function PolishedSpeakerBioLeftPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, display: 'grid', gridTemplateColumns: '1fr 1.1fr', height: '100%' }}>
      <div style={{ minHeight: 0 }}><ImagePh large={large} /></div>
      <div style={{ padding: pad(large), display: 'flex', alignItems: 'center' }}>
        <SpeakerBioPanel previewHints={previewHints} large={large} />
      </div>
    </div>
  )
}

export function PolishedSpeakerBioRightPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, display: 'grid', gridTemplateColumns: '1.1fr 1fr', height: '100%' }}>
      <div style={{ padding: pad(large), display: 'flex', alignItems: 'center' }}>
        <SpeakerBioPanel previewHints={previewHints} large={large} />
      </div>
      <div style={{ minHeight: 0 }}><ImagePh large={large} /></div>
    </div>
  )
}

export function PolishedSpeakerBioCenteredPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 10 : 4, height: '100%' }}>
      <div style={{ width: large ? '28%' : '22%', aspectRatio: '1', borderRadius: '50%', overflow: 'hidden' }}>
        <ImagePh large={large} />
      </div>
      <SpeakerBioPanel previewHints={previewHints} large={large} align="center" />
    </div>
  )
}

export function PolishedContactSplitCtaPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const ctaText = previewHints.slots?.CTA?.text || 'Get in touch'
  return (
    <div {...fp} style={{ ...fp.style, display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', padding: pad(large), gap: large ? 12 : 4 }}>
      <ContactPanel previewHints={previewHints} large={large} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 10 : 3, textAlign: 'center' }}>
        <div style={{ fontSize: large ? '0.72rem' : '0.28rem', fontWeight: 800, color: theme.text }}>
          {previewHints.slots?.CTA_HEADING?.text || 'Ready to talk?'}
        </div>
        <div style={{ fontSize: large ? '0.62rem' : '0.24rem', fontWeight: 700, color: theme.accent }}>{ctaText}</div>
      </div>
    </div>
  )
}

export function PolishedTeamThreeHorizontalPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const members = previewHints.members?.length ? previewHints.members.slice(0, 3) : defaultMembers(3)
  const hexClip = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
  return (
    <div {...fp} style={{ ...fp.style, padding: large ? '5% 5%' : '6% 5%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.34rem', fontWeight: 800, color: theme.text, flexShrink: 0 }}>
        {previewHints.slots?.HEADING?.text || 'Meet the team'}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 16 : 5, alignItems: 'stretch' }}>
        {members.map((m, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, paddingTop: large ? 18 : 8, height: '100%' }}>
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: large ? 22 : 10,
              bottom: 0,
              background: theme.bg,
              border: `1px solid ${theme.accentBorder}`,
              borderRadius: large ? 10 : 5,
              boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
            }} />
            <div style={{
              position: 'relative',
              zIndex: 1,
              width: large ? 52 : 22,
              height: large ? 52 : 22,
              background: theme.accent,
              clipPath: hexClip,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ width: '86%', height: '86%', clipPath: hexClip, overflow: 'hidden' }}>
                <ImagePh large={large} />
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: large ? '8px 8px 10px' : '3px 3px 5px', width: '100%' }}>
              <div style={{ fontSize: large ? '0.52rem' : '0.18rem', fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>{m.name}</div>
              <div style={{ fontSize: large ? '0.4rem' : '0.14rem', color: theme.muted, lineHeight: 1.3, marginTop: 2 }}>{m.role}</div>
              <div style={{ fontSize: large ? '0.36rem' : '0.12rem', color: theme.muted, lineHeight: 1.3 }}>{m.email}</div>
              <div style={{ fontSize: large ? '0.38rem' : '0.13rem', color: theme.muted, lineHeight: 1.35, marginTop: large ? 6 : 2 }}>
                {m.bio || previewHints.slots?.[`MEMBER_${i + 1}_BIO`]?.text || 'Short bio about this teammate and what they bring to the work.'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedTeamVerticalListPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const members = previewHints.members?.length ? previewHints.members.slice(0, 3) : defaultMembers(3)
  const hexClip = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
  return (
    <div {...fp} style={{ ...fp.style, display: 'grid', gridTemplateColumns: '1.45fr 1fr', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: large ? '8% 6% 8% 7%' : '8% 5%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ fontSize: large ? '0.72rem' : '0.28rem', fontWeight: 800, color: theme.text, marginBottom: large ? 10 : 4, flexShrink: 0 }}>
          {previewHints.slots?.HEADING?.text || 'Meet the team'}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: large ? 8 : 3 }}>
          {members.map((m, i) => (
            <div key={i} style={{ textAlign: 'right', minWidth: 0 }}>
              <div style={{ fontSize: large ? '0.5rem' : '0.18rem', fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>{m.name}</div>
              <div style={{ fontSize: large ? '0.36rem' : '0.13rem', color: theme.muted, marginTop: 2 }}>{m.role}</div>
              <div style={{ marginLeft: 'auto', marginTop: large ? 6 : 2, width: large ? 28 : 12, height: large ? 2 : 1, background: theme.accent, borderRadius: 1 }} />
              <div style={{ fontSize: large ? '0.32rem' : '0.11rem', color: theme.muted, lineHeight: 1.35, marginTop: large ? 6 : 2 }}>
                {m.bio || 'Short bio about this teammate.'}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', background: theme.accent, height: '100%' }}>
        {members.map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: large ? -26 : -11,
              top: `${14 + i * 28}%`,
              width: large ? 52 : 22,
              height: large ? 52 : 22,
              background: '#fff',
              clipPath: hexClip,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '84%', height: '84%', clipPath: hexClip, overflow: 'hidden' }}>
              <ImagePh large={large} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamGridPreview({ previewHints, large, count, rows }) {
  const members = previewHints.members?.length ? previewHints.members.slice(0, count) : defaultMembers(count)
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: large ? 12 : 4, justifyContent: 'center' }}>
      {rows.map((rowMembers, ri) => (
        <div key={ri} style={{
          display: 'flex', justifyContent: 'center', gap: large ? 20 : 6,
          ...(rowMembers.length < rows[0].length ? { paddingLeft: large ? '12%' : '8%', paddingRight: large ? '12%' : '8%' } : {}),
        }}>
          {rowMembers.map((idx) => {
            const m = members[idx]
            if (!m) return null
            return (
              <div key={idx} style={{ flex: 1, maxWidth: large ? 120 : 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 5 : 2, textAlign: 'center' }}>
                <MemberAvatar large={large} size={large ? 40 : 14} />
                <div style={{ fontSize: large ? '0.52rem' : '0.2rem', fontWeight: 800, color: theme.text }}>{m.name}</div>
                <div style={{ fontSize: large ? '0.46rem' : '0.18rem', color: theme.muted }}>{m.role}</div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function PolishedTeamGridFourPreview(props) {
  const { previewHints, large } = props
  const fp = frameProps(props)
  const members = previewHints.members?.length ? previewHints.members.slice(0, 4) : defaultMembers(4)
  const cards = ['#E11D48', '#EA580C', '#0F766E', '#155E75']
  const radius = large ? 10 : 5
  return (
    <div {...fp} style={{ ...fp.style, padding: large ? '5% 4%' : '6% 4%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0, marginBottom: large ? 8 : 3 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.32rem', fontWeight: 800, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {previewHints.slots?.HEADING?.text || 'Meet the team'}
        </div>
        <div style={{ fontSize: large ? '0.28rem' : '0.11rem', color: theme.text, marginTop: large ? 16 : 6 }}>
          {previewHints.slots?.SUBHEADING?.text || 'Enter your sub headline here.'}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: large ? 10 : 4, alignItems: 'center' }}>
        {members.map((m, i) => {
          const card = cards[i]
          return (
            <div key={i} style={{ position: 'relative', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1.08',
                borderRadius: radius,
                overflow: 'hidden',
                background: `color-mix(in srgb, ${card} 22%, #fff)`,
                border: '1px solid rgba(15,23,42,0.12)',
                boxSizing: 'border-box',
              }}>
                <ImagePh large={large} />
              </div>
              <div style={{
                marginTop: large ? -12 : -5,
                background: card,
                borderRadius: radius,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 4px 10px rgba(15,23,42,0.1)',
              }}>
                <div style={{ padding: large ? '16px 6px 18px' : '7px 2px 8px', textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: large ? '0.36rem' : '0.12rem', fontWeight: 800 }}>{m.name}</div>
                  <div style={{ fontSize: large ? '0.24rem' : '0.09rem', fontStyle: 'italic', opacity: 0.95 }}>({m.role})</div>
                </div>
                <div style={{
                  height: large ? 8 : 4,
                  background: `color-mix(in srgb, ${card} 72%, #000)`,
                  borderRadius: `0 0 ${radius}px ${radius}px`,
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PolishedTeamGridFivePreview(props) {
  const { previewHints, large } = props
  const fp = frameProps(props)
  const members = previewHints.members?.length ? previewHints.members.slice(0, 5) : defaultMembers(5)
  const tints = ['#F472B6', '#FB923C', '#EAB308', '#34D399', '#38BDF8']
  const rows = [[0, 1], [2, 3, 4]]
  const radius = large ? 10 : 5
  const avatar = large ? 36 : 16
  return (
    <div {...fp} style={{ ...fp.style, padding: large ? '5% 6%' : '6% 5%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.34rem', fontWeight: 800, color: theme.text, flexShrink: 0, marginTop: large ? 8 : 4, marginBottom: large ? 10 : 4 }}>
        {previewHints.slots?.HEADING?.text || 'Meet the team'}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: large ? 14 : 6 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', justifyContent: 'stretch', gap: large ? 10 : 4, width: '100%' }}>
            {row.map((idx) => {
              const m = members[idx]
              const tint = tints[idx]
              return (
                <div key={idx} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: large ? 14 : 6 }}>
                  <div style={{
                    width: '100%',
                    marginTop: large ? -2 : 0,
                    background: theme.bg,
                    borderRadius: radius,
                    boxShadow: '0 4px 10px rgba(15,23,42,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    paddingTop: large ? 22 : 10,
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: large ? -14 : -6,
                      width: avatar,
                      height: avatar,
                      borderRadius: '50%',
                      background: tint,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      <div style={{ width: '78%', height: '78%', borderRadius: '50%', overflow: 'hidden' }}>
                        <ImagePh large={large} circle />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: large ? '6px 6px 8px' : '3px 3px 4px', width: '100%' }}>
                      <div style={{ fontSize: large ? '0.32rem' : '0.11rem', fontWeight: 800, color: tint }}>{m.name}</div>
                      <div style={{ fontSize: large ? '0.22rem' : '0.08rem', fontStyle: 'italic', color: theme.muted }}>{m.role}</div>
                      <div style={{ width: large ? 18 : 8, height: large ? 2 : 1, background: tint, margin: large ? '6px auto 6px' : '2px auto 2px', borderRadius: 1 }} />
                      <div style={{ fontSize: large ? '0.2rem' : '0.07rem', color: theme.text, lineHeight: 1.3 }}>
                        {m.bio || previewHints.slots?.[`MEMBER_${idx + 1}_BIO`]?.text || 'Short bio about this teammate.'}
                      </div>
                    </div>
                    <div style={{ height: large ? 8 : 4, width: '100%', background: 'color-mix(in srgb, var(--border-color, #e5e7eb) 80%, #fff)', borderRadius: `0 0 ${radius}px ${radius}px` }} />
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedTeamGridSixPreview(props) {
  const { previewHints, large } = props
  const fp = frameProps(props)
  const members = previewHints.members?.length ? previewHints.members.slice(0, 6) : defaultMembers(6)
  const mixes = [38, 52, 68, 78, 88, 96]
  const radius = large ? 8 : 4
  const avatar = large ? 28 : 12
  return (
    <div {...fp} style={{ ...fp.style, padding: large ? '5% 6%' : '6% 5%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <div style={{ flexShrink: 0, marginBottom: large ? 8 : 3 }}>
        <div style={{ textAlign: 'left', fontSize: large ? PREVIEW_TITLE_FS.large : '0.32rem', fontWeight: 800, color: theme.text }}>
          {previewHints.slots?.HEADING?.text || 'TEAM MEMBERS'}
        </div>
        <div style={{ textAlign: 'left', fontSize: large ? '0.42rem' : '0.14rem', color: theme.muted, marginTop: large ? 2 : 1 }}>
          {previewHints.slots?.SUBHEADING?.text || 'Enter your sub headline here'}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: large ? 10 : 4 }}>
        {members.map((m, i) => {
          const body = `color-mix(in srgb, ${theme.accent} ${mixes[i]}%, ${i < 3 ? '#ffffff' : '#0f172a'})`
          return (
            <div key={i} style={{ position: 'relative', minWidth: 0, paddingTop: large ? 10 : 4, paddingLeft: large ? 8 : 3 }}>
              <div style={{
                height: '100%',
                borderRadius: radius,
                overflow: 'hidden',
                background: body,
                boxShadow: '0 4px 10px rgba(15,23,42,0.12)',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  background: `color-mix(in srgb, ${body} 82%, #000)`,
                  padding: large ? `6px 8px 6px ${avatar + 10}px` : `2px 3px 2px ${avatar + 4}px`,
                  minHeight: large ? 28 : 12,
                }}>
                  <div style={{ fontSize: large ? '0.28rem' : '0.1rem', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>{m.name}</div>
                  <div style={{ fontSize: large ? '0.2rem' : '0.08rem', color: 'rgba(255,255,255,0.86)' }}>{m.role}</div>
                </div>
                <div style={{ flex: 1, padding: large ? '6px 8px' : '2px 3px', fontSize: large ? '0.18rem' : '0.07rem', color: '#fff', lineHeight: 1.3 }}>
                  {m.bio || previewHints.slots?.[`MEMBER_${i + 1}_BIO`]?.text || 'Sample text you can edit.'}
                </div>
              </div>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: avatar,
                height: avatar,
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: `0 0 0 ${large ? 2 : 1}px color-mix(in srgb, ${body} 70%, #fff)`,
              }}>
                <ImagePh large={large} circle />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PolishedTeamFullImageCardsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const members = previewHints.members?.length ? previewHints.members.slice(0, 3) : defaultMembers(3)
  const radius = large ? 12 : 6
  return (
    <div {...fp} style={{ ...fp.style, padding: large ? '6% 6%' : '7% 6%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.34rem', fontWeight: 800, color: theme.text, flexShrink: 0, marginBottom: large ? 12 : 5 }}>
        {previewHints.slots?.HEADING?.text || 'Meet the team'}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 14 : 6, alignContent: 'start' }}>
        {members.map((m, i) => (
          <div key={i} style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: large ? 5 : 2 }}>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: radius, overflow: 'hidden' }}>
              <ImagePh large={large} />
            </div>
            <div style={{ textAlign: 'left', fontSize: large ? '0.34rem' : '0.12rem', fontWeight: 800, color: theme.text, lineHeight: 1.15 }}>{m.name}</div>
            <div style={{ textAlign: 'left', fontSize: large ? '0.24rem' : '0.09rem', color: theme.muted, lineHeight: 1.2 }}>{m.role}</div>
            <div style={{ textAlign: 'left', fontSize: large ? '0.22rem' : '0.08rem', color: theme.muted, lineHeight: 1.2 }}>{m.email}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedTeamByDepartmentPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const departments = previewHints.departments || [
    { heading: 'Leadership', members: defaultMembers(2) },
    { heading: 'Engineering', members: defaultMembers(4).slice(2, 4) },
    { heading: 'Design', members: defaultMembers(6).slice(4, 6) },
  ]
  const bars = [
    'color-mix(in srgb, var(--preview-accent, #4f6f6a) 88%, #0f172a)',
    'var(--preview-accent, #4f6f6a)',
    'color-mix(in srgb, var(--preview-accent, #4f6f6a) 45%, #d4a017)',
  ]
  return (
    <div {...fp} style={{ ...fp.style, padding: large ? '5% 5%' : '6% 5%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <div style={{ flexShrink: 0, marginBottom: large ? 14 : 8 }}>
        <div style={{ textAlign: 'left', fontSize: large ? PREVIEW_TITLE_FS.large : '0.3rem', fontWeight: 800, color: theme.text, lineHeight: 1.15 }}>
          {previewHints.slots?.HEADING?.text || 'Team by department'}
        </div>
        <div style={{ textAlign: 'left', fontSize: large ? '0.36rem' : '0.12rem', color: theme.muted, marginTop: large ? 8 : 4 }}>
          {previewHints.slots?.SUBHEADING?.text || 'The people behind each part of the work.'}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 12 : 5, alignContent: 'center' }}>
        {departments.slice(0, 3).map((dept, di) => (
          <div key={di} style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 3, minWidth: 0 }}>
            <div style={{ fontSize: large ? '0.28rem' : '0.1rem', fontWeight: 800, color: theme.text }}>{dept.heading}</div>
            <div style={{ position: 'relative', paddingLeft: large ? 4 : 2 }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: large ? 10 : 5,
                borderRadius: 0,
                background: bars[di],
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 4, width: large ? '88%' : '90%', marginLeft: large ? 5 : 2 }}>
                {(dept.members || []).slice(0, 2).map((m, mi) => (
                  <div
                    key={mi}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: large ? 8 : 4,
                      minHeight: large ? 56 : 26,
                      marginLeft: large ? 4 : 2,
                      background: `color-mix(in srgb, ${bars[di]} 10%, #ffffff)`,
                      border: `1px solid color-mix(in srgb, ${bars[di]} 35%, #cbd5e1)`,
                      borderRadius: large ? 10 : 6,
                      padding: large ? '10px 12px 10px 4px' : '4px 6px 4px 2px',
                      boxShadow: '0 4px 10px rgba(15,23,42,0.07)',
                    }}
                  >
                    <div style={{
                      width: large ? 36 : 16,
                      height: large ? 36 : 16,
                      borderRadius: 999,
                      overflow: 'hidden',
                      flexShrink: 0,
                      marginLeft: large ? -12 : -6,
                      boxShadow: '0 0 0 2px #fff',
                    }}>
                      <ImagePh large={large} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: large ? '0.24rem' : '0.09rem', fontWeight: 800, color: theme.text, lineHeight: 1.15 }}>{m.name}</div>
                      <div style={{ fontSize: large ? '0.18rem' : '0.07rem', color: bars[di] }}>{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedTeamFeaturedLeadPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const name = previewHints.slots?.MEMBER_1_NAME?.text || previewHints.members?.[0]?.name || 'Johanna Doe'
  const role = previewHints.slots?.MEMBER_1_ROLE?.text || previewHints.members?.[0]?.role || 'Co-founder & CEO'
  const bio = previewHints.slots?.MEMBER_1_BIO?.text || previewHints.members?.[0]?.bio || 'Leads the company with a clear point of view.'
  const accent = 'var(--preview-accent, #4f6f6a)'
  return (
    <div {...fp} style={{ ...fp.style, position: 'relative', overflow: 'hidden', background: `color-mix(in srgb, ${accent} 22%, #ffffff)` }}>
      <div style={{
        position: 'absolute',
        width: '72%',
        height: '150%',
        left: '10%',
        top: '-25%',
        borderRadius: '50%',
        background: '#ffffff',
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1.15fr',
        alignItems: 'center',
        gap: large ? 8 : 4,
        padding: large ? '4% 5% 4% 3%' : '5% 4%',
        boxSizing: 'border-box',
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{
            position: 'absolute',
            height: '86%',
            aspectRatio: '1',
            borderRadius: 999,
            border: `${large ? 5 : 2}px solid color-mix(in srgb, ${accent} 32%, #ffffff)`,
            boxSizing: 'border-box',
          }} />
          <div style={{
            position: 'relative',
            height: '72%',
            aspectRatio: '1',
            borderRadius: 999,
            overflow: 'hidden',
          }}>
            <ImagePh large={large} circle fillIcon />
          </div>
          <div style={{
            position: 'absolute',
            left: '70%',
            top: '62%',
            height: '11%',
            aspectRatio: '1',
            borderRadius: 999,
            background: accent,
          }} />
        </div>
        <div style={{ minWidth: 0, paddingRight: large ? '2%' : 0 }}>
          <div style={{ fontSize: large ? '0.78rem' : '0.24rem', fontWeight: 700, letterSpacing: 1.6, color: accent }}>
            {(previewHints.slots?.HEADING?.text || 'Leadership').toUpperCase()}
          </div>
          <div style={{ fontSize: large ? '1.2rem' : '0.38rem', fontWeight: 800, color: theme.text, marginTop: large ? 8 : 3, lineHeight: 1.05 }}>
            {String(name).toUpperCase()}
          </div>
          <div style={{ fontSize: large ? '0.78rem' : '0.24rem', color: theme.text, opacity: 0.72, marginTop: large ? 8 : 3, lineHeight: 1.2 }}>
            {String(role).toUpperCase()}
          </div>
          <div style={{
            fontSize: large ? '0.72rem' : '0.22rem',
            color: theme.text,
            opacity: 0.62,
            marginTop: large ? 12 : 5,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{bio}</div>
        </div>
      </div>
    </div>
  )
}

export function PolishedTeamOrgSimplePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const names = [
    previewHints.slots?.MEMBER_1_NAME?.text || 'Jonas',
    previewHints.slots?.MEMBER_2_NAME?.text || 'Maria',
    previewHints.slots?.MEMBER_3_NAME?.text || 'Harry',
    previewHints.slots?.MEMBER_4_NAME?.text || 'Warner',
    previewHints.slots?.MEMBER_5_NAME?.text || 'Zenda',
    previewHints.slots?.MEMBER_6_NAME?.text || 'Tony',
    previewHints.slots?.MEMBER_7_NAME?.text || 'Peter',
  ]
  const roles = [
    previewHints.slots?.MEMBER_1_ROLE?.text || 'Designation',
    previewHints.slots?.MEMBER_2_ROLE?.text || 'Designation',
    previewHints.slots?.MEMBER_3_ROLE?.text || 'Designation',
    previewHints.slots?.MEMBER_4_ROLE?.text || 'Designation',
    previewHints.slots?.MEMBER_5_ROLE?.text || 'Designation',
    previewHints.slots?.MEMBER_6_ROLE?.text || 'Designation',
    previewHints.slots?.MEMBER_7_ROLE?.text || 'Designation',
  ]
  const colors = ['#E85A3C', '#5BA3E0', '#5BA3E0', '#F08A3A', '#F08A3A', '#8B6BC9', '#8B6BC9']
  const avatar = large ? 42 : 16
  const node = (i) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: large ? 58 : 26 }}>
      <div style={{
        width: avatar,
        height: avatar,
        borderRadius: 999,
        overflow: 'hidden',
        boxShadow: `0 0 0 ${large ? 3 : 1.5}px #fff, 0 0 0 ${large ? 6 : 3}px ${colors[i]}`,
      }}>
        <ImagePh large={large} circle />
      </div>
      <div style={{ marginTop: large ? 6 : 2, fontSize: large ? '0.2rem' : '0.07rem', fontWeight: 800, color: theme.text, lineHeight: 1.1, textAlign: 'center' }}>{names[i]}</div>
      <div style={{ fontSize: large ? '0.16rem' : '0.06rem', color: theme.muted, textAlign: 'center' }}>{roles[i]}</div>
    </div>
  )
  return (
    <div {...fp} style={{ ...fp.style, background: '#ffffff', display: 'grid', gridTemplateColumns: '0.28fr 1fr', alignItems: 'center', padding: large ? '6% 4%' : '5% 3%' }}>
      <div style={{ fontSize: large ? '0.34rem' : '0.12rem', fontWeight: 800, color: theme.text, lineHeight: 1.15, paddingRight: large ? 8 : 3 }}>
        {previewHints.slots?.HEADING?.text || 'Team Structure'}
      </div>
      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
        <svg viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} fill="none">
          <path d="M48 70 Q 78 28 108 28" stroke="#5BA3E0" strokeWidth="1.6" />
          <path d="M48 70 L 108 70" stroke="#F08A3A" strokeWidth="1.6" />
          <path d="M48 70 Q 78 112 108 112" stroke="#8B6BC9" strokeWidth="1.6" />
          <path d="M128 28 H 168" stroke="#5BA3E0" strokeWidth="1.6" />
          <path d="M128 70 H 168" stroke="#F08A3A" strokeWidth="1.6" />
          <path d="M128 112 H 168" stroke="#8B6BC9" strokeWidth="1.6" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '0.7fr 1fr 1fr', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>{node(0)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: large ? 188 : 88, alignItems: 'center' }}>
            {node(1)}
            {node(3)}
            {node(5)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: large ? 188 : 88, alignItems: 'center' }}>
            {node(2)}
            {node(4)}
            {node(6)}
          </div>
        </div>
      </div>
    </div>
  )
}

export const PEOPLE_PRICING_PREVIEW_MODES = {
  pricing_four_para: PolishedPricingFourParaPreview,
  pricing_comparison_table: PolishedPricingComparisonTablePreview,
  contact_split_left: PolishedContactSplitLeftPreview,
  contact_split_right: PolishedContactSplitRightPreview,
  contact_split_bottom: PolishedContactSplitBottomPreview,
  contact_split_cta: PolishedContactSplitCtaPreview,
  speaker_bio_left: PolishedSpeakerBioLeftPreview,
  speaker_bio_right: PolishedSpeakerBioRightPreview,
  speaker_bio_centered: PolishedSpeakerBioCenteredPreview,
  team_three_horizontal: PolishedTeamThreeHorizontalPreview,
  team_vertical_list: PolishedTeamVerticalListPreview,
  team_grid_four: PolishedTeamGridFourPreview,
  team_grid_five: PolishedTeamGridFivePreview,
  team_grid_six: PolishedTeamGridSixPreview,
  team_full_image_cards: PolishedTeamFullImageCardsPreview,
  team_by_department: PolishedTeamByDepartmentPreview,
  team_featured_lead: PolishedTeamFeaturedLeadPreview,
  team_org_simple: PolishedTeamOrgSimplePreview,
}
