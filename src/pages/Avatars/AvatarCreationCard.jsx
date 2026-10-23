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
          <MdAdd size={30} />
        </span>
        <div className="avatars-creation-card__content">
          <h4 className="avatars-creation-card__title">Create New Avatar</h4>
          <p className="avatars-creation-card__desc">Custom Twin & Looks</p>
        </div>
      </button>
    </article>
  );
}

export default AvatarCreationCard;
