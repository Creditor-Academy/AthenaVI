import './skeleton.css'
import { SkeletonMediaCollection } from './SkeletonPrimitives'

const AvatarsSkeleton = ({ viewMode = 'grid', showCreateCard = false }) => {
  return (
    <SkeletonMediaCollection
      viewMode={viewMode}
      showCreateCard={showCreateCard}
      createCardClassName="avatars-creation-card"
      itemsClassName="items-container videos-export-items avatars-library-items"
      cardCount={showCreateCard && viewMode === 'grid' ? 7 : 8}
      ariaLabel="Loading avatars"
    />
  )
}

export default AvatarsSkeleton
