import { useEffect, useRef } from 'react'
import { FiCode, FiImage } from 'react-icons/fi'
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

function EditableText({
  content,
  palette,
  editable,
  editing,
  onStartEdit,
  onEndEdit,
  onChange,
  style,
}) {
  const ref = useRef(null)

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

  const c = content || {}
  const color = resolveThemeColor(c.color || c.colorRole, palette, '#0F172A')
  const weight = c.fontWeight || (c.bold ? 700 : 400)
  const decoration = [c.underline && 'underline', c.strikethrough && 'line-through']
    .filter(Boolean)
    .join(' ')

  const textStyle = {
    ...style,
    color,
    fontSize: c.fontSize ? `${Math.max(12, Math.min(c.fontSize, 120))}px` : '22px',
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

  if (el.type === 'text') {
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
      const radius = c.borderRadius != null ? c.borderRadius : 8
      return (
        <div
          style={{
            ...fillStyle,
            background: c.placeholderFill || 'linear-gradient(145deg, #eef2f7 0%, #e2e8f0 100%)',
            borderRadius: radius,
            border: '1px solid color-mix(in srgb, #94a3b8 22%, transparent)',
          }}
        >
          <div className="aig-canvas-image-fallback ppt-image-placeholder">
            <FiImage size={22} strokeWidth={1.5} />
          </div>
        </div>
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
