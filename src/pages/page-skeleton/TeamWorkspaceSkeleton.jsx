import './skeleton.css'
import {
  SkeletonSectionHeader,
  SkeletonTab,
  SkeletonWorkspaceItems,
} from './SkeletonPrimitives'

const TeamWorkspaceSkeleton = ({ viewMode = 'tile' }) => {
  return (
    <div aria-busy="true" aria-label="Loading workspaces">
      <div className="workspace-section">
        <SkeletonSectionHeader />
        <SkeletonWorkspaceItems viewMode={viewMode} cardCount={1} cardVariant="workspace" />
      </div>

      <div className="workspace-root-tabs-wrapper">
        <div className="workspace-root-tabs">
          <SkeletonTab active />
          <SkeletonTab />
        </div>
      </div>

      <div className="workspace-section">
        <SkeletonSectionHeader withAction />
        <SkeletonWorkspaceItems viewMode={viewMode} cardCount={4} cardVariant="workspace" />
      </div>
    </div>
  )
}

export default TeamWorkspaceSkeleton
