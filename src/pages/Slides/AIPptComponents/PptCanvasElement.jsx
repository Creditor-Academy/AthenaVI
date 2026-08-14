import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FiCode } from 'react-icons/fi'
import PptChartRenderer, { getEmbedIframeUrl } from './PptChartRenderer'
import ExternalLinkHoverLayer from './ExternalLinkHoverLayer'
import {
  resolveThemeColor,
  buildCanvasShapeStyle,
  buildNativeShapeBoxStyle,
  shapeElementUsesNativeStyle,
} from '../../../utils/presentationHelpers'
import { getListMarker, splitTextLines, stripLeadingListMarkers } from '../../../utils/textListUtils'

function TextListDisplay({ text, listType }) {
  const lines = splitTextLines(text)
  if (!listType || !lines.length) return text || null

  return (
    <div className="ppt-text-list">
      {lines.map((line, index) => (
        <div key={index} className="ppt-text-list-item">
          <span
            className={`ppt-text-list-marker ppt-text-list-marker--${listType}`}
            aria-hidden
          >
            {getListMarker(listType, index)}
          </span>
          <span className="ppt-text-list-line">{line || '\u00A0'}</span>
        </div>
      ))}
    </div>
  )
}

function RichTextDisplay({ runs, palette, baseStyle = {} }) {
  if (!Array.isArray(runs) || !runs.length) return null
  return (
    <>
      {runs.map((run, i) => {
        const color = resolveThemeColor(run.color || run.colorRole, palette, baseStyle.color || '#0F172A')
        const weight = run.fontWeight ?? (run.bold ? 700 : baseStyle.fontWeight || 400)
        return (
          <span
            key={i}
            style={{
              color,
              fontWeight: weight,
              fontStyle: run.italic ? 'italic' : baseStyle.fontStyle || 'normal',
              fontFamily: run.fontFamily || baseStyle.fontFamily,
            }}
          >
            {run.text}
          </span>
        )
      })}
    </>
  )
}

function EditableText({
  content,
  palette,
  editable,
  editing,
  onStartEdit,
  onEndEdit,
  onChange,
  style,
  autoFit = true,
}) {
  const ref = useRef(null)
  const c = content || {}
  const baseFontSize = c.fontSize ? Math.max(12, Math.min(Number(c.fontSize), 120)) : 22
  const [fitFontSize, setFitFontSize] = useState(baseFontSize)

  useLayoutEffect(() => {
    if (editing || !autoFit || !ref.current) {
      setFitFontSize(baseFontSize)
      return
    }
    const node = ref.current
    let size = baseFontSize
    node.style.fontSize = `${size}px`
    const minSize = 12
    while (size > minSize && node.scrollHeight > node.clientHeight + 2) {
      size -= 1
      node.style.fontSize = `${size}px`
    }
    setFitFontSize(size)
  }, [c.text, baseFontSize, editing, autoFit, style?.height, style?.width])

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editing])

  const color = resolveThemeColor(c.color || c.colorRole, palette, '#0F172A')
  const weight = c.fontWeight || (c.bold ? 700 : 400)
  const decoration = [c.underline && 'underline', c.strikethrough && 'line-through']
    .filter(Boolean)
    .join(' ')

  const textStyle = {
    ...style,
    color,
    fontSize: `${fitFontSize}px`,
    fontWeight: weight,
    fontStyle: c.italic ? 'italic' : 'normal',
    textDecoration: decoration || undefined,
    fontFamily: c.fontFamily || undefined,
    textAlign: c.align || 'left',
    textTransform: c.textTransform || undefined,
    letterSpacing: c.letterSpacing != null ? c.letterSpacing : undefined,
    whiteSpace: c.wrap === 'nowrap' ? 'nowrap' : 'pre-wrap',
    lineHeight: c.lineHeight != null ? c.lineHeight : 1.25,
    overflow: 'hidden',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent:
      c.verticalAlign === 'center' ? 'center' : c.verticalAlign === 'flex-end' ? 'flex-end' : 'flex-start',
    padding:
      c.padding != null
        ? `${c.padding}px ${c.paddingX != null ? c.paddingX : c.padding}px`
        : undefined,
  }

  if (editing) {
    return (
      <div
        ref={ref}
        className="ppt-text-editable"
        contentEditable
        suppressContentEditableWarning
        style={textStyle}
        onPointerDown={(e) => editable && e.stopPropagation()}
        onBlur={(e) => {
          let text = e.currentTarget.innerText
          if (c.listType) text = stripLeadingListMarkers(text)
          onEndEdit?.(text)
        }}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === 'Escape') {
            e.preventDefault()
            let text = ref.current?.innerText || c.text
            if (c.listType) text = stripLeadingListMarkers(text)
            onEndEdit?.(text)
          }
        }}
      >
        {c.text || ''}
      </div>
    )
  }

  const displayText = c.text || (editable ? 'Double-click to edit' : '')

  return (
    <div
      className={editable ? 'ppt-text-display ppt-text-display--editable' : 'ppt-text-display'}
      style={textStyle}
      onPointerDown={(e) => editable && e.stopPropagation()}
      onDoubleClick={(e) => {
        if (editable) {
          e.stopPropagation()
          onStartEdit?.()
        }
      }}
    >
      {c.listType && c.text ? (
        <TextListDisplay text={c.text} listType={c.listType} />
      ) : Array.isArray(c.runs) && c.runs.length ? (
        <RichTextDisplay runs={c.runs} palette={palette} baseStyle={textStyle} />
      ) : (
        displayText
      )}
    </div>
  )
}

function EditableTable({ content, editable, onCellChange, onActivate, style }) {
  const c = content || {}
  const cells = Array.isArray(c.cells)
    ? c.cells
    : Array.isArray(c.rows) && Array.isArray(c.rows[0])
      ? c.rows
      : []

  return (
    <div className="aig-canvas-table" style={style}>
      <table className="aig-canvas-table-grid">
        <tbody>
          {cells.map((row, ri) => (
            <tr key={ri}>
              {(row || []).map((cell, ci) => {
                const Tag = c.hasHeader !== false && ri === 0 ? 'th' : 'td'
                return (
                  <Tag key={ci}>
                    {editable ? (
                      <input
                        className="ppt-table-cell-input"
                        value={cell}
                        placeholder={c.hasHeader !== false && ri === 0 ? `Header ${ci + 1}` : 'Type here'}
                        onChange={(e) => onCellChange?.(ri, ci, e.target.value)}
                        onFocus={() => onActivate?.()}
                        onClick={(e) => {
                          e.stopPropagation()
                          onActivate?.()
                        }}
                      />
                    ) : (
                      cell
                    )}
                  </Tag>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PptCanvasElement({
  el,
  palette,
  editable = false,
  editingText = false,
  onStartTextEdit,
  onEndTextEdit,
  onTableCellChange,
  onTableActivate,
  onImageAuthError,
}) {
  const fillStyle = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  }

  if (el.type === 'text' || el.type === 'textbox') {
    return (
      <EditableText
        content={el.content}
        palette={palette}
        editable={editable}
        editing={editingText}
        onStartEdit={onStartTextEdit}
        onEndEdit={onEndTextEdit}
        style={fillStyle}
      />
    )
  }

  if (el.type === 'image' || el.type === 'icon') {
    const c = el.content || {}
    const url = c.url || c.src || c.thumbnailUrl || c.previewUrl
    if (!url) {
      const radius = c.borderRadius != null ? c.borderRadius : 14
      const skeletonBg =
        c.placeholderFill ||
        (palette
          ? `linear-gradient(145deg, color-mix(in srgb, ${palette.primary || palette.accent || '#6366f1'} 8%, ${palette.surface || palette.bg || '#f8fafc'}) 0%, color-mix(in srgb, ${palette.muted || '#94a3b8'} 12%, #e2e8f0) 100%)`
          : 'linear-gradient(145deg, color-mix(in srgb, #6366f1 6%, #f1f5f9) 0%, #e2e8f0 100%)')
      const borderColor = palette
        ? `color-mix(in srgb, ${palette.divider || palette.muted || '#94a3b8'} 28%, transparent)`
        : 'color-mix(in srgb, #94a3b8 22%, transparent)'
      return (
        <div
          className="ppt-image-skeleton"
          style={{
            ...fillStyle,
            background: skeletonBg,
            borderRadius: radius,
            border: `1px solid ${borderColor}`,
          }}
        />
      )
    }
    return (
      <img
        src={url}
        alt={c.alt || c.icon || ''}
        style={{
          ...fillStyle,
          objectFit: c.fit || (el.type === 'icon' ? 'contain' : 'cover'),
          opacity: c.opacity != null ? c.opacity : 1,
          borderRadius: c.borderRadius != null ? c.borderRadius : undefined,
          boxShadow: c.boxShadow || c.shadow || undefined,
        }}
        onError={() => onImageAuthError?.(el.id)}
      />
    )
  }

  if (el.type === 'shape') {
    const c = el.content || {}
    const shapeImageUrl = c.url || c.src || c.thumbnailUrl || c.previewUrl
    if (shapeImageUrl) {
      return (
        <img
          src={shapeImageUrl}
          alt={c.alt || ''}
          style={{
            ...fillStyle,
            objectFit: c.fit || 'cover',
            opacity: c.opacity != null ? c.opacity : 1,
            borderRadius: c.borderRadius != null ? c.borderRadius : undefined,
          }}
          onError={() => onImageAuthError?.(el.id)}
        />
      )
    }
    if (shapeElementUsesNativeStyle(el)) {
      const shapeLabel = c.label || c.text
      const isImagePlaceholder = shapeLabel === 'Image placeholder'
      const inner = shapeLabel ? (
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '100%',
            height: '100%',
            fontSize: isImagePlaceholder ? 13 : 14,
            fontWeight: 600,
            color: isImagePlaceholder ? (palette?.muted || '#6b7280') : (c.stroke || palette?.text || '#0F172A'),
            padding: 8,
            textAlign: 'center',
            textTransform: isImagePlaceholder ? 'uppercase' : undefined,
            letterSpacing: isImagePlaceholder ? '0.06em' : undefined,
          }}
        >
          {shapeLabel}
        </div>
      ) : null
      return (
        <div style={{ ...fillStyle, ...buildNativeShapeBoxStyle(el.nativeStyle) }}>
          {inner}
        </div>
      )
    }

    const rendered = buildCanvasShapeStyle(c, palette)
    const shapeLabel = c.label || c.text
    const inner = shapeLabel ? (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '100%',
          height: '100%',
          fontSize: 14,
          fontWeight: 600,
          color: c.stroke || palette?.text || '#0F172A',
          padding: 8,
          textAlign: 'center',
        }}
      >
        {shapeLabel}
      </div>
    ) : null

    if (rendered.kind === 'line') {
      return (
        <div
          style={{
            ...fillStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={rendered.style} />
        </div>
      )
    }

    return (
      <div style={{ ...fillStyle, ...rendered.style }}>
        {inner}
      </div>
    )
  }

  if (el.type === 'chart') {
    return (
      <PptChartRenderer
        content={el.content || {}}
        palette={palette}
        style={fillStyle}
      />
    )
  }

  if (el.type === 'table') {
    return (
      <EditableTable
        content={el.content}
        editable={editable}
        onCellChange={onTableCellChange}
        onActivate={onTableActivate}
        style={fillStyle}
      />
    )
  }

  if (el.type === 'embed' || el.type === 'link') {
    const c = el.content || {}
    const iframeUrl = getEmbedIframeUrl(c)
    if (iframeUrl) {
      return (
        <ExternalLinkHoverLayer content={c} style={fillStyle}>
          <iframe
            src={iframeUrl}
            title={c.title || 'Embed'}
            className="ppt-embed-iframe"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: c.borderRadius ?? 8,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </ExternalLinkHoverLayer>
      )
    }
    return (
      <ExternalLinkHoverLayer content={c} style={fillStyle}>
        <div className="aig-canvas-embed">
          <div className="aig-canvas-embed-label">
            <FiCode size={12} style={{ marginRight: 4 }} />
            {c.title || c.provider || 'Embed'}
          </div>
          <div className="aig-canvas-embed-url">{c.url || ''}</div>
        </div>
      </ExternalLinkHoverLayer>
    )
  }

  if (el.type === 'group') {
    return (
      <div
        style={{
          ...fillStyle,
          border: '1px dashed rgba(59,130,246,0.45)',
          background: 'rgba(59,130,246,0.04)',
        }}
      />
    )
  }

  return <div style={fillStyle} />
}
