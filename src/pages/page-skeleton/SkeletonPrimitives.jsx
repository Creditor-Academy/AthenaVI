import './skeleton.css'

export function SkeletonItemCard({ className = '', variant = 'default' }) {
  if (variant === 'workspace') {
    return (
      <article className={`wsc-card wsc-workspace-card wsc-skeleton-card ${className}`.trim()} aria-hidden>
        <div className="wsc-workspace-card__header wsc-skeleton-header">
          <div className="ps-block wsc-skeleton-orb" />
          <div className="ps-block wsc-skeleton-role-pill" />
        </div>
        <div className="wsc-workspace-card__body">
          <div className="ps-block wsc-skeleton-meta-date" />
          <div className="ps-block wsc-skeleton-line wsc-skeleton-line--title" />
          <div className="wsc-workspace-card__footer">
            <div className="wsc-skeleton-avatar-row">
              <div className="ps-block wsc-skeleton-avatar" />
              <div className="ps-block wsc-skeleton-avatar" />
            </div>
            <div className="ps-block wsc-skeleton-badge-pill" />
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'folder') {
    return (
      <div className={`wsc-card wsc-folder-card wsc-skeleton-card ${className}`.trim()} aria-hidden>
        <div className="wsc-folder-card__thumb wsc-skeleton-thumb">
          <div className="ps-block wsc-skeleton-folder-icon" />
        </div>
        <div className="wsc-folder-card__meta">
          <div className="wsc-folder-card__info">
            <div className="ps-block wsc-skeleton-line wsc-skeleton-line--title" />
            <div className="wsc-folder-card__byline">
              <div className="ps-block wsc-skeleton-byline-item" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className={`wsc-card wsc-video-card videos-export-card wsc-skeleton-card ${className}`.trim()} aria-hidden>
      <div className="wsc-video-card__thumb wsc-skeleton-thumb-wrap">
        <div className="ps-block wsc-skeleton-thumb-media" />
        <div className="ps-block wsc-skeleton-kind-badge" />
      </div>

      <div className="wsc-video-card__meta wsc-skeleton-meta">
        <div className="wsc-video-card__info">
          <div className="wsc-video-card__title-row">
            <div className="ps-block wsc-skeleton-line wsc-skeleton-line--title" />
            <div className="ps-block wsc-skeleton-capsule" />
          </div>
          <div className="wsc-video-card__byline">
            <div className="ps-block wsc-skeleton-byline-item" />
            <span className="wsc-card__dot" style={{ opacity: 0.35 }}>·</span>
            <div className="ps-block wsc-skeleton-byline-item wsc-skeleton-byline-item--short" />
          </div>
        </div>
      </div>
    </article>
  )
}

export function SkeletonCreateCard({ className = '' }) {
  return (
    <article className={`wsc-card wsc-create-card wsc-skeleton-card ${className}`.trim()} aria-hidden>
      <div className="ps-block wsc-skeleton-create-inner" />
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
    <article className={`workspace-item-row export-item-row wsc-skeleton-row ${className}`.trim()} aria-hidden>
      <div className="row-icon-container">
        <div className="ps-block wsc-skeleton-icon-pulse" />
      </div>

      <div className="col col-name">
        <div className="ps-block wsc-skeleton-line wsc-skeleton-line--title" />
      </div>

      <div className="col col-workspace">
        <div className="ps-block wsc-skeleton-line wsc-skeleton-line--tag" />
      </div>

      <div className="col col-completed">
        <div className="ps-block wsc-skeleton-line wsc-skeleton-line--size" />
      </div>

      <div className="col col-size">
        <div className="ps-block wsc-skeleton-line wsc-skeleton-line--size" />
      </div>

      <div className="col col-rendered-by">
        <div className="wsc-skeleton-user-row">
          <div className="ps-block wsc-skeleton-avatar" />
          <div className="ps-block wsc-skeleton-line wsc-skeleton-line--name" />
        </div>
      </div>

      <div className="row-actions videos-export-row__actions">
        <div className="ps-block wsc-skeleton-btn-pulse" />
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
      {withAction ? <div className="ps-block wsc-skeleton-line" style={{ width: 100, height: 32 }} aria-hidden /> : null}
    </div>
  )
}

export function SkeletonTab({ active = false, className = 'workspace-root-tab' }) {
  return (
    <div className={`workspace-root-tab ${active ? 'active' : ''} ${className}`.trim()} aria-hidden>
      <div className="ps-block wsc-skeleton-line" style={{ width: 60, height: 16 }} />
    </div>
  )
}

export function SkeletonTemplateCard() {
  return (
    <article className="wsc-card wsc-skeleton-card" aria-hidden>
      <div className="ps-block wsc-skeleton-thumb-media" style={{ aspectRatio: '16 / 9' }} />
      <div className="wsc-video-card__meta" style={{ padding: 12 }}>
        <div className="ps-block wsc-skeleton-line wsc-skeleton-line--title" />
        <div className="ps-block wsc-skeleton-line wsc-skeleton-line--name" />
      </div>
    </article>
  )
}

export function SkeletonProjectCard() {
  return (
    <div className="wsc-card wsc-skeleton-card" aria-hidden>
      <div className="wsc-video-card__thumb">
        <div className="ps-block wsc-skeleton-thumb-media" />
      </div>
      <div className="wsc-video-card__meta">
        <div className="ps-block wsc-skeleton-line wsc-skeleton-line--title" />
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
  const isGrid = viewMode === 'grid' || viewMode === 'tile'

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
  const isGrid = viewMode === 'tile' || viewMode === 'grid'

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

