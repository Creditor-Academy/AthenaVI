import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiRadio, FiX } from 'react-icons/fi'
import { getEmbedIframeUrl } from './PptChartRenderer'
import ExternalLinkHoverLayer from './ExternalLinkHoverLayer'
import PptCanvasElement from './PptCanvasElement'
import {
  getSlideImage,
  showsSlideFallback,
  resolveCanvasSize,
  resolveSlideStageBackground,
} from '../../../utils/presentationHelpers'
import { EDITOR_STAGE_WIDTH, resolveStageElements } from '../../../utils/slideStageElements'
import './PresentMode.css'

/**
 * One element of the slide, drawn by the editor's own renderer (PptCanvasElement) inside the
 * same %-positioned frame the editor uses. Present used to have a separate, simplified renderer
 * (text at fontSize × 0.55px whatever the screen size, no padding / effects / crops…), so the
 * presented slide looked different from — and misaligned against — the slide that was edited.
 */
function PresentElement({ el, palette, canvasW, canvasH, focused, dimmed, selectable, onSelect }) {
  // Only wired once focus mode is already active (a block is focused) — lets
  // the presenter jump straight to a different block instead of cycling with F.
  const canSelect = selectable && el.type !== 'embed' && el.type !== 'link'
  const interactive = canSelect
    ? {
        className: 'ppt-present-el-hit',
        onClick: (e) => {
          e.stopPropagation()
          onSelect?.(el.id)
        },
      }
    : {}

  const p = el.placement || {}
  const rotation = Number(p.rotation) || 0
  const transformParts = [
    rotation ? `rotate(${rotation}deg)` : '',
    focused ? 'scale(1.06)' : '',
  ].filter(Boolean)
  const baseOpacity = p.opacity != null ? p.opacity : 1
  const style = {
    position: 'absolute',
    left: `${((p.x || 0) / canvasW) * 100}%`,
    top: `${((p.y || 0) / canvasH) * 100}%`,
    width: `${((p.width || 100) / canvasW) * 100}%`,
    height: `${((p.height || 40) / canvasH) * 100}%`,
    opacity: dimmed ? baseOpacity * 0.18 : baseOpacity,
    zIndex: focused ? 500 : el.layer || 0,
    transform: transformParts.length ? transformParts.join(' ') : undefined,
    transformOrigin: 'center center',
    transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease, filter 0.3s ease',
    filter: dimmed ? 'saturate(0.7) blur(0.3px)' : undefined,
    outline: focused ? '2px solid #60a5fa' : undefined,
    outlineOffset: focused ? 6 : undefined,
    boxShadow: focused ? '0 12px 40px rgba(0,0,0,0.35)' : undefined,
    borderRadius: focused ? 6 : undefined,
  }

  // Embeds play in Present (the editor only shows a card for them).
  if (el.type === 'embed' || el.type === 'link') {
    const c = el.content || {}
    const iframeUrl = getEmbedIframeUrl(c)
    if (iframeUrl) {
      return (
        <ExternalLinkHoverLayer content={c} style={style}>
          <iframe
            src={iframeUrl}
            title={c.title || 'Embed'}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: c.borderRadius ?? 8 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </ExternalLinkHoverLayer>
      )
    }
  }

  return (
    <div {...interactive} style={style}>
      <PptCanvasElement
        el={el}
        palette={palette}
        editable={false}
        showEmptyTextHint={false}
        canvasW={canvasW}
        followLinks
      />
    </div>
  )
}

/**
 * Lays the slide out at the editor's stage width and scales it to the presentation size as one
 * piece, so every font, padding and position keeps exactly the proportions it has in the editor.
 */
function PresentSlideStage({ canvas, stageStyle, children }) {
  const hostRef = useRef(null)
  const [scale, setScale] = useState(0)
  const stageHeight = (EDITOR_STAGE_WIDTH * canvas.height) / canvas.width

  useEffect(() => {
    const node = hostRef.current
    if (!node) return undefined
    const update = () => {
      const width = node.clientWidth || 0
      const height = node.clientHeight || 0
      if (!width || !height) return
      setScale(Math.min(width / EDITOR_STAGE_WIDTH, height / stageHeight))
    }
    update()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [stageHeight])

  return (
    <div ref={hostRef} className="ppt-present-stage-host">
      <div
        className="ppt-present-stage-plane"
        style={{
          ...stageStyle,
          width: EDITOR_STAGE_WIDTH,
          height: stageHeight,
          transform: `scale(${scale || 0.0001})`,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function PresentMode({
  slides = [],
  themeVisual,
  aspectRatio = '16:9',
  initialSlideIndex = 0,
  onClose,
  // 'presenter' (member, sees speaker notes + can broadcast) | 'audience' (guest, follow-only)
  chrome = 'presenter',
  // { presenter, isPresenting, conflict, canPresent, onStartPresenting, onStopPresenting } | null
  presence = null,
  onIndexChange,
  // CSS variables for the deck's theme fonts (--ppt-font-heading / --ppt-font-body).
  fontVars = null,
}) {
  const [rawIndex, setIndex] = useState(initialSlideIndex)
  // Slides can be removed while presenting (undo, a collaborator): never point past the last one.
  const lastIndex = Math.max(0, slides.length - 1)
  const index = Math.min(Math.max(0, rawIndex), lastIndex)
  const [focusElementId, setFocusElementId] = useState(null)
  // `reverse` flips the slide direction when stepping back; `tick` restarts the animation.
  // Opening on a slide plays the transition that leads into it, so a transition just applied
  // to the selected slide is visible straight away (Present starts on that slide).
  const [motion, setMotion] = useState(() => {
    const first = slides[initialSlideIndex]
    const id = first?.transition || first?.elements?.transition || 'none'
    return { id, reverse: false, tick: id !== 'none' ? 1 : 0 }
  })
  // Guests always follow the live presenter by default; a member only follows
  // once someone else already holds the lock (never steal the cursor).
  const [following, setFollowing] = useState(chrome === 'audience')
  const lastAppliedSeqRef = useRef(-Infinity)

  const presenter = presence?.presenter || null
  const isPresenting = Boolean(presence?.isPresenting)
  const conflict = presence?.conflict || null
  const canPresent = Boolean(presence?.canPresent)

  // Someone else already has the lock — follow them, don't fight for it.
  useEffect(() => {
    if (conflict) setFollowing(true)
  }, [conflict])

  // I'm presenting — my own navigation drives the deck, stop following others.
  useEffect(() => {
    if (isPresenting) setFollowing(false)
  }, [isPresenting])

  useEffect(() => {
    if (!following || !presenter) return
    if (presenter.seq <= lastAppliedSeqRef.current) return
    lastAppliedSeqRef.current = presenter.seq
    setIndex((prev) => {
      const next = Math.max(0, Math.min(slides.length - 1, presenter.slideIndex))
      return next === prev ? prev : next
    })
  }, [following, presenter, slides.length])

  // The editor passes a new callback on every render; only a slide change should call it.
  const onIndexChangeRef = useRef(onIndexChange)
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange
  }, [onIndexChange])
  useEffect(() => {
    onIndexChangeRef.current?.(index)
  }, [index])

  const slide = slides[index]
  const canvas = resolveCanvasSize(slide, aspectRatio)
  const palette = themeVisual?.palette || null
  // Same elements as the editor stage; groups only frame their children and draw nothing.
  const elements = resolveStageElements(slide, canvas, palette).filter((el) => el.type !== 'group')
  // A transition belongs to the slide it leads into (the editor stores it on the next slide).
  const slideTransition = (s) => s?.transition || s?.elements?.transition || 'none'
  const hasElements = elements.length > 0
  // The title / image placeholder is only for slides that never had a canvas (B-3).
  const showFallback = !hasElements && showsSlideFallback(slide)
  const fallbackImage = showFallback ? getSlideImage(slide).url : null
  const slideBgStyle = resolveSlideStageBackground(
    slide,
    themeVisual?.inner || '#fff',
    palette,
    // The background photo is drawn as a layer by resolveStageElements (E-4a).
    { photoLayer: true }
  )

  const goTo = useCallback(
    (to) => {
      const target = Math.max(0, Math.min(slides.length - 1, to))
      if (target === index) return
      const forward = target > index
      setFollowing(false)
      setFocusElementId(null)
      // Going forward plays the destination's transition; going back replays the one that
      // led into the current slide, in the opposite direction.
      const leadsIn = forward ? slides[target] : slides[index]
      setMotion((m) => ({ id: slideTransition(leadsIn), reverse: !forward, tick: m.tick + 1 }))
      setIndex(target)
    },
    [slides, index]
  )
  const go = useCallback((delta) => goTo(index + delta), [goTo, index])

  const touchStartRef = useRef(null)
  const onTouchStart = (e) => {
    const t = e.touches?.[0]
    touchStartRef.current = t ? { x: t.clientX, y: t.clientY } : null
  }
  // Swipe left = next slide, swipe right = previous (ignore mostly-vertical drags).
  const onTouchEnd = (e) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    const t = e.changedTouches?.[0]
    if (!start || !t) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    go(dx < 0 ? 1 : -1)
  }

  const jumpToPresenter = useCallback(() => {
    if (!presenter) return
    lastAppliedSeqRef.current = presenter.seq
    setIndex(Math.max(0, Math.min(slides.length - 1, presenter.slideIndex)))
    setFollowing(true)
  }, [presenter, slides.length])

  const focusableIds = elements.map((el) => el.id).filter(Boolean)
  const focusIndex = focusElementId ? focusableIds.indexOf(focusElementId) : -1

  // Once focus mode is on, clicking a different block jumps straight to it
  // instead of stepping through with the Focus button / F. Clicking the same
  // block again, or the empty slide background, exits focus mode.
  const selectFocusTarget = useCallback((id) => {
    setFocusElementId((prev) => (prev === id ? null : id))
  }, [])

  // Steps through blocks one at a time, then releases back to the full slide.
  const cycleFocus = useCallback(() => {
    if (!focusableIds.length) return
    setFocusElementId((prev) => {
      if (!prev) return focusableIds[0]
      const idx = focusableIds.indexOf(prev)
      if (idx === -1 || idx === focusableIds.length - 1) return null
      return focusableIds[idx + 1]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusableIds.join('|')])

  // Focus moves into Present and stays there (Phase 1.3): Tab can't reach the editor behind it.
  // On exit it goes back to where it was (the Present button).
  const rootRef = useRef(null)
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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Tab') {
        trapTab(e)
        return
      }
      // Ctrl / Cmd / Alt combinations belong to the browser (reload, zoom, switching tabs).
      if (e.ctrlKey || e.metaKey || e.altKey) return
      // A button reached with Tab takes Space itself.
      const onButton = Boolean(e.target?.closest?.('button'))
      switch (e.key) {
        case 'Escape':
          if (focusElementId) setFocusElementId(null)
          else onClose?.()
          break
        // Presentation clickers send PageDown / PageUp (Phase 1.8).
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          go(1)
          break
        case ' ':
          if (onButton) return
          e.preventDefault()
          go(1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          go(-1)
          break
        case 'Home':
          e.preventDefault()
          goTo(0)
          break
        case 'End':
          e.preventDefault()
          goTo(slides.length - 1)
          break
        case 'f':
        case 'F':
          cycleFocus()
          break
        default:
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, go, goTo, cycleFocus, focusElementId, trapTab, slides.length])

  // A mouse click on a control leaves focus on Present, so Space still means "next slide".
  const keepFocusOnPresent = (e) => {
    if (e.target?.closest?.('button')) e.preventDefault()
  }

  const transitionClass =
    motion.tick > 0 && motion.id !== 'none'
      ? `ppt-present-stage--${motion.id}${motion.reverse ? ' is-reverse' : ''}`
      : ''

  return (
    <div
      ref={rootRef}
      className="ppt-present-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Present mode"
      tabIndex={-1}
    >
      <header className="ppt-present-header" onMouseDown={keepFocusOnPresent}>
        <div className="ppt-present-header-left">
          <span className="ppt-present-counter">
            {index + 1} <em>/</em> {slides.length}
          </span>
        </div>

        <div className="ppt-present-header-actions">
          {canPresent && (
            <button
              type="button"
              className={isPresenting ? 'ppt-present-live-btn is-live' : 'ppt-present-live-btn'}
              onClick={() => (isPresenting ? presence.onStopPresenting?.() : presence.onStartPresenting?.())}
              title={isPresenting ? 'Stop presenting to viewers' : 'Present this deck to viewers'}
            >
              <FiRadio size={14} />
              <span>{isPresenting ? 'Presenting' : 'Present to viewers'}</span>
            </button>
          )}
          <button
            type="button"
            className={focusElementId ? 'ppt-present-focus-btn is-active' : 'ppt-present-focus-btn'}
            onClick={cycleFocus}
            disabled={!focusableIds.length}
            title={
              !focusableIds.length
                ? 'No blocks to focus on this slide'
                : focusElementId
                  ? 'Click any block to jump to it, or press F to step to the next one'
                  : 'Zoom into this slide block by block (F)'
            }
          >
            <FiMaximize2 size={16} />
            <span>{focusElementId ? `Focus ${focusIndex + 1}/${focusableIds.length}` : 'Focus'}</span>
          </button>
          <button type="button" className="ppt-present-close-btn" onClick={onClose} aria-label="Exit present mode" title="Exit (Esc)">
            <FiX size={18} />
          </button>
        </div>
      </header>

      {presenter && !isPresenting && (
        <div className="ppt-present-banner" onMouseDown={keepFocusOnPresent}>
          <span className="ppt-present-banner-dot" aria-hidden />
          <span>
            {conflict ? `${conflict.displayName} is presenting` : `Following ${presenter.displayName}`}
          </span>
          {!following && (
            <button type="button" onClick={jumpToPresenter}>
              Jump to presenter
            </button>
          )}
        </div>
      )}

      <div
        key={motion.tick}
        className={`ppt-present-stage ${transitionClass} ${focusElementId ? 'is-focused' : ''}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="ppt-present-slide"
          style={{
            ...slideBgStyle,
            aspectRatio: `${canvas.width} / ${canvas.height}`,
            // Width from the screen's height too, so the box always keeps the slide's shape
            // (a fixed width with a max-height squashed slides on shorter screens).
            '--ppt-present-ratio': canvas.width / canvas.height,
          }}
          onClick={() => {
            if (focusElementId) setFocusElementId(null)
          }}
        >
          {hasElements ? (
            <PresentSlideStage
              canvas={canvas}
              stageStyle={{ ...fontVars, color: themeVisual?.body }}
            >
              {elements.map((el) => (
                <PresentElement
                  key={el.id}
                  el={el}
                  palette={palette}
                  canvasW={canvas.width}
                  canvasH={canvas.height}
                  focused={focusElementId === el.id}
                  dimmed={Boolean(focusElementId) && focusElementId !== el.id}
                  selectable={Boolean(focusElementId)}
                  onSelect={selectFocusTarget}
                />
              ))}
            </PresentSlideStage>
          ) : showFallback ? (
            <div className="ppt-present-fallback">
              <h1 style={{ color: themeVisual?.title }}>{slide?.title}</h1>
              {fallbackImage && <img src={fallbackImage} alt="" />}
            </div>
          ) : (
            <PresentSlideStage canvas={canvas} stageStyle={{ ...fontVars, color: themeVisual?.body }} />
          )}
        </div>
      </div>

      {chrome === 'presenter' && slide?.speakerNotes && (
        <footer className="ppt-present-notes">
          <strong>Facilitator notes</strong>
          <p>{slide.speakerNotes}</p>
        </footer>
      )}

      <nav className="ppt-present-nav" onMouseDown={keepFocusOnPresent}>
        <button type="button" disabled={index <= 0} onClick={() => go(-1)} aria-label="Previous slide">
          <FiChevronLeft size={20} />
        </button>
        <div className="ppt-present-dots" aria-hidden>
          {slides.length <= 24 &&
            slides.map((s, i) => (
              <span key={s.id} className={i === index ? 'ppt-present-dot is-active' : 'ppt-present-dot'} />
            ))}
        </div>
        <button
          type="button"
          disabled={index >= slides.length - 1}
          onClick={() => go(1)}
          aria-label="Next slide"
        >
          <FiChevronRight size={20} />
        </button>
      </nav>

      <div className="ppt-present-hints">
        {focusElementId ? (
          <>
            <span>Click a block to jump to it</span>
            <span>·</span>
            <span>F for next</span>
            <span>·</span>
            <span>Esc to zoom out</span>
          </>
        ) : (
          <>
            <span>← → to navigate</span>
            <span>·</span>
            <span>F to focus</span>
            <span>·</span>
            <span>Esc to exit</span>
          </>
        )}
      </div>
    </div>
  )
}
