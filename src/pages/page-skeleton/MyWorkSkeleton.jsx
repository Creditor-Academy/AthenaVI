import './skeleton.css'
import { SkeletonMediaCollection } from './SkeletonPrimitives'

const MyWorkSkeleton = ({ viewMode = 'grid' }) => {
  return (
    <SkeletonMediaCollection
      viewMode={viewMode}
      itemsClassName="items-container videos-export-items my-work-export-items"
      cardCount={8}
      ariaLabel="Loading work items"
    />
  )
}

export const VideosSkeleton = MyWorkSkeleton
export default MyWorkSkeleton
