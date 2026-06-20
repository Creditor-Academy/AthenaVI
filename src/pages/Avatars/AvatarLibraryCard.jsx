import { MdPerson, MdVerifiedUser } from 'react-icons/md';
import { avatarNeedsConsentFlow } from '../../components/ui/AvatarConsentStep/AvatarConsentStep';

function getStatusBadge(avatar) {
  if (avatarNeedsConsentFlow(avatar)) {
    return { label: 'Consent required', className: 'avatars-status-badge--consent' };
  }
  if (avatar.trainingStatus === 'processing') {
    return { label: 'Processing', className: 'avatars-status-badge--processing' };
  }
  return null;
}

function AvatarLibraryCard({ avatar, onOpen, onCompleteConsent }) {
  const statusBadge = getStatusBadge(avatar);
  const needsConsent = avatarNeedsConsentFlow(avatar);

  return (
    <article className="workspace-item-card avatars-library-card">
      <button
        type="button"
        className="avatars-library-card__thumb-btn"
        onClick={() => onOpen?.(avatar)}
        aria-label={`View ${avatar.name}`}
      >
        <div className="card-thumb-container avatars-library-card__thumb">
          <img src={avatar.image} alt="" loading="lazy" />
          <span className="avatars-library-badge">{avatar.category || 'Avatar'}</span>
          {statusBadge ? (
            <span className={`avatars-status-badge ${statusBadge.className}`}>{statusBadge.label}</span>
          ) : null}
          <div className="avatars-library-overlay" aria-hidden>
            <span className="btn-edit-premium">View Persona</span>
          </div>
        </div>
      </button>

      <div className="workspace-item-meta avatars-library-card__meta">
        <div className="meta-left">
          <h4 title={avatar.name}>{avatar.name}</h4>
          <p className="avatars-library-card__role" title={avatar.role}>
            {avatar.role}
          </p>
          <div className="meta-row-small">
            <span className="meta-small">{avatar.gender || 'Unknown'}</span>
            {avatar.style ? (
              <span className="meta-small">{avatar.style}</span>
            ) : null}
          </div>
        </div>

        <div className="avatars-library-card__actions">
          {needsConsent && onCompleteConsent ? (
            <button
              type="button"
              className="avatars-consent-cta"
              title="Complete consent"
              aria-label={`Complete consent for ${avatar.name}`}
              onClick={(event) => onCompleteConsent(avatar, event)}
            >
              <MdVerifiedUser size={18} />
            </button>
          ) : null}
          <button
            type="button"
            className="context-menu-btn"
            title="View persona"
            aria-label={`View ${avatar.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onOpen?.(avatar);
            }}
          >
            <MdPerson size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default AvatarLibraryCard;
