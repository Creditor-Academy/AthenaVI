import { MdArrowBack } from 'react-icons/md';
import '../../components/features/workspace/workspace/WorkspaceStyles.css';
import '../Videos/Videos.css';
import { AVATAR_TYPE_OPTIONS } from './avatarTypeOptions';
import './Avatars.css';

function CreateAvatar({ onBack, onOpenModal }) {
  return (
    <div className="videos-page avatars-page create-avatar-page">
      <div className="videos-shell">
        <header className="videos-page-header create-avatar-page-header">
          <div className="videos-title-section create-avatar-title-section">
            <div className="create-avatar-title-row">
              <button
                type="button"
                className="workspace-back-btn"
                onClick={() => onBack(false)}
                aria-label="Back to Avatars"
              >
                <MdArrowBack size={20} />
              </button>
              <div>
                <h1 className="videos-page-title">Create Your AI Persona</h1>
                <p className="videos-page-subtitle">
                  Choose your path and bring your virtual identity to life.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="videos-main create-avatar-main">
          <div className="type-selector-cards">
            {AVATAR_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className="type-card type-card--image"
                onClick={() => onOpenModal?.(option.id)}
                aria-label={`Create ${option.title}`}
              >
                <img src={option.image} alt="" className="type-card__bg" loading="lazy" />
                <div className="type-card__scrim" aria-hidden />
                <div className="type-card__content">
                  <strong>{option.title}</strong>
                  <p>{option.description}</p>
                  <span className="type-badge">{option.badge}</span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateAvatar;
