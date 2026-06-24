import { MdGraphicEq, MdPlayArrow } from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import { VoiceGenderIcon } from '../../components/ui/icons';
import { normalizeVoiceGender } from '../../utils/voiceGender';

function getStatusBadge(voice) {
  if (voice.status === 'processing') {
    return { label: 'Processing', className: 'voices-status-badge--processing' };
  }
  if (voice.status === 'failed') {
    return { label: 'Failed', className: 'voices-status-badge--failed' };
  }
  return null;
}

function VoiceLibraryCard({ voice, onOpen, onPreview, onTest }) {
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
          <div className="voices-library-overlay" aria-hidden>
            <span className="btn-edit-premium">View Voice</span>
          </div>
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
            className="context-menu-btn"
            title="Preview voice"
            aria-label={`Preview ${voice.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onPreview?.(voice, event);
            }}
          >
            <MdPlayArrow size={18} />
          </button>
          <button
            type="button"
            className="context-menu-btn"
            title="Test voice"
            aria-label={`Test ${voice.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onTest?.(voice, event);
            }}
          >
            <MdGraphicEq size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default VoiceLibraryCard;
