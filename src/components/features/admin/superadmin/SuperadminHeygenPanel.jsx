import { useCallback, useEffect, useState } from 'react'
import {
  RefreshCw, AlertTriangle, CheckCircle, Wallet, CreditCard, Zap,
  Video, Mail, Clock, DollarSign, Coins, Ban, Sparkles,
} from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { formatDate } from './superadminUtils'
import '../../../../pages/AdminPortal/styles/SuperadminBase.css'
import '../../../../pages/AdminPortal/styles/SuperadminHeyGen.css'
import { AdminHeygenSkeleton } from './skeletons/AdminSkeletons'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function usdFormat(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

// ─── Billing type badge ───────────────────────────────────────────────────────

function BillingBadge({ billingType }) {
  const map = {
    wallet:      { label: 'Prepaid wallet',  color: '#22c55e', Icon: Wallet },
    subscription:{ label: 'Subscription',    color: '#a78bfa', Icon: CreditCard },
    usage_based: { label: 'Usage-based',     color: '#38bdf8', Icon: Zap },
  }
  const { label, color, Icon } = map[billingType] || { label: billingType || 'Unknown', color: 'var(--text-muted)', Icon: Sparkles }
  return (
    <span className="sa-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `color-mix(in srgb, ${color} 15%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 30%, var(--border-color))` }}>
      <Icon size={11} />{label}
    </span>
  )
}

// ─── Info row (key/value) ─────────────────────────────────────────────────────

function InfoRow({ label, value, valueColor }) {
  if (value == null || value === '') return null
  return (
    <div className="hg-info-row">
      <span className="hg-info-label">{label}</span>
      <span className="hg-info-value" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </div>
  )
}

// ─── Stat tile ───────────────────────────────────────────────────────────────

function StatTile({ label, value, note, icon: Icon, accent }) {
  return (
    <div className="hg-stat-tile" style={accent ? { borderColor: `color-mix(in srgb, ${accent} 25%, var(--border-color))` } : undefined}>
      <div className="hg-stat-tile-header">
        {Icon && (
          <span className="hg-stat-tile-icon" style={accent ? { background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent } : undefined}>
            <Icon size={13} />
          </span>
        )}
        <span className="hg-stat-tile-label">{label}</span>
      </div>
      <strong className="hg-stat-tile-value" style={accent ? { color: accent } : undefined}>{value}</strong>
      {note && <span className="hg-stat-tile-note">{note}</span>}
    </div>
  )
}

// ─── Wallet section ───────────────────────────────────────────────────────────

function WalletSection({ wallet }) {
  if (!wallet) return null
  const balance    = wallet.remainingBalanceUsd ?? wallet.remaining_balance_usd
  const low        = Number(balance) < 10
  const autoReload = wallet.autoReload || wallet.auto_reload
  const accent     = low ? '#f87171' : '#4ade80'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {low && (
        <div className="sa-alert sa-alert--error">
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
          Balance is low (below $10). Top up your HeyGen wallet to avoid generation failures.
        </div>
      )}

      {/* Balance hero */}
      <div className="hg-balance-hero" style={{ borderColor: `color-mix(in srgb, ${accent} 30%, var(--border-color))`, background: `color-mix(in srgb, ${accent} 7%, var(--bg-card))` }}>
        <div className="hg-balance-icon" style={{ color: accent }}>
          <Wallet size={22} />
        </div>
        <div>
          <span className="hg-balance-label">Remaining balance</span>
          <span className="hg-balance-value" style={{ color: accent }}>{usdFormat(balance)}</span>
        </div>
        {low && <span className="hg-balance-warning-chip">Low</span>}
      </div>

      {/* Tiles */}
      <div className="hg-tiles-grid">
        <StatTile label="Currency" icon={DollarSign} accent="#38bdf8" value={String(wallet.currency || 'USD').toUpperCase()} />
        <StatTile
          label="Auto-reload"
          icon={autoReload?.enabled ? CheckCircle : Ban}
          accent={autoReload?.enabled ? '#4ade80' : '#f87171'}
          value={autoReload?.enabled ? 'Enabled' : 'Disabled'}
          note={autoReload?.enabled
            ? `Reloads ${usdFormat(autoReload.amount)} below ${usdFormat(autoReload.threshold)}`
            : 'Top up manually in HeyGen'}
        />
      </div>
    </div>
  )
}

// ─── Subscription section ─────────────────────────────────────────────────────

function SubscriptionSection({ subscription }) {
  if (!subscription) return null
  const credits        = subscription.credits
  const premiumCredits = credits?.premiumCredits
  const addOnCredits   = credits?.addOnCredits
  const accent         = '#a78bfa'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="hg-balance-hero" style={{ borderColor: `color-mix(in srgb, ${accent} 30%, var(--border-color))`, background: `color-mix(in srgb, ${accent} 7%, var(--bg-card))` }}>
        <div className="hg-balance-icon" style={{ color: accent }}><CreditCard size={22} /></div>
        <div>
          <span className="hg-balance-label">Enterprise subscription</span>
          <span className="hg-balance-value" style={{ color: accent }}>{subscription.plan || 'Active'}</span>
        </div>
      </div>

      <div className="hg-tiles-grid">
        {premiumCredits && (
          <StatTile label="Premium credits" icon={Sparkles} accent="#a78bfa"
            value={premiumCredits.remaining != null ? new Intl.NumberFormat().format(premiumCredits.remaining) : '—'}
            note={premiumCredits.resetsAt ? `Resets ${formatDate(premiumCredits.resetsAt)}` : undefined} />
        )}
        {addOnCredits && (
          <StatTile label="Add-on credits" icon={Coins} accent="#38bdf8"
            value={addOnCredits.remaining != null ? new Intl.NumberFormat().format(addOnCredits.remaining) : '—'}
            note={addOnCredits.resetsAt ? `Resets ${formatDate(addOnCredits.resetsAt)}` : undefined} />
        )}
      </div>
    </div>
  )
}

// ─── Usage-based section ──────────────────────────────────────────────────────

function UsageBasedSection({ usageBased }) {
  const accent = '#38bdf8'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="hg-balance-hero" style={{ borderColor: `color-mix(in srgb, ${accent} 30%, var(--border-color))`, background: `color-mix(in srgb, ${accent} 7%, var(--bg-card))` }}>
        <div className="hg-balance-icon" style={{ color: accent }}><Zap size={22} /></div>
        <div>
          <span className="hg-balance-label">Billing model</span>
          <span className="hg-balance-value" style={{ color: accent }}>Usage-based</span>
        </div>
      </div>

      {(usageBased?.currentSpendUsd != null || usageBased?.spendingCapUsd != null) ? (
        <div className="hg-tiles-grid">
          {usageBased.currentSpendUsd != null && <StatTile label="Current spend" icon={DollarSign} accent="#38bdf8" value={usdFormat(usageBased.currentSpendUsd)} />}
          {usageBased.spendingCapUsd  != null && <StatTile label="Spending cap"  icon={Wallet}    accent="#a78bfa" value={usdFormat(usageBased.spendingCapUsd)} />}
        </div>
      ) : (
        <p className="sa-panel-desc">Charges apply per API call. No cap data available.</p>
      )}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

function SuperadminHeygenPanel() {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [lastFetched, setLastFetched] = useState(null)

  const fetchAccount = useCallback(async () => {
    setLoading(true); setError('')
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

  useEffect(() => { fetchAccount() }, [fetchAccount])

  const billingType = account?.billingType || account?.billing_type
  const displayName = account?.firstName && account?.lastName
    ? `${account.firstName} ${account.lastName}`
    : account?.firstName || account?.lastName || null

  // This page only ever shows 2–3 KPI cards (never the shared grid's default 4),
  // so size the grid to the actual count instead of leaving an empty column.
  const kpiCardCount = 1 // Billing model
    + (billingType === 'wallet' ? 1 : 0) // Wallet balance
    + (billingType === 'subscription' && account?.subscription?.credits?.premiumCredits ? 1 : 0) // Premium credits
    + 1 // Last synced

  return (
    <div className="sa-panel">

      {/* ── Header ── */}
      <div className="sa-panel-header">
        <div className="sa-panel-header-title-group">
          <h2 className="sa-panel-title">HeyGen Integration</h2>
          <p className="sa-panel-desc">Platform API billing and generation quota — funds avatar video generation for all users.</p>
        </div>
        <button type="button" className="sa-btn sa-btn--sm" onClick={fetchAccount} disabled={loading} aria-label="Refresh HeyGen account data">
          <RefreshCw size={13} style={loading ? { animation: 'sa-spin 0.7s linear infinite' } : undefined} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="sa-alert sa-alert--error">
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />{error}
        </div>
      )}

      {loading && !account && <AdminHeygenSkeleton />}

      {account && (
        <>
          {/* ── KPI strip (fixed, does not scroll) ── */}
          <div className="sa-kpi-grid" style={{ gridTemplateColumns: `repeat(${kpiCardCount}, minmax(0, 1fr))` }}>
            <div className={`sa-kpi-card ${billingType === 'wallet' ? 'sa-kpi-card--emerald' : billingType === 'subscription' ? 'sa-kpi-card--purple' : 'sa-kpi-card--sky'}`}>
              <div className="sa-kpi-card-grain" />
              <div className="sa-kpi-header"><span className="sa-kpi-label">Billing model</span></div>
              <div className="sa-kpi-body">
                <span className="sa-kpi-value" style={{ fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
                  {billingType === 'wallet' ? 'Prepaid' : billingType === 'subscription' ? 'Enterprise' : billingType === 'usage_based' ? 'Pay-as-you-go' : 'Unknown'}
                </span>
                <span className="sa-kpi-detail">HeyGen account type</span>
              </div>
              <div className="sa-kpi-corner-icon">
                {billingType === 'wallet' ? <Wallet size={70} strokeWidth={1.5} /> : billingType === 'subscription' ? <CreditCard size={70} strokeWidth={1.5} /> : <Zap size={70} strokeWidth={1.5} />}
              </div>
            </div>

            {billingType === 'wallet' && (
              <div className={`sa-kpi-card ${Number(account.wallet?.remainingBalanceUsd ?? account.wallet?.remaining_balance_usd) < 10 ? 'sa-kpi-card--amber' : 'sa-kpi-card--emerald'}`}>
                <div className="sa-kpi-card-grain" />
                <div className="sa-kpi-header"><span className="sa-kpi-label">Wallet balance</span></div>
                <div className="sa-kpi-body">
                  <span className="sa-kpi-value">{usdFormat(account.wallet?.remainingBalanceUsd ?? account.wallet?.remaining_balance_usd)}</span>
                  <span className="sa-kpi-detail">{Number(account.wallet?.remainingBalanceUsd ?? 0) < 10 ? '⚠ Balance low' : 'PAYG wallet'}</span>
                </div>
                <div className="sa-kpi-corner-icon"><DollarSign size={70} strokeWidth={1.5} /></div>
              </div>
            )}

            {billingType === 'subscription' && account.subscription?.credits?.premiumCredits && (
              <div className="sa-kpi-card sa-kpi-card--purple">
                <div className="sa-kpi-card-grain" />
                <div className="sa-kpi-header"><span className="sa-kpi-label">Premium credits</span></div>
                <div className="sa-kpi-body">
                  <span className="sa-kpi-value">{new Intl.NumberFormat().format(account.subscription.credits.premiumCredits.remaining ?? 0)}</span>
                  <span className="sa-kpi-detail">remaining this period</span>
                </div>
                <div className="sa-kpi-corner-icon"><Sparkles size={70} strokeWidth={1.5} /></div>
              </div>
            )}

            <div className="sa-kpi-card sa-kpi-card--blue">
              <div className="sa-kpi-card-grain" />
              <div className="sa-kpi-header"><span className="sa-kpi-label">Last synced</span></div>
              <div className="sa-kpi-body">
                <span className="sa-kpi-value" style={{ fontSize: '1rem', letterSpacing: 0 }}>{lastFetched ? formatDate(lastFetched) : '—'}</span>
                <span className="sa-kpi-detail">Live data from HeyGen API</span>
              </div>
              <div className="sa-kpi-corner-icon"><RefreshCw size={70} strokeWidth={1.5} /></div>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="sa-scroll hg-body-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── Account identity card ── */}
              <div className="sa-card">
                <div className="sa-card-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Mail size={13} style={{ color: 'var(--primary)' }} /> Account details
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {billingType && <BillingBadge billingType={billingType} />}
                    {lastFetched && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        <Clock size={11} /> {formatDate(account.fetchedAt || lastFetched)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="sa-card-body">
                  {/* Identity block */}
                  <div className="hg-identity">
                    <div className="hg-identity-avatar">
                      {(displayName || account.email || 'H')[0].toUpperCase()}
                    </div>
                    <div className="hg-identity-info">
                      <span className="hg-identity-name">{displayName || account.email || 'HeyGen account'}</span>
                      {account.email && displayName && <span className="hg-identity-email">{account.email}</span>}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="hg-info-grid">
                    <InfoRow label="Email" value={account.email} />
                    <InfoRow label="First name" value={account.firstName} />
                    <InfoRow label="Last name" value={account.lastName} />
                    <InfoRow label="Account ID" value={account.id || account.accountId} />
                    <InfoRow label="Billing type" value={billingType} />
                  </div>
                </div>
              </div>

              {/* ── Billing detail card ── */}
              <div className="sa-card">
                <div className="sa-card-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {billingType === 'wallet' ? <Wallet size={13} style={{ color: 'var(--primary)' }} /> :
                     billingType === 'subscription' ? <CreditCard size={13} style={{ color: 'var(--primary)' }} /> :
                     <Zap size={13} style={{ color: 'var(--primary)' }} />}
                    Billing & quota
                  </h3>
                </div>
                <div className="sa-card-body">
                  {billingType === 'wallet'       && <WalletSection       wallet={account.wallet} />}
                  {billingType === 'subscription' && <SubscriptionSection subscription={account.subscription} />}
                  {billingType === 'usage_based'  && <UsageBasedSection   usageBased={account.usageBased} />}
                  {!billingType && <div className="sa-empty">No billing details available for this account.</div>}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SuperadminHeygenPanel
