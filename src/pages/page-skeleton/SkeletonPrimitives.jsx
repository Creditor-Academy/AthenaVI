import './skeleton.css'

export function SkeletonItemCard({ className = '' }) {
  return (
    <article className={`ps-skeleton-card workspace-item-card ${className}`.trim()} aria-hidden>
      <div className="ps-block ps-skeleton-card__thumb" />
      <div className="ps-block ps-skeleton-card__meta" />
    </article>
  )
}

export function SkeletonCreateCard({ className = '' }) {
  return (
    <article
      className={`ps-skeleton-card ps-skeleton-create-card workspace-item-card ${className}`.trim()}
      aria-hidden
    >
      <div className="ps-block ps-skeleton-create-card__body" />
    </article>
  )
}

export function SkeletonListHeader({ className = 'export-list-header' }) {
  return (
    <div className={`ps-block ps-skeleton-list-header list-header ${className}`.trim()} aria-hidden />
  )
}

export function SkeletonListRow({ className = 'export-item-row' }) {
  return (
    <div
      className={`ps-block ps-skeleton-list-row workspace-item-row ${className}`.trim()}
      aria-hidden
    />
  )
}

export function SkeletonSectionHeader({ withAction = false }) {
  return (
    <div className="section-header-compact">
      <div className="ps-block ps-skeleton-section-title" aria-hidden />
      {withAction ? <div className="ps-block ps-skeleton-section-action" aria-hidden /> : null}
    </div>
  )
}

export function SkeletonTab({ active = false, className = 'workspace-root-tab' }) {
  return (
    <div
      className={`ps-block ps-skeleton-tab ${className} ${active ? 'active' : ''}`.trim()}
      aria-hidden
    />
  )
}

export function SkeletonTemplateCard() {
  return (
    <article className="ps-skeleton-card template-card-premium" aria-hidden>
      <div className="ps-block ps-skeleton-template-card__thumb" />
      <div className="ps-block ps-skeleton-template-card__meta" />
    </article>
  )
}

export function SkeletonProjectCard() {
  return (
    <div className="project-card project-card--skeleton" aria-hidden>
      <div className="project-thumb-container">
        <div className="ps-block ps-skeleton-card__thumb" />
      </div>
      <div className="project-content">
        <div className="ps-block ps-skeleton-project-card__meta" />
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
}) {
  const isGrid = viewMode === 'tile'

  return (
    <div className={`items-container ${isGrid ? 'tile-view' : 'list-view'}`.trim()}>
      {!isGrid ? <SkeletonListHeader className={listHeaderClassName || 'list-header'} /> : null}
      {isGrid
        ? Array.from({ length: cardCount }, (_, index) => <SkeletonItemCard key={index} />)
        : Array.from({ length: cardCount }, (_, index) => (
            <SkeletonListRow key={index} className="workspace-item-row" />
          ))}
    </div>
  )
}
