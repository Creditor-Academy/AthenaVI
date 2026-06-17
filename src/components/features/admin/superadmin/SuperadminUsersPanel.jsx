import { useCallback, useEffect, useState } from 'react'
import { Search, User, ChevronLeft, ChevronRight } from 'lucide-react'
import superadminService, { SuperadminApiError } from '../../../../services/superadminService'
import {
  formatAc,
  formatDate,
  formatShortDate,
  txAmountClass,
  txTypeLabel,
} from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'
import '../../../../pages/page-skeleton/skeleton.css'

/* ─── skeleton pieces ─────────────────────────────────────── */

function Sk({ w, h = 14, radius = 6, style }) {
  return (
    <div
      className="ps-block ps-block--line"
      style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }}
    />
  )
}

function UserListSkeleton() {
  return (
    <ul className="sa-list" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Sk w="70%" h={11} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Sk w="45%" h={9} />
            <Sk w={52} h={9} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function UserDetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* hero row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk w={180} h={22} radius={8} />
          <Sk w={220} h={13} />
          <Sk w={120} h={11} />
        </div>
        <div className="ps-block" style={{ width: 130, height: 68, borderRadius: 10 }} />
      </div>
      {/* action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="ps-block" style={{ height: 140, borderRadius: 10 }} />
        <div className="ps-block" style={{ height: 140, borderRadius: 10 }} />
      </div>
      {/* history header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Sk w={110} h={14} />
        <Sk w={110} h={32} radius={8} />
      </div>
      {/* table rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
          <Sk w="22%" h={11} />
          <Sk w="18%" h={11} />
          <Sk w="14%" h={11} />
          <Sk w="30%" h={11} />
        </div>
      ))}
    </div>
  )
}

const PAGE_SIZE = 20

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
    if (ok) {
      setAmount('')
      setReason('')
      setShowReason(false)
    }
  }

  return (
    <div className={`sa-action-card sa-action-card--${mode}`}>
      <div className="sa-action-card-head">
        <span className={`sa-action-card-dot sa-action-card-dot--${mode}`} aria-hidden="true" />
        <span>{isGrant ? 'Grant' : 'Revoke'}</span>
      </div>
      <form className="sa-action-form" onSubmit={handleSubmit}>
        <div className="sa-field sa-field--inline">
          <input
            id={`${mode}-amount`}
            className="sa-input sa-input--amount"
            type="number"
            min="1"
            step="1"
            placeholder="Amount (AC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading || disabled}
            required
            aria-label="Amount in AC"
          />
          <button
            type="submit"
            className={`sa-btn sa-btn--sm ${isGrant ? 'sa-btn--primary' : 'sa-btn--danger'}`}
            disabled={loading || disabled || !amount}
          >
            {loading ? '…' : isGrant ? 'Grant' : 'Revoke'}
          </button>
        </div>
        <button
          type="button"
          className="sa-reason-toggle"
          onClick={() => setShowReason((v) => !v)}
          disabled={loading || disabled}
          aria-expanded={showReason}
        >
          {showReason ? '− Hide reason' : '+ Add reason'}
        </button>
        {showReason && (
          <textarea
            id={`${mode}-reason`}
            className="sa-reason-input"
            placeholder="e.g. Support adjustment, promo…"
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading || disabled}
            rows={2}
          />
        )}
      </form>
    </div>
  )
}

function SuperadminUsersPanel() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState([])
  const [historyPagination, setHistoryPagination] = useState({ page: 1, totalPages: 1 })
  const [historyPage, setHistoryPage] = useState(1)
  const [historyType, setHistoryType] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  const loadUsers = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const data = await superadminService.listUsers({ page, limit: PAGE_SIZE, search })
      const nextUsers = data.users || []
      setUsers(nextUsers)
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
      setSelectedId((prev) => {
        if (prev && nextUsers.some((u) => u.id === prev)) return prev
        return nextUsers[0]?.id ?? null
      })
    } catch (err) {
      setListError(err.message || 'Failed to load users')
      setUsers([])
    } finally {
      setListLoading(false)
    }
  }, [page, search])

  const loadDetail = useCallback(async (userId) => {
    if (!userId) return
    setDetailLoading(true)
    setDetailError('')
    setActionMessage('')
    setActionError('')
    try {
      const [creditsData, historyData] = await Promise.all([
        superadminService.getUserCredits(userId),
        superadminService.getUserCreditHistory(userId, {
          page: historyPage,
          limit: PAGE_SIZE,
          type: historyType || undefined,
        }),
      ])
      setDetail(creditsData)
      const hist = historyData.history || historyData
      setHistory(hist.transactions || [])
      setHistoryPagination(hist.pagination || { page: 1, totalPages: 1 })
    } catch (err) {
      setDetailError(err.message || 'Failed to load user details')
      setDetail(null)
      setHistory([])
    } finally {
      setDetailLoading(false)
    }
  }, [historyPage, historyType])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (selectedId) loadDetail(selectedId)
  }, [selectedId, loadDetail])

  const handleCreditAction = async (mode, payload) => {
    if (!selectedId) return false
    setActionLoading(true)
    setActionError('')
    setActionMessage('')
    try {
      const fn =
        mode === 'grant'
          ? superadminService.grantUserCredits
          : superadminService.revokeUserCredits
      const result = await fn(selectedId, payload)
      setActionMessage(
        mode === 'grant'
          ? `Granted ${formatAc(payload.amount)}. New balance: ${formatAc(result.user?.personalCredits)}`
          : `Revoked ${formatAc(payload.amount)}. New balance: ${formatAc(result.user?.personalCredits)}`
      )
      await loadDetail(selectedId)
      await loadUsers()
      return true
    } catch (err) {
      const msg =
        err instanceof SuperadminApiError && err.status === 402
          ? 'Insufficient credits to revoke that amount.'
          : err.message || 'Action failed'
      setActionError(msg)
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const selectedListUser = users.find((u) => u.id === selectedId)

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Users & credits</h2>
        </div>
      </div>

      {listError && <div className="sa-alert sa-alert--error">{listError}</div>}

      <div className="sa-split">
        <div className="sa-card sa-card--flush sa-card--list">
          <div className="sa-card-header">
            <h3>All users <span className="sa-card-header-count">{pagination.total ?? 0}</span></h3>
          </div>
          <div className="sa-list-search">
            <Search className="sa-search-field-icon" size={13} strokeWidth={2} aria-hidden />
            <input
              className="sa-input sa-input--list-search"
              type="search"
              placeholder="Search by email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search users by email"
            />
          </div>
          {listLoading ? (
            <UserListSkeleton />
          ) : users.length === 0 ? (
            <div className="sa-empty">No users found.</div>
          ) : (
            <>
              <div className="sa-list-scroll sa-scroll">
                <ul className="sa-list" role="listbox" aria-label="Users">
                  {users.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedId === user.id}
                        className={`sa-list-item ${selectedId === user.id ? 'sa-list-item--active' : ''}`}
                        onClick={() => {
                          setSelectedId(user.id)
                          setHistoryPage(1)
                          setActiveTab('profile')
                        }}
                      >
                        <span className="sa-list-item-top">
                          <span className="sa-list-item-name">{user.name || 'No name'}</span>
                          {user.isPlatformSuperadmin && (
                            <span className="sa-badge sa-badge--admin">Admin</span>
                          )}
                        </span>
                        <span className="sa-list-item-bottom">
                          <span className="sa-list-item-email" title={user.email}>{user.email}</span>
                          <span className="sa-list-item-credits">{formatAc(user.credits)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sa-pagination">
                <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
                <div className="sa-toolbar">
                  <button
                    type="button"
                    className="sa-btn sa-btn--sm sa-btn--ghost"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="sa-btn sa-btn--sm sa-btn--ghost"
                    disabled={page >= (pagination.totalPages || 1)}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="sa-card sa-card--detail sa-card--flush">
          {!selectedId ? (
            <div className="sa-empty sa-empty--fill">
              <User className="sa-empty-icon" size={32} />
              Select a user from the list.
            </div>
          ) : detailLoading && !detail ? (
            <div className="sa-card-body sa-scroll"><UserDetailSkeleton /></div>
          ) : detailError ? (
            <div className="sa-card-body"><div className="sa-alert sa-alert--error">{detailError}</div></div>
          ) : (
            <>
              {/* Always-visible user header */}
              <div className="sa-detail-header">
                <div className="sa-detail-hero-info">
                  <h3 className="sa-detail-name">{detail?.name || selectedListUser?.name || 'User'}</h3>
                  <p className="sa-detail-email">{detail?.email || selectedListUser?.email}</p>
                </div>
                <div className="sa-stat-pill">
                  <span className="sa-stat-pill-label">Balance</span>
                  <span className="sa-stat-pill-value">{formatAc(detail?.personalCredits)}</span>
                </div>
              </div>

              {/* Tab bar */}
              <div className="sa-tab-bar" role="tablist">
                {[
                  { id: 'profile', label: 'Profile' },
                  { id: 'credits', label: 'Credits' },
                  { id: 'history', label: 'History' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`sa-tab ${activeTab === tab.id ? 'sa-tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="sa-tab-content sa-scroll">

                {activeTab === 'profile' && (
                  <div className="sa-tab-pane">
                    {/* Avatar + identity block */}
                    <div className="sa-profile-identity">
                      <div className="sa-profile-avatar">
                        {(detail?.name || selectedListUser?.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="sa-profile-identity-info">
                        <span className="sa-profile-display-name">
                          {detail?.name || selectedListUser?.name || 'Unknown user'}
                        </span>
                        <span className="sa-profile-display-email">
                          {detail?.email || selectedListUser?.email}
                        </span>
                        {selectedListUser?.isPlatformSuperadmin && (
                          <span className="sa-badge sa-badge--admin" style={{ marginTop: 4, width: 'fit-content' }}>Superadmin</span>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="sa-profile-stats">
                      <div className="sa-profile-stat">
                        <span>Balance</span>
                        <strong style={{ color: 'var(--primary)' }}>{formatAc(detail?.personalCredits)}</strong>
                      </div>
                      <div className="sa-profile-stat-divider" />
                      <div className="sa-profile-stat">
                        <span>Member since</span>
                        <strong>{selectedListUser?.createdAt ? formatShortDate(selectedListUser.createdAt) : '—'}</strong>
                      </div>
                      <div className="sa-profile-stat-divider" />
                      <div className="sa-profile-stat">
                        <span>Role</span>
                        <strong>{selectedListUser?.isPlatformSuperadmin ? 'Superadmin' : 'User'}</strong>
                      </div>
                    </div>

                    {/* Detail rows */}
                    <div className="sa-profile-grid">
                      <div className="sa-profile-item">
                        <span>Full name</span>
                        <strong>{detail?.name || '—'}</strong>
                      </div>
                      <div className="sa-profile-item">
                        <span>Email address</span>
                        <strong style={{ wordBreak: 'break-all' }}>{detail?.email || '—'}</strong>
                      </div>
                      <div className="sa-profile-item">
                        <span>Joined</span>
                        <strong>{selectedListUser?.createdAt ? formatDate(selectedListUser.createdAt) : '—'}</strong>
                      </div>
                      <div className="sa-profile-item">
                        <span>User ID</span>
                        <strong style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{detail?.userId || selectedListUser?.id || '—'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'credits' && (
                  <div className="sa-tab-pane">
                    {actionMessage && <div className="sa-alert sa-alert--success">{actionMessage}</div>}
                    {actionError && <div className="sa-alert sa-alert--error">{actionError}</div>}
                    <div className="sa-action-row">
                      <CreditActionCard mode="grant" loading={actionLoading} onSubmit={(p) => handleCreditAction('grant', p)} />
                      <CreditActionCard mode="revoke" loading={actionLoading} disabled={!detail?.personalCredits} onSubmit={(p) => handleCreditAction('revoke', p)} />
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="sa-tab-pane">
                    <div className="sa-history-toolbar">
                      <span className="sa-section-label" style={{ margin: 0 }}>
                        Transactions
                        {history.length > 0 && (
                          <span className="sa-card-header-count" style={{ marginLeft: 8 }}>{history.length}</span>
                        )}
                      </span>
                      <select className="sa-select" value={historyType} onChange={(e) => { setHistoryType(e.target.value); setHistoryPage(1) }} aria-label="Filter transaction type">
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
                      <div className="sa-empty" style={{ padding: '40px 0' }}>No transactions yet.</div>
                    ) : (
                      <div className="sa-tx-feed">
                        {history.map((tx) => {
                          const isPos = tx.amount > 0
                          const typeColors = {
                            platform_grant:  { bg: '#22c55e', label: 'Grant' },
                            platform_revoke: { bg: '#ef4444', label: 'Revoke' },
                            usage:           { bg: '#f59e0b', label: 'Usage' },
                            allocation:      { bg: '#38bdf8', label: 'Allocation' },
                            deallocation:    { bg: '#a78bfa', label: 'Dealloc' },
                            refund:          { bg: '#34d399', label: 'Refund' },
                          }
                          const tc = typeColors[tx.type] || { bg: 'var(--text-muted)', label: txTypeLabel(tx.type) }
                          return (
                            <div key={tx.id} className="sa-tx-row">
                              <div className="sa-tx-dot" style={{ background: `color-mix(in srgb, ${tc.bg} 20%, var(--bg-card))`, borderColor: `color-mix(in srgb, ${tc.bg} 35%, var(--border-color))` }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: tc.bg, flexShrink: 0 }} />
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
                          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={historyPage <= 1} onClick={() => setHistoryPage((p) => p - 1)}><ChevronLeft size={14} /></button>
                          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={historyPage >= historyPagination.totalPages} onClick={() => setHistoryPage((p) => p + 1)}><ChevronRight size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuperadminUsersPanel
