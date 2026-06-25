import './skeleton.css'
import { SkeletonTemplateCard } from './SkeletonPrimitives'

const TemplateDetailsSkeleton = () => {
  return (
    <div className="template-details-page ps-page">
      <div className="ps-block" style={{ height: 48 }} />

      <div className="template-feature-head" style={{ display: 'grid', gap: 16, gridTemplateColumns: '2fr 1.2fr' }}>
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-block" style={{ minHeight: 300 }} />
      </div>

      <div className="template-slides-breakdown ps-stack">
        <div className="ps-block" style={{ height: 40, width: 220 }} />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="ps-block" style={{ height: 86 }} />
        ))}
      </div>

      <div className="ps-block" style={{ height: 110 }} />
    </div>
  )
}

export default TemplateDetailsSkeleton
