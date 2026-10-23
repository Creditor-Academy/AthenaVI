import { FiGrid } from 'react-icons/fi'
import { MdDragIndicator } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'

export default function SlideHoverActions({
  className = '',
  aiActive = false,
  canDuplicate = true,
  disabled = false,
  onEditAi,
  onDuplicate,
}) {
  return (
    <div className={`aig-scroll-slide-hover-actions ${className}`.trim()}>
      <button className="aig-slide-action-btn" title="Drag" type="button">
        <MdDragIndicator size={16} />
      </button>
      <button
        className={`aig-slide-action-btn aig-slide-action-btn--ai ${aiActive ? 'is-active' : ''}`}
        title="Edit with AI"
        type="button"
        disabled={disabled}
        data-no-drag="true"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onEditAi?.(e)
        }}
      >
        <BsStars size={16} />
      </button>
      <button
        className="aig-slide-action-btn"
        title="Duplicate"
        type="button"
        disabled={disabled || !canDuplicate}
        data-no-drag="true"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onDuplicate?.(e)
        }}
      >
        <FiGrid size={16} />
      </button>
    </div>
  )
}

