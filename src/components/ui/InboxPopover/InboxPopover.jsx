import { useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import './InboxPopover.css';

/**
 * Two-step inbox shell: a list panel anchored under the topbar bell, with an
 * optional detail panel docked to its left (LinkedIn-messaging style).
 * Escape closes the detail first, then the whole popover.
 */
function InboxPopover({ label, onClose, detail, onCloseDetail, busy = false, children }) {
  const hasDetail = Boolean(detail);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key !== 'Escape') return;
      if (hasDetail) onCloseDetail?.();
      else onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasDetail, onClose, onCloseDetail]);

  return (
    <div className="inbox-pop-overlay" onClick={onClose}>
      <div
        className={`inbox-pop-stack${hasDetail ? ' inbox-pop-stack--detail' : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        {detail}
        <section
          className="inbox-pop-panel inbox-pop-panel--list"
          role="dialog"
          aria-label={label}
          aria-busy={busy}
        >
          {children}
        </section>
      </div>
    </div>
  );
}

export function InboxToneIcon({ icon, tone, size = 16 }) {
  const Icon = icon;
  return (
    <span className={`inbox-pop-avatar inbox-pop-tone--${tone || 'default'}`} aria-hidden>
      <Icon size={size} strokeWidth={1.85} />
    </span>
  );
}

export function InboxListItem({
  icon,
  tone,
  title,
  preview,
  time,
  timeIso,
  unread = false,
  selected = false,
  onSelect,
  onDismiss,
  dismissing = false,
}) {
  const classes = ['inbox-pop-item'];
  if (unread) classes.push('inbox-pop-item--unread');
  if (selected) classes.push('inbox-pop-item--selected');

  return (
    <div className={classes.join(' ')}>
      <button
        type="button"
        className="inbox-pop-item-btn"
        onClick={onSelect}
        aria-current={selected || undefined}
      >
        <InboxToneIcon icon={icon} tone={tone} />
        <span className="inbox-pop-item-text">
          <span className="inbox-pop-item-title">{title}</span>
          {preview && <span className="inbox-pop-item-preview">{preview}</span>}
        </span>
        <span className="inbox-pop-item-meta">
          {time && (
            <time className="inbox-pop-item-time" dateTime={timeIso || undefined}>
              {time}
            </time>
          )}
          {unread && <span className="inbox-pop-unread-dot" aria-label="Unread" />}
        </span>
      </button>
      {onDismiss && (
        <button
          type="button"
          className="inbox-pop-item-dismiss"
          aria-label="Dismiss"
          title="Dismiss"
          disabled={dismissing}
          onClick={onDismiss}
        >
          <X size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export function InboxDetailPanel({ icon: EyebrowIcon, tone, eyebrow, title, timestamp, timestampIso, onClose, footer, children }) {
  return (
    <article className="inbox-pop-panel inbox-pop-detail" aria-label={title}>
      <header className="inbox-pop-detail-head">
        <button
          type="button"
          className="inbox-pop-icon-btn inbox-pop-detail-back"
          onClick={onClose}
          aria-label="Back to list"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className={`inbox-pop-eyebrow inbox-pop-tone--${tone || 'default'}`}>
          {EyebrowIcon && <EyebrowIcon size={13} strokeWidth={2} aria-hidden />}
          {eyebrow}
        </span>
        <button
          type="button"
          className="inbox-pop-icon-btn inbox-pop-detail-close"
          onClick={onClose}
          aria-label="Close message"
          title="Close"
        >
          <X size={16} strokeWidth={1.85} />
        </button>
      </header>

      <div className="inbox-pop-detail-body">
        <h3 className="inbox-pop-detail-title">{title}</h3>
        {timestamp && (
          <time className="inbox-pop-detail-time" dateTime={timestampIso || undefined}>
            {timestamp}
          </time>
        )}
        <div className="inbox-pop-detail-content">{children}</div>
      </div>

      {footer && <footer className="inbox-pop-detail-footer">{footer}</footer>}
    </article>
  );
}

export default InboxPopover;
