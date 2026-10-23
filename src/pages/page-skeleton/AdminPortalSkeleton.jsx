import '../AdminPortal/styles/SuperadminBase.css'
import '../AdminPortal/styles/AdminOverview.css'
import './skeleton.css'
import { AdminOverviewSkeleton } from '../../components/features/admin/superadmin/skeletons/AdminSkeletons'

const AdminPortalSkeleton = () => {
  return (
    <div className="sa-portal">
      <AdminOverviewSkeleton />
    </div>
  )
}

export default AdminPortalSkeleton
