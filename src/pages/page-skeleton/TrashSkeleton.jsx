import './skeleton.css'
import { SkeletonItemCard } from './SkeletonPrimitives'

const TrashSkeleton = () => {
  return (
    <div className="athena-trash-view ps-page">
      <div className="ps-block" style={{ height: 64 }} />
      <div className="ps-block" style={{ height: 48 }} />

      <div className="trash-content-area items-container tile-view ps-grid ps-grid--3">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonItemCard key={index} />
        ))}
      </div>
    </div>
  )
}

export default TrashSkeleton
