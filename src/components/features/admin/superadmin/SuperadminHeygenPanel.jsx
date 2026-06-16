import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Wallet, AlertTriangle, CheckCircle } from 'lucide-react'
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
      {/* card header */}
      <div className="sa-card-header" style={{ gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sk w={180} h={16} />
          <Sk w={80} h={12} />
        </div>
        <Sk w={90} h={22} radius={99} />
      </div>

      <div className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* detail hero */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sk w={20} h={20} radius={6} />
              <Sk w={180} h={22} radius={8} />
            </div>
            <Sk w={300} h={12} />
          </div>
          {/* balance pill */}
          <div className="ps-block" style={{ width: 140, height: 68, borderRadius: 10 }} />
        </div>

        {/* meta grid — 2 cells + 1 full-width */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <div className="ps-block" style={{ height: 60, borderRadius: 10 }} />
          <div className="ps-block" style={{ height: 60, borderRadius: 10 }} />
          <div className="ps-block" style={{ height: 60, borderRadius: 10, gridColumn: '1 / -1' }} />
        </div>

        {/* account info strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 4 }}>
          <div className="ps-block" style={{ height: 60, borderRadius: 10 }} />
          <div className="ps-block" style={{ height: 60, borderRadius: 10 }} />
          <div className="ps-block" style={{ height: 60, borderRadius: 10 }} />
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

function BalancePill({ label, value, accent }) {
  return (
    <div
      className="sa-stat-pill"
      style={
        accent
          ? {
              background: `color-mix(in srgb, ${accent} 8%, var(--bg-card))`,
              borderColor: `color-mix(in srgb, ${accent} 22%, var(--border-color))`,
            }
          : undefined
      }
    >
      <span className="sa-stat-pill-label">{label}</span>
      <span
        className="sa-stat-pill-value"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
    </div>
  )
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

/* ─── auto-reload info row ────────────────────────────────── */

function AutoReloadRow({ autoReload }) {
  if (!autoReload) return null
  const { enabled, threshold, amount } = autoReload
  return (
    <div className="sa-meta-item" style={{ gridColumn: '1 / -1' }}>
      <span>Auto-reload</span>
      <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {enabled ? (
          <CheckCircle size={13} style={{ color: '#4ade80' }} />
        ) : (
          <AlertTriangle size={13} style={{ color: '#f87171' }} />
        )}
        {enabled
          ? `Enabled — reloads ${usdFormat(amount)} when below ${usdFormat(threshold)}`
          : 'Disabled'}
      </strong>
    </div>
  )
}

/* ─── wallet section ──────────────────────────────────────── */

function WalletSection({ wallet }) {
  if (!wallet) return null
  const balance = wallet.remainingBalanceUsd ?? wallet.remaining_balance_usd
  const low = Number(balance) < 10

  return (
    <>
      <div className="sa-detail-hero">
        <div>
          <h3 className="sa-detail-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={20} style={{ opacity: 0.7 }} />
            Prepaid USD wallet
          </h3>
          <p className="sa-panel-desc" style={{ marginTop: 6 }}>
            Your HeyGen API account balance. All video generation is billed from this wallet.
          </p>
        </div>
        <BalancePill
          label="Remaining balance"
          value={usdFormat(balance)}
          accent={low ? '#f87171' : '#22c55e'}
        />
      </div>

      {low && (
        <div className="sa-alert sa-alert--error" style={{ marginBottom: 16 }}>
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
          Balance is low (below $10). Top up your HeyGen wallet to avoid video generation failures.
        </div>
      )}

      <div className="sa-workspace-meta">
        <div className="sa-meta-item">
          <span>Currency</span>
          <strong>{String(wallet.currency || 'USD').toUpperCase()}</strong>
        </div>
        <div className="sa-meta-item">
          <span>Remaining balance</span>
          <strong style={{ color: low ? '#f87171' : '#4ade80' }}>{usdFormat(balance)}</strong>
        </div>
        <AutoReloadRow autoReload={wallet.autoReload || wallet.auto_reload} />
      </div>
    </>
  )
}

/* ─── subscription section ────────────────────────────────── */

function SubscriptionSection({ subscription }) {
  if (!subscription) return null
  const credits = subscription.credits

  return (
    <>
      <div className="sa-detail-hero">
        <div>
          <h3 className="sa-detail-name">Enterprise subscription</h3>
          <p className="sa-panel-desc" style={{ marginTop: 6 }}>
            HeyGen enterprise credit pools linked to this account.
          </p>
        </div>
        {credits && (
          <BalancePill
            label="Remaining credits"
            value={new Intl.NumberFormat().format(credits.remaining ?? credits.total ?? 0)}
            accent="#a78bfa"
          />
        )}
      </div>

      {credits && (
        <div className="sa-workspace-meta">
          <div className="sa-meta-item">
            <span>Total credits</span>
            <strong>{new Intl.NumberFormat().format(credits.total ?? '—')}</strong>
          </div>
          <div className="sa-meta-item">
            <span>Remaining</span>
            <strong style={{ color: '#c4b5fd' }}>
              {new Intl.NumberFormat().format(credits.remaining ?? '—')}
            </strong>
          </div>
          {credits.reset_at && (
            <div className="sa-meta-item">
              <span>Resets at</span>
              <strong>{formatDate(credits.reset_at)}</strong>
            </div>
          )}
        </div>
      )}
    </>
  )
}

/* ─── usage-based section ─────────────────────────────────── */

function UsageBasedSection({ usageBased }) {
  if (!usageBased) return null

  return (
    <div className="sa-detail-hero">
      <div>
        <h3 className="sa-detail-name">Usage-based billing</h3>
        <p className="sa-panel-desc" style={{ marginTop: 6 }}>
          This account is on metered billing — charges apply per API call.
        </p>
      </div>
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
      // backend wraps under data.account
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

  return (
    <div className="sa-panel">
      {/* header */}
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">HeyGen account</h2>
          <p className="sa-panel-desc">
            Platform HeyGen API billing — the prepaid USD wallet that funds all avatar video
            generation across Athena VI.
          </p>
        </div>
        <button
          type="button"
          className="sa-btn sa-btn--sm"
          onClick={fetchAccount}
          disabled={loading}
          aria-label="Refresh HeyGen account data"
        >
          <RefreshCw
            size={13}
            style={loading ? { animation: 'sa-spin 0.7s linear infinite' } : undefined}
          />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* error state */}
      {error && (
        <div className="sa-alert sa-alert--error">
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
          {error}
        </div>
      )}

      {/* skeleton — first load only */}
      {loading && !account && <HeygenAccountSkeleton />}

      {/* account details */}
      {account && (
        <div className="sa-card">
          <div className="sa-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0 }}>{account.email || account.username || 'HeyGen account'}</h3>
              {account.firstName && account.lastName && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {account.firstName} {account.lastName}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {billingType && <StatusBadge billingType={billingType} />}
              {lastFetched && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Updated {formatDate(account.fetchedAt || lastFetched)}
                </span>
              )}
            </div>
          </div>

          <div className="sa-card-body sa-scroll">
            {billingType === 'wallet' && <WalletSection wallet={account.wallet} />}
            {billingType === 'subscription' && (
              <SubscriptionSection subscription={account.subscription} />
            )}
            {billingType === 'usage_based' && (
              <UsageBasedSection usageBased={account.usageBased} />
            )}
            {!billingType && (
              <div className="sa-empty">No billing details available for this account.</div>
            )}

            {/* account info strip */}
            <div
              className="sa-workspace-meta"
              style={{ marginTop: 20 }}
            >
              {account.username && (
                <div className="sa-meta-item">
                  <span>Username</span>
                  <strong>{account.username}</strong>
                </div>
              )}
              {account.email && (
                <div className="sa-meta-item">
                  <span>Email</span>
                  <strong style={{ wordBreak: 'break-all' }}>{account.email}</strong>
                </div>
              )}
              {billingType && (
                <div className="sa-meta-item">
                  <span>Billing type</span>
                  <strong>
                    <StatusBadge billingType={billingType} />
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminHeygenPanel
