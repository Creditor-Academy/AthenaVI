import React, { useEffect, useState, useCallback } from 'react';
import { MdCheckCircle, MdCancel, MdWarning, MdInfo } from 'react-icons/md';
import './Toast.css';

const ICONS = {
  success: MdCheckCircle,
  error: MdCancel,
  warning: MdWarning,
  info: MdInfo,
};

function ToastItem({ id, message, type = 'success', duration = 2800, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const Icon = ICONS[type] || ICONS.info;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 200);
  }, [id, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration]);

  return (
    <div
      className={`toast-item toast-item--${type} ${exiting ? 'toast-item--exit' : 'toast-item--enter'}`}
      role="alert"
    >
      <div className="toast-icon-wrap">
        <Icon className="toast-icon" aria-hidden />
      </div>
      <span className="toast-message">{message}</span>
    </div>
  );
}

export function ToastContainer({ toasts = [], onDismiss, placement = 'top' }) {
  const placementClass = placement === 'bottom-right' ? ' toast-container--bottom-right' : '';
  return (
    <div className={`toast-container${placementClass}`} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const Toast = ({ toast, onDismiss, placement = 'top', replace = false }) => {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  useEffect(() => {
    if (!toast?.message) return;
    const id = `${Date.now()}-${Math.random()}`;
    const entry = { id, ...toast };
    setToasts(replace ? [entry] : (prev) => [...prev, entry]);
  }, [toast, replace]);

  return (
    <ToastContainer
      toasts={toasts}
      onDismiss={onDismiss ?? dismiss}
      placement={placement}
    />
  );
};

export default Toast;
