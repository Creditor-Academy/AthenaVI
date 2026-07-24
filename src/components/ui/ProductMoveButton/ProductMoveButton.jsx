import { ArrowRightLeft } from 'lucide-react'
import './ProductMoveButton.css'

/**
 * Footer CTA to switch products — "Move to Slides" on VI, "Move to VI" on Slides.
 */
function ProductMoveButton({ target = 'slides', onClick, compact = false }) {
  const isToSlides = target === 'slides'
  const label = isToSlides ? 'Move to Slides' : 'Move to VI'
  const title = isToSlides ? 'Open Slides workspace' : 'Open Virtual Studio'

  return (
    <button
      type="button"
      className={[
        'product-move-btn',
        isToSlides ? 'product-move-btn--to-slides' : 'product-move-btn--to-vi',
        compact ? 'product-move-btn--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      title={title}
      aria-label={label}
    >
      <ArrowRightLeft size={15} strokeWidth={1.85} aria-hidden />
      <span className="product-move-btn__label">{label}</span>
    </button>
  )
}

export default ProductMoveButton
