import { useMemo, useState } from 'react'
import InsertPanelShell from './InsertPanelShell'
import { RailBrandIcon } from './insertBrandIcons'
import {
  getPptShapesForCategory,
  PPT_SHAPE_PANEL_CATEGORIES,
} from '../../../../constants/pptInsertCatalog'
import { normalizeApiShape } from '../../../../utils/presentationHelpers'

const ESSENTIAL_SHAPES = [
  {
    id: 'rect',
    name: 'Rectangle',
    path: 'M8 8h24v24H8z',
    content: { shape: 'rect', fill: '#475569' },
    presetId: 'shape_rect',
  },
  {
    id: 'rounded-rect',
    name: 'Rounded square',
    path: 'M12 8h16a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z',
    content: { shape: 'rounded-rect', fill: '#475569' },
    presetId: 'shape_rounded_rect',
  },
  {
    id: 'circle',
    name: 'Circle',
    path: 'M20 8a12 12 0 1 1 0 24 12 12 0 0 1 0-24z',
    circle: true,
    content: { shape: 'circle', fill: '#475569' },
    presetId: 'shape_circle',
  },
  {
    id: 'triangle',
    name: 'Triangle',
    path: 'M20 8 L32 32 H8 Z',
    content: { shape: 'triangle', fill: '#475569' },
    presetId: 'shape_triangle',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    path: 'M20 8 L32 20 L20 32 L8 20 Z',
    content: { shape: 'diamond', fill: '#475569' },
    presetId: 'shape_diamond',
  },
  {
    id: 'star',
    name: 'Star',
    path: 'M20 7l3.5 9.5H34l-8 5.8 3 9.7L20 26.2 11 32l3-9.7-8-5.8h10.5z',
    content: { shape: 'star', fill: '#475569' },
    presetId: 'shape_star',
  },
]

function ShapeSvg({ shape, variant }) {
  const filled = variant === 'filled'
  if (shape.circle) {
    return (
      <svg viewBox="0 0 40 40" className="ppt-shape-svg" aria-hidden>
        <circle
          cx="20"
          cy="20"
          r="12"
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={filled ? 0 : 2}
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 40" className="ppt-shape-svg" aria-hidden>
      <path
        d={shape.path}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 2}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function shapePreviewStyle(shape, variant = 'filled') {
  const s = { ...(shape.style || {}) }
  if (s.width) s.width = '48px'
  if (s.height === '0px') {
    s.width = '48px'
    s.height = '0px'
  } else if (s.height) {
    s.height = '48px'
  }

  if (variant === 'outlined') {
    const radius = s.borderRadius
    const isClip = Boolean(s.clipPath)
    if (isClip) {
      return {
        ...s,
        background: 'currentColor',
        opacity: 0.95,
        WebkitMaskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',
        filter: 'drop-shadow(0 0 0.6px currentColor)',
      }
    }
    return {
      ...s,
      background: 'transparent',
      border: `2.5px solid currentColor`,
      borderRadius: radius || s.borderRadius,
      boxSizing: 'border-box',
    }
  }
  return {
    ...s,
    background: s.background?.includes('transparent') ? s.background : 'currentColor',
    borderColor: s.border ? 'currentColor' : undefined,
  }
}

function expandWithVariants(shapes) {
  const out = []
  shapes.forEach((shape) => {
    const isLine = shape.category === 'lines' || String(shape.id).startsWith('line')
    if (isLine) {
      out.push({ ...shape, variant: 'filled', key: shape.id })
      return
    }
    out.push({ ...shape, variant: 'filled', key: `${shape.id}-filled` })
    out.push({ ...shape, variant: 'outlined', key: `${shape.id}-outlined` })
  })
  return out
}

export default function ShapePanel({ onInsert, disabled }) {
  const [activeId, setActiveId] = useState('essential')

  const rail = useMemo(
    () => [
      {
        label: 'Categories',
        items: PPT_SHAPE_PANEL_CATEGORIES.map((c) => ({
          id: c.id,
          label: c.label,
          icon: <RailBrandIcon id={c.id} />,
        })),
      },
    ],
    []
  )

  const libraryShapes = getPptShapesForCategory(activeId)
  const activeLabel =
    PPT_SHAPE_PANEL_CATEGORIES.find((c) => c.id === activeId)?.label || 'Shapes'
  const isEssential = activeId === 'essential'
  const expanded = useMemo(() => expandWithVariants(libraryShapes), [libraryShapes])

  const insertShape = (shapeId, variant, baseContent, presetId) => {
    const outlined = variant === 'outlined'
    const shape = normalizeApiShape(baseContent?.shape || shapeId)
    onInsert({
      type: 'shape',
      ...(presetId ? { presetId } : {}),
      content: {
        ...(baseContent || { shape, fill: '#475569' }),
        shape,
        fill: outlined ? 'transparent' : baseContent?.fill || '#475569',
        ...(outlined
          ? { stroke: '#475569', strokeWidth: 3, variant: 'outlined' }
          : { variant: 'filled' }),
      },
    })
  }

  return (
    <InsertPanelShell
      title="Shapes"
      rail={rail}
      activeRailId={activeId}
      onSelectRail={setActiveId}
      wide
      className="ppt-insert-panel--shapes"
    >
      <div className="ppt-shape-panel-head">
        <h3 className="ppt-insert-main-title">{activeLabel}</h3>
      </div>

      {isEssential ? (
        <div className="ppt-shape-icon-grid">
          {(['filled', 'outlined']).map((variant) =>
            ESSENTIAL_SHAPES.map((shape) => (
              <button
                key={`${shape.id}-${variant}`}
                type="button"
                className="ppt-shape-icon-btn"
                disabled={disabled}
                title={`${shape.name} (${variant})`}
                onClick={() =>
                  insertShape(shape.id, variant, shape.content, shape.presetId)
                }
              >
                <ShapeSvg shape={shape} variant={variant} />
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="ppt-shape-icon-grid ppt-shape-icon-grid--library">
          {expanded.map((shape) => (
            <button
              key={shape.key}
              type="button"
              className="ppt-shape-icon-btn"
              disabled={disabled}
              title={`${shape.name}${shape.variant === 'outlined' ? ' (outline)' : ''}`}
              onClick={() =>
                insertShape(
                  shape.id,
                  shape.variant,
                  shape.content || { shape: shape.id, fill: '#475569' },
                  shape.presetId
                )
              }
            >
              <span
                className="ppt-shape-preview"
                style={shapePreviewStyle(shape, shape.variant)}
              />
            </button>
          ))}
          {!expanded.length && <div className="ppt-insert-empty">No shapes in this category</div>}
        </div>
      )}
    </InsertPanelShell>
  )
}
