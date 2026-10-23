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
    <article
      className="workspace-item-card voices-library-card"
      onClick={(event) => {
        if (onPreview) {
          onPreview(voice, event);
        } else {
          onOpen?.(voice);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Voice: ${voice.name}`}
    >
      <div
        className={`card-thumb-container voices-library-card__thumb voices-library-card__thumb--${genderKind}${
          hasAvatarImage ? ' voices-library-card__thumb--has-image' : ''
        }`}
      >
        {/* Subtle Ambient Soundwave Backdrop Pattern */}
        <div className="voices-thumb-wave-bg" aria-hidden>
          <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="voices-thumb-wave-svg">
            <path
              d="M0 40 Q 25 15, 50 35 T 100 25 T 150 40 T 200 30 V 60 H 0 Z"
              fill="currentColor"
              opacity="0.08"
            />
            <path
              d="M0 45 Q 30 20, 60 40 T 120 30 T 170 45 T 200 35 V 60 H 0 Z"
              fill="currentColor"
              opacity="0.05"
            />
          </svg>
        </div>

        {hasAvatarImage ? (
          <img src={voice.image} alt="" loading="lazy" className="voices-library-card__avatar" />
        ) : (
          <div className={`voices-library-card__visual voices-library-card__visual--${genderKind}`} aria-hidden>
            <div className="voices-avatar-orb">
              <div className="voices-avatar-orb__glow" />
              <div className="voices-avatar-orb__inner">
                <VoiceGenderIcon gender={voice.gender} size={38} />
              </div>
            </div>
          </div>
        )}

        {/* Decorative Studio Equalizer Bar Graphic */}
        <div className="voices-thumb-freq-bars" aria-hidden>
          <span style={{ height: '35%' }} />
          <span style={{ height: '60%' }} />
          <span style={{ height: '85%' }} />
          <span style={{ height: '45%' }} />
          <span style={{ height: '70%' }} />
          <span style={{ height: '95%' }} />
          <span style={{ height: '65%' }} />
          <span style={{ height: '50%' }} />
          <span style={{ height: '80%' }} />
          <span style={{ height: '40%' }} />
        </div>

        {/* Top Left Language Pill */}
        <span className="voices-library-badge">
          <span className="voices-badge-dot" />
          {voice.language || 'Voice'}
        </span>

        {/* Top Right Gender / Status Pill */}
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
        ) : (
          <span className={`voices-gender-pill voices-gender-pill--${genderKind}`}>
            {voice.gender || 'AI Voice'}
          </span>
        )}

        {/* Hover Play Button Overlay */}
        <div className="voices-card-hover-overlay" aria-hidden>
          <div className="voices-hover-play-icon">
            <MdPlayArrow size={26} />
          </div>
        </div>

        {/* Playing State Wave */}
        {isPreviewPlaying ? (
          <div className="voices-library-card__playing-wave" aria-hidden>
            <AudioPlayingWave size="lg" barCount={8} />
          </div>
        ) : null}

        {previewUnavailableReason ? (
          <VoicePreviewUnavailableInline variant="overlay" />
        ) : null}
      </div>

      <div className="workspace-item-meta voices-library-card__meta">
        <div className="meta-left">
          <h4 title={voice.name}>{voice.name}</h4>
          <div className="meta-row-small">
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
