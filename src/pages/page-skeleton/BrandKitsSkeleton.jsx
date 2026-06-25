import './skeleton.css'
import { SkeletonItemCard } from './SkeletonPrimitives'

const BrandKitsSkeleton = () => {
  return (
    <div className="brandkits-container ps-page">
      <div className="ps-block" style={{ height: 48 }} />

      <div className="brandkits-grid ps-grid ps-grid--3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonItemCard key={index} />
        ))}
      </div>
    </div>
  )
}

export default BrandKitsSkeleton
