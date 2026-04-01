import { useState } from 'react'
import { MdClose, MdBusiness, MdGroup, MdAdd } from 'react-icons/md'

const styles = `
.workspace-create-overlay {
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

.workspace-create-dialog {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 480px;
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

.workspace-create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.workspace-create-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.workspace-create-close {
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

.workspace-create-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.workspace-form-group {
  margin-bottom: 24px;
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

.workspace-form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.workspace-form-error {
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

.workspace-type-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.workspace-type-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.workspace-type-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.workspace-type-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.workspace-type-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 24px;
}

.workspace-type-icon.private {
  background: #f3f4f6;
  color: #6b7280;
}

.workspace-type-icon.team {
  background: #dbeafe;
  color: #3b82f6;
}

.workspace-type-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.workspace-type-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
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

.btn-primary:disabled {
  background: #9ca3af;
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
`

function WorkspaceCreateForm({ isOpen, onClose, onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'team'
  })
  const [formErrors, setFormErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    const errors = {}
    if (!formData.name.trim()) {
      errors.name = 'Workspace name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Workspace name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Workspace name must be less than 50 characters'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    onSubmit(formData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <>
      <style>{styles}</style>
      <div className="workspace-create-overlay" onClick={onClose}>
        <div className="workspace-create-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="workspace-create-header">
            <h2 className="workspace-create-title">Create New Workspace</h2>
            <button className="workspace-create-close" onClick={onClose}>
              <MdClose size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="workspace-form-group">
              <label className="workspace-form-label" htmlFor="workspace-name">
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                className={`workspace-form-input ${formErrors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter workspace name"
                maxLength={50}
                disabled={loading}
              />
              {formErrors.name && (
                <div className="workspace-form-error">{formErrors.name}</div>
              )}
            </div>

            <div className="workspace-form-group">
              <label className="workspace-form-label">Workspace Type</label>
              <div className="workspace-type-selection">
                <div
                  className={`workspace-type-card ${formData.type === 'private' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('type', 'private')}
                >
                  <div className="workspace-type-icon private">
                    <MdBusiness />
                  </div>
                  <h3 className="workspace-type-title">Private</h3>
                  <p className="workspace-type-description">
                    Only you can access this workspace. Perfect for personal projects.
                  </p>
                </div>

                <div
                  className={`workspace-type-card ${formData.type === 'team' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('type', 'team')}
                >
                  <div className="workspace-type-icon team">
                    <MdGroup />
                  </div>
                  <h3 className="workspace-type-title">Team</h3>
                  <p className="workspace-type-description">
                    Invite team members to collaborate. Great for team projects.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="workspace-form-error">{error}</div>
            )}

            <div className="workspace-form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? (
                  <div className="workspace-loading"></div>
                ) : (
                  <MdAdd />
                )}
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default WorkspaceCreateForm
