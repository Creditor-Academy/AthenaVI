import '../AdminPortal/SuperadminPortal.css'
import './skeleton.css'

const AdminPortalSkeleton = () => {
  return (
    <div className="sa-portal ps-page">
      <div className="sa-panel">
        <div className="ps-block" style={{ height: 48, marginBottom: 16 }} />
        <div className="sa-split">
          <div className="ps-block" style={{ minHeight: 420 }} />
          <div className="ps-block" style={{ minHeight: 420 }} />
        </div>
      </div>
    </div>
  )
}

export default AdminPortalSkeleton
