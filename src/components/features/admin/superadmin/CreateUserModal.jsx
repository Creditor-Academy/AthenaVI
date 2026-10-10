import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { X, Eye, EyeOff, UserPlus, Mail, KeyRound } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import {
  INITIAL_CREATE_USER_VALUES,
  PASSWORD_MODE,
  PASSWORD_MIN,
  validateCreateUserForm,
  buildCreateUserPayload,
  mapCreateUserError,
} from './createUserForm'
import '../../../../pages/AdminPortal/styles/SuperadminBase.css'
import '../../../../pages/AdminPortal/styles/SuperadminCreateUser.css'

/**
 * Superadmin dialog to provision a user account.
 * `onCreated(result, payload)` fires once after a successful create; the parent owns closing.
 */
export default function CreateUserModal({ open, onClose, onCreated }) {
  // Mounting the dialog only while open gives a fresh form every time without reset effects.
  return open ? <CreateUserDialog onClose={onClose} onCreated={onCreated} /> : null
}

function CreateUserDialog({ onClose, onCreated }) {
  const [values, setValues] = useState(INITIAL_CREATE_USER_VALUES)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const baseId = useId()
  const nameRef = useRef(null)
  const mountedRef = useRef(true)
  const submittingRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const requestClose = useCallback(() => {
    if (!submittingRef.current) onClose?.()
  }, [onClose])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') requestClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [requestClose])

  const setField = (key) => (e) => {
    const value = e.target.value
    setValues((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    if (formError) setFormError('')
  }

  const setPasswordMode = (mode) => {
    setValues((prev) => ({ ...prev, passwordMode: mode }))
    setFieldErrors((prev) => ({ ...prev, password: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return // guards double-click / Enter spam

    const errors = validateCreateUserForm(values)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    const payload = buildCreateUserPayload(values)
    submittingRef.current = true
    setSubmitting(true)
    setFormError('')
    try {
      const result = await superadminService.createUser(payload)
      submittingRef.current = false
      if (mountedRef.current) setSubmitting(false)
      onCreated?.(result, payload)
    } catch (err) {
      submittingRef.current = false
      if (!mountedRef.current) return
      const mapped = mapCreateUserError(err)
      setFieldErrors(mapped.fieldErrors)
      setFormError(mapped.formError)
      setSubmitting(false)
    }
  }

  const manual = values.passwordMode === PASSWORD_MODE.MANUAL
  const id = (suffix) => `${baseId}-${suffix}`
  const describedBy = (key) => (fieldErrors[key] ? id(`${key}-error`) : undefined)

  return (
    <div className="cu-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose() }}>
      <div className="cu-dialog" role="dialog" aria-modal="true" aria-labelledby={id('title')}>
        <header className="cu-header">
          <div className="cu-header-icon" aria-hidden="true"><UserPlus size={18} /></div>
          <div className="cu-header-text">
            <h3 id={id('title')}>Create user</h3>
            <p>Provision a verified account with a personal workspace.</p>
          </div>
          <button type="button" className="cu-close" onClick={requestClose} disabled={submitting} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <form className="cu-form" onSubmit={handleSubmit} noValidate>
          {formError && <div className="sa-alert sa-alert--error" role="alert">{formError}</div>}

          <div className="cu-field">
            <label htmlFor={id('name')}>Full name</label>
            <input
              ref={nameRef}
              id={id('name')}
              className="sa-input"
              type="text"
              autoComplete="off"
              maxLength={60}
              value={values.name}
              onChange={setField('name')}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={describedBy('name')}
            />
            {fieldErrors.name && <span id={id('name-error')} className="cu-error">{fieldErrors.name}</span>}
          </div>

          <div className="cu-field">
            <label htmlFor={id('email')}>Email address</label>
            <input
              id={id('email')}
              className="sa-input"
              type="email"
              inputMode="email"
              autoComplete="off"
              maxLength={254}
              value={values.email}
              onChange={setField('email')}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={describedBy('email')}
            />
            {fieldErrors.email && <span id={id('email-error')} className="cu-error">{fieldErrors.email}</span>}
          </div>

          <fieldset className="cu-field cu-modes" disabled={submitting}>
            <legend>How should they sign in?</legend>
            <label className={`cu-mode ${!manual ? 'is-active' : ''}`}>
              <input
                type="radio"
                name={id('mode')}
                checked={!manual}
                onChange={() => setPasswordMode(PASSWORD_MODE.EMAIL_LINK)}
              />
              <Mail size={16} aria-hidden="true" />
              <span>
                <strong>Email a set-password link</strong>
                <small>They choose their own password. Link is valid for 3 days.</small>
              </span>
            </label>
            <label className={`cu-mode ${manual ? 'is-active' : ''}`}>
              <input
                type="radio"
                name={id('mode')}
                checked={manual}
                onChange={() => setPasswordMode(PASSWORD_MODE.MANUAL)}
              />
              <KeyRound size={16} aria-hidden="true" />
              <span>
                <strong>Set a password now</strong>
                <small>Share it with them securely — it is never emailed.</small>
              </span>
            </label>
          </fieldset>

          {manual && (
            <>
              <div className="cu-field">
                <label htmlFor={id('password')}>Password</label>
                <div className="cu-password">
                  <input
                    id={id('password')}
                    className="sa-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={values.password}
                    onChange={setField('password')}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={describedBy('password') || id('password-hint')}
                  />
                  <button
                    type="button"
                    className="cu-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password
                  ? <span id={id('password-error')} className="cu-error">{fieldErrors.password}</span>
                  : <span id={id('password-hint')} className="cu-hint">At least {PASSWORD_MIN} characters.</span>}
              </div>

              <label className="cu-check">
                <input
                  type="checkbox"
                  checked={values.sendWelcomeEmail}
                  disabled={submitting}
                  onChange={(e) => setValues((prev) => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                />
                <span>Also send a welcome email with a link to set their own password</span>
              </label>
            </>
          )}

          <footer className="cu-footer">
            <button type="button" className="sa-btn sa-btn--ghost" onClick={requestClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="sa-btn sa-btn--primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create user'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
