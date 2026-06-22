import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  MdAccountBalanceWallet,
  MdOutlineBolt,
  MdHistory,
  MdMovie,
  MdMic,
  MdGroups,
} from 'react-icons/md'
import creditsService from '../../../services/creditsService.js'
import workspaceService from '../../../services/workspaceService.js'
import { isTeamWorkspaceType } from '../../../utils/creditTransactions.js'
import { getSanitizedErrorMessage } from '../../../utils/userFacingMessage.js'
import './CreditsQuickModal.css'

const NUMBER_LOCALE = 'en-US'

function formatCredits(value) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString(NUMBER_LOCALE)
}

function formatCreditsCompact(value) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  if (Math.abs(num) >= 10_000) {
    return new Intl.NumberFormat(NUMBER_LOCALE, {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(num)
  }
  return num.toLocaleString(NUMBER_LOCALE)
}

const USAGE_ITEMS = [
  {
    pool: 'personal',
    icon: MdMic,
    title: 'Personal pool',
    label: 'Voice clone, avatar create, private workspace',
  },
  {
    pool: 'workspace',
    icon: MdMovie,
    title: 'Workspace pool',
    label: 'Avatar scene videos, Remotion export',
  },
]

function CreditsQuickModal({ onClose, onManageBilling }) {
  const [loading, setLoading] = useState(true)
  const [personalCredits, setPersonalCredits] = useState(null)
  const [workspaceBalances, setWorkspaceBalances] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      setWorkspaceBalances([])

      try {
        const [personal, workspaceList] = await Promise.all([
          creditsService.getPersonalBalance(),
          workspaceService.listWorkspaces(),
        ])
        if (cancelled) return

        setPersonalCredits(personal.personalCredits)

        const teamWorkspaces = (workspaceList || []).filter((ws) =>
          isTeamWorkspaceType(ws.type)
        )

        if (teamWorkspaces.length === 0) {
          setWorkspaceBalances([])
          return
        }

        const balances = await Promise.all(
          teamWorkspaces.map(async (workspace) => {
            const balance = await creditsService.getWorkspaceBalance(workspace.id)
            return {
              id: workspace.id,
              name: workspace.name || 'Workspace',
              credits: Number(balance.workspaceCredits ?? 0),
            }
          })
        )

        if (cancelled) return

        balances.sort((a, b) => a.name.localeCompare(b.name))
        setWorkspaceBalances(balances)
      } catch (err) {
        if (!cancelled) {
          setError(getSanitizedErrorMessage(err, 'Failed to load credits'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const hasTeamWorkspaces = workspaceBalances.length > 0
  const totalWorkspaceCredits = useMemo(
    () => workspaceBalances.reduce((sum, ws) => sum + Number(ws.credits || 0), 0),
    [workspaceBalances]
  )
  const grandTotal = useMemo(
    () => Number(personalCredits ?? 0) + totalWorkspaceCredits,
    [personalCredits, totalWorkspaceCredits]
  )

  const visibleUsage = useMemo(
    () => USAGE_ITEMS.filter((item) => item.pool !== 'workspace' || hasTeamWorkspaces),
    [hasTeamWorkspaces]
  )

  return (
    <div className="credits-modal-overlay" onClick={onClose}>
      <div
        className="credits-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="credits-modal-title"
        aria-busy={loading}
      >
        <header className="credits-modal-header">
          <div className="credits-modal-brand">
            <span className="credits-modal-brand-icon" aria-hidden>
              <MdAccountBalanceWallet size={20} />
            </span>
            <div>
              <h2 id="credits-modal-title">Credits</h2>
              <p>{loading ? 'Fetching balances…' : 'Overview of your credit pools'}</p>
            </div>
          </div>
          <button type="button" className="credits-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {error && <div className="credits-modal-error">{error}</div>}

        <div className="credits-modal-body premium-scrollbar">
          {loading ? (
            <div className="credits-modal-loading" aria-hidden>
              <div className="credits-modal-skeleton credits-modal-skeleton--hero" />
              <div className="credits-modal-skeleton credits-modal-skeleton--pool" />
              <div className="credits-modal-skeleton credits-modal-skeleton--row" />
              <div className="credits-modal-skeleton credits-modal-skeleton--row" />
            </div>
          ) : (
            <>
              <section className="credits-modal-hero" aria-label="Total credits">
                <span className="credits-modal-hero-label">Total available</span>
                <strong className="credits-modal-hero-value" title={formatCredits(grandTotal)}>
                  {formatCreditsCompact(grandTotal)}
                </strong>
                <span className="credits-modal-hero-meta">
                  {hasTeamWorkspaces
                    ? `${formatCreditsCompact(personalCredits)} personal · ${formatCreditsCompact(totalWorkspaceCredits)} across ${workspaceBalances.length} workspace${workspaceBalances.length === 1 ? '' : 's'}`
                    : `${formatCredits(personalCredits)} in your personal pool`}
                </span>
              </section>

              <section className="credits-modal-section" aria-label="Personal credits">
                <div className="credits-modal-section-head">
                  <span className="credits-modal-section-title">
                    <MdAccountBalanceWallet size={15} />
                    Personal
                  </span>
                  <span className="credits-modal-section-tag">Voices & avatars</span>
                </div>
                <div className="credits-modal-pool-card credits-modal-pool-card--personal">
                  <strong className="credits-modal-pool-value">{formatCredits(personalCredits)}</strong>
                  <span className="credits-modal-pool-caption">Available for personal actions</span>
                </div>
              </section>

              {hasTeamWorkspaces && (
                <section className="credits-modal-section" aria-label="Team workspace credits">
                  <div className="credits-modal-section-head">
                    <span className="credits-modal-section-title">
                      <MdGroups size={15} />
                      Team workspaces
                    </span>
                    <span className="credits-modal-section-total" title={formatCredits(totalWorkspaceCredits)}>
                      {formatCreditsCompact(totalWorkspaceCredits)} total
                    </span>
                  </div>
                  <ul className="credits-modal-workspace-list">
                    {workspaceBalances.map((workspace) => (
                      <li key={workspace.id} className="credits-modal-workspace-item">
                        <span className="credits-modal-workspace-icon" aria-hidden>
                          <MdOutlineBolt size={15} />
                        </span>
                        <div className="credits-modal-workspace-copy">
                          <span className="credits-modal-workspace-name">{workspace.name}</span>
                          <span className="credits-modal-workspace-hint">Videos & exports</span>
                        </div>
                        <strong
                          className="credits-modal-workspace-credits"
                          title={formatCredits(workspace.credits)}
                        >
                          {formatCredits(workspace.credits)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          <section className="credits-modal-usage" aria-label="What uses credits">
            <p className="credits-modal-usage-title">What uses credits</p>
            {loading ? (
              <div className="credits-modal-usage-loading" aria-hidden>
                <div className="credits-modal-skeleton credits-modal-skeleton--usage" />
                <div className="credits-modal-skeleton credits-modal-skeleton--usage" />
              </div>
            ) : (
              <div className="credits-modal-usage-grid">
                {visibleUsage.map((item) => {
                  const Icon = item.icon
                  return (
                    <article key={item.pool} className="credits-modal-usage-card">
                      <span className="credits-modal-usage-icon" aria-hidden>
                        <Icon size={16} />
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.label}</p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <footer className="credits-modal-footer">
          <button
            type="button"
            className="credits-modal-billing-btn"
            onClick={onManageBilling}
            disabled={loading}
          >
            <MdHistory size={17} />
            Manage billing & history
          </button>
        </footer>
      </div>
    </div>
  )
}

export default CreditsQuickModal
