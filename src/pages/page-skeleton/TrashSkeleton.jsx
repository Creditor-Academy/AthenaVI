import './skeleton.css'

const TrashSkeleton = () => {
  return (
    <div className="athena-trash-view ps-page">
      <div className="trash-header-new ps-row">
        <div className="ps-block ps-block--line" style={{ height: 34, width: 170 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="ps-block" style={{ height: 58, width: 210 }} />
          <div className="ps-block ps-block--line" style={{ height: 42, width: 130 }} />
        </div>
      </div>

      <div className="toolbar-integrated ps-row" style={{ alignItems: 'stretch' }}>
        <div className="ps-block ps-block--line" style={{ height: 42, width: '45%' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="ps-block ps-block--line" style={{ height: 42, width: 180 }} />
          <div className="ps-block ps-block--line" style={{ height: 42, width: 90 }} />
          <div className="ps-block ps-block--line" style={{ height: 42, width: 90 }} />
        </div>
      </div>

      <div className="trash-content-area ps-grid ps-grid--3">
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

export default TrashSkeleton
