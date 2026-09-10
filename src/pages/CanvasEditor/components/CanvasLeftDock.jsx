import {
  FiGrid,
  FiType,
  FiUpload,
  FiSquare,
  FiBookmark,
  FiLayers,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'

const DOCK_TABS = [
  { id: 'elements', label: 'Elements', icon: FiGrid },
  { id: 'text', label: 'Text', icon: FiType },
  { id: 'uploads', label: 'Uploads', icon: FiUpload },
  { id: 'shapes', label: 'Shapes', icon: FiSquare },
  { id: 'brand', label: 'Brand Kit', icon: FiBookmark },
  { id: 'canvases', label: 'Pages', icon: FiLayers },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

export default function CanvasLeftDock({
  activeTab,
  setActiveTab,
  drawerOpen,
  setDrawerOpen,
}) {
  const handleTabClick = (tabId) => {
    if (activeTab === tabId && drawerOpen) {
      setDrawerOpen(false)
    } else {
      setActiveTab(tabId)
      setDrawerOpen(true)
    }
  }

  return (
    <div className="canva-dock">
      <div className="canva-dock-tabs">
        {DOCK_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id && drawerOpen
          return (
            <button
              type="button"
              key={tab.id}
              className={`canva-dock-tab ${isActive ? 'is-active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
            >
              <Icon className="canva-dock-tab-icon" />
              <span className="canva-dock-tab-label">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="canva-dock-toggle-btn"
        onClick={() => setDrawerOpen(!drawerOpen)}
        title={drawerOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {drawerOpen ? <FiChevronLeft /> : <FiChevronRight />}
      </button>
    </div>
  )
}
