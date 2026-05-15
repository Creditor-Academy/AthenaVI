import './skeleton.css'

const WorkspaceSkeleton = () => {
  return (
    <div className="workspace-container">
      <div className="ps-page" style={{ padding: 0 }}>
        <div className="workspace-header">
          <div className="workspace-title-section">
            <div className="ps-block ps-block--line" style={{ height: 34, width: 165 }} />
            <div className="ps-block ps-block--line" style={{ height: 40, width: 132, borderRadius: 8 }} />
            <div className="ps-block ps-block--line" style={{ height: 40, width: 124, borderRadius: 8 }} />
          </div>

          <div className="workspace-controls">
            <div className="ps-block ps-block--line" style={{ height: 40, width: 118, borderRadius: 8 }} />
            <div className="ps-block ps-block--line" style={{ height: 40, width: 112, borderRadius: 8 }} />
            <div className="view-toggle" style={{ padding: 3 }}>
              <div className="ps-block ps-block--line" style={{ height: 36, width: 36, borderRadius: '50%' }} />
              <div className="ps-block ps-block--line" style={{ height: 36, width: 36, borderRadius: '50%' }} />
            </div>
          </div>
        </div>

        <div className="folders-section">
          <div className="section-heading">
            <div className="ps-block ps-block--line" style={{ height: 20, width: 78 }} />
          </div>

          <div className="folders-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="folder-card">
                <div className="folder-icon-wrapper">
                  <div className="ps-block" style={{ width: 24, height: 24, borderRadius: 6 }} />
                </div>
                <div className="folder-info">
                  <div className="ps-block ps-block--line" style={{ height: 16, width: '68%' }} />
                  <div className="ps-block ps-block--line" style={{ height: 12, width: '45%', marginTop: 8 }} />
                </div>
                <div className="ps-block ps-block--line" style={{ width: 28, height: 28, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceSkeleton
