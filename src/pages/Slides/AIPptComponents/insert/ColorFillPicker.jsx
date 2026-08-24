import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { cssGradientFromFill, resolveFillCss } from '../../../../utils/presentationHelpers'
import { cssColorToHex, getPptTextSelection, normalizeFillValue } from '../../../../utils/pptTextContent'
import './insertPanels.css'

const GRADIENT_PRESETS = [
  { kind: 'linear', angle: 90, stops: [{ color: '#6366F1', at: 0 }, { color: '#EC4899', at: 1 }] },
  { kind: 'linear', angle: 135, stops: [{ color: '#0EA5E9', at: 0 }, { color: '#22C55E', at: 1 }] },
  { kind: 'linear', angle: 90, stops: [{ color: '#F59E0B', at: 0 }, { color: '#EF4444', at: 1 }] },
  { kind: 'linear', angle: 120, stops: [{ color: '#111827', at: 0 }, { color: '#6B7280', at: 1 }] },
  { kind: 'linear', angle: 90, stops: [{ color: '#FFFFFF', at: 0 }, { color: '#94A3B8', at: 1 }] },
  { kind: 'radial', angle: 0, stops: [{ color: '#FDE68A', at: 0 }, { color: '#F97316', at: 1 }] },
  { kind: 'linear', angle: 45, stops: [{ color: '#7C3AED', at: 0 }, { color: '#2563EB', at: 0.5 }, { color: '#06B6D4', at: 1 }] },
  { kind: 'linear', angle: 180, stops: [{ color: '#0F172A', at: 0 }, { color: '#1D4ED8', at: 1 }] },
  { kind: 'radial', angle: 0, stops: [{ color: '#FBCFE8', at: 0 }, { color: '#7C3AED', at: 1 }] },
  { kind: 'linear', angle: 90, stops: [{ color: '#14B8A6', at: 0 }, { color: '#6366F1', at: 1 }] },
]

const SOLID_PRESETS = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#FFFFFF',
  '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
  '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
  '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
  '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
]

function toGradient(fill) {
  if (fill?.type === 'gradient') return fill
  const color = fill?.color || '#6366F1'
  return {
    type: 'gradient',
    kind: 'linear',
    angle: 90,
    stops: [
      { color, at: 0 },
      { color: '#EC4899', at: 1 },
    ],
  }
}

function hexForInput(value, fallback = '#000000') {
  const hex = cssColorToHex(value, fallback)
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : fallback
}

function themeSolids(palette) {
  if (!palette || typeof palette !== 'object') return []
  const keys = ['primary', 'accent', 'secondary', 'text', 'muted', 'bg', 'surface', 'background']
  const seen = new Set()
  const out = []
  for (const key of keys) {
    const hex = cssColorToHex(palette[key], '')
    const normalized = hex.toLowerCase()
    if (/^#[0-9a-fA-F]{6}$/.test(hex) && !seen.has(normalized)) {
      seen.add(normalized)
      out.push(hex)
    }
  }
  return out
}

function SolidSwatch({ color, active, disabled, onPick }) {
  return (
    <button
      type="button"
      className={`ppt-fill-picker-solid-swatch ${active ? 'is-active' : ''}`}
      style={{ background: color }}
      title={color}
      disabled={disabled}
      onClick={() => onPick(color)}
    />
  )
}

function ColorDot({ value, disabled, onChange, title }) {
  return (
    <label className="ppt-fill-picker-color-dot" title={title}>
      <span className="ppt-fill-picker-color-dot-face" style={{ background: value }} />
      <input
        type="color"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function FillPickerBody({
  fill,
  css,
  palette,
  disabled,
  fallbackHex,
  tab,
  onTab,
  emit,
  setSolid,
  setGradient,
  updateStop,
}) {
  const themeColors = themeSolids(palette)
  const gradient = toGradient(fill)
  const solidHex = hexForInput(fill.color || gradient.stops?.[0]?.color, fallbackHex)
  const currentSolid = (fill.type === 'solid' ? fill.color || '' : '').toLowerCase()
  const stops = gradient.stops || []
  const isRadial = (fill.type === 'gradient' ? fill.kind : gradient.kind) === 'radial'
  const angle = fill.type === 'gradient' ? fill.angle : gradient.angle

  return (
    <>
      <div className="ppt-fill-picker-tabs">
        <button
          type="button"
          className={tab === 'solid' ? 'is-active' : ''}
          onClick={() => onTab('solid')}
        >
          Solid
        </button>
        <button
          type="button"
          className={tab === 'gradient' ? 'is-active' : ''}
          onClick={() => onTab('gradient')}
        >
          Gradient
        </button>
      </div>

      {tab === 'solid' ? (
        <div className="ppt-fill-picker-solid-panel">
          {themeColors.length > 0 && (
            <>
              <div className="ppt-fill-picker-caption">Theme</div>
              <div className="ppt-fill-picker-solids ppt-fill-picker-solids--theme">
                {themeColors.map((color) => (
                  <SolidSwatch
                    key={color}
                    color={color}
                    active={currentSolid === color.toLowerCase()}
                    disabled={disabled}
                    onPick={setSolid}
                  />
                ))}
              </div>
            </>
          )}
          <div className="ppt-fill-picker-caption">Document colors</div>
          <div className="ppt-fill-picker-solids">
            {SOLID_PRESETS.map((color) => (
              <SolidSwatch
                key={color}
                color={color}
                active={currentSolid === color.toLowerCase()}
                disabled={disabled}
                onPick={setSolid}
              />
            ))}
          </div>
          <div className="ppt-fill-picker-solid">
            <ColorDot
              value={solidHex}
              disabled={disabled}
              title="Custom color"
              onChange={setSolid}
            />
            <input
              type="text"
              className="ppt-fill-picker-hex"
              value={fill.type === 'solid' ? fill.color || solidHex : solidHex}
              disabled={disabled}
              onChange={(e) => {
                const next = e.target.value.trim()
                if (/^#[0-9a-fA-F]{3,8}$/.test(next)) setSolid(next)
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="ppt-fill-picker-preview" style={{ background: cssGradientFromFill(gradient, palette) }} />
          <div className="ppt-fill-picker-tabs ppt-fill-picker-tabs--sub">
            <button
              type="button"
              className={!isRadial ? 'is-active' : ''}
              onClick={() => setGradient({ kind: 'linear' })}
            >
              Linear
            </button>
            <button
              type="button"
              className={isRadial ? 'is-active' : ''}
              onClick={() => setGradient({ kind: 'radial' })}
            >
              Radial
            </button>
          </div>
          {!isRadial && (
            <label className="ppt-fill-picker-angle">
              Angle
              <input
                type="range"
                min={0}
                max={360}
                value={angle ?? 90}
                disabled={disabled}
                onChange={(e) => setGradient({ angle: Number(e.target.value) })}
              />
              <span>{Math.round(angle ?? 90)}°</span>
            </label>
          )}
          <div className="ppt-fill-picker-stops">
            {stops.map((stop, i) => (
              <div key={i} className="ppt-fill-picker-stop">
                <ColorDot
                  value={hexForInput(stop.color, fallbackHex)}
                  disabled={disabled}
                  title={`Stop ${i + 1}`}
                  onChange={(color) => updateStop(i, { color })}
                />
                {stops.length > 2 && (
                  <button
                    type="button"
                    className="ppt-fill-picker-icon-btn"
                    title="Remove stop"
                    disabled={disabled}
                    onClick={() =>
                      setGradient({ stops: stops.filter((_, idx) => idx !== i) })
                    }
                  >
                    <FiMinus size={12} />
                  </button>
                )}
              </div>
            ))}
            {stops.length < 4 && (
              <button
                type="button"
                className="ppt-fill-picker-icon-btn"
                title="Add color"
                disabled={disabled}
                onClick={() =>
                  setGradient({
                    stops: [
                      ...stops,
                      {
                        color: stops[stops.length - 1]?.color || '#EC4899',
                        at: 1,
                      },
                    ].map((stop, i, all) => ({
                      ...stop,
                      at: all.length <= 1 ? 0 : i / (all.length - 1),
                    })),
                  })
                }
              >
                <FiPlus size={12} />
              </button>
            )}
          </div>
          <div className="ppt-fill-picker-caption">Gradients</div>
          <div className="ppt-fill-picker-presets">
            {GRADIENT_PRESETS.map((preset, i) => {
              const next = { type: 'gradient', ...preset }
              return (
                <button
                  key={i}
                  type="button"
                  className="ppt-fill-picker-preset"
                  title="Gradient preset"
                  disabled={disabled}
                  style={{ background: cssGradientFromFill(next, palette) }}
                  onClick={() => {
                    onTab('gradient')
                    emit(next)
                  }}
                />
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

export default function ColorFillPicker({
  value,
  palette,
  onChange,
  disabled = false,
  title = 'Color',
  compact = false,
  inline = false,
  fallbackHex = '#0F172A',
}) {
  const btnRef = useRef(null)
  const popRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 8, left: 8 })
  const [tab, setTab] = useState(() =>
    value && typeof value === 'object' && value.type === 'gradient' ? 'gradient' : 'solid'
  )
  const fill = useMemo(() => normalizeFillValue(value, fallbackHex), [value, fallbackHex])
  const css = resolveFillCss(fill, palette, fallbackHex)

  useEffect(() => {
    if (!open || inline) return undefined
    const onDoc = (e) => {
      if (btnRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onScroll = (e) => {
      if (popRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onResize = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, inline])

  const placePopover = (el) => {
    const rect = el.getBoundingClientRect()
    const width = 280
    const height = 420
    const top = rect.bottom + 8 + height > window.innerHeight
      ? Math.max(8, rect.top - height - 8)
      : rect.bottom + 8
    setPos({
      top: Math.min(top, window.innerHeight - 24),
      left: Math.min(Math.max(8, rect.left), window.innerWidth - width - 8),
    })
  }

  const emit = (next) => onChange?.(next)

  const setSolid = (color) => {
    setTab('solid')
    emit({ type: 'solid', color })
  }

  const setGradient = (patch) => {
    const base = toGradient(fill)
    setTab('gradient')
    emit({ ...base, ...patch, type: 'gradient' })
  }

  const updateStop = (index, patch) => {
    const base = toGradient(fill)
    const stops = base.stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop))
    setGradient({ stops })
  }

  const body = (
    <FillPickerBody
      fill={fill}
      css={css}
      palette={palette}
      disabled={disabled}
      fallbackHex={fallbackHex}
      tab={tab}
      onTab={setTab}
      emit={emit}
      setSolid={setSolid}
      setGradient={setGradient}
      updateStop={updateStop}
    />
  )

  const keepTextSelection = (e) => {
    if (e.target.closest('input, textarea, select')) return
    e.preventDefault()
  }

  if (inline) {
    return (
      <div className="ppt-fill-picker ppt-fill-picker--inline" onMouseDown={keepTextSelection}>
        <div className="ppt-fill-picker-pop ppt-fill-picker-pop--inline" role="group" aria-label={title}>
          {body}
        </div>
      </div>
    )
  }

  return (
    <div className={`ppt-fill-picker ${compact ? 'ppt-fill-picker--compact' : ''}`}>
      <button
        ref={btnRef}
        type="button"
        className="ppt-fill-picker-swatch"
        title={title}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{ background: css }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          if (disabled) return
          if (open) {
            setOpen(false)
            return
          }
          placePopover(e.currentTarget)
          const range = getPptTextSelection()
          if (range && range.end > range.start) setTab('solid')
          setOpen(true)
        }}
      />
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="ppt-fill-picker-pop"
            role="dialog"
            aria-label={title}
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={keepTextSelection}
          >
            {body}
          </div>,
          document.body
        )}
    </div>
  )
}
