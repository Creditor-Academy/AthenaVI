import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiRadio, FiX } from 'react-icons/fi'
import PptChartRenderer, { getEmbedIframeUrl } from './PptChartRenderer'
import ExternalLinkHoverLayer from './ExternalLinkHoverLayer'
import {
  getSlideImage,
  isSlideBackgroundElement,
  buildCanvasShapeStyle,
  buildNativeShapeBoxStyle,
  shapeElementUsesNativeStyle,
  resolveCanvasSize,
  resolveSlideStageBackground,
  mediaFlipTransform,
} from '../../../utils/presentationHelpers'
import DeviceFrameVisual, { resolveDeviceFrameColor } from '../../../components/ppt/DeviceFrameVisual'
import ClipShapeSvg from '../../../components/ppt/ClipShapeSvg'
import GraphicCanvasVisual from '../../../components/ppt/GraphicCanvasVisual'
import { parsePolygonClipPath } from '../../../utils/shapeClipSvg'
import { shouldPaintElement } from '../../../utils/canvasRenderDebug'
import {
  coercePlainText,
  contentUsesFullRuns,
  isGradientFill,
  resolveTextHex,
  runFill,
  textPaintStyle,
} from '../../../utils/pptTextContent'
import { PPT_SLIDE_TRANSITIONS } from '../../../constants/pptSlideEditorOptions'
import './PresentMode.css'

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

  if (el.type === 'text' || el.type === 'textbox') {
    const c = el.content || {}
    const color = resolveTextHex(c, palette, palette?.text || '#0F172A')
    const usesRuns = contentUsesFullRuns(c)
    const boxPaint =
      !usesRuns && isGradientFill(c.fill) ? textPaintStyle(c.fill, palette, color) : { color }
    const baseStyle = {
      fontSize: c.fontSize ? `${Math.max(10, c.fontSize * 0.55)}px` : '18px',
      fontWeight: c.bold ? 700 : 400,
      fontStyle: c.italic ? 'italic' : 'normal',
      fontFamily: c.fontFamily || undefined,
    }
    return (
      <div
        {...interactive}
        style={{
          ...style,
          ...boxPaint,
          ...baseStyle,
          textDecoration: [c.underline && 'underline', c.strikethrough && 'line-through']
            .filter(Boolean)
            .join(' ') || undefined,
          textAlign: c.textAlign || c.align || 'left',
          textTransform: c.textTransform || undefined,
          whiteSpace: 'pre-wrap',
          lineHeight: c.lineHeight ?? 1.25,
        }}
      >
        {usesRuns
          ? c.runs.map((run, i) => {
              const fill = runFill(run, { type: 'solid', color })
              const text =
                typeof run?.text === 'string' || typeof run?.text === 'number' ? run.text : ''
              return (
                <span
                  key={i}
                  style={{
                    ...textPaintStyle(fill, palette, color),
                    fontWeight: run.fontWeight ?? (run.bold ? 700 : baseStyle.fontWeight),
                    fontStyle: run.italic ? 'italic' : baseStyle.fontStyle,
                    fontFamily: run.fontFamily || baseStyle.fontFamily,
                  }}
                >
                  {text}
                </span>
              )
            })
          : coercePlainText(c.text)}
      </div>
    )
  }

  if (el.type === 'graphic') {
    return (
      <div {...interactive} style={style}>
        <GraphicCanvasVisual content={el.content || {}} palette={palette} />
      </div>
    )
  }

  if (el.type === 'image' || el.type === 'icon') {
    const c = el.content || {}
    const url = c.url || c.src
    if (!url) return null
    return (
      <img
        {...interactive}
        src={url}
        alt={c.alt || ''}
        style={{
          ...style,
          objectFit: c.fit || 'cover',
          borderRadius: c.borderRadius != null ? c.borderRadius : undefined,
          boxShadow: c.boxShadow || c.shadow || undefined,
          transform: [style.transform, mediaFlipTransform(c)].filter(Boolean).join(' ') || undefined,
          transformOrigin: 'center center',
        }}
      />
    )
  }

  if (el.type === 'chart') {
    return (
      <div {...interactive} style={style}>
        <PptChartRenderer content={el.content || {}} palette={palette} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }

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
    return (
      <ExternalLinkHoverLayer content={c} style={style}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            background: '#F1F5F9',
            borderRadius: 8,
          }}
        >
          <span style={{ color: '#475569', fontSize: 14 }}>{c.title || c.url}</span>
        </div>
      </ExternalLinkHoverLayer>
    )
  }

  if (el.type === 'shape') {
    const c = el.content || {}
    const deviceKind = c.deviceFrame || (c.shape === 'device-frame' ? 'phone' : null)
    if (deviceKind) {
      const screenSrc = c.screenUrl || c.url || c.src || c.thumbnailUrl || c.previewUrl
      const frameColor = resolveDeviceFrameColor(c, palette)
      return (
        <div {...interactive} style={style}>
          <DeviceFrameVisual
            kind={deviceKind}
            src={c.layoutSurface ? undefined : screenSrc}
            chromeOnly={Boolean(c.layoutSurface)}
            frameColor={frameColor}
          />
        </div>
      )
    }
    if (shapeElementUsesNativeStyle(el)) {
      return (
        <div {...interactive} style={{ ...style, ...buildNativeShapeBoxStyle(el.nativeStyle) }} />
      )
    }
    const rendered = buildCanvasShapeStyle(c, palette)
    if (rendered.kind === 'line') {
      return (
        <div
          {...interactive}
          style={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ ...rendered.style, width: '100%' }} />
        </div>
      )
    }
    if (rendered.kind === 'clip' && rendered.clipPath) {
      const svgFill = rendered.outlined
        ? 'none'
        : rendered.fill || rendered.style?.background || '#475569'
      if (parsePolygonClipPath(rendered.clipPath)) {
        return (
          <div {...interactive} style={{ ...style, position: 'relative' }}>
            <ClipShapeSvg
              clipPath={rendered.clipPath}
              fill={typeof svgFill === 'string' ? svgFill : '#475569'}
              stroke={
                rendered.strokeWidth > 0
                  ? (rendered.stroke || '#475569')
                  : 'none'
              }
              strokeWidth={rendered.strokeWidth || 0}
              strokeDasharray={rendered.strokeDasharray}
              outlined={Boolean(rendered.outlined)}
            />
          </div>
        )
      }
    }
    return <div {...interactive} style={{ ...style, ...rendered.style }} />
  }

  if (el.type === 'table') {
    const c = el.content || {}
    const cells = c.cells || c.rows || []
    return (
      <div {...interactive} style={{ ...style, overflow: 'auto' }}>
        <table className="ppt-present-table">
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri}>
                {(row || []).map((cell, ci) => (
                  <td key={ci}>{coercePlainText(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
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
}) {
  const [index, setIndex] = useState(initialSlideIndex)
  const [focusElementId, setFocusElementId] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
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
  const elements = (slide?.elements?.elements || []).filter(
    (el) =>
      !isSlideBackgroundElement(el, slide) &&
      shouldPaintElement(el, slide, canvas.width, canvas.height)
  )
  const transition =
    slide?.transition || slide?.elements?.transition || 'none'
  const palette = themeVisual?.palette || null
  const hasElements = elements.length > 0
  const fallbackImage = hasElements ? null : getSlideImage(slide).url
  const slideBgStyle = resolveSlideStageBackground(
    slide,
    themeVisual?.inner || '#fff',
    palette
  )

  const go = useCallback(
    (delta) => {
      setFollowing(false)
      setTransitioning(true)
      setFocusElementId(null)
      setTimeout(() => {
        setIndex((i) => Math.max(0, Math.min(slides.length - 1, i + delta)))
        setTransitioning(false)
      }, transition === 'none' ? 0 : 280)
    },
    [slides.length, transition]
  )

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

  const transitionClass = transitioning
    ? `ppt-present-stage--${transition}`
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

      <div className={`ppt-present-stage ${transitionClass} ${focusElementId ? 'is-focused' : ''}`}>
        <div
          className="ppt-present-slide"
          style={{
            ...slideBgStyle,
            aspectRatio: `${canvas.width} / ${canvas.height}`,
          }}
          onClick={() => {
            if (focusElementId) setFocusElementId(null)
          }}
        >
          {hasElements ? (
            elements.map((el) => (
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
            ))
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
