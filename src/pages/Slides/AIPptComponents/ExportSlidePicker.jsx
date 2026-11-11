import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiCheck, FiGrid, FiList } from 'react-icons/fi'
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

const THUMB_WIDTH = 132

/** One slide in grid view, drawn by the export renderer and scaled down. */
const SlideThumb = memo(function SlideThumb({ slide, stage, prepared, index, checked, onToggle }) {
  const hostRef = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const scale = THUMB_WIDTH / EDITOR_STAGE_WIDTH
  const height = Math.round((THUMB_WIDTH * stage.canvas.height) / stage.canvas.width)
  const title = getSlideTitle(slide, index)

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
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Slide ${index + 1}: ${title}`}
      className={`ppt-export-thumb ${checked ? 'is-checked' : ''}`}
      onClick={(e) => onToggle(slide.id, e.shiftKey)}
    >
      <span ref={hostRef} className="ppt-export-thumb-frame" style={{ height }}>
        {visible ? (
          <span
            className="ppt-export-thumb-stage"
            style={{ width: EDITOR_STAGE_WIDTH, transform: `scale(${scale})` }}
            aria-hidden
          >
            <ExportSlide
              slide={slide}
              stage={stage}
              themeVisual={prepared.themeVisual}
              fontVars={prepared.fontVars}
            />
          </span>
        ) : null}
        <span className={`ppt-export-thumb-check ${checked ? 'is-on' : ''}`} aria-hidden>
          {checked ? <FiCheck size={12} /> : null}
        </span>
      </span>
      <span className="ppt-export-thumb-num">Page {index + 1}</span>
      <span className="ppt-export-thumb-title" title={title}>
        {title}
      </span>
    </button>
  )
})

/** One slide in list view (Canva style: checkbox + Page N + slide title). */
const SlideListItem = memo(function SlideListItem({ slide, index, checked, onToggle }) {
  const title = getSlideTitle(slide, index)
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className={`ppt-export-list-item ${checked ? 'is-checked' : ''}`}
      onClick={(e) => onToggle(slide.id, e.shiftKey)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onToggle(slide.id, false)
        }
      }}
    >
      <span className={`ppt-export-item-check ${checked ? 'is-on' : ''}`} aria-hidden>
        {checked ? <FiCheck size={12} /> : null}
      </span>
      <span className="ppt-export-item-badge">Page {index + 1}</span>
      <span className="ppt-export-item-title" title={title}>
        {title}
      </span>
    </div>
  )
})

/**
 * Canva-style Page Selector:
 * - Master checkbox: All pages (N)
 * - Page range input: "1-3, 5, 8"
 * - List view (Canva standard) and Grid view with thumbnails
 * - Select all / Clear
 * - Shift-click range selection
 */
export default function ExportSlidePicker({
  deck,
  selectedIds,
  onChange,
  disabled = false,
  onDone = null,
}) {
  const prepared = useMemo(() => (deck?.slides?.length ? prepareDeck({ deck }) : null), [deck])
  const anchorRef = useRef(null)
  const slides = useMemo(() => prepared?.slides || [], [prepared])
  const selected = useMemo(() => new Set(selectedIds || []), [selectedIds])
  const selectedRef = useRef(selectedIds)
  const [viewMode, setViewMode] = useState('list')
  const [rangeInput, setRangeInput] = useState('')
  const isTypingRef = useRef(false)

  useEffect(() => {
    selectedRef.current = selectedIds
    if (!isTypingRef.current && slides.length > 0) {
      const pageNums = pageNumbersFromSlideIds(slides, selectedIds)
      setRangeInput(formatPageRange(pageNums, slides.length))
    }
  }, [selectedIds, slides])

  const toggle = useCallback(
    (slideId, range) => {
      if (disabled) return
      isTypingRef.current = false
      onChange(toggleSlideSelection(selectedRef.current, slides, slideId, { range, anchorId: anchorRef.current }))
      anchorRef.current = slideId
    },
    [disabled, onChange, slides]
  )

  const handleRangeChange = useCallback(
    (e) => {
      const val = e.target.value
      setRangeInput(val)
      isTypingRef.current = true
      const parsed = parsePageRange(val, slides.length)
      const newIds = slideIdsFromPageNumbers(slides, parsed)
      onChange(newIds)
    },
    [onChange, slides]
  )

  const handleRangeBlur = useCallback(() => {
    isTypingRef.current = false
    const pageNums = pageNumbersFromSlideIds(slides, selectedRef.current)
    setRangeInput(formatPageRange(pageNums, slides.length))
  }, [slides])

  const handleMasterToggle = useCallback(() => {
    if (disabled) return
    isTypingRef.current = false
    if (selected.size === slides.length) {
      onChange([])
    } else {
      onChange(slides.map((s) => s.id))
    }
  }, [disabled, selected.size, slides, onChange])

  useEffect(() => {
    if (!prepared) return
    if (prepared.fontCssUrl) ensureFontCssUrl(prepared.fontCssUrl)
    else ensureThemeFontsLoaded(prepared.themeTokens)
    ensureElementFontsLoaded(collectSlideFontFamilies(prepared.slides))
  }, [prepared])

  if (!prepared) return <p className="ppt-export-picker-empty">Loading slides…</p>

  const count = slides.filter((s) => selected.has(s.id)).length
  const allSelected = count === slides.length && slides.length > 0

  return (
    <div className="ppt-export-picker">
      <div className="ppt-export-picker-bar">
        <label className="ppt-export-master-label">
          <span
            className={`ppt-export-item-check ${allSelected ? 'is-on' : ''}`}
            onClick={handleMasterToggle}
            aria-hidden
          >
            {allSelected ? <FiCheck size={12} /> : null}
          </span>
          <span className="ppt-export-picker-count" onClick={handleMasterToggle}>
            All pages ({slides.length})
          </span>
        </label>

        <div className="ppt-export-picker-actions">
          <div className="ppt-export-view-switch" role="group" aria-label="View mode">
            <button
              type="button"
              className={viewMode === 'list' ? 'is-active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <FiList size={13} /> List
            </button>
            <button
              type="button"
              className={viewMode === 'grid' ? 'is-active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <FiGrid size={13} /> Grid
            </button>
          </div>

          <button
            type="button"
            disabled={disabled || count === slides.length}
            onClick={() => {
              isTypingRef.current = false
              onChange(slides.map((s) => s.id))
            }}
          >
            All
          </button>
          <button
            type="button"
            disabled={disabled || count === 0}
            onClick={() => {
              isTypingRef.current = false
              onChange([])
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="ppt-export-picker-range-box">
        <label htmlFor="ppt-export-range-input">Pages:</label>
        <input
          id="ppt-export-range-input"
          type="text"
          className="ppt-export-picker-range-input"
          placeholder="e.g. 1-3, 5, 8"
          value={rangeInput}
          disabled={disabled}
          onChange={handleRangeChange}
          onBlur={handleRangeBlur}
        />
      </div>

      {viewMode === 'list' ? (
        <div className="ppt-export-picker-list" role="group" aria-label="Slides to export">
          {slides.map((slide, index) => (
            <SlideListItem
              key={slide.id}
              slide={slide}
              index={index}
              checked={selected.has(slide.id)}
              onToggle={toggle}
            />
          ))}
        </div>
      ) : (
        <div className="ppt-export-picker-grid" role="group" aria-label="Slides to export">
          {slides.map((slide, index) => (
            <SlideThumb
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
      )}

      <div className="ppt-export-picker-footer">
        <p className="ppt-export-picker-tip">
          {count} of {slides.length} selected. Shift-click to select a range.
        </p>
        {onDone ? (
          <button type="button" className="ppt-export-picker-done-btn" onClick={onDone}>
            Done
          </button>
        ) : null}
      </div>
    </div>
  )
}
