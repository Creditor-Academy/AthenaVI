import { MdDownload, MdImage, MdOpenInNew, MdSlideshow, MdVideoLibrary } from 'react-icons/md';
import UserIdentity from '../../components/features/workspace/workspace/UserIdentity.jsx';
import { formatBytes } from '../../utils/formatSize.js';
import { formatOnlyDate } from '../../components/features/workspace/workspace/ViewRows.jsx';
import { normalizeLibraryCategoryId } from '../../utils/workspaceLibrary.js';

function ExportVideoRow({
  video,
  onPreview,
  onDownload,
  onOpenProject,
  downloading = false,
}) {
  const category = normalizeLibraryCategoryId(video.category || video.kind) || 'video';

  const renderIcon = () => {
    if (category === 'presentation') return <MdSlideshow size={22} className="row-icon-ppt" />;
    if (category === 'image') return <MdImage size={22} className="row-icon-image" />;
    return <MdVideoLibrary size={22} className="row-icon-video" />;
  };

  const renderCategoryLabel = () => {
    if (category === 'presentation') return 'Presentation';
    if (category === 'image') return 'Image';
    return 'Video';
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
        <h4 title={video.title || video.name}>{video.title || video.name}</h4>
        <span className={`row-category-pill pill-${category}`}>{renderCategoryLabel()}</span>
      </div>

      <div className="col col-workspace" title={video.workspaceName}>
        {video.workspaceName || 'Workspace'}
      </div>

      <div className="col col-completed">{formatOnlyDate(video.completedAt)}</div>

      <div className="col col-size">
        {category === 'presentation' && video.slideCount
          ? `${video.slideCount} slides`
          : category === 'image' && video.mode
            ? video.mode
            : video.fileSizeBytes
              ? formatBytes(video.fileSizeBytes)
              : '—'}
      </div>

      <div className="col col-rendered-by">
        <UserIdentity
          name={
            video.triggeredBy?.name ||
            video.owner?.name ||
            video.createdBy ||
            'Unknown'
          }
          compact
        />
      </div>

      <div className="row-actions videos-export-row__actions">
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
    </article>
  );
}

export default ExportVideoRow;
