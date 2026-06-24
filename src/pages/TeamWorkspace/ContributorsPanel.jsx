import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose,
  MdAdd,
  MdPerson,
  MdMail,
  MdPeople,
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
  inviteSending = false,
  onChangeMemberRole,
  onRemoveMember,
  loadContributors
}) => {
  const canManage = workspace ? workspaceCanManageContributors(workspace) : false;
  const [activeRoleDropdownIndex, setActiveRoleDropdownIndex] = useState(null);

  // Close the dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMemberMenuId(null);
      setActiveRoleDropdownIndex(null);
    };
    if (activeMemberMenuId !== null || activeRoleDropdownIndex !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMemberMenuId, setActiveMemberMenuId, activeRoleDropdownIndex]);

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
            style={{
              background: 'rgba(9, 14, 26, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
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
                  <MdPeople size={20} />
                </div>
                <div>
                  <h2>Members</h2>
                  <p className="astryd-subtitle">Workspace members &amp; invites</p>
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
                      disabled={inviteSending}
                      className="astryd-btn-accent-outline"
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
                              disabled={inviteSending}
                              style={{ flex: 1, height: '36px' }}
                            />
                            <div className="astryd-select-wrapper" style={{ width: '110px' }}>
                              <button
                                type="button"
                                className="astryd-select"
                                disabled={inviteSending}
                                style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveRoleDropdownIndex(activeRoleDropdownIndex === index ? null : index);
                                }}
                              >
                                <span>{input.role === 'ADMIN' ? 'Admin' : 'Member'}</span>
                              </button>
                              <div className={`astryd-select-arrow ${activeRoleDropdownIndex === index ? 'open' : ''}`}>
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              {activeRoleDropdownIndex === index && (
                                <div className="astryd-dropdown-menu" style={{ width: '100%', left: 0, top: '100%', backdropFilter: 'blur(12px)', marginTop: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateInput(index, 'role', 'MEMBER');
                                      setActiveRoleDropdownIndex(null);
                                    }}
                                    className={`astryd-dropdown-item ${input.role === 'MEMBER' ? 'active' : ''}`}
                                  >
                                    Member
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateInput(index, 'role', 'ADMIN');
                                      setActiveRoleDropdownIndex(null);
                                    }}
                                    className={`astryd-dropdown-item ${input.role === 'ADMIN' ? 'active' : ''}`}
                                  >
                                    Admin
                                  </button>
                                </div>
                              )}
                            </div>
                            {inviteInputs.length > 1 && (
                              <button
                                type="button"
                                className="astryd-btn-secondary"
                                onClick={() => onRemoveInput(index)}
                                disabled={inviteSending}
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
                      {inviteSending && (
                        <div className="astryd-invite-sending-banner" role="status" aria-live="polite">
                          <span className="astryd-invite-spinner" aria-hidden />
                          <span>
                            Sending invitation{inviteInputs.filter((i) => i.email.trim()).length > 1 ? 's' : ''}…
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={onAddInput}
                          disabled={inviteSending}
                          className="astryd-btn-accent-outline"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', height: '30px' }}
                        >
                          <MdAdd size={14} /> Add more
                        </button>
                        <button
                          type="button"
                          onClick={onSendInvites}
                          disabled={inviteSending}
                          className="astryd-btn-primary astryd-btn-primary--invite"
                          style={{ padding: '6px 16px', fontSize: '12px', height: '30px', minWidth: '108px' }}
                          aria-busy={inviteSending}
                        >
                          {inviteSending ? (
                            <>
                              <span className="astryd-invite-spinner astryd-invite-spinner--on-primary" aria-hidden />
                              Sending…
                            </>
                          ) : (
                            'Invite'
                          )}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--text-main)' }}>
                    <span>Members</span>
                    <span className="astryd-count-badge">{members.length}</span>
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
                          className="astryd-member-card"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                              <div className="astryd-member-avatar">
                                <MdPerson size={18} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                                  {label}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {member.user?.email || member.email || ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                              <span className={`astryd-role-tag ${role.toLowerCase()}`}>
                                {role.toLowerCase()}
                              </span>
                              {canManage && role !== 'OWNER' && (
                                <div style={{ position: 'relative' }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMemberMenuId(activeMemberMenuId === memberId ? null : memberId);
                                    }}
                                    className="astryd-action-btn"
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--text-main)' }}>
                    <span>Invitees</span>
                    <span className="astryd-count-badge">{invitees.length}</span>
                  </div>
                  {invitees.length === 0 ? (
                    <div className="astryd-hint">No pending invitees.</div>
                  ) : (
                    invitees.map((invitee) => (
                      <div
                        key={invitee.id}
                        className="astryd-member-card"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                            <div className="astryd-invitee-avatar">
                              <MdMail size={18} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                                {invitee.email || invitee.inviteeEmail || 'Invitee'}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>Pending Invite</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                            <span className="astryd-role-tag invitee">
                              {String(invitee.role || 'MEMBER').toLowerCase()}
                            </span>
                            {canManage && (
                              <div style={{ position: 'relative' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMemberMenuId(activeMemberMenuId === invitee.id ? null : invitee.id);
                                  }}
                                  className="astryd-action-btn"
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
