import { useEffect, useState } from 'react'
import { Settings, X, FolderClosed, Wallet, Building2, ArrowLeftRight } from 'lucide-react'
import creditsService from '../../../services/creditsService.js'
import { isTeamWorkspaceType } from '../../../utils/creditTransactions.js'
import ImageGenSaveLocation from './ImageGenSaveLocation.jsx'
import './ImageGenStudioSettings.css'

export default function ImageGenStudioSettings({
  workspaceId,
  folderId,
  onChange,
  onCreditsChanged,
}) {
  const [open, setOpen] = useState(false)
  const [balance, setBalance] = useState(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const isTeam = isTeamWorkspaceType(balance?.workspaceType)

  useEffect(() => {
    if (!open || !workspaceId) return undefined
    let active = true
    setError('')
    setNotice('')
    creditsService.getWorkspaceBalance(workspaceId)
      .then((next) => { if (active) setBalance(next) })
      .catch(() => { if (active) setBalance(null) })
    return () => { active = false }
  }, [open, workspaceId])

  const addCredits = async () => {
    const value = Number(amount)
    if (!workspaceId || !Number.isFinite(value) || value <= 0) {
      setError('Enter how many credits to add.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await creditsService.allocate(workspaceId, value)
      const next = await creditsService.getWorkspaceBalance(workspaceId)
      setBalance(next)
      setAmount('')
      setNotice('Credits added to this workspace.')
      onCreditsChanged?.()
    } catch (err) {
      setError(err?.message || 'Could not add credits.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={`igs-settings-btn${open ? ' is-on' : ''}`}
        aria-label="Studio settings"
        aria-expanded={open}
        title="Settings"
        onClick={() => setOpen(true)}
      >
        <Settings size={16} />
      </button>
      {open && (
        <div className="igs-layer">
          <button type="button" className="igs-backdrop" aria-label="Close settings" onClick={() => setOpen(false)} />
          <aside className="igs-panel" role="dialog" aria-label="Studio settings">
            <div className="igs-scroll">
            <header className="igs-head">
              <div className="igs-head-copy">
                <span className="igs-head-mark"><Settings size={16} /></span>
                <div>
                  <h2>Settings</h2>
                  <p>Workspace, folder, and credits</p>
                </div>
              </div>
              <button type="button" className="igs-close" aria-label="Close" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </header>

            <section className="igs-section">
              <div className="igs-section-title">
                <span className="igs-mark"><FolderClosed size={15} /></span>
                <div>
                  <h3>Save location</h3>
                  <p>Where new images are stored.</p>
                </div>
              </div>
              <ImageGenSaveLocation
                variant="embedded"
                workspaceId={workspaceId}
                folderId={folderId}
                onChange={onChange}
              />
            </section>

            <section className="igs-section">
              <div className="igs-section-title">
                <span className="igs-mark igs-mark--credits"><Wallet size={15} /></span>
                <div>
                  <h3>Credits</h3>
                  <p>{isTeam ? 'This studio spends the workspace pool.' : 'This studio spends your personal credits.'}</p>
                </div>
              </div>
              {!balance ? (
                <p className="igs-loading">Loading balances…</p>
              ) : (
                <>
                  <div className="igs-pools">
                    <div className="igs-pool igs-pool--personal">
                      <span><Wallet size={14} /> Personal</span>
                      <strong>{balance.personalCredits.toLocaleString()}</strong>
                    </div>
                    <div className="igs-pool igs-pool--workspace">
                      <span><Building2 size={14} /> Workspace</span>
                      <strong>{isTeam ? balance.workspaceCredits.toLocaleString() : '—'}</strong>
                    </div>
                  </div>
                  {isTeam && (
                    <div className="igs-add">
                      <label htmlFor="igs-credit-amount"><ArrowLeftRight size={14} /> Move from personal</label>
                      <div className="igs-add-row">
                        <input
                          id="igs-credit-amount"
                          type="number"
                          min="1"
                          inputMode="numeric"
                          placeholder="Amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <button type="button" onClick={addCredits} disabled={busy}>
                          {busy ? 'Adding…' : 'Add'}
                        </button>
                      </div>
                      <p className="igs-hint">Only the workspace owner can move credits in.</p>
                    </div>
                  )}
                  {notice && <p className="igs-ok">{notice}</p>}
                  {error && <p className="igs-err">{error}</p>}
                </>
              )}
            </section>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
