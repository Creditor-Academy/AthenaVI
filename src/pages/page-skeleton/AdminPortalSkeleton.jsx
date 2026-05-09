import './skeleton.css'

const AdminPortalSkeleton = () => {
  return (
    <div className="admin-page admin-shell ps-page">
      <div className="admin-page-header ps-row">
        <div className="ps-block ps-block--line" style={{ height: 34, width: 220 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="ps-block ps-block--line" style={{ height: 38, width: 120 }} />
          <div className="ps-block ps-block--line" style={{ height: 38, width: 120 }} />
        </div>
      </div>

      <div className="admin-tab-switch ps-chip-row">
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
      </div>

      <div className="admin-stats-grid ps-grid ps-grid--4">
        <div className="ps-block" style={{ height: 96 }} />
        <div className="ps-block" style={{ height: 96 }} />
        <div className="ps-block" style={{ height: 96 }} />
        <div className="ps-block" style={{ height: 96 }} />
      </div>

      <div className="admin-dashboard-grid" style={{ display: 'grid', gap: 16, gridTemplateColumns: '1.7fr 1fr' }}>
        <div className="ps-block" style={{ height: 340 }} />
        <div className="ps-block" style={{ height: 340 }} />
      </div>

      <div className="ps-grid ps-grid--2">
        <div className="ps-stack">
          <div className="ps-block ps-block--line" style={{ height: 24, width: 180 }} />
          <div className="ps-block" style={{ height: 70 }} />
          <div className="ps-block" style={{ height: 70 }} />
          <div className="ps-block" style={{ height: 70 }} />
        </div>
        <div className="ps-stack">
          <div className="ps-block ps-block--line" style={{ height: 24, width: 160 }} />
          <div className="ps-block" style={{ height: 60 }} />
          <div className="ps-block" style={{ height: 60 }} />
          <div className="ps-block" style={{ height: 60 }} />
        </div>
      </div>
    </div>
  )
}

export default AdminPortalSkeleton
