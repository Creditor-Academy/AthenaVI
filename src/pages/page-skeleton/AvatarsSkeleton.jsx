import './skeleton.css'

const AvatarsSkeleton = () => {
  return (
    <div className="grid-container ps-page">
      <header className="avatars-header">
        <div className="header-info ps-stack" style={{ gap: 8 }}>
          <div className="ps-block ps-block--line" style={{ height: 32, width: 180 }} />
          <div className="ps-block ps-block--line" style={{ height: 16, width: 320 }} />
        </div>

        <div className="header-actions ps-stack" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="ownership-segmented-control ps-chip-row" style={{ marginBottom: 0 }}>
            <div className="ps-block ps-block--line" style={{ height: 36, width: 120 }} />
            <div className="ps-block ps-block--line" style={{ height: 36, width: 120 }} />
            <div className="ps-block ps-block--line" style={{ height: 36, width: 120 }} />
          </div>

          <div className="search-section">
            <div className="search-bar">
              <div className="ps-block ps-block--line" style={{ height: 40, width: '100%' }} />
            </div>
          </div>
        </div>
      </header>

      <div className="avatars-grid ps-grid ps-grid--4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="avatar-card ps-stack" style={{ gap: 0, border: 'none' }}>
            <div className="ps-block" style={{ height: 320, borderRadius: '20px 20px 0 0' }} />
            <div className="avatar-info ps-stack" style={{ padding: '16px 20px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="ps-stack" style={{ gap: 4, flex: 1 }}>
                <div className="ps-block ps-block--line" style={{ height: 16, width: '60%' }} />
                <div className="ps-block ps-block--line" style={{ height: 12, width: '40%' }} />
              </div>
              <div className="ps-block" style={{ height: 32, width: 90, borderRadius: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AvatarsSkeleton
