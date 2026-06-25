import './skeleton.css'
import { SkeletonMediaCollection } from './SkeletonPrimitives'

const VoicesSkeleton = ({ viewMode = 'grid', showCreateCard = false }) => {
  return (
    <SkeletonMediaCollection
      viewMode={viewMode}
      showCreateCard={showCreateCard}
      createCardClassName="voices-creation-card"
      itemsClassName="items-container videos-export-items voices-library-items"
      cardCount={showCreateCard && viewMode === 'grid' ? 7 : 8}
      ariaLabel="Loading voices"
    />
  )
}

export default VoicesSkeleton
