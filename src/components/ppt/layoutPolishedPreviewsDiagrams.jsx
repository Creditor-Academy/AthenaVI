/**
 * Polished layout previews for Diagram catalog (SWOT, funnel, matrix, cycle, venn, process).
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'
import { buildCycleDiagramSvg } from '../../utils/diagramCycleSvg'
import { funnelDiagramInlineSvg, FUNNEL_TITLE_COLORS } from '../../utils/diagramFunnelSvg'
import { PYRAMID_COLORS, pyramidDiagramInlineSvg } from '../../utils/diagramPyramid'
import { SWOT_COLORS, swotDiagramInlineSvg } from '../../utils/diagramSwotSvg'
import { vennPreviewSvg } from '../../utils/diagramVennSvg'

const PREVIEW_TITLE_FS = { large: '1.75rem', small: '0.36rem' }
const PREVIEW_BODY_FS = { large: '0.72rem', small: '0.22rem' }
const PREVIEW_CAPTION_FS = { large: '0.62rem', small: '0.2rem' }

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
  return large ? '7% 6%' : '9% 5%'
}

function slotText(previewHints, slotId, fallback = '') {
  return previewHints?.slots?.[slotId]?.text || fallback
}

function QuadrantCell({ title, body, large, accent = false }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        borderRadius: large ? 8 : 3,
        border: `1px solid ${accent ? theme.accentBorder : 'color-mix(in srgb, var(--border-color) 65%, transparent)'}`,
        background: accent ? theme.accentSoft : theme.card,
        padding: large ? '8px 10px' : '3px 4px',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 4 : 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: large ? '0.78rem' : '0.28rem',
          fontWeight: 700,
          color: accent ? theme.accent : theme.text,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </div>
      {body && (
        <div
          style={{
            fontSize: large ? PREVIEW_BODY_FS.large : PREVIEW_BODY_FS.small,
            color: theme.muted,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: large ? 2 : 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {body}
        </div>
      )}
    </div>
  )
}

export function PolishedDiagramQuadrantsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Diagram title')
  const quadrants = Array.isArray(previewHints.quadrants) && previewHints.quadrants.length
    ? previewHints.quadrants.slice(0, 4)
    : [
        { title: 'Quadrant A', body: 'Key point' },
        { title: 'Quadrant B', body: 'Key point' },
        { title: 'Quadrant C', body: 'Key point' },
        { title: 'Quadrant D', body: 'Key point' },
      ]
  const cycle = previewHints.diagramVariant === 'cycle'

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 10 : 3,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          lineHeight: 1.15,
          flexShrink: 0,
        }}
      >
        {heading}
      </div>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: large ? 8 : 3,
          minHeight: 0,
          position: 'relative',
        }}
      >
        {quadrants.map((q, i) => (
          <QuadrantCell key={i} title={q.title} body={q.body} large={large} accent={i === 0} />
        ))}
        {cycle && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: large ? 28 : 10,
              height: large ? 28 : 10,
              borderRadius: '50%',
              border: `2px solid ${theme.accentBorder}`,
              background: theme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: large ? '0.55rem' : '0.18rem',
              color: theme.accent,
              fontWeight: 700,
            }}
          >
            ↻
          </div>
        )}
      </div>
    </div>
  )
}

export function PolishedDiagramSwotPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'SWOT analysis')
  const quadrants = Array.isArray(previewHints.quadrants) && previewHints.quadrants.length
    ? previewHints.quadrants.slice(0, 4)
    : [
        { title: 'Strengths', body: 'Key strengths' },
        { title: 'Weaknesses', body: 'Areas to improve' },
        { title: 'Opportunities', body: 'Market opportunities' },
        { title: 'Threats', body: 'External risks' },
      ]

  if (previewHints.diagramVariant === 'cards') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: large ? 8 : 3, minHeight: 0 }}>
          {quadrants.map((q, i) => (
            <QuadrantCell key={i} title={q.title} body={q.body} large={large} accent={i === 0} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 8 : 3,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          flexShrink: 0,
        }}
      >
        {heading}
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0, gap: large ? 10 : 4 }}>
        <div
          style={{ width: '46%', minWidth: 0, display: 'flex' }}
          dangerouslySetInnerHTML={{ __html: swotDiagramInlineSvg() }}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
          {quadrants.map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: large ? 8 : 3, minWidth: 0 }}>
              <div
                style={{
                  width: large ? 22 : 10,
                  height: large ? 22 : 10,
                  borderRadius: large ? 6 : 2,
                  background: SWOT_COLORS[i],
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: large ? '0.62rem' : '0.22rem', fontWeight: 800, color: SWOT_COLORS[i], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {q.title}
                </div>
                {q.body && (
                  <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {q.body}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PolishedDiagramFunnelPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Funnel')
  const tiers = Array.isArray(previewHints.funnelTiers) && previewHints.funnelTiers.length
    ? previewHints.funnelTiers.slice(0, 4)
    : [1, 2, 3, 4].map((n) => ({ title: `Stage ${n}`, body: 'Brief note' }))
  const variant = previewHints.diagramVariant
  const stacked = variant === 'stacked'
  const horizontal = variant === 'horizontal'

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 10 : 3,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          flexShrink: 0,
        }}
      >
        {heading}
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: stacked ? 'column' : horizontal ? 'column' : 'row',
          alignItems: 'stretch',
          gap: large ? 10 : 4,
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: stacked || horizontal ? '100%' : '46%',
            minWidth: 0,
            minHeight: stacked || horizontal ? (large ? 80 : 32) : undefined,
            display: 'flex',
          }}
          dangerouslySetInnerHTML={{ __html: funnelDiagramInlineSvg() }}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
          {tiers.map((tier, i) => (
            <div key={i} style={{ minWidth: 0 }}>
              <div style={{ fontSize: large ? '0.7rem' : '0.24rem', fontWeight: 700, color: FUNNEL_TITLE_COLORS[i], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tier.title}
              </div>
              {tier.body && (
                <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tier.body}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PolishedDiagramPyramidPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Priority pyramid')
  const tiers = Array.isArray(previewHints.funnelTiers) && previewHints.funnelTiers.length
    ? previewHints.funnelTiers.slice(0, 5)
    : [1, 2, 3, 4, 5].map((n) => ({ title: `Title ${String(n).padStart(2, '0')}`, body: 'Brief note' }))

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 8 : 3,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          flexShrink: 0,
          textAlign: 'left',
        }}
      >
        {heading}
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0, gap: large ? 10 : 4 }}>
        <div
          style={{
            width: '48%',
            minWidth: 0,
            display: 'flex',
            transform: previewHints.diagramVariant === 'inverted' ? 'scaleY(-1)' : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: pyramidDiagramInlineSvg() }}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
          {tiers.map((tier, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: large ? 8 : 3, minWidth: 0 }}>
              <div
                style={{
                  width: large ? 36 : 16,
                  height: large ? 30 : 13,
                  flexShrink: 0,
                  background: PYRAMID_COLORS[i],
                  clipPath: 'polygon(0% 6%, 92% 50%, 0% 94%)',
                  color: '#fff',
                  fontSize: large ? '0.45rem' : '0.16rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: large ? '0.62rem' : '0.22rem', fontWeight: 800, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tier.title}
                </div>
                {tier.body && (
                  <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tier.body}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PolishedDiagramVennPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Overlap model')
  const sets = Array.isArray(previewHints.vennSets) && previewHints.vennSets.length
    ? previewHints.vennSets.slice(0, 3)
    : [
        { title: 'Set A', body: 'Area A' },
        { title: 'Set B', body: 'Area B' },
        { title: 'Set C', body: 'Area C' },
      ]

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 6 : 2,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          flexShrink: 0,
        }}
      >
        {heading}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }} dangerouslySetInnerHTML={{ __html: vennPreviewSvg() }} />
      <div style={{ display: 'flex', gap: large ? 8 : 3 }}>
        {sets.map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
            <div style={{ fontSize: large ? '0.58rem' : '0.2rem', fontWeight: 800, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.title}
            </div>
            {s.body && (
              <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.body}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedDiagramProcessStepsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Process steps')
  const steps = Array.isArray(previewHints.steps) && previewHints.steps.length
    ? previewHints.steps.slice(0, 4)
    : [
        { title: '1. Start', body: 'Begin' },
        { title: '2. Plan', body: 'Design' },
        { title: '3. Execute', body: 'Build' },
        { title: '4. Review', body: 'Iterate' },
      ]
  const count = Math.min(steps.length, 4)
  const vertical = previewHints.diagramVariant === 'vertical'
  const node = large ? 22 : 10
  const cardBg = 'color-mix(in srgb, #c4b5a0 22%, var(--preview-bg, #ffffff))'

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 18 : 6,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {heading}
      </div>
      <div
        style={{
          position: 'relative',
          height: vertical ? 'auto' : large ? 64 : 24,
          flexShrink: 0,
          margin: large ? '2px 4%' : '1px 2%',
          display: vertical ? 'flex' : 'block',
          flexDirection: vertical ? 'column' : undefined,
          gap: vertical ? (large ? 8 : 3) : undefined,
          alignItems: vertical ? 'center' : undefined,
        }}
      >
        {!vertical && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: `${100 / (count * 2)}%`,
            right: `${100 / (count * 2)}%`,
            top: large ? 10 : 4,
            height: large ? 4 : 2,
            background: theme.text,
            opacity: 0.8,
            borderRadius: 2,
          }}
        />
        )}
        <div
          style={{
            position: vertical ? 'relative' : 'absolute',
            inset: vertical ? undefined : 0,
            display: 'grid',
            gridTemplateColumns: vertical ? '1fr' : `repeat(${count}, minmax(0, 1fr))`,
            alignItems: 'start',
            gap: vertical ? (large ? 8 : 3) : undefined,
          }}
        >
          {steps.slice(0, count).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 3 : 1 }}>
              <div
                style={{
                  width: node,
                  height: node,
                  borderRadius: '50%',
                  background: theme.text,
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  fontSize: large ? '0.62rem' : '0.2rem',
                  fontWeight: 700,
                  color: theme.text,
                  lineHeight: 1,
                }}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: vertical ? '1fr' : `repeat(${count}, minmax(0, 1fr))`,
          gap: large ? 10 : 3,
          minHeight: 0,
        }}
      >
        {steps.slice(0, count).map((step, i) => (
          <div
            key={i}
            style={{
              background: cardBg,
              borderRadius: large ? 10 : 4,
              padding: large ? '18px 14px' : '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: large ? 6 : 2,
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <div
              style={{
                fontSize: large ? '0.78rem' : '0.26rem',
                fontWeight: 700,
                color: theme.text,
                textAlign: 'center',
                lineHeight: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {step.title}
            </div>
            {step.body && (
              <div
                style={{
                  fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small,
                  color: theme.muted,
                  textAlign: 'center',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {step.body}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PolishedDiagramCyclePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Continuous cycle')
  const quadrants = Array.isArray(previewHints.quadrants) && previewHints.quadrants.length
    ? previewHints.quadrants.slice(0, 4)
    : [
        { title: 'Plan', body: 'Define the approach' },
        { title: 'Do', body: 'Put it into action' },
        { title: 'Check', body: 'Measure the result' },
        { title: 'Act', body: 'Improve and repeat' },
      ]

  if (previewHints.diagramVariant === 'horizontal') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, textAlign: 'center' }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: large ? 8 : 3, minHeight: 0 }}>
          {quadrants.map((q, i) => (
            <QuadrantCell key={i} title={q.title} body={q.body} large={large} accent={i === 0} />
          ))}
        </div>
      </div>
    )
  }

  const svg = buildCycleDiagramSvg()
  const labelStyle = {
    fontSize: large ? '0.72rem' : '0.24rem',
    fontWeight: 700,
    color: theme.text,
    lineHeight: 1.2,
  }
  const bodyStyle = {
    fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small,
    color: theme.muted,
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 8 : 2,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {heading}
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr 1fr',
          gap: large ? 8 : 3,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '78%', textAlign: 'right', gap: large ? 16 : 6 }}>
          <div>
            <div style={labelStyle}>{quadrants[3]?.title || 'Act'}</div>
            <div style={bodyStyle}>{quadrants[3]?.body}</div>
          </div>
          <div>
            <div style={labelStyle}>{quadrants[2]?.title || 'Check'}</div>
            <div style={bodyStyle}>{quadrants[2]?.body}</div>
          </div>
        </div>
        <div
          aria-hidden
          style={{ width: '100%', height: '100%', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg style="width:100%;height:100%;max-height:100%;" ') }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '78%', textAlign: 'left', gap: large ? 16 : 6 }}>
          <div>
            <div style={labelStyle}>{quadrants[0]?.title || 'Plan'}</div>
            <div style={bodyStyle}>{quadrants[0]?.body}</div>
          </div>
          <div>
            <div style={labelStyle}>{quadrants[1]?.title || 'Do'}</div>
            <div style={bodyStyle}>{quadrants[1]?.body}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PolishedDiagramMatrixPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', '2×2 matrix')
  const quadrants = Array.isArray(previewHints.quadrants) && previewHints.quadrants.length
    ? previewHints.quadrants.slice(0, 4)
    : [
        { title: 'High impact · Easy', body: 'Key point' },
        { title: 'High impact · Hard', body: 'Key point' },
        { title: 'Low impact · Easy', body: 'Key point' },
        { title: 'Low impact · Hard', body: 'Key point' },
      ]
  const colors = ['#5B8FC4', '#5B8FC4', '#4A7EB0', '#4A7EB0']
  const showAxis = previewHints.diagramVariant !== 'grid'

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 8 : 2,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          flexShrink: 0,
        }}
      >
        {heading}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: large ? 6 : 2 }}>
        {showAxis && <div style={{ width: large ? 14 : 6, borderRadius: 4, background: '#6B9FD4', flexShrink: 0, alignSelf: 'stretch', marginBottom: large ? 16 : 6 }} />}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: large ? 6 : 2, minHeight: 0, position: 'relative' }}>
            {quadrants.map((q, i) => (
              <div
                key={i}
                style={{
                  background: colors[i],
                  borderRadius: large ? 10 : 4,
                  padding: large ? 8 : 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 0,
                }}
              >
                <div style={{ fontSize: large ? '0.62rem' : '0.2rem', fontWeight: 800, color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {q.title}
                </div>
                {q.body && (
                  <div style={{ fontSize: large ? '0.5rem' : '0.16rem', color: 'rgba(255,255,255,0.85)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {q.body}
                  </div>
                )}
              </div>
            ))}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: large ? 36 : 14,
                height: large ? 36 : 14,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              }}
            />
          </div>
          {showAxis && <div style={{ height: large ? 14 : 6, borderRadius: 4, background: '#6B9FD4', flexShrink: 0 }} />}
        </div>
      </div>
    </div>
  )
}

export const DIAGRAM_PREVIEW_MODES = {
  diagram_quadrants: PolishedDiagramQuadrantsPreview,
  diagram_swot: PolishedDiagramSwotPreview,
  diagram_matrix: PolishedDiagramMatrixPreview,
  diagram_funnel: PolishedDiagramFunnelPreview,
  diagram_pyramid: PolishedDiagramPyramidPreview,
  diagram_venn: PolishedDiagramVennPreview,
  diagram_process_steps: PolishedDiagramProcessStepsPreview,
  diagram_cycle: PolishedDiagramCyclePreview,
}
