import './skeleton.css'
import { SkeletonItemCard } from './SkeletonPrimitives'

const LibrarySkeleton = () => {
  return (
    <div className="library-page">
      <div className="library-shell ps-page">
        <div className="ps-block" style={{ height: 40, width: 210, marginBottom: 8 }} />

        <div className="library-category-row ps-grid ps-grid--4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="ps-block" style={{ height: 116 }} />
          ))}
        </div>

        <div className="ps-block" style={{ height: 44, marginTop: 8 }} />

        <div className="assets-grid items-container tile-view ps-grid ps-grid--4">
          {Array.from({ length: 8 }, (_, index) => (
            <SkeletonItemCard key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LibrarySkeleton
