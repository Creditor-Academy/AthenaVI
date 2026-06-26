import { MdDelete, MdGraphicEq, MdPlayArrow } from 'react-icons/md';
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

function VoiceLibraryRow({ voice, onOpen, onPreview, onTest, canDelete = false, onDelete }) {
  const statusBadge = getStatusBadge(voice);
  const genderKind = normalizeVoiceGender(voice.gender);
  const hasAvatarImage = Boolean(voice.image);

  return (
    <article
      className="workspace-item-row export-item-row voices-library-row"
      onClick={() => onOpen?.(voice)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.(voice);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={`row-icon-container voices-library-row__thumb voices-library-row__thumb--${genderKind}${
          hasAvatarImage ? ' voices-library-row__thumb--has-image' : ''
        }`}
        aria-hidden
      >
        {hasAvatarImage ? (
          <img src={voice.image} alt="" loading="lazy" className="voices-library-row__avatar" />
        ) : (
          <span className={`voices-gender-icon-badge voices-gender-icon-badge--sm voices-gender-icon-badge--${genderKind}`}>
            <VoiceGenderIcon gender={voice.gender} size={20} />
          </span>
        )}
      </div>

      <div className="col col-name">
        <h4 title={voice.name}>{voice.name}</h4>
        {statusBadge ? (
          <span className={`voices-status-badge voices-status-badge--inline ${statusBadge.className}`}>
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
      </div>

      <div className="col col-workspace" title={voice.language}>
        {voice.language || '—'}
      </div>

      <div className="col col-completed">{voice.gender || '—'}</div>

      <div className="col col-size">{voice.status || 'Ready'}</div>

      <div className="col col-rendered-by">—</div>

      <div className="row-actions voices-library-row__actions">
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
    </article>
  );
}

export default VoiceLibraryRow;
