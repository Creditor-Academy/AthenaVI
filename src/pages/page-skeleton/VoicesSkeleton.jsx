import './skeleton.css'

const VoicesSkeleton = () => {
  return (
    <div className="voices-container ps-page">
      <div className="voices-header ps-row">
        <div className="ps-block ps-block--line" style={{ height: 32, width: 170 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="ps-block ps-block--line" style={{ height: 40, width: 150 }} />
          <div className="ps-block ps-block--line" style={{ height: 40, width: 120 }} />
        </div>
      </div>

      <div className="ps-block ps-block--line" style={{ height: 42, width: '100%' }} />

      <div className="voices-grid ps-grid ps-grid--3">
        <div className="ps-block" style={{ height: 170 }} />
        <div className="ps-block" style={{ height: 170 }} />
        <div className="ps-block" style={{ height: 170 }} />
        <div className="ps-block" style={{ height: 170 }} />
        <div className="ps-block" style={{ height: 170 }} />
        <div className="ps-block" style={{ height: 170 }} />
      </div>
    </div>
  )
}

export default VoicesSkeleton
