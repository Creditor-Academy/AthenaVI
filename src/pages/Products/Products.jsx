import { useEffect } from 'react'
import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import VisualAIAgents from '../../components/features/products/products/VisualAIAgents.jsx'
import CreativeRealityStudio from '../../components/features/products/products/CreativeRealityStudio.jsx'
import VideoTranslate from '../../components/features/products/products/VideoTranslate.jsx'
import VideoCampaigns from '../../components/features/products/products/VideoCampaigns.jsx'
import PersonalAvatars from '../../components/features/products/products/PersonalAvatars.jsx'

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

function Products({ onLoginClick, initialSection = null, onNavigateToProduct, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology, onNavigateToUseCases }) {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    const sectionId = productSectionMap[initialSection]
      || (Object.values(productSectionMap).includes(hash) ? hash : '')
    if (sectionId) {
      const timer = setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [initialSection])


  return (
    <>
      <style>{styles}</style>
      <div className="products-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
        
        <main>
          <VisualAIAgents variant="light" />
          <CreativeRealityStudio variant="dark" />
          <VideoTranslate variant="light" />
          <VideoCampaigns variant="dark" />
          <PersonalAvatars variant="light" />
        </main>
        
        <Footer 
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
      </div>
    </>
  )
}

export default Products

