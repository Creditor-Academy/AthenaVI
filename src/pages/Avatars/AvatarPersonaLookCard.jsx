import { Trash2 } from 'lucide-react'
import { formatAvatarTypeLabel } from '../../utils/heygenAvatars'

function AvatarPersonaLookCard({ look, isSelected, canDelete, onSelect, onDelete }) {
  return (
    <article
      className={`workspace-item-card avatar-persona-look-card${isSelected ? ' is-selected' : ''}`}
    >
      <button
        type="button"
        className="avatar-persona-look-card__thumb-btn"
        onClick={() => onSelect?.(look)}
        aria-label={`View look ${look.name}`}
        aria-pressed={isSelected}
      >
        <div className="card-thumb-container avatar-persona-look-card__thumb">
          <img src={look.image} alt="" loading="lazy" />
          {look.avatarType ? (
            <span className="avatar-persona-look-card__type">
              {formatAvatarTypeLabel(look.avatarType)}
            </span>
          ) : null}
        </div>
      </button>

      <div className="workspace-item-meta avatar-persona-look-card__meta">
        <h4 title={look.name}>{look.name}</h4>
        {canDelete ? (
          <button
            type="button"
            className="context-menu-btn library-delete-cta avatar-persona-look-card__delete"
            title={`Delete look ${look.name}`}
            aria-label={`Delete look ${look.name}`}
            onClick={(event) => onDelete?.(look, event)}
          >
            <Trash2 size={16} />
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default AvatarPersonaLookCard
