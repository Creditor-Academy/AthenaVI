/**
 * Polished SVG previews for Timeline + Process layouts (mirrors layoutPolishedPreviewsDiagrams.jsx).
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'
import {
  horizontalTimelineInlineSvg,
  horizontalTimelineCardsInlineSvg,
  verticalTimelineInlineSvg,
  verticalTimelineCardsInlineSvg,
  processLinnerHortiInlineSvg,
  processLinnerNumericInlineSvg,
  roadmapTimelineInlineSvg,
  roadmapLanesInlineSvg,
  milestonesImageTimelineInlineSvg,
  milestonesImageSplitInlineSvg,
  milestonesPathInlineSvg,
} from '../../utils/timelineProcessSvg'

const PREVIEW_TITLE_FS = { large: '1.75rem', small: '0.36rem' }
const PREVIEW_SUBTITLE_FS = { large: '1rem', small: '0.48rem' }
const PREVIEW_CAPTION_FS = { large: '0.62rem', small: '0.2rem' }
const PREVIEW_BODY_FS = { large: '0.72rem', small: '0.22rem' }

const theme = {
  bg: 'var(--preview-bg, var(--bg-card, #ffffff))',
  card: 'var(--preview-card, color-mix(in srgb, var(--border-color) 50%, var(--bg-card)))',
  text: 'var(--preview-text, var(--text-main, #1f1f1f))',
  muted: 'var(--preview-muted, var(--text-muted, #6f6f6f))',
  accent: 'var(--preview-accent, #6366f1)',
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

function resolveSteps(previewHints, fallback) {
  if (Array.isArray(previewHints.steps) && previewHints.steps.length) return previewHints.steps
  return fallback
}

function SvgChrome({ html, large, style = {} }) {
  return (
    <div
      aria-hidden
      style={{ width: '100%', flexShrink: 0, color: theme.text, ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function StepLabels({ steps, large, count, columns }) {
  const cols = columns || `repeat(${count}, minmax(0, 1fr))`
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        gap: large ? 10 : 3,
        flex: 1,
        minHeight: 0,
        alignContent: 'start',
      }}
    >
      {steps.slice(0, count).map((step, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: large ? 4 : 1,
            padding: large ? '0 4px' : '0 1px',
          }}
        >
          <div
            style={{
              fontSize: large ? '0.78rem' : '0.28rem',
              fontWeight: 700,
              color: theme.text,
              lineHeight: 1.2,
            }}
          >
            {step.title}
          </div>
          {step.body && (
            <div
              style={{
                fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small,
                color: theme.muted,
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
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
  )
}

export function PolishedProcessFlowPreview({ previewHints, large, ...props }) {
  const fp = frameProps({ ...props, large })
  const heading = slotText(previewHints, 'HEADING', 'How it works')
  const variant = previewHints.timelineVariant || 'default'
  const isMilestones = Boolean(previewHints?.slots?.milestone_1_detail)
  const steps = resolveSteps(previewHints, [
    { title: 'Discover', body: 'Identify the problem.' },
    { title: 'Build', body: 'Design the solution.' },
    { title: 'Launch', body: 'Ship and iterate.' },
  ])
  const count = Math.min(steps.length, 4)

  let chromeHtml = horizontalTimelineInlineSvg(count, { accent: theme.accent, spine: theme.text, showChevrons: true })
  let chromeHeight = large ? 64 : 24
  if (variant === 'cards' || (variant === 'default' && isMilestones)) {
    chromeHtml = horizontalTimelineCardsInlineSvg(count, { accent: theme.accent, card: theme.card })
    chromeHeight = large ? 100 : 38
  } else if (variant === 'path') {
    chromeHtml = milestonesPathInlineSvg(count, { accent: theme.accent })
    chromeHeight = large ? 72 : 28
  } else if (variant === 'nodes') {
    chromeHtml = horizontalTimelineInlineSvg(count, { accent: theme.accent, spine: theme.text, showChevrons: true })
  }

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 14 : 5 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
        {heading}
      </div>
      <SvgChrome
        html={chromeHtml}
        large={large}
        style={{ height: chromeHeight, margin: large ? '0 2%' : '0 1%' }}
      />
      <StepLabels steps={steps} large={large} count={count} />
    </div>
  )
}

export function PolishedTimelineHorizontalPreview(props) {
  return <PolishedProcessFlowPreview {...props} />
}

export function PolishedTimelineRoadmapPreview({ previewHints, large, ...props }) {
  const fp = frameProps({ ...props, large })
  const heading = slotText(previewHints, 'HEADING', 'Product roadmap')
  const variant = previewHints.timelineVariant || 'default'
  const steps = resolveSteps(previewHints, [
    { title: 'Q1', body: 'Foundation' },
    { title: 'Q2', body: 'Growth' },
    { title: 'Q3', body: 'Scale' },
    { title: 'Q4', body: 'Enterprise' },
  ])
  const count = Math.min(steps.length, 4)
  const chromeHtml = variant === 'lanes'
    ? roadmapLanesInlineSvg(count, { accent: theme.accent, lane: theme.card })
    : roadmapTimelineInlineSvg(count, { accent: theme.accent, card: theme.card })

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 12 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
        {heading}
      </div>
      <SvgChrome
        html={chromeHtml}
        large={large}
        style={{ height: large ? (variant === 'lanes' ? 100 : 120) : (variant === 'lanes' ? 38 : 44) }}
      />
      {variant !== 'lanes' && <StepLabels steps={steps} large={large} count={count} />}
    </div>
  )
}

export function PolishedTimelineVerticalPreview({ previewHints, large, ...props }) {
  const fp = frameProps({ ...props, large })
  const heading = slotText(previewHints, 'HEADING', 'Project phases')
  const variant = previewHints.timelineVariant || 'default'
  const steps = resolveSteps(previewHints, [
    { title: 'Phase 1', body: 'Discovery and planning' },
    { title: 'Phase 2', body: 'Build and iterate' },
    { title: 'Phase 3', body: 'Launch and scale' },
  ])
  const count = Math.min(steps.length, 3)
  const useCards = variant === 'cards'
  const spineHtml = useCards
    ? verticalTimelineCardsInlineSvg(count, { accent: theme.accent, card: theme.card })
    : verticalTimelineInlineSvg(count, { accent: theme.accent })

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
        {heading}
      </div>
      <div style={{ flex: 1, display: 'flex', gap: large ? 16 : 6, minHeight: 0 }}>
        <SvgChrome
          html={spineHtml}
          large={large}
          style={{ width: useCards ? (large ? 120 : 44) : (large ? 56 : 22), height: '100%', flexShrink: 0 }}
        />
        {!useCards && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: large ? 8 : 3 }}>
            {steps.slice(0, count).map((step, i) => (
              <div key={i}>
                <div style={{ fontSize: large ? '0.75rem' : '0.28rem', fontWeight: 700, color: theme.text }}>{step.title}</div>
                <div style={{ fontSize: large ? PREVIEW_CAPTION_FS.large : PREVIEW_CAPTION_FS.small, color: theme.muted }}>{step.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function PolishedTimelineMilestonesImagePreview({ previewHints, large, ...props }) {
  const fp = frameProps({ ...props, large })
  const heading = slotText(previewHints, 'HEADING', 'Key milestones')
  const variant = previewHints.timelineVariant || 'default'
  const steps = resolveSteps(previewHints, [
    { title: 'Start', body: 'Kickoff' },
    { title: 'Build', body: 'Ship MVP' },
    { title: 'Grow', body: 'Scale' },
  ])
  const count = Math.min(steps.length, 3)

  if (variant === 'image_right') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
          {heading}
        </div>
        <SvgChrome
          html={milestonesImageSplitInlineSvg(count, { accent: theme.accent })}
          large={large}
          style={{ height: large ? 120 : 46 }}
        />
        <StepLabels steps={steps} large={large} count={count} columns="1fr 1fr 1fr" />
      </div>
    )
  }

  if (variant === 'image_top') {
    return (
      <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
        <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
          {heading}
        </div>
        <div style={{ height: large ? 48 : 18, background: theme.card, borderRadius: large ? 8 : 3, marginBottom: large ? 4 : 2 }} />
        <SvgChrome
          html={horizontalTimelineInlineSvg(count, { accent: theme.accent, spine: theme.text, showChevrons: false })}
          large={large}
          style={{ height: large ? 48 : 20 }}
        />
        <StepLabels steps={steps} large={large} count={count} />
      </div>
    )
  }

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 10 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
        {heading}
      </div>
      <SvgChrome
        html={milestonesImageTimelineInlineSvg(count, { accent: theme.accent })}
        large={large}
        style={{ height: large ? 140 : 52, marginBottom: large ? 4 : 2 }}
      />
      <StepLabels steps={steps} large={large} count={count} />
    </div>
  )
}

export function PolishedTimelineProcessStepsPreview({ previewHints, large, ...props }) {
  const variant = previewHints.timelineVariant || 'default'
  if (variant === 'horizontal') {
    return <PolishedProcessLinnerHortiPreview previewHints={previewHints} large={large} {...props} />
  }
  if (variant === 'vertical') {
    return <PolishedTimelineVerticalPreview previewHints={{ ...previewHints, timelineVariant: 'nodes' }} large={large} {...props} />
  }
  return <PolishedProcessFlowPreview previewHints={previewHints} large={large} {...props} />
}

export function PolishedProcessLinnerHortiPreview({ previewHints, large, ...props }) {
  const variant = previewHints.dataVariant || previewHints.timelineVariant || 'default'
  if (variant === 'path' || variant === 'cards') {
    return <PolishedProcessFlowPreview previewHints={{ ...previewHints, timelineVariant: variant }} large={large} {...props} />
  }
  const fp = frameProps({ ...props, large })
  const heading = slotText(previewHints, 'HEADING', 'How it works')
  const steps = resolveSteps(previewHints, [
    { title: 'Phase 1', body: 'Research and define.' },
    { title: 'Phase 2', body: 'Design and iterate.' },
    { title: 'Phase 3', body: 'Ship and improve.' },
  ])
  const count = Math.min(steps.length, 4)

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 12 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
        {heading}
      </div>
      <SvgChrome
        html={processLinnerHortiInlineSvg(count, { accent: theme.accent, phase: '#e8b4a0', spine: theme.text })}
        large={large}
        style={{ height: large ? 130 : 48 }}
      />
      <StepLabels steps={steps} large={large} count={count} />
    </div>
  )
}

export function PolishedProcessLinnerNumericPreview({ previewHints, large, ...props }) {
  const variant = previewHints.dataVariant || previewHints.timelineVariant || 'default'
  if (variant === 'path' || variant === 'cards') {
    return <PolishedProcessFlowPreview previewHints={{ ...previewHints, timelineVariant: variant }} large={large} {...props} />
  }
  const fp = frameProps({ ...props, large })
  const heading = slotText(previewHints, 'HEADING', 'Process overview')
  const steps = resolveSteps(previewHints, [1, 2, 3].map((n) => ({
    title: previewHints?.slots?.[`STEP_${n}_TITLE`]?.text || `Step ${n}`,
    body: previewHints?.slots?.[`STEP_${n}_BODY`]?.text || 'Short description.',
  })))
  const count = Math.min(steps.length, 4)

  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', gap: large ? 12 : 4 }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : PREVIEW_SUBTITLE_FS.small, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
        {heading}
      </div>
      <SvgChrome
        html={processLinnerNumericInlineSvg(count)}
        large={large}
        style={{ height: large ? 100 : 38 }}
      />
      <StepLabels steps={steps} large={large} count={count} />
    </div>
  )
}

export const TIMELINE_PROCESS_PREVIEW_MODES = {
  process_flow: PolishedProcessFlowPreview,
  timeline_horizontal: PolishedTimelineHorizontalPreview,
  timeline_roadmap: PolishedTimelineRoadmapPreview,
  timeline_vertical: PolishedTimelineVerticalPreview,
  timeline_milestones_image: PolishedTimelineMilestonesImagePreview,
  timeline_process_steps: PolishedTimelineProcessStepsPreview,
  process_linner_horti: PolishedProcessLinnerHortiPreview,
  process_linner_numeric: PolishedProcessLinnerNumericPreview,
}
