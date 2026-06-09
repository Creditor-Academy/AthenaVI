import React from 'react';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

/**
 * Toast notification displayed at the top-center of the screen.
 *
 * Also injects the keyframe animations required for itself and ConfirmDialog.
 *
 * Props:
 *   toast — { message: string, type: 'success' | 'error' } | null
 */
const Toast = ({ toast }) => (
  <>
    {toast && (
      <div
        style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10200,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          borderRadius: 10,
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 12px 30px rgba(15,23,42,0.28)',
          background: toast.type === 'success' ? '#16a34a' : '#dc2626',
          maxWidth: 'min(480px, calc(100vw - 32px))',
          whiteSpace: 'nowrap',
          animation: 'twSlideDown 0.25s ease'
        }}
      >
        {toast.type === 'success'
          ? <MdCheckCircle style={{ fontSize: 20, flexShrink: 0 }} />
          : <MdCancel style={{ fontSize: 20, flexShrink: 0 }} />
        }
        <span>{toast.message}</span>
      </div>
    )}

    <style>{`
      @keyframes twFadeIn { from { opacity: 0 } to { opacity: 1 } }
      @keyframes twSlideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes twSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </>
);

export default Toast;
