import '../AdminPortal/SuperadminPortal.css'
import './skeleton.css'

const AdminPortalSkeleton = () => {
  return (
    <div className="sa-portal ps-page">
      <div className="sa-panel">
        <div className="sa-panel-header">
          <div className="ps-block ps-block--line" style={{ height: 22, width: 160 }} />
        </div>
        <div className="sa-split">
          <div className="ps-block" style={{ minHeight: 420 }} />
          <div className="ps-block" style={{ minHeight: 420 }} />
        </div>
      </div>
    </div>
  )
}

export default AdminPortalSkeleton
