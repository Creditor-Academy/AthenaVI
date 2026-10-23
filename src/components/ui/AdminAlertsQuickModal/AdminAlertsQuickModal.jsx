import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Bell,
  AlertTriangle,
  Wallet,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  X,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import superadminService from '../../../services/superadminService.js'
import InboxPopover, { InboxDetailPanel, InboxListItem } from '../InboxPopover/InboxPopover.jsx'
import { formatInboxFullTimestamp, formatInboxRelativeTime } from '../../../utils/inboxNotifications.js'

function usdFormat(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

/** Flatten the alerts summary into list rows: { id, tone, icon, tag, title, preview, body, facts, action }. */
function buildAlertItems(alerts) {
  const items = []

  const heygen = alerts?.heygenWallet
  if (heygen) {
    const remaining = usdFormat(heygen.remainingBalanceUsd)
    const threshold = usdFormat(heygen.thresholdUsd)
    items.push({
      id: 'heygen-wallet',
      tone: heygen.isLow ? 'warn' : 'info',
      icon: heygen.isLow ? AlertTriangle : Wallet,
      tag: 'HeyGen Wallet',
      title: heygen.isLow ? 'HeyGen wallet balance is low' : 'HeyGen wallet balance',
      preview: `Remaining ${remaining} · warning threshold ${threshold}`,
      body: heygen.isLow
        ? 'Your HeyGen API balance is below the warning threshold. Top up to avoid video synthesis interruption.'
        : 'Your HeyGen API balance is above the warning threshold.',
      facts: [
        ['Remaining balance', remaining],
        ['Warning threshold', threshold],
      ],
      action: { label: 'Manage wallet', tab: 'heygen' },
    })
  }

  const storageCount = Number(alerts?.pendingStorageCount ?? alerts?.pendingStorageRequestsCount ?? 0)
  if (storageCount > 0) {
    const plural = storageCount === 1 ? '' : 's'
    items.push({
      id: 'storage-queue',
      tone: 'warn',
      icon: HardDrive,
      tag: 'Storage Queue',
      title: `${storageCount} storage request${plural} pending`,
      preview: `${storageCount} storage upgrade request${plural} awaiting admin approval.`,
      body: `${storageCount} storage upgrade request${plural} ${storageCount === 1 ? 'is' : 'are'} awaiting admin approval. Review the queue to approve or decline.`,
      facts: [['Pending requests', String(storageCount)]],
      action: { label: 'Review queue', tab: 'storage-requests' },
    })
  }

  const unreadPlatformCount = Number(alerts?.unreadPlatformCount ?? 0)
  if (unreadPlatformCount > 0) {
    const plural = unreadPlatformCount === 1 ? '' : 's'
    items.push({
      id: 'platform-unread',
      tone: 'alert',
      icon: Bell,
      tag: 'Platform Health',
      title: `${unreadPlatformCount} unread platform alert${plural}`,
      preview: `${unreadPlatformCount} unread platform incident or broadcast alert${plural}.`,
      body: `There ${unreadPlatformCount === 1 ? 'is' : 'are'} ${unreadPlatformCount} unread platform incident or broadcast alert${plural}. Open the overview to review them.`,
      facts: [['Unread alerts', String(unreadPlatformCount)]],
      action: { label: 'View overview', tab: 'overview' },
    })
  }

  const listAlerts = Array.isArray(alerts?.alerts) ? alerts.alerts : []
  listAlerts.forEach((item, idx) => {
    const title = item.title || item.message || 'Platform notice'
    const message = item.title ? item.message : ''
    items.push({
      id: `alert-${item.id || idx}`,
      tone: 'info',
      icon: Activity,
      tag: item.type || 'Notice',
      title,
      preview: message || item.severity || '',
      body: message,
      facts: item.severity ? [['Severity', item.severity]] : [],
      createdAt: item.createdAt,
    })
  })

  return items
}

function countActiveAlerts(alerts) {
  const listAlerts = Array.isArray(alerts?.alerts) ? alerts.alerts : []
  return (
    (alerts?.heygenWallet?.isLow ? 1 : 0) +
    (Number(alerts?.pendingStorageCount ?? alerts?.pendingStorageRequestsCount ?? 0) > 0 ? 1 : 0) +
    (Number(alerts?.unreadPlatformCount ?? 0) > 0 ? 1 : 0) +
    listAlerts.length
  )
}

function AdminAlertsQuickModal({ onClose, onNavigateTab }) {
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState(null)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await superadminService.getAlertsSummary()
      setAlerts(data || {})
    } catch (err) {
      setError(err.message || 'Failed to load platform alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const items = useMemo(() => buildAlertItems(alerts), [alerts])
  const activeCount = useMemo(() => countActiveAlerts(alerts), [alerts])
  const selected = items.find((item) => item.id === selectedId) || null
  const closeDetail = useCallback(() => setSelectedId(null), [])

  const handleAction = (tabId) => {
    onNavigateTab?.(tabId)
    onClose?.()
  }

  const detail = selected ? (
    <InboxDetailPanel
      icon={selected.icon}
      tone={selected.tone}
      eyebrow={selected.tag}
      title={selected.title}
      timestamp={formatInboxFullTimestamp(selected.createdAt)}
      timestampIso={selected.createdAt}
      onClose={closeDetail}
      footer={
        selected.action && (
          <button
            type="button"
            className="inbox-pop-btn inbox-pop-btn--primary"
            onClick={() => handleAction(selected.action.tab)}
          >
            {selected.action.label}
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
          </button>
        )
      }
    >
      {selected.body && <p>{selected.body}</p>}
      {selected.facts.length > 0 && (
        <dl className="inbox-pop-facts">
          {selected.facts.map(([label, value]) => (
            <div key={label} className="inbox-pop-fact">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </InboxDetailPanel>
  ) : null

  return (
    <InboxPopover
      label="Platform alerts"
      onClose={onClose}
      detail={detail}
      onCloseDetail={closeDetail}
      busy={loading}
    >
      <header className="inbox-pop-header inbox-pop-header--divided">
        <h4 className="inbox-pop-title">
          Platform alerts
          {activeCount > 0 && <span className="inbox-pop-count">{activeCount} active</span>}
        </h4>
        <div className="inbox-pop-header-actions">
          <button
            type="button"
            className="inbox-pop-icon-btn"
            onClick={loadAlerts}
            disabled={loading}
            aria-label="Refresh alerts"
            title="Refresh alerts"
          >
            <RefreshCw size={15} strokeWidth={1.85} className={loading ? 'inbox-pop-spin' : ''} />
          </button>
          <button type="button" className="inbox-pop-icon-btn" onClick={onClose} aria-label="Close" title="Close">
            <X size={16} strokeWidth={1.85} />
          </button>
        </div>
      </header>

      <div className="inbox-pop-list">
        {error && <p className="inbox-pop-error">{error}</p>}

        {loading && !alerts ? (
          <div className="inbox-pop-state">
            <RefreshCw size={18} className="inbox-pop-spin" aria-hidden />
            <span>Checking platform telemetry…</span>
          </div>
        ) : activeCount === 0 && !error ? (
          <div className="inbox-pop-state">
            <span className="inbox-pop-state-icon" aria-hidden>
              <ShieldCheck size={20} strokeWidth={1.75} />
            </span>
            <strong>All systems nominal</strong>
            <p>No critical alerts, wallet low-balance warnings, or pending review queues.</p>
          </div>
        ) : (
          items.map((item) => (
            <InboxListItem
              key={item.id}
              icon={item.icon}
              tone={item.tone}
              title={item.title}
              preview={item.preview}
              time={formatInboxRelativeTime(item.createdAt)}
              timeIso={item.createdAt}
              unread={item.tone !== 'info'}
              selected={item.id === selectedId}
              onSelect={() => setSelectedId(item.id)}
            />
          ))
        )}
      </div>

      <div className="inbox-pop-footer">
        <button type="button" className="inbox-pop-footer-link" onClick={() => handleAction('overview')}>
          <Activity size={14} aria-hidden /> Platform dashboard overview
        </button>
      </div>
    </InboxPopover>
  )
}

export default AdminAlertsQuickModal
