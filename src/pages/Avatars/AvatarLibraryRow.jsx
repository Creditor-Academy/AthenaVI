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

function AvatarLibraryRow({ avatar, onOpen, onCompleteConsent }) {
  const statusBadge = getStatusBadge(avatar);
  const needsConsent = avatarNeedsConsentFlow(avatar);

  return (
    <article
      className="workspace-item-row export-item-row avatars-library-row"
      onClick={() => onOpen?.(avatar)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.(avatar);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="row-icon-container avatars-library-row__thumb" aria-hidden>
        <img src={avatar.image} alt="" loading="lazy" />
      </div>

      <div className="col col-name">
        <h4 title={avatar.name}>{avatar.name}</h4>
        {statusBadge ? (
          <span className={`avatars-status-badge avatars-status-badge--inline ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        ) : null}
      </div>

      <div className="col col-workspace" title={avatar.role}>
        {avatar.role}
      </div>

      <div className="col col-completed">{avatar.gender || '—'}</div>

      <div className="col col-size">{avatar.style || avatar.category || '—'}</div>

      <div className="col col-rendered-by">
        {avatar.rawLooks?.length ? `${avatar.rawLooks.length} looks` : '—'}
      </div>

      <div className="row-actions avatars-library-row__actions">
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
    </article>
  );
}

export default AvatarLibraryRow;
