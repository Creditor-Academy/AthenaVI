import { useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiX } from 'react-icons/fi'
import { DUPLICATE_PROJECT_NAME_MESSAGE } from '../../utils/projectNameValidation.js'
import { MAX_DESIGN_NAME_LENGTH, evaluateDesignName } from './canvasNameStep'
import './CanvasEditor.css'

/**
 * Step 1 of creating a design: name it. The default ("Untitled Design (n)") is supplied by the
 * parent once the folder's existing names are known. `onVerify(name)` is the final server-side
 * duplicate check and resolves `{ available: boolean }`.
 */
export default function CanvasNameModal({
  initialName,
  projects = [],
  loading = false,
  loadFailed = false,
  onVerify,
  onCancel,
  onContinue,
}) {
  const [name, setName] = useState(initialName)
  const [serverSaysDuplicate, setServerSaysDuplicate] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const verifyingRef = useRef(false)
  const editedRef = useRef(false)

  // The default depends on the folder's existing names, which arrive after the modal opens.
  useEffect(() => {
    if (!editedRef.current) setName(initialName)
  }, [initialName])

  useEffect(() => {
    if (loading) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [loading])

  const state = evaluateDesignName({ name, projects, loading, loadFailed, serverSaysDuplicate })
  const showDuplicate = state.duplicate && !state.empty
  const message = showDuplicate
    ? DUPLICATE_PROJECT_NAME_MESSAGE
    : state.tooLong
      ? `Name must be at most ${MAX_DESIGN_NAME_LENGTH} characters.`
      : error

  const submit = async (e) => {
    e.preventDefault()
    if (!state.canContinue || verifyingRef.current) return
    verifyingRef.current = true
    setVerifying(true)
    setError('')
    try {
      // The folder list can be stale (another tab, another user), so always confirm with the server.
      const result = onVerify ? await onVerify(state.trimmed) : { available: true }
      if (!result.available) {
        setServerSaysDuplicate(true)
        return
      }
      onContinue(state.trimmed)
    } catch (err) {
      setError(err?.message || 'Could not verify the name. Please try again.')
    } finally {
      verifyingRef.current = false
      setVerifying(false)
    }
  }

  return (
    <div className="canvas-size-modal-backdrop" onClick={onCancel}>
      <section
        className="canvas-size-modal canvas-name-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="canvas-name-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="canvas-size-modal-heading">
          <div>
            <span className="canvas-size-modal-eyebrow">Canvas Editor</span>
            <h2 id="canvas-name-title">Name your design</h2>
            <p className="canvas-size-modal-subtitle">
              Give it a name you will recognise later. You can rename it any time in the editor.
            </p>
          </div>
          <button type="button" className="canvas-size-close" onClick={onCancel} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <form className="canvas-name-form" onSubmit={submit} noValidate>
          <div className="canvas-size-field-group">
            <label className="canvas-size-field-label" htmlFor="canvas-name-input">
              Project name *
            </label>
            <div className="canvas-size-input-wrapper">
              <input
                ref={inputRef}
                id="canvas-name-input"
                type="text"
                value={name}
                disabled={loading || verifying}
                autoComplete="off"
                placeholder="Enter project name..."
                className={message ? 'canvas-name-input--error' : ''}
                aria-invalid={Boolean(message)}
                aria-describedby={message ? 'canvas-name-message' : undefined}
                onChange={(e) => {
                  editedRef.current = true
                  setName(e.target.value)
                  setServerSaysDuplicate(false)
                  setError('')
                }}
              />
            </div>
            {message && (
              <p id="canvas-name-message" className="canvas-name-error" role="alert">
                {message}
              </p>
            )}
            {loading && <span className="canvas-name-hint">Checking existing projects…</span>}
          </div>

          <div className="canvas-size-modal-actions">
            <button type="button" className="canvas-size-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="canvas-size-create"
              disabled={!state.canContinue || verifying}
            >
              <span>{verifying ? 'Checking…' : 'Continue'}</span>
              <FiArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
