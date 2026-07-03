import { getVoicePreviewUnavailableShortCopy } from '../../../utils/heygenVoices';
import './VoicePreviewUnavailableInline.css';

export default function VoicePreviewUnavailableInline({
  className = '',
  variant = 'overlay',
}) {
  const { shortLabel, ariaLabel } = getVoicePreviewUnavailableShortCopy();

  return (
    <div
      className={`voice-preview-unavailable voice-preview-unavailable--${variant} ${className}`.trim()}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="voice-preview-unavailable__label">{shortLabel}</span>
    </div>
  );
}
