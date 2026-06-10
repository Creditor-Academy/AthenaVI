import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { MdAccountBalanceWallet, MdOutlineBolt, MdHistory, MdMovie } from 'react-icons/md'
import creditsService from '../../../services/creditsService.js'
import workspaceService from '../../../services/workspaceService.js'
import { isTeamWorkspaceType } from '../../../utils/creditTransactions.js'
import './CreditsQuickModal.css'

const NUMBER_LOCALE = 'en-US'

function formatCredits(value) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString(NUMBER_LOCALE)
}

const USAGE_ITEMS = [
  {
    pool: 'personal',
    icon: MdAccountBalanceWallet,
    label: 'Voice clone, avatar create, private workspace',
  },
  {
    pool: 'workspace',
    icon: MdMovie,
    label: 'HeyGen scene videos, Remotion export',
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
              type: balance.workspaceType || workspace.type,
            }
          })
        )

        if (cancelled) return

        balances.sort((a, b) => a.name.localeCompare(b.name))
        setWorkspaceBalances(balances)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load credits')
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

  const visibleUsage = useMemo(
    () => USAGE_ITEMS.filter((item) => item.pool !== 'workspace' || hasTeamWorkspaces),
    [hasTeamWorkspaces]
  )

  return (
    <div className="quick-access-modal-overlay" onClick={onClose}>
      <div
        className="quick-access-modal credits-quick-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="credits-quick-title"
        aria-busy={loading}
      >
        <header className="credits-quick-header">
          <div className="credits-quick-header-text">
            <h4 id="credits-quick-title">Credits</h4>
            <p>{loading ? 'Loading your balances…' : 'Your available balances'}</p>
          </div>
          <button type="button" className="credits-quick-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {error && <div className="credits-quick-error">{error}</div>}

        <div className="credits-quick-body">
          {loading ? (
            <div className="credits-quick-loading" aria-hidden>
              <div className="credits-quick-skeleton credits-quick-skeleton--card" />
              <div className="credits-quick-skeleton credits-quick-skeleton--section-title" />
              <div className="credits-quick-skeleton credits-quick-skeleton--row" />
              <div className="credits-quick-skeleton credits-quick-skeleton--row" />
            </div>
          ) : (
            <>
              <article className="credits-quick-card credits-quick-card--personal">
                <div className="credits-quick-card-head">
                  <div className="credits-quick-card-icon" aria-hidden>
                    <MdAccountBalanceWallet size={18} />
                  </div>
                  <span className="credits-quick-card-label">Personal</span>
                </div>
                <strong className="credits-quick-card-value">
                  {formatCredits(personalCredits)}
                </strong>
                <span className="credits-quick-card-hint">Voices & avatars</span>
              </article>

              {hasTeamWorkspaces && (
                <section className="credits-quick-workspaces" aria-label="Team workspace credits">
                  <div className="credits-quick-workspaces-head">
                    <h5>Team workspaces</h5>
                    <span className="credits-quick-workspaces-total">
                      {formatCredits(totalWorkspaceCredits)} total
                    </span>
                  </div>
                  <ul className="credits-quick-workspaces-list">
                    {workspaceBalances.map((workspace) => (
                      <li key={workspace.id} className="credits-quick-workspace-row">
                        <div className="credits-quick-workspace-row-icon" aria-hidden>
                          <MdOutlineBolt size={16} />
                        </div>
                        <div className="credits-quick-workspace-row-info">
                          <span className="credits-quick-workspace-row-name">{workspace.name}</span>
                          <span className="credits-quick-workspace-row-hint">Videos & exports</span>
                        </div>
                        <strong className="credits-quick-workspace-row-value">
                          {formatCredits(workspace.credits)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          <section className="credits-quick-usage" aria-label="What uses credits">
            <p className="credits-quick-usage-title">What uses credits</p>
            {loading ? (
              <div className="credits-quick-usage-loading" aria-hidden>
                <div className="credits-quick-skeleton credits-quick-skeleton--usage" />
                <div className="credits-quick-skeleton credits-quick-skeleton--usage" />
              </div>
            ) : (
              <ul className="credits-quick-usage-list">
                {visibleUsage.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.pool} className="credits-quick-usage-item">
                      <span className="credits-quick-usage-icon" aria-hidden>
                        <Icon size={15} />
                      </span>
                      <span>{item.label}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <footer className="credits-quick-footer">
          <button
            type="button"
            className="credits-quick-billing-btn"
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
