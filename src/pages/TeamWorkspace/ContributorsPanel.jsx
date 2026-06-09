import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose,
  MdAdd,
  MdPerson,
  MdMail,
  MdSettings,
  MdMoreVert,
  MdCancel
} from 'react-icons/md';
import workspaceService from '../../services/workspaceService.js';
import { workspaceCanManageContributors } from './workspaceUtils.js';

/**
 * Modal for managing workspace contributors (members + invitees).
 */
const ContributorsPanel = ({
  open,
  workspace,
  onClose,
  members,
  invitees,
  membersLoading,
  showAddContributors,
  setShowAddContributors,
  inviteInputs,
  activeMemberMenuId,
  setActiveMemberMenuId,
  onAddInput,
  onUpdateInput,
  onRemoveInput,
  onSendInvites,
  onChangeMemberRole,
  onRemoveMember,
  loadContributors
}) => {
  const canManage = workspace ? workspaceCanManageContributors(workspace) : false;

  // Close the member action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMemberMenuId(null);
    if (activeMemberMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMemberMenuId, setActiveMemberMenuId]);

  return (
    <AnimatePresence>
      {open && workspace && (
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
            style={{
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              width: 'min(680px, 95vw)',
              maxWidth: 'min(680px, 95vw)'
            }}
          >
            {/* Header */}
            <div className="astryd-header">
              <div className="astryd-title-group">
                <div className="astryd-icon-container">
                  <MdSettings size={20} />
                </div>
                <div>
                  <h2>Manage Workspace</h2>
                  <p className="astryd-subtitle">Workspace Contributors</p>
                </div>
              </div>
              <button className="astryd-close-btn" onClick={onClose} title="Close">
                <MdClose size={18} />
              </button>
            </div>

            {/* Body */}
            <div
              className="astryd-form"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden', width: '100%' }}
            >
              {/* Add contributors section */}
              {canManage && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid color-mix(in srgb, var(--border-color) 45%, transparent)',
                      paddingBottom: '10px',
                      marginBottom: '10px'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
                      Add contributors
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddContributors(!showAddContributors)}
                      className="astryd-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', height: '30px' }}
                    >
                      {showAddContributors ? 'Cancel' : 'Add'}
                    </button>
                  </div>

                  {showAddContributors && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid color-mix(in srgb, var(--border-color) 30%, transparent)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {inviteInputs.map((input, index) => (
                          <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="email"
                              placeholder="Email address"
                              className="astryd-input"
                              value={input.email}
                              onChange={(e) => onUpdateInput(index, 'email', e.target.value)}
                              style={{ flex: 1, height: '36px' }}
                            />
                            <select
                              className="astryd-input"
                              value={input.role}
                              onChange={(e) => onUpdateInput(index, 'role', e.target.value)}
                              style={{ width: '100px', height: '36px', padding: '0 8px' }}
                            >
                              <option value="MEMBER">Member</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            {inviteInputs.length > 1 && (
                              <button
                                type="button"
                                className="astryd-btn-secondary"
                                onClick={() => onRemoveInput(index)}
                                style={{
                                  padding: '0 10px',
                                  height: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ef4444',
                                  border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)'
                                }}
                                title="Remove"
                              >
                                <MdCancel size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={onAddInput}
                          className="astryd-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', height: '30px' }}
                        >
                          <MdAdd size={14} /> Add more
                        </button>
                        <button
                          type="button"
                          onClick={onSendInvites}
                          className="astryd-btn-primary"
                          style={{ padding: '6px 16px', fontSize: '12px', height: '30px' }}
                        >
                          Invite
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Members + Invitees list */}
              <div
                style={{
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  paddingRight: 4,
                  paddingBottom: 60,
                  width: '100%'
                }}
              >
                {/* Members */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text-main)' }}>
                    Members
                  </div>
                  {membersLoading ? (
                    <div className="astryd-hint">Loading members...</div>
                  ) : members.length === 0 ? (
                    <div className="astryd-hint">No members found.</div>
                  ) : (
                    members.map((member) => {
                      const memberId = member.id || member.userId || member.user?.id || member.user?._id;
                      const label = member.user?.name || member.user?.email || member.name || member.email || 'Member';
                      const rawRole = String(member.role || 'MEMBER').toUpperCase();
                      const role = rawRole === 'EDITOR' || rawRole === 'VIEWER' ? 'MEMBER' : rawRole;

                      return (
                        <div
                          key={memberId}
                          style={{
                            border: '1px solid color-mix(in srgb, var(--border-color) 45%, transparent)',
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 8,
                            background: 'color-mix(in srgb, var(--bg-surface) 30%, transparent)',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <MdPerson size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                                  {label}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {member.user?.email || member.email || ''}
                                  </span>
                                  <span style={{ height: '3px', width: '3px', borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
                                  <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--primary)', flexShrink: 0 }}>
                                    {role.toLowerCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              {role === 'OWNER' ? (
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', paddingRight: 8 }}>Owner</span>
                              ) : canManage ? (
                                <div style={{ position: 'relative' }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMemberMenuId(activeMemberMenuId === memberId ? null : memberId);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      cursor: 'pointer',
                                      padding: '6px',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <MdMoreVert size={20} />
                                  </button>
                                  {activeMemberMenuId === memberId && (
                                    <div className="astryd-dropdown-menu" style={{ backdropFilter: 'blur(12px)' }}>
                                      {String(workspace?.userRole).toUpperCase() === 'OWNER' && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextRole = role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
                                            onChangeMemberRole(memberId, nextRole);
                                            setActiveMemberMenuId(null);
                                          }}
                                          className="astryd-dropdown-item"
                                        >
                                          Change to {role === 'ADMIN' ? 'Member' : 'Admin'}
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onRemoveMember(memberId);
                                          setActiveMemberMenuId(null);
                                        }}
                                        className="astryd-dropdown-item danger"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', paddingRight: 8, textTransform: 'capitalize' }}>
                                  {role.toLowerCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Invitees */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text-main)' }}>
                    Invitees
                  </div>
                  {invitees.length === 0 ? (
                    <div className="astryd-hint">No pending invitees.</div>
                  ) : (
                    invitees.map((invitee) => (
                      <div
                        key={invitee.id}
                        style={{
                          border: '1px solid color-mix(in srgb, var(--border-color) 45%, transparent)',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                          background: 'color-mix(in srgb, var(--bg-surface) 30%, transparent)',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <MdMail size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                                {invitee.email || invitee.inviteeEmail || 'Invitee'}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>Pending Invite</span>
                                <span style={{ height: '3px', width: '3px', borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
                                <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--primary)', flexShrink: 0 }}>
                                  {String(invitee.role || 'MEMBER').toLowerCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {canManage ? (
                              <div style={{ position: 'relative' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMemberMenuId(activeMemberMenuId === invitee.id ? null : invitee.id);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <MdMoreVert size={20} />
                                </button>
                                {activeMemberMenuId === invitee.id && (
                                  <div className="astryd-dropdown-menu" style={{ backdropFilter: 'blur(12px)' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        workspaceService
                                          .removeInvitation(workspace.id, invitee.id)
                                          .then(() => loadContributors(workspace));
                                        setActiveMemberMenuId(null);
                                      }}
                                      className="astryd-dropdown-item danger"
                                    >
                                      Cancel Invite
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', paddingRight: 8, textTransform: 'capitalize' }}>
                                {String(invitee.role || 'MEMBER').toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContributorsPanel;
