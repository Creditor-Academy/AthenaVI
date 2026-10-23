import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  X,
  Eye,
  EyeOff,
  UserPlus,
  User,
  Mail,
  KeyRound,
  Lock,
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Loader2,
} from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import {
  INITIAL_CREATE_USER_VALUES,
  PASSWORD_MODE,
  PASSWORD_MIN,
  validateCreateUserForm,
  buildCreateUserPayload,
  mapCreateUserError,
  parseCsvUsers,
  downloadUserCsvTemplate,
} from './createUserForm'
import '../../../../pages/AdminPortal/styles/SuperadminBase.css'
import '../../../../pages/AdminPortal/styles/SuperadminCreateUser.css'

/**
 * Superadmin dialog to provision individual accounts or batch-import via CSV.
 * `onCreated(result, payload)` fires after successful account creation.
 */
export default function CreateUserModal({ open, onClose, onCreated }) {
  return open ? <CreateUserDialog onClose={onClose} onCreated={onCreated} /> : null
}

const TAB = Object.freeze({
  SINGLE: 'single',
  BULK_CSV: 'bulk-csv',
})

function CreateUserDialog({ onClose, onCreated }) {
  const [activeTab, setActiveTab] = useState(TAB.SINGLE)
  const baseId = useId()
  const mountedRef = useRef(true)
  const submittingRef = useRef(false)

  // Single User State
  const [values, setValues] = useState(INITIAL_CREATE_USER_VALUES)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const nameRef = useRef(null)

  // Bulk CSV State
  const [csvFile, setCsvFile] = useState(null)
  const [csvData, setCsvData] = useState(null)
  const [csvError, setCsvError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [bulkSendWelcomeEmail, setBulkSendWelcomeEmail] = useState(true)
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, percent: 0 })
  const [bulkResults, setBulkResults] = useState(null) // { successCount, failedCount, finished: boolean }
  const fileInputRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (activeTab === TAB.SINGLE) {
      nameRef.current?.focus()
    }
  }, [activeTab])

  const isBusy = submitting || bulkImporting

  const requestClose = useCallback(() => {
    if (!isBusy) onClose?.()
  }, [isBusy, onClose])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [requestClose])

  // Single User handlers
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

  const handleSingleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return

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

  // CSV Bulk Import handlers
  const handleFileSelected = (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setCsvError('Please upload a valid .csv file.')
      return
    }

    setCsvError('')
    setBulkResults(null)
    setCsvFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result || ''
        const parsed = parseCsvUsers(text)
        if (parsed.error) {
          setCsvError(parsed.error)
          setCsvData(null)
        } else {
          setCsvData(parsed)
        }
      } catch (err) {
        setCsvError(err.message || 'Failed to parse CSV file.')
        setCsvData(null)
      }
    }
    reader.onerror = () => {
      setCsvError('Failed to read file content.')
      setCsvData(null)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (isBusy) return
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFileSelected(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!isBusy) setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const removeCsvFile = () => {
    if (isBusy) return
    setCsvFile(null)
    setCsvData(null)
    setCsvError('')
    setBulkResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleBulkImport = async () => {
    if (!csvData || !csvData.validRows.length || isBusy) return

    setBulkImporting(true)
    submittingRef.current = true
    const validRows = csvData.validRows
    const total = validRows.length
    setBulkProgress({ current: 0, total, percent: 0 })

    let successCount = 0
    let failedCount = 0

    // Clone rows to display live status
    const updatedRows = [...csvData.rows]

    for (let i = 0; i < total; i++) {
      const targetRow = validRows[i]
      const rowIndex = updatedRows.findIndex((r) => r.id === targetRow.id)

      if (rowIndex !== -1) {
        updatedRows[rowIndex] = { ...updatedRows[rowIndex], status: 'loading' }
        setCsvData((prev) => ({ ...prev, rows: [...updatedRows] }))
      }

      setBulkProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
      })

      const payload = {
        name: targetRow.name,
        email: targetRow.email,
        sendWelcomeEmail: bulkSendWelcomeEmail,
      }
      if (targetRow.password) {
        payload.password = targetRow.password
      }

      try {
        await superadminService.createUser(payload)
        successCount++
        if (rowIndex !== -1) {
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            status: 'success',
            statusMessage: 'Created',
          }
        }
      } catch (err) {
        failedCount++
        const errorMsg = err?.status === 409 ? 'Already exists' : err.message || 'Creation failed'
        if (rowIndex !== -1) {
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            status: 'error',
            statusMessage: errorMsg,
          }
        }
      }

      setCsvData((prev) => ({ ...prev, rows: [...updatedRows] }))
    }

    submittingRef.current = false
    if (mountedRef.current) {
      setBulkImporting(false)
      setBulkResults({
        successCount,
        failedCount,
        finished: true,
        total,
      })
    }
  }

  const handleBulkComplete = () => {
    if (bulkResults?.successCount > 0) {
      onCreated?.(
        {
          isBulk: true,
          successCount: bulkResults.successCount,
          failedCount: bulkResults.failedCount,
          total: bulkResults.total,
        },
        { isBulk: true }
      )
    } else {
      requestClose()
    }
  }

  const id = (suffix) => `${baseId}-${suffix}`
  const describedBy = (key) => (fieldErrors[key] ? id(`${key}-error`) : undefined)
  const isWide = activeTab === TAB.BULK_CSV && Boolean(csvData)
  const manual = values.passwordMode === PASSWORD_MODE.MANUAL

  return (
    <div
      className="cu-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div
        className={`cu-dialog ${isWide ? 'cu-dialog--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id('title')}
      >
        {/* ── Dialog Header ── */}
        <header className="cu-header">
          <div className="cu-header-main">
            <div className="cu-header-icon" aria-hidden="true">
              {activeTab === TAB.BULK_CSV ? <FileSpreadsheet size={20} /> : <UserPlus size={20} />}
            </div>
            <div className="cu-header-text">
              <h3 id={id('title')}>
                {activeTab === TAB.BULK_CSV ? 'Batch Import Users' : 'Create User Account'}
              </h3>
              <p>
                {activeTab === TAB.BULK_CSV
                  ? 'Import multiple accounts at once using a structured CSV spreadsheet.'
                  : 'Provision a verified user account with workspace and access rights.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cu-close"
            onClick={requestClose}
            disabled={isBusy}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </header>

        {/* ── Segmented Navigation Tabs ── */}
        <nav className="cu-nav" aria-label="Creation mode tabs">
          <button
            type="button"
            className={`cu-nav-btn ${activeTab === TAB.SINGLE ? 'is-active' : ''}`}
            onClick={() => setActiveTab(TAB.SINGLE)}
            disabled={isBusy}
          >
            <User size={15} /> Single User
          </button>
          <button
            type="button"
            className={`cu-nav-btn ${activeTab === TAB.BULK_CSV ? 'is-active' : ''}`}
            onClick={() => setActiveTab(TAB.BULK_CSV)}
            disabled={isBusy}
          >
            <FileSpreadsheet size={15} /> Bulk Import (CSV)
          </button>
        </nav>

        {/* ── Tab Content: Single User ── */}
        {activeTab === TAB.SINGLE && (
          <form className="cu-form" onSubmit={handleSingleSubmit} noValidate>
            <div className="cu-body">
              {formError && (
                <div className="sa-alert sa-alert--error" role="alert">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="cu-field">
                <div className="cu-field-header">
                  <label htmlFor={id('name')} className="cu-label">
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                </div>
                <div className={`cu-input-wrapper ${fieldErrors.name ? 'has-error' : ''}`}>
                  <span className="cu-input-icon">
                    <User size={15} />
                  </span>
                  <input
                    ref={nameRef}
                    id={id('name')}
                    className="cu-input"
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    autoComplete="off"
                    maxLength={60}
                    value={values.name}
                    onChange={setField('name')}
                    disabled={isBusy}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={describedBy('name')}
                  />
                </div>
                {fieldErrors.name && (
                  <span id={id('name-error')} className="cu-error">
                    <AlertCircle size={12} /> {fieldErrors.name}
                  </span>
                )}
              </div>

              {/* Email Address */}
              <div className="cu-field">
                <div className="cu-field-header">
                  <label htmlFor={id('email')} className="cu-label">
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                </div>
                <div className={`cu-input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
                  <span className="cu-input-icon">
                    <Mail size={15} />
                  </span>
                  <input
                    id={id('email')}
                    className="cu-input"
                    type="email"
                    placeholder="e.g. sarah@example.com"
                    inputMode="email"
                    autoComplete="off"
                    maxLength={254}
                    value={values.email}
                    onChange={setField('email')}
                    disabled={isBusy}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={describedBy('email')}
                  />
                </div>
                {fieldErrors.email && (
                  <span id={id('email-error')} className="cu-error">
                    <AlertCircle size={12} /> {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Authentication Mode Grid */}
              <div className="cu-field">
                <div className="cu-field-header">
                  <span className="cu-label">Authentication Method</span>
                </div>
                <div className="cu-mode-grid">
                  <div
                    className={`cu-mode-card ${!manual ? 'is-active' : ''}`}
                    onClick={() => !isBusy && setPasswordMode(PASSWORD_MODE.EMAIL_LINK)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') setPasswordMode(PASSWORD_MODE.EMAIL_LINK)
                    }}
                  >
                    <div className="cu-mode-top">
                      <div className="cu-mode-top-icon">
                        <Mail size={18} />
                      </div>
                      <span className="cu-mode-badge">Recommended</span>
                    </div>
                    <div className="cu-mode-title">
                      <input
                        type="radio"
                        name={id('mode')}
                        checked={!manual}
                        onChange={() => setPasswordMode(PASSWORD_MODE.EMAIL_LINK)}
                        disabled={isBusy}
                      />
                      <span>Email Sign-in Link</span>
                    </div>
                    <p className="cu-mode-desc">
                      Sends an invitation email with a link for the user to securely set their own password.
                    </p>
                  </div>

                  <div
                    className={`cu-mode-card ${manual ? 'is-active' : ''}`}
                    onClick={() => !isBusy && setPasswordMode(PASSWORD_MODE.MANUAL)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') setPasswordMode(PASSWORD_MODE.MANUAL)
                    }}
                  >
                    <div className="cu-mode-top">
                      <div className="cu-mode-top-icon">
                        <KeyRound size={18} />
                      </div>
                    </div>
                    <div className="cu-mode-title">
                      <input
                        type="radio"
                        name={id('mode')}
                        checked={manual}
                        onChange={() => setPasswordMode(PASSWORD_MODE.MANUAL)}
                        disabled={isBusy}
                      />
                      <span>Set Password Now</span>
                    </div>
                    <p className="cu-mode-desc">
                      Specify a custom password immediately and communicate it directly to the user.
                    </p>
                  </div>
                </div>
              </div>

              {/* Manual Password Details */}
              {manual && (
                <>
                  <div className="cu-field">
                    <div className="cu-field-header">
                      <label htmlFor={id('password')} className="cu-label">
                        Initial Password <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span className="cu-hint">Min. {PASSWORD_MIN} characters</span>
                    </div>
                    <div className={`cu-input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
                      <span className="cu-input-icon">
                        <Lock size={15} />
                      </span>
                      <input
                        id={id('password')}
                        className="cu-input cu-password-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter secure password"
                        autoComplete="new-password"
                        value={values.password}
                        onChange={setField('password')}
                        disabled={isBusy}
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby={describedBy('password')}
                      />
                      <button
                        type="button"
                        className="cu-toggle-pwd"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <span id={id('password-error')} className="cu-error">
                        <AlertCircle size={12} /> {fieldErrors.password}
                      </span>
                    )}
                  </div>

                  <label className="cu-check-card">
                    <input
                      type="checkbox"
                      checked={values.sendWelcomeEmail}
                      disabled={isBusy}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, sendWelcomeEmail: e.target.checked }))
                      }
                    />
                    <div className="cu-check-text">
                      <strong>Send welcome email notification</strong>
                      <small>Notifies the user their account is ready and includes a reset password option.</small>
                    </div>
                  </label>
                </>
              )}
            </div>

            {/* Single User Footer */}
            <footer className="cu-footer">
              <span className="cu-footer-summary">
                {manual ? 'User will sign in with manual password' : 'Email invitation will be sent'}
              </span>
              <div className="cu-footer-actions">
                <button
                  type="button"
                  className="sa-btn sa-btn--ghost"
                  onClick={requestClose}
                  disabled={isBusy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sa-btn sa-btn--primary"
                  disabled={isBusy}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="sa-spinner" /> Creating…
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} /> Create User
                    </>
                  )}
                </button>
              </div>
            </footer>
          </form>
        )}

        {/* ── Tab Content: Bulk CSV Import ── */}
        {activeTab === TAB.BULK_CSV && (
          <div className="cu-bulk-section">
            <div className="cu-body">
              {/* Instructions and Download Template */}
              <div className="cu-banner">
                <div className="cu-banner-content">
                  <div className="cu-banner-icon">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div className="cu-banner-text">
                    <p>
                      Upload a CSV file containing <code>Name</code>, <code>Email</code>, and optional{' '}
                      <code>Password</code> columns. If <code>Password</code> is omitted, users receive an invitation email.
                    </p>
                  </div>
                </div>
                <div className="cu-banner-action">
                  <button
                    type="button"
                    className="sa-btn sa-btn--sm sa-btn--ghost"
                    onClick={downloadUserCsvTemplate}
                    disabled={isBusy}
                  >
                    <Download size={13} /> Sample Template
                  </button>
                </div>
              </div>

              {csvError && (
                <div className="sa-alert sa-alert--error" role="alert">
                  <AlertCircle size={16} />
                  <span>{csvError}</span>
                </div>
              )}

              {/* File Dropzone or Active File Header */}
              {!csvFile ? (
                <div
                  className={`cu-dropzone ${isDragOver ? 'is-dragover' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') fileInputRef.current?.click()
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,application/vnd.ms-excel"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                  />
                  <div className="cu-dropzone-icon">
                    <UploadCloud size={26} />
                  </div>
                  <div className="cu-dropzone-title">Click to upload or drag &amp; drop CSV</div>
                  <div className="cu-dropzone-desc">
                    Supported file: <strong>.CSV</strong> (UTF-8 encoded) · Up to 100 rows per batch
                  </div>
                </div>
              ) : (
                <div className="cu-file-bar">
                  <div className="cu-file-info">
                    <div className="cu-file-icon">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div className="cu-file-details">
                      <span className="cu-file-name">{csvFile.name}</span>
                      <span className="cu-file-meta">
                        {(csvFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  <div className="cu-chips">
                    {csvData && (
                      <>
                        <span className="cu-chip cu-chip--total">
                          {csvData.totalCount} {csvData.totalCount === 1 ? 'Row' : 'Rows'}
                        </span>
                        <span className="cu-chip cu-chip--valid">
                          <CheckCircle2 size={11} /> {csvData.validCount} Valid
                        </span>
                        {csvData.invalidCount > 0 && (
                          <span className="cu-chip cu-chip--invalid">
                            <AlertTriangle size={11} /> {csvData.invalidCount} Invalid
                          </span>
                        )}
                      </>
                    )}
                    <button
                      type="button"
                      className="sa-btn sa-btn--sm sa-btn--ghost"
                      onClick={removeCsvFile}
                      disabled={isBusy}
                      title="Remove file"
                    >
                      <Trash2 size={13} /> Change
                    </button>
                  </div>
                </div>
              )}

              {/* Live Import Progress */}
              {bulkImporting && (
                <div className="cu-progress-container">
                  <div className="cu-progress-header">
                    <span>
                      Importing user accounts: {bulkProgress.current} of {bulkProgress.total}
                    </span>
                    <span>{bulkProgress.percent}%</span>
                  </div>
                  <div className="cu-progress-track">
                    <div
                      className="cu-progress-fill"
                      style={{ width: `${bulkProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Completion Banner */}
              {bulkResults?.finished && (
                <div
                  className={`sa-alert ${
                    bulkResults.failedCount > 0 ? 'sa-alert--warning' : 'sa-alert--success'
                  }`}
                >
                  {bulkResults.failedCount > 0 ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  <span>
                    {bulkResults.failedCount > 0
                      ? `Batch complete: ${bulkResults.successCount} users created successfully, ${bulkResults.failedCount} failed.`
                      : `Batch complete: Successfully created all ${bulkResults.successCount} users.`}
                  </span>
                </div>
              )}

              {/* Data Preview Table */}
              {csvData && csvData.rows.length > 0 && (
                <div className="cu-table-container">
                  <div className="cu-table-scroll sa-scroll">
                    <table className="cu-table">
                      <thead>
                        <tr>
                          <th style={{ width: 44 }}>#</th>
                          <th>Full Name</th>
                          <th>Email Address</th>
                          <th>Auth Mode</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.rows.map((row) => {
                          const hasErr = !row.isValid
                          const isSuccess = row.status === 'success'
                          const isFailed = row.status === 'error'
                          const isLoading = row.status === 'loading'

                          let statusContent = null
                          if (isLoading) {
                            statusContent = (
                              <span className="cu-badge-status cu-badge-status--loading">
                                <Loader2 size={12} className="sa-spinner" /> Creating…
                              </span>
                            )
                          } else if (isSuccess) {
                            statusContent = (
                              <span className="cu-badge-status cu-badge-status--success">
                                <CheckCircle2 size={12} /> Created
                              </span>
                            )
                          } else if (isFailed) {
                            statusContent = (
                              <span className="cu-badge-status cu-badge-status--invalid" title={row.statusMessage}>
                                <AlertCircle size={12} /> {row.statusMessage || 'Failed'}
                              </span>
                            )
                          } else if (hasErr) {
                            const errText = Object.values(row.errors)[0] || 'Invalid format'
                            statusContent = (
                              <span className="cu-badge-status cu-badge-status--invalid" title={errText}>
                                <AlertTriangle size={12} /> {errText}
                              </span>
                            )
                          } else {
                            statusContent = (
                              <span className="cu-badge-status cu-badge-status--ready">
                                <CheckCircle2 size={12} /> Ready
                              </span>
                            )
                          }

                          return (
                            <tr key={row.id} className={hasErr ? 'is-row-invalid' : ''}>
                              <td style={{ color: 'var(--text-muted)' }}>{row.rowNumber}</td>
                              <td style={{ fontWeight: 600 }}>{row.name || '—'}</td>
                              <td>{row.email || '—'}</td>
                              <td>
                                {row.password ? (
                                  <span className="sa-badge sa-badge--type">Manual password</span>
                                ) : (
                                  <span className="sa-badge sa-badge--admin">Email link</span>
                                )}
                              </td>
                              <td>{statusContent}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Options */}
              {csvData && !bulkResults?.finished && (
                <label className="cu-check-card">
                  <input
                    type="checkbox"
                    checked={bulkSendWelcomeEmail}
                    disabled={isBusy}
                    onChange={(e) => setBulkSendWelcomeEmail(e.target.checked)}
                  />
                  <div className="cu-check-text">
                    <strong>Send invitation and welcome emails</strong>
                    <small>Sends set-password links or account readiness notices to each newly created user.</small>
                  </div>
                </label>
              )}
            </div>

            {/* CSV Footer */}
            <footer className="cu-footer">
              <span className="cu-footer-summary">
                {csvData
                  ? `${csvData.validCount} valid user${csvData.validCount === 1 ? '' : 's'} ready to import`
                  : 'Select a CSV file to begin'}
              </span>
              <div className="cu-footer-actions">
                <button
                  type="button"
                  className="sa-btn sa-btn--ghost"
                  onClick={requestClose}
                  disabled={isBusy}
                >
                  {bulkResults?.finished ? 'Close' : 'Cancel'}
                </button>

                {bulkResults?.finished ? (
                  <button
                    type="button"
                    className="sa-btn sa-btn--primary"
                    onClick={handleBulkComplete}
                  >
                    Done &amp; View Users
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sa-btn sa-btn--primary"
                    onClick={handleBulkImport}
                    disabled={!csvData || csvData.validCount === 0 || isBusy}
                  >
                    {bulkImporting ? (
                      <>
                        <Loader2 size={14} className="sa-spinner" /> Importing…
                      </>
                    ) : (
                      <>
                        <UploadCloud size={14} /> Import {csvData ? csvData.validCount : ''} Users
                      </>
                    )}
                  </button>
                )}
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}
