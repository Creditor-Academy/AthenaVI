import React from 'react'
import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import AIAvatarHero from '../../components/layout/AIAvatarHero.jsx'
import AvatarMarquee from '../../components/layout/AvatarMarquee.jsx'
import TemplateShowcase from '../../components/layout/TemplateShowcase.jsx'

const styles = `
.ai-avatars-videos-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #05070a;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
}

.ai-avatars-videos-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  background: #05070a;
}
`

function AIAvatarsVideos({
  onLoginClick,
  onNavigateToProduct,
  onLogoClick,
  onNavigateToCompany,
  onNavigateToSolution,
  onNavigateToEthics,
  onNavigateToTechnology,
  onNavigateToUseCases
}) {
  return (
    <>
      <style>{styles}</style>
      <div className="ai-avatars-videos-page">
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
        
        <main className="ai-avatars-videos-content">
          <AIAvatarHero />
          <AvatarMarquee />
          <TemplateShowcase />
        </main>

        <Footer
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToUseCases={onNavigateToUseCases}
        />
      </div>
    </>
  )
}

export default AIAvatarsVideos
