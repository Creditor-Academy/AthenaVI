import { MdDownload, MdImage, MdOpenInNew, MdPresentToAll, MdSlideshow, MdVideoLibrary } from 'react-icons/md';
import UserIdentity from '../../components/features/workspace/workspace/UserIdentity.jsx';
import { formatBytes } from '../../utils/formatSize.js';
import { formatOnlyDate } from '../../components/features/workspace/workspace/ViewRows.jsx';

function ExportVideoRow({
  video,
  onPreview,
  onDownload,
  onOpenProject,
  downloading = false,
}) {
  const category = video.category || 'avatar_video';

  const renderIcon = () => {
    if (category === 'ppt') return <MdSlideshow size={22} className="row-icon-ppt" />;
    if (category === 'image') return <MdImage size={22} className="row-icon-image" />;
    return <MdVideoLibrary size={22} className="row-icon-video" />;
  };

  const renderCategoryLabel = () => {
    if (category === 'ppt') return 'PPT';
    if (category === 'image') return 'Image';
    return 'Avatar Video';
  };

  return (
    <article
      className={`workspace-item-row export-item-row work-row-${category}`}
      onClick={onPreview}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPreview?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={`row-icon-container row-icon-wrap-${category}`} aria-hidden>
        {renderIcon()}
      </div>

      <div className="col col-name">
        <h4 title={video.title}>{video.title}</h4>
        <span className={`row-category-pill pill-${category}`}>{renderCategoryLabel()}</span>
      </div>

      <div className="col col-workspace" title={video.workspaceName}>
        {video.workspaceName || 'Workspace'}
      </div>

      <div className="col col-completed">
        {formatOnlyDate(video.completedAt)}
      </div>

      <div className="col col-size">
        {category === 'ppt' && video.slideCount
          ? `${video.slideCount} slides`
          : category === 'image' && video.dimensions
          ? video.dimensions
          : video.fileSizeBytes
          ? formatBytes(video.fileSizeBytes)
          : '—'}
      </div>

      <div className="col col-rendered-by">
        <UserIdentity name={video.triggeredBy?.name || 'Unknown'} compact />
      </div>

      <div className="row-actions videos-export-row__actions">
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
    </article>
  );
}

export default ExportVideoRow;
