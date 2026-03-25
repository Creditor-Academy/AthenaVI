import { useState } from 'react'
import { MdBusiness, MdGroup, MdArrowDropDown, MdCheck, MdAdd } from 'react-icons/md'

const styles = `
.workspace-selector-container {
  position: relative;
}

.workspace-selector-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 280px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.workspace-selector-trigger:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.workspace-selector-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.workspace-selector-icon.private {
  background: #f3f4f6;
  color: #6b7280;
}

.workspace-selector-icon.team {
  background: #dbeafe;
  color: #3b82f6;
}

.workspace-selector-info {
  flex: 1;
  min-width: 0;
}

.workspace-selector-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-selector-type {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.workspace-selector-arrow {
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.workspace-selector-trigger.open .workspace-selector-arrow {
  transform: rotate(180deg);
}

.workspace-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
  max-height: 400px;
  overflow-y: auto;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.workspace-dropdown-header {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.workspace-dropdown-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.workspace-list {
  padding: 8px;
}

.workspace-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.workspace-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.workspace-item.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.workspace-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.workspace-item-icon.private {
  background: #f3f4f6;
  color: #6b7280;
}

.workspace-item-icon.team {
  background: #dbeafe;
  color: #3b82f6;
}

.workspace-item-info {
  flex: 1;
  min-width: 0;
}

.workspace-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-item-type {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.workspace-item-check {
  color: #3b82f6;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.workspace-item.active .workspace-item-check {
  opacity: 1;
}

.workspace-dropdown-footer {
  padding: 12px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.workspace-create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.workspace-create-btn:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.workspace-create-btn-icon {
  color: #3b82f6;
}

.workspace-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workspace-type-badge.private {
  background: #f3f4f6;
  color: #6b7280;
}

.workspace-type-badge.team {
  background: #dbeafe;
  color: #3b82f6;
}

.workspace-role-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  margin-left: 6px;
}

.workspace-role-badge.owner {
  background: #fef3c7;
  color: #92400e;
}

.workspace-role-badge.admin {
  background: #e0e7ff;
  color: #3730a3;
}

.workspace-role-badge.member {
  background: #f3f4f6;
  color: #374151;
}

@media (max-width: 480px) {
  .workspace-selector-trigger {
    min-width: 240px;
  }

  .workspace-selector-name {
    font-size: 14px;
  }

  .workspace-selector-type {
    font-size: 11px;
  }
}
`

function WorkspaceSelector({ 
  workspaces = [], 
  currentWorkspace, 
  onWorkspaceChange, 
  onCreateWorkspace,
  loading = false 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleWorkspaceSelect = (workspace) => {
    onWorkspaceChange(workspace)
    setIsOpen(false)
  }

  const handleCreateWorkspace = () => {
    setIsOpen(false)
    onCreateWorkspace()
  }

  const handleClickOutside = (e) => {
    if (!e.target.closest('.workspace-selector-container')) {
      setIsOpen(false)
    }
  }

  // Add click outside listener
  if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside)
  }

  const currentWorkspaceData = workspaces.find(w => w.id === currentWorkspace?.id) || currentWorkspace

  return (
    <>
      <style>{styles}</style>
      <div className="workspace-selector-container">
        <div 
          className={`workspace-selector-trigger ${isOpen ? 'open' : ''}`}
          onClick={handleToggle}
        >
          <div className={`workspace-selector-icon ${currentWorkspaceData?.type?.toLowerCase() || 'private'}`}>
            {currentWorkspaceData?.type === 'TEAM' ? <MdGroup /> : <MdBusiness />}
          </div>
          <div className="workspace-selector-info">
            <h3 className="workspace-selector-name">
              {currentWorkspaceData?.name || 'Select Workspace'}
            </h3>
            <p className="workspace-selector-type">
              {currentWorkspaceData?.type === 'TEAM' ? <MdGroup /> : <MdBusiness />}
              {currentWorkspaceData?.type === 'TEAM' ? 'Team Workspace' : 'Private Workspace'}
              {currentWorkspaceData?.userRole && (
                <span className={`workspace-role-badge ${currentWorkspaceData.userRole.toLowerCase()}`}>
                  {currentWorkspaceData.userRole}
                </span>
              )}
            </p>
          </div>
          <MdArrowDropDown className="workspace-selector-arrow" size={20} />
        </div>

        {isOpen && (
          <div className="workspace-dropdown">
            <div className="workspace-dropdown-header">
              <h3 className="workspace-dropdown-title">Your Workspaces</h3>
            </div>

            <div className="workspace-list">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`workspace-item ${workspace.id === currentWorkspace?.id ? 'active' : ''}`}
                  onClick={() => handleWorkspaceSelect(workspace)}
                >
                  <div className={`workspace-item-icon ${workspace.type.toLowerCase()}`}>
                    {workspace.type === 'TEAM' ? <MdGroup /> : <MdBusiness />}
                  </div>
                  <div className="workspace-item-info">
                    <h4 className="workspace-item-name">{workspace.name}</h4>
                    <p className="workspace-item-type">
                      {workspace.type === 'TEAM' ? <MdGroup /> : <MdBusiness />}
                      {workspace.type === 'TEAM' ? 'Team' : 'Private'}
                      {workspace.userRole && (
                        <span className={`workspace-role-badge ${workspace.userRole.toLowerCase()}`}>
                          {workspace.userRole}
                        </span>
                      )}
                    </p>
                  </div>
                  {workspace.id === currentWorkspace?.id && (
                    <MdCheck className="workspace-item-check" />
                  )}
                </div>
              ))}

              {workspaces.length === 0 && !loading && (
                <div style={{ 
                  padding: '24px 16px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  fontSize: '13px'
                }}>
                  No workspaces found. Create your first workspace to get started.
                </div>
              )}

              {loading && (
                <div style={{ 
                  padding: '24px 16px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  fontSize: '13px'
                }}>
                  Loading workspaces...
                </div>
              )}
            </div>

            <div className="workspace-dropdown-footer">
              <button className="workspace-create-btn" onClick={handleCreateWorkspace}>
                <MdAdd className="workspace-create-btn-icon" />
                Create New Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default WorkspaceSelector
