import { useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi'
import PptChartRenderer, { getEmbedIframeUrl } from './PptChartRenderer'
import {
  getSlideImage,
  normalizeApiShape,
  resolveCanvasSize,
  resolveFillCss,
  resolveThemeColor,
} from '../../../utils/presentationHelpers'
import { PPT_SLIDE_TRANSITIONS } from './insert/EditorRightRail'
import './PresentMode.css'

function PresentElement({ el, palette, canvasW, canvasH, focused }) {
  const p = el.placement || {}
  const style = {
    position: 'absolute',
    left: `${((p.x || 0) / canvasW) * 100}%`,
    top: `${((p.y || 0) / canvasH) * 100}%`,
    width: `${((p.width || 100) / canvasW) * 100}%`,
    height: `${((p.height || 40) / canvasH) * 100}%`,
    opacity: p.opacity != null ? p.opacity : 1,
    zIndex: el.layer || 0,
    transform: focused ? 'scale(1.08)' : undefined,
    transition: 'transform 0.3s ease, opacity 0.3s ease',
    outline: focused ? '3px solid #3B82F6' : undefined,
    outlineOffset: focused ? 4 : undefined,
  }

  if (el.type === 'text') {
    const c = el.content || {}
    const color = resolveThemeColor(c.color || c.colorRole, palette, palette?.text || '#0F172A')
    return (
      <div
        style={{
          ...style,
          color,
          fontSize: c.fontSize ? `${Math.max(10, c.fontSize * 0.55)}px` : '18px',
          fontWeight: c.bold ? 700 : 400,
          fontStyle: c.italic ? 'italic' : 'normal',
          textDecoration: [c.underline && 'underline', c.strikethrough && 'line-through']
            .filter(Boolean)
            .join(' ') || undefined,
          fontFamily: c.fontFamily || undefined,
          textAlign: c.align || 'left',
          textTransform: c.textTransform || undefined,
          whiteSpace: 'pre-wrap',
          lineHeight: c.lineHeight ?? 1.25,
        }}
      >
        {c.text || ''}
      </div>
    )
  }

  if (el.type === 'image' || el.type === 'icon') {
    const c = el.content || {}
    const url = c.url || c.src
    if (!url) return null
    return (
      <img
        src={url}
        alt={c.alt || ''}
        style={{ ...style, objectFit: c.fit || 'cover' }}
      />
    )
  }

  if (el.type === 'chart') {
    return (
      <div style={style}>
        <PptChartRenderer content={el.content || {}} palette={palette} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }

  if (el.type === 'embed' || el.type === 'link') {
    const c = el.content || {}
    const iframeUrl = getEmbedIframeUrl(c)
    if (iframeUrl) {
      return (
        <iframe
          src={iframeUrl}
          title={c.title || 'Embed'}
          style={{ ...style, border: 'none', borderRadius: c.borderRadius ?? 8 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
    return (
      <div style={{ ...style, display: 'grid', placeItems: 'center', background: '#F1F5F9', borderRadius: 8 }}>
        <a href={c.url} target="_blank" rel="noreferrer">{c.title || c.url}</a>
      </div>
    )
  }

  if (el.type === 'shape') {
    const c = el.content || {}
    const shape = normalizeApiShape(c.shape || 'rect')
    const fill = resolveFillCss(c.fill, palette, 'rgba(148,163,184,0.35)')
    return (
      <div
        style={{
          ...style,
          background: fill,
          borderRadius: shape === 'ellipse' || shape === 'circle' ? '50%' : c.borderRadius ?? 0,
          border: c.stroke ? `${c.strokeWidth || 2}px solid ${c.stroke}` : undefined,
        }}
      />
    )
  }

  if (el.type === 'table') {
    const c = el.content || {}
    const cells = c.cells || c.rows || []
    return (
      <div style={{ ...style, overflow: 'auto' }}>
        <table className="ppt-present-table">
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri}>
                {(row || []).map((cell, ci) => (
                  <td key={ci}>{cell}</td>
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
}) {
  const [index, setIndex] = useState(initialSlideIndex)
  const [focusElementId, setFocusElementId] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

  const slide = slides[index]
  const canvas = resolveCanvasSize(slide, aspectRatio)
  const elements = slide?.elements?.elements || []
  const transition =
    slide?.transition || slide?.elements?.transition || 'none'
  const palette = themeVisual?.palette || null
  const hasElements = elements.length > 0
  const fallbackImage = hasElements ? null : getSlideImage(slide).url

  const go = useCallback(
    (delta) => {
      setTransitioning(true)
      setFocusElementId(null)
      setTimeout(() => {
        setIndex((i) => Math.max(0, Math.min(slides.length - 1, i + delta)))
        setTransitioning(false)
      }, transition === 'none' ? 0 : 280)
    },
    [slides.length, transition]
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        go(1)
      }
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'f' || e.key === 'F') {
        const ids = elements.map((el) => el.id).filter(Boolean)
        if (!ids.length) return
        setFocusElementId((prev) => {
          if (!prev) return ids[0]
          const idx = ids.indexOf(prev)
          return ids[(idx + 1) % ids.length]
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, go, elements])

  const transitionClass = transitioning
    ? `ppt-present-stage--${transition}`
    : ''

  return (
    <div className="ppt-present-overlay" role="dialog" aria-label="Present mode">
      <header className="ppt-present-header">
        <span>
          Slide {index + 1} / {slides.length}
          {PPT_SLIDE_TRANSITIONS.find((t) => t.id === transition)?.label &&
            ` · ${PPT_SLIDE_TRANSITIONS.find((t) => t.id === transition).label}`}
        </span>
        <div className="ppt-present-header-actions">
          <button type="button" onClick={() => setFocusElementId(null)} title="Clear focus (F cycles blocks)">
            <FiMaximize2 size={16} /> Focus
          </button>
          <button type="button" onClick={onClose} aria-label="Exit present mode">
            <FiX size={18} />
          </button>
        </div>
      </header>

      <div className={`ppt-present-stage ${transitionClass}`}>
        <div
          className="ppt-present-slide"
          style={{
            background: themeVisual?.inner || '#fff',
            aspectRatio: `${canvas.width} / ${canvas.height}`,
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

      {slide?.speakerNotes && (
        <footer className="ppt-present-notes">{slide.speakerNotes}</footer>
      )}

      <nav className="ppt-present-nav">
        <button type="button" disabled={index <= 0} onClick={() => go(-1)}>
          <FiChevronLeft size={20} />
        </button>
        <button type="button" disabled={index >= slides.length - 1} onClick={() => go(1)}>
          <FiChevronRight size={20} />
        </button>
      </nav>
    </div>
  )
}
