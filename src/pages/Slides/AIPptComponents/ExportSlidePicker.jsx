import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import ExportSlide from '../../../export-render/ExportSlide'
import { prepareDeck } from '../../../export-render/exportDeck'
import { EDITOR_STAGE_WIDTH } from '../../../utils/slideStageElements'
import {
  collectSlideFontFamilies,
  ensureElementFontsLoaded,
  ensureFontCssUrl,
  ensureThemeFontsLoaded,
} from '../../../utils/googleFonts'
import { toggleSlideSelection } from '../../../utils/export/slideSelection'

const THUMB_WIDTH = 132

/** One slide, drawn by the export renderer and scaled down. Drawn once it scrolls into view. */
const SlideThumb = memo(function SlideThumb({ slide, stage, prepared, index, checked, onToggle }) {
  const hostRef = useRef(null)
  // No IntersectionObserver (old browsers, tests): draw straight away.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const scale = THUMB_WIDTH / EDITOR_STAGE_WIDTH
  const height = Math.round((THUMB_WIDTH * stage.canvas.height) / stage.canvas.width)

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
      aria-label={`Slide ${index + 1}`}
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
      <span className="ppt-export-thumb-num">{index + 1}</span>
    </button>
  )
})

/**
 * Grid of the deck's slides with a checkbox on each: click to toggle, shift-click to select a
 * range, plus Select all / Clear and a running count.
 * @param {object} props.deck  { aspectRatio, themeTokens, theme, slides } (editor or saved slides)
 */
export default function ExportSlidePicker({ deck, selectedIds, onChange, disabled = false }) {
  const prepared = useMemo(() => (deck?.slides?.length ? prepareDeck({ deck }) : null), [deck])
  const anchorRef = useRef(null)
  const slides = useMemo(() => prepared?.slides || [], [prepared])
  const selected = useMemo(() => new Set(selectedIds || []), [selectedIds])
  const selectedRef = useRef(selectedIds)
  useEffect(() => {
    selectedRef.current = selectedIds
  }, [selectedIds])

  // Stable, so a click re-draws only the thumbnails whose checkbox changed.
  const toggle = useCallback(
    (slideId, range) => {
      if (disabled) return
      onChange(toggleSlideSelection(selectedRef.current, slides, slideId, { range, anchorId: anchorRef.current }))
      anchorRef.current = slideId
    },
    [disabled, onChange, slides]
  )

  useEffect(() => {
    if (!prepared) return
    if (prepared.fontCssUrl) ensureFontCssUrl(prepared.fontCssUrl)
    else ensureThemeFontsLoaded(prepared.themeTokens)
    ensureElementFontsLoaded(collectSlideFontFamilies(prepared.slides))
  }, [prepared])

  if (!prepared) return <p className="ppt-export-picker-empty">Loading slides…</p>

  const count = slides.filter((s) => selected.has(s.id)).length

  return (
    <div className="ppt-export-picker">
      <div className="ppt-export-picker-bar">
        <span className="ppt-export-picker-count" aria-live="polite">
          {count} of {slides.length} slides
        </span>
        <span className="ppt-export-picker-actions">
          <button
            type="button"
            disabled={disabled || count === slides.length}
            onClick={() => onChange(slides.map((s) => s.id))}
          >
            Select all
          </button>
          <button type="button" disabled={disabled || count === 0} onClick={() => onChange([])}>
            Clear
          </button>
        </span>
      </div>
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
      <p className="ppt-export-picker-tip">Tip: shift-click to select a range.</p>
    </div>
  )
}
