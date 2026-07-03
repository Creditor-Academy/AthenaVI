import { MdDelete, MdGraphicEq, MdPlayArrow } from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import { VoiceGenderIcon } from '../../components/ui/icons';
import AudioPlayingWave from '../../components/ui/AudioPlayingWave/AudioPlayingWave';
import VoicePreviewUnavailableInline from '../../components/ui/VoicePreviewUnavailableInline/VoicePreviewUnavailableInline';
import { normalizeVoiceGender } from '../../utils/voiceGender';
import { CLONE_PREVIEW_TOOLTIP } from '../../utils/heygenVoices';

function getStatusBadge(voice) {
  if (voice.status === 'processing') {
    return { label: 'Processing', className: 'voices-status-badge--processing' };
  }
  if (voice.status === 'failed') {
    return { label: 'Failed', className: 'voices-status-badge--failed' };
  }
  return null;
}

function VoiceLibraryCard({
  voice,
  onOpen,
  onPreview,
  onTest,
  isPreviewPlaying = false,
  previewUnavailableReason = null,
  showTestButton = true,
  clonePreviewTooltip = false,
  canDelete = false,
  onDelete,
}) {
  const statusBadge = getStatusBadge(voice);
  const genderKind = normalizeVoiceGender(voice.gender);
  const hasAvatarImage = Boolean(voice.image);

  return (
    <article className="workspace-item-card voices-library-card">
      <button
        type="button"
        className="voices-library-card__thumb-btn"
        onClick={() => onOpen?.(voice)}
        aria-label={`View ${voice.name}`}
      >
        <div
          className={`card-thumb-container voices-library-card__thumb voices-library-card__thumb--${genderKind}${
            hasAvatarImage ? ' voices-library-card__thumb--has-image' : ''
          }`}
        >
          {hasAvatarImage ? (
            <img src={voice.image} alt="" loading="lazy" className="voices-library-card__avatar" />
          ) : (
            <div className={`voices-library-card__visual voices-library-card__visual--${genderKind}`} aria-hidden>
              <span className="voices-gender-icon-badge">
                <VoiceGenderIcon gender={voice.gender} size={40} />
              </span>
            </div>
          )}
          <span className="voices-library-badge">{voice.language || 'Voice'}</span>
          {statusBadge ? (
            <span className={`voices-status-badge ${statusBadge.className}`}>
              {statusBadge.label === 'Processing' ? (
                <>
                  <Loader2 size={10} className="spin-animation" />
                  {statusBadge.label}
                </>
              ) : (
                statusBadge.label
              )}
            </span>
          ) : null}
          
          {isPreviewPlaying ? (
            <div className="voices-library-card__playing-wave" aria-hidden>
              <AudioPlayingWave size="lg" barCount={7} />
            </div>
          ) : null}
          {previewUnavailableReason ? (
            <VoicePreviewUnavailableInline variant="overlay" />
          ) : null}
        </div>
      </button>

      <div className="workspace-item-meta voices-library-card__meta">
        <div className="meta-left">
          <h4 title={voice.name}>{voice.name}</h4>
          <div className="meta-row-small">
            {voice.gender ? <span className="meta-small">{voice.gender}</span> : null}
            {voice.status && voice.status !== 'complete' ? (
              <span className="meta-small">{voice.status}</span>
            ) : null}
          </div>
        </div>

        <div className="voices-library-card__actions">
          <button
            type="button"
            className={`context-menu-btn voices-preview-btn${
              isPreviewPlaying ? ' voices-preview-btn--playing' : ''
            }`}
            title={isPreviewPlaying ? 'Stop preview' : clonePreviewTooltip ? CLONE_PREVIEW_TOOLTIP : 'Preview voice sample'}
            aria-label={isPreviewPlaying ? `Stop preview ${voice.name}` : `Preview ${voice.name}`}
            aria-pressed={isPreviewPlaying}
            onClick={(event) => {
              event.stopPropagation();
              onPreview?.(voice, event);
            }}
          >
            {isPreviewPlaying ? <AudioPlayingWave size="sm" /> : <MdPlayArrow size={18} />}
          </button>
          {showTestButton ? (
            <button
              type="button"
              className="context-menu-btn"
              title="Preview with text"
              aria-label={`Preview with text ${voice.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onTest?.(voice, event);
              }}
            >
              <MdGraphicEq size={18} />
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              className="context-menu-btn library-delete-cta"
              title="Delete voice"
              aria-label={`Delete ${voice.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.(voice, event);
              }}
            >
              <MdDelete size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default VoiceLibraryCard;
