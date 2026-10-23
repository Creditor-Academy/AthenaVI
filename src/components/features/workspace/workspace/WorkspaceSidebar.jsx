import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdBusiness, MdGroup, MdAdd, MdCheck } from 'react-icons/md';

const WorkspaceSidebar = ({ 
  isOpen, 
  onClose, 
  workspaces = [], 
  currentWorkspace, 
  onWorkspaceChange, 
  onCreateWorkspace,
  loading = false 
}) => {
  const handleWorkspaceSelect = (workspace) => {
    onWorkspaceChange(workspace);
    onClose();
  };

  const handleCreateWorkspace = () => {
    onCreateWorkspace();
    onClose();
  };

  const styles = `
    .workspace-sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      justify-content: flex-end;
    }

    .workspace-sidebar-panel {
      width: 420px;
      height: 100vh;
      background: var(--bg-card, #ffffff);
      border-left: 1px solid var(--border-color, rgba(226, 232, 240, 0.8));
      box-shadow: -20px 0 40px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--text-main);
    }

    .sidebar-header {
      padding: 24px 32px;
      background: var(--bg-surface, rgba(255, 255, 255, 0.8));
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-color, rgba(226, 232, 240, 0.8));
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sidebar-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main, #1e293b);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sidebar-subtitle {
      font-size: 14px;
      color: var(--text-muted, #64748b);
      margin: 4px 0 0 0;
    }

    .sidebar-close {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--border-color, rgba(226, 232, 240, 0.8));
      background: var(--bg-surface, rgba(255, 255, 255, 0.8));
      color: var(--text-muted, #64748b);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .sidebar-close:hover {
      background: color-mix(in srgb, var(--primary) 10%, var(--bg-surface));
      color: var(--text-main, #475569);
      transform: scale(1.05);
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;
    }

    .workspace-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .workspace-grid {
      display: grid;
      gap: 12px;
    }

    .workspace-card {
      background: var(--bg-surface, white);
      border: 2px solid var(--border-color, #f1f5f9);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .workspace-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary, #3b82f6) 0%, color-mix(in srgb, var(--primary) 70%, #2563eb) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .workspace-card:hover {
      border-color: var(--primary, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px color-mix(in srgb, var(--primary) 15%, transparent);
    }

    .workspace-card:hover::before {
      opacity: 1;
    }

    .workspace-card.active {
      border-color: var(--primary, #3b82f6);
      background: color-mix(in srgb, var(--primary) 10%, var(--bg-card));
      box-shadow: 0 4px 16px color-mix(in srgb, var(--primary) 12%, transparent);
    }

    .workspace-card.active::before {
      opacity: 1;
    }

    .workspace-card-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 12px;
    }

    .workspace-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .workspace-icon.private {
      background: color-mix(in srgb, var(--text-muted) 8%, var(--bg-card));
      color: var(--text-muted, #64748b);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .workspace-icon.team {
      background: color-mix(in srgb, var(--primary) 14%, var(--bg-card));
      color: var(--primary, #2563eb);
      border: 1px solid color-mix(in srgb, var(--primary) 30%, var(--border-color));
    }

    .workspace-info {
      flex: 1;
      min-width: 0;
    }

    .workspace-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main, #1e293b);
      margin: 0 0 4px 0;
      line-height: 1.3;
    }

    .workspace-type {
      font-size: 12px;
      color: var(--text-muted, #64748b);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .workspace-badge {
      padding: 2px 8px;
      background: var(--border-color, #f1f5f9);
      color: var(--text-muted, #64748b);
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .workspace-badge.team {
      background: color-mix(in srgb, var(--primary) 16%, var(--bg-card));
      color: var(--primary, #2563eb);
    }

    .workspace-badge.private {
      background: var(--bg-card);
      color: var(--text-muted, #64748b);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .workspace-check {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 24px;
      height: 24px;
      background: var(--primary, #3b82f6);
      color: var(--primary-contrast, white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.2s ease;
    }

    .workspace-card.active .workspace-check {
      opacity: 1;
      transform: scale(1);
    }

    .create-workspace-card {
      background: color-mix(in srgb, var(--primary) 4%, var(--bg-card));
      border: 2px dashed var(--border-color, #cbd5e1);
      border-radius: 16px;
      padding: 32px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .create-workspace-card:hover {
      border-color: var(--primary, #3b82f6);
      background: color-mix(in srgb, var(--primary) 10%, var(--bg-card));
      transform: translateY(-2px);
    }

    .create-icon {
      width: 48px;
      height: 48px;
      background: color-mix(in srgb, var(--primary) 14%, var(--bg-card));
      color: var(--primary, #2563eb);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .create-text {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main, #475569);
    }

    .sidebar-footer {
      padding: 20px 32px;
      background: var(--bg-surface, rgba(255, 255, 255, 0.8));
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--border-color, rgba(226, 232, 240, 0.8));
    }

    .footer-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted, #64748b);
    }

    /* Scrollbar Styling */
    .sidebar-content::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-content::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .sidebar-content::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .workspace-sidebar-panel {
        width: 100vw;
      }

      .sidebar-header,
      .sidebar-content,
      .sidebar-footer {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="workspace-sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <style>{styles}</style>
          <motion.div 
            className="workspace-sidebar-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sidebar-header">
              <div>
                <h2 className="sidebar-title">
                  <MdBusiness size={24} />
                  Workspaces
                </h2>
                <p className="sidebar-subtitle">Select or create a workspace</p>
              </div>
              <button className="sidebar-close" onClick={onClose}>
                <MdClose size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="sidebar-content">
              {/* Team Workspaces */}
              <div className="workspace-section">
                <h3 className="section-title">
                  <MdGroup size={16} />
                  Team Workspaces
                </h3>
                <div className="workspace-grid">
                  {workspaces
                    .filter(w => w.type === 'TEAM')
                    .map((workspace) => (
                      <div
                        key={workspace.id}
                        className={`workspace-card ${workspace.id === currentWorkspace?.id ? 'active' : ''}`}
                        onClick={() => handleWorkspaceSelect(workspace)}
                      >
                        <div className="workspace-card-header">
                          <div className="workspace-icon team">
                            <MdGroup />
                          </div>
                          <div className="workspace-info">
                            <h4 className="workspace-name">{workspace.name}</h4>
                            <p className="workspace-type">
                              <span className="workspace-badge team">Team</span>
                              {workspace.userRole && (
                                <span className="workspace-badge">{workspace.userRole}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {workspace.id === currentWorkspace?.id && (
                          <div className="workspace-check">
                            <MdCheck size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Private Workspaces */}
              <div className="workspace-section">
                <h3 className="section-title">
                  <MdBusiness size={16} />
                  Private Workspaces
                </h3>
                <div className="workspace-grid">
                  {workspaces
                    .filter(w => w.type === 'PRIVATE')
                    .map((workspace) => (
                      <div
                        key={workspace.id}
                        className={`workspace-card ${workspace.id === currentWorkspace?.id ? 'active' : ''}`}
                        onClick={() => handleWorkspaceSelect(workspace)}
                      >
                        <div className="workspace-card-header">
                          <div className="workspace-icon private">
                            <MdBusiness />
                          </div>
                          <div className="workspace-info">
                            <h4 className="workspace-name">{workspace.name}</h4>
                            <p className="workspace-type">
                              <span className="workspace-badge private">Private</span>
                              {workspace.userRole && (
                                <span className="workspace-badge">{workspace.userRole}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {workspace.id === currentWorkspace?.id && (
                          <div className="workspace-check">
                            <MdCheck size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Create New Workspace */}
              <div className="workspace-section">
                <h3 className="section-title">
                  <MdAdd size={16} />
                  Create New
                </h3>
                <div className="workspace-grid">
                  <div className="create-workspace-card" onClick={handleCreateWorkspace}>
                    <div className="create-icon">
                      <MdAdd />
                    </div>
                    <span className="create-text">Create New Workspace</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
              <div className="footer-stats">
                <span>{workspaces.length} total workspaces</span>
                <span>{workspaces.filter(w => w.type === 'TEAM').length} teams</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkspaceSidebar;
