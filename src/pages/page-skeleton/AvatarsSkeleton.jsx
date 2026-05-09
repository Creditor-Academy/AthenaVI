import './skeleton.css'

const AvatarsSkeleton = () => {
  return (
    <div className="grid-container ps-page">
      <header className="avatars-header">
        <div className="header-info ps-stack" style={{ gap: 8 }}>
          <div className="ps-block ps-block--line" style={{ height: 32, width: 180 }} />
          <div className="ps-block ps-block--line" style={{ height: 16, width: 320 }} />
        </div>

        <div className="header-actions ps-stack">
          <div className="ownership-segmented-control ps-chip-row">
            <div className="ps-block ps-block--line" style={{ height: 36, width: 120 }} />
            <div className="ps-block ps-block--line" style={{ height: 36, width: 120 }} />
            <div className="ps-block ps-block--line" style={{ height: 36, width: 120 }} />
          </div>

          <div className="search-section">
            <div className="search-bar">
              <div className="ps-block ps-block--line" style={{ height: 40, width: '100%' }} />
            </div>
          </div>

          <div className="filter-tabs ps-chip-row">
            <div className="ps-block ps-block--line" style={{ height: 32, width: 70 }} />
            <div className="ps-block ps-block--line" style={{ height: 32, width: 96 }} />
            <div className="ps-block ps-block--line" style={{ height: 32, width: 70 }} />
            <div className="ps-block ps-block--line" style={{ height: 32, width: 80 }} />
            <div className="ps-block ps-block--line" style={{ height: 32, width: 80 }} />
            <div className="ps-block ps-block--line" style={{ height: 32, width: 90 }} />
            <div className="ps-block ps-block--line" style={{ height: 32, width: 90 }} />
          </div>
        </div>
      </header>

      <div className="elements-chips-scroll ps-chip-row" style={{ marginBottom: '20px', paddingBottom: '4px' }}>
        <div className="ps-block ps-block--line" style={{ height: 32, width: 64 }} />
        <div className="ps-block ps-block--line" style={{ height: 32, width: 90 }} />
        <div className="ps-block ps-block--line" style={{ height: 32, width: 80 }} />
        <div className="ps-block ps-block--line" style={{ height: 32, width: 74 }} />
      </div>

      <div className="avatars-grid ps-grid ps-grid--4">
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-block" style={{ height: 300 }} />
      </div>
    </div>
  )
}

export default AvatarsSkeleton
