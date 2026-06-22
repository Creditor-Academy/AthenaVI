import { sanitizeUserFacingMessage } from '../../../../utils/userFacingMessage';

const TYPE_STYLES = {
  success: { bg: '#ecfdf5', border: '#10b981', color: '#065f46' },
  error: { bg: '#fef2f2', border: '#ef4444', color: '#991b1b' },
  warning: { bg: '#fffbeb', border: '#f59e0b', color: '#92400e' },
  info: { bg: '#eff6ff', border: '#3b82f6', color: '#1e40af' },
};

const EditorToast = ({ toast, onDismiss }) => {
  if (!toast?.message) return null;
  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  return (
    <div
      className="editor-toast"
      role="status"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        minWidth: 280,
        maxWidth: 480,
        padding: '12px 16px',
        borderRadius: 10,
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.color,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <span>{sanitizeUserFacingMessage(toast.message)}</span>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

export default EditorToast;
