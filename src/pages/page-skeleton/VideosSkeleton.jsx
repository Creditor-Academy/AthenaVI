import './skeleton.css'

const VideosSkeleton = () => {
  return (
    <div className="videos-page">
      <div className="videos-shell ps-page">
        <div className="videos-page-header ps-row">
        <div className="ps-block ps-block--line" style={{ height: 32, width: 180 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="ps-block ps-block--line" style={{ height: 40, width: 82 }} />
            <div className="ps-block ps-block--line" style={{ height: 40, width: 130 }} />
          </div>
        </div>

        <div className="videos-search-bar">
          <div className="ps-block ps-block--line" style={{ height: 40, width: '100%' }} />
        </div>

        <div className="videos-main">
          <div className="videos-grid ps-grid ps-grid--4">
            <div className="ps-block" style={{ height: 224 }} />
            <div className="ps-block" style={{ height: 224 }} />
            <div className="ps-block" style={{ height: 224 }} />
            <div className="ps-block" style={{ height: 224 }} />
            <div className="ps-block" style={{ height: 224 }} />
            <div className="ps-block" style={{ height: 224 }} />
            <div className="ps-block" style={{ height: 224 }} />
            <div className="ps-block" style={{ height: 224 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideosSkeleton
