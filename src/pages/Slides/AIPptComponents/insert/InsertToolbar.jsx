import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FiType,
  FiBarChart2,
  FiGrid,
  FiCode,
} from 'react-icons/fi'
import { InsertMediaIcon, InsertShapeIcon } from './InsertToolIcons'
import TextPanel from './TextPanel'
import MediaPanel from './MediaPanel'
import ShapePanel from './ShapePanel'
import ChartPanel from './ChartPanel'
import TablePopover from './TablePopover'
import EmbedPanel from './EmbedPanel'
import './insertPanels.css'

const TOOLS = [
  { id: 'text', label: 'Text', Icon: FiType },
  { id: 'media', label: 'Media', Icon: InsertMediaIcon },
  { id: 'shape', label: 'Shape', Icon: InsertShapeIcon },
  { id: 'chart', label: 'Chart', Icon: FiBarChart2 },
  { id: 'table', label: 'Table', Icon: FiGrid },
  { id: 'embed', label: 'Embed', Icon: FiCode },
]

/**
 * Gamma-style insert toolbar: one panel open at a time.
 * Panels are portaled + fixed under the top bar so they never cover Add slide.
 */
export default function InsertToolbar({
  disabled = false,
  workspaceId,
  presentationId,
  slideId,
  targetElementId = null,
  brandKits = [],
  elementPresets = [],
  onInsert,
  onMediaAttached,
  insertDisabledReason,
  orientation = 'horizontal',
}) {
  const [openTool, setOpenTool] = useState(null)
  const [panelPos, setPanelPos] = useState({ top: 80, left: null })
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const buttonRefs = useRef({})

  useEffect(() => {
    if (!openTool) return undefined
    const onDoc = (e) => {
      const inToolbar = rootRef.current?.contains(e.target)
      const inPanel = panelRef.current?.contains(e.target)
      if (!inToolbar && !inPanel) setOpenTool(null)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenTool(null)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [openTool])

  useLayoutEffect(() => {
    if (!openTool) return undefined

    const place = () => {
      const btn = buttonRefs.current[openTool]
      const panel = panelRef.current
      const navBottom = 76
      const margin = 16
      const viewportW = window.innerWidth
      const panelW = panel?.offsetWidth || (openTool === 'table' || openTool === 'text' ? 320 : 720)

      let left
      if (btn) {
        const rect = btn.getBoundingClientRect()
        left = rect.left + rect.width / 2 - panelW / 2
      } else {
        left = (viewportW - panelW) / 2
      }

      // Keep clear of the left outline / Add slide rail (~260px)
      const minLeft = 280
      left = Math.max(minLeft, Math.min(left, viewportW - panelW - margin))

      setPanelPos({
        top: Math.max(navBottom, (btn?.getBoundingClientRect().bottom || 64) + 10),
        left,
      })
    }

    place()
    // Re-measure after paint when panel width is known
    const raf = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', place)
    }
  }, [openTool])

  const handleInsert = (payload) => {
    onInsert?.(payload)
    setOpenTool(null)
  }

  const toggle = (id) => {
    if (disabled) return
    setOpenTool((prev) => (prev === id ? null : id))
  }

  const panel =
    openTool &&
    createPortal(
      <div
        ref={panelRef}
        className={`ppt-insert-portal ppt-insert-portal--${openTool}`}
        style={{ top: panelPos.top, left: panelPos.left ?? undefined }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {openTool === 'text' && (
          <TextPanel
            onInsert={handleInsert}
            disabled={disabled}
            elementPresets={elementPresets}
          />
        )}
        {openTool === 'media' && (
          <MediaPanel
            workspaceId={workspaceId}
            presentationId={presentationId}
            slideId={slideId}
            targetElementId={targetElementId}
            brandKits={brandKits}
            onInsert={handleInsert}
            onMediaAttached={onMediaAttached}
            disabled={disabled}
          />
        )}
        {openTool === 'shape' && <ShapePanel onInsert={handleInsert} disabled={disabled} />}
        {openTool === 'chart' && (
          <ChartPanel
            onInsert={handleInsert}
            disabled={disabled}
            elementPresets={elementPresets}
          />
        )}
        {openTool === 'table' && <TablePopover onInsert={handleInsert} disabled={disabled} />}
        {openTool === 'embed' && <EmbedPanel onInsert={handleInsert} disabled={disabled} />}
      </div>,
      document.body
    )

  return (
    <div
      className={`ppt-insert-toolbar ppt-insert-toolbar--${orientation}`}
      ref={rootRef}
    >
      {TOOLS.map((tool) => {
        const ToolIcon = tool.Icon
        return (
          <div key={tool.id} className="ppt-insert-tool-wrap">
            <button
              type="button"
              ref={(el) => {
                buttonRefs.current[tool.id] = el
              }}
              className={`ppt-insert-tool-btn ${orientation === 'horizontal' ? 'ppt-insert-tool-btn--labeled' : 'aig-float-btn'} ${openTool === tool.id ? 'is-active' : ''}`}
              title={insertDisabledReason || tool.label}
              disabled={disabled}
              aria-expanded={openTool === tool.id}
              aria-label={tool.label}
              onClick={() => toggle(tool.id)}
            >
              <ToolIcon size={18} />
              {orientation === 'horizontal' && (
                <span className="ppt-insert-tool-label">{tool.label}</span>
              )}
            </button>
          </div>
        )
      })}
      {panel}
    </div>
  )
}
