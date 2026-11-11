import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiCheck, FiGrid, FiList, FiMinus } from 'react-icons/fi'
import ExportSlide from '../../../export-render/ExportSlide'
import { prepareDeck } from '../../../export-render/exportDeck'
import { EDITOR_STAGE_WIDTH } from '../../../utils/slideStageElements'
import {
  collectSlideFontFamilies,
  ensureElementFontsLoaded,
  ensureFontCssUrl,
  ensureThemeFontsLoaded,
} from '../../../utils/googleFonts'
import {
  formatPageRange,
  getSlideTitle,
  pageNumbersFromSlideIds,
  parsePageRange,
  slideIdsFromPageNumbers,
  toggleSlideSelection,
} from '../../../utils/export/slideSelection'

/** A slide drawn by the export renderer, scaled to `width`. Drawn once it scrolls into view. */
const SlideCanvas = memo(function SlideCanvas({ slide, stage, prepared, width }) {
  const hostRef = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const height = Math.round((width * stage.canvas.height) / stage.canvas.width)

  useEffect(() => {
    const node = hostRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '160px 0px' }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <span ref={hostRef} className="ppt-export-canvas" style={{ width, height }} aria-hidden>
      {visible ? (
        <span
          className="ppt-export-canvas-stage"
          style={{ width: EDITOR_STAGE_WIDTH, transform: `scale(${width / EDITOR_STAGE_WIDTH})` }}
        >
          <ExportSlide slide={slide} stage={stage} themeVisual={prepared.themeVisual} fontVars={prepared.fontVars} />
        </span>
      ) : null}
    </span>
  )
})

function Check({ on, partial = false }) {
  return (
    <span className={`ppt-export-check-box ${on || partial ? 'is-on' : ''}`} aria-hidden>
      {on ? <FiCheck size={12} strokeWidth={3} /> : partial ? <FiMinus size={12} strokeWidth={3} /> : null}
    </span>
  )
}

/** List row: checkbox, small thumbnail, "Page N" and the slide's title (Canva's page list). */
const PageRow = memo(function PageRow({ slide, stage, prepared, index, checked, onToggle }) {
  const title = getSlideTitle(slide, index)
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Page ${index + 1}: ${title}`}
      className={`ppt-export-page-row ${checked ? 'is-checked' : ''}`}
      onClick={(e) => onToggle(slide.id, e.shiftKey)}
    >
      <Check on={checked} />
      <SlideCanvas slide={slide} stage={stage} prepared={prepared} width={64} />
      <span className="ppt-export-page-text">
        <strong>Page {index + 1}</strong>
        <em title={title}>{title}</em>
      </span>
    </button>
  )
})

/** Grid tile: thumbnail with a checkbox in the corner, "Page N" under it. */
const PageTile = memo(function PageTile({ slide, stage, prepared, index, checked, onToggle }) {
  const title = getSlideTitle(slide, index)
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Page ${index + 1}: ${title}`}
      title={title}
      className={`ppt-export-page-tile ${checked ? 'is-checked' : ''}`}
      onClick={(e) => onToggle(slide.id, e.shiftKey)}
    >
      <span className="ppt-export-page-tile-frame">
        <SlideCanvas slide={slide} stage={stage} prepared={prepared} width={160} />
        <Check on={checked} />
      </span>
      <span className="ppt-export-page-tile-num">Page {index + 1}</span>
    </button>
  )
})

/**
 * Canva-style page picker: "All pages (N)" checkbox, a page range box ("1-3, 5"), and the pages
 * as a list (thumbnail + title) or a grid. Click toggles a page; shift-click selects a range.
 */
export default function ExportSlidePicker({ deck, selectedIds, onChange, disabled = false }) {
  const prepared = useMemo(() => (deck?.slides?.length ? prepareDeck({ deck }) : null), [deck])
  const anchorRef = useRef(null)
  const slides = useMemo(() => prepared?.slides || [], [prepared])
  const selected = useMemo(() => new Set(selectedIds || []), [selectedIds])
  const selectedRef = useRef(selectedIds)
  const [viewMode, setViewMode] = useState('list')
  // What the user is typing in the page box; null = show the current selection.
  const [rangeDraft, setRangeDraft] = useState(null)

  useEffect(() => {
    selectedRef.current = selectedIds
  }, [selectedIds])

  // "1-3, 5" for the selection ("1-12" when every page is picked, which the box can read back).
  const rangeText = useMemo(() => {
    const nums = pageNumbersFromSlideIds(slides, selectedIds)
    if (slides.length && nums.length === slides.length) return `1-${slides.length}`
    return formatPageRange(nums, slides.length)
  }, [slides, selectedIds])

  useEffect(() => {
    if (!prepared) return
    if (prepared.fontCssUrl) ensureFontCssUrl(prepared.fontCssUrl)
    else ensureThemeFontsLoaded(prepared.themeTokens)
    ensureElementFontsLoaded(collectSlideFontFamilies(prepared.slides))
  }, [prepared])

  // Stable, so a click re-draws only the pages whose checkbox changed.
  const toggle = useCallback(
    (slideId, range) => {
      if (disabled) return
      onChange(toggleSlideSelection(selectedRef.current, slides, slideId, { range, anchorId: anchorRef.current }))
      anchorRef.current = slideId
    },
    [disabled, onChange, slides]
  )

  const onRangeChange = (e) => {
    const value = e.target.value
    setRangeDraft(value)
    onChange(slideIdsFromPageNumbers(slides, parsePageRange(value, slides.length)))
  }

  if (!prepared) return <p className="ppt-export-picker-empty">Loading pages…</p>

  const count = slides.filter((s) => selected.has(s.id)).length
  const all = count === slides.length && slides.length > 0
  const Item = viewMode === 'grid' ? PageTile : PageRow

  return (
    <div className="ppt-export-picker">
      <div className="ppt-export-picker-bar">
        <button
          type="button"
          role="checkbox"
          aria-checked={all ? 'true' : count ? 'mixed' : 'false'}
          className="ppt-export-picker-all"
          disabled={disabled}
          onClick={() => {
            setRangeDraft(null)
            onChange(all ? [] : slides.map((s) => s.id))
          }}
        >
          <Check on={all} partial={!all && count > 0} />
          All pages ({slides.length})
        </button>
        <div className="ppt-export-view-switch" role="radiogroup" aria-label="Show pages as">
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'list'}
            className={viewMode === 'list' ? 'is-active' : ''}
            onClick={() => setViewMode('list')}
            title="List"
            aria-label="List"
          >
            <FiList size={14} />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'grid'}
            className={viewMode === 'grid' ? 'is-active' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid"
            aria-label="Grid"
          >
            <FiGrid size={14} />
          </button>
        </div>
      </div>

      <label className="ppt-export-picker-range">
        <span>Pages</span>
        <input
          type="text"
          inputMode="numeric"
          spellCheck={false}
          autoComplete="off"
          placeholder="e.g. 1-3, 5, 8"
          value={rangeDraft ?? rangeText}
          disabled={disabled}
          onChange={onRangeChange}
          onBlur={() => setRangeDraft(null)}
          aria-label="Pages to export, for example 1-3, 5"
        />
      </label>

      <div
        className={viewMode === 'grid' ? 'ppt-export-page-grid' : 'ppt-export-page-list'}
        role="group"
        aria-label="Pages to export"
      >
        {slides.map((slide, index) => (
          <Item
            key={slide.id}
            slide={slide}
            stage={prepared.stages[slide.id]}
            prepared={prepared}
            index={index}
            checked={selected.has(slide.id)}
            onToggle={toggle}
          />
        ))}
      </div>
      <p className="ppt-export-picker-tip">Shift-click to select a range of pages.</p>
    </div>
  )
}
