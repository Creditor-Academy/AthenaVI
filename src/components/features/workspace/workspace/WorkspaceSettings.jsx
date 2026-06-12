import { useState } from 'react'
import { MdClose, MdDelete, MdWarning, MdBusiness, MdGroup, MdEdit, MdCheck } from 'react-icons/md'

const styles = `
.workspace-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2500;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.workspace-settings-dialog {
  display: flex;
  width: 560px;
  max-width: 100%;
  padding: 0;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg-card) 75%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid color-mix(in srgb, var(--border-color) 45%, transparent);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px color-mix(in srgb, var(--border-color) 25%, transparent);
  color: var(--text-main);
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: 'Outfit', var(--font-family);
  animation: slideUp 0.3s ease;
  gap: 0;
}

.workspace-settings-dialog form {
  width: 100%;
  padding: 20px 24px 24px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.workspace-settings-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: none;
  background: var(--primary);
  padding: 18px 24px;
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
  box-sizing: border-box;
}

.workspace-settings-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-contrast);
  letter-spacing: -0.010em;
}

.workspace-settings-close {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: var(--primary-contrast);
  opacity: 0.85;
  transition: opacity 0.2s, background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.workspace-settings-close:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--primary-contrast) 15%, transparent);
  color: var(--primary-contrast);
}

.workspace-info-section {
  width: 100%;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workspace-info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.workspace-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.workspace-icon.private {
  background: color-mix(in srgb, var(--text-muted) 15%, transparent);
  color: var(--text-muted);
}

.workspace-icon.team {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary);
}

.workspace-details h3 {
  margin: 0 0 2px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.workspace-details p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.workspace-form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 6px;
}

.workspace-form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.workspace-form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
  background: color-mix(in srgb, var(--bg-surface) 40%, transparent);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}

.workspace-form-input:focus {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--bg-surface) 60%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
}

.workspace-form-input[readonly] {
  background: color-mix(in srgb, var(--bg-surface) 20%, transparent);
  color: var(--text-muted);
  cursor: not-allowed;
}

.workspace-form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
  background: color-mix(in srgb, var(--bg-surface) 40%, transparent);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}

.workspace-form-select:focus {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--bg-surface) 60%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
}

.workspace-form-select:disabled {
  background: color-mix(in srgb, var(--bg-surface) 20%, transparent);
  color: var(--text-muted);
  cursor: not-allowed;
}

.workspace-danger-zone {
  background: color-mix(in srgb, var(--delete-red) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--delete-red) 25%, transparent);
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
  width: 100%;
  box-sizing: border-box;
}

.workspace-danger-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.workspace-danger-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--delete-red);
}

.workspace-danger-icon {
  color: var(--delete-red);
  font-size: 20px;
}

.workspace-danger-text {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.workspace-form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 12px;
  width: 100%;
}

.btn-secondary {
  padding: 10px 18px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-secondary:hover {
  background: color-mix(in srgb, var(--bg-surface) 60%, transparent);
  border-color: var(--text-muted);
}

.btn-primary {
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--primary);
  color: var(--primary-contrast);
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-danger {
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--delete-red);
  color: white;
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-danger:hover {
  background: color-mix(in srgb, var(--delete-red) 85%, black);
}

.btn-danger:active {
  transform: scale(0.98);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.workspace-loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.workspace-warning-box {
  background: color-mix(in srgb, #f59e0b 10%, transparent);
  border: 1px solid color-mix(in srgb, #f59e0b 25%, transparent);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.workspace-warning-icon {
  color: #f59e0b;
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.workspace-warning-content h4 {
  margin: 0 0 2px 0;
  font-size: 13px;
  font-weight: 600;
  color: #d97706;
}

.workspace-warning-content p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.workspace-confirmation-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  width: 100%;
}

.workspace-confirmation-checkbox {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--delete-red);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.workspace-confirmation-checkbox.checked {
  background: var(--delete-red);
  border-color: var(--delete-red);
}

.workspace-confirmation-text {
  font-size: 12px;
  color: var(--text-main);
  line-height: 1.5;
}

.workspace-confirmation-text strong {
  color: var(--delete-red);
  font-weight: 600;
}
`

function WorkspaceSettings({ isOpen, onClose, workspace, onUpdate, onDelete, loading, error }) {
  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    type: workspace?.type || 'TEAM'
  })
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = workspace?.userRole === 'OWNER'
  const canDelete = isOwner && workspace?.type === 'TEAM'
  const isPrivate = workspace?.type === 'PRIVATE'

  const handleSubmit = async (e) => {
    e.preventDefault()
    onUpdate(formData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDeleteWorkspace = async () => {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true)
      return
    }

    setDeleting(true)
    try {
      await onDelete(workspace.id)
      onClose()
    } catch (err) {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmation(false)
  }

  if (!isOpen) return null

  return (
    <>
      <style>{styles}</style>
      <div className="workspace-settings-overlay" onClick={onClose}>
        <div className="workspace-settings-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="workspace-settings-header">
            <h2 className="workspace-settings-title">Workspace Settings</h2>
            <button className="workspace-settings-close" onClick={onClose}>
              <MdClose size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="workspace-info-section">
              <div className="workspace-info-header">
                <div className={`workspace-icon ${formData.type.toLowerCase()}`}>
                  {formData.type === 'TEAM' ? <MdGroup /> : <MdBusiness />}
                </div>
                <div className="workspace-details">
                  <h3>{formData.name}</h3>
                  <p>{formData.type === 'TEAM' ? 'Team Workspace' : 'Private Workspace'}</p>
                </div>
              </div>

              <div className="workspace-form-group">
                <label className="workspace-form-label" htmlFor="workspace-name">
                  Workspace Name
                </label>
                <input
                  id="workspace-name"
                  type="text"
                  className="workspace-form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isOwner || loading}
                  maxLength={50}
                />
              </div>

              <div className="workspace-form-group">
                <label className="workspace-form-label" htmlFor="workspace-type">
                  Workspace Type
                </label>
                <select
                  id="workspace-type"
                  className="workspace-form-select"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  disabled={!isOwner || loading || isPrivate}
                >
                  <option value="PRIVATE">Private</option>
                  <option value="TEAM">Team</option>
                </select>
                {isPrivate && (
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Private workspaces cannot be converted to team workspaces
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="workspace-warning-box">
                <MdWarning className="workspace-warning-icon" />
                <div className="workspace-warning-content">
                  <h4>Error</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {canDelete && (
              <div className="workspace-danger-zone">
                <div className="workspace-danger-header">
                  <MdWarning className="workspace-danger-icon" />
                  <h3 className="workspace-danger-title">Danger Zone</h3>
                </div>

                {!deleteConfirmation ? (
                  <>
                    <p className="workspace-danger-text">
                      Deleting this workspace will permanently remove all content, including videos, 
                      projects, and member data. This action cannot be undone.
                    </p>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={handleDeleteWorkspace}
                      disabled={loading}
                    >
                      <MdDelete />
                      Delete Workspace
                    </button>
                  </>
                ) : (
                  <>
                    <div className="workspace-warning-box">
                      <MdWarning className="workspace-warning-icon" />
                      <div className="workspace-warning-content">
                        <h4>Final Confirmation Required</h4>
                        <p>
                          You are about to permanently delete <strong>{formData.name}</strong>. 
                          This action cannot be undone and all data will be lost.
                        </p>
                      </div>
                    </div>

                    <div className="workspace-confirmation-input">
                      <div 
                        className={`workspace-confirmation-checkbox ${deleteConfirmation ? 'checked' : ''}`}
                        onClick={() => setDeleteConfirmation(!deleteConfirmation)}
                      >
                        {deleteConfirmation && <MdCheck size={14} color="white" />}
                      </div>
                      <span className="workspace-confirmation-text">
                        I understand that this action is <strong>permanent and cannot be undone</strong>
                      </span>
                    </div>

                    <div className="workspace-form-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCancelDelete}
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={handleDeleteWorkspace}
                        disabled={!deleteConfirmation || deleting}
                      >
                        {deleting ? (
                          <>
                            <div className="workspace-loading"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <MdDelete />
                            Delete Forever
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {!deleteConfirmation && (
              <div className="workspace-form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                {isOwner && (
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="workspace-loading"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <MdEdit />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  )
}

export default WorkspaceSettings
