import './skeleton.css'

export function SkeletonItemCard({ className = '', variant = 'default' }) {
  return (
    <article className={`workspace-item-card videos-export-card insta-skeleton-card ${className}`.trim()} aria-hidden>
      <div className="videos-export-card__thumb-btn">
        <div className="card-thumb-container video-thumb insta-skeleton-thumb">
          <div className="ps-block insta-skeleton-media-pulse" />
        </div>
      </div>

      <div className="workspace-item-meta videos-export-card__meta insta-skeleton-meta">
        <div className="meta-left" style={{ flex: 1 }}>
          <div className="ps-block insta-skeleton-line insta-skeleton-line--title" />
          <div className="insta-skeleton-user-row">
            <div className="ps-block insta-skeleton-avatar" />
            <div className="ps-block insta-skeleton-line insta-skeleton-line--name" />
          </div>
          <div className="meta-row-small insta-skeleton-meta-row">
            <div className="ps-block insta-skeleton-line insta-skeleton-line--tag" />
            <div className="ps-block insta-skeleton-line insta-skeleton-line--size" />
          </div>
        </div>
        <div className="videos-export-card__actions">
          <div className="ps-block insta-skeleton-btn-pulse" />
        </div>
      </div>
    </article>
  )
}

export function SkeletonCreateCard({ className = '' }) {
  return (
    <article className={`workspace-item-card insta-skeleton-card ${className}`.trim()} aria-hidden>
      <div className="card-thumb-container video-thumb insta-skeleton-thumb">
        <div className="ps-block insta-skeleton-media-pulse" />
      </div>
    </article>
  )
}

export function SkeletonListHeader({ className = 'export-list-header' }) {
  return (
    <div className={`workspace-item-row export-list-header ${className}`.trim()} aria-hidden>
      <div style={{ width: 44 }} />
      <div className="col col-name">ITEM NAME</div>
      <div className="col col-workspace">WORKSPACE</div>
      <div className="col col-completed">COMPLETED</div>
      <div className="col col-size">SIZE</div>
      <div className="col col-rendered-by">CREATED BY</div>
      <div className="row-actions">ACTIONS</div>
    </div>
  )
}

export function SkeletonListRow({ className = 'export-item-row' }) {
  return (
    <article className={`workspace-item-row export-item-row insta-skeleton-row ${className}`.trim()} aria-hidden>
      <div className="row-icon-container">
        <div className="ps-block insta-skeleton-icon-pulse" />
      </div>

      <div className="col col-name">
        <div className="ps-block insta-skeleton-line insta-skeleton-line--title" />
      </div>

      <div className="col col-workspace">
        <div className="ps-block insta-skeleton-line insta-skeleton-line--tag" />
      </div>

      <div className="col col-completed">
        <div className="ps-block insta-skeleton-line insta-skeleton-line--size" />
      </div>

      <div className="col col-size">
        <div className="ps-block insta-skeleton-line insta-skeleton-line--size" />
      </div>

      <div className="col col-rendered-by">
        <div className="insta-skeleton-user-row">
          <div className="ps-block insta-skeleton-avatar" />
          <div className="ps-block insta-skeleton-line insta-skeleton-line--name" />
        </div>
      </div>

      <div className="row-actions videos-export-row__actions">
        <div className="ps-block insta-skeleton-btn-pulse" />
      </div>
    </article>
  )
}

export function SkeletonSectionHeader({ title = 'Workspace Section', withAction = false }) {
  return (
    <div className="section-header-compact">
      <div className="section-header-left">
        <h3 className="section-header-title">{title}</h3>
      </div>
      {withAction ? <div className="ps-block insta-skeleton-line" style={{ width: 100, height: 32 }} aria-hidden /> : null}
    </div>
  )
}

export function SkeletonTab({ active = false, className = 'workspace-root-tab' }) {
  return (
    <div className={`workspace-root-tab ${active ? 'active' : ''} ${className}`.trim()} aria-hidden>
      <div className="ps-block insta-skeleton-line" style={{ width: 60, height: 16 }} />
    </div>
  )
}

export function SkeletonTemplateCard() {
  return (
    <article className="workspace-item-card insta-skeleton-card" aria-hidden>
      <div className="ps-block insta-skeleton-media-pulse" style={{ minHeight: 160 }} />
      <div className="workspace-item-meta" style={{ padding: 12 }}>
        <div className="ps-block insta-skeleton-line insta-skeleton-line--title" />
        <div className="ps-block insta-skeleton-line insta-skeleton-line--name" />
      </div>
    </article>
  )
}

export function SkeletonProjectCard() {
  return (
    <div className="project-card insta-skeleton-card" aria-hidden>
      <div className="project-thumb-container">
        <div className="ps-block insta-skeleton-media-pulse" />
      </div>
      <div className="project-content">
        <div className="ps-block insta-skeleton-line insta-skeleton-line--title" />
      </div>
    </div>
  )
}

export function SkeletonMediaCollection({
  viewMode = 'grid',
  showCreateCard = false,
  createCardClassName = '',
  itemsClassName = 'items-container videos-export-items',
  extraItemsClassName = '',
  cardCount = 8,
  listHeaderClassName = 'export-list-header',
  listRowClassName = 'export-item-row',
  ariaLabel = 'Loading',
}) {
  const isGrid = viewMode === 'grid'

  return (
    <div
      className={`${itemsClassName} ${isGrid ? 'tile-view' : 'list-view export-list-view'} ${extraItemsClassName}`.trim()}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {!isGrid ? <SkeletonListHeader className={listHeaderClassName} /> : null}
      {showCreateCard && isGrid ? (
        <SkeletonCreateCard className={createCardClassName} />
      ) : null}
      {isGrid
        ? Array.from({ length: cardCount }, (_, index) => <SkeletonItemCard key={index} />)
        : Array.from({ length: cardCount }, (_, index) => (
            <SkeletonListRow key={index} className={listRowClassName} />
          ))}
    </div>
  )
}

export function SkeletonWorkspaceItems({
  viewMode = 'tile',
  cardCount = 4,
  listHeaderClassName = '',
  cardVariant = 'workspace',
}) {
  const isGrid = viewMode === 'tile'

  return (
    <div className={`items-container ${isGrid ? 'tile-view' : 'list-view'}`.trim()}>
      {!isGrid ? <SkeletonListHeader className={listHeaderClassName || 'list-header'} /> : null}
      {isGrid
        ? Array.from({ length: cardCount }, (_, index) => (
            <SkeletonItemCard key={index} variant={cardVariant} />
          ))
        : Array.from({ length: cardCount }, (_, index) => (
            <SkeletonListRow key={index} className="workspace-item-row" />
          ))}
    </div>
  )
}
