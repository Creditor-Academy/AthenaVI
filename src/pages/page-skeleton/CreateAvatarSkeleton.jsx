import './skeleton.css'

const CreateAvatarSkeleton = () => {
  return (
    <div className="create-avatar-page ps-page">
      <div className="create-avatar-header ps-row" style={{ justifyContent: 'flex-start', gap: 10 }}>
        <div className="ps-block ps-block--line" style={{ height: 38, width: 38 }} />
        <div className="ps-block ps-block--line" style={{ height: 32, width: 240 }} />
      </div>

      <div className="creation-form-card standalone ps-block" style={{ padding: 18 }}>
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
    </div>
  )
}

export default CreateAvatarSkeleton
