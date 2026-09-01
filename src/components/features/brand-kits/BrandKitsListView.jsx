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
  workspaces = [],
  workspaceId = null,
  onWorkspaceChange,
  menuOpen,
  setMenuOpen,
  setMenuRef,
  openEdit,
  handleSetDefault,
  settingDefaultId,
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
            {workspaces.length > 0 && (
              <label className="bk-workspace-select">
                <span className="bk-workspace-select-label">Workspace</span>
                <select
                  value={workspaceId || ''}
                  onChange={(e) => onWorkspaceChange?.(e.target.value)}
                  aria-label="Brand kit workspace"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                      {ws.isPersonal ? ' (Personal)' : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
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
                  {canWrite
                    ? 'Create a Brand Kit in this workspace with colors, fonts, logos, and voice — then apply it to presentations here.'
                    : 'No brand kits in this workspace yet. Ask an owner or admin to create one.'}
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
                      settingDefault={String(settingDefaultId) === String(kit.id)}
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
