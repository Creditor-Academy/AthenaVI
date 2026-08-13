/**
 * Extended polished layout previews for Grids + Charts & data catalog.
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

function ImagePh({ large, hero = false }) {
  return (
    <div style={previewImageFrameStyle({ large, hero })}>
      <PreviewImageIcon large={large} />
    </div>
  )
}

function BarChart({ large, values = [45, 62, 78, 91] }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: large ? 8 : 3, height: '100%', padding: large ? '8px 4px' : '2px 1px' }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '70%', height: `${(v / max) * 100}%`, minHeight: large ? 8 : 3, background: theme.accent, borderRadius: large ? 4 : 2, opacity: 0.85 }} />
        </div>
      ))}
    </div>
  )
}

function DonutChart({ large }) {
  const size = large ? 80 : 28
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="none" stroke={theme.card} strokeWidth="6" />
        <circle cx="18" cy="18" r="14" fill="none" stroke={theme.accent} strokeWidth="6" strokeDasharray="55 100" transform="rotate(-90 18 18)" />
      </svg>
    </div>
  )
}

function TableMini({ large, headers = ['A', 'B', 'C'], rows = 3 }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: large ? 4 : 1, fontSize: large ? '0.62rem' : '0.22rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`, gap: large ? 4 : 1, fontWeight: 700, color: theme.text }}>
        {headers.map((h) => <div key={h} style={{ padding: large ? '4px 6px' : '1px 2px', background: theme.card, borderRadius: 2 }}>{h}</div>)}
      </div>
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`, gap: large ? 4 : 1, color: theme.muted }}>
          {headers.map((h, ci) => (
            <div key={h} style={{ padding: large ? '4px 6px' : '1px 2px', background: theme.card, borderRadius: 2 }}>
              {ci === 0 ? `Row ${ri + 1}` : '—'}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function DeviceFrame({ kind, large, children }) {
  const isPhone = kind === 'phone'
  const border = large ? 6 : 3
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: large ? 8 : 3 }}>
      <div style={{
        width: isPhone ? '55%' : '90%',
        height: isPhone ? '95%' : '75%',
        borderRadius: isPhone ? (large ? 18 : 8) : (large ? 10 : 4),
        border: `${border}px solid #0f172a`,
        outline: `${large ? 3 : 1.5}px solid #334155`,
        outlineOffset: large ? -2 : -1,
        background: '#f8fafc',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
      }}>
        {!isPhone && <div style={{ height: large ? 10 : 4, background: '#334155', flexShrink: 0 }} />}
        <div style={{ flex: 1, minHeight: 0 }}>{children || <ImagePh large={large} />}</div>
        {isPhone && (
          <div style={{ height: large ? 8 : 3, background: '#cbd5e1', flexShrink: 0, margin: '0 auto 4px', width: '30%', borderRadius: 99 }} />
        )}
      </div>
    </div>
  )
}

function pad(large) {
  return large ? '6% 5%' : '8% 5%'
}

export function PolishedGridBentoThreePreview(props) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gridTemplateRows: '1fr 1fr', gap: large ? 10 : 3 }}>
      <div style={{ gridRow: '1 / 2' }}><ImagePh large={large} /></div>
      <div style={{ gridRow: '2 / 3' }}><ImagePh large={large} /></div>
      <div style={{ gridColumn: '2', gridRow: '1 / 3' }}><ImagePh large={large} /></div>
    </div>
  )
}

export function PolishedGridBentoFourPreview(props) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: large ? 10 : 3 }}>
      <div><ImagePh large={large} /></div>
      <div><ImagePh large={large} /></div>
      <div><ImagePh large={large} /></div>
      <div><ImagePh large={large} /></div>
    </div>
  )
}

export function PolishedGridSixImagesPreview(props) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: large ? 10 : 3 }}>
      {[1, 2, 3, 4, 5, 6].map((n) => <div key={n}><ImagePh large={large} /></div>)}
    </div>
  )
}

export function PolishedGridTextImageCardsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'auto 1fr', gap: large ? 10 : 3 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.featureTitle || 'Describe this feature'}</div>
        <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted }}>{previewHints.featureBody || 'Explain what this section is about.'}</div>
      </div>
      <div style={{ background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 8 : 3, display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
        <div style={{ fontSize: large ? '0.72rem' : '0.28rem', fontWeight: 700, color: theme.text }}>{previewHints.pointTitle || 'Describe this point'}</div>
        <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted }}>{previewHints.pointBody || 'Explain what this section is about.'}</div>
        <div style={{ flex: 1, minHeight: large ? 40 : 14, borderRadius: '50%', overflow: 'hidden', maxHeight: large ? 56 : 20, alignSelf: 'center', width: large ? 56 : 20 }}><ImagePh large={large} /></div>
      </div>
      <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 10 : 3 }}>
        {[1, 2, 3].map((n) => <div key={n} style={{ minHeight: large ? 60 : 20 }}><ImagePh large={large} /></div>)}
      </div>
    </div>
  )
}

export function PolishedGridThreeImagesTextPreview({ previewHints, ...props }) {
  const { large } = props
  const cols = previewHints.columns || [{ body: 'Text one' }, { body: 'Text two' }, { body: 'Text three' }]
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 10 : 3, flex: 1 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ minHeight: large ? 70 : 22 }}><ImagePh large={large} /></div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 10 : 3 }}>
        {cols.slice(0, 3).map((c, i) => (
          <div key={i} style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted, lineHeight: 1.3 }}>{c.body}</div>
        ))}
      </div>
    </div>
  )
}

export function PolishedGridImagesTextCardsPreview({ previewHints, ...props }) {
  const { large } = props
  const cols = previewHints.columns || [{ title: 'Feature A', body: 'Body' }, { title: 'Feature B', body: 'Body' }, { title: 'Feature C', body: 'Body' }]
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 10 : 3 }}>
      {cols.slice(0, 3).map((col, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
          <div style={{ flex: 1, minHeight: large ? 60 : 20 }}><ImagePh large={large} /></div>
          <div style={{ fontSize: large ? '0.68rem' : '0.26rem', fontWeight: 700, color: theme.text }}>{col.title}</div>
          <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted }}>{col.body}</div>
        </div>
      ))}
    </div>
  )
}

export function PolishedGridMetricsMobilePreview({ previewHints, ...props }) {
  const { large } = props
  const stats = previewHints.stats || [{ value: '100k', label: 'Metric' }, { value: '95%', label: 'Metric' }]
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '2fr 1fr', gap: large ? 12 : 4 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.FEATURE_TITLE?.text || 'Describe this feature'}</div>
        <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted }}>{previewHints.slots?.FEATURE_BODY?.text || 'Supporting copy.'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 10 : 3 }}>
          {stats.slice(0, 2).map((s, i) => (
            <div key={i} style={{ background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 10 : 4, textAlign: 'center' }}>
              <div style={{ fontSize: large ? '1.2rem' : '0.42rem', fontWeight: 800, color: theme.accent }}>{s.value}</div>
              <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <DeviceFrame kind="phone" large={large}><ImagePh large={large} /></DeviceFrame>
    </div>
  )
}

export function PolishedGridMetricsMasonryPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const stats = Array.isArray(previewHints.stats) && previewHints.stats.length
    ? previewHints.stats
    : [
        { value: '100k', label: 'Explain the meaning of this metric' },
        { value: '95%', label: 'Explain the meaning of this metric' },
      ]
  const statBottom = stats[0] || { value: '100k', label: 'Explain the meaning of this metric' }
  const statTop = stats[1] || { value: '95%', label: 'Explain the meaning of this metric' }
  const columns = Array.isArray(previewHints.columns) ? previewHints.columns : []
  const featLeft = {
    title: previewHints.slots?.METRIC_TITLE_1?.text || columns[0]?.title || 'Describe this feature',
    body: previewHints.slots?.METRIC_BODY_1?.text || columns[0]?.body || 'Explain what this section is about.',
  }
  const featRight = {
    title: previewHints.slots?.METRIC_TITLE_3?.text || columns[2]?.title || columns[1]?.title || 'Describe this feature',
    body: previewHints.slots?.METRIC_BODY_3?.text || columns[2]?.body || columns[1]?.body || 'Explain what this section is about.',
  }
  const slotSrc = (slotId) => previewHints.slots?.[slotId]?.imageUrl || previewHints.imageUrl || ''
  const gap = large ? 8 : 3
  const cardStyle = {
    background: `linear-gradient(165deg, ${theme.accentSoft}, ${theme.card})`,
    borderRadius: large ? 12 : 4,
    padding: large ? 10 : 3,
    display: 'flex',
    minHeight: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
  }
  const statCardStyle = {
    ...cardStyle,
    background: theme.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: large ? 12 : 4,
  }
  const featureCardStyle = {
    ...cardStyle,
    flexDirection: 'column',
    gap: large ? 6 : 2,
  }
  return (
    <div {...fp} style={{
      ...fp.style,
      padding: pad(large),
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gridTemplateRows: `auto repeat(4, minmax(0, 1fr))`,
      gridTemplateAreas:
        '"head head head head"'
        + ' "featL featL statT statT"'
        + ' "featL featL sq featR"'
        + ' "statB statB statB featR"'
        + ' "statB statB statB featR"',
      gap,
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ gridArea: 'head', fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text, marginBottom: large ? 4 : 1 }}>
        {previewHints.slots?.HEADING?.text || 'Performance highlights'}
      </div>
      <div style={{ ...featureCardStyle, gridArea: 'featL' }}>
        <div style={{ fontSize: large ? '0.72rem' : '0.28rem', fontWeight: 700, color: theme.text }}>{featLeft.title}</div>
        <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted, lineHeight: 1.35 }}>{featLeft.body}</div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}><PreviewImage large={large} src={slotSrc('METRIC_IMAGE_1')} /></div>
      </div>
      <div style={{ ...statCardStyle, gridArea: 'statT' }}>
        <div style={{ fontSize: large ? '1.4rem' : '0.48rem', fontWeight: 800, color: theme.accent, lineHeight: 1, flexShrink: 0 }}>{statTop.value}</div>
        <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted, lineHeight: 1.35 }}>{statTop.label}</div>
      </div>
      <div style={{ ...cardStyle, gridArea: 'sq', padding: large ? 6 : 2 }}>
        <PreviewImage large={large} src={slotSrc('METRIC_IMAGE_2')} />
      </div>
      <div style={{ ...statCardStyle, gridArea: 'statB' }}>
        <div style={{ fontSize: large ? '1.4rem' : '0.48rem', fontWeight: 800, color: theme.accent, lineHeight: 1, flexShrink: 0 }}>{statBottom.value}</div>
        <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted, lineHeight: 1.35 }}>{statBottom.label}</div>
      </div>
      <div style={{ ...featureCardStyle, gridArea: 'featR' }}>
        <div style={{ fontSize: large ? '0.72rem' : '0.28rem', fontWeight: 700, color: theme.text }}>{featRight.title}</div>
        <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted, lineHeight: 1.35 }}>{featRight.body}</div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}><PreviewImage large={large} src={slotSrc('METRIC_IMAGE_3')} /></div>
      </div>
    </div>
  )
}

export function PolishedGridDeviceMockupsPreview(props) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 10 : 3 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
        {[1, 2].map((n) => (
          <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: large ? 4 : 2 }}>
            <div style={{ fontSize: large ? '0.68rem' : '0.26rem', fontWeight: 700, color: theme.text }}>Describe this feature</div>
            <div style={{ flex: 1, minHeight: large ? 50 : 16 }}><DeviceFrame kind="laptop" large={large}><ImagePh large={large} /></DeviceFrame></div>
          </div>
        ))}
      </div>
      <DeviceFrame kind="phone" large={large}><ImagePh large={large} /></DeviceFrame>
    </div>
  )
}

export function PolishedChartDualPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Compare metrics'}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 10 : 3 }}>
        {[1, 2].map((n) => (
          <div key={n} style={{ background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 8 : 3, minHeight: large ? 80 : 28 }}><BarChart large={large} /></div>
        ))}
      </div>
    </div>
  )
}

export function PolishedChartTriplePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Three views'}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 8 : 3 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 6 : 2, minHeight: large ? 70 : 24 }}><BarChart large={large} values={[40, 70, 55, 90]} /></div>
        ))}
      </div>
    </div>
  )
}

export function PolishedChartCardGridPreview(props) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 10 : 3 }}>
      {[1, 2].map((n) => (
        <div key={n} style={{ background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 10 : 4, display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
          <div style={{ fontSize: large ? '0.72rem' : '0.28rem', fontWeight: 700, color: theme.text }}>{n === 1 ? 'Metric A' : 'Metric B'}</div>
          <div style={{ flex: 1, minHeight: large ? 60 : 20 }}><BarChart large={large} /></div>
          <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted, textAlign: 'center' }}>Caption</div>
        </div>
      ))}
    </div>
  )
}

export function PolishedChartTripleContextPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Quarterly breakdown'}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 8 : 3 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: large ? 4 : 2 }}>
            <div style={{ flex: 1, minHeight: large ? 50 : 18, background: theme.card, borderRadius: large ? 6 : 2 }}><BarChart large={large} values={[30, 50, 40]} /></div>
            <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.2rem', color: theme.muted }}>Context {n}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedChartDonutSplitPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 12 : 4, alignItems: 'center' }}>
      <div style={{ minHeight: large ? 100 : 36 }}><DonutChart large={large} /></div>
      <div>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text, marginBottom: large ? 8 : 3 }}>{previewHints.slots?.HEADING?.text || 'Market share'}</div>
        <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted }}>{previewHints.bodyText || 'Supporting context for the chart.'}</div>
      </div>
    </div>
  )
}

export function PolishedChartDonutRowPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Segment mix'}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: large ? 10 : 3 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ background: theme.card, borderRadius: large ? 8 : 3, minHeight: large ? 70 : 24 }}><DonutChart large={large} /></div>
        ))}
      </div>
    </div>
  )
}

export function PolishedTablePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const headers = previewHints.tableHeaders || ['Column A', 'Column B', 'Column C']
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Data table'}</div>
      <div style={{ flex: 1, background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 10 : 4 }}><TableMini large={large} headers={headers} /></div>
    </div>
  )
}

export function PolishedTableWithDescPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Data table'}</div>
      <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted }}>{previewHints.bodyText || 'Table description.'}</div>
      <div style={{ flex: 1, background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 10 : 4 }}><TableMini large={large} /></div>
    </div>
  )
}

export function PolishedTableDualPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Compare datasets'}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 10 : 3 }}>
        {[1, 2].map((n) => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: large ? 4 : 2 }}>
            <div style={{ flex: 1, background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 8 : 3 }}><TableMini large={large} rows={3} /></div>
            <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : '0.22rem', color: theme.muted }}>Description {n}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedTableDualSharedHeaderPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Side by side'}</div>
      <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.32rem', fontWeight: 700, color: theme.text, textAlign: 'center' }}>{previewHints.slots?.TABLE_HEADER?.text || 'Shared column headers'}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 10 : 3 }}>
        {[1, 2].map((n) => (
          <div key={n} style={{ background: theme.card, borderRadius: large ? 8 : 3, padding: large ? 8 : 3 }}><TableMini large={large} rows={4} /></div>
        ))}
      </div>
    </div>
  )
}

export function PolishedStatHeroPreview({ previewHints, ...props }) {
  const { large } = props
  const stat = (previewHints.stats || [{ value: '98%', label: 'Customer satisfaction' }])[0]
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 12 : 4 }}>
      <div style={{ fontSize: large ? '3.5rem' : '0.9rem', fontWeight: 900, color: theme.accent, lineHeight: 1 }}>{stat.value}</div>
      <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted, textAlign: 'center' }}>{stat.label}</div>
    </div>
  )
}

export function PolishedStatSixParaPreview({ previewHints, ...props }) {
  const { large } = props
  const stats = previewHints.stats || []
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
      <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted }}>{previewHints.bodyText || 'Overview paragraph.'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: large ? 6 : 2 }}>
        {stats.slice(0, 6).map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: large ? '0.9rem' : '0.32rem', fontWeight: 800, color: theme.accent }}>{s.value}</div>
            <div style={{ fontSize: large ? '0.5rem' : '0.18rem', color: theme.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedStatVerticalPreview({ previewHints, ...props }) {
  const { large } = props
  const stats = previewHints.stats || [{ value: '98%', label: 'Sat.' }, { value: '3.2x', label: 'ROI' }, { value: '500+', label: 'Teams' }]
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 12 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem', fontWeight: 800, color: theme.text }}>{previewHints.slots?.HEADING?.text || 'Key metrics'}</div>
      {stats.slice(0, 3).map((s, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 4 : 1, padding: large ? '8px 0' : '2px 0', borderBottom: i < 2 ? `1px solid ${theme.card}` : 'none' }}>
          <div style={{ fontSize: large ? '1.8rem' : '0.55rem', fontWeight: 800, color: theme.accent }}>{s.value}</div>
          <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small, color: theme.muted }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

export const EXTENDED_PREVIEW_MODES = {
  grid_bento_three: PolishedGridBentoThreePreview,
  grid_bento_four: PolishedGridBentoFourPreview,
  grid_six_images: PolishedGridSixImagesPreview,
  grid_text_image_cards: PolishedGridTextImageCardsPreview,
  grid_three_images_text: PolishedGridThreeImagesTextPreview,
  grid_images_text_cards: PolishedGridImagesTextCardsPreview,
  grid_metrics_mobile: PolishedGridMetricsMobilePreview,
  grid_metrics_masonry: PolishedGridMetricsMasonryPreview,
  grid_device_mockups: PolishedGridDeviceMockupsPreview,
  chart_dual: PolishedChartDualPreview,
  chart_triple: PolishedChartTriplePreview,
  chart_card_grid: PolishedChartCardGridPreview,
  chart_triple_context: PolishedChartTripleContextPreview,
  chart_donut_split: PolishedChartDonutSplitPreview,
  chart_donut_row: PolishedChartDonutRowPreview,
  table_preview: PolishedTablePreview,
  table_with_desc: PolishedTableWithDescPreview,
  table_dual: PolishedTableDualPreview,
  table_dual_shared_header: PolishedTableDualSharedHeaderPreview,
  stat_hero: PolishedStatHeroPreview,
  stat_six_para: PolishedStatSixParaPreview,
  stat_vertical: PolishedStatVerticalPreview,
}
