import { MdClose, MdVolumeUp } from 'react-icons/md';
import {
  getVoicePreviewNoticeReason,
  getVoicePreviewUnavailableMessage,
  VOICE_PREVIEW_NOTICE_REASONS,
} from '../../../utils/heygenVoices';
import './VoicePreviewNotice.css';

function VoicePreviewNoticeBody({ voiceName, reason }) {
  const { title, description } = getVoicePreviewUnavailableMessage(voiceName, reason);

  if (reason === VOICE_PREVIEW_NOTICE_REASONS.NO_SAMPLE && voiceName) {
    const [before, after] = description.split(voiceName);
    return (
      <>
        <strong>{title}</strong>
        <p>
          {before}
          <span className="voice-preview-notice__name">{voiceName}</span>
          {after}
        </p>
      </>
    );
  }

  if (reason === VOICE_PREVIEW_NOTICE_REASONS.CLONED && voiceName) {
    const rest = description.slice(voiceName.length);
    return (
      <>
        <strong>{title}</strong>
        <p>
          <span className="voice-preview-notice__name">{voiceName}</span>
          {rest}
        </p>
      </>
    );
  }

  return (
    <>
      <strong>{title}</strong>
      <p>{description}</p>
    </>
  );
}

export default function VoicePreviewUnavailableNotice({
  voiceName,
  reason,
  onDismiss,
  className = '',
  compact = false,
}) {
  const resolvedReason = reason || VOICE_PREVIEW_NOTICE_REASONS.NO_SAMPLE;

  return (
    <div
      className={`voice-preview-notice ${compact ? 'voice-preview-notice--compact' : ''} ${className}`.trim()}
      role="status"
    >
      <div className="voice-preview-notice__icon" aria-hidden>
        <MdVolumeUp size={18} />
      </div>
      <div className="voice-preview-notice__body">
        <VoicePreviewNoticeBody voiceName={voiceName} reason={resolvedReason} />
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

export function showVoicePreviewUnavailableNotice(
  setter,
  voiceOrName,
  { autoDismissMs = 6000, reason } = {}
) {
  const voice = voiceOrName && typeof voiceOrName === 'object' ? voiceOrName : null;
  const voiceName = voice?.name || (typeof voiceOrName === 'string' ? voiceOrName : null);
  const resolvedReason = reason || (voice ? getVoicePreviewNoticeReason(voice) : VOICE_PREVIEW_NOTICE_REASONS.NO_SAMPLE);

  setter({ voiceId: voice?.id ?? null, voiceName, reason: resolvedReason });
  if (autoDismissMs > 0) {
    return setTimeout(() => setter(null), autoDismissMs);
  }
  return null;
}
