import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdClose,
  MdAccountBalanceWallet,
  MdSwapHoriz,
  MdOutlineBolt,
  MdCheckCircle,
  MdMonetizationOn,
} from 'react-icons/md'
import creditsService from '../../../../services/creditsService.js'
import './PremiumModal.css'
import './AllocateCreditsModal.css'

function AllocateCreditsModal({ isOpen, workspace, onClose, onSuccess }) {
  const [personalCredits, setPersonalCredits] = useState(0)
  const [workspaceCredits, setWorkspaceCredits] = useState(0)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('form')
  const [transferMode, setTransferMode] = useState('allocate')
  const [transferAmount, setTransferAmount] = useState(0)
  const [displayPersonal, setDisplayPersonal] = useState(0)
  const [displayWorkspace, setDisplayWorkspace] = useState(0)

  const workspaceId = workspace?.id
  const workspaceName = workspace?.name || 'Workspace'
  const canReturnCredits = workspaceCredits > 0

  useEffect(() => {
    if (!isOpen || !workspaceId) return

    let cancelled = false
    setPhase('form')
    setAmount('')
    setError('')
    setTransferAmount(0)
    setTransferMode('allocate')

    async function loadBalances() {
      setLoading(true)
      try {
        const [personal, workspaceBalance] = await Promise.all([
          creditsService.getPersonalBalance(),
          creditsService.getWorkspaceBalance(workspaceId),
        ])
        if (cancelled) return
        const personalValue = Number(personal.personalCredits ?? 0)
        const workspaceValue = Number(workspaceBalance.workspaceCredits ?? 0)
        setPersonalCredits(personalValue)
        setWorkspaceCredits(workspaceValue)
        setDisplayPersonal(personalValue)
        setDisplayWorkspace(workspaceValue)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load credit balances')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBalances()
    return () => {
      cancelled = true
    }
  }, [isOpen, workspaceId])

  const runTransfer = async (mode) => {
    const value = Number(amount)
    if (!workspaceId || !Number.isInteger(value) || value <= 0) {
      setError('Enter a positive whole number of credits.')
      return
    }

    if (mode === 'allocate' && value > personalCredits) {
      setError(`You only have ${personalCredits.toLocaleString()} personal credits available.`)
      return
    }

    if (mode === 'deallocate' && value > workspaceCredits) {
      setError(`This workspace only has ${workspaceCredits.toLocaleString()} credits to return.`)
      return
    }

    setError('')
    setTransferMode(mode)
    setTransferAmount(value)
    setPhase('transferring')

    const startPersonal = personalCredits
    const startWorkspace = workspaceCredits
    const personalDelta = mode === 'allocate' ? -value : value
    const workspaceDelta = mode === 'allocate' ? value : -value
    const steps = 24
    const stepMs = 60

    for (let i = 1; i <= steps; i += 1) {
      setTimeout(() => {
        const progress = i / steps
        setDisplayPersonal(Math.round(startPersonal + personalDelta * progress))
        setDisplayWorkspace(Math.round(startWorkspace + workspaceDelta * progress))
      }, i * stepMs)
    }

    try {
      await Promise.all([
        mode === 'allocate'
          ? creditsService.allocate(workspaceId, value)
          : creditsService.deallocate(workspaceId, value),
        new Promise((resolve) => setTimeout(resolve, steps * stepMs + 200)),
      ])

      const nextPersonal = startPersonal + personalDelta
      const nextWorkspace = startWorkspace + workspaceDelta
      setPersonalCredits(nextPersonal)
      setWorkspaceCredits(nextWorkspace)
      setDisplayPersonal(nextPersonal)
      setDisplayWorkspace(nextWorkspace)
      setPhase('success')
      onSuccess?.({
        workspaceId,
        amount: value,
        mode,
        personalCredits: nextPersonal,
        workspaceCredits: nextWorkspace,
      })

      setTimeout(() => {
        onClose()
      }, 1400)
    } catch (err) {
      setDisplayPersonal(startPersonal)
      setDisplayWorkspace(startWorkspace)
      setPhase('form')
      setError(err.message || 'Credit transfer failed')
    }
  }

  const handleAllocate = (event) => {
    event.preventDefault()
    runTransfer('allocate')
  }

  const handleDeallocate = (event) => {
    event.preventDefault()
    runTransfer('deallocate')
  }

  const transferLabel =
    transferMode === 'deallocate'
      ? `+${transferAmount.toLocaleString()} AC`
      : `-${transferAmount.toLocaleString()} AC`

  const successMessage =
    transferMode === 'deallocate'
      ? `${transferAmount.toLocaleString()} credits returned to personal balance`
      : `${transferAmount.toLocaleString()} credits allocated successfully`

  if (!isOpen || !workspace) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-wrapper allocate-credits-overlay">
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={phase === 'transferring' ? undefined : onClose}
          />
          <motion.div
            className="modal-content astryd-modal allocate-credits-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="astryd-header">
              <div className="astryd-title-group">
                <div className="astryd-icon-container">
                  <MdMonetizationOn size={20} />
                </div>
                <div>
                  <h2>Transfer credit</h2>
                  <p className="astryd-subtitle">
                    Move credits between your personal balance and <strong>{workspaceName}</strong>
                  </p>
                </div>
              </div>
              {phase !== 'transferring' && (
                <button
                  type="button"
                  className="astryd-close-btn"
                  onClick={onClose}
                  title="Close"
                  aria-label="Close"
                >
                  <MdClose size={18} />
                </button>
              )}
            </div>

            {phase === 'form' && (
              <form className="astryd-form allocate-credits-form" onSubmit={handleAllocate}>
                {error && <div className="allocate-credits-error">{error}</div>}

                <div className="allocate-credits-balances">
                  <div className="allocate-credits-pool">
                    <MdAccountBalanceWallet size={20} className="allocate-credits-pool__icon" />
                    <div>
                      <span>Your personal credits</span>
                      <strong>{loading ? '—' : personalCredits.toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="allocate-credits-pool">
                    <MdOutlineBolt size={20} className="allocate-credits-pool__icon allocate-credits-pool__icon--workspace" />
                    <div>
                      <span>{workspaceName}</span>
                      <strong>{loading ? '—' : workspaceCredits.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="astryd-form-group">
                  <label htmlFor="allocate-amount">Credits to transfer</label>
                  <input
                    id="allocate-amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 500"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    disabled={loading}
                    className={`astryd-input ${error ? 'astryd-input-error' : ''}`}
                  />
                </div>

                <div
                  className={`allocate-credits-actions ${
                    canReturnCredits ? '' : 'allocate-credits-actions--single'
                  }`}
                >
                  <button
                    type="submit"
                    className="astryd-btn-primary"
                    disabled={loading || personalCredits <= 0}
                  >
                    <MdSwapHoriz size={18} />
                    Allocate to workspace
                  </button>
                  {canReturnCredits && (
                    <button
                      type="button"
                      className="astryd-btn-accent-outline"
                      disabled={loading}
                      onClick={handleDeallocate}
                    >
                      <MdSwapHoriz size={18} />
                      Return to personal
                    </button>
                  )}
                </div>
              </form>
            )}

            {(phase === 'transferring' || phase === 'success') && (
              <div className="astryd-form allocate-credits-transfer">
                <div className="allocate-transfer-columns">
                  <div className="allocate-transfer-card">
                    <span>Personal</span>
                    <motion.strong
                      key={displayPersonal}
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {displayPersonal.toLocaleString()}
                    </motion.strong>
                  </div>

                  <div className="allocate-transfer-flow" aria-hidden>
                    <div className="allocate-transfer-track">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="allocate-transfer-dot"
                          animate={{
                            x: transferMode === 'deallocate' ? [56, 0, 56] : [0, 56, 0],
                            opacity: [0.2, 1, 0.2],
                          }}
                          transition={{
                            duration: 1.1,
                            repeat: phase === 'transferring' ? Infinity : 0,
                            delay: dot * 0.18,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                    <MdSwapHoriz size={22} />
                    <span className="allocate-transfer-amount">{transferLabel}</span>
                  </div>

                  <div className="allocate-transfer-card">
                    <span>{workspaceName}</span>
                    <motion.strong
                      key={displayWorkspace}
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {displayWorkspace.toLocaleString()}
                    </motion.strong>
                  </div>
                </div>

                {phase === 'success' ? (
                  <motion.div
                    className="allocate-transfer-success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <MdCheckCircle size={20} />
                    <span>{successMessage}</span>
                  </motion.div>
                ) : (
                  <p className="allocate-transfer-status">Transferring credits…</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AllocateCreditsModal
