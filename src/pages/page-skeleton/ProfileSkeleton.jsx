import './skeleton.css'

const ProfileSkeleton = () => {
  return (
    <div className="profile-page ps-page">
      <div className="profile-header-new ps-row" style={{ justifyContent: 'flex-start' }}>
        <div className="ps-block ps-block--line" style={{ height: 32, width: 150 }} />
      </div>

      <div className="profile-grid" style={{ display: 'grid', gap: 16, gridTemplateColumns: '320px 1fr' }}>
        <aside className="profile-sidebar-card ps-block" style={{ padding: 16 }}>
          <div className="ps-block" style={{ height: 112, width: 112, borderRadius: '50%', margin: '0 auto 12px' }} />
          <div className="ps-block ps-block--line" style={{ height: 22, width: '70%', margin: '0 auto 8px' }} />
          <div className="ps-block ps-block--line" style={{ height: 16, width: '84%', margin: '0 auto 14px' }} />
          <div className="ps-chip-row" style={{ justifyContent: 'center' }}>
            <div className="ps-block ps-block--line" style={{ height: 30, width: 120 }} />
            <div className="ps-block ps-block--line" style={{ height: 30, width: 120 }} />
          </div>
        </aside>

        <section className="ps-stack">
          <div className="ps-block" style={{ height: 170 }} />
          <div className="ps-block" style={{ height: 170 }} />
          <div className="ps-block" style={{ height: 170 }} />
        </section>
      </div>
    </div>
  )
}

export default ProfileSkeleton
