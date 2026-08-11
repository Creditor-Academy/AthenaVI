import {
  MdAdd,
  MdGridView,
  MdViewList,
  MdPalette,
  MdInfoOutline,
} from 'react-icons/md'
import KitCard from './KitCard'
import BrandKitsSkeleton from '../../../pages/page-skeleton/BrandKitsSkeleton'

export default function BrandKitsListView({
  viewMode,
  setViewMode,
  canWrite,
  openCreate,
  error,
  brandKits,
  loading = false,
  menuOpen,
  setMenuOpen,
  setMenuRef,
  openEdit,
  handleSetDefault,
  handleCopyId,
  handleDelete,
}) {
  return (
    <div className="videos-page brandkits-page">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">Brand Kits</h1>
            <p className="videos-page-subtitle">
              Define colors, fonts, voice, and logos once — then apply them across AI presentations
              and deck packs.
            </p>
          </div>
          <div className="videos-actions">
            <div className="view-toggle">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-pressed={viewMode === 'list'}
              >
                <MdViewList size={18} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <MdGridView size={18} />
              </button>
            </div>
            {canWrite && (
              <button type="button" className="btn-primary videos-create-btn" onClick={openCreate}>
                <MdAdd size={18} />
                Create Brand Kit
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="bk-error-banner" role="alert">
            <MdInfoOutline size={18} />
            <span>{error}</span>
          </div>
        )}
        {!loading && !canWrite && (
          <div className="bk-info-banner">
            <MdInfoOutline size={16} />
            View only — ask an owner or admin to create or edit brand kits.
          </div>
        )}

        <div className="brandkits-main-grid">
          <div className="brandkits-content-col" style={{ width: '100%' }}>
            {loading ? (
              <BrandKitsSkeleton />
            ) : brandKits.length === 0 ? (
              <div className="bk-empty-card">
                <div className="bk-empty-icon-badge">
                  <MdPalette size={38} />
                </div>
                <h2 className="bk-empty-title">No brand kits yet</h2>
                <p className="bk-empty-desc">
                  Create a Brand Kit with colors, fonts, logos, and voice to keep every presentation
                  on-brand.
                </p>
                {canWrite && (
                  <button type="button" className="bk-empty-create-btn" onClick={openCreate}>
                    <MdAdd size={18} />
                    Create Brand Kit
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="section-label">
                  {brandKits.length} brand kit{brandKits.length === 1 ? '' : 's'}
                </p>
                <div className={viewMode === 'grid' ? 'brandkits-grid' : 'brandkits-list'}>
                  {brandKits.map((kit, index) => (
                    <KitCard
                      key={kit.id}
                      kit={kit}
                      index={index}
                      canWrite={canWrite}
                      menuOpen={menuOpen}
                      setMenuOpen={setMenuOpen}
                      setMenuRef={setMenuRef}
                      onEdit={openEdit}
                      onSetDefault={handleSetDefault}
                      onCopyId={handleCopyId}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
