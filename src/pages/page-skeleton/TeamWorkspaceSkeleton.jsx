import './skeleton.css'

const TeamWorkspaceSkeleton = () => {
  return (
    <div className="team-workspace-container">
      <div className="workspace-content-area ps-page" style={{ flex: 1 }}>
        <div className="ps-row">
        <div className="ps-block ps-block--line" style={{ height: 32, width: 220 }} />
        <div className="ps-block ps-block--line" style={{ height: 40, width: 140 }} />
        </div>

        <div className="ps-chip-row">
        <div className="ps-block ps-block--line" style={{ height: 36, width: 160 }} />
        <div className="ps-block ps-block--line" style={{ height: 36, width: 160 }} />
        </div>

        <div className="workspace-tiles ps-grid ps-grid--3">
          <div className="ps-block" style={{ height: 176 }} />
          <div className="ps-block" style={{ height: 176 }} />
          <div className="ps-block" style={{ height: 176 }} />
          <div className="ps-block" style={{ height: 176 }} />
          <div className="ps-block" style={{ height: 176 }} />
          <div className="ps-block" style={{ height: 176 }} />
        </div>
      </div>
    </div>
  )
}

export default TeamWorkspaceSkeleton
