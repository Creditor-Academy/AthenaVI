import { MdHistory, MdWorkspaces } from 'react-icons/md'
import './skeleton.css'
import {
  SkeletonMediaCollection,
  SkeletonSectionHeader,
  SkeletonWorkspaceItems,
} from './SkeletonPrimitives'

const TeamWorkspaceSkeleton = ({ viewMode = 'tile', activeRootTab = 'recents' }) => {
  const isRecents = activeRootTab === 'recents'
  const isGridMode = viewMode === 'tile' || viewMode === 'grid'

  return (
    <div aria-busy="true" aria-label="Loading workspace contents">
      {/* Workspace Root Tabs */}
      <div className="workspace-root-tabs-wrapper">
        <div className="workspace-root-tabs">
          <button type="button" className={`workspace-root-tab ${isRecents ? 'active' : ''}`}>
            <MdHistory size={18} /> Recents
            <span className="tab-count-badge">...</span>
          </button>
          <button type="button" className={`workspace-root-tab ${!isRecents ? 'active' : ''}`}>
            <MdWorkspaces size={18} /> Workspace
            <span className="tab-count-badge">...</span>
          </button>
        </div>
      </div>

      {isRecents ? (
        /* Recents Skeleton Section — no duplicate "Recents" header (tab already shows it) */
        <div className="workspace-section">
          <SkeletonMediaCollection
            viewMode={isGridMode ? 'grid' : 'list'}
            cardCount={6}
            ariaLabel="Loading recent videos"
          />
        </div>
      ) : (
        /* Workspaces Skeleton Section */
        <>
          <div className="workspace-section">
            <SkeletonSectionHeader title="Personal Workspace" />
            <SkeletonWorkspaceItems viewMode={viewMode} cardCount={1} cardVariant="workspace" />
          </div>

          <div className="workspace-section">
            <SkeletonSectionHeader title="My Workspaces" withAction />
            <SkeletonWorkspaceItems viewMode={viewMode} cardCount={4} cardVariant="workspace" />
          </div>
        </>
      )}
    </div>
  )
}

export default TeamWorkspaceSkeleton
