/**
 * Polished layout previews for Device frames catalog.
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'
import { previewImageFrameStyle, PreviewImageIcon, PreviewImage } from './layoutPreviewImageShared.jsx'

const PREVIEW_TITLE_FS = { large: '1.75rem', small: '0.92rem' }
const PREVIEW_BODY_FS = { large: '0.88rem', small: '0.4rem' }

const theme = {
  bg: 'var(--preview-bg, var(--bg-card, #ffffff))',
  text: 'var(--preview-text, var(--text-main, #1f1f1f))',
  muted: 'var(--preview-muted, var(--text-muted, #6f6f6f))',
  frame: '#1e293b',
  frameOuter: '#0f172a',
  screen: '#e2e8f0',
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

function ImagePh({ large, src = '' }) {
  return <PreviewImage large={large} src={src} />
}

function PhoneFrame({ large, landscape = false, style = {}, src = '' }) {
  const border = large ? 6 : 3
  return (
    <div style={{
      width: landscape ? '92%' : '58%',
      height: landscape ? '58%' : '92%',
      borderRadius: landscape ? (large ? 12 : 4) : (large ? 20 : 8),
      border: `${border}px solid ${theme.frameOuter}`,
      outline: `${large ? 3 : 1.5}px solid ${theme.frame}`,
      outlineOffset: large ? -2 : -1,
      background: '#f8fafc',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
      ...style,
    }}>
      {!landscape && (
        <div style={{ height: large ? 6 : 2, flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minHeight: 0 }}><ImagePh large={large} src={src} /></div>
      {!landscape && (
        <div style={{ height: large ? 8 : 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '28%', height: large ? 4 : 2, borderRadius: 99, background: '#cbd5e1' }} />
        </div>
      )}
    </div>
  )
}

function TabletFrame({ large, style = {}, cropBottom = false, src = '' }) {
  const border = large ? 6 : 3
  return (
    <div style={{
      width: cropBottom ? '72%' : '58%',
      height: cropBottom ? '115%' : '88%',
      borderRadius: large ? 16 : 6,
      border: `${border}px solid ${theme.frameOuter}`,
      outline: `${large ? 3 : 1.5}px solid ${theme.frame}`,
      outlineOffset: large ? -2 : -1,
      background: '#f8fafc',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
      ...style,
    }}>
      <div style={{ flex: 1, minHeight: 0 }}><ImagePh large={large} src={src} /></div>
      <div style={{ height: large ? 8 : 3, background: '#cbd5e1', flexShrink: 0 }} />
    </div>
  )
}

function LaptopFrame({ large, style = {}, src = '' }) {
  const border = large ? 6 : 3
  return (
    <div style={{ width: '92%', height: '78%', display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
      <div style={{
        width: '100%', flex: 1, borderRadius: large ? 12 : 5,
        border: `${border}px solid ${theme.frameOuter}`,
        outline: `${large ? 3 : 1.5}px solid ${theme.frame}`,
        outlineOffset: large ? -2 : -1,
        background: '#f8fafc',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
      }}>
        <div style={{ height: large ? 10 : 4, background: '#334155', flexShrink: 0 }} />
        <div style={{ flex: 1, minHeight: 0 }}><ImagePh large={large} src={src} /></div>
      </div>
      <div style={{ width: '112%', height: large ? 10 : 4, marginTop: large ? -2 : -1, borderRadius: large ? 5 : 2, background: '#475569', border: `${large ? 2 : 1}px solid ${theme.frameOuter}` }} />
    </div>
  )
}

function WatchFrame({ large, style = {} }) {
  return (
    <div style={{
      width: large ? 36 : 12, height: large ? 44 : 14,
      borderRadius: large ? 10 : 4,
      border: `${large ? 2.5 : 1.5}px solid ${theme.frame}`,
      background: '#f8fafc', overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      ...style,
    }}>
      <ImagePh large={large} />
    </div>
  )
}

function SplitCopy({ previewHints, large }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 10 : 3, justifyContent: 'center', height: '100%' }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>
        {previewHints.slots?.HEADING?.text || 'Describe this mockup'}
      </div>
      <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.28rem', color: theme.muted, lineHeight: 1.45 }}>
        {previewHints.bodyText || previewHints.slots?.BODY?.text || 'Even the best products might need a bit more description if you want your visitors to understand what they\'re seeing.'}
      </div>
    </div>
  )
}

function DeviceStage({ large, children, style }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {children}
    </div>
  )
}

export function PolishedDevicePhoneHorizontalPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 12 : 4, alignItems: 'center' }}>
      <SplitCopy previewHints={previewHints} large={large} />
      <DeviceStage large={large}><PhoneFrame large={large} landscape /></DeviceStage>
    </div>
  )
}

function deviceImageSrc(previewHints, slotId = 'DEVICE_IMAGE') {
  return previewHints?.slots?.[slotId]?.imageUrl || previewHints?.imageUrl || ''
}

export function PolishedDevicePhoneVerticalSplitPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const src = deviceImageSrc(previewHints)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: large ? 12 : 4, alignItems: 'center' }}>
      <SplitCopy previewHints={previewHints} large={large} />
      <DeviceStage large={large}><PhoneFrame large={large} src={src} /></DeviceStage>
    </div>
  )
}

export function PolishedDevicePhoneHighlightsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const line = large ? 1.5 : 0.75
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 0.8fr 1fr', gap: large ? 8 : 2, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2, position: 'relative' }}>
        <div style={{ fontSize: large ? '0.82rem' : '0.28rem', fontWeight: 800, color: theme.text }}>
          {previewHints.slots?.CALLOUT_L_HEADING?.text || 'A highlight feature'}
        </div>
        <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.24rem', color: theme.muted }}>
          {previewHints.slots?.CALLOUT_L_BODY?.text || 'Say something about it here.'}
        </div>
        <div style={{ position: 'absolute', right: large ? -18 : -6, top: '35%', width: large ? 18 : 6, height: line, background: theme.frame, transform: 'rotate(-18deg)' }} />
      </div>
      <DeviceStage large={large}><PhoneFrame large={large} /></DeviceStage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2, position: 'relative', alignSelf: 'end', paddingBottom: large ? 12 : 4 }}>
        <div style={{ position: 'absolute', left: large ? -18 : -6, top: '18%', width: large ? 18 : 6, height: line, background: theme.frame, transform: 'rotate(18deg)' }} />
        <div style={{ fontSize: large ? '0.82rem' : '0.28rem', fontWeight: 800, color: theme.text }}>
          {previewHints.slots?.CALLOUT_R_HEADING?.text || 'Another highlight'}
        </div>
        <div style={{ fontSize: large ? PREVIEW_BODY_FS.large : '0.24rem', color: theme.muted }}>
          {previewHints.slots?.CALLOUT_R_BODY?.text || 'Say something about it here.'}
        </div>
      </div>
    </div>
  )
}

export function PolishedDevicePhoneTriplePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 12 : 4, alignItems: 'center' }}>
      <SplitCopy previewHints={previewHints} large={large} />
      <div style={{ position: 'relative', height: '100%', minHeight: large ? 120 : 40 }}>
        <div style={{ position: 'absolute', left: '8%', top: '4%', width: '42%', height: '42%' }}>
          <PhoneFrame large={large} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', left: '28%', top: '28%', width: '42%', height: '42%' }}>
          <PhoneFrame large={large} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', left: '48%', top: '52%', width: '42%', height: '42%' }}>
          <PhoneFrame large={large} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  )
}

export function PolishedDeviceMultiClusterPreview(props) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '88%', height: '88%' }}>
        <div style={{ position: 'absolute', left: '0%', top: '24%', width: '46%', height: '52%' }}>
          <LaptopFrame large={large} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', left: '28%', top: '0%', width: '34%', height: '58%' }}>
          <TabletFrame large={large} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', left: '52%', top: '30%', width: '22%', height: '52%' }}>
          <PhoneFrame large={large} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', left: '72%', top: '42%', width: '12%', height: '22%' }}>
          <WatchFrame large={large} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  )
}

export function PolishedDeviceTabletCenteredPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 10 : 3, overflow: 'hidden' }}>
      <div style={{ fontSize: large ? PREVIEW_TITLE_FS.large : '0.38rem', fontWeight: 800, color: theme.text, textAlign: 'center' }}>
        {previewHints.slots?.HEADING?.text || 'Describe this mockup'}
      </div>
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
        <TabletFrame large={large} cropBottom />
      </div>
    </div>
  )
}

export function PolishedDeviceTabletSplitPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 12 : 4, alignItems: 'center' }}>
      <SplitCopy previewHints={previewHints} large={large} />
      <DeviceStage large={large}><TabletFrame large={large} /></DeviceStage>
    </div>
  )
}

export function PolishedDeviceLaptopSplitPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const src = deviceImageSrc(previewHints)
  return (
    <div {...fp} style={{ ...fp.style, padding: pad(large), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: large ? 12 : 4, alignItems: 'center' }}>
      <SplitCopy previewHints={previewHints} large={large} />
      <DeviceStage large={large}><LaptopFrame large={large} src={src} /></DeviceStage>
    </div>
  )
}

export const DEVICE_FRAMES_PREVIEW_MODES = {
  device_phone_horizontal: PolishedDevicePhoneHorizontalPreview,
  device_phone_vertical_split: PolishedDevicePhoneVerticalSplitPreview,
  device_phone_highlights: PolishedDevicePhoneHighlightsPreview,
  device_phone_triple: PolishedDevicePhoneTriplePreview,
  device_multi_cluster: PolishedDeviceMultiClusterPreview,
  device_tablet_centered: PolishedDeviceTabletCenteredPreview,
  device_tablet_split: PolishedDeviceTabletSplitPreview,
  device_laptop_split: PolishedDeviceLaptopSplitPreview,
}
