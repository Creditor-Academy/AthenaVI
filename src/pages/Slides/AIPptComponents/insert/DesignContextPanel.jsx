import { useMemo } from 'react'
import { FiCrop, FiImage, FiLock, FiUnlock, FiRefreshCw } from 'react-icons/fi'
import ElementToolbar from './ElementToolbar'
import ElementPropertiesPanel from '../ElementPropertiesPanel'
import SlideTransitionPicker from './SlideTransitionPicker'
import ColorFillPicker from './ColorFillPicker'
import FontPicker from '../../../../components/shared/fonts/FontPicker'
import LayoutPolishedPreview from '../../../../components/ppt/LayoutPolishedPreview'
import { measureTextContentSize } from '../../../../utils/canvasTransformUtils'
import { ensureGoogleFontLoaded } from '../../../../utils/googleFonts'
import {
  mediaFlipTransform,
  PPT_SHAPE_BORDER_STYLES,
  normalizeShapeBorderStyle,
  slideBackgroundFill,
} from '../../../../utils/presentationHelpers'
import { normalizeFillValue } from '../../../../utils/pptTextContent'
import ElementTransformControls from '../ElementTransformControls'
import { resolveLayoutSchemaById } from '../../../../utils/deckLayoutRegistry'
import {
  pickSimilarLayouts,
  templateLayoutId,
  templateRecordId,
} from '../../../../utils/similarLayouts'
import './insertPanels.css'
import '../pptEditorExtras.css'
import '../pptPanelUi.css'

const DEFAULT_SLIDE_BG = '#FFFFFF'
const IMAGE_FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
]

export { DEFAULT_SLIDE_BG }

function themePaletteSwatches(themeVisual) {
  const p = themeVisual?.palette || {}
  const colors = [p.bg, p.primary, p.accent, p.secondary, p.text, p.muted]
  const seen = new Set()
  const out = []
  for (const color of colors) {
    const key = String(color || '').trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(color)
  }
  return out.slice(0, 5)
}

function fitTextBoxToContent(element) {
  const frame = document.querySelector(`[data-element-id="${element.id}"]`)
  if (!frame) return null
  const textEl =
    frame.querySelector('.ppt-text-display, .ppt-text-editable') || frame
  const measured = measureTextContentSize(textEl, { paddingX: 0, paddingY: 4 })
  if (!measured) return null
  const framePx = frame.getBoundingClientRect().height || 1
  const current = Number(element.placement?.height) || 40
  return Math.max(24, Math.round((measured.height / framePx) * current))
}

function SimilarLayoutThumb({ schema, aspectRatio }) {
  if (!schema) {
    return <div className="ppt-similar-layout-fallback">Layout</div>
  }
  return (
    <div className="ppt-similar-layout-preview-scaler">
      <div className="ppt-similar-layout-preview-inner">
        <LayoutPolishedPreview schema={schema} fill aspectRatio={aspectRatio} />
      </div>
    </div>
  )
}

function SlideDesignSection({
  slide,
  themeVisual,
  slideStyles,
  layoutTemplates,
  layoutLoading,
  layoutSchemaMap = {},
  aspectRatio = '16:9',
  selectedLayoutId,
  onSelectLayoutId,
  onApplyLayout,
  onBackgroundColorChange,
  onBackgroundGradientChange,
  onAddBackgroundImage,
  onSlideStylesChange,
  onChangeTransition,
  disabled,
  usedFontFamilies = [],
}) {
  const currentTransition =
    slide?.transition || slide?.elements?.transition || 'none'

  const similarLayouts = useMemo(
    () => pickSimilarLayouts(slide, layoutTemplates, layoutSchemaMap, 3),
    [slide, layoutTemplates, layoutSchemaMap]
  )

  const currentLayoutId = String(slide?.layoutId || slide?.layout_id || '').trim()

  const handlePickSimilar = (tpl) => {
    const id = templateRecordId(tpl)
    if (!id || disabled) return
    onSelectLayoutId?.(id)
    onApplyLayout?.(id)
  }

  return (
    <div className="ppt-props-stack ppt-slide-design-panel">
      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Background</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-row ppt-props-row--fill">
            <span className="ppt-props-row-label">Color</span>
            <div className="ppt-props-row-control">
              <ColorFillPicker
                title="Slide background"
                value={slideBackgroundFill(slide, DEFAULT_SLIDE_BG)}
                palette={themeVisual?.palette}
                disabled={disabled}
                fallbackHex={DEFAULT_SLIDE_BG}
                onChange={(fill) => {
                  if (fill?.type === 'solid') onBackgroundColorChange?.(fill.color || DEFAULT_SLIDE_BG)
                  else onBackgroundGradientChange?.(fill)
                }}
              />
            </div>
          </div>
          <div className="ppt-props-actions">
            <button
              type="button"
              className="ppt-props-action-btn"
              disabled={disabled}
              onClick={() => onAddBackgroundImage?.()}
            >
              <FiImage size={15} aria-hidden />
              Add image
            </button>
            <button
              type="button"
              className="ppt-props-action-btn ppt-props-action-btn--ghost"
              disabled={disabled}
              onClick={() => onBackgroundColorChange?.(DEFAULT_SLIDE_BG)}
            >
              <FiRefreshCw size={14} aria-hidden />
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Theme</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-theme-preview">
            <div className="ppt-theme-swatches" aria-hidden>
              {themePaletteSwatches(themeVisual).map((color) => (
                <span
                  key={color}
                  className="ppt-theme-swatch"
                  style={{ background: color }}
                />
              ))}
            </div>
            <span className="ppt-theme-name">{themeVisual?.name || 'Default'}</span>
          </div>
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Fonts</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-row ppt-props-row--stack">
            <span className="ppt-props-row-label">Heading</span>
            <FontPicker
              label=""
              value={slideStyles?.headerFont || 'Inter'}
              disabled={disabled}
              compact
              menuLabel="Heading font"
              usedFontFamilies={usedFontFamilies}
              onChange={(family) => {
                ensureGoogleFontLoaded(family)
                onSlideStylesChange?.({ ...slideStyles, headerFont: family })
              }}
            />
          </div>
          <div className="ppt-props-row ppt-props-row--stack">
            <span className="ppt-props-row-label">Body</span>
            <FontPicker
              label=""
              value={slideStyles?.bodyFont || 'Inter'}
              disabled={disabled}
              compact
              menuLabel="Body font"
              usedFontFamilies={usedFontFamilies}
              onChange={(family) => {
                ensureGoogleFontLoaded(family)
                onSlideStylesChange?.({ ...slideStyles, bodyFont: family })
              }}
            />
          </div>
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Layouts</h3>
        </header>
        <div className="ppt-props-group-body">
          {layoutLoading ? (
            <div className="ppt-props-empty">Loading layouts…</div>
          ) : similarLayouts.length ? (
            <div className="ppt-similar-layouts" role="list">
              {similarLayouts.map((tpl) => {
                const id = templateRecordId(tpl)
                const layoutId = templateLayoutId(tpl)
                const schema =
                  tpl?.schema ||
                  resolveLayoutSchemaById(layoutId, layoutSchemaMap) ||
                  null
                const isActive =
                  (selectedLayoutId && id === String(selectedLayoutId)) ||
                  (currentLayoutId && layoutId === currentLayoutId)
                return (
                  <button
                    key={id || layoutId}
                    type="button"
                    role="listitem"
                    className={`ppt-similar-layout-card ${isActive ? 'is-selected' : ''}`}
                    disabled={disabled || !id}
                    title={tpl.name || tpl.label || layoutId || 'Apply layout'}
                    onClick={() => handlePickSimilar(tpl)}
                  >
                    <div className="ppt-similar-layout-thumb">
                      <SimilarLayoutThumb schema={schema} aspectRatio={aspectRatio} />
                    </div>
                    <span className="ppt-similar-layout-name">
                      {tpl.name || tpl.label || layoutId || 'Layout'}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="ppt-props-empty">No similar layouts yet</div>
          )}
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Transition</h3>
        </header>
        <div className="ppt-props-group-body">
          <SlideTransitionPicker
            value={currentTransition}
            onChange={onChangeTransition}
            disabled={disabled}
            compact
          />
        </div>
      </section>
    </div>
  )
}

function TableDesignSection({ element, onChangeContent, disabled }) {
  const c = element?.content || {}
  const cells = Array.isArray(c.cells)
    ? c.cells.map((row) => [...(row || [])])
    : Array.isArray(c.rows)
      ? c.rows.map((row) => [...(row || [])])
      : [['Header 1', 'Header 2'], ['', '']]

  const patchCells = (nextCells) => {
    onChangeContent?.({
      ...c,
      cells: nextCells,
      rows: nextCells.length,
      cols: nextCells[0]?.length || 0,
    })
  }

  const updateCell = (ri, ci, value) => {
    const next = cells.map((row, rowIdx) =>
      rowIdx === ri ? row.map((cell, colIdx) => (colIdx === ci ? value : cell)) : row
    )
    patchCells(next)
  }

  const addRow = () => {
    const cols = cells[0]?.length || 2
    patchCells([...cells, Array.from({ length: cols }, () => '')])
  }

  const addColumn = () => {
    patchCells(cells.map((row, ri) => [...row, ri === 0 && c.hasHeader !== false ? `Header ${row.length + 1}` : '']))
  }

  return (
    <div className="ppt-design-context-panel">
      <div className="ppt-panel-section">
        <div className="ppt-slide-panel-label">Table data</div>
        <p className="ppt-slide-panel-hint">Click any cell to edit. Changes sync to the slide.</p>
        <div className="ppt-table-data-editor">
          <div
            className="ppt-table-data-grid"
            style={{ gridTemplateColumns: `repeat(${cells[0]?.length || 1}, minmax(72px, 1fr))` }}
          >
            {cells.map((row, ri) =>
              row.map((cell, ci) => (
                <input
                  key={`${ri}-${ci}`}
                  type="text"
                  className={`ppt-panel-input ppt-table-data-cell ${c.hasHeader !== false && ri === 0 ? 'is-header' : ''}`}
                  value={cell}
                  disabled={disabled}
                  placeholder={c.hasHeader !== false && ri === 0 ? `Header ${ci + 1}` : 'Value'}
                  onChange={(e) => {
                    const inputType = e.nativeEvent?.inputType
                    if (inputType === 'historyUndo' || inputType === 'historyRedo') return
                    updateCell(ri, ci, e.target.value)
                  }}
                />
              ))
            )}
          </div>
        </div>
        <div className="ppt-table-data-actions">
          <button type="button" className="ppt-slide-panel-btn" disabled={disabled} onClick={addRow}>
            + Row
          </button>
          <button type="button" className="ppt-slide-panel-btn" disabled={disabled} onClick={addColumn}>
            + Column
          </button>
        </div>
      </div>

      <div className="ppt-panel-section">
        <label className="ppt-panel-checkbox-row">
          <input
            type="checkbox"
            checked={c.hasHeader !== false}
            disabled={disabled}
            onChange={(e) => onChangeContent?.({ ...c, hasHeader: e.target.checked })}
          />
          <span>First row is header</span>
        </label>
      </div>
    </div>
  )
}

function ChartDesignSection({ element, palette, onChangeContent, disabled }) {
  const c = element?.content || {}
  const data = c.data || {}
  const labels = data.labels || c.labels || ['Q1', 'Q2', 'Q3', 'Q4']
  const values =
    data.series?.[0]?.values ||
    c.series?.[0]?.values ||
    (Array.isArray(c.series) ? c.series : [12, 19, 14, 22])
  const colors = c.colors || ['#7C3AED', '#A78BFA', '#FDBA74', '#34D399']
  const chartType = c.chartType === 'doughnut' ? 'donut' : (c.chartType || 'bar')

  const patchData = (nextLabels, nextValues) => {
    onChangeContent?.({
      ...c,
      labels: nextLabels,
      data: {
        labels: nextLabels,
        series: [{ name: data.series?.[0]?.name || 'Series', values: nextValues }],
      },
      series: [{ name: 'Series', values: nextValues }],
    })
  }

  return (
    <div className="ppt-design-context-panel">
      <div className="ppt-panel-section">
        <div className="ppt-slide-panel-label">Chart type</div>
        <select
          className="ppt-panel-select"
          value={chartType}
          disabled={disabled}
          onChange={(e) => onChangeContent?.({ ...c, chartType: e.target.value })}
        >
          <option value="bar">Bar</option>
          <option value="column">Column</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
          <option value="donut">Donut</option>
        </select>
      </div>

      <div className="ppt-panel-section">
        <div className="ppt-slide-panel-label">Data values</div>
        <div className="ppt-chart-data-table">
          <div className="ppt-chart-data-head">
            <span>Label</span>
            <span>Value</span>
          </div>
          {values.map((v, i) => (
            <div key={i} className="ppt-chart-data-row">
              <input
                type="text"
                className="ppt-panel-input"
                value={labels[i] || `Item ${i + 1}`}
                disabled={disabled}
                onChange={(e) => {
                  const nl = [...labels]
                  nl[i] = e.target.value
                  patchData(nl, values)
                }}
                placeholder="Label"
              />
              <input
                type="number"
                className="ppt-panel-input ppt-panel-input--number"
                value={v}
                disabled={disabled}
                onChange={(e) => {
                  const nv = [...values.map(Number)]
                  nv[i] = Number(e.target.value) || 0
                  patchData(labels, nv)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="ppt-panel-section">
        <div className="ppt-slide-panel-label">Chart colors</div>
        <div className="ppt-color-swatch-row">
          {colors.slice(0, 4).map((col, i) => (
            <ColorFillPicker
              key={i}
              compact
              title={`Color ${i + 1}`}
              value={col}
              palette={palette}
              disabled={disabled}
              fallbackHex="#7C3AED"
              onChange={(fill) => {
                const nc = [...colors]
                nc[i] = fillSolidColor(fill, '#7C3AED')
                onChangeContent?.({ ...c, colors: nc })
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function clampInt(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.round(n)))
}

function fillSolidColor(fill, fallback = '#0f172a') {
  const normalized = normalizeFillValue(fill, fallback)
  return normalized?.type === 'gradient' ? normalized.stops?.[0]?.color : normalized?.color
}

function ShapeDesignSection({
  element,
  palette,
  onChangeContent,
  onChangePlacement,
  onToggleLock,
  onReplaceImage,
  onClearDeviceFrameScreen,
  disabled,
}) {
  const c = element?.content || {}
  const p = element?.placement || {}
  const opacity = p.opacity != null ? Math.round(p.opacity * 100) : 100
  const isDeviceFrame = Boolean(c.deviceFrame || c.shape === 'device-frame')
  const isEmbed = element?.type === 'embed'
  const strokeWidth = clampInt(c.strokeWidth, 0, 20, 2)
  const cornerRadius = clampInt(c.borderRadius, 0, 64, isEmbed ? 8 : 0)
  const borderStyle = normalizeShapeBorderStyle(c.borderStyle)

  const patchContent = (updates) => onChangeContent?.(updates)
  const ensureVisibleStroke = (patch = {}) => {
    if ((c.strokeWidth ?? 0) <= 0) patch.strokeWidth = 2
    if (!c.stroke) patch.stroke = fillSolidColor(c.fill, '#0f172a')
    return patch
  }

  return (
    <div className="ppt-props-stack ppt-shape-design-panel">
      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Color</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-row ppt-props-row--fill">
            <span className="ppt-props-row-label">{isDeviceFrame ? 'Frame' : 'Fill'}</span>
            <div className="ppt-props-row-control">
              <ColorFillPicker
                title={isDeviceFrame ? 'Frame color' : 'Fill color'}
                value={normalizeFillValue(
                  isDeviceFrame ? c.stroke || c.frameColor || c.fill : c.fill,
                  '#1e293b'
                )}
                palette={palette}
                disabled={disabled}
                fallbackHex="#1e293b"
                onChange={(fill) => {
                  const color = fillSolidColor(fill, '#1e293b')
                  if (isDeviceFrame) {
                    patchContent({ stroke: color, frameColor: color, fill: color })
                    return
                  }
                  patchContent({ fill })
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {!isDeviceFrame && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Border</h3>
          </header>
          <div className="ppt-props-group-body">
            <div className="ppt-props-row ppt-props-row--fill">
              <span className="ppt-props-row-label">Color</span>
              <div className="ppt-props-row-control">
                <ColorFillPicker
                  title="Border color"
                  value={normalizeFillValue(c.stroke, '#0f172a')}
                  palette={palette}
                  disabled={disabled}
                  fallbackHex="#0f172a"
                  onChange={(fill) => {
                    const color = fillSolidColor(fill, '#0f172a')
                    patchContent(ensureVisibleStroke({ stroke: color }))
                  }}
                />
              </div>
            </div>
            <div className="ppt-props-row">
              <span className="ppt-props-row-label">Weight</span>
              <div className="ppt-props-row-control">
                <div className="ppt-size-stepper" title="Border weight">
                  <button
                    type="button"
                    disabled={disabled || strokeWidth <= 0}
                    aria-label="Decrease border weight"
                    onClick={() => patchContent({ strokeWidth: Math.max(0, strokeWidth - 1) })}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="ppt-size-stepper-input"
                    min={0}
                    max={20}
                    value={strokeWidth}
                    disabled={disabled}
                    aria-label="Border weight"
                    onChange={(e) =>
                      patchContent({ strokeWidth: clampInt(e.target.value, 0, 20, strokeWidth) })
                    }
                  />
                  <button
                    type="button"
                    disabled={disabled || strokeWidth >= 20}
                    aria-label="Increase border weight"
                    onClick={() => patchContent({ strokeWidth: Math.min(20, strokeWidth + 1) })}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="ppt-props-row ppt-props-row--stack">
              <span className="ppt-props-row-label">Style</span>
              <div className="ppt-shape-border-styles" role="radiogroup" aria-label="Border style">
                {PPT_SHAPE_BORDER_STYLES.map((opt) => {
                  const active = borderStyle === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      className={`ppt-shape-border-style ${active ? 'is-active' : ''}`}
                      title={opt.label}
                      aria-label={opt.label}
                      aria-checked={active}
                      disabled={disabled}
                      onClick={() => patchContent(ensureVisibleStroke({ borderStyle: opt.id }))}
                    >
                      <span className={`ppt-shape-border-style-line ppt-shape-border-style-line--${opt.id}`} />
                      <span className="ppt-shape-border-style-label">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {!isDeviceFrame && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Corners</h3>
          </header>
          <div className="ppt-props-group-body">
            <div className="ppt-props-row ppt-props-row--slider">
              <span className="ppt-props-row-label">Radius</span>
              <div className="ppt-props-slider">
                <input
                  type="range"
                  min={0}
                  max={64}
                  value={cornerRadius}
                  disabled={disabled}
                  aria-label="Corner radius"
                  onChange={(e) =>
                    patchContent({ borderRadius: clampInt(e.target.value, 0, 64, 0) })
                  }
                />
                <span className="ppt-props-slider-value">{cornerRadius}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {isDeviceFrame && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Screen</h3>
          </header>
          <div className="ppt-props-group-body">
            <p className="ppt-props-empty">
              Drag an image from Media onto this frame, or click an image while it is selected.
            </p>
            <div className="ppt-props-actions ppt-props-actions--stack">
              <button
                type="button"
                className="ppt-props-action-btn"
                disabled={disabled}
                onClick={onReplaceImage}
              >
                <FiImage size={15} aria-hidden />
                Replace screen image
              </button>
              {(c.screenUrl || c.url || c.src) && (
                <button
                  type="button"
                  className="ppt-props-action-btn ppt-props-action-btn--ghost"
                  disabled={disabled}
                  onClick={onClearDeviceFrameScreen}
                >
                  Clear screen image
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Transform</h3>
        </header>
        <div className="ppt-props-group-body">
          <ElementTransformControls
            key={element?.id || 'shape-transform'}
            placement={p}
            content={c}
            disabled={disabled}
            onChangePlacement={onChangePlacement}
            onChangeContent={onChangeContent}
          />
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Appearance</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-row ppt-props-row--slider">
            <span className="ppt-props-row-label">Transparency</span>
            <div className="ppt-props-slider">
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                disabled={disabled}
                aria-label="Transparency"
                onChange={(e) =>
                  onChangePlacement?.({ opacity: Number(e.target.value) / 100 })
                }
              />
              <span className="ppt-props-slider-value">{opacity}%</span>
            </div>
          </div>
          <div className="ppt-props-row ppt-props-row--switch">
            <span className="ppt-props-row-label">Lock position</span>
            <button
              type="button"
              className={`ppt-props-lock-btn ${element?.locked ? 'is-locked' : ''}`}
              disabled={disabled}
              onClick={onToggleLock}
              aria-pressed={!!element?.locked}
            >
              {element?.locked ? <FiLock size={14} aria-hidden /> : <FiUnlock size={14} aria-hidden />}
              {element?.locked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function ImageDesignSection({
  element,
  slide,
  onChangeContent,
  onChangePlacement,
  onToggleLock,
  onReplaceImage,
  onCropImage,
  onToggleUseAsBackground,
  disabled,
}) {
  const c = element?.content || {}
  const p = element?.placement || {}
  const opacity = p.opacity != null ? Math.round(p.opacity * 100) : 100
  const isBackground =
    Boolean(c.useAsBackground) || slide?.backgroundImageElementId === element?.id
  const canUseAsBackground = Boolean(c.url || c.src || c.thumbnailUrl)

  return (
    <div className="ppt-props-stack ppt-image-design-panel">
      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Media</h3>
        </header>
        <div className="ppt-props-group-body">
          {(c.url || c.src) && (
            <div className="ppt-design-image-preview">
              <img
                src={c.url || c.src}
                alt=""
                className="ppt-media-flip"
                style={{
                  transform: mediaFlipTransform(c),
                  transformOrigin: 'center center',
                }}
              />
            </div>
          )}
          <div className="ppt-props-actions">
            <button
              type="button"
              className="ppt-props-action-btn"
              disabled={disabled}
              onClick={onReplaceImage}
            >
              <FiImage size={15} aria-hidden />
              Replace
            </button>
            <button
              type="button"
              className="ppt-props-action-btn"
              disabled={disabled}
              onClick={onCropImage}
            >
              <FiCrop size={15} aria-hidden />
              Crop
            </button>
          </div>
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Crop &amp; fit</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-row ppt-props-row--stack">
            <span className="ppt-props-row-label">Fit</span>
            <div className="ppt-segmented" role="radiogroup" aria-label="Image fit">
              {IMAGE_FIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={(c.fit || 'cover') === opt.value}
                  className={`ppt-segmented-btn ${(c.fit || 'cover') === opt.value ? 'is-active' : ''}`}
                  disabled={disabled}
                  onClick={() => onChangeContent?.({ fit: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="ppt-props-row ppt-props-row--switch">
            <span className="ppt-props-row-label">Use as background</span>
            <button
              type="button"
              className={`ppt-toggle-switch ${isBackground ? 'is-on' : ''}`}
              role="switch"
              aria-checked={isBackground}
              aria-label="Use as background"
              disabled={disabled || (!canUseAsBackground && !isBackground)}
              onClick={() => onToggleUseAsBackground?.(!isBackground)}
            />
          </div>
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Transform</h3>
        </header>
        <div className="ppt-props-group-body">
          <ElementTransformControls
            key={element?.id || 'transform'}
            placement={p}
            content={c}
            showFlip
            disabled={disabled}
            onChangePlacement={onChangePlacement}
            onChangeContent={onChangeContent}
          />
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Appearance</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-row ppt-props-row--slider">
            <span className="ppt-props-row-label">Transparency</span>
            <div className="ppt-props-slider">
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                disabled={disabled}
                aria-label="Transparency"
                onChange={(e) =>
                  onChangePlacement?.({ opacity: Number(e.target.value) / 100 })
                }
              />
              <span className="ppt-props-slider-value">{opacity}%</span>
            </div>
          </div>
          <div className="ppt-props-row ppt-props-row--switch">
            <span className="ppt-props-row-label">Lock position</span>
            <button
              type="button"
              className={`ppt-props-lock-btn ${element?.locked ? 'is-locked' : ''}`}
              disabled={disabled}
              onClick={onToggleLock}
              aria-pressed={!!element?.locked}
            >
              {element?.locked ? <FiLock size={14} aria-hidden /> : <FiUnlock size={14} aria-hidden />}
              {element?.locked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function TextDesignSection({
  element,
  palette,
  usedFontFamilies = [],
  onChangeContent,
  onChangePlacement,
  onToggleLock,
  disabled,
}) {
  const p = element?.placement || {}
  const c = element?.content || {}
  const opacity = p.opacity != null ? Math.round(p.opacity * 100) : 100

  return (
    <div className="ppt-props-stack ppt-text-design-panel">
      <ElementToolbar
        element={element}
        palette={palette}
        disabled={disabled}
        variant="panel"
        usedFontFamilies={usedFontFamilies}
        onChange={(content) => onChangeContent?.(content)}
      />

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Transform</h3>
        </header>
        <div className="ppt-props-group-body">
          <ElementTransformControls
            key={element?.id || 'text-transform'}
            placement={p}
            content={c}
            disabled={disabled}
            onChangePlacement={onChangePlacement}
            onChangeContent={onChangeContent}
          />
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Appearance</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-row ppt-props-row--slider">
            <span className="ppt-props-row-label">Transparency</span>
            <div className="ppt-props-slider">
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                disabled={disabled}
                aria-label="Transparency"
                onChange={(e) =>
                  onChangePlacement?.({ opacity: Number(e.target.value) / 100 })
                }
              />
              <span className="ppt-props-slider-value">{opacity}%</span>
            </div>
          </div>
          <div className="ppt-props-row ppt-props-row--switch">
            <span className="ppt-props-row-label">Lock position</span>
            <button
              type="button"
              className={`ppt-props-lock-btn ${element?.locked ? 'is-locked' : ''}`}
              disabled={disabled}
              onClick={onToggleLock}
              aria-pressed={!!element?.locked}
            >
              {element?.locked ? <FiLock size={14} aria-hidden /> : <FiUnlock size={14} aria-hidden />}
              {element?.locked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
          <div className="ppt-props-actions">
            <button
              type="button"
              className="ppt-props-action-btn"
              disabled={disabled}
              onClick={() => {
                const nextH = fitTextBoxToContent(element)
                if (nextH) onChangePlacement?.({ height: nextH })
              }}
            >
              Fit to text
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

const PANEL_TITLES = {
  slide: 'Slide design',
  text: 'Text',
  image: 'Image',
  icon: 'Image',
  chart: 'Chart',
  shape: 'Shape',
  table: 'Table',
  embed: 'Embed',
}

/**
 * Context-aware design panel — slide bg/layouts or element-specific editors.
 */
export default function DesignContextPanel({
  focus = 'slide',
  slide,
  element,
  themeVisual,
  palette,
  slideStyles,
  layoutTemplates,
  layoutLoading,
  layoutSchemaMap = {},
  aspectRatio = '16:9',
  selectedLayoutId,
  onSelectLayoutId,
  onApplyLayout,
  onBackgroundColorChange,
  onBackgroundGradientChange,
  onAddBackgroundImage,
  onSlideStylesChange,
  onChangeElementContent,
  onChangeElementPlacement,
  onToggleElementLock,
  onReplaceImage,
  onClearDeviceFrameScreen,
  onCropImage,
  onToggleImageAsBackground,
  onChangeTransition,
  disabled,
  usedFontFamilies = [],
}) {
  return (
    <div className="ppt-design-context-panel">
      {focus === 'slide' && (
        <SlideDesignSection
          slide={slide}
          themeVisual={themeVisual}
          slideStyles={slideStyles}
          layoutTemplates={layoutTemplates}
          layoutLoading={layoutLoading}
          layoutSchemaMap={layoutSchemaMap}
          aspectRatio={aspectRatio}
          selectedLayoutId={selectedLayoutId}
          onSelectLayoutId={onSelectLayoutId}
          onApplyLayout={onApplyLayout}
          onBackgroundColorChange={onBackgroundColorChange}
          onBackgroundGradientChange={onBackgroundGradientChange}
          onAddBackgroundImage={onAddBackgroundImage}
          onSlideStylesChange={onSlideStylesChange}
          onChangeTransition={onChangeTransition}
          disabled={disabled}
          usedFontFamilies={usedFontFamilies}
        />
      )}

      {(focus === 'text' || focus === 'textbox') && element && (
        <TextDesignSection
          element={element}
          palette={palette}
          disabled={disabled}
          usedFontFamilies={usedFontFamilies}
          onChangeContent={onChangeElementContent}
          onChangePlacement={onChangeElementPlacement}
          onToggleLock={onToggleElementLock}
        />
      )}

      {(focus === 'image' || focus === 'icon') && element && (
        <ImageDesignSection
          element={element}
          slide={slide}
          onChangeContent={onChangeElementContent}
          onChangePlacement={onChangeElementPlacement}
          onToggleLock={onToggleElementLock}
          onReplaceImage={onReplaceImage}
          onCropImage={onCropImage}
          onToggleUseAsBackground={(enabled) =>
            onToggleImageAsBackground?.(element.id, enabled)
          }
          disabled={disabled}
        />
      )}

      {(focus === 'shape' || focus === 'embed') && element && (
        <ShapeDesignSection
          element={element}
          palette={palette}
          disabled={disabled}
          onChangeContent={onChangeElementContent}
          onChangePlacement={onChangeElementPlacement}
          onToggleLock={onToggleElementLock}
          onReplaceImage={onReplaceImage}
          onClearDeviceFrameScreen={onClearDeviceFrameScreen}
        />
      )}

      {focus === 'chart' && element && (
        <ChartDesignSection
          element={element}
          palette={palette}
          onChangeContent={onChangeElementContent}
          disabled={disabled}
        />
      )}

      {focus === 'table' && element && (
        <TableDesignSection
          element={element}
          onChangeContent={onChangeElementContent}
          disabled={disabled}
        />
      )}

      {!['slide', 'text', 'textbox', 'image', 'icon', 'chart', 'table', 'shape', 'embed'].includes(focus) && element && (
        <ElementPropertiesPanel
          element={element}
          palette={palette}
          disabled={disabled}
          onChangeContent={onChangeElementContent}
          onChangePlacement={onChangeElementPlacement}
          onToggleLock={onToggleElementLock}
          onReplaceImage={onReplaceImage}
          onClearDeviceFrameScreen={onClearDeviceFrameScreen}
          onCropImage={onCropImage}
        />
      )}
    </div>
  )
}
