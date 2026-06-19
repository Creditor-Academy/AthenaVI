import { MdPerson } from 'react-icons/md';

function AvatarLibraryRow({ avatar, onOpen }) {
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
