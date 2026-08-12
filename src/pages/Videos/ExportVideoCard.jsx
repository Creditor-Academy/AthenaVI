import { MdDownload, MdImage, MdOpenInNew, MdSlideshow, MdVideoLibrary } from 'react-icons/md';
import ProjectSceneThumbnail from '../../components/features/workspace/workspace/ProjectSceneThumbnail.jsx';
import DefaultProjectThumbnail from '../../components/features/workspace/workspace/DefaultProjectThumbnail.jsx';
import UserIdentity from '../../components/features/workspace/workspace/UserIdentity.jsx';
import { formatBytes } from '../../utils/formatSize.js';
import { normalizeLibraryCategoryId } from '../../utils/workspaceLibrary.js';

function ExportVideoCard({
  video,
  onPreview,
  onDownload,
  onOpenProject,
  downloading = false,
}) {
  const category = normalizeLibraryCategoryId(video.category || video.kind) || 'video';

  const previewProject = {
    workspaceId: video.workspaceId,
    id: video.projectId || video.id,
    data: video.raw?.projectData || video.data,
    title: video.title || video.name,
    category,
  };

  const renderBadge = () => {
    if (category === 'presentation') {
      return (
        <span className="work-card-badge badge-ppt">
          <MdSlideshow size={12} /> Presentation
        </span>
      );
    }
    if (category === 'image') {
      return (
        <span className="work-card-badge badge-image">
          <MdImage size={12} /> Image
        </span>
      );
    }
    return (
      <span className="work-card-badge badge-video">
        <MdVideoLibrary size={12} /> Video
      </span>
    );
  };

  const renderThumbnail = () => {
    if (category === 'presentation') {
      return (
        <div className="card-thumb-container ppt-thumb">
          {video.thumbnailUrl || video.thumbnail ? (
            <img
              src={video.thumbnailUrl || video.thumbnail}
              alt={video.title || video.name}
              className="work-card-image-bg"
            />
          ) : (
            <DefaultProjectThumbnail title={video.title || video.name} category="ppt" />
          )}
          {renderBadge()}
          <div className="videos-export-overlay" aria-hidden>
            <span className="btn-edit-premium">Preview Deck</span>
          </div>
        </div>
      );
    }

    if (category === 'image') {
      return (
        <div className="card-thumb-container image-thumb">
          {video.thumbnailUrl || video.url ? (
            <img
              src={video.thumbnailUrl || video.url}
              alt={video.title || video.name}
              className="work-card-image-bg"
            />
          ) : (
            <DefaultProjectThumbnail title={video.title || video.name} category="image" />
          )}
          {renderBadge()}
          <div className="videos-export-overlay" aria-hidden>
            <span className="btn-edit-premium">View Image</span>
          </div>
        </div>
      );
    }

    return (
      <div className="card-thumb-container video-thumb">
        <ProjectSceneThumbnail video={previewProject} />
        {renderBadge()}
        <div className="videos-export-overlay" aria-hidden>
          <span className="btn-edit-premium">Open Video</span>
        </div>
      </div>
    );
  };

  return (
    <article className={`workspace-item-card videos-export-card work-card-${category}`}>
      <button
        type="button"
        className="videos-export-card__thumb-btn"
        onClick={onPreview}
        aria-label={`Open ${video.title || video.name}`}
      >
        {renderThumbnail()}
      </button>

      <div className="workspace-item-meta videos-export-card__meta">
        <div className="meta-left">
          <h4 title={video.title || video.name}>{video.title || video.name}</h4>
          <UserIdentity
            name={
              video.triggeredBy?.name ||
              video.owner?.name ||
              video.createdBy ||
              'Unknown'
            }
            compact
          />
          <div className="meta-row-small">
            <span className="meta-small videos-export-workspace" title={video.workspaceName}>
              {video.workspaceName || 'Workspace'}
            </span>
            {category === 'presentation' && video.slideCount ? (
              <span className="meta-small meta-tag-highlight">{video.slideCount} slides</span>
            ) : category === 'image' && video.mode ? (
              <span className="meta-small meta-tag-highlight">{video.mode}</span>
            ) : video.fileSizeBytes ? (
              <span className="meta-small">{formatBytes(video.fileSizeBytes)}</span>
            ) : null}
          </div>
        </div>

        <div className="videos-export-card__actions">
          <button
            type="button"
            className="context-menu-btn"
            title="Download"
            aria-label={`Download ${video.title || video.name}`}
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
              title="Open"
              aria-label={`Open ${video.title || video.name}`}
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
