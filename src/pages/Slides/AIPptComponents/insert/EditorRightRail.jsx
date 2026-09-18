import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FiMessageCircle,
  FiUserPlus,
  FiX,
  FiTrash2,
  FiFileText,
  FiLayers,
  FiType,
  FiImage,
  FiBarChart2,
  FiSquare,
  FiGrid,
  FiCode,
} from 'react-icons/fi'
import { MdDragIndicator, MdOutlineDesignServices, MdOutlineAnimation } from 'react-icons/md'
import { attachPointerDrag, exceedsDragThreshold } from '../../../../utils/pointerDrag'
import { BsStars } from 'react-icons/bs'
import { HiOutlineClipboard } from 'react-icons/hi'
import DesignContextPanel from './DesignContextPanel'
import presentationService from '../../../../services/presentationService'
import PptCommentsPanel from '../PptCommentsPanel'
import PptPublicCommentsPanel from '../PptPublicCommentsPanel'
import SpeakerNotesPanel from '../SpeakerNotesPanel'
import SlideTransitionPicker from './SlideTransitionPicker'
import { PPT_SLIDE_STATUSES, resolveSlideProgressStatus, progressStatusDotClass } from '../../../../constants/pptSlideEditorOptions'
import { findTemplateForSlideLayout, templateRecordId } from '../../../../utils/similarLayouts'
import './insertPanels.css'
import '../pptEditorExtras.css'
import '../pptPanelUi.css'

const DESIGN_PANEL_TITLES = {
  slide: 'Slide design',
  text: 'Text',
  textbox: 'Text',
  image: 'Image',
  icon: 'Image',
  chart: 'Chart',
  shape: 'Shape',
  table: 'Table',
  embed: 'Embed',
}

const RAIL_TOOLS = [
  { id: 'design', label: 'Design', Icon: MdOutlineDesignServices },
  { id: 'transition', label: 'Slide transition', Icon: MdOutlineAnimation },
  { id: 'comments', label: 'Comments', Icon: FiMessageCircle },
  { id: 'status', label: 'Status', Icon: HiOutlineClipboard },
  { id: 'notes', label: 'Speaker notes', Icon: FiFileText },
  { id: 'layers', label: 'Layers', Icon: FiLayers },
]

function personInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function layerTypeIcon(type) {
  switch (type) {
    case 'text':
      return FiType
    case 'image':
    case 'icon':
      return FiImage
    case 'chart':
      return FiBarChart2
    case 'shape':
      return FiSquare
    case 'table':
      return FiGrid
    case 'embed':
      return FiCode
    default:
      return FiLayers
  }
}

function layerLabel(el) {
  const text = String(el?.content?.text || '').replace(/\s+/g, ' ').trim()
  if (text) return text.slice(0, 28)
  if (el?.type === 'image' || el?.type === 'icon') return el.content?.alt || el.content?.name || el.type
  return el?.type || 'element'
}

function dropSlotFromPointer(listEl, clientY) {
  const rows = [...(listEl?.querySelectorAll('[data-layer-id]') || [])]
  if (!rows.length) return 0
  for (let i = 0; i < rows.length; i += 1) {
    const rect = rows[i].getBoundingClientRect()
    if (clientY < rect.top + rect.height / 2) return i
  }
  return rows.length
}

function dropLineOffset(listEl, slot) {
  const rows = [...(listEl?.querySelectorAll('[data-layer-id]') || [])]
  if (!listEl || !rows.length) return 0
  const listTop = listEl.getBoundingClientRect().top
  if (slot <= 0) return rows[0].getBoundingClientRect().top - listTop - 3
  if (slot >= rows.length) {
    return rows[rows.length - 1].getBoundingClientRect().bottom - listTop + 3
  }
  const prev = rows[slot - 1].getBoundingClientRect()
  const next = rows[slot].getBoundingClientRect()
  return (prev.bottom + next.top) / 2 - listTop
}

function orderFromDropSlot(ids, draggingId, slot) {
  const from = ids.indexOf(draggingId)
  if (from < 0) return ids
  const without = ids.filter((id) => id !== draggingId)
  let insert = slot > from ? slot - 1 : slot
  insert = Math.max(0, Math.min(without.length, insert))
  const next = [...without]
  next.splice(insert, 0, draggingId)
  return next
}

function isNoopDrop(ids, draggingId, slot) {
  const from = ids.indexOf(draggingId)
  return from < 0 || slot === from || slot === from + 1
}

function LayersPanel({
  slide,
  selectedElementId,
  disabled,
  onSelectElement,
  onDeleteElement,
  onReorderLayers,
}) {
  const listRef = useRef(null)
  const ghostRef = useRef(null)
  const ghostPosRef = useRef({ x: 0, y: 0 })
  const prevRectsRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)
  const [dropSlot, setDropSlot] = useState(null)
  const [lineTop, setLineTop] = useState(0)
  const [ghost, setGhost] = useState(null)

  const sourceLayers = useMemo(
    () =>
      [...(slide?.elements?.elements || [])].sort((a, b) => (b.layer || 0) - (a.layer || 0)),
    [slide]
  )
  const sourceIds = useMemo(() => sourceLayers.map((el) => el.id), [sourceLayers])
  const layers = sourceLayers
  const idsKey = sourceIds.join('|')

  useLayoutEffect(() => {
    const prev = prevRectsRef.current
    const list = listRef.current
    if (!prev || !list) return
    list.querySelectorAll('[data-layer-id]').forEach((node) => {
      const old = prev.get(node.getAttribute('data-layer-id'))
      if (!old) return
      const now = node.getBoundingClientRect()
      const dy = old.top - now.top
      if (Math.abs(dy) < 1) return
      node.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0px)' }],
        { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      )
    })
    prevRectsRef.current = null
  }, [idsKey])

  useEffect(() => () => {
    document.body.classList.remove('ppt-layers-dragging')
  }, [])

  const beginRowDrag = (e, id) => {
    if (disabled || e.button !== 0) return
    if (e.target.closest?.('[data-layer-delete]')) return
    e.preventDefault()

    const row = e.currentTarget
    const rowRect = row.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const grabX = e.clientX - rowRect.left
    const grabY = e.clientY - rowRect.top
    let started = false
    let slot = sourceIds.indexOf(id)

    const moveGhost = (clientX, clientY) => {
      const x = clientX - grabX
      const y = clientY - grabY
      ghostPosRef.current = { x, y }
      const node = ghostRef.current
      if (!node) return
      node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(0.6deg) scale(1.03)`
    }

    const updateSlot = (clientY) => {
      const nextSlot = dropSlotFromPointer(listRef.current, clientY)
      if (nextSlot === slot) return
      slot = nextSlot
      setDropSlot(nextSlot)
      setLineTop(dropLineOffset(listRef.current, nextSlot))
    }

    attachPointerDrag(e, (mv) => {
      if (!started) {
        if (!exceedsDragThreshold(startX, startY, mv.clientX, mv.clientY)) return
        started = true
        const el = sourceLayers.find((item) => item.id === id)
        const from = sourceIds.indexOf(id)
        setDraggingId(id)
        setGhost({
          width: rowRect.width,
          height: rowRect.height,
          type: el?.type,
          label: layerLabel(el),
          num: sourceIds.length - from,
          selected: selectedElementId === id,
        })
        document.body.classList.add('ppt-layers-dragging')
        moveGhost(mv.clientX, mv.clientY)
        updateSlot(mv.clientY)
        return
      }
      moveGhost(mv.clientX, mv.clientY)
      updateSlot(mv.clientY)
    }, () => {
      document.body.classList.remove('ppt-layers-dragging')
      setDraggingId(null)
      setDropSlot(null)
      setGhost(null)
      if (!started) {
        onSelectElement?.(id)
        return
      }
      if (isNoopDrop(sourceIds, id, slot)) return
      const list = listRef.current
      if (list) {
        const map = new Map()
        list.querySelectorAll('[data-layer-id]').forEach((node) => {
          map.set(node.getAttribute('data-layer-id'), node.getBoundingClientRect())
        })
        prevRectsRef.current = map
      }
      onReorderLayers?.(orderFromDropSlot(sourceIds, id, slot))
    })
  }

  const draggingEl = draggingId ? layers.find((el) => el.id === draggingId) : null
  const GhostIcon = layerTypeIcon(ghost?.type || draggingEl?.type)
  const showDropLine = dropSlot != null && draggingId && !isNoopDrop(sourceIds, draggingId, dropSlot)

  return (
    <div className="ppt-slide-panel ppt-layers-panel" role="region" aria-label="Layers">
      <p className="ppt-slide-panel-hint">
        Drag a layer to shuffle stacking order. Top is in front.
      </p>
      <div ref={listRef} className={`ppt-slide-layers ${draggingId ? 'is-dragging' : ''}`}>
        {layers.length === 0 ? (
          <div className="ppt-slide-layer-empty">No layers yet — insert from the top bar</div>
        ) : (
          layers.map((el, i) => {
            const LayerIcon = layerTypeIcon(el.type)
            const selected = selectedElementId === el.id
            return (
              <div
                key={el.id || i}
                data-layer-id={el.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                className={`ppt-slide-layer-row ${selected ? 'is-selected' : ''} ${
                  draggingId === el.id ? 'is-dragging' : ''
                }`}
                aria-label={`${layerLabel(el)}, layer ${layers.length - i}`}
                aria-pressed={selected}
                onPointerDown={(e) => beginRowDrag(e, el.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectElement?.(el.id)
                  }
                }}
              >
                <span className="ppt-slide-layer-grip" aria-hidden>
                  <MdDragIndicator size={16} />
                </span>
                <span className="ppt-slide-layer-icon">
                  <LayerIcon size={14} />
                </span>
                <span className="ppt-slide-layer-num">{layers.length - i}</span>
                <span className="ppt-slide-layer-type">{layerLabel(el)}</span>
                <button
                  type="button"
                  data-layer-delete
                  className="ppt-slide-layer-delete"
                  title="Delete layer"
                  aria-label={`Delete ${layerLabel(el)}`}
                  disabled={disabled}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteElement?.(el.id)
                  }}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            )
          })
        )}
        {showDropLine && (
          <div
            className="ppt-slide-layer-drop-line"
            style={{ top: lineTop }}
            aria-hidden
          />
        )}
      </div>
      {ghost &&
        createPortal(
          <div
            ref={ghostRef}
            className={`ppt-slide-layer-row ppt-slide-layer-ghost ${ghost.selected ? 'is-selected' : ''}`}
            style={{
              width: ghost.width,
              height: ghost.height,
              transform: `translate3d(${ghostPosRef.current.x}px, ${ghostPosRef.current.y}px, 0) rotate(0.6deg) scale(1.03)`,
            }}
            aria-hidden
          >
            <span className="ppt-slide-layer-grip">
              <MdDragIndicator size={16} />
            </span>
            <span className="ppt-slide-layer-icon">
              <GhostIcon size={14} />
            </span>
            <span className="ppt-slide-layer-num">{ghost.num}</span>
            <span className="ppt-slide-layer-type">{ghost.label}</span>
          </div>,
          document.body
        )}
    </div>
  )
}

function StatusDot({ id }) {
  const key = progressStatusDotClass(id)
  return <span className={`ppt-status-dot ppt-status-dot--${key}`} aria-hidden />
}

/**
 * Right floating rail: Design / Transition / Comments / Status / Notes / Layers + zoom + AI.
 */
export default function EditorRightRail({
  zoom = 100,
  deckStatus: _deckStatus = 'READY',
  generationPrompt = '',
  slide = null,
  themeVisual = null,
  workspaceId,
  presentationId,
  selectedElement = null,
  selectedElementId = null,
  onSelectElement,
  onBringForward,
  onSendBackward,
  onDeleteElement,
  onReorderLayers,
  onApplyLayout,
  onResetBackground,
  onAddBackgroundImage,
  onChangeTransition,
  onChangeSlideStatus,
  onChangeElementContent,
  onChangeElementPlacement,
  onToggleElementLock,
  onReplaceImage,
  onClearDeviceFrameScreen,
  onCropImage,
  onToggleImageAsBackground,
  onSpeakerNotesChange,
  slideStyles = {},
  onSlideStylesChange,
  onBackgroundGradientChange,
  onBackgroundColorChange,
  designFocus = 'slide',
  layoutSchemaMap = {},
  aspectRatio = '16:9',
  disabled = false,
  viewOnly = false,
  canComment = false,
  canResolveComments = false,
  shareToken = '',
  commentsUpdatedAt = null,
  shareIsAnonymous = true,
  onViewOnlyAttempt,
  onOpenChange,
  usedFontFamilies = [],
  isTeamWorkspace = false,
  canManageAssignee = false,
  assignee = null,
  assignedBy = null,
  assignedAt = null,
  assigneeSlideLabel = '',
  assigneeBusy = false,
  workspaceMembers = [],
  membersLoading = false,
  onLoadAssigneeMembers,
  onAssignTo,
}) {
  const [active, setActive] = useState(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [layoutTemplates, setLayoutTemplates] = useState([])
  const [layoutLoading, setLayoutLoading] = useState(false)
  const [selectedLayoutId, setSelectedLayoutId] = useState('')
  const rootRef = useRef(null)

  const currentTransition =
    slide?.transition ||
    slide?.elements?.transition ||
    'none'

  const currentSlideStatus = resolveSlideProgressStatus(slide)

  const panelOpen = Boolean(active)

  useEffect(() => {
    if (designFocus && selectedElementId) {
      setActive((prev) => (prev === 'layers' ? prev : 'design'))
      setAiOpen(false)
    }
  }, [designFocus, selectedElementId, slide?.id])

  useEffect(() => {
    onOpenChange?.(panelOpen)
  }, [panelOpen, onOpenChange])

  useEffect(() => {
    if (!panelOpen && !aiOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setActive(null)
        setAiOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [panelOpen, aiOpen])

  useEffect(() => {
    if (active !== 'design' || !workspaceId) return undefined
    let cancelled = false
    setLayoutLoading(true)
    presentationService
      .listTemplates(workspaceId)
      .then((data) => {
        if (cancelled) return
        const list = (Array.isArray(data)
          ? data
          : data?.templates || data?.items || data?.data || []
        ).filter(
          (tpl) =>
            String(tpl?.type || '').toUpperCase() !== 'DECK_PACK' &&
            (String(tpl?.type || '').toUpperCase() === 'DECK_LAYOUT' ||
              Boolean(tpl?.schema?.layout_id))
        )
        setLayoutTemplates(list)
        const match = findTemplateForSlideLayout(slide, list)
        if (match) {
          setSelectedLayoutId(templateRecordId(match))
        } else if (list[0]?.id || list[0]?.templateId) {
          setSelectedLayoutId(String(list[0].id || list[0].templateId))
        }
      })
      .catch(() => {
        if (!cancelled) setLayoutTemplates([])
      })
      .finally(() => {
        if (!cancelled) setLayoutLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [active, workspaceId])

  useEffect(() => {
    if (!layoutTemplates.length) return
    const match = findTemplateForSlideLayout(slide, layoutTemplates)
    if (match) setSelectedLayoutId(templateRecordId(match))
  }, [slide?.id, slide?.layoutId, slide?.layout_id, layoutTemplates])

  useEffect(() => {
    if (active === 'assignee' && canManageAssignee) onLoadAssigneeMembers?.()
  }, [active, canManageAssignee, onLoadAssigneeMembers])

  const toggle = (id) => {
    if (id === 'comments' && viewOnly && canComment) {
      setAiOpen(false)
      setActive((prev) => (prev === id ? null : id))
      return
    }
    if (viewOnly) {
      onViewOnlyAttempt?.()
      return
    }
    if (disabled) return
    setAiOpen(false)
    setActive((prev) => (prev === id ? null : id))
  }

  const closePanel = () => {
    setActive(null)
    setAiOpen(false)
  }

  const panelTitle =
    active === 'design'
      ? DESIGN_PANEL_TITLES[designFocus] || 'Design'
      : active === 'assignee'
        ? assigneeSlideLabel
          ? `Assignee — ${assigneeSlideLabel}`
          : 'Assignee'
        : RAIL_TOOLS.find((t) => t.id === active)?.label || ''

  return (
    <aside
      className={`ppt-editor-sidebar ppt-editor-sidebar--float ${panelOpen ? 'is-open' : ''}`}
      ref={rootRef}
      aria-label="Editor sidebar"
    >
      <div
        className={`ppt-editor-sidebar-panel ${active === 'comments' ? 'ppt-editor-sidebar-panel--comments' : ''}`}
        aria-hidden={!panelOpen}
      >
        <div className="ppt-editor-sidebar-panel-head">
          <strong>{panelTitle}</strong>
          <button type="button" className="ppt-slide-panel-close" onClick={closePanel} aria-label="Close panel">
            <FiX size={16} />
          </button>
        </div>

        <div className="ppt-editor-sidebar-panel-body">
          {active === 'design' && (
            <div className="ppt-slide-panel ppt-design-panel" role="region" aria-label="Design">
              <DesignContextPanel
                focus={designFocus}
                slide={slide}
                element={selectedElement}
                themeVisual={themeVisual}
                palette={themeVisual?.palette}
                slideStyles={slideStyles}
                layoutTemplates={layoutTemplates}
                layoutLoading={layoutLoading}
                layoutSchemaMap={layoutSchemaMap}
                aspectRatio={aspectRatio}
                selectedLayoutId={selectedLayoutId}
                onSelectLayoutId={setSelectedLayoutId}
                onApplyLayout={onApplyLayout}
                onBackgroundColorChange={onBackgroundColorChange}
                onBackgroundGradientChange={onBackgroundGradientChange}
                onAddBackgroundImage={onAddBackgroundImage}
                onSlideStylesChange={onSlideStylesChange}
                onChangeElementContent={(content) =>
                  selectedElementId && onChangeElementContent?.(selectedElementId, content)
                }
                onChangeElementPlacement={(placement) =>
                  selectedElementId && onChangeElementPlacement?.(selectedElementId, placement)
                }
                onToggleElementLock={() => selectedElementId && onToggleElementLock?.(selectedElementId)}
                onReplaceImage={onReplaceImage}
                onClearDeviceFrameScreen={onClearDeviceFrameScreen}
                onCropImage={onCropImage}
                onToggleImageAsBackground={onToggleImageAsBackground}
                onChangeTransition={onChangeTransition}
                disabled={disabled}
                usedFontFamilies={usedFontFamilies}
              />
            </div>
          )}

          {active === 'transition' && (
            <div className="ppt-slide-panel ppt-transition-panel" role="region" aria-label="Slide transition">
              <SlideTransitionPicker
                value={currentTransition}
                onChange={onChangeTransition}
                disabled={disabled}
              />
            </div>
          )}

          {active === 'comments' && (
            <div className="ppt-slide-panel ppt-slide-panel--sm ppt-slide-panel--comments" role="region" aria-label="Comments">
              {viewOnly && canComment ? (
                <PptPublicCommentsPanel
                  token={shareToken}
                  slideId={slide?.id}
                  canComment={canComment}
                  canResolveComments={canResolveComments}
                  isAnonymous={shareIsAnonymous}
                  commentsUpdatedAt={commentsUpdatedAt}
                />
              ) : (
                <PptCommentsPanel
                  workspaceId={workspaceId}
                  presentationId={presentationId}
                  slideId={slide?.id}
                  disabled={disabled}
                  commentsUpdatedAt={commentsUpdatedAt}
                />
              )}
            </div>
          )}

          {active === 'notes' && (
            <div className="ppt-slide-panel" role="region" aria-label="Speaker notes">
              <SpeakerNotesPanel
                notes={slide?.speakerNotes || ''}
                disabled={disabled}
                onChange={(notes) => onSpeakerNotesChange?.(slide?.id, notes)}
              />
            </div>
          )}

          {active === 'layers' && (
            <LayersPanel
              slide={slide}
              selectedElementId={selectedElementId}
              disabled={disabled}
              onSelectElement={onSelectElement}
              onDeleteElement={onDeleteElement}
              onReorderLayers={onReorderLayers}
            />
          )}

          {active === 'status' && (
            <div className="ppt-slide-panel ppt-status-panel" role="region" aria-label="Slide status">
              <p className="ppt-status-panel-lead">
                Mark this slide’s progress so collaborators can see what’s left at a glance.
              </p>

              <div className="ppt-status-options" role="listbox" aria-label="Choose status">
                {PPT_SLIDE_STATUSES.map((opt) => {
                  const selected = currentSlideStatus === opt.id
                  return (
                    <button
                      key={opt.id ?? 'none'}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`ppt-status-option ${selected ? 'is-active' : ''}`}
                      disabled={disabled}
                      onClick={() => onChangeSlideStatus?.(opt.id)}
                    >
                      <StatusDot id={opt.id} />
                      <span className="ppt-status-option-copy">
                        <span className="ppt-status-option-label">{opt.label}</span>
                        {opt.hint ? (
                          <span className="ppt-status-option-hint">{opt.hint}</span>
                        ) : null}
                      </span>
                      {selected ? (
                        <span className="ppt-status-option-check" aria-hidden>
                          ✓
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {active === 'assignee' && (
            <div className="ppt-slide-panel ppt-status-panel" role="region" aria-label="Assignee">
              {canManageAssignee ? (
                <>
                  <p className="ppt-status-panel-lead">
                    Assign {assigneeSlideLabel ? `this ${assigneeSlideLabel.toLowerCase()}` : 'this slide'} to a
                    workspace member so the team knows who owns it. This doesn’t change who can open or edit it.
                  </p>
                  <div className="ppt-status-options" role="listbox" aria-label="Choose assignee">
                    <button
                      type="button"
                      role="option"
                      aria-selected={!assignee}
                      className={`ppt-status-option ${!assignee ? 'is-active' : ''}`}
                      disabled={assigneeBusy}
                      onClick={() => onAssignTo?.(null)}
                    >
                      <span className="ppt-assignee-avatar ppt-assignee-avatar--empty" aria-hidden>
                        <FiUserPlus size={14} />
                      </span>
                      <span className="ppt-status-option-copy">
                        <span className="ppt-status-option-label">Unassigned</span>
                      </span>
                      {!assignee ? (
                        <span className="ppt-status-option-check" aria-hidden>✓</span>
                      ) : null}
                    </button>

                    {membersLoading && (
                      <p className="ppt-status-panel-lead">Loading members…</p>
                    )}
                    {!membersLoading && !workspaceMembers.length && (
                      <p className="ppt-status-panel-lead">No members in this workspace.</p>
                    )}
                    {!membersLoading &&
                      workspaceMembers.map((member) => {
                        const memberUser = member.user || {}
                        const memberId = memberUser.id || member.id
                        const selected = assignee?.id === memberId
                        const label = memberUser.name || memberUser.email || 'Member'
                        return (
                          <button
                            key={memberId}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`ppt-status-option ${selected ? 'is-active' : ''}`}
                            disabled={assigneeBusy}
                            onClick={() => onAssignTo?.(memberId)}
                          >
                            <span className="ppt-assignee-avatar" aria-hidden>
                              {personInitials(label)}
                            </span>
                            <span className="ppt-status-option-copy">
                              <span className="ppt-status-option-label">{label}</span>
                              {memberUser.name && memberUser.email ? (
                                <span className="ppt-status-option-hint">{memberUser.email}</span>
                              ) : null}
                            </span>
                            {selected ? (
                              <span className="ppt-status-option-check" aria-hidden>✓</span>
                            ) : null}
                          </button>
                        )
                      })}
                  </div>
                </>
              ) : (
                <>
                  <p className="ppt-status-panel-lead">
                    Assignee is a workflow tag — it doesn’t affect who can open or edit this slide.
                  </p>
                  <div className="ppt-status-options">
                    <div className="ppt-status-option" aria-disabled>
                      <span className={`ppt-assignee-avatar ${assignee ? '' : 'ppt-assignee-avatar--empty'}`} aria-hidden>
                        {assignee ? personInitials(assignee.name || assignee.email) : <FiUserPlus size={14} />}
                      </span>
                      <span className="ppt-status-option-copy">
                        <span className="ppt-status-option-label">
                          {assignee ? assignee.name || assignee.email : 'Unassigned'}
                        </span>
                        {assignee && assignedBy ? (
                          <span className="ppt-status-option-hint">
                            Assigned by {assignedBy.name || assignedBy.email}
                            {assignedAt ? ` · ${new Date(assignedAt).toLocaleDateString()}` : ''}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="ppt-editor-sidebar-rail">
        <div className="ppt-editor-sidebar-rail-tools">
          {RAIL_TOOLS.filter((tool) => !(viewOnly && tool.id === 'comments' && !canComment)).map((tool) => {
            const Icon = tool.Icon
            return (
              <button
                key={tool.id}
                type="button"
                className={`ppt-editor-sidebar-btn ${active === tool.id ? 'is-active' : ''}`}
                title={viewOnly && !(tool.id === 'comments' && canComment) ? 'View only' : tool.label}
                disabled={disabled && !viewOnly}
                aria-disabled={disabled || (viewOnly && !(tool.id === 'comments' && canComment))}
                aria-label={tool.label}
                aria-expanded={active === tool.id}
                onClick={() => toggle(tool.id)}
              >
                <Icon size={18} />
              </button>
            )
          })}
        </div>

        <div className="ppt-editor-sidebar-rail-footer">
          {isTeamWorkspace && (
            <button
              type="button"
              className={`ppt-editor-sidebar-btn ${active === 'assignee' ? 'is-active' : ''}`}
              title={
                assignee
                  ? `${assigneeSlideLabel || 'Slide'} assigned to ${assignee.name || assignee.email}`
                  : `Assign ${assigneeSlideLabel ? assigneeSlideLabel.toLowerCase() : 'slide'}`
              }
              aria-label="Assignee"
              aria-expanded={active === 'assignee'}
              onClick={() => {
                if (viewOnly) {
                  onViewOnlyAttempt?.()
                  return
                }
                setAiOpen(false)
                setActive((prev) => (prev === 'assignee' ? null : 'assignee'))
              }}
            >
              {assignee ? (
                <span className="ppt-assignee-avatar" aria-hidden>
                  {personInitials(assignee.name || assignee.email)}
                </span>
              ) : (
                <FiUserPlus size={18} />
              )}
            </button>
          )}
          <div className="ppt-editor-sidebar-zoom">{Math.round(zoom)}%</div>
          <button
            type="button"
            className={`ppt-editor-sidebar-ai ${aiOpen ? 'is-active' : ''}`}
            title="AI prompt"
            aria-label="AI prompt"
            aria-expanded={aiOpen}
            onClick={() => {
              if (viewOnly) {
                onViewOnlyAttempt?.()
                return
              }
              setActive(null)
              setAiOpen((v) => !v)
            }}
          >
            <BsStars size={18} />
          </button>
        </div>
      </div>
      {aiOpen &&
        createPortal(
          <div
            className="ppt-editor-modal-overlay"
            onClick={() => setAiOpen(false)}
          >
            <div
              className="ppt-editor-modal ppt-editor-modal--prompt"
              role="dialog"
              aria-label="AI prompt"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="ppt-editor-modal-head">
                <div className="ppt-editor-modal-head-text">
                  <span className="ppt-editor-modal-kicker">Generation</span>
                  <h3 className="ppt-editor-modal-title">AI prompt</h3>
                </div>
                <button
                  type="button"
                  className="ppt-editor-modal-close"
                  onClick={() => setAiOpen(false)}
                  aria-label="Close"
                >
                  <FiX size={18} />
                </button>
              </header>
              {generationPrompt?.trim() ? (
                <p className="ppt-ai-prompt-body">{generationPrompt.trim()}</p>
              ) : (
                <p className="ppt-editor-modal-lead">
                  No generation prompt was saved for this deck. Create via AI PPT wizard to capture one.
                </p>
              )}
              <footer className="ppt-editor-modal-foot">
                <button
                  type="button"
                  className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                  onClick={() => setAiOpen(false)}
                >
                  Close
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </aside>
  )
}
