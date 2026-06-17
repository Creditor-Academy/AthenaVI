import { useState, useEffect, useCallback, useRef } from 'react'
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
    MdPhotoLibrary,
    MdVideoLibrary,
    MdCloudUpload,
    MdTextFields,
    MdInterests,
    MdClose,
    MdKeyboard,
    MdMenuBook,
    MdHelpOutline,
    MdVisibility,
    MdAdd,
} from 'react-icons/md'

import EditorSidebarImage from './EditorSidebarImage'
import EditorSidebarText from './EditorSidebarText'
import EditorSidebarVideo from './EditorSidebarVideo'
import EditorSidebarUpload from './EditorSidebarUpload'
import EditorSidebarGraphic from './EditorSidebarGraphic'
import EditorGuideModal from './EditorGuideModal'
import ProfileDropdown from '../../../ui/ProfileDropdown/ProfileDropdown'
import EditorCreditsBar from './EditorCreditsBar'

const INSERT_ITEMS = [
    { id: 'image', icon: MdPhotoLibrary, label: 'Images' },
    { id: 'video', icon: MdVideoLibrary, label: 'Videos' },
    { id: 'upload', icon: MdCloudUpload, label: 'Upload' },
    { id: 'text', icon: MdTextFields, label: 'Text' },
    { id: 'graphic', icon: MdInterests, label: 'Graphics' },
]

const INSERT_LABELS = Object.fromEntries(INSERT_ITEMS.map((t) => [t.id, t.label]))

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
    workspaceId,
    onUploadError,
    setSelectedLayerId,
    creditsRefreshKey = 0,
    editorView,
    onEditorViewChange,
}) => {
    const [saved, setSaved] = useState(false)
    const [activeMenu, setActiveMenu] = useState(null)
    const ribbonRef = useRef(null)
    const menuCloseTimerRef = useRef(null)
    const [insertModal, setInsertModal] = useState(null)
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [showGuide, setShowGuide] = useState(false)

    useEffect(() => {
        if (selectedTool && INSERT_LABELS[selectedTool]) {
            setInsertModal(selectedTool)
        }
    }, [selectedTool])

    useEffect(() => {
        if (!insertModal) return undefined
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [insertModal])

    useEffect(() => {
        if (!activeMenu) return undefined

        const onPointerDown = (event) => {
            if (ribbonRef.current?.contains(event.target)) return
            setActiveMenu(null)
        }

        const onKeyDown = (event) => {
            if (event.key === 'Escape') setActiveMenu(null)
        }

        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [activeMenu])

    const openInsertModal = useCallback(
        (toolId) => {
            setActiveMenu(null)
            setInsertModal(toolId)
            setSelectedTool?.(toolId)
        },
        [setSelectedTool]
    )

    const closeInsertModal = useCallback(() => {
        setInsertModal(null)
        setSelectedTool?.(null)
    }, [setSelectedTool])

    const addLayerWithClose = useCallback(
        (...args) => {
            const id = addLayer?.(...args)
            closeInsertModal()
            return id
        },
        [addLayer, closeInsertModal]
    )

    const handleSave = () => {
        onSave?.()
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const patchView = (patch) => {
        onEditorViewChange?.(patch)
    }

    const renderInsertPanel = () => {
        if (!insertModal) return null
        switch (insertModal) {
            case 'image':
                return (
                    <EditorSidebarImage
                        addLayer={addLayerWithClose}
                        workspaceId={workspaceId}
                        onUploadError={onUploadError}
                        onClose={closeInsertModal}
                    />
                )
            case 'video':
                return (
                    <EditorSidebarVideo
                        addLayer={addLayerWithClose}
                        workspaceId={workspaceId}
                        onUploadError={onUploadError}
                        onClose={closeInsertModal}
                    />
                )
            case 'upload':
                return (
                    <EditorSidebarUpload
                        addLayer={addLayerWithClose}
                        workspaceId={workspaceId}
                        onUploadError={onUploadError}
                        onClose={closeInsertModal}
                    />
                )
            case 'text':
                return (
                    <EditorSidebarText
                        addLayer={addLayer}
                        setSelectedLayerId={setSelectedLayerId}
                        onClose={closeInsertModal}
                    />
                )
            case 'graphic':
                return (
                    <EditorSidebarGraphic
                        addLayer={addLayerWithClose}
                        activeScene={activeScene}
                        activeSceneId={activeSceneId}
                        updateScene={updateScene}
                    />
                )
            default:
                return null
        }
    }

    const clearMenuCloseTimer = useCallback(() => {
        if (menuCloseTimerRef.current) {
            clearTimeout(menuCloseTimerRef.current)
            menuCloseTimerRef.current = null
        }
    }, [])

    const openMenu = useCallback(
        (id) => {
            clearMenuCloseTimer()
            setActiveMenu(id)
        },
        [clearMenuCloseTimer]
    )

    const toggleMenu = useCallback((id) => {
        clearMenuCloseTimer()
        setActiveMenu((current) => (current === id ? null : id))
    }, [clearMenuCloseTimer])

    const scheduleMenuClose = useCallback(() => {
        clearMenuCloseTimer()
        menuCloseTimerRef.current = setTimeout(() => {
            setActiveMenu(null)
            menuCloseTimerRef.current = null
        }, 160)
    }, [clearMenuCloseTimer])

    useEffect(
        () => () => {
            clearMenuCloseTimer()
        },
        [clearMenuCloseTimer]
    )

    const menuProps = (id) => ({
        className: 'topbar-tool-trigger-wrap editor-ribbon-menu',
        onMouseEnter: () => openMenu(id),
        onMouseLeave: () => scheduleMenuClose(),
    })

    return (
        <>
            <div className="editor-topbar">
                <div className="top-left">
                    <button
                        type="button"
                        className="topbar-icon-action topbar-back-btn topbar-back-btn--circle"
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
                    <nav ref={ribbonRef} className="topbar-tools-strip" aria-label="Editor menus">
                    <div {...menuProps('insert')}>
                        <button
                            type="button"
                            className={`topbar-tool-trigger ${activeMenu === 'insert' ? 'active' : ''}`}
                            aria-expanded={activeMenu === 'insert'}
                            onClick={() => toggleMenu('insert')}
                        >
                            <MdAdd size={16} aria-hidden />
                            <span>Insert</span>
                        </button>
                        <div
                            className={`editor-ribbon__dropdown${activeMenu === 'insert' ? ' is-open' : ''}`}
                            role="menu"
                            aria-hidden={activeMenu !== 'insert'}
                        >
                            {INSERT_ITEMS.map((item) => {
                                const Icon = item.icon
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="editor-ribbon__dropdown-item"
                                        role="menuitem"
                                        onClick={() => openInsertModal(item.id)}
                                    >
                                        <Icon size={18} aria-hidden />
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="topbar-tool-group-divider" aria-hidden />

                    <div {...menuProps('view')}>
                        <button
                            type="button"
                            className={`topbar-tool-trigger ${activeMenu === 'view' ? 'active' : ''}`}
                            aria-expanded={activeMenu === 'view'}
                            onClick={() => toggleMenu('view')}
                        >
                            <MdVisibility size={16} aria-hidden />
                            <span>View</span>
                        </button>
                        <div
                            className={`editor-ribbon__dropdown editor-ribbon__dropdown--wide${
                                activeMenu === 'view' ? ' is-open' : ''
                            }`}
                            role="menu"
                            aria-hidden={activeMenu !== 'view'}
                        >
                                <label className="editor-ribbon__check">
                                    <input
                                        type="checkbox"
                                        checked={!!editorView?.snapToGrid}
                                        onChange={(e) => patchView({ snapToGrid: e.target.checked })}
                                    />
                                    Snap to grid
                                </label>
                                <label className="editor-ribbon__check">
                                    <input
                                        type="checkbox"
                                        checked={!!editorView?.showGuides}
                                        onChange={(e) => patchView({ showGuides: e.target.checked })}
                                    />
                                    Grid &amp; guides
                                </label>
                                <label className="editor-ribbon__check">
                                    <input
                                        type="checkbox"
                                        checked={!!editorView?.showSafeZone}
                                        onChange={(e) => patchView({ showSafeZone: e.target.checked })}
                                    />
                                    Safe zone
                                </label>
                                <label className="editor-ribbon__check">
                                    <input
                                        type="checkbox"
                                        checked={!!editorView?.showPageGrid}
                                        onChange={(e) => patchView({ showPageGrid: e.target.checked })}
                                    />
                                    Add grid to the page
                                </label>
                                <div className="editor-ribbon__divider" />
                                <div className="editor-ribbon__scale">
                                    <span className="editor-ribbon__scale-label">Scale</span>
                                    <div className="editor-ribbon__scale-controls">
                                        <button
                                            type="button"
                                            className="editor-ribbon__scale-btn"
                                            title="Zoom out"
                                            onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                                        >
                                            <MdZoomOut size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="editor-ribbon__scale-pill"
                                            title="Reset to 100%"
                                            onClick={() => setZoomLevel(100)}
                                        >
                                            {zoomLevel}%
                                        </button>
                                        <button
                                            type="button"
                                            className="editor-ribbon__scale-btn"
                                            title="Zoom in"
                                            onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                                        >
                                            <MdZoomIn size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="editor-ribbon__scale-btn"
                                            title="Fit to screen"
                                            onClick={() => setZoomLevel(100)}
                                        >
                                            <MdFitScreen size={16} />
                                        </button>
                                    </div>
                                </div>
                        </div>
                    </div>

                    <div className="topbar-tool-group-divider" aria-hidden />

                    <div {...menuProps('help')}>
                        <button
                            type="button"
                            className={`topbar-tool-trigger ${activeMenu === 'help' ? 'active' : ''}`}
                            aria-expanded={activeMenu === 'help'}
                            onClick={() => toggleMenu('help')}
                        >
                            <MdHelpOutline size={16} aria-hidden />
                            <span>Help</span>
                        </button>
                        <div
                            className={`editor-ribbon__dropdown${activeMenu === 'help' ? ' is-open' : ''}`}
                            role="menu"
                            aria-hidden={activeMenu !== 'help'}
                        >
                            <button
                                type="button"
                                className="editor-ribbon__dropdown-item"
                                role="menuitem"
                                onClick={() => {
                                    setShowShortcuts(true)
                                    setActiveMenu(null)
                                }}
                            >
                                <MdKeyboard size={18} aria-hidden />
                                Keyboard shortcuts
                            </button>
                            <button
                                type="button"
                                className="editor-ribbon__dropdown-item"
                                role="menuitem"
                                onClick={() => {
                                    setShowGuide(true)
                                    setActiveMenu(null)
                                }}
                            >
                                <MdMenuBook size={18} aria-hidden />
                                Guide
                            </button>
                        </div>
                    </div>
                    </nav>
                </div>

                <div className="top-right">
                    <EditorCreditsBar workspaceId={workspaceId} refreshKey={creditsRefreshKey} />

                    <div className="topbar-divider" />

                    <button
                        type="button"
                        className="topbar-icon-action topbar-preview-btn"
                        onClick={handlePreview}
                        title="Preview Video"
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

            {insertModal &&
                createPortal(
                    <div
                        className="editor-insert-overlay"
                        onClick={closeInsertModal}
                        role="presentation"
                    >
                        <div
                            className={`editor-insert-modal${
                                insertModal === 'image' || insertModal === 'video'
                                    ? ' editor-insert-modal--wide'
                                    : insertModal === 'upload'
                                      ? ' editor-insert-modal--upload'
                                      : ''
                            }`}
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label={`Insert ${INSERT_LABELS[insertModal]}`}
                        >
                            <header className="editor-insert-modal__header">
                                <h2>Insert {INSERT_LABELS[insertModal]}</h2>
                                <button
                                    type="button"
                                    className="editor-insert-modal__close"
                                    onClick={closeInsertModal}
                                    aria-label="Close"
                                >
                                    <MdClose size={20} />
                                </button>
                            </header>
                            <div
                                className={`editor-insert-modal__body premium-scrollbar${
                                    insertModal === 'image' || insertModal === 'video'
                                        ? ' editor-insert-modal__body--stock'
                                        : insertModal === 'upload'
                                          ? ' editor-insert-modal__body--upload'
                                          : ''
                                }`}
                            >
                                {renderInsertPanel()}
                            </div>
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
                                { key: 'Delete', action: 'Delete selection' },
                                { key: 'Ctrl + Z', action: 'Undo' },
                                { key: 'Ctrl + Y', action: 'Redo' },
                                { key: 'Ctrl + S', action: 'Save project' },
                                { key: 'Ctrl + E', action: 'Export video' },
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

            {showGuide && <EditorGuideModal onClose={() => setShowGuide(false)} />}
        </>
    )
}

export default EditorTopbar
