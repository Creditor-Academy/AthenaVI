import { useState } from 'react'
import {
    MdUndo,
    MdRedo,
    MdSave,
    MdPerson,
    MdPlayCircleOutline,
    MdZoomIn,
    MdZoomOut,
    MdFitScreen,
    MdShare,
    MdAccountCircle,
    MdArrowBack,
    MdFileDownload,
    MdCheckCircle,
    MdAutoAwesome,
    MdKeyboard,
} from 'react-icons/md'

const ShortcutBadge = ({ children }) => (
    <span style={{
        fontSize: '9px',
        fontWeight: '700',
        background: 'rgba(0,0,0,0.15)',
        color: 'inherit',
        padding: '1px 4px',
        borderRadius: '4px',
        letterSpacing: '0.5px',
        border: '1px solid rgba(255,255,255,0.1)',
        marginLeft: '4px'
    }}>
        {children}
    </span>
)

const EditorTopbar = ({
    onBack,
    selectedTool,
    setSelectedTool,
    handlePreview,
    exportVideo,
    zoomLevel,
    setZoomLevel,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    projectTitle,
    onProjectTitleChange,
}) => {
    const [saved, setSaved] = useState(false)
    const [showShortcuts, setShowShortcuts] = useState(false)

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <>
            <div className="editor-topbar">
                {/* === LEFT SECTION === */}
                <div className="top-left">
                    {/* Back Button */}
                    <button
                        className="topbar-back-btn"
                        onClick={onBack}
                        title="Back to Dashboard"
                    >
                        <MdArrowBack size={16} />
                        <span>Back</span>
                    </button>

                    <div className="topbar-divider" />

                    {/* Logo + Project Name */}
                    <div className="topbar-brand">
                        <div className="topbar-logo">
                            <MdAutoAwesome size={16} />
                        </div>
                        <input
                            className="project-title"
                            defaultValue={projectTitle || 'Untitled Video Project'}
                            onChange={(e) => onProjectTitleChange && onProjectTitleChange(e.target.value)}
                            title="Click to rename project"
                        />
                    </div>

                    <div className="topbar-divider" />

                    {/* History Controls */}
                    <div className="topbar-btn-group">
                        <button
                            className={`icon-btn ${!canUndo ? 'disabled' : ''}`}
                            title="Undo  (Ctrl+Z)"
                            onClick={onUndo}
                            disabled={!canUndo}
                        >
                            <MdUndo size={18} />
                        </button>
                        <button
                            className={`icon-btn ${!canRedo ? 'disabled' : ''}`}
                            title="Redo  (Ctrl+Y)"
                            onClick={onRedo}
                            disabled={!canRedo}
                        >
                            <MdRedo size={18} />
                        </button>
                    </div>

                    {/* Save Button */}
                    <button
                        className={`topbar-save-btn ${saved ? 'saved' : ''}`}
                        onClick={handleSave}
                        title="Save project  (Ctrl+S)"
                    >
                        {saved ? (
                            <>
                                <MdCheckCircle size={15} />
                                <span>Saved</span>
                            </>
                        ) : (
                            <>
                                <MdSave size={15} />
                                <span>Save</span>
                            </>
                        )}
                    </button>
                </div>

                {/* === CENTER SECTION — Zoom === */}
                <div className="top-center">
                    <div className="topbar-zoom-group">
                        <button
                            className="icon-btn"
                            title="Zoom Out"
                            onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                        >
                            <MdZoomOut size={18} />
                        </button>
                        <div className="zoom-pill" onClick={() => setZoomLevel(100)} title="Reset to 100%">
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
                </div>

                {/* === RIGHT SECTION === */}
                <div className="top-right">
                    {/* Keyboard Shortcuts */}
                    <button
                        className="icon-btn"
                        title="Keyboard Shortcuts"
                        onClick={() => setShowShortcuts(true)}
                    >
                        <MdKeyboard size={18} />
                    </button>

                    <div className="topbar-divider" />

                    {/* Preview */}
                    <button
                        className="topbar-preview-btn"
                        onClick={handlePreview}
                        title="Preview Video  (Space)"
                    >
                        <MdPlayCircleOutline size={16} />
                        <span>Preview</span>
                    </button>

                    {/* Export */}
                    <button
                        className="topbar-export-btn"
                        onClick={exportVideo}
                        title="Export Video"
                    >
                        <MdFileDownload size={16} />
                        <span>Export</span>
                    </button>

                    <div className="topbar-divider" />

                    {/* Avatar */}
                    <div className="topbar-avatar" title="Account">
                        <MdAccountCircle size={22} />
                    </div>
                </div>
            </div>

            {/* === Keyboard Shortcuts Modal === */}
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
                            <h3>⌨️ Keyboard Shortcuts</h3>
                            <button className="shortcuts-close" onClick={() => setShowShortcuts(false)}>✕</button>
                        </div>
                        <div className="shortcuts-grid">
                            {[
                                { key: 'Space', action: 'Play / Pause' },
                                { key: 'Esc', action: 'Close panel' },
                                { key: 'Delete', action: 'Delete active scene' },
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
        </>
    )
}

export default EditorTopbar
