import React, { useEffect, useState, useCallback } from 'react'
import {
  Bell,
  AlertTriangle,
  Wallet,
  HardDrive,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  Activity,
} from 'lucide-react'
import superadminService from '../../../services/superadminService.js'
import './AdminAlertsQuickModal.css'

function usdFormat(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function AdminAlertsQuickModal({ onClose, onNavigateTab }) {
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState(null)
  const [error, setError] = useState('')

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

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleAction = (tabId) => {
    onNavigateTab?.(tabId)
    onClose?.()
  }

  // Derive alert items
  const heygenAlert = alerts?.heygenWallet
  const storageCount = Number(alerts?.pendingStorageCount ?? alerts?.pendingStorageRequestsCount ?? 0)
  const earlyAccessCount = Number(alerts?.pendingEarlyAccessCount ?? 0)
  const unreadPlatformCount = Number(alerts?.unreadPlatformCount ?? 0)
  const listAlerts = Array.isArray(alerts?.alerts) ? alerts.alerts : []

  const totalAlertItems =
    (heygenAlert?.isLow ? 1 : 0) +
    (storageCount > 0 ? 1 : 0) +
    (earlyAccessCount > 0 ? 1 : 0) +
    (unreadPlatformCount > 0 ? 1 : 0) +
    listAlerts.length

  return (
    <div className="admin-alerts-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Platform Superadmin Alerts">
      <div className="admin-alerts-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-alerts-header">
          <div className="admin-alerts-header-lead">
            <div className="admin-alerts-header-icon">
              <Bell size={18} />
              {totalAlertItems > 0 && <span className="admin-alerts-pulse-dot" />}
            </div>
            <div>
              <div className="admin-alerts-title-wrap">
                <h3 className="admin-alerts-title">Platform Alerts</h3>
                {totalAlertItems > 0 && (
                  <span className="admin-alerts-badge">{totalAlertItems} active</span>
                )}
              </div>
              <p className="admin-alerts-sub">Live health &amp; queue telemetry from Superadmin API</p>
            </div>
          </div>

          <div className="admin-alerts-header-actions">
            <button
              type="button"
              className="admin-alerts-btn-icon"
              onClick={loadAlerts}
              title="Refresh alerts"
              disabled={loading}
              aria-label="Refresh alerts"
            >
              <RefreshCw size={16} className={loading ? 'admin-alerts-spin' : ''} />
            </button>
            <button
              type="button"
              className="admin-alerts-btn-icon"
              onClick={onClose}
              title="Close"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="admin-alerts-body">
          {error && (
            <div className="admin-alerts-error-banner">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          {loading && !alerts ? (
            <div className="admin-alerts-loading">
              <div className="admin-alerts-spinner" />
              <span>Checking platform telemetry…</span>
            </div>
          ) : totalAlertItems === 0 && !error ? (
            <div className="admin-alerts-empty">
              <div className="admin-alerts-empty-icon">
                <ShieldCheck size={32} />
              </div>
              <h4>All Systems Nominal</h4>
              <p>No critical alerts, wallet low-balance warnings, or pending review queues.</p>
            </div>
          ) : (
            <div className="admin-alerts-list">
              {/* 1. HeyGen Wallet Low Balance */}
              {heygenAlert && (
                <div className={`admin-alert-item ${heygenAlert.isLow ? 'admin-alert-item--warn' : 'admin-alert-item--info'}`}>
                  <div className="admin-alert-item-icon">
                    {heygenAlert.isLow ? <AlertTriangle size={18} /> : <Wallet size={18} />}
                  </div>
                  <div className="admin-alert-item-content">
                    <div className="admin-alert-item-top">
                      <span className="admin-alert-item-tag">HeyGen Wallet</span>
                      {heygenAlert.isLow && <span className="admin-alert-pill--warn">Low Balance</span>}
                    </div>
                    <div className="admin-alert-item-main">
                      Remaining Balance: <strong>{usdFormat(heygenAlert.remainingBalanceUsd)}</strong>
                      <span className="admin-alert-item-detail">
                        Threshold: {usdFormat(heygenAlert.thresholdUsd)}
                      </span>
                    </div>
                    {heygenAlert.isLow && (
                      <p className="admin-alert-item-desc">
                        Your HeyGen API balance is below the warning threshold. Top up to avoid video synthesis interruption.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="admin-alert-item-btn"
                    onClick={() => handleAction('heygen')}
                  >
                    Manage <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* 2. Pending Storage Requests */}
              {storageCount > 0 && (
                <div className="admin-alert-item admin-alert-item--warn">
                  <div className="admin-alert-item-icon">
                    <HardDrive size={18} />
                  </div>
                  <div className="admin-alert-item-content">
                    <div className="admin-alert-item-top">
                      <span className="admin-alert-item-tag">Storage Queue</span>
                      <span className="admin-alert-pill--warn">{storageCount} Pending</span>
                    </div>
                    <div className="admin-alert-item-main">
                      <strong>{storageCount}</strong> storage upgrade request{storageCount === 1 ? '' : 's'} awaiting admin approval.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-alert-item-btn"
                    onClick={() => handleAction('storage-requests')}
                  >
                    Review Queue <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* 3. Pending Early Access Applications */}
              {earlyAccessCount > 0 && (
                <div className="admin-alert-item admin-alert-item--info">
                  <div className="admin-alert-item-icon">
                    <UserCheck size={18} />
                  </div>
                  <div className="admin-alert-item-content">
                    <div className="admin-alert-item-top">
                      <span className="admin-alert-item-tag">Early Access</span>
                      <span className="admin-alert-pill--info">{earlyAccessCount} New</span>
                    </div>
                    <div className="admin-alert-item-main">
                      <strong>{earlyAccessCount}</strong> new early access application{earlyAccessCount === 1 ? '' : 's'} in queue.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-alert-item-btn"
                    onClick={() => handleAction('early-access')}
                  >
                    Review <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* 4. Unread Platform Alerts */}
              {unreadPlatformCount > 0 && (
                <div className="admin-alert-item admin-alert-item--alert">
                  <div className="admin-alert-item-icon">
                    <Bell size={18} />
                  </div>
                  <div className="admin-alert-item-content">
                    <div className="admin-alert-item-top">
                      <span className="admin-alert-item-tag">Platform Health</span>
                      <span className="admin-alert-pill--alert">{unreadPlatformCount} Unread</span>
                    </div>
                    <div className="admin-alert-item-main">
                      <strong>{unreadPlatformCount}</strong> unread platform incident or broadcast alert{unreadPlatformCount === 1 ? '' : 's'}.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-alert-item-btn"
                    onClick={() => handleAction('overview')}
                  >
                    View Overview <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* 5. Detailed alert list items if provided */}
              {listAlerts.map((item, idx) => (
                <div key={item.id || idx} className="admin-alert-item admin-alert-item--info">
                  <div className="admin-alert-item-icon">
                    <Activity size={18} />
                  </div>
                  <div className="admin-alert-item-content">
                    <div className="admin-alert-item-top">
                      <span className="admin-alert-item-tag">{item.type || 'Notice'}</span>
                      {item.severity && <span className="admin-alert-pill--warn">{item.severity}</span>}
                    </div>
                    <div className="admin-alert-item-main">
                      <strong>{item.title || item.message}</strong>
                    </div>
                    {item.message && item.title && (
                      <p className="admin-alert-item-desc">{item.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="admin-alerts-footer">
          <button
            type="button"
            className="admin-alerts-footer-link"
            onClick={() => handleAction('overview')}
          >
            <Activity size={14} /> Platform Dashboard Overview
          </button>
          <button
            type="button"
            className="admin-alerts-footer-close"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminAlertsQuickModal
