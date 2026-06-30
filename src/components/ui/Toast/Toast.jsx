import React, { useEffect, useState, useCallback, useRef } from 'react';
import './Toast.css';

/* ─────────────────────────────────────────────────────────
   Icons (inline SVG — no extra deps needed)
───────────────────────────────────────────────────────── */
const Icons = {
  success: (
    <svg viewBox="0 0 20 20" fill="none" className="toast-icon">
      <circle cx="10" cy="10" r="9" fill="#22c55e" opacity=".18" />
      <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="1.5" />
      <path d="M6.5 10.2l2.3 2.3 4.7-4.7" stroke="#22c55e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="none" className="toast-icon">
      <circle cx="10" cy="10" r="9" fill="#ef4444" opacity=".18" />
      <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="none" className="toast-icon">
      <path d="M10 2.5L18.5 17.5H1.5L10 2.5z" fill="#f59e0b" opacity=".18" />
      <path d="M10 2.5L18.5 17.5H1.5L10 2.5z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8v4" stroke="#f59e0b" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r=".9" fill="#f59e0b" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="none" className="toast-icon">
      <circle cx="10" cy="10" r="9" fill="#3b82f6" opacity=".18" />
      <circle cx="10" cy="10" r="9" stroke="#3b82f6" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="#3b82f6" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r=".9" fill="#3b82f6" />
    </svg>
  ),
};

const ACCENT = {
  success: '#22c55e',
  error:   '#ef4444',
  warning: '#f59e0b',
  info:    '#3b82f6',
};

/* ─────────────────────────────────────────────────────────
   Single Toast Item
───────────────────────────────────────────────────────── */
function ToastItem({ id, message, type = 'info', duration = 4000, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const pausedRef = useRef(false);
  const remainingRef = useRef(duration);
  const lastTickRef = useRef(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  /* Progress countdown */
  useEffect(() => {
    const tick = (ts) => {
      if (pausedRef.current) {
        lastTickRef.current = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (!startRef.current) startRef.current = ts;
      if (lastTickRef.current) {
        const delta = ts - lastTickRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - delta);
      }
      lastTickRef.current = ts;
      const pct = (remainingRef.current / duration) * 100;
      setProgress(pct);
      if (remainingRef.current <= 0) { dismiss(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dismiss, duration]);

  const accent = ACCENT[type] || ACCENT.info;

  return (
    <div
      className={`toast-item toast-item--${type} ${exiting ? 'toast-item--exit' : 'toast-item--enter'}`}
      role="alert"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; lastTickRef.current = null; }}
    >
      {/* Left accent bar */}
      <div className="toast-accent" style={{ background: accent }} />

      {/* Icon */}
      <div className="toast-icon-wrap">{Icons[type] || Icons.info}</div>

      {/* Body */}
      <div className="toast-body">
        <span className="toast-type-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        <span className="toast-message">{message}</span>
      </div>

      {/* Close */}
      <button className="toast-close" onClick={dismiss} aria-label="Dismiss notification">
        <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="toast-progress-track">
        <div className="toast-progress-bar" style={{ width: `${progress}%`, background: accent }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Toast Container (manages stack)
   Usage: pass `toasts` array + `onDismiss` callback
───────────────────────────────────────────────────────── */
export function ToastContainer({ toasts = [], onDismiss }) {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Legacy compat wrapper — accepts single `toast` prop
   so existing <Toast toast={toast} /> sites work unchanged.
───────────────────────────────────────────────────────── */
const Toast = ({ toast, onDismiss }) => {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  useEffect(() => {
    if (!toast?.message) return;
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, ...toast }]);
  }, [toast]);

  return <ToastContainer toasts={toasts} onDismiss={onDismiss ?? dismiss} />;
};

export default Toast;
