/**
 * Polished layout previews for Device frames catalog.
 */

import { aspectRatioToCss } from '../../utils/deckPackTheme'
import EmptyImagePlaceholder from './EmptyImagePlaceholder.jsx'

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

function ImagePh({ src = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    )
  }
  return <EmptyImagePlaceholder />
}

function PhoneFrame({ large, landscape = false, style = {}, src = '' }) {
  if (landscape) {
    const border = large ? 10 : 4
    return (
      <div style={{
        width: '96%',
        maxHeight: '82%',
        aspectRatio: '19.5 / 9',
        borderRadius: large ? 28 : 10,
        border: `${border}px solid ${theme.frameOuter}`,
        background: theme.frameOuter,
        overflow: 'hidden',
        boxShadow: large
          ? '0 16px 40px rgba(15,23,42,0.2), 0 4px 10px rgba(15,23,42,0.1)'
          : '0 4px 10px rgba(15,23,42,0.16)',
        boxSizing: 'border-box',
        position: 'relative',
        ...style,
      }}>
        <div style={{
          position: 'absolute',
          left: large ? 7 : 3,
          top: '50%',
          transform: 'translateY(-50%)',
          width: large ? 4 : 2,
          height: '16%',
          borderRadius: 99,
          background: '#020617',
          zIndex: 2,
        }} />
        <div style={{ width: '100%', height: '100%', borderRadius: large ? 18 : 6, overflow: 'hidden' }}>
          <ImagePh src={src} />
        </div>
      </div>
    )
  }
  const border = large ? 8 : 3
  return (
    <div style={{
      height: '86%',
      aspectRatio: '9 / 19.5',
      maxWidth: '54%',
      borderRadius: large ? 24 : 8,
      border: `${border}px solid ${theme.frameOuter}`,
      background: theme.frameOuter,
      overflow: 'hidden',
      boxShadow: large
        ? '0 16px 40px rgba(15,23,42,0.2), 0 4px 10px rgba(15,23,42,0.1)'
        : '0 4px 10px rgba(15,23,42,0.16)',
      boxSizing: 'border-box',
      position: 'relative',
      ...style,
    }}>
      <div style={{
        position: 'absolute',
        top: large ? 7 : 3,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '32%',
        height: large ? 6 : 2,
        borderRadius: 99,
        background: '#020617',
        zIndex: 2,
      }} />
      <div style={{ width: '100%', height: '100%', borderRadius: large ? 18 : 6, overflow: 'hidden' }}>
        <ImagePh src={src} />
      </div>
      <div style={{
        position: 'absolute',
        bottom: large ? 6 : 2,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '30%',
        height: large ? 4 : 2,
        borderRadius: 99,
        background: 'rgba(255,255,255,0.35)',
        zIndex: 2,
      }} />
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
      width: large ? 28 : 14,
      height: large ? 72 : 32,
      position: 'relative',
      ...style,
    }}>
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '4%',
        transform: 'translateX(-50%)',
        width: '32%',
        height: '92%',
        background: theme.frameOuter,
        borderRadius: large ? 6 : 3,
      }} />
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '24%',
        transform: 'translateX(-50%)',
        width: '78%',
        height: '52%',
        borderRadius: large ? 10 : 4,
        border: `${large ? 2.5 : 1.5}px solid ${theme.frame}`,
        background: '#f8fafc',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      }}>
        <ImagePh large={large} />
      </div>
    </div>
  )
}

function SplitCopy({ previewHints, large, hero = false }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: large ? (hero ? 20 : 10) : 3,
      justifyContent: 'center',
      height: '100%',
      paddingRight: hero && large ? '6%' : 0,
    }}>
      <div style={{
        fontSize: large ? (hero ? '2.2rem' : PREVIEW_TITLE_FS.large) : '0.38rem',
        fontWeight: 800,
        color: theme.text,
        lineHeight: hero ? 1.06 : 1.2,
        letterSpacing: hero ? '-0.04em' : undefined,
      }}>
        {previewHints.slots?.HEADING?.text || (hero ? 'Describe this mockup so the product feels real' : 'Describe this mockup')}
      </div>
      <div style={{
        fontSize: large ? (hero ? '1.02rem' : PREVIEW_BODY_FS.large) : '0.28rem',
        color: theme.muted,
        lineHeight: hero ? 1.55 : 1.45,
        maxWidth: hero ? '36em' : undefined,
      }}>
        {previewHints.bodyText || previewHints.slots?.BODY?.text || (hero
          ? 'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the organization.'
          : 'Even the best products might need a bit more description if you want your visitors to understand what they\'re seeing.')}
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
  const src = deviceImageSrc(previewHints)
  return (
    <div {...fp} style={{
      ...fp.style,
      padding: large ? '7% 6%' : '8% 5%',
      display: 'grid',
      gridTemplateColumns: '0.92fr 1.08fr',
      gap: large ? 28 : 8,
      alignItems: 'center',
    }}>
      <SplitCopy previewHints={previewHints} large={large} />
      <DeviceStage large={large}><PhoneFrame large={large} landscape src={src} /></DeviceStage>
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
    <div {...fp} style={{
      ...fp.style,
      padding: large ? '7% 7% 7% 8%' : '8% 5%',
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      gap: large ? 24 : 8,
      alignItems: 'center',
    }}>
      <SplitCopy previewHints={previewHints} large={large} />
      <DeviceStage large={large}><PhoneFrame large={large} src={src} /></DeviceStage>
    </div>
  )
}

export function PolishedDevicePhoneHighlightsPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const callouts = Array.isArray(previewHints.callouts) && previewHints.callouts.length >= 6
    ? previewHints.callouts
    : [
        { heading: 'Title 01', body: 'Description 01' },
        { heading: 'Title 02', body: 'Description 02' },
        { heading: 'Title 03', body: 'Description 03' },
        { heading: 'Title 04', body: 'Description 04' },
        { heading: 'Title 05', body: 'Description 05' },
        { heading: 'Title 06', body: 'Description 06' },
      ]
  const colors = ['#22c55e', '#1e3a8a', '#ef4444', '#38bdf8', '#f97316', '#64748b']
  const dot = large ? 18 : 7

  const FeatureCol = ({ items, side }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      height: '100%',
      padding: large ? '2% 0' : '2% 0',
    }}>
      {items.map((item, i) => (
        <div key={`${side}-${i}`} style={{
          display: 'flex',
          flexDirection: side === 'L' ? 'row' : 'row-reverse',
          alignItems: 'flex-start',
          gap: large ? 8 : 3,
        }}>
          <div style={{ flex: 1, textAlign: side === 'L' ? 'right' : 'left', minWidth: 0 }}>
            <div style={{ fontSize: large ? '0.88rem' : '0.28rem', fontWeight: 700, color: theme.text, lineHeight: 1.2 }}>
              {item.heading}
            </div>
            <div style={{ fontSize: large ? '0.7rem' : '0.22rem', color: theme.muted, lineHeight: 1.4, marginTop: large ? 4 : 1 }}>
              {item.body}
            </div>
          </div>
          <div style={{
            width: dot,
            height: dot,
            borderRadius: '50%',
            background: colors[side === 'L' ? i : i + 3],
            flexShrink: 0,
            marginTop: large ? 2 : 1,
          }} />
        </div>
      ))}
    </div>
  )

  return (
    <div {...fp} style={{
      ...fp.style,
      padding: large ? '4% 4% 5%' : '6% 4%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      <div style={{
        fontSize: large ? PREVIEW_TITLE_FS.large : '0.36rem',
        fontWeight: 800,
        color: theme.text,
        textAlign: 'center',
        lineHeight: 1.15,
        marginBottom: large ? 10 : 3,
        flexShrink: 0,
      }}>
        {previewHints.heading || previewHints.slots?.HEADING?.text || 'Highlights that matter'}
      </div>
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.7fr 1.15fr',
        gap: large ? 22 : 6,
        alignItems: 'stretch',
      }}>
        <FeatureCol items={callouts.slice(0, 3)} side="L" />
        <DeviceStage large={large}>
          <PhoneFrame large={large} src={deviceImageSrc(previewHints)} />
        </DeviceStage>
        <FeatureCol items={callouts.slice(3, 6)} side="R" />
      </div>
    </div>
  )
}

export function PolishedDevicePhoneTriplePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const src = deviceImageSrc(previewHints)
  const title = previewHints.heading || previewHints.slots?.HEADING?.text || 'Describe this mockup'
  const leftHead = previewHints.slots?.HEADING_L?.text || 'Title 01'
  const leftBody = previewHints.slots?.BODY_L?.text || 'Description 01'
  const rightHead = previewHints.slots?.HEADING_R?.text || 'Title 02'
  const rightBody = previewHints.slots?.BODY_R?.text || 'Description 02'
  const phoneStyle = {
    height: '100%',
    width: '100%',
    maxWidth: 'none',
    aspectRatio: '9 / 19.5',
  }
  const Copy = ({ heading, body, side }) => (
    <div style={{
      position: 'absolute',
      [side]: large ? '3%' : '2%',
      top: '38%',
      width: '18%',
      zIndex: 4,
    }}>
      <div style={{ fontSize: large ? '0.78rem' : '0.26rem', fontWeight: 800, color: theme.text, lineHeight: 1.15 }}>
        {heading}
      </div>
      <div style={{ fontSize: large ? '0.58rem' : '0.2rem', color: theme.muted, lineHeight: 1.4, marginTop: large ? 6 : 2 }}>
        {body}
      </div>
    </div>
  )
  return (
    <div {...fp} style={{ ...fp.style, background: '#f3f4f6', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: large ? 8 : 3,
        textAlign: 'center',
        fontSize: large ? '0.85rem' : '0.28rem',
        fontWeight: 800,
        color: theme.text,
        lineHeight: 1.2,
        zIndex: 5,
        padding: '8px 8% 0',
        boxSizing: 'border-box',
      }}>
        {title}
      </div>
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '30%',
        height: '40%',
        background: '#e8eaed',
      }} />
      <Copy heading={leftHead} body={leftBody} side="left" />
      <Copy heading={rightHead} body={rightBody} side="right" />
      <div style={{
        position: 'absolute',
        left: '28%',
        top: '24%',
        width: '20%',
        height: '66%',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <PhoneFrame large={large} src={src} style={phoneStyle} />
      </div>
      <div style={{
        position: 'absolute',
        right: '28%',
        top: '24%',
        width: '20%',
        height: '66%',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <PhoneFrame large={large} src={src} style={phoneStyle} />
      </div>
      <div style={{
        position: 'absolute',
        left: '36%',
        top: '12%',
        width: '28%',
        height: '80%',
        zIndex: 3,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <PhoneFrame large={large} src={src} style={phoneStyle} />
      </div>
    </div>
  )
}

export function PolishedDeviceMultiClusterPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const src = deviceImageSrc(previewHints, 'TABLET_IMAGE') || deviceImageSrc(previewHints)
  const fillFrame = { width: '100%', height: '100%', maxWidth: 'none' }
  return (
    <div {...fp} style={{
      ...fp.style,
      padding: large ? '6% 5%' : '7% 4%',
      display: 'grid',
      gridTemplateColumns: '0.9fr 1.15fr',
      gap: large ? 16 : 6,
      alignItems: 'center',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: large ? 6 : 2, minWidth: 0 }}>
        <div style={{ fontSize: large ? '1.05rem' : '0.32rem', fontWeight: 800, color: theme.text, lineHeight: 1.05 }}>
          {previewHints.slots?.HEADING?.text || 'Multi-device'}
        </div>
        <div style={{ fontSize: large ? '1.05rem' : '0.32rem', fontWeight: 800, color: theme.primary || '#2563eb', lineHeight: 1.05 }}>
          {previewHints.slots?.HEADING_2?.text || 'experience'}
        </div>
        <div style={{ width: large ? 28 : 10, height: large ? 3 : 1, background: theme.primary || '#2563eb', borderRadius: 99 }} />
        <div style={{ fontSize: large ? '0.72rem' : '0.24rem', fontWeight: 500, color: theme.muted }}>
          {previewHints.slots?.SUBHEADING?.text || 'Title 01'}
        </div>
        <div style={{ fontSize: large ? '0.62rem' : '0.2rem', color: theme.muted, lineHeight: 1.4 }}>
          {previewHints.slots?.BODY?.text || 'Description 01'}
        </div>
      </div>
      <div style={{ position: 'relative', height: '100%', minHeight: large ? 140 : 48 }}>
        <div style={{
          position: 'absolute',
          left: '22%',
          top: '10%',
          width: '72%',
          height: '80%',
          borderRadius: '50%',
          background: '#dce8f4',
        }} />
        <div style={{ position: 'absolute', left: '36%', top: '0%', width: '32%', height: '78%', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
          <TabletFrame large={large} src={src} style={fillFrame} />
        </div>
        <div style={{ position: 'absolute', left: '2%', top: '48%', width: '44%', height: '46%', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
          <LaptopFrame large={large} src={src} style={fillFrame} />
        </div>
        <div style={{ position: 'absolute', left: '60%', top: '22%', width: '18%', height: '54%', zIndex: 3, display: 'flex', justifyContent: 'center' }}>
          <PhoneFrame large={large} src={src} style={fillFrame} />
        </div>
        <div style={{ position: 'absolute', left: '80%', top: '42%', width: '18%', height: '48%', zIndex: 4, display: 'flex', justifyContent: 'center' }}>
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
