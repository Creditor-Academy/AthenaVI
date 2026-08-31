/**
 * SVG layout thumbnail — authoritative geometry from compileLayoutGeometry (1920×1080).
 * Scales crisply in catalog cards and matches canvas slot placement.
 */
import {
  compileLayoutGeometry,
  DEFAULT_CANVAS,
} from '../../utils/compileLayoutGeometry'
import {
  filterPreviewSlots,
  getGridDims,
  isFullBleedRegion,
  resolveSlotPreview,
  slotKind,
  slotTextAlign,
} from '../../utils/layoutPreviewUtils'
import { aspectRatioToCss } from '../../utils/deckPackTheme'

const CANVAS = DEFAULT_CANVAS

const THEME = {
  bg: '#ffffff',
  text: '#1f1f1f',
  muted: '#6f6f6f',
  icon: '#94a3b8',
  bar: '#64748b',
  imageBg: '#e2e8f0',
  imageBorder: '#94a3b8',
  accent: '#6366f1',
}

const SVG_FONT = {
  large: { title: 52, subtitle: 30, body: 26, caption: 22, stat: 80, logo: 24 },
  small: { title: 24, subtitle: 14, body: 12, caption: 10, stat: 34, logo: 11 },
}

function slotZIndex(kind) {
  if (kind === 'bg') return 0
  if (kind === 'decoration' || kind === 'icon') return 1
  if (kind === 'image' || kind === 'logo') return 2
  if (kind === 'chart') return 3
  return 4
}

function resolvePreviewImageSrc(previewHints = {}, slotId) {
  if (slotId && previewHints?.slots?.[slotId]?.imageUrl) return previewHints.slots[slotId].imageUrl
  if (previewHints?.imageUrl) return previewHints.imageUrl
  const slots = previewHints?.slots || {}
  for (const key of ['HERO_IMAGE', 'SIDE_IMAGE', 'POINT_IMAGE', 'BACKGROUND_IMAGE', 'COL_1_IMAGE', 'COL_2_IMAGE', 'IMAGE_1']) {
    if (slots[key]?.imageUrl) return slots[key].imageUrl
  }
  for (const slot of Object.values(slots)) {
    if (slot?.imageUrl) return slot.imageUrl
  }
  return ''
}

function slotPadding(geo, large) {
  const base = Math.min(geo.width, geo.height)
  return Math.round(base * (large ? 0.08 : 0.07))
}

function SvgImageIcon({ cx, cy, size }) {
  const s = size
  return (
    <g opacity={0.45} transform={`translate(${cx - s / 2}, ${cy - s / 2}) scale(${s / 24})`}>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke={THEME.icon} strokeWidth="1.5" />
      <path
        d="M7 15l3.5-3.5 2.5 2.5L17 10l4 5"
        fill="none"
        stroke={THEME.icon}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.5" fill={THEME.icon} />
    </g>
  )
}

function SvgBarChart({ x, y, width, height, large }) {
  const values = [4, 8, 6, 7, 3]
  const max = Math.max(...values, 1)
  const padX = width * 0.06
  const padY = height * 0.04
  const barW = (width - padX * 2) / values.length
  const chartH = height - padY * 2
  return (
    <g>
      {values.map((v, i) => {
        const barH = Math.max(chartH * 0.12, (v / max) * chartH)
        const bx = x + padX + i * barW + barW * 0.15
        const by = y + padY + chartH - barH
        return (
          <rect
            key={i}
            x={bx}
            y={by}
            width={barW * 0.7}
            height={barH}
            rx={large ? 4 : 2}
            fill={THEME.bar}
            opacity={0.75}
          />
        )
      })}
    </g>
  )
}

function SvgSlotForeignText({
  x,
  y,
  width,
  height,
  children,
  align = 'left',
  valign = 'center',
  pad,
}) {
  return (
    <foreignObject x={x + pad} y={y + pad} width={Math.max(1, width - pad * 2)} height={Math.max(1, height - pad * 2)}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: valign === 'top' ? 'flex-start' : valign === 'bottom' ? 'flex-end' : 'center',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </foreignObject>
  )
}

function SvgSlotContent({ slot, geo, large, previewHints, grid }) {
  const kind = slotKind(slot.id, slot.role)
  if (kind === 'decoration') return null

  const meta = resolveSlotPreview(slot, previewHints)
  const pad = slotPadding(geo, large)
  const fs = SVG_FONT[large ? 'large' : 'small']
  const fullBleed = isFullBleedRegion(slot.region, grid.ROWS, grid.COLS)
  const rx = fullBleed || kind === 'bg' ? 0 : large ? 14 : 6
  const imageSrc = meta.imageUrl || resolvePreviewImageSrc(previewHints, slot.id)
  const align = slotTextAlign(slot) || (meta.variant === 'title' ? 'left' : 'left')

  if (kind === 'image' || kind === 'bg' || meta.variant === 'image') {
    return (
      <g>
        <rect
          x={geo.x}
          y={geo.y}
          width={geo.width}
          height={geo.height}
          rx={rx}
          fill={THEME.imageBg}
          stroke={THEME.imageBorder}
          strokeWidth={1}
          opacity={kind === 'bg' ? 1 : 0.95}
        />
        {imageSrc ? (
          <foreignObject x={geo.x} y={geo.y} width={geo.width} height={geo.height}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{ width: '100%', height: '100%', borderRadius: rx, overflow: 'hidden' }}
            >
              <img
                src={imageSrc}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </foreignObject>
        ) : (
          <SvgImageIcon cx={geo.x + geo.width / 2} cy={geo.y + geo.height / 2} size={large ? 48 : 22} />
        )}
      </g>
    )
  }

  if (kind === 'logo' || meta.variant === 'logo') {
    const label = String(meta.text || 'logo').toLowerCase()
    return (
      <SvgSlotForeignText x={geo.x} y={geo.y} width={geo.width} height={geo.height} align="center" pad={pad}>
        <span
          style={{
            fontSize: fs.logo,
            fontWeight: 700,
            color: THEME.muted,
            letterSpacing: '0.06em',
            textTransform: 'lowercase',
          }}
        >
          {label}
        </span>
      </SvgSlotForeignText>
    )
  }

  if (kind === 'chart' || meta.variant === 'chart') {
    return (
      <g>
        <rect
          x={geo.x}
          y={geo.y}
          width={geo.width}
          height={geo.height}
          rx={rx}
          fill="#f8fafc"
          stroke={THEME.imageBorder}
          strokeWidth={0.5}
          opacity={0.5}
        />
        <SvgBarChart x={geo.x} y={geo.y} width={geo.width} height={geo.height} large={large} />
      </g>
    )
  }

  if (kind === 'icon') {
    const r = Math.min(geo.width, geo.height) * 0.35
    return (
      <circle
        cx={geo.x + geo.width / 2}
        cy={geo.y + geo.height / 2}
        r={r}
        fill={THEME.icon}
        opacity={0.45}
      />
    )
  }

  if (kind === 'stat' || meta.variant === 'stat') {
    const text = meta.text || slot.placeholder_text || '01'
    return (
      <SvgSlotForeignText x={geo.x} y={geo.y} width={geo.width} height={geo.height} align={align} pad={pad}>
        <span style={{ fontSize: fs.stat, fontWeight: 800, color: THEME.accent, lineHeight: 1 }}>{text}</span>
      </SvgSlotForeignText>
    )
  }

  const text =
    meta.text ||
    slot.placeholder_text ||
    (kind === 'heading'
      ? 'Your tagline or title'
      : kind === 'subheading'
        ? 'Supporting line'
        : kind === 'caption' || kind === 'eyebrow'
          ? 'Caption'
          : 'Explain what this section is about')

  const variant = meta.variant || kind
  let fontSize = fs.body
  let fontWeight = meta.bold ? 700 : 400
  let color = THEME.muted
  let lineClamp = large ? 4 : 3
  let textTransform = meta.uppercase ? 'uppercase' : 'none'

  if (variant === 'title' || kind === 'heading') {
    fontSize = fs.title
    fontWeight = meta.bold !== false ? 700 : 400
    color = THEME.text
    lineClamp = large ? 4 : 3
  } else if (variant === 'subheading' || kind === 'subheading') {
    fontSize = fs.subtitle
    color = THEME.muted
    lineClamp = large ? 3 : 2
  } else if (variant === 'caption' || kind === 'caption' || kind === 'eyebrow') {
    fontSize = fs.caption
    lineClamp = 2
  }

  return (
    <SvgSlotForeignText x={geo.x} y={geo.y} width={geo.width} height={geo.height} align={align} pad={pad}>
      <span
        style={{
          fontSize,
          fontWeight,
          color,
          lineHeight: 1.25,
          textTransform,
          display: '-webkit-box',
          WebkitLineClamp: lineClamp,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          width: '100%',
          textAlign: align,
        }}
      >
        {text}
      </span>
    </SvgSlotForeignText>
  )
}

export default function LayoutSvgPreview({
  slots = [],
  schema,
  large = false,
  fill = false,
  className,
  style,
  aspectRatio = '16:9',
}) {
  const resolvedSlots = filterPreviewSlots(slots.length ? slots : schema?.slots ?? [])
  const previewHints = schema?.preview ?? {}
  const grid = getGridDims(resolvedSlots)
  const cssAspect = aspectRatioToCss(aspectRatio)

  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset', minHeight: 0 }
    : { width: '100%', aspectRatio: cssAspect }

  if (!resolvedSlots.length) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          ...frameStyle,
          background: `repeating-linear-gradient(-45deg, #f8fafc, #f8fafc 6px, #f1f5f9 6px, #f1f5f9 12px)`,
          borderRadius: large ? 12 : 6,
          ...style,
        }}
      />
    )
  }

  const geometryMap = compileLayoutGeometry({ ...schema, slots: resolvedSlots }, CANVAS)
  const renderSlots = resolvedSlots
    .filter((slot) => slotKind(slot.id, slot.role) !== 'decoration')
    .sort((a, b) => slotZIndex(slotKind(a.id, a.role)) - slotZIndex(slotKind(b.id, b.role)))

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...frameStyle,
        background: THEME.bg,
        overflow: 'hidden',
        borderRadius: large ? 12 : 6,
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
        aria-hidden
      >
        <rect width={CANVAS.width} height={CANVAS.height} fill={THEME.bg} />
        {renderSlots.map((slot) => {
          const geo = geometryMap.get(slot.id)?.compiled
          if (!geo) return null
          return (
            <g key={slot.id}>
              <SvgSlotContent
                slot={slot}
                geo={geo}
                large={large}
                previewHints={previewHints}
                grid={grid}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
