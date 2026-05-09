import './skeleton.css'

const HomeSkeleton = () => {
  return (
    <div className="home-container ps-page">
      <div className="welcome-banner ps-block" style={{ padding: 20 }}>
        <div className="ps-row" style={{ marginBottom: 12 }}>
          <div className="ps-block ps-block--line" style={{ height: 34, width: 250 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="ps-block ps-block--line" style={{ height: 38, width: 130 }} />
            <div className="ps-block ps-block--line" style={{ height: 38, width: 150 }} />
          </div>
        </div>
        <div className="ps-block ps-block--line" style={{ height: 16, width: '60%' }} />
      </div>

      <div className="home-billing-stats ps-grid ps-grid--3">
        <div className="ps-block" style={{ height: 112 }} />
        <div className="ps-block" style={{ height: 112 }} />
        <div className="ps-block" style={{ height: 112 }} />
      </div>

      <div className="home-tabs-wrapper ps-chip-row">
        <div className="ps-block ps-block--line" style={{ height: 36, width: 170 }} />
        <div className="ps-block ps-block--line" style={{ height: 36, width: 130 }} />
        <div className="ps-block ps-block--line" style={{ height: 36, width: 120 }} />
      </div>

      <div className="projects-grid-override ps-grid ps-grid--3">
        <div className="ps-block" style={{ height: 230 }} />
        <div className="ps-block" style={{ height: 230 }} />
        <div className="ps-block" style={{ height: 230 }} />
        <div className="ps-block" style={{ height: 230 }} />
        <div className="ps-block" style={{ height: 230 }} />
        <div className="ps-block" style={{ height: 230 }} />
      </div>
    </div>
  )
}

export default HomeSkeleton
