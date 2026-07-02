import { MdClose, MdVolumeUp } from 'react-icons/md';
import './VoicePreviewNotice.css';

export default function VoicePreviewUnavailableNotice({
  voiceName,
  onDismiss,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`voice-preview-notice ${compact ? 'voice-preview-notice--compact' : ''} ${className}`.trim()}
      role="status"
    >
      <div className="voice-preview-notice__icon" aria-hidden>
        <MdVolumeUp size={18} />
      </div>
      <div className="voice-preview-notice__body">
        <strong>Preview unavailable</strong>
        <p>
          {voiceName ? (
            <>
              We can&apos;t play a sample for{' '}
              <span className="voice-preview-notice__name">{voiceName}</span> right now, but you
              can still select and use it in your project.
            </>
          ) : (
            <>
              We can&apos;t play a sample right now, but you can still select and use this voice in
              your project.
            </>
          )}
        </p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="voice-preview-notice__close"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <MdClose size={16} />
        </button>
      ) : null}
    </div>
  );
}

export function showVoicePreviewUnavailableNotice(setter, voiceName, { autoDismissMs = 6000 } = {}) {
  setter({ voiceName });
  if (autoDismissMs > 0) {
    return setTimeout(() => setter(null), autoDismissMs);
  }
  return null;
}
