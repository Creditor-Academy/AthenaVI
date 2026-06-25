import { useCallback, useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, X, Shield } from 'lucide-react'
import superadminService, { SuperadminApiError } from '../../../../services/superadminService'
import { formatAc, formatDate, formatShortDate, txTypeLabel, formatBytes, storageTxTypeLabel } from './superadminUtils'
import { useAuth } from '../../../../contexts/AuthContext'
import '../../../../pages/AdminPortal/SuperadminPortal.css'
import '../../../../pages/page-skeleton/skeleton.css'

/* ─── skeletons ───────────────────────────────── */
function Sk({ w, h = 14, radius = 6, style }) {
  return <div className="ps-block ps-block--line" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }} />
}
function TableSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 130px', gap: 16, padding: '13px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="ps-block" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
        <Sk w="55%" h={11} />
      </div>
      <Sk w="70%" h={10} />
      <Sk w={70} h={10} style={{ marginLeft: 'auto' }} />
    </div>
  ))
}
function DrawerSkeleton() {
  return (
    <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="ps-block" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Sk w={150} h={14} radius={6} />
          <Sk w={200} h={10} />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => <Sk key={i} w={`${80 - i * 8}%`} h={11} />)}
    </div>
  )
}

/* ─── credit action card ──────────────────────── */
function CreditActionCard({ mode, onSubmit, loading, disabled }) {
  const isGrant = mode === 'grant'
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [showReason, setShowReason] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const parsed = parseInt(amount, 10)
    if (!parsed || parsed <= 0) return
    const ok = await onSubmit({ amount: parsed, reason: reason.trim() || undefined })
    if (ok) { setAmount(''); setReason(''); setShowReason(false) }
  }
  return (
    <div className={`sa-action-card sa-action-card--${mode}`}>
      <div className="sa-action-card-head">
        <span className={`sa-action-card-dot sa-action-card-dot--${mode}`} aria-hidden />
        <span>{isGrant ? 'Grant Credits' : 'Revoke Credits'}</span>
      </div>
      <form className="sa-action-form" onSubmit={handleSubmit}>
        <div className="sa-field sa-field--inline">
          <input className="sa-input sa-input--amount" type="number" min="1" step="1"
            placeholder="Amount (AC)" value={amount} onChange={e => setAmount(e.target.value)}
            disabled={loading || disabled} required aria-label="Amount in AC" />
          <button type="submit" className={`sa-btn sa-btn--sm ${isGrant ? 'sa-btn--primary' : 'sa-btn--danger'}`}
            disabled={loading || disabled || !amount}>
            {loading ? '…' : isGrant ? 'Grant' : 'Revoke'}
          </button>
        </div>
        <button type="button" className="sa-reason-toggle" onClick={() => setShowReason(v => !v)}
          disabled={loading || disabled} aria-expanded={showReason}>
          {showReason ? '− Hide reason' : '+ Add reason'}
        </button>
        {showReason && (
          <textarea className="sa-reason-input" placeholder="e.g. Support adjustment, promo…"
            maxLength={500} value={reason} onChange={e => setReason(e.target.value)}
            disabled={loading || disabled} rows={2} />
        )}
      </form>
    </div>
  )
}

/* ─── right-side drawer ───────────────────────── */
function UserDrawer({ open, user, detail, history, historyPagination, historyPage, setHistoryPage, historyType, setHistoryType, detailLoading, detailError, actionLoading, actionMessage, actionError, onCreditAction, onClose, onPlatformAccessChange, currentUserId }) {
  const [activeTab, setActiveTab] = useState('profile')

  // storage state
  const [storage, setStorage]           = useState(null)
  const [storageLoading, setStorageLoading] = useState(false)
  const [storageError, setStorageError]     = useState('')
  const [storageMsg, setStorageMsg]         = useState('')
  const [storageActionLoading, setStorageActionLoading] = useState(false)
  const [grantBytes, setGrantBytes]     = useState('')
  const [revokeBytes, setRevokeBytes]   = useState('')
  const [storageReason, setStorageReason] = useState('')
  const [storageTiers, setStorageTiers] = useState([])
  const [selectedTierId, setSelectedTierId] = useState('')
  const [storageHistory, setStorageHistory] = useState([])
  const [storageHistoryPage, setStorageHistoryPage] = useState(1)
  const [storageHistoryPagination, setStorageHistoryPagination] = useState({ page: 1, totalPages: 1 })
  const [platformAccessLoading, setPlatformAccessLoading] = useState(false)
  const [platformAccessError, setPlatformAccessError] = useState('')
  const [isSuperadmin, setIsSuperadmin] = useState(Boolean(user?.isPlatformSuperadmin))

  useEffect(() => {
    if (open) {
      setActiveTab('profile')
      setStorage(null)
      setStorageMsg('')
      setStorageError('')
      setPlatformAccessError('')
      setIsSuperadmin(Boolean(user?.isPlatformSuperadmin))
      setStorageHistory([])
      setStorageHistoryPage(1)
    }
  }, [open, user?.id, user?.isPlatformSuperadmin])

  // load storage when tab is opened
  useEffect(() => {
    if (activeTab !== 'storage' || !user?.id || storage) return
    setStorageLoading(true)
    setStorageError('')
    Promise.all([
      superadminService.getUserStorage(user.id),
      superadminService.getStorageTiers(),
    ])
      .then(([data, tiersData]) => {
        setStorage(data)
        setStorageTiers(tiersData.tiers || [])
      })
      .catch(err => setStorageError(err.message || 'Failed to load storage'))
      .finally(() => setStorageLoading(false))
  }, [activeTab, user?.id, storage])

  useEffect(() => {
    if (activeTab !== 'storage' || !user?.id) return
    superadminService.getUserStorageHistory(user.id, { page: storageHistoryPage, limit: 10 })
      .then((data) => {
        const hist = data.history || data
        setStorageHistory(hist.transactions || [])
        setStorageHistoryPagination(hist.pagination || { page: 1, totalPages: 1 })
      })
      .catch(() => setStorageHistory([]))
  }, [activeTab, user?.id, storageHistoryPage])

  const handlePlatformAccessToggle = async () => {
    if (!user?.id) return
    const next = !isSuperadmin
    setPlatformAccessLoading(true)
    setPlatformAccessError('')
    try {
      await superadminService.updateUserPlatformAccess(user.id, { isPlatformSuperadmin: next })
      setIsSuperadmin(next)
      onPlatformAccessChange?.(user.id, next)
    } catch (err) {
      setPlatformAccessError(err.message || 'Failed to update platform access')
    } finally {
      setPlatformAccessLoading(false)
    }
  }

  const handleTierGrant = async (e) => {
    e.preventDefault()
    if (!selectedTierId) return
    setStorageActionLoading(true); setStorageMsg(''); setStorageError('')
    try {
      const result = await superadminService.grantUserStorage(user.id, {
        tierId: selectedTierId,
        reason: storageReason.trim() || undefined,
      })
      setStorageMsg(`Set tier limit to ${formatBytes(result.user?.storageLimit)}`)
      setSelectedTierId('')
      const fresh = await superadminService.getUserStorage(user.id)
      setStorage(fresh)
    } catch (err) { setStorageError(err.message || 'Grant failed') }
    finally { setStorageActionLoading(false) }
  }

  const handleStorageGrant = async (e) => {
    e.preventDefault()
    const bytes = parseInt(grantBytes, 10)
    if (!bytes || bytes <= 0) return
    setStorageActionLoading(true); setStorageMsg(''); setStorageError('')
    try {
      const result = await superadminService.grantUserStorage(user.id, { additionalBytes: bytes, reason: storageReason.trim() || undefined })
      setStorageMsg(`Granted ${formatBytes(bytes)}. New limit: ${formatBytes(result.storageLimit ?? result.user?.storageLimit)}`)
      setGrantBytes(''); setStorageReason('')
      const fresh = await superadminService.getUserStorage(user.id)
      setStorage(fresh)
    } catch (err) { setStorageError(err.message || 'Grant failed') }
    finally { setStorageActionLoading(false) }
  }

  const handleStorageRevoke = async (e) => {
    e.preventDefault()
    const bytes = parseInt(revokeBytes, 10)
    if (!bytes || bytes <= 0) return
    setStorageActionLoading(true); setStorageMsg(''); setStorageError('')
    try {
      const result = await superadminService.revokeUserStorage(user.id, { amountBytes: bytes, reason: storageReason.trim() || undefined })
      setStorageMsg(`Revoked ${formatBytes(bytes)}. New limit: ${formatBytes(result.storageLimit ?? result.user?.storageLimit)}`)
      setRevokeBytes(''); setStorageReason('')
      const fresh = await superadminService.getUserStorage(user.id)
      setStorage(fresh)
    } catch (err) { setStorageError(err.message || 'Revoke failed') }
    finally { setStorageActionLoading(false) }
  }

  return (
    <>
      {/* backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          aria-hidden
        />
      )}

      {/* drawer panel */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 460,
        maxWidth: '92vw',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-color)',
        boxShadow: '-12px 0 48px rgba(0,0,0,0.18)',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
      }}
        role="dialog"
        aria-modal="true"
        aria-label="User details"
      >
        {/* Drawer header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'var(--primary-muted, rgba(59,130,246,0.15))',
            color: 'var(--primary, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 700,
          }}>
            {(detail?.name || user?.name || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {detail?.name || user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {detail?.email || user?.email}
            </div>
          </div>
          <div className="sa-stat-pill" style={{ flexShrink: 0 }}>
            <span className="sa-stat-pill-label">Balance</span>
            <span className="sa-stat-pill-value">{formatAc(detail?.personalCredits)}</span>
          </div>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        {detailLoading && !detail ? <DrawerSkeleton /> : detailError ? (
          <div style={{ padding: 20 }}><div className="sa-alert sa-alert--error">{detailError}</div></div>
        ) : (
          <>
            {/* Tab bar */}
            <div className="sa-tab-bar" role="tablist" style={{ flexShrink: 0 }}>
              {[{ id: 'profile', label: 'Profile' }, { id: 'credits', label: 'Credits' }, { id: 'history', label: 'History' }, { id: 'storage', label: 'Storage' }].map(tab => (
                <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id}
                  className={`sa-tab ${activeTab === tab.id ? 'sa-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)' }}>

              {activeTab === 'profile' && (
                <div className="sa-tab-pane">
                  <div className="sa-profile-stats">
                    <div className="sa-profile-stat"><span>Balance</span><strong style={{ color: 'var(--primary)' }}>{formatAc(detail?.personalCredits)}</strong></div>
                    <div className="sa-profile-stat-divider" />
                    <div className="sa-profile-stat"><span>Since</span><strong>{user?.createdAt ? formatShortDate(user.createdAt) : '—'}</strong></div>
                    <div className="sa-profile-stat-divider" />
                    <div className="sa-profile-stat"><span>Role</span><strong>{isSuperadmin ? 'Superadmin' : 'User'}</strong></div>
                  </div>
                  {platformAccessError && <div className="sa-alert sa-alert--error">{platformAccessError}</div>}
                  <div className="sa-action-card" style={{ marginTop: 16, padding: '0 0 12px' }}>
                    <div className="sa-action-card-head" style={{ justifyContent: 'space-between', padding: '12px 12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Shield size={14} />
                        <span>Platform superadmin access</span>
                      </div>
                      <span className={`sa-badge ${isSuperadmin ? 'sa-badge--admin' : 'sa-badge--type'}`}>
                        {isSuperadmin ? 'Granted' : 'Not granted'}
                      </span>
                    </div>
                    <p style={{ margin: '0 12px 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Grants access to this admin portal. Env allowlist emails retain access independently.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px' }}>
                      <button
                        type="button"
                        className={`sa-btn sa-btn--sm ${isSuperadmin ? 'sa-btn--danger' : 'sa-btn--primary'}`}
                        disabled={platformAccessLoading || (user?.id === currentUserId && isSuperadmin)}
                        onClick={handlePlatformAccessToggle}
                      >
                        {platformAccessLoading ? 'Updating…' : isSuperadmin ? 'Revoke superadmin' : 'Grant superadmin'}
                      </button>
                    </div>
                    {user?.id === currentUserId && isSuperadmin && (
                      <p style={{ margin: '8px 12px 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        You cannot demote yourself.
                      </p>
                    )}
                  </div>
                  <div className="sa-profile-grid">
                    <div className="sa-profile-item"><span>Full name</span><strong>{detail?.name || '—'}</strong></div>
                    <div className="sa-profile-item"><span>Email</span><strong style={{ wordBreak: 'break-all' }}>{detail?.email || '—'}</strong></div>
                    <div className="sa-profile-item"><span>Joined</span><strong>{user?.createdAt ? formatDate(user.createdAt) : '—'}</strong></div>
                    <div className="sa-profile-item"><span>User ID</span><strong style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{detail?.userId || user?.id || '—'}</strong></div>
                  </div>
                </div>
              )}

              {activeTab === 'credits' && (
                <div className="sa-tab-pane">
                  {actionMessage && <div className="sa-alert sa-alert--success">{actionMessage}</div>}
                  {actionError   && <div className="sa-alert sa-alert--error">{actionError}</div>}
                  <div className="sa-action-row">
                    <CreditActionCard mode="grant"  loading={actionLoading} onSubmit={p => onCreditAction('grant', p)} />
                    <CreditActionCard mode="revoke" loading={actionLoading} disabled={!detail?.personalCredits} onSubmit={p => onCreditAction('revoke', p)} />
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="sa-tab-pane">
                  <div className="sa-history-toolbar">
                    <span className="sa-section-label" style={{ margin: 0 }}>
                      Transactions
                      {history.length > 0 && <span className="sa-card-header-count" style={{ marginLeft: 8 }}>{history.length}</span>}
                    </span>
                    <select className="sa-select" value={historyType}
                      onChange={e => { setHistoryType(e.target.value); setHistoryPage(1) }} aria-label="Filter type">
                      <option value="">All types</option>
                      <option value="platform_grant">Platform grant</option>
                      <option value="platform_revoke">Platform revoke</option>
                      <option value="usage">Usage</option>
                      <option value="allocation">Allocation</option>
                      <option value="deallocation">Deallocation</option>
                      <option value="refund">Refund</option>
                    </select>
                  </div>
                  {history.length === 0 ? (
                    <div className="sa-empty" style={{ padding: '32px 0' }}>No transactions yet.</div>
                  ) : (
                    <div className="sa-tx-feed">
                      {history.map(tx => {
                        const isPos = tx.amount > 0
                        const typeColors = {
                          platform_grant: { bg: '#22c55e', label: 'Grant' },
                          platform_revoke:{ bg: '#ef4444', label: 'Revoke' },
                          usage:          { bg: '#f59e0b', label: 'Usage' },
                          allocation:     { bg: '#38bdf8', label: 'Allocation' },
                          deallocation:   { bg: '#a78bfa', label: 'Dealloc' },
                          refund:         { bg: '#34d399', label: 'Refund' },
                        }
                        const tc = typeColors[tx.type] || { bg: 'var(--text-muted)', label: txTypeLabel(tx.type) }
                        return (
                          <div key={tx.id} className="sa-tx-row">
                            <div className="sa-tx-dot" style={{ background: `color-mix(in srgb, ${tc.bg} 20%, var(--bg-card))`, borderColor: `color-mix(in srgb, ${tc.bg} 35%, var(--border-color))` }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: tc.bg }} />
                            </div>
                            <div className="sa-tx-body">
                              <div className="sa-tx-top">
                                <span className="sa-tx-type" style={{ color: tc.bg }}>{tc.label}</span>
                                <span className="sa-tx-ref">{tx.reference || tx.metadata?.reason || '—'}</span>
                              </div>
                              <div className="sa-tx-bottom">
                                <span className="sa-tx-date">{formatDate(tx.createdAt)}</span>
                              </div>
                            </div>
                            <span className={`sa-tx-amount ${isPos ? 'sa-amount--positive' : 'sa-amount--negative'}`}>
                              {isPos ? '+' : ''}{formatAc(tx.amount)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {historyPagination.totalPages > 1 && (
                    <div className="sa-pagination" style={{ marginTop: 12, border: '1px solid var(--border-color)', borderRadius: 8 }}>
                      <span>Page {historyPagination.page} of {historyPagination.totalPages}</span>
                      <div className="sa-toolbar">
                        <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={historyPage <= 1} onClick={() => setHistoryPage(p => p - 1)}><ChevronLeft size={14} /></button>
                        <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={historyPage >= historyPagination.totalPages} onClick={() => setHistoryPage(p => p + 1)}><ChevronRight size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="sa-tab-pane">
                  {storageMsg   && <div className="sa-alert sa-alert--success">{storageMsg}</div>}
                  {storageError && <div className="sa-alert sa-alert--error">{storageError}</div>}

                  {/* Storage usage summary */}
                  {storageLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                      <Sk w="60%" h={12} /><Sk w="40%" h={10} /><Sk w="80%" h={8} radius={4} />
                    </div>
                  ) : storage ? (
                    <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px 18px', marginBottom: 20, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Storage Usage</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatBytes(storage.usedBytes ?? storage.storageUsed ?? 0)} / {formatBytes(storage.limitBytes ?? storage.storageLimit ?? 0)}
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, ((storage.usedBytes ?? storage.storageUsed ?? 0) / (storage.limitBytes ?? storage.storageLimit ?? 1)) * 100)}%`,
                          background: 'var(--primary, #3b82f6)',
                          borderRadius: 999,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {storage.tier?.label ? `Tier: ${storage.tier.label} · ` : ''}
                        {formatBytes((storage.limitBytes ?? storage.storageLimit ?? 0) - (storage.usedBytes ?? storage.storageUsed ?? 0))} free
                      </div>
                      {storage.activeUpgradeRequest && (
                        <div className="sa-alert" style={{ marginTop: 10, fontSize: '0.75rem' }}>
                          Pending upgrade request: +{formatBytes(storage.activeUpgradeRequest.requestedAdditionalBytes)}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {storageTiers.length > 0 && (
                    <form onSubmit={handleTierGrant} style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                        Set tier preset
                      </label>
                      <div className="sa-field sa-field--inline">
                        <select className="sa-select" value={selectedTierId} onChange={(e) => setSelectedTierId(e.target.value)} disabled={storageActionLoading} style={{ flex: 1 }}>
                          <option value="">Select tier…</option>
                          {storageTiers.map((tier) => (
                            <option key={tier.id} value={tier.id}>{tier.label} ({formatBytes(tier.limitBytes)})</option>
                          ))}
                        </select>
                        <button type="submit" className="sa-btn sa-btn--sm sa-btn--primary" disabled={storageActionLoading || !selectedTierId}>
                          Apply
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Shared reason field */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                      Reason (optional)
                    </label>
                    <input
                      className="sa-input"
                      style={{ width: '100%' }}
                      type="text"
                      placeholder="e.g. Plan upgrade, admin override…"
                      value={storageReason}
                      onChange={e => setStorageReason(e.target.value)}
                      disabled={storageActionLoading}
                    />
                  </div>

                  {/* Grant / revoke row */}
                  <div className="sa-action-row">
                    {/* Grant */}
                    <div className="sa-action-card sa-action-card--grant">
                      <div className="sa-action-card-head">
                        <span className="sa-action-card-dot sa-action-card-dot--grant" aria-hidden />
                        <span>Grant Storage</span>
                      </div>
                      <form className="sa-action-form" onSubmit={handleStorageGrant}>
                        <div className="sa-field sa-field--inline">
                          <input
                            className="sa-input sa-input--amount"
                            type="number" min="1" step="1"
                            placeholder="Bytes"
                            value={grantBytes}
                            onChange={e => setGrantBytes(e.target.value)}
                            disabled={storageActionLoading}
                            required
                            aria-label="Bytes to grant"
                          />
                          <button type="submit" className="sa-btn sa-btn--sm sa-btn--primary"
                            disabled={storageActionLoading || !grantBytes}>
                            {storageActionLoading ? '…' : 'Grant'}
                          </button>
                        </div>
                        {grantBytes > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            ≈ {formatBytes(parseInt(grantBytes, 10))}
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Revoke */}
                    <div className="sa-action-card sa-action-card--revoke">
                      <div className="sa-action-card-head">
                        <span className="sa-action-card-dot sa-action-card-dot--revoke" aria-hidden />
                        <span>Revoke Storage</span>
                      </div>
                      <form className="sa-action-form" onSubmit={handleStorageRevoke}>
                        <div className="sa-field sa-field--inline">
                          <input
                            className="sa-input sa-input--amount"
                            type="number" min="1" step="1"
                            placeholder="Bytes"
                            value={revokeBytes}
                            onChange={e => setRevokeBytes(e.target.value)}
                            disabled={storageActionLoading}
                            required
                            aria-label="Bytes to revoke"
                          />
                          <button type="submit" className="sa-btn sa-btn--sm sa-btn--danger"
                            disabled={storageActionLoading || !revokeBytes}>
                            {storageActionLoading ? '…' : 'Revoke'}
                          </button>
                        </div>
                        {revokeBytes > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            ≈ {formatBytes(parseInt(revokeBytes, 10))}
                          </div>
                        )}
                      </form>
                    </div>
                  </div>

                  {storageHistory.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <span className="sa-section-label">Storage ledger</span>
                      <div className="sa-tx-feed" style={{ marginTop: 8 }}>
                        {storageHistory.map((tx) => (
                          <div key={tx.id} className="sa-tx-row">
                            <div className="sa-tx-body">
                              <div className="sa-tx-top">
                                <span className="sa-tx-type">{storageTxTypeLabel(tx.type)}</span>
                                <span className="sa-tx-ref">{tx.reference || '—'}</span>
                              </div>
                              <div className="sa-tx-bottom"><span className="sa-tx-date">{formatDate(tx.createdAt)}</span></div>
                            </div>
                            <span className={`sa-tx-amount ${tx.type === 'platform_revoke' ? 'sa-amount--negative' : 'sa-amount--positive'}`}>
                              {tx.type === 'platform_revoke' ? '−' : '+'}{formatBytes(tx.amountBytes)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {storageHistoryPagination.totalPages > 1 && (
                        <div className="sa-pagination" style={{ marginTop: 8 }}>
                          <span>Page {storageHistoryPagination.page} of {storageHistoryPagination.totalPages}</span>
                          <div className="sa-toolbar">
                            <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={storageHistoryPage <= 1} onClick={() => setStorageHistoryPage((p) => p - 1)}><ChevronLeft size={14} /></button>
                            <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={storageHistoryPage >= storageHistoryPagination.totalPages} onClick={() => setStorageHistoryPage((p) => p + 1)}><ChevronRight size={14} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </>
  )
}

/* ─── main panel ──────────────────────────────── */
const PAGE_SIZE = 20

function SuperadminUsersPanel() {
  const { user: currentUser } = useAuth()
  const [users, setUsers]             = useState([])
  const [pagination, setPagination]   = useState({ page: 1, totalPages: 1, total: 0 })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError]     = useState('')

  const [selectedId, setSelectedId]   = useState(null)
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [detail, setDetail]           = useState(null)
  const [history, setHistory]         = useState([])
  const [historyPagination, setHistoryPagination] = useState({ page: 1, totalPages: 1 })
  const [historyPage, setHistoryPage] = useState(1)
  const [historyType, setHistoryType] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const loadUsers = useCallback(async () => {
    setListLoading(true); setListError('')
    try {
      const data = await superadminService.listUsers({ page, limit: PAGE_SIZE, search })
      setUsers(data.users || [])
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) { setListError(err.message || 'Failed to load users'); setUsers([]) }
    finally { setListLoading(false) }
  }, [page, search])

  const loadDetail = useCallback(async (userId) => {
    if (!userId) return
    setDetailLoading(true); setDetailError(''); setActionMessage(''); setActionError('')
    try {
      const [creditsData, historyData] = await Promise.all([
        superadminService.getUserCredits(userId),
        superadminService.getUserCreditHistory(userId, { page: historyPage, limit: PAGE_SIZE, type: historyType || undefined }),
      ])
      setDetail(creditsData)
      const hist = historyData.history || historyData
      setHistory(hist.transactions || [])
      setHistoryPagination(hist.pagination || { page: 1, totalPages: 1 })
    } catch (err) { setDetailError(err.message || 'Failed to load details'); setDetail(null); setHistory([]) }
    finally { setDetailLoading(false) }
  }, [historyPage, historyType])

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { loadUsers() }, [loadUsers])
  useEffect(() => { if (selectedId) loadDetail(selectedId) }, [selectedId, loadDetail])

  // close drawer on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const openDrawer = (userId) => {
    setSelectedId(userId)
    setHistoryPage(1)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => { setSelectedId(null); setDetail(null); setHistory([]) }, 300)
  }

  const handleCreditAction = async (mode, payload) => {
    if (!selectedId) return false
    setActionLoading(true); setActionError(''); setActionMessage('')
    try {
      const fn = mode === 'grant' ? superadminService.grantUserCredits : superadminService.revokeUserCredits
      const result = await fn(selectedId, payload)
      setActionMessage(
        mode === 'grant'
          ? `Granted ${formatAc(payload.amount)}. New balance: ${formatAc(result.user?.personalCredits)}`
          : `Revoked ${formatAc(payload.amount)}. New balance: ${formatAc(result.user?.personalCredits)}`
      )
      await loadDetail(selectedId); await loadUsers()
      return true
    } catch (err) {
      setActionError(err instanceof SuperadminApiError && err.status === 402 ? 'Insufficient credits.' : err.message || 'Action failed')
      return false
    } finally { setActionLoading(false) }
  }

  const handlePlatformAccessChange = (userId, isPlatformSuperadmin) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isPlatformSuperadmin } : u)))
  }

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <h2 className="sa-panel-title">Users &amp; credits</h2>
      </div>

      {listError && <div className="sa-alert sa-alert--error">{listError}</div>}

      <div className="sa-card sa-card--flush" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Header + search */}
        <div className="sa-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <h3>All users <span className="sa-card-header-count">{pagination.total ?? 0}</span></h3>
          <div className="sa-list-search" style={{ maxWidth: 280, flex: '0 0 auto' }}>
            <Search className="sa-search-field-icon" size={13} strokeWidth={2} aria-hidden />
            <input className="sa-input sa-input--list-search" type="search" placeholder="Search by email…"
              value={searchInput} onChange={e => setSearchInput(e.target.value)} aria-label="Search users" />
          </div>
        </div>

        {/* Column headings */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.4fr 130px',
          gap: 16, padding: '8px 20px',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.7rem', fontWeight: 700,
          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          <span>Name</span><span>Email</span><span style={{ textAlign: 'right' }}>Balance</span>
        </div>

        {/* Scrollable rows */}
        <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {listLoading ? <TableSkeleton /> : users.length === 0 ? (
            <div className="sa-empty" style={{ padding: '40px 20px' }}>No users found.</div>
          ) : users.map(user => (
            <button key={user.id} type="button"
              onClick={() => openDrawer(user.id)}
              style={{
                width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.4fr 130px',
                gap: 16, padding: '13px 20px',
                background: selectedId === user.id && drawerOpen ? 'var(--bg-hover, rgba(59,130,246,0.06))' : 'transparent',
                border: 'none', outline: 'none',
                borderBottom: '1px solid var(--border-color)',
                borderLeft: selectedId === user.id && drawerOpen ? '3px solid var(--primary,#3b82f6)' : '3px solid transparent',
                alignItems: 'center', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (selectedId !== user.id || !drawerOpen) e.currentTarget.style.background = 'var(--bg-hover, rgba(255,255,255,0.03))' }}
              onMouseLeave={e => { if (selectedId !== user.id || !drawerOpen) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: selectedId === user.id && drawerOpen ? 'var(--primary,#3b82f6)' : 'var(--primary-muted,rgba(59,130,246,0.12))',
                  color: selectedId === user.id && drawerOpen ? '#fff' : 'var(--primary,#3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {(user.name || '?')[0].toUpperCase()}
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name || 'No name'}
                  </span>
                  {user.isPlatformSuperadmin && (
                    <span className="sa-badge sa-badge--admin" style={{ fontSize: '0.62rem' }}>Admin</span>
                  )}
                </span>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--primary,#3b82f6)', textAlign: 'right' }}>
                {formatAc(user.credits)}
              </span>
            </button>
          ))}
        </div>

        {/* Pagination pinned to bottom */}
        {!listLoading && users.length > 0 && (
          <div className="sa-pagination" style={{ borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
            <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
            <div className="sa-toolbar">
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Right-side drawer */}
      <UserDrawer
        open={drawerOpen}
        user={users.find(u => u.id === selectedId)}
        detail={detail}
        history={history}
        historyPagination={historyPagination}
        historyPage={historyPage}
        setHistoryPage={setHistoryPage}
        historyType={historyType}
        setHistoryType={setHistoryType}
        detailLoading={detailLoading}
        detailError={detailError}
        actionLoading={actionLoading}
        actionMessage={actionMessage}
        actionError={actionError}
        onCreditAction={handleCreditAction}
        onClose={closeDrawer}
        onPlatformAccessChange={handlePlatformAccessChange}
        currentUserId={currentUser?.id}
      />
    </div>
  )
}

export default SuperadminUsersPanel
