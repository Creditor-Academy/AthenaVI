import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiMaximize,
  FiMinimize,
  FiRadio,
  FiTarget,
  FiX,
} from 'react-icons/fi'
import SlideshowStage from './SlideshowStage'
import { slideLayout } from './slideLayout'
import useSlideshow, { useSpotlight } from './useSlideshow'
import useIdleControls from './useIdleControls'
import { slideshowKeyAction, targetIndex } from './slideshowKeys'
import {
  canFullscreen,
  exitPresentFullscreen,
  fullscreenElement,
  onFullscreenChange,
  requestPresentFullscreen,
} from './fullscreen'
import '../PresentMode.css'

const NOTES_PREF_KEY = 'athenavi:present-notes'

function readNotesPref() {
  try {
    return localStorage.getItem(NOTES_PREF_KEY) === '1'
  } catch {
    return false
  }
}

function writeNotesPref(on) {
  try {
    localStorage.setItem(NOTES_PREF_KEY, on ? '1' : '0')
  } catch {
    /* private mode / storage blocked: the choice just isn't remembered */
  }
}

/**
 * The audience's screen during a slideshow (Present plan, Phase 2): the slide edge to edge on
 * black, and one small toolbar in the bottom-left corner that hides, with the cursor, when the
 * mouse is still. Nothing else is drawn over the slide unless the presenter asks for it
 * (facilitator notes, S).
 *
 * Full screen is asked for by the editor's Present button (it needs the click); leaving it
 * (Esc, or the browser) ends the show, as in PowerPoint and Google Slides. Where full screen
 * isn't available, or after "Exit full screen" in the toolbar, the show runs in the window.
 *
 * Props are the ones the editor has always passed to PresentMode.
 */
export default function AudienceView({
  slides = [],
  themeVisual,
  aspectRatio = '16:9',
  initialSlideIndex = 0,
  onClose,
  // 'presenter' (member: facilitator notes, can present to viewers) | 'audience' (guest, follows)
  chrome = 'presenter',
  // { presenter, isPresenting, conflict, canPresent, onStartPresenting, onStopPresenting } | null
  presence = null,
  onIndexChange,
  // CSS variables for the deck's theme fonts (--ppt-font-heading / --ppt-font-body).
  fontVars = null,
}) {
  const show = useSlideshow({ slides, initialSlideIndex, chrome, presence, onIndexChange })
  const { index, count, slide, goTo, motion } = show
  const layout = useMemo(() => slideLayout(slide, aspectRatio, themeVisual), [slide, aspectRatio, themeVisual])
  const blockIds = useMemo(() => layout.elements.map((el) => el.id).filter(Boolean), [layout])
  const spotlight = useSpotlight(blockIds, index)

  const rootRef = useRef(null)
  const controls = useIdleControls(rootRef)

  const isPresenter = chrome === 'presenter'
  const [notesOpen, setNotesOpen] = useState(() => isPresenter && readNotesPref())
  const toggleNotes = useCallback(() => {
    if (!isPresenter) return
    setNotesOpen((on) => {
      writeNotesPref(!on)
      return !on
    })
  }, [isPresenter])
  const notes = String(slide?.speakerNotes || '').trim()

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // ── Full screen ───────────────────────────────────────────────────────────
  const fullscreenAvailable = canFullscreen()
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(fullscreenElement()))
  const wasFullscreenRef = useRef(isFullscreen)
  const leavingOnPurposeRef = useRef(false)
  useEffect(
    () =>
      onFullscreenChange(() => {
        const now = Boolean(fullscreenElement())
        setIsFullscreen(now)
        // Esc or the browser took the page out of full screen: the show is over.
        if (wasFullscreenRef.current && !now && !leavingOnPurposeRef.current) onCloseRef.current?.()
        leavingOnPurposeRef.current = false
        wasFullscreenRef.current = now
      }),
    []
  )
  // Ending the show from the toolbar (or Esc in the window) also leaves full screen.
  useEffect(
    () => () => {
      if (fullscreenElement()) {
        leavingOnPurposeRef.current = true
        exitPresentFullscreen()
      }
    },
    []
  )
  const toggleFullscreen = useCallback(() => {
    if (fullscreenElement()) {
      // Keep presenting, in the window.
      leavingOnPurposeRef.current = true
      exitPresentFullscreen()
    } else {
      requestPresentFullscreen()
    }
  }, [])

  // ── Focus: into Present on open, kept inside, back to the Present button on exit ──
  useEffect(() => {
    const previous = document.activeElement
    rootRef.current?.focus({ preventScroll: true })
    return () => {
      if (previous?.isConnected && typeof previous.focus === 'function') previous.focus({ preventScroll: true })
    }
  }, [])

  const trapTab = useCallback((e) => {
    const root = rootRef.current
    if (!root) return
    const items = [
      ...root.querySelectorAll('button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])'),
    ].filter((el) => el.getClientRects().length > 0)
    const active = document.activeElement
    if (!items.length) {
      e.preventDefault()
      root.focus({ preventScroll: true })
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    if (!root.contains(active) || active === root) {
      e.preventDefault()
      if (e.shiftKey) last.focus()
      else first.focus()
    } else if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  // ── Keys ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const action = slideshowKeyAction({
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        onButton: Boolean(e.target?.closest?.('button')),
      })
      if (!action) return
      if (action === 'tab') {
        trapTab(e)
        return
      }
      if (action === 'escape') {
        if (spotlight.activeId) spotlight.clear()
        else onCloseRef.current?.()
        return
      }
      if (action === 'spotlight') {
        spotlight.cycle()
        return
      }
      if (action === 'notes') {
        toggleNotes()
        return
      }
      const to = targetIndex(action, index, count)
      if (to == null) return
      e.preventDefault()
      goTo(to)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, count, goTo, spotlight, toggleNotes, trapTab])

  // ── Touch: swipe left = next, swipe right = previous ───────────────────────
  const touchStartRef = useRef(null)
  const onTouchStart = (e) => {
    const t = e.touches?.[0]
    touchStartRef.current = t ? { x: t.clientX, y: t.clientY } : null
  }
  const onTouchEnd = (e) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    const t = e.changedTouches?.[0]
    if (!start || !t) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    goTo(index + (dx < 0 ? 1 : -1))
  }

  // A mouse click on a control leaves focus on Present, so Space still means "next slide".
  const keepFocusOnPresent = (e) => {
    if (e.target?.closest?.('button')) e.preventDefault()
  }

  const { presenter, isPresenting, conflict, canPresent, following } = show
  const showFollow = Boolean(presenter && !isPresenting)

  return (
    <div
      ref={rootRef}
      className={`ppt-present-overlay${controls.visible ? '' : ' is-idle'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Present mode"
      tabIndex={-1}
      data-present-root=""
    >
      <SlideshowStage
        slide={slide}
        index={index}
        layout={layout}
        themeVisual={themeVisual}
        fontVars={fontVars}
        motion={motion}
        spotlightId={spotlight.activeId}
        onSelectBlock={spotlight.select}
        onSlideClick={() => {
          if (spotlight.activeId) spotlight.clear()
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />

      {/* Screen readers hear the slide change; nothing is shown. */}
      <span className="ppt-present-sr" aria-live="polite">
        {`Slide ${index + 1} of ${count}${slide?.title ? `: ${slide.title}` : ''}`}
      </span>

      {showFollow && (
        <div
          className={`ppt-present-follow${controls.visible || !following ? '' : ' is-hidden'}`}
          data-present-chrome=""
          onMouseDown={keepFocusOnPresent}
        >
          <span className="ppt-present-follow-dot" aria-hidden />
          <span>{conflict ? `${conflict.displayName} is presenting` : `Following ${presenter.displayName}`}</span>
          {!following && (
            <button type="button" onClick={show.jumpToPresenter}>
              Back to presenter
            </button>
          )}
        </div>
      )}

      {isPresenter && notesOpen && (
        <aside
          className="ppt-present-notes"
          aria-label="Facilitator notes"
          data-present-chrome=""
          onMouseDown={keepFocusOnPresent}
        >
          <div className="ppt-present-notes-head">
            <strong>Facilitator notes</strong>
            <button type="button" onClick={toggleNotes} aria-label="Hide facilitator notes" title="Hide notes (S)">
              <FiX size={14} />
            </button>
          </div>
          <p>{notes || 'No facilitator notes on this slide.'}</p>
        </aside>
      )}

      <div
        className="ppt-present-toolbar"
        data-present-chrome=""
        role="toolbar"
        aria-label="Slideshow controls"
        onMouseDown={keepFocusOnPresent}
        onPointerEnter={() => controls.hold(true)}
        onPointerLeave={() => controls.hold(false)}
        onFocus={() => controls.hold(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) controls.hold(false)
        }}
      >
        <button
          type="button"
          className="ppt-present-tool"
          disabled={index <= 0}
          onClick={() => goTo(index - 1)}
          aria-label="Previous slide"
          title="Previous slide (←, Page Up)"
        >
          <FiChevronLeft size={18} />
        </button>
        <span className="ppt-present-counter" aria-hidden>
          {index + 1} <em>/</em> {count}
        </span>
        <button
          type="button"
          className="ppt-present-tool"
          disabled={index >= count - 1}
          onClick={() => goTo(index + 1)}
          aria-label="Next slide"
          title="Next slide (→, Space, Page Down)"
        >
          <FiChevronRight size={18} />
        </button>

        <span className="ppt-present-toolbar-sep" aria-hidden />

        <button
          type="button"
          className={`ppt-present-tool${spotlight.activeId ? ' is-active' : ''}`}
          onClick={spotlight.cycle}
          disabled={!blockIds.length}
          aria-label={spotlight.activeId ? `Spotlight ${spotlight.position} of ${spotlight.total}` : 'Spotlight'}
          aria-pressed={Boolean(spotlight.activeId)}
          title={
            !blockIds.length
              ? 'Nothing to spotlight on this slide'
              : spotlight.activeId
                ? 'Click any block to jump to it, F for the next one, Esc to zoom out'
                : 'Spotlight the slide block by block (F)'
          }
        >
          <FiTarget size={16} />
          {spotlight.activeId && (
            <span className="ppt-present-tool-label">
              {spotlight.position}/{spotlight.total}
            </span>
          )}
        </button>

        {isPresenter && (
          <button
            type="button"
            className={`ppt-present-tool${notesOpen ? ' is-active' : ''}`}
            onClick={toggleNotes}
            aria-label="Facilitator notes"
            aria-pressed={notesOpen}
            title={notesOpen ? 'Hide facilitator notes (S)' : 'Show facilitator notes (S) — the audience sees them too on a shared screen'}
          >
            <FiFileText size={16} />
          </button>
        )}

        {canPresent && (
          <button
            type="button"
            className={`ppt-present-tool ppt-present-live-btn${isPresenting ? ' is-live' : ''}`}
            onClick={() => (isPresenting ? show.stopPresenting?.() : show.startPresenting?.())}
            aria-pressed={isPresenting}
            title={isPresenting ? 'Stop presenting to viewers' : 'Present this deck to viewers on the share link'}
          >
            <FiRadio size={16} />
            <span className="ppt-present-tool-label">{isPresenting ? 'Presenting' : 'Present to viewers'}</span>
          </button>
        )}

        {fullscreenAvailable && (
          <button
            type="button"
            className="ppt-present-tool"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            title={isFullscreen ? 'Exit full screen and keep presenting in the window' : 'Full screen'}
          >
            {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
          </button>
        )}

        <button
          type="button"
          className="ppt-present-tool ppt-present-end"
          onClick={() => onCloseRef.current?.()}
          aria-label="End slideshow"
          title="End slideshow (Esc)"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  )
}
