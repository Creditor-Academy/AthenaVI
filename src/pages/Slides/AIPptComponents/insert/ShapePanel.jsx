import { useMemo, useState } from 'react'
import InsertPanelShell from './InsertPanelShell'
import { RailBrandIcon } from './insertBrandIcons'
import {
  getPptShapesForCategory,
  PPT_SHAPE_PANEL_CATEGORIES,
} from '../../../../constants/pptInsertCatalog'
import { SHAPE_LIBRARY } from '../../../../constants/shapeLibrary'
import DeviceFrameVisual from '../../../../components/ppt/DeviceFrameVisual'
import ClipShapeSvg from '../../../../components/ppt/ClipShapeSvg'
import { parsePolygonClipPath } from '../../../../utils/shapeClipSvg'

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

function ShapePreview({ shape, variant = 'filled' }) {
  const s = shape.style || {}
  const isLine = shape.category === 'lines' || String(shape.id).startsWith('line')
  const outlined = variant === 'outlined'
  const clipPath = s.clipPath
  const hasPolygon = Boolean(clipPath && parsePolygonClipPath(clipPath))

  if (hasPolygon) {
    return (
      <span className="ppt-shape-preview ppt-shape-preview--svg">
        <ClipShapeSvg
          clipPath={clipPath}
          fill="#475569"
          stroke="#475569"
          strokeWidth={2.5}
          outlined={outlined}
        />
      </span>
    )
  }

  if (isLine) {
    return (
      <span
        className="ppt-shape-preview"
        style={{
          width: '48px',
          height: '0px',
          borderTop: s.borderTop || '3px solid currentColor',
          background: 'transparent',
        }}
      />
    )
  }

  if (outlined) {
    return (
      <span
        className="ppt-shape-preview"
        style={{
          width: '48px',
          height: '48px',
          background: 'transparent',
          border: '2.5px solid currentColor',
          borderRadius: s.borderRadius || 0,
          boxSizing: 'border-box',
          ...(s.border ? { border: s.border.replace(/var\(--primary\)|#\w+/g, 'currentColor') } : {}),
        }}
      />
    )
  }

  return (
    <span
      className="ppt-shape-preview"
      style={{
        width: '48px',
        height: '48px',
        background: s.background?.includes('transparent') ? 'transparent' : 'currentColor',
        borderRadius: s.borderRadius || 0,
        border: s.border ? String(s.border).replace(/var\(--primary\)/g, 'currentColor') : undefined,
        boxSizing: 'border-box',
      }}
    />
  )
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
  const isDevices = activeId === 'devices'
  const isEssential = activeId === 'essential'
  const expanded = useMemo(() => expandWithVariants(libraryShapes), [libraryShapes])

  const insertShape = (shapeId, variant, baseContent, presetId) => {
    const outlined = variant === 'outlined'
    const shapeKey = String(baseContent?.shape || shapeId)
    const libEntry = SHAPE_LIBRARY.find((s) => s.id === shapeKey)
    const libStyle = libEntry?.style || {}
    const defaultFill = '#475569'
    onInsert({
      type: 'shape',
      ...(presetId ? { presetId } : {}),
      content: {
        shape: shapeKey,
        fill: outlined ? 'transparent' : baseContent?.fill || defaultFill,
        ...(libStyle.clipPath ? { clipPath: libStyle.clipPath } : {}),
        ...(libStyle.borderRadius != null ? { borderRadius: libStyle.borderRadius } : {}),
        ...(libStyle.border && !outlined ? { border: libStyle.border } : {}),
        ...(outlined
          ? { stroke: defaultFill, strokeWidth: 3, variant: 'outlined' }
          : { stroke: undefined, variant: 'filled' }),
      },
    })
  }

  const insertDeviceFrame = (device) => {
    onInsert({
      type: 'shape',
      role: 'device_frame',
      presetId: device.id,
      placement: device.placement,
      content: { ...(device.content || {}) },
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
        {isEssential && (
          <p className="ppt-slide-panel-hint" style={{ margin: '4px 0 0' }}>
            Full cover and outline for each shape
          </p>
        )}
      </div>

      {isDevices ? (
        <div className="ppt-shape-icon-grid ppt-shape-icon-grid--devices">
          {libraryShapes.map((device) => (
            <button
              key={device.id}
              type="button"
              className="ppt-shape-icon-btn ppt-shape-icon-btn--device"
              disabled={disabled}
              title={device.name}
              onClick={() => insertDeviceFrame(device)}
            >
              <span
                className="ppt-device-frame-preview"
                style={{ aspectRatio: device.previewAspect || '1' }}
              >
                <DeviceFrameVisual kind={device.deviceFrame} compact />
              </span>
              <span className="ppt-device-frame-label">{device.name}</span>
            </button>
          ))}
          {!libraryShapes.length && <div className="ppt-insert-empty">No devices available</div>}
        </div>
      ) : (
        <div
          className={`ppt-shape-icon-grid ppt-shape-icon-grid--library ${
            isEssential ? 'ppt-shape-icon-grid--essential' : ''
          }`}
        >
          {expanded.map((shape) => (
            <button
              key={shape.key}
              type="button"
              className="ppt-shape-icon-btn"
              disabled={disabled}
              title={`${shape.name}${shape.variant === 'outlined' ? ' (outline)' : ' (full cover)'}`}
              onClick={() =>
                insertShape(
                  shape.id,
                  shape.variant,
                  shape.content || { shape: shape.id, fill: '#475569' },
                  shape.presetId
                )
              }
            >
              <ShapePreview shape={shape} variant={shape.variant} />
            </button>
          ))}
          {!expanded.length && <div className="ppt-insert-empty">No shapes in this category</div>}
        </div>
      )}
    </InsertPanelShell>
  )
}
