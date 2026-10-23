import './skeleton.css'
import { SkeletonWorkspaceItems } from './SkeletonPrimitives'

/** Brand Kits has no list-table columns — always use workspace tile pulse cards. */
const BrandKitsSkeleton = () => {
  return (
    <SkeletonWorkspaceItems
      viewMode="tile"
      cardCount={6}
      cardVariant="workspace"
    />
  )
}

export default BrandKitsSkeleton
