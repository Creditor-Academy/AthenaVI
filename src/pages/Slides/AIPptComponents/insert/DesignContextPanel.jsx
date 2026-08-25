import ElementToolbar from './ElementToolbar'
import ElementPropertiesPanel from '../ElementPropertiesPanel'
import SlideTransitionPicker from './SlideTransitionPicker'
import ColorFillPicker from './ColorFillPicker'
import FontPicker from '../../../../components/shared/fonts/FontPicker'
import { ensureGoogleFontLoaded } from '../../../../utils/googleFonts'
import { slideBackgroundFill } from '../../../../utils/presentationHelpers'
import './insertPanels.css'
import '../pptEditorExtras.css'
import '../pptPanelUi.css'

const DEFAULT_SLIDE_BG = '#FFFFFF'

export { DEFAULT_SLIDE_BG }

function SlideDesignSection({
  slide,
  themeVisual,
  slideStyles,
  layoutTemplates,
  layoutLoading,
  selectedLayoutId,
  onSelectLayoutId,
  onApplyLayout,
  onBackgroundColorChange,
  onBackgroundGradientChange,
  onAddBackgroundImage,
  onSlideStylesChange,
  onChangeTransition,
  disabled,
}) {
  const currentTransition =
    slide?.transition || slide?.elements?.transition || 'none'

  return (
    <>
      <div className="ppt-slide-panel-section">
        <div className="ppt-slide-panel-label">Background</div>
        <div className="ppt-slide-panel-row">
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
          <button
            type="button"
            className="ppt-slide-panel-btn"
            disabled={disabled}
            onClick={() => onBackgroundColorChange?.(DEFAULT_SLIDE_BG)}
          >
            Reset to white
          </button>
        </div>
      </div>

      <div className="ppt-slide-panel-section">
        <div className="ppt-slide-panel-label">Background image</div>
        <button
          type="button"
          className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
          disabled={disabled}
          onClick={() => onAddBackgroundImage?.()}
        >
          Add background image
        </button>
      </div>

      <div className="ppt-slide-panel-section">
        <div className="ppt-slide-panel-label">Apply layout</div>
        {layoutLoading ? (
          <div className="ppt-slide-layer-empty">Loading layouts…</div>
        ) : layoutTemplates.length ? (
          <>
            <select
              className="ppt-slide-panel-select ppt-slide-layout-select"
              value={selectedLayoutId}
              disabled={disabled}
              onChange={(e) => onSelectLayoutId?.(e.target.value)}
            >
              {layoutTemplates.map((tpl) => {
                const id = tpl.id || tpl.templateId || tpl._id
                return (
                  <option key={id} value={id}>
                    {tpl.name || tpl.label || id}
                  </option>
                )
              })}
            </select>
            <button
              type="button"
              className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
              disabled={disabled || !selectedLayoutId}
              onClick={() => onApplyLayout?.(selectedLayoutId)}
            >
              Apply layout
            </button>
          </>
        ) : (
          <div className="ppt-slide-layer-empty">No layout templates in workspace</div>
        )}
      </div>

      <div className="ppt-slide-panel-section">
        <div className="ppt-slide-panel-label">Slide transition</div>
        <SlideTransitionPicker
          value={currentTransition}
          onChange={onChangeTransition}
          disabled={disabled}
          compact
        />
      </div>

      <div className="ppt-slide-panel-section">
        <div className="ppt-slide-panel-label">Slide style defaults</div>
        <div className="ppt-slide-style-grid">
          <div className="ppt-slide-style-row">
            <FontPicker
              label="Header font"
              value={slideStyles?.headerFont || 'Inter'}
              disabled={disabled}
              compact
              onChange={(family) => {
                ensureGoogleFontLoaded(family)
                onSlideStylesChange?.({ ...slideStyles, headerFont: family })
              }}
            />
          </div>
          <div className="ppt-slide-style-row">
            <FontPicker
              label="Body font"
              value={slideStyles?.bodyFont || 'Inter'}
              disabled={disabled}
              compact
              onChange={(family) => {
                ensureGoogleFontLoaded(family)
                onSlideStylesChange?.({ ...slideStyles, bodyFont: family })
              }}
            />
          </div>
        </div>
      </div>

      <div className="ppt-slide-panel-section">
        <div className="ppt-slide-panel-label">Theme</div>
        <div className="ppt-slide-panel-select">{themeVisual?.name || 'Default'}</div>
      </div>
    </>
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
    <div className="ppt-element-props-grid ppt-image-design-panel">
      {c.url || c.src ? (
        <div className="ppt-design-image-preview">
          <img src={c.url || c.src} alt="" />
        </div>
      ) : null}
      <button
        type="button"
        className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
        disabled={disabled}
        onClick={onReplaceImage}
      >
        Replace image
      </button>
      <button
        type="button"
        className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
        disabled={disabled}
        onClick={onCropImage}
      >
        Crop & fit
      </button>
      <div className="ppt-element-props-row ppt-element-props-row--switch">
        <span>Use as background</span>
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
      <div className="ppt-element-props-row">
        <span>Fit</span>
        <select
          value={c.fit || 'cover'}
          disabled={disabled}
          onChange={(e) => onChangeContent?.({ ...c, fit: e.target.value })}
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </div>
      <div className="ppt-element-props-row">
        <span>Opacity</span>
        <input
          type="range"
          min={10}
          max={100}
          value={opacity}
          disabled={disabled}
          onChange={(e) =>
            onChangePlacement?.({ ...p, opacity: Number(e.target.value) / 100 })
          }
        />
        <span>{opacity}%</span>
      </div>
      <div className="ppt-element-props-row">
        <span>Lock</span>
        <button type="button" disabled={disabled} onClick={onToggleLock}>
          {element?.locked ? 'Unlock' : 'Lock position'}
        </button>
      </div>
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
          selectedLayoutId={selectedLayoutId}
          onSelectLayoutId={onSelectLayoutId}
          onApplyLayout={onApplyLayout}
          onBackgroundColorChange={onBackgroundColorChange}
          onBackgroundGradientChange={onBackgroundGradientChange}
          onAddBackgroundImage={onAddBackgroundImage}
          onSlideStylesChange={onSlideStylesChange}
          onChangeTransition={onChangeTransition}
          disabled={disabled}
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
