import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { MdAccountBalanceWallet, MdOutlineBolt, MdHistory } from 'react-icons/md'
import creditsService from '../../../services/creditsService.js'
import workspaceService from '../../../services/workspaceService.js'
import { isTeamWorkspaceType } from '../../../utils/creditTransactions.js'
import './CreditsQuickModal.css'

const USAGE_ITEMS = [
  { pool: 'personal', label: 'Voice clone, avatar create, private workspace' },
  { pool: 'workspace', label: 'HeyGen scene videos, Remotion export' },
]

function CreditsQuickModal({ onClose, onManageBilling }) {
  const [loading, setLoading] = useState(true)
  const [personalCredits, setPersonalCredits] = useState(null)
  const [workspaceCredits, setWorkspaceCredits] = useState(null)
  const [workspaceName, setWorkspaceName] = useState('')
  const [hasTeamWorkspace, setHasTeamWorkspace] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [personal, workspaceList] = await Promise.all([
          creditsService.getPersonalBalance(),
          workspaceService.listWorkspaces(),
        ])
        if (cancelled) return

        setPersonalCredits(personal.personalCredits)

        const teamWorkspace =
          workspaceList.find((ws) => isTeamWorkspaceType(ws.type)) ||
          workspaceList.find((ws) => String(ws.type || '').toUpperCase() === 'PRIVATE') ||
          workspaceList[0]

        if (teamWorkspace?.id) {
          const balance = await creditsService.getWorkspaceBalance(teamWorkspace.id)
          if (cancelled) return
          setWorkspaceName(teamWorkspace.name || 'Workspace')
          setWorkspaceCredits(balance.workspaceCredits)
          setHasTeamWorkspace(isTeamWorkspaceType(balance.workspaceType || teamWorkspace.type))
        }
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

  const visibleUsage = useMemo(
    () => USAGE_ITEMS.filter((item) => item.pool !== 'workspace' || hasTeamWorkspace),
    [hasTeamWorkspace]
  )

  return (
    <div className="quick-access-modal-overlay" onClick={onClose}>
      <div className="quick-access-modal credits-modal credits-quick-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sleek">
          <h4>Credits</h4>
          <button type="button" className="close-mini-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && <div className="credits-quick-error">{error}</div>}

        <div className="credits-quick-body">
          <div className={`credits-quick-balances ${hasTeamWorkspace ? 'credits-quick-balances--dual' : ''}`}>
            <article className="credits-quick-balance-card">
              <div className="credits-quick-balance-icon" aria-hidden>
                <MdAccountBalanceWallet size={20} />
              </div>
              <div>
                <span className="credits-quick-balance-label">Personal</span>
                <strong className="credits-quick-balance-value">
                  {loading ? '—' : Number(personalCredits ?? 0).toLocaleString()}
                </strong>
                <span className="credits-quick-balance-hint">Voices & avatars</span>
              </div>
            </article>

            {hasTeamWorkspace && (
              <article className="credits-quick-balance-card">
                <div className="credits-quick-balance-icon" aria-hidden>
                  <MdOutlineBolt size={20} />
                </div>
                <div>
                  <span className="credits-quick-balance-label">Workspace</span>
                  <strong className="credits-quick-balance-value">
                    {loading ? '—' : Number(workspaceCredits ?? 0).toLocaleString()}
                  </strong>
                  <span className="credits-quick-balance-hint">{workspaceName} — videos & exports</span>
                </div>
              </article>
            )}
          </div>

          <div className="credits-quick-usage">
            <p className="credits-quick-usage-title">What uses credits</p>
            <ul>
              {visibleUsage.map((item) => (
                <li key={item.pool}>{item.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer-sleek credits-quick-footer">
          <button type="button" className="btn-primary-apply full-width" onClick={onManageBilling}>
            <MdHistory size={16} />
            Manage billing & history
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreditsQuickModal
