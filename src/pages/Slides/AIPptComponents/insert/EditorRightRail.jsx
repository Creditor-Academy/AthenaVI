import { useEffect, useRef, useState } from 'react'
import {
  FiMessageCircle,
  FiCheckCircle,
  FiUser,
  FiX,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiFileText,
  FiLayers,
  FiType,
  FiImage,
  FiBarChart2,
  FiSquare,
  FiGrid,
  FiCode,
} from 'react-icons/fi'
import { MdOutlineDesignServices, MdOutlineAnimation } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'
import { HiOutlineClipboard } from 'react-icons/hi'
import DesignContextPanel from './DesignContextPanel'
import presentationService from '../../../../services/presentationService'
import PptCommentsPanel from '../PptCommentsPanel'
import PptVariablesPanel from '../PptVariablesPanel'
import SpeakerNotesPanel from '../SpeakerNotesPanel'
import SlideTransitionPicker, { PPT_SLIDE_TRANSITIONS } from './SlideTransitionPicker'
import { findTemplateForSlideLayout, templateRecordId } from '../../../../utils/similarLayouts'
import './insertPanels.css'
import '../pptEditorExtras.css'
import '../pptPanelUi.css'

export { PPT_SLIDE_TRANSITIONS }

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
  { id: 'variables', label: 'Variables', Icon: FiLayers },
]

export const PPT_SLIDE_STATUSES = [
  { id: 'none', label: 'No status' },
  { id: 'todo', label: 'To do' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

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

function StatusDot({ id }) {
  return <span className={`ppt-status-dot ppt-status-dot--${id}`} aria-hidden />
}

/**
 * Right floating rail: Design / Transition / Comments / Status + zoom + AI.
 */
export default function EditorRightRail({
  zoom = 100,
  deckStatus = 'READY',
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
  deckVariables = [],
  onVariablesChange,
  onSyncVariables,
  slideStyles = {},
  onSlideStylesChange,
  onBackgroundGradientChange,
  onBackgroundColorChange,
  designFocus = 'slide',
  layoutSchemaMap = {},
  aspectRatio = '16:9',
  disabled = false,
  viewOnly = false,
  onViewOnlyAttempt,
  onOpenChange,
  usedFontFamilies = [],
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

  const currentSlideStatus =
    slide?.contributorStatus ||
    slide?.slideStatus ||
    'none'

  const panelOpen = Boolean(active) || aiOpen

  useEffect(() => {
    if (designFocus && selectedElementId) {
      setActive('design')
      setAiOpen(false)
    }
  }, [designFocus, selectedElementId, slide?.id])

  useEffect(() => {
    onOpenChange?.(panelOpen)
  }, [panelOpen, onOpenChange])

  useEffect(() => {
    if (!panelOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setActive(null)
        setAiOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [panelOpen])

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

  const toggle = (id) => {
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

  const panelTitle = aiOpen
    ? 'AI prompt'
    : active === 'design'
      ? DESIGN_PANEL_TITLES[designFocus] || 'Design'
      : RAIL_TOOLS.find((t) => t.id === active)?.label || ''

  return (
    <aside
      className={`ppt-editor-sidebar ppt-editor-sidebar--float ${panelOpen ? 'is-open' : ''}`}
      ref={rootRef}
      aria-label="Editor sidebar"
    >
      <div className="ppt-editor-sidebar-panel" aria-hidden={!panelOpen}>
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

              <div className="ppt-panel-section ppt-panel-section--layers">
                <div className="ppt-slide-panel-label">Layers</div>
                {selectedElementId && (
                  <div className="ppt-slide-layer-actions">
                    <button type="button" title="Bring forward" disabled={disabled} onClick={onBringForward}>
                      <FiChevronUp size={14} />
                    </button>
                    <button type="button" title="Send backward" disabled={disabled} onClick={onSendBackward}>
                      <FiChevronDown size={14} />
                    </button>
                    <button type="button" title="Delete" disabled={disabled} onClick={onDeleteElement}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                )}
                <div className="ppt-slide-layers">
                  {(slide?.elements?.elements || []).length === 0 ? (
                    <div className="ppt-slide-layer-empty">No layers yet — insert from the top bar</div>
                  ) : (
                    [...(slide?.elements?.elements || [])]
                      .sort((a, b) => (b.layer || 0) - (a.layer || 0))
                      .map((el, i) => {
                        const LayerIcon = layerTypeIcon(el.type)
                        return (
                          <button
                            key={el.id || i}
                            type="button"
                            className={`ppt-slide-layer-row ${selectedElementId === el.id ? 'is-selected' : ''}`}
                            disabled={disabled}
                            onClick={() => onSelectElement?.(el.id)}
                          >
                            <span className="ppt-slide-layer-icon">
                              <LayerIcon size={14} />
                            </span>
                            <span className="ppt-slide-layer-num">{el.layer ?? i + 1}</span>
                            <span className="ppt-slide-layer-type">{el.type || 'element'}</span>
                          </button>
                        )
                      })
                  )}
                </div>
              </div>
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
            <div className="ppt-slide-panel ppt-slide-panel--sm" role="region" aria-label="Comments">
              <PptCommentsPanel
                workspaceId={workspaceId}
                presentationId={presentationId}
                slideId={slide?.id}
                disabled={disabled}
              />
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

          {active === 'variables' && (
            <div className="ppt-slide-panel" role="region" aria-label="Variables">
              <PptVariablesPanel
                variables={deckVariables}
                disabled={disabled}
                onChange={onVariablesChange}
                onSyncAll={onSyncVariables}
              />
            </div>
          )}

          {active === 'status' && (
            <div className="ppt-slide-panel ppt-slide-panel--sm ppt-status-panel" role="region" aria-label="Status">
              <div className="ppt-status-options">
                {PPT_SLIDE_STATUSES.map((opt) => {
                  const selected = currentSlideStatus === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`ppt-status-option ${selected ? 'is-active' : ''}`}
                      disabled={disabled}
                      onClick={() => onChangeSlideStatus?.(opt.id)}
                    >
                      <StatusDot id={opt.id} />
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="ppt-slide-panel-section">
                <div className="ppt-status-row">
                  <FiCheckCircle size={16} />
                  <span>Deck: {String(deckStatus || 'READY')}</span>
                </div>
                <div className="ppt-status-row">
                  <span>Elements: {(slide?.elements?.elements || []).length}</span>
                </div>
              </div>
            </div>
          )}

          {aiOpen && (
            <div className="ppt-ai-prompt-panel" role="region" aria-label="AI prompt">
              {generationPrompt?.trim() ? (
                <p className="ppt-ai-prompt-body">{generationPrompt.trim()}</p>
              ) : (
                <p className="ppt-slide-panel-hint">
                  No generation prompt was saved for this deck. Create via AI PPT wizard to capture one.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="ppt-editor-sidebar-rail">
        <div className="ppt-editor-sidebar-rail-tools">
          {RAIL_TOOLS.map((tool) => {
            const Icon = tool.Icon
            return (
              <button
                key={tool.id}
                type="button"
                className={`ppt-editor-sidebar-btn ${active === tool.id ? 'is-active' : ''}`}
                title={viewOnly ? 'View only' : tool.label}
                disabled={disabled && !viewOnly}
                aria-disabled={disabled || viewOnly}
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
          <button type="button" className="ppt-editor-sidebar-btn" title="Assignee" disabled>
            <FiUser size={18} />
          </button>
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
    </aside>
  )
}
