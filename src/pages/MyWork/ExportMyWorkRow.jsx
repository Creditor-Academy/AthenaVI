import { MdDownload, MdImage, MdOpenInNew, MdSlideshow, MdVideoLibrary } from 'react-icons/md'
import UserIdentity from '../../components/features/workspace/workspace/UserIdentity.jsx'
import { formatBytes } from '../../utils/formatSize.js'
import { formatOnlyDate } from '../../components/features/workspace/workspace/ViewRows.jsx'
import {
  ATHENA_AI_OWNER,
  looksLikeId,
  normalizeLibraryCategoryId,
} from '../../utils/workspaceLibrary.js'

function resolveOwnerLabel(item) {
  const candidates = [
    item?.createdBy,
    item?.owner?.name,
    item?.owner?.email,
    item?.triggeredBy?.name,
  ]
  for (const candidate of candidates) {
    if (candidate == null || candidate === '') continue
    const text = String(candidate).trim()
    if (text && !looksLikeId(text)) return text
  }
  const kind = normalizeLibraryCategoryId(item?.kind || item?.category) || ''
  if (kind === 'image' || kind === 'presentation') return ATHENA_AI_OWNER
  return 'Unknown'
}

function ExportMyWorkRow({
  video,
  item,
  onPreview,
  onDownload,
  onOpenProject,
  downloading = false,
}) {
  const workItem = video || item || {}
  const category = normalizeLibraryCategoryId(workItem.category || workItem.kind) || 'video'
  const title = workItem.title || workItem.name || 'Untitled'
  const authorName = resolveOwnerLabel(workItem)

  const typeLabel =
    category === 'presentation' ? 'Presentation' : category === 'image' ? 'Image' : 'Video'

  const renderIcon = () => {
    if (category === 'presentation') return <MdSlideshow size={22} className="row-icon-ppt" />
    if (category === 'image') return <MdImage size={22} className="row-icon-image" />
    return <MdVideoLibrary size={22} className="row-icon-video" />
  }

  return (
    <article
      className={`workspace-item-row export-item-row my-work-row work-row-${category}`}
      onClick={onPreview}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onPreview?.()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={`row-icon-container row-icon-wrap-${category}`} aria-hidden>
        {renderIcon()}
      </div>

      <div className="col col-name">
        <h4 title={title}>{title}</h4>
      </div>

      <div className="col col-type">
        <span className={`row-category-pill pill-${category}`}>{typeLabel}</span>
      </div>

      <div className="col col-workspace" title={workItem.workspaceName}>
        {workItem.workspaceName || 'Workspace'}
      </div>

      <div className="col col-completed">{formatOnlyDate(workItem.completedAt)}</div>

      <div className="col col-size">
        {category === 'presentation' && workItem.slideCount
          ? `${workItem.slideCount} slides`
          : category === 'image' && workItem.mode
            ? workItem.mode
            : workItem.fileSizeBytes
              ? formatBytes(workItem.fileSizeBytes)
              : '—'}
      </div>

      <div className="col col-rendered-by">
        <UserIdentity name={authorName} compact />
      </div>

      <div className="row-actions videos-export-row__actions">
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
    </article>
  )
}

export const ExportVideoRow = ExportMyWorkRow
export default ExportMyWorkRow
