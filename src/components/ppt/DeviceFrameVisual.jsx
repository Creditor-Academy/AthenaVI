/**
 * Device mockup chrome for canvas rendering and shape-panel previews.
 * Procedural CSS — no image assets required.
 */

import { resolveFillCss, resolveThemeColor } from '../../utils/presentationHelpers'

const DEFAULT_FRAME = '#1e293b'

function parseHex(hex) {
  const raw = String(hex || DEFAULT_FRAME).replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  if (full.length !== 6) return { r: 30, g: 41, b: 59 }
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function toHex({ r, g, b }) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function shadeHex(hex, amount) {
  const { r, g, b } = parseHex(hex)
  const mix = amount >= 0 ? 255 : 0
  const t = Math.abs(amount)
  return toHex({
    r: r + (mix - r) * t,
    g: g + (mix - g) * t,
    b: b + (mix - b) * t,
  })
}

export function resolveDeviceFrameColor(content = {}, palette = {}) {
  const raw = content.frameColor || content.stroke || content.fill
  return (
    resolveThemeColor(raw, palette, resolveFillCss(raw, palette, DEFAULT_FRAME)) ||
    DEFAULT_FRAME
  )
}

function buildFrameTheme(frameColor = DEFAULT_FRAME) {
  return {
    frameOuter: frameColor,
    frame: shadeHex(frameColor, -0.12),
    bar: shadeHex(frameColor, -0.22),
    base: shadeHex(frameColor, -0.08),
    bezel: '#f8fafc',
    home: '#cbd5e1',
    camera: shadeHex(frameColor, -0.35),
  }
}

function ScreenPlaceholder({ src, style }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...style,
        }}
      />
    )
  }
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block', ...style }}>
      <rect width="100" height="60" fill="#bfdbfe" />
      <ellipse cx="22" cy="14" rx="10" ry="6" fill="#fff" opacity="0.85" />
      <ellipse cx="34" cy="16" rx="8" ry="5" fill="#fff" opacity="0.7" />
      <path d="M0 38 Q25 30 50 36 T100 34 V60 H0 Z" fill="#86efac" />
      <path d="M0 44 Q30 38 60 42 T100 40 V60 H0 Z" fill="#4ade80" opacity="0.85" />
    </svg>
  )
}

/** Narrow portrait phone — rounded, dynamic island, home indicator. */
function PhoneFrame({ landscape = false, src, compact = false, theme }) {
  const border = compact ? 3 : 6
  const radius = landscape ? (compact ? 10 : 16) : (compact ? 18 : 28)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: radius,
        border: `${border}px solid ${theme.frameOuter}`,
        outline: `${compact ? 1.5 : 3}px solid ${theme.frame}`,
        outlineOffset: compact ? -1 : -2,
        background: theme.bezel,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: compact ? '0 2px 8px rgba(15,23,42,0.12)' : '0 8px 24px rgba(15,23,42,0.18)',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {!landscape && (
        <div
          style={{
            position: 'absolute',
            top: compact ? 5 : 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: compact ? '24%' : '28%',
            height: compact ? 3 : 6,
            borderRadius: 99,
            background: theme.camera,
            zIndex: 2,
          }}
        />
      )}
      {!landscape && <div style={{ height: compact ? 8 : 14, flexShrink: 0 }} />}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          margin: landscape ? (compact ? '6px 8px' : '10px 14px') : (compact ? '0 5px' : '0 8px'),
          borderRadius: landscape ? (compact ? 4 : 8) : (compact ? 6 : 10),
        }}
      >
        <ScreenPlaceholder src={src} />
      </div>
      {!landscape && (
        <div
          style={{
            height: compact ? 8 : 14,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: compact ? '22%' : '26%',
              height: compact ? 2 : 4,
              borderRadius: 99,
              background: theme.home,
            }}
          />
        </div>
      )}
    </div>
  )
}

/** Wider tablet — squarer corners, front camera dot, no home bar. */
function TabletFrame({ landscape = false, src, compact = false, theme }) {
  const border = compact ? 2.5 : 5
  const radius = compact ? 6 : 12

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: radius,
        border: `${border}px solid ${theme.frameOuter}`,
        outline: `${compact ? 1 : 2}px solid ${theme.frame}`,
        outlineOffset: compact ? -1 : -2,
        background: theme.bezel,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: compact ? '0 2px 8px rgba(15,23,42,0.12)' : '0 8px 24px rgba(15,23,42,0.18)',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {!landscape && (
        <div
          style={{
            position: 'absolute',
            top: compact ? 4 : 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: compact ? 3 : 6,
            height: compact ? 3 : 6,
            borderRadius: '50%',
            background: theme.camera,
            zIndex: 2,
          }}
        />
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          margin: compact ? (landscape ? '5px 7px' : '10px 7px 7px') : (landscape ? '8px 12px' : '16px 12px 12px'),
          borderRadius: compact ? 3 : 6,
        }}
      >
        <ScreenPlaceholder src={src} />
      </div>
    </div>
  )
}

function LaptopFrame({ src, compact = false, theme }) {
  const border = compact ? 3 : 6
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          borderRadius: compact ? 6 : 12,
          border: `${border}px solid ${theme.frameOuter}`,
          outline: `${compact ? 1.5 : 3}px solid ${theme.frame}`,
          outlineOffset: compact ? -1 : -2,
          background: theme.bezel,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: compact ? '0 2px 8px rgba(15,23,42,0.12)' : '0 8px 24px rgba(15,23,42,0.18)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ height: compact ? 5 : 10, background: theme.bar, flexShrink: 0 }} />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <ScreenPlaceholder src={src} />
        </div>
      </div>
      <div
        style={{
          width: '112%',
          height: compact ? 5 : 10,
          marginTop: compact ? -1 : -2,
          borderRadius: compact ? 3 : 5,
          background: theme.base,
          border: `${compact ? 1 : 2}px solid ${theme.frameOuter}`,
          flexShrink: 0,
        }}
      />
    </div>
  )
}

function MonitorFrame({ src, compact = false, theme }) {
  const border = compact ? 3 : 8
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          borderRadius: `${compact ? 6 : 12}px ${compact ? 6 : 12}px 0 0`,
          border: `${border}px solid ${theme.frameOuter}`,
          outline: `${compact ? 1.5 : 3}px solid ${theme.frame}`,
          outlineOffset: compact ? -1 : -2,
          background: theme.bezel,
          overflow: 'hidden',
          boxShadow: compact
            ? `0 ${compact ? 8 : 16}px 0 -${compact ? 5 : 10}px ${theme.bar}`
            : `0 24px 0 -14px ${theme.bar}`,
          boxSizing: 'border-box',
        }}
      >
        <ScreenPlaceholder src={src} />
      </div>
      <div
        style={{
          width: compact ? '18%' : '22%',
          height: compact ? 8 : 16,
          background: theme.bar,
          borderRadius: `0 0 ${compact ? 3 : 6}px ${compact ? 3 : 6}px`,
          flexShrink: 0,
        }}
      />
    </div>
  )
}

function WatchFrame({ src, compact = false, theme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '72%',
          height: '88%',
          borderRadius: compact ? 10 : 18,
          border: `${compact ? 2 : 3}px solid ${theme.frameOuter}`,
          outline: `${compact ? 1 : 2}px solid ${theme.frame}`,
          background: theme.bezel,
          overflow: 'hidden',
          boxShadow: compact ? '0 2px 6px rgba(0,0,0,0.08)' : '0 4px 12px rgba(15,23,42,0.14)',
          boxSizing: 'border-box',
        }}
      >
        <ScreenPlaceholder src={src} style={{ borderRadius: compact ? 6 : 10 }} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: compact ? '8%' : '10%',
          top: '38%',
          width: compact ? 3 : 5,
          height: compact ? 8 : 14,
          borderRadius: 2,
          background: theme.frame,
        }}
      />
    </div>
  )
}

const FRAME_RENDERERS = {
  phone: (props) => <PhoneFrame {...props} />,
  phone_landscape: (props) => <PhoneFrame landscape {...props} />,
  tablet: (props) => <TabletFrame {...props} />,
  tablet_landscape: (props) => <TabletFrame landscape {...props} />,
  laptop: (props) => <LaptopFrame {...props} />,
  monitor: (props) => <MonitorFrame {...props} />,
  watch: (props) => <WatchFrame {...props} />,
}

/** @param {{ kind: string, src?: string, frameColor?: string, compact?: boolean, className?: string, style?: object }} props */
export default function DeviceFrameVisual({
  kind,
  src,
  frameColor = DEFAULT_FRAME,
  compact = false,
  className = '',
  style = {},
}) {
  const theme = buildFrameTheme(frameColor)
  const Render = FRAME_RENDERERS[kind] || FRAME_RENDERERS.phone
  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Render src={src} compact={compact} theme={theme} />
    </div>
  )
}

export const PPT_DEVICE_FRAME_KINDS = Object.keys(FRAME_RENDERERS)

export function isPptDeviceFrameElement(el) {
  if (!el || el.type !== 'shape') return false
  if (el.role === 'device_frame') return true
  const c = el.content || {}
  return Boolean(c.deviceFrame) || c.shape === 'device-frame'
}

/** Patch fields that fill the device screen area. */
export function buildDeviceFrameScreenPatch(src, extra = {}) {
  const url = typeof src === 'string' ? src : src?.url || src?.src || ''
  if (!url) return null
  return {
    screenUrl: url,
    url,
    src: url,
    fit: 'cover',
    ...(extra.assetId ? { assetId: extra.assetId } : {}),
    ...(extra.alt != null ? { alt: extra.alt } : {}),
    ...(extra.provider ? { provider: extra.provider } : {}),
  }
}

export function clearDeviceFrameScreenPatch() {
  return {
    screenUrl: null,
    url: null,
    src: null,
    thumbnailUrl: null,
    previewUrl: null,
    assetId: undefined,
  }
}
