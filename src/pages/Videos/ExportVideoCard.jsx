import React from 'react'
import { MdDownload, MdImage, MdOpenInNew, MdSlideshow, MdMovieCreation, MdSchedule } from 'react-icons/md'
import DefaultProjectThumbnail from '../../components/features/workspace/workspace/DefaultProjectThumbnail.jsx'
import UserIdentity from '../../components/features/workspace/workspace/UserIdentity.jsx'
import { formatBytes } from '../../utils/formatSize.js'
import {
  ATHENA_AI_OWNER,
  looksLikeId,
  normalizeLibraryCategoryId,
} from '../../utils/workspaceLibrary.js'
import PresentationCardThumb from '../../components/ppt/PresentationCardThumb.jsx'
import ProjectSceneThumbnail from '../../components/features/workspace/workspace/ProjectSceneThumbnail.jsx'

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

function formatRelativeLabel(dateStr) {
  if (!dateStr) return 'Recently'
  const time = new Date(dateStr).getTime()
  if (Number.isNaN(time)) return 'Recently'
  const mins = Math.floor((Date.now() - time) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 24)
  if (hrs < 24) return `${Math.floor(mins / 60)}h ago`
  const days = Math.floor(mins / 1440)
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function KindBadge({ kind }) {
  if (kind === 'presentation') {
    return (
      <span className="wsc-kind-badge wsc-kind-badge--presentation">
        <MdSlideshow size={12} /> Presentation
      </span>
    )
  }
  if (kind === 'image') {
    return (
      <span className="wsc-kind-badge wsc-kind-badge--image">
        <MdImage size={12} /> Image
      </span>
    )
  }
  return (
    <span className="wsc-kind-badge wsc-kind-badge--video">
      <MdMovieCreation size={12} /> Video
    </span>
  )
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
  const relative = formatRelativeLabel(video.createdAt || video.updatedAt || video.lastModifiedAt)

  const statusRaw = video.deckStatus || video.status || 'completed'
  const statusLabel = statusRaw
    ? String(statusRaw).charAt(0).toUpperCase() + String(statusRaw).slice(1).toLowerCase()
    : null
  const statusKey = String(statusRaw || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-')

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
      <PresentationCardThumb
        item={video}
        title={title}
        imageClassName="wsc-library-thumb-img ppt-thumb-fade"
        hostClassName="wsc-ppt-thumb-host"
        canvasClassName="wsc-ppt-thumb-canvas"
      />
    ) : category === 'image' && thumbSrc ? (
      <img
        src={thumbSrc}
        alt=""
        className="wsc-library-thumb-img"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    ) : category === 'image' ? (
      <DefaultProjectThumbnail title={title} category="image" showLabel={false} />
    ) : thumbSrc ? (
      <img
        src={thumbSrc}
        alt=""
        className="wsc-library-thumb-img"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    ) : (
      <ProjectSceneThumbnail video={video} />
    )

  return (
    <article className={`wsc-card wsc-video-card videos-export-card work-card-${category}`} onClick={onPreview}>
      {/* Thumbnail */}
      <div className="wsc-video-card__thumb">
        <div className="wsc-video-card__thumb-inner">
          {thumbMedia}
        </div>

        <KindBadge kind={category} />

        {/* Top right action buttons over thumbnail area */}
        <div
          className="wsc-card__menu videos-export-card__top-actions"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
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
            <MdDownload size={16} />
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
              <MdOpenInNew size={16} />
            </button>
          ) : null}
        </div>

        <div className="wsc-card__hover-overlay">
          <div className="wsc-card__action-pill">
            {category === 'image' ? (
              <MdImage size={15} />
            ) : category === 'presentation' ? (
              <MdSlideshow size={15} />
            ) : (
              <MdMovieCreation size={15} />
            )}
            <span>{overlayLabel}</span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="wsc-video-card__meta">
        <div className="wsc-video-card__info">
          <div className="wsc-video-card__title-row">
            <h4 className="wsc-video-card__title" title={title}>
              {title}
            </h4>
            {statusLabel && (
              <span className={`wsc-status-capsule wsc-status-capsule--${statusKey}`}>
                <span className="wsc-status-capsule__dot" />
                {statusLabel}
              </span>
            )}
          </div>

          <div className="wsc-video-card__byline">
            <span className="wsc-byline-item">
              <MdSchedule size={12} />
              <span>{relative}</span>
            </span>
            {video.workspaceName && (
              <>
                <span className="wsc-card__dot" aria-hidden="true">·</span>
                <span className="wsc-byline-item videos-export-workspace" title={video.workspaceName}>
                  {video.workspaceName}
                </span>
              </>
            )}
            {detailTag && (
              <>
                <span className="wsc-card__dot" aria-hidden="true">·</span>
                <span className="wsc-byline-item meta-tag-highlight">{detailTag}</span>
              </>
            )}
            {authorName ? (
              <>
                <span className="wsc-card__dot" aria-hidden="true">·</span>
                <span className="wsc-byline-author">
                  <UserIdentity name={authorName} compact showName={false} />
                  <span className="wsc-video-card__creator">{authorName}</span>
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

export default ExportVideoCard
