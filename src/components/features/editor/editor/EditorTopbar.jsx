import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
    MdUndo,
    MdRedo,
    MdSave,
    MdPlayCircleOutline,
    MdZoomIn,
    MdZoomOut,
    MdFitScreen,
    MdArrowBack,
    MdFileDownload,
    MdCheckCircle,
    MdAutoAwesome,
    MdKeyboard,
    MdPhotoLibrary,
    MdVideoLibrary,
    MdCloudUpload,
    MdTextFields,
    MdShapeLine,
    MdExpandMore,
    MdClose,
} from 'react-icons/md'

import EditorSidebarAvatar from './EditorSidebarAvatar'
import EditorSidebarImage from './EditorSidebarImage'
import EditorSidebarUploads from './EditorSidebarUploads'
import EditorSidebarTemplates from './EditorSidebarTemplates'
import EditorSidebarText from './EditorSidebarText'
import EditorSidebarLayers from './EditorSidebarLayers'
import EditorSidebarVideo from './EditorSidebarVideo'
import EditorSidebarVoice from './EditorSidebarVoice'
import EditorSidebarStock from './EditorSidebarStock'
import EditorSidebarShapes from './EditorSidebarShapes'
import EditorSidebarMagic from './EditorSidebarMagic'
import ProfileDropdown from '../../../ui/ProfileDropdown/ProfileDropdown'

const TOOL_GROUPS = [
    {
        id: 'media',
        tools: [
            { id: 'image', icon: MdPhotoLibrary, label: 'Images' },
            { id: 'video', icon: MdVideoLibrary, label: 'Videos' },
            { id: 'uploads', icon: MdCloudUpload, label: 'Uploads' },
        ],
    },
    {
        id: 'elements',
        tools: [
            { id: 'text', icon: MdTextFields, label: 'Text' },
            { id: 'shapes', icon: MdShapeLine, label: 'Shapes' },
        ],
    },
]

const TOOL_LABELS = Object.fromEntries(
    TOOL_GROUPS.flatMap((g) => g.tools.map((t) => [t.id, t.label]))
)

const EditorTopbar = ({
    onBack,
    selectedTool,
    setSelectedTool,
    handlePreview,
    exportVideo,
    isExporting = false,
    zoomLevel,
    setZoomLevel,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    projectTitle,
    onProjectTitleChange,
    onSave,
    isSaving,
    lastSaved,
    activeSceneId,
    addLayer,
    updateScene,
    activeScene,
    handleAddTemplateScene,
    setShowTemplateModal,
    scenes = [],
    autoCreateScene,
    onGenerateStoryboard,
    workspaceId,
    addAudioClip,
    onUploadError,
    setSelectedLayerId,
    onPresenterChanged,
}) => {
    const [saved, setSaved] = useState(false)
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
    const topbarRef = useRef(null)
    const dropdownRef = useRef(null)
    const triggerRefs = useRef({})

    const activeTool = selectedTool || null

    const updateDropdownPosition = useCallback(() => {
        if (!activeTool) return
        const el = triggerRefs.current[activeTool]
        if (!el) return
        const rect = el.getBoundingClientRect()
        const panelWidth =
            activeTool === 'text' ? 352 : activeTool === 'shapes' ? 400 : 320
        const margin = 12
        let left = rect.left + rect.width / 2
        left = Math.max(panelWidth / 2 + margin, Math.min(left, window.innerWidth - panelWidth / 2 - margin))
        setDropdownPos({
            top: rect.bottom + 8,
            left,
        })
    }, [activeTool])

    const toggleTool = useCallback(
        (toolId) => {
            setSelectedTool?.(activeTool === toolId ? null : toolId)
        },
        [activeTool, setSelectedTool]
    )

    const closeDropdown = useCallback(() => {
        setSelectedTool?.(null)
    }, [setSelectedTool])

    const addLayerWithClose = useCallback(
        (...args) => {
            const id = addLayer?.(...args)
            closeDropdown()
            return id
        },
        [addLayer, closeDropdown]
    )

    const runToolAction = useCallback(
        (fn) =>
            (...args) => {
                const result = fn?.(...args)
                closeDropdown()
                return result
            },
        [closeDropdown]
    )

    useLayoutEffect(() => {
        if (!activeTool) return
        updateDropdownPosition()
        window.addEventListener('resize', updateDropdownPosition)
        window.addEventListener('scroll', updateDropdownPosition, true)
        return () => {
            window.removeEventListener('resize', updateDropdownPosition)
            window.removeEventListener('scroll', updateDropdownPosition, true)
        }
    }, [activeTool, updateDropdownPosition])

    useEffect(() => {
        if (!activeTool) return undefined
        const onPointerDown = (e) => {
            const target = e.target
            if (topbarRef.current?.contains(target)) return
            if (dropdownRef.current?.contains(target)) return
            closeDropdown()
        }
        document.addEventListener('mousedown', onPointerDown)
        return () => document.removeEventListener('mousedown', onPointerDown)
    }, [activeTool, closeDropdown])

    const handleSave = () => {
        onSave?.()
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const renderToolPanel = () => {
        if (!activeTool) return null

        switch (activeTool) {
            case 'avatar':
                return (
                    <EditorSidebarAvatar
                        activeScene={activeScene}
                        activeSceneId={activeSceneId}
                        scenes={scenes}
                        autoCreateScene={autoCreateScene}
                        updateScene={updateScene}
                        setShowTemplateModal={setShowTemplateModal}
                        addLayer={addLayerWithClose}
                        onPresenterChanged={onPresenterChanged}
                    />
                )
            case 'image':
                return <EditorSidebarImage addLayer={addLayerWithClose} />
            case 'uploads':
                return (
                  <EditorSidebarUploads
                    addLayer={addLayerWithClose}
                    workspaceId={workspaceId}
                    onUploadError={onUploadError}
                  />
                )
            case 'templates':
                return (
                    <EditorSidebarTemplates
                        handleAddTemplateScene={runToolAction(handleAddTemplateScene)}
                        setShowTemplateModal={setShowTemplateModal}
                    />
                )
            case 'text':
                return (
                    <EditorSidebarText
                        addLayer={addLayer}
                        setSelectedLayerId={setSelectedLayerId}
                        onClose={closeDropdown}
                    />
                )
            case 'layers':
                return (
                    <EditorSidebarLayers
                        activeScene={activeScene}
                        activeSceneId={activeSceneId}
                        updateScene={updateScene}
                    />
                )
            case 'video':
                return <EditorSidebarVideo addLayer={addLayerWithClose} />
            case 'mic':
                return (
                    <EditorSidebarVoice
                        activeScene={activeScene}
                        activeSceneId={activeSceneId}
                        updateScene={updateScene}
                    />
                )
            case 'stock':
                return <EditorSidebarStock addLayer={addLayerWithClose} />
            case 'shapes':
                return <EditorSidebarShapes addLayer={addLayerWithClose} />
            case 'magic':
                return (
                    <EditorSidebarMagic
                        onGenerateStoryboard={runToolAction(onGenerateStoryboard)}
                    />
                )
            default:
                return (
                    <div className="topbar-dropdown-empty">
                        <span>This tool panel is coming soon.</span>
                    </div>
                )
        }
    }

    return (
        <>
            <div className="editor-topbar" ref={topbarRef}>
                <div className="top-left">
                    <button
                        type="button"
                        className="topbar-icon-action topbar-back-btn"
                        onClick={onBack}
                        title="Back to Dashboard"
                        aria-label="Back to Dashboard"
                    >
                        <MdArrowBack size={18} />
                    </button>

                    <div className="topbar-divider" />

                    <div className="topbar-brand">
                        <div className="topbar-logo">
                            <MdAutoAwesome size={16} />
                        </div>
                        <input
                            className="project-title"
                            defaultValue={projectTitle || 'Untitled Video Project'}
                            onChange={(e) =>
                                onProjectTitleChange && onProjectTitleChange(e.target.value)
                            }
                            title="Click to rename project"
                        />
                    </div>

                    <div className="topbar-divider" />

                    <div className="topbar-btn-group">
                        <button
                            className={`icon-btn ${!canUndo ? 'disabled' : ''}`}
                            title="Undo (Ctrl+Z)"
                            onClick={onUndo}
                            disabled={!canUndo}
                        >
                            <MdUndo size={18} />
                        </button>
                        <button
                            className={`icon-btn ${!canRedo ? 'disabled' : ''}`}
                            title="Redo (Ctrl+Y)"
                            onClick={onRedo}
                            disabled={!canRedo}
                        >
                            <MdRedo size={18} />
                        </button>
                    </div>

                    <button
                        type="button"
                        className={`topbar-icon-action topbar-save-btn ${saved || isSaving ? 'saved' : ''}`}
                        onClick={handleSave}
                        title={
                            lastSaved
                                ? `Save (Ctrl+S) — Last saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : 'Save project (Ctrl+S)'
                        }
                        aria-label="Save project"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <div className="save-spinner" />
                        ) : saved ? (
                            <MdCheckCircle size={18} />
                        ) : (
                            <MdSave size={18} />
                        )}
                    </button>

                    {lastSaved && !isSaving && (
                        <span className="last-saved-time" title="Auto-save enabled">
                            {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>

                <div className="top-center">
                    <nav className="topbar-tools-strip" aria-label="Editor tools">
                        {TOOL_GROUPS.map((group, groupIndex) => (
                            <div key={group.id} className="topbar-tool-group">
                                {group.tools.map((tool) => {
                                    const Icon = tool.icon
                                    const isOpen = activeTool === tool.id
                                    return (
                                        <div
                                            key={tool.id}
                                            className="topbar-tool-trigger-wrap"
                                        >
                                            <button
                                                ref={(el) => {
                                                    triggerRefs.current[tool.id] = el
                                                }}
                                                type="button"
                                                className={`topbar-tool-trigger ${isOpen ? 'active' : ''}`}
                                                onClick={() => toggleTool(tool.id)}
                                                aria-expanded={isOpen}
                                                aria-haspopup="true"
                                            >
                                                <Icon size={15} />
                                                <span>{tool.label}</span>
                                                <MdExpandMore
                                                    size={14}
                                                    className={`topbar-tool-chevron ${isOpen ? 'open' : ''}`}
                                                />
                                            </button>
                                        </div>
                                    )
                                })}
                                {groupIndex < TOOL_GROUPS.length - 1 && (
                                    <div className="topbar-tool-group-divider" aria-hidden />
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="top-right">
                    <div className="topbar-zoom-group">
                        <button
                            className="icon-btn"
                            title="Zoom Out"
                            onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                        >
                            <MdZoomOut size={18} />
                        </button>
                        <div
                            className="zoom-pill"
                            onClick={() => setZoomLevel(100)}
                            title="Reset to 100%"
                        >
                            {zoomLevel}%
                        </div>
                        <button
                            className="icon-btn"
                            title="Zoom In"
                            onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                        >
                            <MdZoomIn size={18} />
                        </button>
                        <button
                            className="icon-btn"
                            title="Fit to Screen"
                            onClick={() => setZoomLevel(100)}
                        >
                            <MdFitScreen size={18} />
                        </button>
                    </div>

                    <div className="topbar-divider" />

                    <button
                        className="icon-btn"
                        title="Keyboard Shortcuts"
                        onClick={() => setShowShortcuts(true)}
                    >
                        <MdKeyboard size={18} />
                    </button>

                    <div className="topbar-divider" />

                    <button
                        type="button"
                        className="topbar-icon-action topbar-preview-btn"
                        onClick={handlePreview}
                        title="Preview Video (Space)"
                        aria-label="Preview video"
                    >
                        <MdPlayCircleOutline size={18} />
                    </button>

                    <button
                        type="button"
                        className="topbar-icon-action topbar-export-btn"
                        onClick={exportVideo}
                        disabled={isExporting}
                        title={isExporting ? 'Rendering video…' : 'Download Video (Ctrl+E)'}
                        aria-label={isExporting ? 'Rendering video' : 'Download video'}
                    >
                        <MdFileDownload size={18} />
                    </button>

                    <div className="topbar-divider" />

                    <ProfileDropdown compact />
                </div>
            </div>

            {activeTool &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className={`topbar-dropdown topbar-dropdown--portal${
                            activeTool === 'text'
                                ? ' topbar-dropdown--text'
                                : activeTool === 'shapes'
                                  ? ' topbar-dropdown--shapes'
                                  : ''
                        }`}
                        role="dialog"
                        aria-label={`${TOOL_LABELS[activeTool] || activeTool} panel`}
                        style={{
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                        }}
                    >
                        <div className="topbar-dropdown-header">
                            <h3>{TOOL_LABELS[activeTool] || activeTool}</h3>
                            <button
                                type="button"
                                className="topbar-dropdown-close"
                                onClick={closeDropdown}
                                aria-label="Close panel"
                            >
                                <MdClose size={16} />
                            </button>
                        </div>
                        <div className="topbar-dropdown-body premium-scrollbar">
                            {renderToolPanel()}
                        </div>
                    </div>,
                    document.body
                )}

            {showShortcuts && (
                <div
                    className="shortcuts-overlay"
                    onClick={() => setShowShortcuts(false)}
                >
                    <div
                        className="shortcuts-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="shortcuts-header">
                            <h3>Keyboard Shortcuts</h3>
                            <button
                                className="shortcuts-close"
                                onClick={() => setShowShortcuts(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="shortcuts-grid">
                            {[
                                { key: 'Space', action: 'Play / Pause' },
                                { key: 'Esc', action: 'Close panel' },
                                { key: 'Delete', action: 'Delete active scene' },
                                { key: 'Ctrl + Z', action: 'Undo' },
                                { key: 'Ctrl + Y', action: 'Redo' },
                                { key: 'Ctrl + S', action: 'Save project' },
                                { key: 'Ctrl + E', action: 'Download HeyGen video' },
                                { key: '← →', action: 'Step frame' },
                            ].map(({ key, action }) => (
                                <div className="shortcut-row" key={key}>
                                    <span className="shortcut-action">{action}</span>
                                    <kbd className="shortcut-key">{key}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EditorTopbar
