import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdOutlineBolt } from 'react-icons/md';
import WorkspaceCreditsDashboard from './WorkspaceCreditsDashboard.jsx';
import './PremiumModal.css';

function WorkspaceCreditsUsageModal({ isOpen, workspace, onClose }) {
  if (!workspace) return null;

  const workspaceName = workspace.name || 'Workspace';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-wrapper">
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              background: 'rgba(9, 14, 26, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />
          <motion.div
            className="modal-content astryd-modal workspace-credits-usage-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="astryd-header workspace-credits-usage-modal__header">
              <div className="astryd-title-group">
                <div className="astryd-icon-container">
                  <MdOutlineBolt size={20} />
                </div>
                <div>
                  <h2>Credits — Usage</h2>
                  <p className="astryd-subtitle">{workspaceName}</p>
                </div>
              </div>
              <button
                type="button"
                className="astryd-close-btn"
                onClick={onClose}
                title="Close"
                aria-label="Close"
              >
                <MdClose size={18} />
              </button>
            </div>

            <div className="astryd-form workspace-credits-usage-modal__body">
              <WorkspaceCreditsDashboard
                workspaceId={workspace.id}
                userRole={workspace.userRole || 'MEMBER'}
                workspaceCredits={workspace.workspaceCredits}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default WorkspaceCreditsUsageModal;
