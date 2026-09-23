import { FiX, FiPlus, FiCopy, FiTrash2 } from 'react-icons/fi'
import TextPanel from '../../Slides/AIPptComponents/insert/TextPanel'
import MediaPanel from '../../Slides/AIPptComponents/insert/MediaPanel'
import ShapePanel from '../../Slides/AIPptComponents/insert/ShapePanel'
import GraphicsPanel from '../../Slides/AIPptComponents/insert/GraphicsPanel'
import ChartPanel from '../../Slides/AIPptComponents/insert/ChartPanel'
import TablePopover from '../../Slides/AIPptComponents/insert/TablePopover'
import EmbedPanel from '../../Slides/AIPptComponents/insert/EmbedPanel'
import ColorFillPicker from '../../Slides/AIPptComponents/insert/ColorFillPicker'
import '../../Slides/AIPptComponents/insert/insertPanels.css'

const TAB_TITLES = {
  text: 'Text',
  uploads: 'Media',
  shapes: 'Shapes',
  graphics: 'Graphics',
  charts: 'Charts',
  tables: 'Tables',
  embeds: 'Embed',
  canvases: 'Pages',
}

export default function CanvasLeftDrawer({
  activeTab,
  isOpen,
  onClose,
  onInsertElement,
  canvases,
  activeCanvasIndex,
  setActiveCanvasIndex,
  onAddCanvas,
  onDuplicateCanvas,
  onDeleteCanvas,
  activeCanvas,
  onUpdateBackground,
  workspaceId = null,
  fillElementId = null,
  onFillElement,
}) {
  if (!isOpen) return null

  return (
    <aside className="canva-drawer">
      <header className="canva-drawer-header">
        <h3 className="canva-drawer-title">{TAB_TITLES[activeTab] || 'Tools'}</h3>
        <button type="button" className="canva-drawer-close-btn" onClick={onClose} aria-label="Close panel">
          <FiX />
        </button>
      </header>

      <div className="canva-drawer-body canva-drawer-body--ppt-panels">
        {activeTab === 'text' && (
          <TextPanel onInsert={onInsertElement} />
        )}
        {activeTab === 'uploads' && (
          <MediaPanel
            workspaceId={workspaceId}
            onInsert={onInsertElement}
            fillElementId={fillElementId}
            onFillElement={onFillElement}
          />
        )}
        {activeTab === 'shapes' && <ShapePanel onInsert={onInsertElement} />}
        {activeTab === 'graphics' && <GraphicsPanel onInsert={onInsertElement} />}
        {activeTab === 'charts' && <ChartPanel onInsert={onInsertElement} />}
        {activeTab === 'tables' && <TablePopover onInsert={onInsertElement} />}
        {activeTab === 'embeds' && <EmbedPanel onInsert={onInsertElement} />}

        {activeTab === 'canvases' && (
          <div className="canva-drawer-section">
            <label className="canva-drawer-label">Pages Overview</label>
            <div className="canva-pages-list">
              {canvases.map((c, index) => (
                <div
                  key={c.id}
                  className={`canva-page-card ${index === activeCanvasIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveCanvasIndex(index)}
                >
                  <div className="canva-page-card-thumb" style={{ background: c.background || '#ffffff' }}>
                    <small>Page {index + 1}</small>
                  </div>
                  <div className="canva-page-card-info">
                    <strong>Page {index + 1}</strong>
                    <small>{c.width} × {c.height} px</small>
                  </div>
                  <div className="canva-page-card-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateCanvas(c)
                      }}
                      title="Duplicate page"
                    >
                      <FiCopy />
                    </button>
                    {canvases.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteCanvas(c.id)
                        }}
                        title="Delete page"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="canva-add-page-btn" onClick={onAddCanvas}>
              <FiPlus /> Add New Page
            </button>

            <label className="canva-drawer-label" style={{ marginTop: 18 }}>Canvas background</label>
            <ColorFillPicker
              value={
                activeCanvas?.background && typeof activeCanvas.background === 'object'
                  ? activeCanvas.background
                  : { type: 'solid', color: activeCanvas?.background || '#FFFFFF' }
              }
              palette={{ bg: '#FFF', surface: '#FFF', text: '#000', title: '#000', accent: '#2563EB' }}
              onChange={(fill) => onUpdateBackground(fill)}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
