import '../Videos/Videos.css'
import './skeleton.css'

const CreateAvatarSkeleton = () => {
  return (
    <div className="videos-page avatars-page create-avatar-page ps-page">
      <div className="videos-shell">
        <div className="ps-block" style={{ height: 72, marginBottom: 16 }} />

        <main className="videos-main create-avatar-main">
          <div className="ps-block" style={{ minHeight: 420 }} />
        </main>
      </div>
    </div>
  )
}

export default CreateAvatarSkeleton
