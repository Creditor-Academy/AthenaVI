import './skeleton.css'

const ProfileSkeleton = () => {
  return (
    <div className="profile-page ps-page">
      <div className="ps-block" style={{ height: 40, width: 180 }} />

      <div className="profile-grid" style={{ display: 'grid', gap: 16, gridTemplateColumns: '320px 1fr' }}>
        <aside className="ps-block" style={{ minHeight: 320 }} />

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
