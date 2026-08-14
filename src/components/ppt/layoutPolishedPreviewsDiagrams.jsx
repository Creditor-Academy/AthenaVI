/**
 * Polished layout previews for Diagram catalog (SWOT, funnel, matrix, cycle, venn, process).
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'

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

export function PolishedDiagramFunnelPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const heading = slotText(previewHints, 'HEADING', 'Funnel')
  const pyramid = previewHints.diagramVariant === 'pyramid'
  const tiers = Array.isArray(previewHints.funnelTiers) && previewHints.funnelTiers.length
    ? previewHints.funnelTiers.slice(0, 4)
    : [1, 2, 3, 4].map((n) => ({ title: `Stage ${n}`, body: 'Brief note' }))

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
          flexDirection: 'column',
          justifyContent: 'center',
          gap: large ? 6 : 2,
          minHeight: 0,
        }}
      >
        {tiers.map((tier, i) => {
          const idx = pyramid ? tiers.length - 1 - i : i
          const widthPct = pyramid ? 42 + idx * 14 : 88 - idx * 14
          return (
            <div
              key={i}
              style={{
                width: `${Math.max(38, Math.min(92, widthPct))}%`,
                margin: '0 auto',
                boxSizing: 'border-box',
                borderRadius: large ? 6 : 2,
                border: `1px solid ${theme.accentBorder}`,
                background: i === 0 ? theme.accentSoft : theme.card,
                padding: large ? '6px 8px' : '2px 3px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: large ? '0.72rem' : '0.26rem',
                  fontWeight: 700,
                  color: theme.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {tier.title}
              </div>
              {tier.body && (
                <div
                  style={{
                    fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small,
                    color: theme.muted,
                    marginTop: large ? 2 : 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tier.body}
                </div>
              )}
            </div>
          )
        })}
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
  const center = previewHints.vennCenter || slotText(previewHints, 'CENTER_BODY', 'Overlap')

  const circleSize = large ? 72 : 26

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
        }}
      >
        {heading}
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: large ? 100 : 36 }}>
        {[
          { left: '8%', top: '18%', color: theme.accentSoft },
          { left: '38%', top: '8%', color: 'color-mix(in srgb, var(--preview-accent) 8%, var(--bg-card))' },
          { left: '62%', top: '18%', color: theme.card },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              width: circleSize,
              height: circleSize,
              borderRadius: '50%',
              border: `1.5px solid ${theme.accentBorder}`,
              background: pos.color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: large ? 6 : 2,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: large ? '0.65rem' : '0.22rem', fontWeight: 700, color: theme.text }}>
              {sets[i]?.title}
            </div>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '52%',
            transform: 'translate(-50%, -50%)',
            fontSize: large ? '0.58rem' : '0.2rem',
            fontWeight: 600,
            color: theme.accent,
            background: theme.bg,
            padding: large ? '2px 6px' : '1px 3px',
            borderRadius: 999,
            border: `1px solid ${theme.accentBorder}`,
            maxWidth: '40%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {center}
        </div>
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
        }}
      >
        {heading}
      </div>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, minmax(0, 1fr))`,
          gap: large ? 8 : 2,
          alignItems: 'start',
          minHeight: 0,
        }}
      >
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 6 : 2, minWidth: 0 }}>
            <div
              style={{
                width: large ? 36 : 12,
                height: large ? 36 : 12,
                borderRadius: '50%',
                border: `2px solid ${theme.accentBorder}`,
                background: theme.accentSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: large ? '0.7rem' : '0.22rem',
                fontWeight: 800,
                color: theme.accent,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                fontSize: large ? '0.72rem' : '0.26rem',
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
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {step.body}
              </div>
            )}
            {i < steps.length - 1 && (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  display: 'none',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export const DIAGRAM_PREVIEW_MODES = {
  diagram_quadrants: PolishedDiagramQuadrantsPreview,
  diagram_funnel: PolishedDiagramFunnelPreview,
  diagram_venn: PolishedDiagramVennPreview,
  diagram_process_steps: PolishedDiagramProcessStepsPreview,
}
