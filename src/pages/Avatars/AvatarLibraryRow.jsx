import { MdDelete, MdPerson, MdVerifiedUser, MdVideoLibrary } from 'react-icons/md';
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

function AvatarLibraryRow({ avatar, onOpen, onCompleteConsent, onUseInProject, onDelete, canDelete = false }) {
  const statusBadge = getStatusBadge(avatar);
  const needsConsent = avatarNeedsConsentFlow(avatar);
  const canUseInProject = onUseInProject && !needsConsent;

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
        {canUseInProject ? (
          <button
            type="button"
            className="avatars-use-project-cta"
            title="Use in project"
            aria-label={`Use ${avatar.name} in a project`}
            onClick={(event) => onUseInProject(avatar, event)}
          >
            <MdVideoLibrary size={18} />
          </button>
        ) : null}
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
        {canDelete ? (
          <button
            type="button"
            className="context-menu-btn library-delete-cta"
            title="Delete avatar"
            aria-label={`Delete ${avatar.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(avatar, event);
            }}
          >
            <MdDelete size={18} />
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default AvatarLibraryRow;
