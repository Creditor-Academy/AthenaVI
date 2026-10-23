/**
 * Polished layout previews for Diagram catalog (SWOT, funnel, matrix, cycle, venn, process).
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'
import { buildCycleDiagramSvg, cycleNodePalette, cycleNodeTopArcSvg, cycleNodeBotArcSvg, cycleNodeIconSvg, cycleRingPreviewSvg, CYCLE_RING_COLORS } from '../../utils/diagramCycleSvg'
import { funnelDiagramInlineSvg, FUNNEL_TITLE_COLORS, FUNNEL_STAGE_COLORS, funnelHPreviewSvg } from '../../utils/diagramFunnelSvg'
import { MATRIX_GRID_COLORS, MATRIX_Q_TINTS, MATRIX_Q_TITLE, MATRIX_Q_AXIS } from '../../utils/diagramMatrixSvg'
import { PYRAMID_COLORS, pyramidDiagramInlineSvg } from '../../utils/diagramPyramid'
import { SWOT_COLORS, swotDiagramInlineSvg } from '../../utils/diagramSwotSvg'
import { vennPreviewSvg, vennThreeCirclePreviewSvg, vennStackedPreviewSvg, VENN_COLORS } from '../../utils/diagramVennSvg'
import { PROCESS_STEP_COLORS, processRibbonInlineSvg, processIconInlineSvg, processFlowArrowInlineSvg } from '../../utils/diagramProcessStepsSvg'

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

  if (previewHints.diagramVariant === 'grid') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: large ? 6 : 2, minHeight: 0 }}>
          {quadrants.map((q, i) => (
            <div
              key={i}
              style={{
                background: SWOT_COLORS[i],
                borderRadius: large ? 8 : 3,
                padding: large ? '8px 10px' : '3px 4px',
                minWidth: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: large ? '0.85rem' : '0.28rem', fontWeight: 800, color: '#fff' }}>{['S', 'W', 'O', 'T'][i]} {q.title}</div>
              {q.body && (
                <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: 'rgba(255,255,255,0.85)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {q.body}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (previewHints.diagramVariant === 'cards') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text }}>{heading}</div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: large ? 10 : 4, minHeight: 0 }}>
          {quadrants.map((q, i) => (
            <div
              key={i}
              style={{
                background: theme.card,
                borderRadius: large ? 8 : 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                border: '1px solid color-mix(in srgb, var(--border-color) 55%, transparent)',
              }}
            >
              <div style={{ background: SWOT_COLORS[i], color: '#fff', fontWeight: 800, fontSize: large ? '0.62rem' : '0.2rem', padding: large ? '6px 8px' : '2px 3px' }}>
                {['S', 'W', 'O', 'T'][i]} {q.title}
              </div>
              {q.body && (
                <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, padding: large ? '6px 8px' : '2px 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {q.body}
                </div>
              )}
            </div>
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
  const horizontal = variant === 'horizontal'
  const cardFills = ['#EEF1F6', '#E8F0FE', '#FFF3EB', '#F1F5F9']

  return (
    <div
      {...fp}
      style={{
        ...fp.style,
        padding: pad(large),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: horizontal ? 'center' : 'flex-start',
        gap: large ? 10 : 3,
      }}
    >
      <div
        style={{
          fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small,
          fontWeight: 800,
          color: theme.text,
          flexShrink: 0,
          textAlign: 'center',
          width: '100%',
        }}
      >
        {heading}
      </div>
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: horizontal ? 'column' : 'row',
          alignItems: horizontal ? 'center' : 'stretch',
          justifyContent: horizontal ? 'center' : 'flex-start',
          gap: large ? 10 : 4,
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: horizontal ? '88%' : '46%',
            minWidth: 0,
            minHeight: horizontal ? (large ? 80 : 32) : undefined,
            display: 'flex',
          }}
          dangerouslySetInnerHTML={{ __html: horizontal ? funnelHPreviewSvg() : funnelDiagramInlineSvg() }}
        />
        <div
          style={{
            flex: horizontal ? '0 0 auto' : 1,
            width: horizontal ? '88%' : undefined,
            minWidth: 0,
            display: 'flex',
            flexDirection: horizontal ? 'row' : 'column',
            justifyContent: 'space-evenly',
            gap: horizontal ? (large ? 8 : 4) : 0,
          }}
        >
          {tiers.map((tier, i) => (
            <div
              key={i}
              style={{
                minWidth: 0,
                flex: horizontal ? 1 : undefined,
                textAlign: horizontal ? 'center' : 'left',
                background: horizontal ? cardFills[i] : undefined,
                borderRadius: horizontal ? (large ? 8 : 4) : undefined,
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {horizontal && (
                <div style={{ height: large ? 4 : 2, background: FUNNEL_STAGE_COLORS[i] }} />
              )}
              <div style={{ padding: horizontal ? (large ? '6px 6px 8px' : '3px 3px 4px') : 0 }}>
                <div style={{ fontSize: large ? '0.7rem' : '0.24rem', fontWeight: 700, color: FUNNEL_TITLE_COLORS[i], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

export function PolishedDiagramPyramidPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Priority pyramid')
  const tiers = Array.isArray(previewHints.funnelTiers) && previewHints.funnelTiers.length
    ? previewHints.funnelTiers.slice(0, 5)
    : [1, 2, 3, 4, 5].map((n) => ({ title: `Title ${String(n).padStart(2, '0')}`, body: 'Brief note' }))
  const variant = String(previewHints.diagramVariant || '').toLowerCase()
  const pyramidMode = variant === 'layers' || variant === 'inverted' ? variant : 'classic'
  const layers = pyramidMode === 'layers'

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
          }}
          dangerouslySetInnerHTML={{ __html: pyramidDiagramInlineSvg(PYRAMID_COLORS, pyramidMode) }}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
          {tiers.map((tier, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: large ? 8 : 3, minWidth: 0 }}>
              {layers ? (
                <div
                  style={{
                    width: large ? 10 : 5,
                    height: large ? 10 : 5,
                    borderRadius: 2,
                    background: PYRAMID_COLORS[i],
                    flexShrink: 0,
                  }}
                />
              ) : (
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
              )}
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
  const variant = String(previewHints.diagramVariant || '').toLowerCase()

  if (variant === 'three_circle') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>{heading}</div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }} dangerouslySetInnerHTML={{ __html: vennThreeCirclePreviewSvg() }} />
        <div style={{ display: 'flex', gap: large ? 8 : 3 }}>
          {sets.map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: 0, textAlign: 'center', color: VENN_COLORS[i], fontWeight: 800, fontSize: large ? '0.55rem' : '0.18rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.title}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'stacked') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>{heading}</div>
        <div style={{ flex: 1, display: 'flex', minHeight: 0, gap: large ? 8 : 3 }}>
          <div style={{ width: '38%', minWidth: 0 }} dangerouslySetInnerHTML={{ __html: vennStackedPreviewSvg() }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', minWidth: 0 }}>
            {sets.map((s, i) => (
              <div key={i} style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: VENN_COLORS[i], fontSize: large ? '0.58rem' : '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                {s.body && (
                  <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.body}</div>
                )}
              </div>
            ))}
          </div>
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
        { title: 'STEP #01', body: 'Describe this step.' },
        { title: 'STEP #02', body: 'Describe this step.' },
        { title: 'STEP #03', body: 'Describe this step.' },
        { title: 'STEP #04', body: 'Describe this step.' },
      ]
  const count = Math.min(steps.length, 4)
  const variant = String(previewHints.diagramVariant || '').toLowerCase()

  if (variant === 'horizontal') {
    const node = large ? 36 : 16
    const arrowH = large ? 12 : 6
    return (
      <div
        {...fp}
        style={{
          ...fp.style,
          padding: pad(large),
          display: 'flex',
          flexDirection: 'column',
          gap: large ? 10 : 4,
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
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', flexShrink: 0 }}>
          {steps.slice(0, count).map((_, i) => {
            const color = PROCESS_STEP_COLORS[i % PROCESS_STEP_COLORS.length]
            return (
              <div key={i} style={{ display: 'contents' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: node,
                      height: node,
                      borderRadius: '50%',
                      background: color,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: large ? '0.7rem' : '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
                {i < count - 1 ? (
                  <div
                    aria-hidden
                    style={{ width: large ? 28 : 12, height: arrowH, color, flexShrink: 0 }}
                    dangerouslySetInnerHTML={{ __html: processFlowArrowInlineSvg() }}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
            gap: large ? 8 : 3,
            minHeight: 0,
          }}
        >
          {steps.slice(0, count).map((step, i) => {
            const color = PROCESS_STEP_COLORS[i % PROCESS_STEP_COLORS.length]
            return (
              <div key={i} style={{ minWidth: 0, textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: large ? '0.68rem' : '0.2rem',
                    fontWeight: 800,
                    color,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small,
                    color: theme.muted,
                    marginTop: large ? 4 : 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {step.body}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (variant === 'vertical') {
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
            textAlign: 'left',
            flexShrink: 0,
          }}
        >
          {heading}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: large ? 6 : 2, position: 'relative' }}>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: large ? 14 : 6,
              top: large ? 14 : 6,
              bottom: large ? 14 : 6,
              width: large ? 3 : 1.5,
              background: '#CBD5E1',
              borderRadius: 99,
            }}
          />
          {steps.slice(0, count).map((step, i) => {
            const color = PROCESS_STEP_COLORS[i % PROCESS_STEP_COLORS.length]
            const node = large ? 28 : 12
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: large ? 10 : 4, minHeight: 0, flex: 1 }}>
                <div
                  style={{
                    width: node,
                    height: node,
                    borderRadius: '50%',
                    background: color,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: large ? '0.55rem' : '0.16rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: large ? '0.68rem' : '0.2rem',
                      fontWeight: 800,
                      color,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small,
                      color: theme.muted,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {step.body}
                  </div>
                </div>
              </div>
            )
          })}
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
        gap: large ? 12 : 4,
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
          display: 'grid',
          gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
          gap: large ? 10 : 4,
          minHeight: 0,
        }}
      >
        {steps.slice(0, count).map((step, i) => {
          const color = PROCESS_STEP_COLORS[i % PROCESS_STEP_COLORS.length]
          return (
            <div
              key={i}
              style={{
                background: '#F2F2F2',
                borderRadius: 8,
                padding: large ? '10px 0 8px' : '4px 0 3px',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: large ? 42 : 18,
                  color,
                  marginTop: large ? 8 : 3,
                  marginRight: large ? 10 : 4,
                  marginBottom: large ? 14 : 5,
                }}
                dangerouslySetInnerHTML={{ __html: processRibbonInlineSvg() }}
              />
              <div
                style={{
                  fontSize: large ? '0.72rem' : '0.22rem',
                  fontWeight: 800,
                  color,
                  padding: large ? '0 10px' : '0 3px',
                  marginBottom: large ? 10 : 4,
              }}
            >
              {step.title}
            </div>
              <div
                style={{
                  fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small,
                  color: theme.muted,
                  padding: large ? '10px 10px 0' : '4px 3px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {step.body}
              </div>
              <div
                style={{
                  width: large ? 28 : 12,
                  height: large ? 28 : 12,
                  color,
                  margin: 'auto auto 4px',
                }}
                dangerouslySetInnerHTML={{ __html: processIconInlineSvg(i) }}
              />
            </div>
          )
        })}
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

  if (previewHints.diagramVariant === 'ring') {
    const labels = (
      Array.isArray(previewHints.quadrants) && previewHints.quadrants.length
        ? previewHints.quadrants.map((q) => q.title)
        : ['Plan', 'Do', 'Check', 'Act', 'Improve']
    ).slice(0, 5)
    const svg = cycleRingPreviewSvg(CYCLE_RING_COLORS, labels)
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, textAlign: 'center', flexShrink: 0 }}>{heading}</div>
        <div
          aria-hidden
          style={{ flex: 1, minHeight: 0, marginTop: large ? 4 : 2 }}
          dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg style="width:100%;height:100%;" ') }}
        />
      </div>
    )
  }

  if (previewHints.diagramVariant === 'horizontal') {
    const cols = (
      Array.isArray(previewHints.quadrants) && previewHints.quadrants.length
        ? previewHints.quadrants
        : [{ title: 'Plan' }, { title: 'Do' }, { title: 'Check' }, { title: 'Act' }, { title: 'Improve' }]
    ).slice(0, 5)
    const size = large ? 64 : 30
    const overlap = large ? -18 : -9
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_TITLE_FS.small, fontWeight: 800, color: theme.text, textAlign: 'center', flexShrink: 0 }}>{heading}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0, marginTop: large ? 8 : 3 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {cols.map((_, i) => {
              const pal = cycleNodePalette(i)
              return (
                <div key={i} style={{ width: size, height: size, position: 'relative', marginLeft: i === 0 ? 0 : overlap, zIndex: i + 1 }}>
                  <div style={{ position: 'absolute', inset: 0, color: pal.top }} dangerouslySetInnerHTML={{ __html: cycleNodeTopArcSvg() }} />
                  <div style={{ position: 'absolute', inset: 0, color: pal.bot }} dangerouslySetInnerHTML={{ __html: cycleNodeBotArcSvg() }} />
                  <div style={{ position: 'absolute', inset: '22%', color: pal.accent }} dangerouslySetInnerHTML={{ __html: cycleNodeIconSvg(i) }} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: large ? 8 : 3 }}>
            {cols.map((q, i) => (
              <div
                key={i}
                style={{
                  width: size,
                  marginLeft: i === 0 ? 0 : overlap,
                  fontSize: large ? '0.48rem' : '0.15rem',
                  fontWeight: 700,
                  color: theme.text,
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {q.title || `Step ${i + 1}`}
              </div>
            ))}
          </div>
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
  const variant = previewHints.diagramVariant
  const isGrid = variant === 'grid'
  const isQuadrant = variant === 'quadrant'
  const colors = isGrid ? MATRIX_GRID_COLORS : ['#5B8FC4', '#5B8FC4', '#4A7EB0', '#4A7EB0']
  const showAxis = !isGrid && !isQuadrant

  if (isGrid || isQuadrant) {
    const titleFs = large ? '0.58rem' : '0.2rem'
    const bodyFs = large ? '0.42rem' : '0.15rem'
    return (
      <div
        {...fp}
        style={{
          ...fp.style,
          padding: pad(large),
          paddingTop: large ? 14 : 8,
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
            textAlign: 'center',
            lineHeight: 1.15,
          }}
        >
          {heading}
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: isGrid ? (large ? 8 : 3) : 0,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: isQuadrant ? 0 : undefined,
          }}
        >
          {quadrants.map((q, i) => (
            <div
              key={i}
              style={{
                background: isGrid ? MATRIX_GRID_COLORS[i] : MATRIX_Q_TINTS[i],
                borderRadius: isGrid ? (large ? 10 : 4) : 0,
                padding: large ? 8 : 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: titleFs,
                  fontWeight: 800,
                  color: isGrid ? '#fff' : MATRIX_Q_TITLE[i],
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}
              >
                {q.title}
              </div>
              {q.body ? (
                <div
                  style={{
                    fontSize: bodyFs,
                    color: isGrid ? 'rgba(255,255,255,0.85)' : theme.muted,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                  }}
                >
                  {q.body}
                </div>
              ) : null}
            </div>
          ))}
          {isQuadrant && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: large ? 3 : 1.5,
                  marginLeft: large ? -1.5 : -0.75,
                  background: MATRIX_Q_AXIS,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: large ? 3 : 1.5,
                  marginTop: large ? -1.5 : -0.75,
                  background: MATRIX_Q_AXIS,
                  pointerEvents: 'none',
                }}
              />
            </>
          )}
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
