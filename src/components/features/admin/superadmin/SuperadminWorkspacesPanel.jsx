import { useCallback, useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, X, Building2 } from 'lucide-react'
import superadminService, { SuperadminApiError } from '../../../../services/superadminService'
import { formatAc, formatDate, txTypeLabel } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'
import '../../../../pages/page-skeleton/skeleton.css'

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
    if (ok) { setAmount(''); setReason('') }
  }
  return (
    <div className={`sa-action-card sa-action-card--${mode}`}>
      <div className="sa-action-card-head">
        <span className={`sa-action-card-dot sa-action-card-dot--${mode}`} aria-hidden />
        <span>{isGrant ? 'Grant to pool' : 'Revoke from pool'}</span>
      </div>
      <form className="sa-action-form" onSubmit={handleSubmit}>
        <div className="sa-field sa-field--inline">
          <input className="sa-input sa-input--amount" type="number" min="1" step="1"
            placeholder="Amount (AC)" value={amount} onChange={(e) => setAmount(e.target.value)}
            disabled={loading || disabled} required aria-label="Amount in AC" />
          <button type="submit" className={`sa-btn sa-btn--sm ${isGrant ? 'sa-btn--primary' : 'sa-btn--danger'}`}
            disabled={loading || disabled || !amount}>
            {loading ? '…' : isGrant ? 'Grant' : 'Revoke'}
          </button>
        </div>
        <input className="sa-input" type="text" placeholder="Reason (optional)" maxLength={500}
          value={reason} onChange={(e) => setReason(e.target.value)} disabled={loading || disabled} />
      </form>
    </div>
  )
}

function WorkspaceDrawer({
  open,
  workspace,
  summary,
  history,
  historyPagination,
  historyPage,
  setHistoryPage,
  members,
  membersPagination,
  membersPage,
  setMembersPage,
  detailLoading,
  detailError,
  actionLoading,
  actionMessage,
  actionError,
  onCreditAction,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (open) setActiveTab('overview')
  }, [open, workspace?.workspaceId])

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} aria-hidden />
      )}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '92vw',
          background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-color)',
          boxShadow: '-12px 0 48px rgba(0,0,0,0.18)', zIndex: 201,
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Workspace details"
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--primary-muted)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {summary?.name || workspace?.name || 'Workspace'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {workspace?.workspaceId}
            </div>
          </div>
          <div className="sa-stat-pill" style={{ flexShrink: 0 }}>
            <span className="sa-stat-pill-label">Pool</span>
            <span className="sa-stat-pill-value">{formatAc(summary?.workspaceCredits ?? workspace?.workspaceCredits)}</span>
          </div>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {detailLoading && !summary ? (
          <div style={{ padding: 24 }}>
            <div className="ps-block" style={{ height: 160 }} aria-hidden />
          </div>
        ) : detailError ? (
          <div style={{ padding: 20 }}><div className="sa-alert sa-alert--error">{detailError}</div></div>
        ) : (
          <>
            <div className="sa-tab-bar" role="tablist" style={{ flexShrink: 0 }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'credits', label: 'Credits' },
                { id: 'history', label: 'Ledger' },
                { id: 'members', label: 'Usage by member' },
              ].map((tab) => (
                <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id}
                  className={`sa-tab ${activeTab === tab.id ? 'sa-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }} className="sa-scroll">
              {activeTab === 'overview' && (
                <div className="sa-tab-pane">
                  <div className="sa-workspace-meta">
                    <div className="sa-meta-item"><span>Type</span><strong>{summary?.type || 'TEAM'}</strong></div>
                    <div className="sa-meta-item"><span>Members</span><strong>{summary?.memberCount ?? '—'}</strong></div>
                    <div className="sa-meta-item"><span>Owner</span><strong>{summary?.owner?.name || summary?.owner?.email || '—'}</strong></div>
                    <div className="sa-meta-item"><span>Owner balance</span><strong>{formatAc(summary?.owner?.personalCredits)}</strong></div>
                  </div>
                </div>
              )}

              {activeTab === 'credits' && (
                <div className="sa-tab-pane">
                  {actionMessage && <div className="sa-alert sa-alert--success">{actionMessage}</div>}
                  {actionError && <div className="sa-alert sa-alert--error">{actionError}</div>}
                  <div className="sa-action-row">
                    <CreditActionCard mode="grant" loading={actionLoading} onSubmit={(p) => onCreditAction('grant', p)} />
                    <CreditActionCard mode="revoke" loading={actionLoading} disabled={!summary?.workspaceCredits}
                      onSubmit={(p) => onCreditAction('revoke', p)} />
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="sa-tab-pane">
                  {history.length === 0 ? (
                    <div className="sa-empty" style={{ padding: '32px 0' }}>No ledger entries.</div>
                  ) : (
                    <div className="sa-tx-feed">
                      {history.map((tx) => {
                        const isPos = tx.amount > 0
                        return (
                          <div key={tx.id} className="sa-tx-row">
                            <div className="sa-tx-body">
                              <div className="sa-tx-top">
                                <span className="sa-tx-type">{txTypeLabel(tx.type)}</span>
                                <span className="sa-tx-ref">{tx.reference || tx.metadata?.reason || '—'}</span>
                              </div>
                              <div className="sa-tx-bottom"><span className="sa-tx-date">{formatDate(tx.createdAt)}</span></div>
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
                    <div className="sa-pagination" style={{ marginTop: 12 }}>
                      <span>Page {historyPagination.page} of {historyPagination.totalPages}</span>
                      <div className="sa-toolbar">
                        <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={historyPage <= 1} onClick={() => setHistoryPage((p) => p - 1)}><ChevronLeft size={14} /></button>
                        <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={historyPage >= historyPagination.totalPages} onClick={() => setHistoryPage((p) => p + 1)}><ChevronRight size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="sa-tab-pane">
                  {members.length === 0 ? (
                    <div className="sa-empty" style={{ padding: '32px 0' }}>No member usage recorded.</div>
                  ) : (
                    <div className="sa-tx-feed">
                      {members.map((row) => (
                        <div key={row.userId} className="sa-tx-row">
                          <div className="sa-tx-body">
                            <div className="sa-tx-top">
                              <span className="sa-tx-type">{row.user?.name || 'Member'}</span>
                              <span className="sa-tx-ref">{row.user?.email || row.userId}</span>
                            </div>
                            <div className="sa-tx-bottom">
                              <span className="sa-tx-date">{row.transactionCount} transactions</span>
                            </div>
                          </div>
                          <span className="sa-tx-amount sa-amount--negative">{formatAc(row.totalUsageAc)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {membersPagination.totalPages > 1 && (
                    <div className="sa-pagination" style={{ marginTop: 12 }}>
                      <span>Page {membersPagination.page} of {membersPagination.totalPages}</span>
                      <div className="sa-toolbar">
                        <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={membersPage <= 1} onClick={() => setMembersPage((p) => p - 1)}><ChevronLeft size={14} /></button>
                        <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={membersPage >= membersPagination.totalPages} onClick={() => setMembersPage((p) => p + 1)}><ChevronRight size={14} /></button>
                      </div>
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

function SuperadminWorkspacesPanel() {
  const [workspaces, setWorkspaces] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [historyPagination, setHistoryPagination] = useState({ page: 1, totalPages: 1 })
  const [historyPage, setHistoryPage] = useState(1)
  const [members, setMembers] = useState([])
  const [membersPagination, setMembersPagination] = useState({ page: 1, totalPages: 1 })
  const [membersPage, setMembersPage] = useState(1)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const loadWorkspaces = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const data = await superadminService.listWorkspaces({ page, limit: PAGE_SIZE, search })
      setWorkspaces(data.workspaces || [])
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setListError(err.message || 'Failed to load workspaces')
      setWorkspaces([])
    } finally {
      setListLoading(false)
    }
  }, [page, search])

  const loadDetail = useCallback(async (workspaceId) => {
    if (!workspaceId) return
    setDetailLoading(true)
    setDetailError('')
    setActionMessage('')
    setActionError('')
    try {
      const [creditsData, historyData, membersData] = await Promise.all([
        superadminService.getWorkspaceCredits(workspaceId),
        superadminService.getWorkspaceCreditHistory(workspaceId, { page: historyPage, limit: PAGE_SIZE }),
        superadminService.getWorkspaceUsageByMember(workspaceId, { page: membersPage, limit: PAGE_SIZE }),
      ])
      setSummary(creditsData)
      const hist = historyData.history || historyData
      setHistory(hist.transactions || [])
      setHistoryPagination(hist.pagination || { page: 1, totalPages: 1 })
      setMembers(membersData.members || [])
      setMembersPagination(membersData.pagination || { page: 1, totalPages: 1 })
    } catch (err) {
      setDetailError(err.message || 'Failed to load workspace')
      setSummary(null)
      setHistory([])
      setMembers([])
    } finally {
      setDetailLoading(false)
    }
  }, [historyPage, membersPage])

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { loadWorkspaces() }, [loadWorkspaces])
  useEffect(() => { if (selectedId) loadDetail(selectedId) }, [selectedId, loadDetail])

  const openDrawer = (workspaceId) => {
    setSelectedId(workspaceId)
    setHistoryPage(1)
    setMembersPage(1)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => {
      setSelectedId(null)
      setSummary(null)
      setHistory([])
      setMembers([])
    }, 300)
  }

  const handleCreditAction = async (mode, payload) => {
    if (!selectedId) return false
    setActionLoading(true)
    setActionError('')
    setActionMessage('')
    try {
      const fn = mode === 'grant' ? superadminService.grantWorkspaceCredits : superadminService.revokeWorkspaceCredits
      const result = await fn(selectedId, payload)
      setActionMessage(
        mode === 'grant'
          ? `Granted ${formatAc(payload.amount)}. Pool: ${formatAc(result.workspace?.workspaceCredits)}`
          : `Revoked ${formatAc(payload.amount)}. Pool: ${formatAc(result.workspace?.workspaceCredits)}`
      )
      await loadDetail(selectedId)
      await loadWorkspaces()
      return true
    } catch (err) {
      setActionError(
        err instanceof SuperadminApiError && err.status === 402
          ? 'Insufficient pool credits.'
          : err.message || 'Action failed'
      )
      return false
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">TEAM workspaces</h2>
          <p className="sa-panel-desc">Browse TEAM workspace credit pools, top up or revoke, and review usage by member.</p>
        </div>
      </div>

      {listError && <div className="sa-alert sa-alert--error">{listError}</div>}

      <div className="sa-card sa-card--flush" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="sa-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <h3>All workspaces <span className="sa-card-header-count">{pagination.total ?? 0}</span></h3>
          <div className="sa-list-search" style={{ maxWidth: 280 }}>
            <Search className="sa-search-field-icon" size={13} aria-hidden />
            <input className="sa-input sa-input--list-search" type="search" placeholder="Search name or owner…"
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Search workspaces" />
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1fr 100px 100px',
          gap: 12, padding: '8px 20px', borderBottom: '1px solid var(--border-color)',
          fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
        }}>
          <span>Name</span><span>Owner</span><span>Members</span><span style={{ textAlign: 'right' }}>Pool</span>
        </div>

        <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {listLoading ? (
            <div className="sa-loading" style={{ padding: 40 }}><span className="sa-spinner" /> Loading…</div>
          ) : workspaces.length === 0 ? (
            <div className="sa-empty" style={{ padding: 40 }}>No TEAM workspaces found.</div>
          ) : workspaces.map((ws) => (
            <button key={ws.workspaceId} type="button" onClick={() => openDrawer(ws.workspaceId)}
              style={{
                width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 1fr 100px 100px',
                gap: 12, padding: '13px 20px', background: selectedId === ws.workspaceId && drawerOpen ? 'var(--bg-hover)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--border-color)', borderLeft: selectedId === ws.workspaceId && drawerOpen ? '3px solid var(--primary)' : '3px solid transparent',
                alignItems: 'center', cursor: 'pointer', textAlign: 'left',
              }}>
              <span style={{ fontWeight: 600, fontSize: '0.83rem' }}>{ws.name}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ws.owner?.email || '—'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ws.memberCount ?? '—'}</span>
              <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--primary)', textAlign: 'right' }}>{formatAc(ws.workspaceCredits)}</span>
            </button>
          ))}
        </div>

        {!listLoading && workspaces.length > 0 && (
          <div className="sa-pagination" style={{ borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
            <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
            <div className="sa-toolbar">
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></button>
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <WorkspaceDrawer
        open={drawerOpen}
        workspace={workspaces.find((w) => w.workspaceId === selectedId)}
        summary={summary}
        history={history}
        historyPagination={historyPagination}
        historyPage={historyPage}
        setHistoryPage={setHistoryPage}
        members={members}
        membersPagination={membersPagination}
        membersPage={membersPage}
        setMembersPage={setMembersPage}
        detailLoading={detailLoading}
        detailError={detailError}
        actionLoading={actionLoading}
        actionMessage={actionMessage}
        actionError={actionError}
        onCreditAction={handleCreditAction}
        onClose={closeDrawer}
      />
    </div>
  )
}

export default SuperadminWorkspacesPanel
