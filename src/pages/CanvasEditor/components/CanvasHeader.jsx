import { useState } from 'react'
import {
  FiArrowLeft,
  FiRotateCcw,
  FiRotateCw,
  FiDownload,
  FiCheck,
  FiEdit3,
  FiLayout,
  FiShare2,
} from 'react-icons/fi'

export default function CanvasHeader({
  docTitle,
  setDocTitle,
  onBack,
  undo,
  redo,
  canUndo,
  canRedo,
  onOpenSizeModal,
  onOpenExportModal,
  activeCanvas,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  return (
    <header className="canva-header">
      {/* Left: Back, File Menu & Title */}
      <div className="canva-header-left">
        <button type="button" className="canva-header-back-btn" onClick={onBack} title="Back to workspace">
          <FiArrowLeft />
          <span>Workspace</span>
        </button>

        <div className="canva-header-divider" />

        <div className="canva-header-title-wrapper">
          {isEditingTitle ? (
            <input
              type="text"
              className="canva-header-title-input"
              value={docTitle}
              autoFocus
              onChange={(e) => setDocTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            />
          ) : (
            <button
              type="button"
              className="canva-header-title-btn"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename design"
            >
              <span className="canva-header-title-text">{docTitle || 'Untitled Design'}</span>
              <FiEdit3 className="canva-header-title-icon" />
            </button>
          )}

          <div className="canva-header-save-badge">
            <FiCheck className="canva-header-check-icon" />
            <span>Saved</span>
          </div>
        </div>
      </div>

      {/* Center: History & Size Preset */}
      <div className="canva-header-center">
        <div className="canva-header-history-group">
          <button
            type="button"
            className="canva-header-icon-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <FiRotateCcw />
          </button>
          <button
            type="button"
            className="canva-header-icon-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <FiRotateCw />
          </button>
        </div>

        <div className="canva-header-divider" />

        <button
          type="button"
          className="canva-header-size-pill"
          onClick={onOpenSizeModal}
          title="Change canvas dimensions"
        >
          <FiLayout />
          <span>{activeCanvas?.width || 1200} × {activeCanvas?.height || 800} px</span>
        </button>
      </div>

      {/* Right: Share & Export */}
      <div className="canva-header-right">
        <button
          type="button"
          className="canva-header-secondary-btn"
          onClick={onOpenExportModal}
          title="Share or copy design"
        >
          <FiShare2 />
          <span>Share</span>
        </button>

        <button
          type="button"
          className="canva-header-primary-btn"
          onClick={onOpenExportModal}
        >
          <FiDownload />
          <span>Export</span>
        </button>
      </div>
    </header>
  )
}
