import { MdAdd } from 'react-icons/md';

function VoiceCreationCard({ onClick }) {
  return (
    <article className="workspace-item-card voices-creation-card">
      <button
        type="button"
        className="voices-creation-card__btn"
        onClick={onClick}
        aria-label="Create new custom voice"
      >
        <span className="voices-creation-card__icon" aria-hidden>
          <MdAdd size={32} />
        </span>
        <span className="voices-creation-card__label">Create New Custom Voice</span>
      </button>
    </article>
  );
}

export default VoiceCreationCard;
