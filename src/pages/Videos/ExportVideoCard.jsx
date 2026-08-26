import { MdDownload, MdImage, MdOpenInNew, MdSlideshow, MdVideoLibrary } from 'react-icons/md'
import DefaultProjectThumbnail from '../../components/features/workspace/workspace/DefaultProjectThumbnail.jsx'
import UserIdentity from '../../components/features/workspace/workspace/UserIdentity.jsx'
import { formatBytes } from '../../utils/formatSize.js'
import {
  ATHENA_AI_OWNER,
  looksLikeId,
  normalizeLibraryCategoryId,
} from '../../utils/workspaceLibrary.js'
import PresentationCardThumb from './PresentationCardThumb.jsx'

function resolveOwnerLabel(video) {
  const candidates = [
    video?.createdBy,
    video?.owner?.name,
    video?.owner?.email,
    video?.triggeredBy?.name,
  ]
  for (const candidate of candidates) {
    if (candidate == null || candidate === '') continue
    const text = String(candidate).trim()
    if (text && !looksLikeId(text)) return text
  }
  const kind = normalizeLibraryCategoryId(video?.kind || video?.category) || ''
  if (kind === 'image' || kind === 'presentation') return ATHENA_AI_OWNER
  return 'Unknown'
}

function ExportVideoCard({
  video,
  onPreview,
  onDownload,
  onOpenProject,
  downloading = false,
}) {
  const category = normalizeLibraryCategoryId(video.category || video.kind) || 'video'
  const title = video.title || video.name || 'Untitled'
  const thumbSrc = video.thumbnailUrl || video.thumbnail || video.url || null
  const authorName = resolveOwnerLabel(video)

  const badge =
    category === 'presentation' ? (
      <span className="work-card-badge badge-ppt">
        <MdSlideshow size={12} /> Presentation
      </span>
    ) : category === 'image' ? (
      <span className="work-card-badge badge-image">
        <MdImage size={12} /> Image
      </span>
    ) : (
      <span className="work-card-badge badge-video">
        <MdVideoLibrary size={12} /> Video
      </span>
    )

  const overlayLabel =
    category === 'presentation'
      ? 'Preview Deck'
      : category === 'image'
        ? 'View Image'
        : 'Open Video'

  const detailTag =
    category === 'presentation' && video.slideCount
      ? `${video.slideCount} slides`
      : category === 'image' && video.mode
        ? video.mode
        : video.fileSizeBytes
          ? formatBytes(video.fileSizeBytes)
          : null

  const thumbMedia =
    category === 'presentation' ? (
      <PresentationCardThumb item={video} title={title} />
    ) : thumbSrc ? (
      <img
        src={thumbSrc}
        alt=""
        className="work-card-image-bg"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    ) : (
      <DefaultProjectThumbnail
        title={title}
        category={category === 'image' ? 'image' : 'video'}
        showLabel={false}
      />
    )

  return (
    <article className={`workspace-item-card videos-export-card work-card-${category}`}>
      <button
        type="button"
        className="videos-export-card__thumb-btn"
        onClick={onPreview}
        aria-label={`Open ${title}`}
      >
        <div className={`card-thumb-container ${category}-thumb`}>
          {thumbMedia}
          {badge}
          <div className="videos-export-overlay" aria-hidden>
            <span className="btn-edit-premium">{overlayLabel}</span>
          </div>
        </div>
      </button>

      <div className="workspace-item-meta videos-export-card__meta">
        <div className="meta-left">
          <h4 title={title}>{title}</h4>
          <UserIdentity name={authorName} compact />
          <div className="meta-row-small">
            <span className="meta-small videos-export-workspace" title={video.workspaceName}>
              {video.workspaceName || 'Workspace'}
            </span>
            {detailTag ? (
              <span className="meta-small meta-tag-highlight">{detailTag}</span>
            ) : null}
          </div>
        </div>

        <div className="videos-export-card__actions">
          <button
            type="button"
            className="context-menu-btn"
            title="Download"
            aria-label={`Download ${title}`}
            disabled={downloading}
            onClick={(event) => {
              event.stopPropagation()
              onDownload?.()
            }}
          >
            <MdDownload size={18} />
          </button>
          {onOpenProject ? (
            <button
              type="button"
              className="context-menu-btn"
              title="Open"
              aria-label={`Open ${title}`}
              onClick={(event) => {
                event.stopPropagation()
                onOpenProject()
              }}
            >
              <MdOpenInNew size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default ExportVideoCard
