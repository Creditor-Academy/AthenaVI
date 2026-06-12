import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { MdMail, MdClose, MdCheck } from 'react-icons/md';

/**
 * Slide-in panel on the right side showing pending workspace invitations.
 */
const InvitationsPanel = ({ open, onClose, invitations, onAccept, onDecline }) => (
  <AnimatePresence>
    {open && (
      <div
        className="notifications-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={onClose}
      >
        <div
          className="notifications-panel"
          style={{
            width: '400px',
            background: 'var(--bg-card)',
            borderLeft: '1px solid var(--border-color)',
            height: '100vh',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <MdMail /> Invitations
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              aria-label="Close invitations"
            >
              <MdClose size={20} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {invitations.length > 0 ? (
              invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    background: 'var(--bg-card)'
                  }}
                >
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                    {invitation.workspaceName || invitation.workspace?.name || 'Workspace'}
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Invited by {invitation.invitedBy || invitation.owner?.name || 'Owner'} | Role: {invitation.role || 'MEMBER'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onAccept(invitation.token || invitation.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--success-green)',
                        color: 'var(--primary-contrast)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      <MdCheck /> Accept
                    </button>
                    <button
                      onClick={() => onDecline(invitation)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      <MdClose /> Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                No pending invitations
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </AnimatePresence>
);

export default InvitationsPanel;
