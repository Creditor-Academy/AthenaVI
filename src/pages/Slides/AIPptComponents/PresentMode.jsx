import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiRadio, FiX } from 'react-icons/fi'
import { getEmbedIframeUrl } from './PptChartRenderer'
import ExternalLinkHoverLayer from './ExternalLinkHoverLayer'
import PptCanvasElement from './PptCanvasElement'
import {
  getSlideImage,
  resolveCanvasSize,
  resolveSlideStageBackground,
} from '../../../utils/presentationHelpers'
import { EDITOR_STAGE_WIDTH, resolveStageElements } from '../../../utils/slideStageElements'
import { PPT_SLIDE_TRANSITIONS } from '../../../constants/pptSlideEditorOptions'
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
  const [index, setIndex] = useState(initialSlideIndex)
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

  useEffect(() => {
    onIndexChange?.(index)
  }, [index, onIndexChange])

  const slide = slides[index]
  const canvas = resolveCanvasSize(slide, aspectRatio)
  const palette = themeVisual?.palette || null
  // Same elements as the editor stage; groups only frame their children and draw nothing.
  const elements = resolveStageElements(slide, canvas, palette).filter((el) => el.type !== 'group')
  // A transition belongs to the slide it leads into (the editor stores it on the next slide).
  const slideTransition = (s) => s?.transition || s?.elements?.transition || 'none'
  const transition = slideTransition(slide)
  const hasElements = elements.length > 0
  const fallbackImage = hasElements ? null : getSlideImage(slide).url
  const slideBgStyle = resolveSlideStageBackground(
    slide,
    themeVisual?.inner || '#fff',
    palette
  )

  const go = useCallback(
    (delta) => {
      const target = Math.max(0, Math.min(slides.length - 1, index + delta))
      if (target === index) return
      setFollowing(false)
      setFocusElementId(null)
      // Going forward plays the destination's transition; going back replays the one that
      // led into the current slide, in the opposite direction.
      const leadsIn = delta > 0 ? slides[target] : slides[index]
      setMotion((m) => ({ id: slideTransition(leadsIn), reverse: delta < 0, tick: m.tick + 1 }))
      setIndex(target)
    },
    [slides, index]
  )

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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (focusElementId) setFocusElementId(null)
        else onClose?.()
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        go(1)
      }
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'f' || e.key === 'F') cycleFocus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, go, cycleFocus, focusElementId])

  const transitionClass =
    motion.tick > 0 && motion.id !== 'none'
      ? `ppt-present-stage--${motion.id}${motion.reverse ? ' is-reverse' : ''}`
      : ''

  const transitionLabel = PPT_SLIDE_TRANSITIONS.find((t) => t.id === transition)?.label

  return (
    <div className="ppt-present-overlay" role="dialog" aria-label="Present mode">
      <header className="ppt-present-header">
        <div className="ppt-present-header-left">
          <span className="ppt-present-counter">
            {index + 1} <em>/</em> {slides.length}
          </span>
          {transitionLabel && <span className="ppt-present-transition-tag">{transitionLabel}</span>}
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
        <div className="ppt-present-banner">
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
          ) : (
            <div className="ppt-present-fallback">
              <h1 style={{ color: themeVisual?.title }}>{slide?.title}</h1>
              {fallbackImage && <img src={fallbackImage} alt="" />}
            </div>
          )}
        </div>
      </div>

      {chrome === 'presenter' && slide?.speakerNotes && (
        <footer className="ppt-present-notes">
          <strong>Speaker notes</strong>
          <p>{slide.speakerNotes}</p>
        </footer>
      )}

      <nav className="ppt-present-nav">
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
