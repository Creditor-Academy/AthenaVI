import { MdDownload, MdOpenInNew } from 'react-icons/md';
import ProjectSceneThumbnail from '../../components/features/workspace/workspace/ProjectSceneThumbnail.jsx';
import UserIdentity from '../../components/features/workspace/workspace/UserIdentity.jsx';
import { formatBytes } from '../../utils/formatSize.js';

function ExportVideoCard({
  video,
  onPreview,
  onDownload,
  onOpenProject,
  downloading = false,
}) {
  const previewProject = {
    workspaceId: video.workspaceId,
    id: video.projectId,
    data: video.raw?.projectData,
  };

  return (
    <article className="workspace-item-card videos-export-card">
      <button
        type="button"
        className="videos-export-card__thumb-btn"
        onClick={onPreview}
        aria-label={`Play ${video.title}`}
      >
        <div className="card-thumb-container video-thumb">
          <ProjectSceneThumbnail video={previewProject} />
          <span className="videos-export-badge">Export</span>
          <div className="videos-export-overlay" aria-hidden>
            <span className="btn-edit-premium">Play Export</span>
          </div>
        </div>
      </button>

      <div className="workspace-item-meta videos-export-card__meta">
        <div className="meta-left">
          <h4 title={video.title}>{video.title}</h4>
          <UserIdentity name={video.triggeredBy?.name || 'Unknown'} compact />
          <div className="meta-row-small">
            <span className="meta-small videos-export-workspace" title={video.workspaceName}>
              {video.workspaceName || 'Workspace'}
            </span>
            {video.fileSizeBytes ? (
              <span className="meta-small">{formatBytes(video.fileSizeBytes)}</span>
            ) : null}
          </div>
        </div>

        <div className="videos-export-card__actions">
          <button
            type="button"
            className="context-menu-btn"
            title="Download"
            aria-label={`Download ${video.title}`}
            disabled={downloading}
            onClick={(event) => {
              event.stopPropagation();
              onDownload?.();
            }}
          >
            <MdDownload size={18} />
          </button>
          {onOpenProject ? (
            <button
              type="button"
              className="context-menu-btn"
              title="Open project"
              aria-label={`Open project for ${video.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onOpenProject();
              }}
            >
              <MdOpenInNew size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default ExportVideoCard;
