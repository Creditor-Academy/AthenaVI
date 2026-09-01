import { useCallback, useEffect, useRef } from 'react'
import { FiCode } from 'react-icons/fi'
import PptChartRenderer, { getEmbedIframeUrl } from './PptChartRenderer'
import ExternalLinkHoverLayer from './ExternalLinkHoverLayer'
import {
  resolveThemeColor,
  buildCanvasShapeStyle,
  buildNativeShapeBoxStyle,
  buildImageEdgeFadeMask,
  buildImageClipPath,
  shapeElementUsesNativeStyle,
  mediaFlipTransform,
} from '../../../utils/presentationHelpers'
import { getListMarker, splitTextLines, stripLeadingListMarkers } from '../../../utils/textListUtils'
import { measureTextContentSize } from '../../../utils/canvasTransformUtils'
import {
  collapseDuplicatedRuns,
  contentPlainText,
  contentUsesFullRuns,
  getPptTextSelection,
  getTextOffsetsInNode,
  isGradientFill,
  resolveTextHex,
  runFill,
  seedEditableNode,
  serializeEditableRuns,
  setPptTextSelection,
  setTextOffsetsInNode,
  textPaintStyle,
} from '../../../utils/pptTextContent'
import DeviceFrameVisual, { resolveDeviceFrameColor } from '../../../components/ppt/DeviceFrameVisual'
import EmptyImagePlaceholder from '../../../components/ppt/EmptyImagePlaceholder'
import ClipShapeSvg from '../../../components/ppt/ClipShapeSvg'
import GraphicCanvasVisual from '../../../components/ppt/GraphicCanvasVisual'
import { parsePolygonClipPath } from '../../../utils/shapeClipSvg'

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

function runPaintStyle(run, palette, fallbackColor) {
  const fill = runFill(run, { type: 'solid', color: fallbackColor })
  const paint = textPaintStyle(fill, palette, fallbackColor)
  return {
    ...paint,
    fontWeight: run.fontWeight ?? (run.bold ? 700 : undefined),
    fontStyle: run.italic ? 'italic' : undefined,
    fontFamily: run.fontFamily,
  }
}

function RichTextDisplay({ runs, palette, baseStyle = {} }) {
  if (!Array.isArray(runs) || !runs.length) return null
  const fallback = baseStyle.color || '#0F172A'
  return (
    <span className="ppt-rich-text">
      {runs.map((run, i) => (
        <span key={i} style={runPaintStyle(run, palette, fallback)}>
          {run.text}
        </span>
      ))}
    </span>
  )
}

function readEditableText(node, listType, fallback = '') {
  let text = node?.innerText ?? fallback
  if (listType) text = stripLeadingListMarkers(text)
  return text
}

function EditableText({
  content,
  palette,
  editable,
  editing,
  selected,
  elementId,
  onStartEdit,
  onEndEdit,
  onHeightChange,
  showEmptyHint = false,
  style,
}) {
  const ref = useRef(null)
  const measureRaf = useRef(null)
  const endedRef = useRef(false)
  const startTextRef = useRef('')
  const liveTextRef = useRef('')
  const liveRunsRef = useRef(null)
  const typedRef = useRef(false)
  const wasEditingRef = useRef(false)
  const selRef = useRef(null)
  const restoringSelRef = useRef(false)
  const c = content || {}
  const fontSize = Number(c.fontSize) > 0 ? Number(c.fontSize) : 22
  const plainText = contentPlainText(c)
  const runsSig = JSON.stringify({
    runs: c.runs || null,
    fill: c.fill || null,
    color: c.color || null,
  })

  const syncHeight = useCallback(
    ({ commit = false, allowShrink = false } = {}) => {
      if (!ref.current || !onHeightChange) return
      const measured = measureTextContentSize(ref.current, { paddingX: 0, paddingY: 4 })
      if (!measured) return
      onHeightChange(measured.height, { commit, allowShrink })
    },
    [onHeightChange]
  )

  useEffect(() => {
    if (!editing || !ref.current) {
      wasEditingRef.current = false
      liveRunsRef.current = null
      return
    }
    const node = ref.current
    const justStarted = !wasEditingRef.current
    wasEditingRef.current = true
    if (justStarted) {
      endedRef.current = false
      typedRef.current = false
      startTextRef.current = plainText
      liveTextRef.current = plainText
      liveRunsRef.current = null
      selRef.current = null
    }
    const seedText = justStarted ? plainText : (liveTextRef.current ?? plainText)
    seedEditableNode(
      node,
      {
        ...c,
        text: seedText,
        runs: justStarted ? collapseDuplicatedRuns(c) : liveRunsRef.current || c.runs,
      },
      palette
    )
    liveRunsRef.current = serializeEditableRuns(node)
    if (justStarted) {
      node.focus()
      const range = document.createRange()
      range.selectNodeContents(node)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    } else {
      const keep = selRef.current || getPptTextSelection()
      if (keep && keep.end > keep.start && (!keep.elementId || keep.elementId === elementId)) {
        restoringSelRef.current = true
        setTextOffsetsInNode(node, keep.start, keep.end)
        requestAnimationFrame(() => {
          restoringSelRef.current = false
        })
      }
    }
  }, [editing, runsSig])

  useEffect(() => {
    if (!editing) return undefined
    const onSel = () => {
      if (restoringSelRef.current) return
      const offsets = getTextOffsetsInNode(ref.current)
      if (!offsets) return
      if (offsets.end > offsets.start) {
        selRef.current = offsets
        setPptTextSelection({ elementId, ...offsets })
      } else {
        selRef.current = null
        setPptTextSelection(null)
      }
    }
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [editing, elementId])

  useEffect(() => {
    return () => cancelAnimationFrame(measureRaf.current)
  }, [])

  const color = resolveTextHex(c, palette)
  const weight = c.fontWeight || (c.bold ? 700 : 400)
  const decoration = [c.underline && 'underline', c.strikethrough && 'line-through']
    .filter(Boolean)
    .join(' ')
  const cursor = editing ? 'text' : selected && editable ? 'default' : editable ? 'pointer' : undefined
  const paintRuns = collapseDuplicatedRuns(c)
  const usesRuns = contentUsesFullRuns({ ...c, runs: paintRuns })
  const boxPaint =
    !usesRuns && isGradientFill(c.fill) ? textPaintStyle(c.fill, palette, color) : { color }

  const clipToSlot = c.clipToSlot !== false
  const textStyle = {
    ...style,
    ...boxPaint,
    fontSize: `${fontSize}px`,
    fontWeight: weight,
    fontStyle: c.italic ? 'italic' : 'normal',
    textDecoration: decoration || undefined,
    fontFamily: c.fontFamily || undefined,
    textAlign: c.align || 'left',
    textTransform: c.textTransform || undefined,
    letterSpacing: c.letterSpacing != null ? c.letterSpacing : undefined,
    whiteSpace: c.wrap === 'nowrap' ? 'nowrap' : 'pre-wrap',
    wordBreak: c.wrap === 'nowrap' ? 'normal' : 'break-word',
    lineHeight: c.lineHeight != null ? c.lineHeight : 1.25,
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
    minHeight: '1em',
    cursor,
    display: 'block',
    padding:
      c.padding != null
        ? `${c.padding}px ${c.paddingX != null ? c.paddingX : c.padding}px`
        : undefined,
    ...(editing
      ? {
          height: 'auto',
          overflow: 'visible',
          caretColor: color,
          WebkitTextFillColor: unsetIfRuns(usesRuns, boxPaint),
        }
      : {
          height: clipToSlot ? '100%' : 'auto',
          overflow: clipToSlot ? 'hidden' : 'visible',
        }),
  }

  const wrapStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent:
      c.verticalAlign === 'center'
        ? 'center'
        : c.verticalAlign === 'flex-end'
          ? 'flex-end'
          : 'flex-start',
    overflow: clipToSlot ? 'hidden' : undefined,
  }

  const finishEdit = (node) => {
    if (endedRef.current) return
    endedRef.current = true
    selRef.current = null
    setPptTextSelection(null)
    const serialized = serializeEditableRuns(node)
    let text = readEditableText(node, c.listType, liveTextRef.current || plainText)
    if (!String(text).trim() && String(startTextRef.current).trim() && !typedRef.current) {
      text = startTextRef.current
    }
    const runs = collapseDuplicatedRuns({ text, runs: serialized })
    const changed = text !== startTextRef.current
    if (changed) syncHeight({ commit: true, allowShrink: true })
    onEndEdit?.(text, runs)
  }

  useEffect(() => {
    if (!editing) return undefined
    const onDown = (e) => {
      if (ref.current?.contains(e.target)) return
      if (
        e.target.closest?.(
          '.ppt-fill-picker, .ppt-fill-picker-pop, .ppt-element-toolbar, .ppt-design-toolbar-panel, .ppt-element-props-grid, .ppt-element-props-color'
        )
      ) {
        return
      }
      finishEdit(ref.current)
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [editing])

  if (editing) {
    return (
      <div style={wrapStyle}>
        <div
          key="ppt-text-edit"
          ref={ref}
          className="ppt-text-editable"
          contentEditable
          suppressContentEditableWarning
          style={textStyle}
          onPointerDown={(e) => editable && e.stopPropagation()}
          onInput={(e) => {
            const inputType = e.nativeEvent?.inputType
            if (inputType === 'historyUndo' || inputType === 'historyRedo') return
            typedRef.current = true
            liveTextRef.current = e.currentTarget.innerText ?? ''
            liveRunsRef.current = serializeEditableRuns(e.currentTarget)
            cancelAnimationFrame(measureRaf.current)
            measureRaf.current = requestAnimationFrame(() => {
              syncHeight({ commit: false, allowShrink: true })
            })
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Escape') {
              e.preventDefault()
              finishEdit(ref.current)
            }
          }}
        />
      </div>
    )
  }

  const displayText = plainText || (editable || showEmptyHint ? 'Double-click to edit' : '')
  const className = [
    'ppt-text-display',
    editable ? 'ppt-text-display--editable' : '',
    !plainText && (editable || showEmptyHint) ? 'ppt-text-display--empty-hint' : '',
    selected && editable ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div style={wrapStyle}>
      <div
        key="ppt-text-view"
        ref={ref}
        className={className}
        style={textStyle}
        onPointerDown={(e) => editable && e.stopPropagation()}
        onDoubleClick={(e) => {
          if (editable) {
            e.stopPropagation()
            onStartEdit?.()
          }
        }}
      >
        {c.listType && (c.text || plainText) ? (
          <TextListDisplay text={plainText || c.text} listType={c.listType} />
        ) : usesRuns ? (
          <RichTextDisplay runs={paintRuns} palette={palette} baseStyle={textStyle} />
        ) : (
          displayText
        )}
      </div>
    </div>
  )
}

function unsetIfRuns(usesRuns, boxPaint) {
  if (usesRuns) return 'unset'
  return boxPaint.WebkitTextFillColor
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
                        onChange={(e) => {
                          const inputType = e.nativeEvent?.inputType
                          if (inputType === 'historyUndo' || inputType === 'historyRedo') return
                          onCellChange?.(ri, ci, e.target.value)
                        }}
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
  selected = false,
  editingText = false,
  showEmptyTextHint = false,
  onStartTextEdit,
  onEndTextEdit,
  onHeightChange,
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
        selected={selected}
        editing={editingText}
        showEmptyHint={showEmptyTextHint}
        onStartEdit={onStartTextEdit}
        onEndEdit={onEndTextEdit}
        elementId={el.id}
        onHeightChange={onHeightChange}
        style={{ width: '100%', maxWidth: '100%', minHeight: '1em', height: '100%' }}
      />
    )
  }

  if (el.type === 'graphic') {
    const inlineSvg = typeof el.content?.svg === 'string' && el.content.svg.includes('<svg')
    return (
      <div
        className="ppt-media-flip"
        style={{
          ...fillStyle,
          pointerEvents: inlineSvg ? 'none' : undefined,
          transform: mediaFlipTransform(el.content),
          transformOrigin: 'center center',
        }}
      >
        <GraphicCanvasVisual content={el.content || {}} palette={palette} />
      </div>
    )
  }

  if (el.type === 'image' || el.type === 'icon') {
    const c = el.content || {}
    const url = c.url || c.src || c.thumbnailUrl || c.previewUrl
    if (!url) {
      const radius = c.borderRadius != null ? c.borderRadius : 0
      const avatarSlot = /^(AVATAR|AVATAR_\d+)$/i.test(String(el.slotId || ''))
      const circular = c.borderRadius === 999 || c.borderRadius === '50%'
      if (el.type === 'image' && (avatarSlot || (circular && /PORTRAIT_IMAGE/i.test(String(el.slotId || ''))))) {
        return (
          <div
            style={{
              ...fillStyle,
              overflow: 'hidden',
              borderRadius: 999,
              background: c.placeholderFill || '#C5CDD8',
              boxShadow: 'inset 0 0 0 2px #9AA3B2',
            }}
            aria-hidden
          />
        )
      }
      if (el.type === 'image') {
        return (
          <EmptyImagePlaceholder
            className="ppt-image-skeleton ppt-image-skeleton--empty"
            borderRadius={radius}
            style={fillStyle}
          />
        )
      }
      const emptyBg = palette?.surface || palette?.bg || 'transparent'
      return (
        <div
          className="ppt-image-skeleton ppt-image-skeleton--empty"
          style={{
            ...fillStyle,
            background: emptyBg,
            borderRadius: radius,
          }}
          aria-hidden
        />
      )
    }
    const edgeFadeMask = buildImageEdgeFadeMask(c.edgeFade)
    const clipPath = c.clipPath || buildImageClipPath(c.imageMask)
    const isFullBleedMedia =
      String(el.slotId || '').toUpperCase() === 'BACKGROUND_IMAGE' ||
      String(el.role || '').toLowerCase() === 'background' ||
      c.useAsBackground
    return (
      <div
        style={{
          ...fillStyle,
          overflow: 'hidden',
          borderRadius: clipPath || edgeFadeMask || isFullBleedMedia ? 0 : c.borderRadius != null ? c.borderRadius : undefined,
        }}
      >
        <img
          src={url}
          alt={c.alt || c.icon || ''}
          className="ppt-media-flip"
          style={{
            width: '100%',
            height: '100%',
            objectFit: c.fit || (el.type === 'icon' ? 'contain' : 'cover'),
            objectPosition: 'center',
            opacity: c.opacity != null ? c.opacity : 1,
            borderRadius: clipPath || edgeFadeMask || isFullBleedMedia ? 0 : c.borderRadius != null ? c.borderRadius : undefined,
            boxShadow: c.boxShadow || c.shadow || undefined,
            display: 'block',
            transform: mediaFlipTransform(c),
            transformOrigin: 'center center',
            ...(clipPath ? { clipPath, WebkitClipPath: clipPath } : {}),
            ...(edgeFadeMask
              ? {
                  WebkitMaskImage: edgeFadeMask,
                  maskImage: edgeFadeMask,
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                }
              : {}),
          }}
          onError={() => onImageAuthError?.(el.id)}
        />
      </div>
    )
  }

  if (el.type === 'shape') {
    const c = el.content || {}
    const deviceKind = c.deviceFrame || (c.shape === 'device-frame' ? 'phone' : null)
    if (deviceKind) {
      const screenSrc = c.screenUrl || c.url || c.src || c.thumbnailUrl || c.previewUrl
      const frameColor = resolveDeviceFrameColor(c, palette)
      return (
        <div style={{ ...fillStyle, position: 'relative' }}>
          <DeviceFrameVisual kind={deviceKind} src={screenSrc} frameColor={frameColor} />
          {selected && !screenSrc && (
            <div className="ppt-device-frame-drop-hint" aria-hidden>
              Drop image here
            </div>
          )}
        </div>
      )
    }
    const shapeImageUrl = c.url || c.src || c.thumbnailUrl || c.previewUrl
    if (shapeImageUrl) {
      return (
        <img
          src={shapeImageUrl}
          alt={c.alt || ''}
          className="ppt-media-flip"
          style={{
            ...fillStyle,
            objectFit: c.fit || 'cover',
            opacity: c.opacity != null ? c.opacity : 1,
            borderRadius: c.borderRadius != null ? c.borderRadius : undefined,
            transform: mediaFlipTransform(c),
            transformOrigin: 'center center',
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

    if (rendered.kind === 'clip' && rendered.clipPath) {
      const svgFill = rendered.outlined
        ? 'none'
        : rendered.fill || rendered.style?.background || '#475569'
      const fillColor = typeof svgFill === 'string' ? svgFill : '#475569'
      const canSvg = Boolean(parsePolygonClipPath(rendered.clipPath))
      if (canSvg) {
        return (
          <div style={{ ...fillStyle, position: 'relative' }}>
            <ClipShapeSvg
              clipPath={rendered.clipPath}
              fill={fillColor}
              stroke={
                rendered.strokeWidth > 0
                  ? (typeof rendered.stroke === 'string' ? rendered.stroke : '#475569')
                  : 'none'
              }
              strokeWidth={rendered.strokeWidth || 0}
              strokeDasharray={rendered.strokeDasharray}
              outlined={Boolean(rendered.outlined)}
            />
            {inner}
          </div>
        )
      }
      return (
        <div style={{ ...fillStyle, ...rendered.style }}>
          {inner}
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
