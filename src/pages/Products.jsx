import { useEffect } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import VisualAIAgents from '../components/products/VisualAIAgents.jsx'
import CreativeRealityStudio from '../components/products/CreativeRealityStudio.jsx'
import VideoTranslate from '../components/products/VideoTranslate.jsx'
import VideoCampaigns from '../components/products/VideoCampaigns.jsx'
import PersonalAvatars from '../components/products/PersonalAvatars.jsx'

const styles = `
.products-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

// Map product names to section IDs
const productSectionMap = {
  'Visual AI Agents': 'visual-ai-agents',
  'Creative Reality™ Studio': 'creative-reality-studio',
  'Video Translate': 'video-translate',
  'Video Campaigns': 'video-campaigns',
  'Personal Avatars': 'personal-avatars'
}

function Products({ onLoginClick, initialSection = null, onNavigateToProduct, onNavigateToSolution, onLogoClick }) {
  useEffect(() => {
    // Scroll to initial section if provided
    if (initialSection) {
      const sectionId = productSectionMap[initialSection]
      if (sectionId) {
        setTimeout(() => {
          const element = document.getElementById(sectionId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    } else {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [initialSection])


  return (
    <>
      <style>{styles}</style>
      <div className="products-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onLogoClick={onLogoClick}
        />
        
        <VisualAIAgents variant="light" />
        <CreativeRealityStudio variant="dark" />
        <VideoTranslate variant="light" />
        <VideoCampaigns variant="dark" />
        <PersonalAvatars variant="light" />
        
        <Footer />
      </div>
    </>
  )
}

export default Products

