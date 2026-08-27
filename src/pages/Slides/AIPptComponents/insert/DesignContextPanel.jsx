import { useMemo } from 'react'
import { FiCrop, FiImage, FiLock, FiUnlock, FiRefreshCw } from 'react-icons/fi'
import ElementToolbar from './ElementToolbar'
import ElementPropertiesPanel from '../ElementPropertiesPanel'
import SlideTransitionPicker from './SlideTransitionPicker'
import ColorFillPicker from './ColorFillPicker'
import FontPicker from '../../../../components/shared/fonts/FontPicker'
import LayoutPolishedPreview from '../../../../components/ppt/LayoutPolishedPreview'
import { ensureGoogleFontLoaded } from '../../../../utils/googleFonts'
import { mediaFlipTransform, slideBackgroundFill } from '../../../../utils/presentationHelpers'
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
    <div className="ppt-props-stack">
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

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Default fonts</h3>
        </header>
        <div className="ppt-props-group-body ppt-slide-style-grid">
          <div className="ppt-slide-style-row">
            <FontPicker
              label="Header"
              value={slideStyles?.headerFont || 'Inter'}
              disabled={disabled}
              compact
              usedFontFamilies={usedFontFamilies}
              onChange={(family) => {
                ensureGoogleFontLoaded(family)
                onSlideStylesChange?.({ ...slideStyles, headerFont: family })
              }}
            />
          </div>
          <div className="ppt-slide-style-row">
            <FontPicker
              label="Body"
              value={slideStyles?.bodyFont || 'Inter'}
              disabled={disabled}
              compact
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
          <h3 className="ppt-props-group-title">Theme</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-static-value">{themeVisual?.name || 'Default'}</div>
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
                  onChange={(e) => updateCell(ri, ci, e.target.value)}
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
                nc[i] = fill
                onChangeContent?.({ ...c, colors: nc })
              }}
            />
          ))}
        </div>
      </div>
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
      {(c.url || c.src) && (
        <section className="ppt-props-group ppt-props-group--preview">
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
        </section>
      )}

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Media</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-actions ppt-props-actions--stack">
            <button
              type="button"
              className="ppt-props-action-btn"
              disabled={disabled}
              onClick={onReplaceImage}
            >
              <FiImage size={15} aria-hidden />
              Replace image
            </button>
            <button
              type="button"
              className="ppt-props-action-btn"
              disabled={disabled}
              onClick={onCropImage}
            >
              <FiCrop size={15} aria-hidden />
              Crop &amp; fit
            </button>
          </div>
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Position</h3>
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
            <span className="ppt-props-row-label">Opacity</span>
            <div className="ppt-props-slider">
              <input
                type="range"
                min={10}
                max={100}
                value={opacity}
                disabled={disabled}
                aria-label="Opacity"
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
        <ElementPropertiesPanel
          element={element}
          palette={palette}
          disabled={disabled}
          onChangeContent={onChangeElementContent}
          onChangePlacement={onChangeElementPlacement}
          onToggleLock={onToggleElementLock}
          toolbar={
            <ElementToolbar
              element={element}
              palette={palette}
              disabled={disabled}
              variant="panel"
              usedFontFamilies={usedFontFamilies}
              onChange={(content) => onChangeElementContent?.(content)}
            />
          }
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

      {!['slide', 'text', 'textbox', 'image', 'icon', 'chart', 'table'].includes(focus) && element && (
        <ElementPropertiesPanel
          element={element}
          palette={palette}
          disabled={disabled}
          onChangeContent={onChangeElementContent}
          onChangePlacement={onChangeElementPlacement}
          onToggleLock={onToggleElementLock}
          onReplaceImage={onReplaceImage}
          onCropImage={onCropImage}
        />
      )}
    </div>
  )
}
