import { useEffect, useRef } from 'react'
import {
  MdArrowBack,
  MdSave,
  MdDownload,
  MdDashboard,
  MdPalette,
  MdCategory,
  MdTextFields,
  MdPhotoLibrary,
  MdMenuBook,
  MdInfoOutline,
  MdSmartButton,
} from 'react-icons/md'
import { ChevronRight } from 'lucide-react'
import OverviewTab from './editor/OverviewTab'
import ColorsTab from './editor/ColorsTab'
import ButtonsTab from './editor/ButtonsTab'
import LogosTab from './editor/LogosTab'
import TypographyTab from './editor/TypographyTab'
import ImageryTab from './editor/ImageryTab'
import GuidelineTab from './editor/GuidelineTab'

const EDITOR_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: MdDashboard },
  { id: 'identity', label: 'Brand Colors', icon: MdPalette },
  { id: 'buttons', label: 'Buttons', icon: MdSmartButton },
  { id: 'logos', label: 'Logos', icon: MdCategory },
  { id: 'typography', label: 'Typography', icon: MdTextFields },
  { id: 'imagery', label: 'Imagery', icon: MdPhotoLibrary },
  { id: 'guideline', label: 'Brand Guideline', icon: MdMenuBook },
]

export default function BrandKitEditor(props) {
  const {
    canWrite,
    closeEditor,
    downloadBrandGuideline,
    generatingGuideline,
    handleSave,
    saving,
    kitName,
    setKitName,
    editorTab,
    setEditorTab,
    error,
    fileInputRef,
    handleFileSelected,
    kitData,
  } = props

  const studioPanelRef = useRef(null)
  const colorsList = kitData.colors || []
  const primaryColors = colorsList.slice(0, 2)
  const secondaryColors = colorsList.slice(2)

  const tabProps = {
    ...props,
    colorsList,
    primaryColors,
    secondaryColors,
  }

  useEffect(() => {
    const panel = studioPanelRef.current
    if (!panel) return
    panel.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [editorTab])

  return (
    <div className="videos-page brandkits-page brandkit-editor">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <div className="workspace-header-title">
              <button
                type="button"
                className="workspace-back-btn"
                onClick={closeEditor}
                title="Back to Brand Kits"
                aria-label="Back to Brand Kits"
              >
                <MdArrowBack size={20} />
              </button>
              <h1 className="videos-page-title">Brand Kits</h1>
            </div>
          </div>
          <div className="videos-actions">
            <button
              type="button"
              className="btn-secondary videos-create-btn"
              onClick={downloadBrandGuideline}
              title="Download Brand Guideline PDF"
              disabled={generatingGuideline}
            >
              <MdDownload size={18} />
              {generatingGuideline ? 'Preparing PDF…' : 'Download Guideline'}
            </button>
            {canWrite && (
              <button
                type="button"
                className="btn-primary videos-create-btn"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                <MdSave size={18} />
                {saving ? 'Saving…' : 'Save kit'}
              </button>
            )}
          </div>
        </header>

        <div className="workspace-breadcrumbs">
          <div className="workspace-breadcrumbs__trail">
            <span
              className="breadcrumb-link"
              onClick={closeEditor}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  closeEditor()
                }
              }}
              role="link"
              tabIndex={0}
            >
              Brand Kits
            </span>
            <ChevronRight size={14} className="breadcrumb-separator" />
            {canWrite ? (
              <input
                type="text"
                className="brandkits-breadcrumb-name"
                value={kitName}
                onChange={(e) => setKitName(e.target.value)}
                placeholder="Brand Kit Name"
                aria-label="Brand kit name"
              />
            ) : (
              <span className="brandkits-breadcrumb-current">{kitName || 'Brand Kit'}</span>
            )}
          </div>
        </div>

        <div className="workspace-root-tabs-wrapper" role="tablist" aria-label="Brand kit sections">
          <div className="workspace-root-tabs">
            {EDITOR_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = editorTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`workspace-root-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setEditorTab(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="bk-error-banner" role="alert">
            <MdInfoOutline size={18} />
            <span>{error}</span>
          </div>
        )}
        {!canWrite && (
          <div className="bk-info-banner">
            <MdInfoOutline size={16} />
            You can view this brand kit. Only owners and admins can edit.
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />

        <div className="editor-studio-panel" ref={studioPanelRef}>
          {editorTab === 'overview' && <OverviewTab {...tabProps} />}
          {editorTab === 'identity' && <ColorsTab {...tabProps} />}
          {editorTab === 'buttons' && <ButtonsTab {...tabProps} />}
          {editorTab === 'logos' && <LogosTab {...tabProps} />}
          {editorTab === 'typography' && <TypographyTab {...tabProps} />}
          {editorTab === 'imagery' && <ImageryTab {...tabProps} />}
          {editorTab === 'guideline' && <GuidelineTab {...tabProps} />}
        </div>
      </div>
    </div>
  )
}
