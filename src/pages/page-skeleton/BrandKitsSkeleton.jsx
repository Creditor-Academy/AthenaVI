import './skeleton.css'

const BrandKitsSkeleton = () => {
  return (
    <div className="brandkits-container ps-page">
      <div className="brandkits-header ps-row">
        <div className="ps-block ps-block--line" style={{ height: 32, width: 210 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="ps-block ps-block--line" style={{ height: 36, width: 90 }} />
          <div className="ps-block ps-block--line" style={{ height: 40, width: 140 }} />
        </div>
      </div>

      <div className="brandkits-grid ps-grid ps-grid--3">
        <div className="ps-block" style={{ height: 200 }} />
        <div className="ps-block" style={{ height: 200 }} />
        <div className="ps-block" style={{ height: 200 }} />
      </div>
    </div>
  )
}

export default BrandKitsSkeleton
