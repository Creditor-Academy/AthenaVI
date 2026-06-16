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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const parsed = parseInt(amount, 10)
    if (!parsed || parsed <= 0) return
    const ok = await onSubmit({ amount: parsed, reason: reason.trim() || undefined })
    if (ok) {
      setAmount('')
      setReason('')
    }
  }

  return (
    <div className={`sa-action-card sa-action-card--${mode}`}>
      <div className="sa-action-card-head">
        <span>{isGrant ? 'Grant credits' : 'Revoke credits'}</span>
      </div>
      <form className="sa-action-form" onSubmit={handleSubmit}>
        <div className="sa-field">
          <label htmlFor={`${mode}-amount`}>Amount (AC)</label>
          <input
            id={`${mode}-amount`}
            className="sa-input"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading || disabled}
            required
          />
        </div>
        <div className="sa-field">
          <label htmlFor={`${mode}-reason`}>Reason (optional)</label>
          <textarea
            id={`${mode}-reason`}
            placeholder="Support adjustment, promo, correction…"
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading || disabled}
          />
        </div>
        <button
          type="submit"
          className={`sa-btn sa-btn--sm ${isGrant ? 'sa-btn--primary' : 'sa-btn--danger'}`}
          disabled={loading || disabled}
        >
          {loading ? 'Processing…' : isGrant ? 'Grant' : 'Revoke'}
        </button>
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
          <p className="sa-panel-desc">
            Search accounts, view balances, grant or revoke personal credits, and audit the full ledger.
          </p>
        </div>
        <label className="sa-search-field">
          <Search className="sa-search-field-icon" size={15} strokeWidth={2} aria-hidden />
          <input
            className="sa-input"
            type="search"
            placeholder="Search by email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search users by email"
          />
        </label>
      </div>

      {listError && <div className="sa-alert sa-alert--error">{listError}</div>}

      <div className="sa-split">
        <div className="sa-card sa-card--flush sa-card--list">
          <div className="sa-card-header">
            <h3>All users</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {pagination.total ?? 0} total
            </span>
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
                        }}
                      >
                        <span className="sa-list-item-email" title={user.email}>{user.email}</span>
                        <span className="sa-list-item-meta">
                          <span className="sa-list-item-name">{user.name || 'No name'}</span>
                          <span className="sa-list-item-credits">{formatAc(user.credits)}</span>
                          {user.isPlatformSuperadmin && (
                            <span className="sa-badge sa-badge--admin">Admin</span>
                          )}
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

        <div className="sa-card sa-card--detail">
          <div className="sa-card-body sa-scroll">
            {!selectedId ? (
              <div className="sa-empty">
                <User className="sa-empty-icon" size={32} />
                Select a user from the list.
              </div>
            ) : detailLoading && !detail ? (
              <UserDetailSkeleton />
            ) : detailError ? (
              <div className="sa-alert sa-alert--error">{detailError}</div>
            ) : (
              <>
                <div className="sa-detail-hero">
                  <div>
                    <h3 className="sa-detail-name">{detail?.name || selectedListUser?.name || 'User'}</h3>
                    <p className="sa-detail-email">{detail?.email || selectedListUser?.email}</p>
                    {selectedListUser?.createdAt && (
                      <p className="sa-panel-desc" style={{ marginTop: 8 }}>
                        Joined {formatShortDate(selectedListUser.createdAt)}
                      </p>
                    )}
                  </div>
                  <div className="sa-stat-pill">
                    <span className="sa-stat-pill-label">Personal balance</span>
                    <span className="sa-stat-pill-value">{formatAc(detail?.personalCredits)}</span>
                  </div>
                </div>

                {actionMessage && <div className="sa-alert sa-alert--success">{actionMessage}</div>}
                {actionError && <div className="sa-alert sa-alert--error">{actionError}</div>}

                <div className="sa-action-row">
                  <CreditActionCard
                    mode="grant"
                    loading={actionLoading}
                    onSubmit={(p) => handleCreditAction('grant', p)}
                  />
                  <CreditActionCard
                    mode="revoke"
                    loading={actionLoading}
                    disabled={!detail?.personalCredits}
                    onSubmit={(p) => handleCreditAction('revoke', p)}
                  />
                </div>

                <div className="sa-card-header" style={{ padding: '0 0 12px', border: 'none' }}>
                  <h3>Credit history</h3>
                  <select
                    className="sa-select"
                    value={historyType}
                    onChange={(e) => {
                      setHistoryType(e.target.value)
                      setHistoryPage(1)
                    }}
                    aria-label="Filter transaction type"
                  >
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
                  <div className="sa-empty" style={{ padding: '24px' }}>No transactions yet.</div>
                ) : (
                  <div className="sa-table-wrap sa-scroll">
                    <table className="sa-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((tx) => (
                          <tr key={tx.id}>
                            <td>{formatDate(tx.createdAt)}</td>
                            <td>
                              <span className="sa-badge sa-badge--type">{txTypeLabel(tx.type)}</span>
                            </td>
                            <td className={txAmountClass(tx.amount)}>
                              {tx.amount > 0 ? '+' : ''}{formatAc(tx.amount)}
                            </td>
                            <td style={{ color: 'var(--text-muted)', maxWidth: 200 }}>
                              {tx.reference || tx.metadata?.reason || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {historyPagination.totalPages > 1 && (
                  <div className="sa-pagination" style={{ marginTop: 12, border: '1px solid var(--border-color)', borderRadius: 8 }}>
                    <span>Page {historyPagination.page} of {historyPagination.totalPages}</span>
                    <div className="sa-toolbar">
                      <button
                        type="button"
                        className="sa-btn sa-btn--sm sa-btn--ghost"
                        disabled={historyPage <= 1}
                        onClick={() => setHistoryPage((p) => p - 1)}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        className="sa-btn sa-btn--sm sa-btn--ghost"
                        disabled={historyPage >= historyPagination.totalPages}
                        onClick={() => setHistoryPage((p) => p + 1)}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperadminUsersPanel
