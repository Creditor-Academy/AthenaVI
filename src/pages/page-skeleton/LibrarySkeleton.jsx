import './skeleton.css'

const LibrarySkeleton = () => {
  return (
    <div className="library-page">
      <div className="library-shell ps-page">
        <div className="library-page-header">
          <div className="ps-block ps-block--line" style={{ height: 34, width: 210 }} />
        </div>

        <div className="library-category-row ps-grid ps-grid--4">
          <div className="ps-block" style={{ height: 116 }} />
          <div className="ps-block" style={{ height: 116 }} />
          <div className="ps-block" style={{ height: 116 }} />
          <div className="ps-block" style={{ height: 116 }} />
        </div>

        <div className="library-filters-bar ps-row">
          <div className="ps-chip-row">
            <div className="ps-block ps-block--line" style={{ height: 34, width: 90 }} />
            <div className="ps-block ps-block--line" style={{ height: 34, width: 90 }} />
            <div className="ps-block ps-block--line" style={{ height: 34, width: 90 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="ps-block ps-block--line" style={{ height: 36, width: 120 }} />
            <div className="ps-block ps-block--line" style={{ height: 36, width: 84 }} />
          </div>
        </div>

        <div className="assets-grid ps-grid ps-grid--4">
          <div className="ps-block" style={{ height: 178 }} />
          <div className="ps-block" style={{ height: 178 }} />
          <div className="ps-block" style={{ height: 178 }} />
          <div className="ps-block" style={{ height: 178 }} />
          <div className="ps-block" style={{ height: 178 }} />
          <div className="ps-block" style={{ height: 178 }} />
          <div className="ps-block" style={{ height: 178 }} />
          <div className="ps-block" style={{ height: 178 }} />
        </div>
      </div>
    </div>
  )
}

export default LibrarySkeleton
