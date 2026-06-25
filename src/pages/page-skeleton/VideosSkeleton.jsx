import './skeleton.css'
import { SkeletonMediaCollection } from './SkeletonPrimitives'

const VideosSkeleton = ({ viewMode = 'grid' }) => {
  return (
    <SkeletonMediaCollection
      viewMode={viewMode}
      itemsClassName="items-container videos-export-items"
      cardCount={8}
      ariaLabel="Loading videos"
    />
  )
}

export default VideosSkeleton
