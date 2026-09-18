import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdAssignmentInd, MdPerson, MdPersonOff, MdCheck } from 'react-icons/md';
import workspaceService from '../../../../services/workspaceService.js';
import './PremiumModal.css';

/**
 * Assign / reassign / unassign a whole video or presentation project to a
 * workspace member. Workflow-only — never changes who can open or edit it.
 * OWNER/ADMIN only (the caller gates whether this modal ever opens).
 */
const AssignProjectModal = ({ isOpen, onClose, onAssigned, workspaceId, project }) => {
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');
  const [assigningId, setAssigningId] = useState(null); // 'unassign' | memberId | null
  const [error, setError] = useState('');

  const currentAssigneeId = project?.assignee?.id || project?.assignedToId || null;
  const projectTitle = project?.name || project?.title || 'Untitled';

  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    let cancelled = false;
    setMembersLoading(true);
    setMembersError('');
    workspaceService
      .listWorkspaceMembers(workspaceId)
      .then((list) => {
        if (!cancelled) setMembers(list || []);
      })
      .catch((err) => {
        if (!cancelled) setMembersError(err.message || 'Failed to load members');
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, workspaceId]);

  const handleAssign = async (memberId) => {
    if (!project?.id || !workspaceId) return;
    setAssigningId(memberId || 'unassign');
    setError('');
    try {
      const updated = await workspaceService.updateProjectAssignee(workspaceId, project.id, memberId);
      onAssigned?.(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update assignee');
    } finally {
      setAssigningId(null);
    }
  };

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
          />
          <motion.div
            className="modal-content astryd-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="astryd-header">
              <div className="astryd-title-group">
                <div className="astryd-icon-container">
                  <MdAssignmentInd size={20} />
                </div>
                <div>
                  <h2>Assign Project</h2>
                  <p className="astryd-subtitle">
                    Assign "{projectTitle}" to a workspace member. This doesn't change who can open or edit it.
                  </p>
                </div>
              </div>
              <button className="astryd-close-btn" onClick={onClose} title="Close">
                <MdClose size={18} />
              </button>
            </div>

            <div className="astryd-form" style={{ maxHeight: 360, overflowY: 'auto' }}>
              {error && <span className="astryd-error">{error}</span>}

              <button
                type="button"
                className="astryd-member-card"
                style={{ width: '100%', cursor: 'pointer', border: 'none', textAlign: 'left', font: 'inherit', color: 'inherit' }}
                disabled={assigningId != null}
                onClick={() => handleAssign(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div className="astryd-member-avatar">
                      <MdPersonOff size={18} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-main)' }}>
                      {assigningId === 'unassign' ? 'Unassigning…' : 'Unassigned'}
                    </div>
                  </div>
                  {!currentAssigneeId && <MdCheck size={16} style={{ color: 'var(--primary)' }} />}
                </div>
              </button>

              {membersLoading && <div className="astryd-hint">Loading members…</div>}
              {membersError && <div className="astryd-hint">{membersError}</div>}
              {!membersLoading && !membersError && !members.length && (
                <div className="astryd-hint">No members in this workspace.</div>
              )}
              {!membersLoading &&
                members.map((member) => {
                  const memberId = member.id || member.userId || member.user?.id || member.user?._id;
                  const label = member.user?.name || member.user?.email || member.name || member.email || 'Member';
                  const email = member.user?.email || member.email || '';
                  const selected = currentAssigneeId === memberId;
                  return (
                    <button
                      key={memberId}
                      type="button"
                      className="astryd-member-card"
                      style={{ width: '100%', cursor: 'pointer', border: 'none', textAlign: 'left', font: 'inherit', color: 'inherit' }}
                      disabled={assigningId != null}
                      onClick={() => handleAssign(memberId)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div className="astryd-member-avatar">
                            <MdPerson size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                              {assigningId === memberId ? 'Assigning…' : label}
                            </div>
                            {email && (
                              <div style={{ color: 'var(--text-muted)', fontSize: 11, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {email}
                              </div>
                            )}
                          </div>
                        </div>
                        {selected && <MdCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="astryd-footer">
              <button type="button" className="astryd-btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AssignProjectModal;
