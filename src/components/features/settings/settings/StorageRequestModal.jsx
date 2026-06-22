import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdStorage, MdCheckCircle, MdSend } from 'react-icons/md'
import storageService from '../../../../services/storageService.js'
import { formatBytes } from '../../../../utils/formatSize.js'
import '../../workspace/workspace/PremiumModal.css'
import './StorageRequestModal.css'

const STORAGE_OPTIONS = [
  { value: '5', label: '5 GB' },
  { value: '10', label: '10 GB' },
  { value: '25', label: '25 GB' },
  { value: '50', label: '50 GB' },
  { value: '100', label: '100 GB' },
  { value: 'custom', label: 'Custom amount' },
]

const URGENCY_OPTIONS = [
  { value: 'flexible', label: 'Flexible — no rush' },
  { value: 'week', label: 'Within 1 week' },
  { value: 'urgent', label: 'Urgent — blocking work' },
]

function gbToBytes(gb) {
  const value = Number(gb)
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.round(value * 1024 ** 3)
}

function StorageRequestModal({
  isOpen,
  onClose,
  personalStorage,
  selectedWorkspace,
  workspaceStorage,
}) {
  const [amountPreset, setAmountPreset] = useState('10')
  const [customGb, setCustomGb] = useState('')
  const [reason, setReason] = useState('')
  const [urgency, setUrgency] = useState('flexible')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setAmountPreset('10')
    setCustomGb('')
    setReason('')
    setUrgency('flexible')
    setLoading(false)
    setError('')
    setSuccess(false)
  }, [isOpen])

  const requestedGb = useMemo(() => {
    if (amountPreset === 'custom') return Number(customGb)
    return Number(amountPreset)
  }, [amountPreset, customGb])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!Number.isFinite(requestedGb) || requestedGb <= 0) {
      setError('Enter how much additional storage you need.')
      return
    }

    const trimmedReason = reason.trim()
    if (trimmedReason.length < 10) {
      setError('Please describe why you need more storage (at least 10 characters).')
      return
    }

    setLoading(true)
    try {
      await storageService.requestMoreStorage({
        requestedAdditionalGb: requestedGb,
        requestedAdditionalBytes: gbToBytes(requestedGb),
        reason: trimmedReason,
        urgency,
        currentUsedBytes: personalStorage?.usedBytes ?? 0,
        currentLimitBytes: personalStorage?.limitBytes ?? 0,
        tierId: personalStorage?.tier?.id || personalStorage?.tier?.tierId || null,
        tierLabel: personalStorage?.tier?.label || null,
        workspaceId: selectedWorkspace?.id || null,
        workspaceName: selectedWorkspace?.name || null,
        workspaceFootprintBytes: workspaceStorage?.footprint?.totalBytes ?? null,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to send storage request.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="modal-overlay-wrapper storage-request-overlay">
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={loading ? undefined : onClose}
        />
        <motion.div
          className="modal-content astryd-modal storage-request-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="storage-request-title"
        >
          <div className="astryd-header">
            <div className="astryd-title-group">
              <div className="astryd-icon-container">
                <MdStorage size={20} />
              </div>
              <div>
                <h2 id="storage-request-title">Request more storage</h2>
                <p className="astryd-subtitle">
                  Your request is emailed to the platform administrator for review.
                </p>
              </div>
            </div>
            {!loading && (
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

          {success ? (
            <div className="storage-request-success">
              <MdCheckCircle size={40} aria-hidden />
              <h3>Request sent</h3>
              <p>
                We notified the administrator about your request for{' '}
                <strong>{requestedGb} GB</strong> of additional storage. You will be contacted by email.
              </p>
              <button type="button" className="astryd-btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <form className="astryd-form storage-request-form" onSubmit={handleSubmit}>
              <div className="storage-request-context">
                <div>
                  <span className="storage-request-context-label">Current usage</span>
                  <strong>
                    {formatBytes(personalStorage?.usedBytes)} / {formatBytes(personalStorage?.limitBytes)}
                  </strong>
                </div>
                {personalStorage?.tier?.label && (
                  <div>
                    <span className="storage-request-context-label">Plan</span>
                    <strong>{personalStorage.tier.label}</strong>
                  </div>
                )}
                {selectedWorkspace?.name && (
                  <div>
                    <span className="storage-request-context-label">Workspace</span>
                    <strong>{selectedWorkspace.name}</strong>
                  </div>
                )}
              </div>

              {error && <div className="storage-request-error">{error}</div>}

              <div className="astryd-form-group">
                <label htmlFor="storage-request-amount">Additional storage needed</label>
                <select
                  id="storage-request-amount"
                  className="astryd-input"
                  value={amountPreset}
                  onChange={(event) => setAmountPreset(event.target.value)}
                  disabled={loading}
                >
                  {STORAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {amountPreset === 'custom' && (
                <div className="astryd-form-group">
                  <label htmlFor="storage-request-custom-gb">Custom amount (GB)</label>
                  <input
                    id="storage-request-custom-gb"
                    type="number"
                    min="1"
                    step="1"
                    className="astryd-input"
                    placeholder="e.g. 200"
                    value={customGb}
                    onChange={(event) => setCustomGb(event.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="astryd-form-group">
                <label htmlFor="storage-request-urgency">Timeline</label>
                <select
                  id="storage-request-urgency"
                  className="astryd-input"
                  value={urgency}
                  onChange={(event) => setUrgency(event.target.value)}
                  disabled={loading}
                >
                  {URGENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="astryd-form-group">
                <label htmlFor="storage-request-reason">How will you use the extra storage?</label>
                <textarea
                  id="storage-request-reason"
                  className="astryd-input storage-request-textarea"
                  rows={4}
                  placeholder="e.g. Upcoming video campaign with large asset library and multiple 4K exports…"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  disabled={loading}
                />
                <span className="astryd-hint">Include project scope, file types, or team size if relevant.</span>
              </div>

              <div className="storage-request-actions">
                <button
                  type="button"
                  className="astryd-btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="astryd-btn-primary" disabled={loading}>
                  <MdSend size={16} />
                  {loading ? 'Sending…' : 'Send request'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default StorageRequestModal
