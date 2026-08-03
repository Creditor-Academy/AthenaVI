import { MdDownload, MdImage, MdOpenInNew, MdPlayArrow, MdPresentToAll, MdSlideshow, MdVideoLibrary } from 'react-icons/md';
import ProjectSceneThumbnail from '../../components/features/workspace/workspace/ProjectSceneThumbnail.jsx';
import DefaultProjectThumbnail from '../../components/features/workspace/workspace/DefaultProjectThumbnail.jsx';
import UserIdentity from '../../components/features/workspace/workspace/UserIdentity.jsx';
import { formatBytes } from '../../utils/formatSize.js';

function ExportVideoCard({
  video,
  onPreview,
  onDownload,
  onOpenProject,
  downloading = false,
}) {
  const category = video.category || 'avatar_video';

  const previewProject = {
    workspaceId: video.workspaceId,
    id: video.projectId,
    data: video.raw?.projectData,
    title: video.title || video.name,
    category: category,
  };

  const renderBadge = () => {
    if (category === 'ppt') {
      return (
        <span className="work-card-badge badge-ppt">
          <MdSlideshow size={12} /> PPT
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
        <MdVideoLibrary size={12} /> Avatar Video
      </span>
    );
  };

  const renderThumbnail = () => {
    if (category === 'ppt') {
      return (
        <div className="card-thumb-container ppt-thumb">
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt={video.title} className="work-card-image-bg" />
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
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt={video.title} className="work-card-image-bg" />
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

    // Default Avatar Video
    return (
      <div className="card-thumb-container video-thumb">
        <ProjectSceneThumbnail video={previewProject} />
        {renderBadge()}
        <div className="videos-export-overlay" aria-hidden>
          <span className="btn-edit-premium">Play Video</span>
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
        aria-label={`Open ${video.title}`}
      >
        {renderThumbnail()}
      </button>

      <div className="workspace-item-meta videos-export-card__meta">
        <div className="meta-left">
          <h4 title={video.title}>{video.title}</h4>
          <UserIdentity name={video.triggeredBy?.name || 'Unknown'} compact />
          <div className="meta-row-small">
            <span className="meta-small videos-export-workspace" title={video.workspaceName}>
              {video.workspaceName || 'Workspace'}
            </span>
            {category === 'ppt' && video.slideCount ? (
              <span className="meta-small meta-tag-highlight">{video.slideCount} slides</span>
            ) : category === 'image' && video.dimensions ? (
              <span className="meta-small meta-tag-highlight">{video.dimensions}</span>
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
            aria-label={`Download ${video.title}`}
            disabled={downloading}
            onClick={(event) => {
              event.stopPropagation();
              onDownload?.();
            }}
          >
            <MdDownload size={18} />
          </button>
          {onOpenProject && category === 'avatar_video' ? (
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
