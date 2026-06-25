import './skeleton.css'
import { SkeletonProjectCard } from './SkeletonPrimitives'

const HomeSkeleton = () => {
  return (
    <div className="home-container ps-page">
      <div className="ps-block" style={{ height: 120 }} />

      <div className="home-billing-stats ps-grid ps-grid--3">
        <div className="ps-block" style={{ height: 152 }} />
        <div className="ps-block" style={{ height: 152 }} />
        <div className="ps-block" style={{ height: 152 }} />
      </div>

      <div className="ps-block" style={{ height: 44 }} />

      <div className="projects-grid-override ps-grid ps-grid--3">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonProjectCard key={index} />
        ))}
      </div>
    </div>
  )
}

export default HomeSkeleton
