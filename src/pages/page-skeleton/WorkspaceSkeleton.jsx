import './skeleton.css'
import { SkeletonSectionHeader, SkeletonWorkspaceItems } from './SkeletonPrimitives'

const WorkspaceSkeleton = () => {
  return (
    <div className="workspace-container">
      <div className="ps-page" style={{ padding: 0 }}>
        <div className="ps-block" style={{ height: 56, marginBottom: 20 }} />

        <div className="workspace-section">
          <SkeletonSectionHeader />
          <SkeletonWorkspaceItems viewMode="tile" cardCount={6} cardVariant="workspace" />
        </div>
      </div>
    </div>
  )
}

export default WorkspaceSkeleton
