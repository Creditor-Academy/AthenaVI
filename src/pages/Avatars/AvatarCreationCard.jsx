import { MdAdd } from 'react-icons/md';

function AvatarCreationCard({ onClick }) {
  return (
    <article className="workspace-item-card avatars-creation-card">
      <button
        type="button"
        className="avatars-creation-card__btn"
        onClick={onClick}
        aria-label="Create new custom avatar"
      >
        <span className="avatars-creation-card__icon" aria-hidden>
          <MdAdd size={32} />
        </span>
        <span className="avatars-creation-card__label">Create New Custom Avatar</span>
      </button>
    </article>
  );
}

export default AvatarCreationCard;
