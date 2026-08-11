import { useEffect, useRef } from 'react'
import { FiCode, FiImage } from 'react-icons/fi'
import PptChartRenderer, { getEmbedIframeUrl } from './PptChartRenderer'
import {
  normalizeApiShape,
  resolveFillCss,
  resolveThemeColor,
} from '../../../utils/presentationHelpers'

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
    letterSpacing: c.letterSpacing != null ? `${c.letterSpacing}em` : undefined,
    whiteSpace: c.wrap === 'nowrap' ? 'nowrap' : 'pre-wrap',
    lineHeight: c.lineHeight != null ? c.lineHeight : 1.25,
  }

  if (editing) {
    return (
      <div
        ref={ref}
        className="ppt-text-editable"
        contentEditable
        suppressContentEditableWarning
        style={textStyle}
        onBlur={(e) => onEndEdit?.(e.currentTarget.innerText)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            onEndEdit?.(ref.current?.innerText || c.text)
          }
        }}
      >
        {c.text || ''}
      </div>
    )
  }

  return (
    <div
      style={textStyle}
      onDoubleClick={(e) => {
        if (editable) {
          e.stopPropagation()
          onStartEdit?.()
        }
      }}
    >
      {c.text || (editable ? 'Double-click to edit' : '')}
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
      return (
        <div style={{ ...fillStyle, background: 'rgba(148,163,184,0.16)' }}>
          <div className="aig-canvas-image-fallback">
            <FiImage size={18} />
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
        }}
        onError={() => onImageAuthError?.(el.id)}
      />
    )
  }

  if (el.type === 'shape') {
    const c = el.content || {}
    const shape = normalizeApiShape(c.shape || 'rect')
    const fill = resolveFillCss(c.fill, palette, 'rgba(148,163,184,0.35)')
    const stroke = c.stroke ? resolveThemeColor(c.stroke, palette, c.stroke) : undefined
    const strokeWidth = c.strokeWidth || 3
    const clipPaths = {
      triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    }
    const clip = clipPaths[shape] || clipPaths[c.shape]
    const radius =
      shape === 'ellipse' || shape === 'circle'
        ? '50%'
        : shape === 'pill'
          ? 999
          : shape === 'rounded-rect'
            ? c.borderRadius != null
              ? c.borderRadius
              : 12
            : c.borderRadius || 0

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
          color: stroke || palette?.text || '#0F172A',
          padding: 8,
          textAlign: 'center',
        }}
      >
        {shapeLabel}
      </div>
    ) : null

    if (clip) {
      return (
        <div style={{ ...fillStyle, background: fill, clipPath: clip }}>
          {inner}
        </div>
      )
    }

    return (
      <div
        style={{
          ...fillStyle,
          background: fill === 'transparent' ? 'transparent' : fill,
          borderRadius: radius,
          border: stroke ? `${strokeWidth}px solid ${stroke}` : undefined,
          boxSizing: 'border-box',
        }}
      >
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
        <iframe
          src={iframeUrl}
          title={c.title || 'Embed'}
          className="ppt-embed-iframe"
          style={{
            ...fillStyle,
            borderRadius: c.borderRadius ?? 8,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
    return (
      <div className="aig-canvas-embed" style={fillStyle}>
        <div className="aig-canvas-embed-label">
          <FiCode size={12} style={{ marginRight: 4 }} />
          {c.title || c.provider || 'Embed'}
        </div>
        <div className="aig-canvas-embed-url">{c.url || ''}</div>
      </div>
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
