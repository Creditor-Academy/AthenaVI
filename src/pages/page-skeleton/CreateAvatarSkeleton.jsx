import '../Videos/Videos.css'
import './skeleton.css'

const CreateAvatarSkeleton = () => {
  return (
    <div className="videos-page avatars-page create-avatar-page ps-page">
      <div className="videos-shell">
        <header className="videos-page-header create-avatar-page-header ps-row">
          <div className="create-avatar-title-row" style={{ width: '100%' }}>
            <div className="ps-block ps-block--line" style={{ height: 40, width: 40, borderRadius: '50%' }} />
            <div className="ps-stack" style={{ flex: 1 }}>
              <div className="ps-block ps-block--line" style={{ height: 32, width: 280 }} />
              <div className="ps-block ps-block--line" style={{ height: 16, width: 360, marginTop: 8 }} />
            </div>
          </div>
        </header>

        <main className="videos-main create-avatar-main">
          <div className="creation-form-card standalone ps-block" style={{ padding: 24 }}>
            <div className="ps-chip-row" style={{ marginBottom: 14 }}>
              <div className="ps-block ps-block--line" style={{ height: 40, width: 150 }} />
              <div className="ps-block ps-block--line" style={{ height: 40, width: 140 }} />
              <div className="ps-block ps-block--line" style={{ height: 40, width: 140 }} />
            </div>

            <div className="ps-stack">
              <div className="ps-block ps-block--line" style={{ height: 44, width: '100%' }} />
              <div className="ps-block ps-block--line" style={{ height: 44, width: '100%' }} />
              <div className="ps-block" style={{ height: 150, width: '100%' }} />
              <div className="ps-block ps-block--line" style={{ height: 42, width: 170 }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateAvatarSkeleton
