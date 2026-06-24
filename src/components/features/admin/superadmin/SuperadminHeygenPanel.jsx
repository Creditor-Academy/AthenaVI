import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle, Wallet, CreditCard, Zap } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { formatDate } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'
import '../../../../pages/page-skeleton/skeleton.css'

/* ─── skeleton ────────────────────────────────────────────── */

function Sk({ w, h = 14, radius = 6, style }) {
  return (
    <div
      className="ps-block ps-block--line"
      style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }}
    />
  )
}

function HeygenAccountSkeleton() {
  return (
    <div className="sa-card" aria-hidden="true">
      <div className="sa-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sk w={160} h={14} />
          <Sk w={70} h={10} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Sk w={90} h={22} radius={99} />
          <Sk w={100} h={10} />
        </div>
      </div>
      <div className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="sa-heygen-balance-block ps-block" style={{ height: 88, borderRadius: 10 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div className="ps-block" style={{ height: 56, borderRadius: 8 }} />
          <div className="ps-block" style={{ height: 56, borderRadius: 8 }} />
          <div className="ps-block" style={{ height: 56, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  )
}

/* ─── helpers ─────────────────────────────────────────────── */

function usdFormat(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function StatusBadge({ billingType }) {
  const map = {
    wallet: { label: 'Prepaid wallet', color: '#22c55e' },
    subscription: { label: 'Subscription', color: '#a78bfa' },
    usage_based: { label: 'Usage-based', color: '#38bdf8' },
  }
  const info = map[billingType] || { label: billingType || 'Unknown', color: 'var(--text-muted)' }
  return (
    <span
      className="sa-badge"
      style={{
        background: `color-mix(in srgb, ${info.color} 15%, transparent)`,
        color: info.color,
      }}
    >
      {info.label}
    </span>
  )
}

/* ─── stat tile ───────────────────────────────────────────── */

function StatTile({ label, value, valueStyle, note }) {
  return (
    <div className="sa-heygen-tile">
      <span className="sa-heygen-tile-label">{label}</span>
      <strong className="sa-heygen-tile-value" style={valueStyle}>{value}</strong>
      {note && <span className="sa-heygen-tile-note">{note}</span>}
    </div>
  )
}

/* ─── wallet section ──────────────────────────────────────── */

function WalletSection({ wallet }) {
  if (!wallet) return null
  const balance = wallet.remainingBalanceUsd ?? wallet.remaining_balance_usd
  const low = Number(balance) < 10
  const autoReload = wallet.autoReload || wallet.auto_reload
  const accentColor = low ? '#f87171' : '#4ade80'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {low && (
        <div className="sa-alert sa-alert--error">
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
          Balance is low (below $10). Top up your HeyGen wallet to avoid generation failures.
        </div>
      )}

      {/* Balance hero */}
      <div className="sa-heygen-balance-block" style={{ borderColor: `color-mix(in srgb, ${accentColor} 25%, var(--border-color))`, background: `color-mix(in srgb, ${accentColor} 6%, var(--bg-card))` }}>
        <div className="sa-heygen-balance-icon" style={{ color: accentColor }}>
          <Wallet size={18} />
        </div>
        <div>
          <span className="sa-heygen-balance-label">Remaining balance</span>
          <span className="sa-heygen-balance-value" style={{ color: accentColor }}>{usdFormat(balance)}</span>
        </div>
      </div>

      {/* Secondary stats row */}
      <div className="sa-heygen-tiles">
        <StatTile
          label="Currency"
          value={String(wallet.currency || 'USD').toUpperCase()}
        />
        <StatTile
          label="Auto-reload"
          value={
            autoReload?.enabled ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4ade80' }}>
                <CheckCircle size={13} /> Enabled
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f87171' }}>
                <AlertTriangle size={13} /> Disabled
              </span>
            )
          }
          note={autoReload?.enabled ? `Reloads ${usdFormat(autoReload.amount)} below ${usdFormat(autoReload.threshold)}` : undefined}
        />
      </div>
    </div>
  )
}

/* ─── subscription section ────────────────────────────────── */

function SubscriptionSection({ subscription }) {
  if (!subscription) return null
  const credits = subscription.credits
  const premiumCredits = credits?.premiumCredits
  const addOnCredits = credits?.addOnCredits

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Balance hero */}
      <div className="sa-heygen-balance-block" style={{ borderColor: 'color-mix(in srgb, #a78bfa 25%, var(--border-color))', background: 'color-mix(in srgb, #a78bfa 6%, var(--bg-card))' }}>
        <div className="sa-heygen-balance-icon" style={{ color: '#a78bfa' }}>
          <CreditCard size={18} />
        </div>
        <div>
          <span className="sa-heygen-balance-label">Enterprise subscription</span>
          <span className="sa-heygen-balance-value" style={{ color: '#a78bfa' }}>
            {subscription.plan || 'Active'}
          </span>
        </div>
      </div>

      <div className="sa-heygen-tiles">
        {premiumCredits && (
          <StatTile
            label="Premium credits"
            value={premiumCredits.remaining != null ? new Intl.NumberFormat().format(premiumCredits.remaining) : '—'}
            note={premiumCredits.resetsAt ? `Resets ${formatDate(premiumCredits.resetsAt)}` : undefined}
          />
        )}
        {addOnCredits && (
          <StatTile
            label="Add-on credits"
            value={addOnCredits.remaining != null ? new Intl.NumberFormat().format(addOnCredits.remaining) : '—'}
            note={addOnCredits.resetsAt ? `Resets ${formatDate(addOnCredits.resetsAt)}` : undefined}
          />
        )}
      </div>
    </div>
  )
}

/* ─── usage-based section ─────────────────────────────────── */

function UsageBasedSection({ usageBased }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="sa-heygen-balance-block" style={{ borderColor: 'color-mix(in srgb, #38bdf8 25%, var(--border-color))', background: 'color-mix(in srgb, #38bdf8 6%, var(--bg-card))' }}>
        <div className="sa-heygen-balance-icon" style={{ color: '#38bdf8' }}>
          <Zap size={18} />
        </div>
        <div>
          <span className="sa-heygen-balance-label">Billing model</span>
          <span className="sa-heygen-balance-value" style={{ color: '#38bdf8' }}>Usage-based</span>
        </div>
      </div>

      {(usageBased?.currentSpendUsd != null || usageBased?.spendingCapUsd != null) && (
        <div className="sa-heygen-tiles">
          {usageBased.currentSpendUsd != null && (
            <StatTile label="Current spend" value={usdFormat(usageBased.currentSpendUsd)} />
          )}
          {usageBased.spendingCapUsd != null && (
            <StatTile label="Spending cap" value={usdFormat(usageBased.spendingCapUsd)} />
          )}
        </div>
      )}

      {!usageBased?.currentSpendUsd && !usageBased?.spendingCapUsd && (
        <p className="sa-panel-desc">Charges apply per API call. No cap data available.</p>
      )}
    </div>
  )
}

/* ─── main panel ──────────────────────────────────────────── */

function SuperadminHeygenPanel() {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastFetched, setLastFetched] = useState(null)

  const fetchAccount = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await superadminService.getHeygenAccount()
      setAccount(data.account ?? data)
      setLastFetched(new Date().toISOString())
    } catch (err) {
      setError(err.message || 'Failed to load HeyGen account')
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccount()
  }, [fetchAccount])

  const billingType = account?.billingType || account?.billing_type
  const displayName =
    account?.firstName && account?.lastName
      ? `${account.firstName} ${account.lastName}`
      : account?.firstName || account?.lastName || null

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">HeyGen account</h2>
          <p className="sa-panel-desc">Platform API billing — funds all avatar video generation.</p>
        </div>
        <button
          type="button"
          className="sa-btn sa-btn--sm"
          onClick={fetchAccount}
          disabled={loading}
          aria-label="Refresh HeyGen account data"
        >
          <RefreshCw size={13} style={loading ? { animation: 'sa-spin 0.7s linear infinite' } : undefined} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="sa-alert sa-alert--error">
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
          {error}
        </div>
      )}

      {loading && !account && <HeygenAccountSkeleton />}

      {account && (
        <div className="sa-card">
          <div className="sa-card-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontWeight: 650, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName || account.email || 'HeyGen account'}
              </span>
              {account.email && displayName && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {account.email}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {billingType && <StatusBadge billingType={billingType} />}
              {lastFetched && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(account.fetchedAt || lastFetched)}
                </span>
              )}
            </div>
          </div>

          <div className="sa-card-body">
            {billingType === 'wallet' && <WalletSection wallet={account.wallet} />}
            {billingType === 'subscription' && <SubscriptionSection subscription={account.subscription} />}
            {billingType === 'usage_based' && <UsageBasedSection usageBased={account.usageBased} />}
            {!billingType && (
              <div className="sa-empty">No billing details available for this account.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminHeygenPanel