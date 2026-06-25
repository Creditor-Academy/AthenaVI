import './skeleton.css'
import { SkeletonTemplateCard } from './SkeletonPrimitives'

const TEMPLATE_CARD_COUNT = 6

const TemplatesSkeleton = () => {
  return (
    <div className="template-grid-main" aria-busy="true" aria-label="Loading templates">
      {Array.from({ length: TEMPLATE_CARD_COUNT }, (_, index) => (
        <SkeletonTemplateCard key={index} />
      ))}
    </div>
  )
}

export default TemplatesSkeleton
