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

function ImagePh({ large, circle, hero = false }) {
  return (
    <div style={previewImageFrameStyle({ large, circle, hero })}>
      <PreviewImageIcon large={large} />
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

function PlanCards({ previewHints, large, count = 3 }) {
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

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, gap: large ? 14 : 4, alignItems: 'stretch' }}>
      {columns.map((col, i) => {
        const highlighted = i === highlightIndex
        return (
          <div key={i} style={{
            border: `${large ? 2 : 1}px solid ${highlighted ? theme.accentBorder : `color-mix(in srgb, ${theme.text} 12%, transparent)`}`,
            background: highlighted ? theme.accentSoft : 'transparent',
            borderRadius: large ? 12 : 4, padding: large ? '14px 12px' : '4px 3px',
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
      })}
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
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Choose your plan'}
      </div>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_BODY_FS.large : '0.28rem', color: theme.muted }}>
        {previewHints.bodyText || 'Pick the plan that fits your team.'}
      </div>
      <PlanCards previewHints={previewHints} large={large} count={4} />
    </div>
  )
}

export function PolishedPricingComparisonTablePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const headers = previewHints.tableHeaders || ['Feature', 'Basic', 'Standard', 'Pro']
  const rows = previewHints.tableRows || []
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Plan comparison'}
      </div>
      <div style={{ flex: 1, background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 10 : 4 }}>
        <TableMini large={large} headers={headers} rows={rows} />
      </div>
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
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 14 : 4 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Meet the team'}
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 12 : 3, alignItems: 'start' }}>
        {members.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 6 : 2, textAlign: 'center' }}>
            <MemberAvatar large={large} size={large ? 48 : 16} />
            <div style={{ fontSize: large ? '0.58rem' : '0.22rem', fontWeight: 800, letterSpacing: '0.06em', color: theme.text, textTransform: 'uppercase' }}>{m.name}</div>
            <div style={{ fontSize: large ? '0.52rem' : '0.2rem', fontWeight: 700, color: theme.text, opacity: 0.85 }}>{m.role}</div>
            <div style={{ fontSize: large ? '0.48rem' : '0.18rem', color: theme.muted }}>{m.email}</div>
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
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: large ? 16 : 4, alignItems: 'center' }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>
        {previewHints.slots?.HEADING?.text || 'Management and leadership'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 14 : 4 }}>
        {members.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: large ? 10 : 3, alignItems: 'center' }}>
            <MemberAvatar large={large} size={large ? 40 : 14} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: large ? '0.62rem' : '0.24rem', fontWeight: 800, color: theme.text }}>{m.name}</div>
              <div style={{ fontSize: large ? '0.54rem' : '0.2rem', fontWeight: 700, color: theme.text, opacity: 0.85 }}>{m.role}</div>
              <div style={{ fontSize: large ? '0.48rem' : '0.18rem', color: theme.muted }}>{m.email}</div>
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
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Meet the team'}
      </div>
      <TeamGridPreview previewHints={previewHints} large={large} count={4} rows={[[0, 1], [2, 3]]} />
    </div>
  )
}

export function PolishedTeamGridFivePreview(props) {
  const { previewHints, large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Meet the team'}
      </div>
      <TeamGridPreview previewHints={previewHints} large={large} count={5} rows={[[0, 1, 2], [3, 4]]} />
    </div>
  )
}

export function PolishedTeamGridSixPreview(props) {
  const { previewHints, large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Meet the team'}
      </div>
      <TeamGridPreview previewHints={previewHints} large={large} count={6} rows={[[0, 1, 2], [3, 4, 5]]} />
    </div>
  )
}

export function PolishedTeamFullImageCardsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const members = previewHints.members?.length ? previewHints.members.slice(0, 3) : defaultMembers(3)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Meet the team'}
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 12 : 3 }}>
        {members.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
            <div style={{ flex: 1, minHeight: large ? 80 : 28 }}><ImagePh large={large} /></div>
            <div style={{ textAlign: 'center', fontSize: large ? '0.58rem' : '0.22rem', fontWeight: 800, color: theme.text }}>{m.name}</div>
            <div style={{ textAlign: 'center', fontSize: large ? '0.48rem' : '0.18rem', color: theme.muted }}>{m.role}</div>
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
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ textAlign: 'center', fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text }}>
        {previewHints.slots?.HEADING?.text || 'Team by department'}
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 12 : 3 }}>
        {departments.slice(0, 3).map((dept, di) => (
          <div key={di} style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
            <div style={{ fontSize: large ? '0.72rem' : '0.28rem', fontWeight: 800, color: theme.text }}>{dept.heading}</div>
            {(dept.members || []).slice(0, 2).map((m, mi) => (
              <div key={mi} style={{ display: 'flex', gap: large ? 8 : 2, alignItems: 'center' }}>
                <MemberAvatar large={large} size={large ? 32 : 12} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: large ? '0.52rem' : '0.2rem', fontWeight: 700, color: theme.text }}>{m.name}</div>
                  <div style={{ fontSize: large ? '0.44rem' : '0.16rem', color: theme.muted }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
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
}
