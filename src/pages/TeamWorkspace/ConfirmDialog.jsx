import React from 'react';
import { MdWarning } from 'react-icons/md';

/**
 * Reusable confirm dialog overlay.
 *
 * Props:
 *   dialog  — { message: string, onConfirm: () => void } | null
 *   onCancel — () => void
 */
const ConfirmDialog = ({ dialog, onCancel }) => {
  if (!dialog) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10100,
        backdropFilter: 'blur(4px)',
        animation: 'twFadeIn 0.18s ease'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: 'min(420px, 92vw)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          boxShadow: '0 18px 45px rgba(15,23,42,0.22)',
          padding: '22px',
          textAlign: 'center',
          animation: 'twSlideUp 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            margin: '0 auto 12px',
            background: 'rgba(var(--primary-rgb),0.12)',
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <MdWarning style={{ fontSize: 24, color: 'var(--primary)' }} />
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
          Please confirm
        </h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.45 }}>
          {dialog.message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={async () => {
              const onConfirm = dialog.onConfirm;
              onCancel(); // close first
              if (onConfirm) await onConfirm();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
