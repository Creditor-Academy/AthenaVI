import { useState } from 'react'
import { MdClose, MdDelete, MdWarning, MdBusiness, MdGroup, MdEdit, MdCheck } from 'react-icons/md'

const styles = `
.workspace-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.workspace-settings-dialog {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.workspace-settings-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.workspace-settings-close {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.workspace-settings-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.workspace-info-section {
  margin-bottom: 32px;
}

.workspace-info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.workspace-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.workspace-icon.private {
  background: #f3f4f6;
  color: #6b7280;
}

.workspace-icon.team {
  background: #dbeafe;
  color: #3b82f6;
}

.workspace-details h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.workspace-details p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.workspace-form-group {
  margin-bottom: 20px;
}

.workspace-form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.workspace-form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.workspace-form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.workspace-form-input[readonly] {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.workspace-form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #ffffff;
}

.workspace-form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.workspace-form-select:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.workspace-danger-zone {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;
}

.workspace-danger-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.workspace-danger-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
}

.workspace-danger-icon {
  color: #dc2626;
  font-size: 24px;
}

.workspace-danger-text {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #991b1b;
  line-height: 1.6;
}

.workspace-form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-danger {
  padding: 10px 20px;
  border: 1px solid #dc2626;
  background: #dc2626;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.btn-danger:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
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
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.workspace-warning-icon {
  color: #f59e0b;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.workspace-warning-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
}

.workspace-warning-content p {
  margin: 0;
  font-size: 13px;
  color: #78350f;
  line-height: 1.5;
}

.workspace-confirmation-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.workspace-confirmation-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #dc2626;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.workspace-confirmation-checkbox.checked {
  background: #dc2626;
  border-color: #dc2626;
}

.workspace-confirmation-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.workspace-confirmation-text strong {
  color: #dc2626;
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
